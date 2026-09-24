import JSZip from 'jszip';
import { StoryNovel, StoryChapter, VocabLevel } from './storyWordTypes';

export interface ParsedEbook {
  title: string;
  author: string;
  chapters: StoryChapter[];
}

/**
 * 智能将纯文本拆分为章节
 */
export function splitTextIntoChapters(fullText: string, defaultTitle: string): StoryChapter[] {
  const cleanText = fullText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 匹配常见中文小说与英文章节名：第x章/回/节/卷、Chapter x
  const chapterRegex =
    /(?:^|\n)\s*(第[0-9一二三四五六七八九十百千万零两]+[章回节卷集部篇][^\n]{0,35}|Chapter\s+[0-9]+[^\n]{0,35})/gi;

  const matches: Array<{ index: number; title: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = chapterRegex.exec(cleanText)) !== null) {
    matches.push({
      index: match.index,
      title: match[1].trim(),
    });
  }

  // 若识别到了至少两个章节标题，按章节进行精准切分
  if (matches.length >= 2) {
    const chapters: StoryChapter[] = [];

    // 若第1章之前有引子/序章
    const firstChapterStart = matches[0].index;
    if (firstChapterStart > 200) {
      const prologueText = cleanText.slice(0, firstChapterStart).trim();
      if (prologueText.length > 50) {
        chapters.push({
          id: `ch_prologue_${Date.now()}`,
          index: 0,
          title: '序章 / 前言',
          originalText: prologueText,
        });
      }
    }

    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i + 1 < matches.length ? matches[i + 1].index : cleanText.length;
      let chapterBody = cleanText.slice(start, end).trim();

      // 去掉正文开头的章节标题自身
      const rawTitle = matches[i].title;
      if (chapterBody.startsWith(rawTitle)) {
        chapterBody = chapterBody.slice(rawTitle.length).trim();
      }

      if (chapterBody.length > 0) {
        chapters.push({
          id: `ch_txt_${Date.now()}_${i + 1}`,
          index: chapters.length,
          title: rawTitle,
          originalText: chapterBody,
        });
      }
    }

    if (chapters.length > 0) {
      return chapters;
    }
  }

  // 若未匹配到规则章节，但文本过长 (> 5000 字)，按段落智能分页，提升背词阅读体验
  const MAX_CHUNK_LENGTH = 3500;
  if (cleanText.length > MAX_CHUNK_LENGTH) {
    const paragraphs = cleanText.split(/\n\s*\n/);
    const chapters: StoryChapter[] = [];
    let currentChunk = '';
    let partNum = 1;

    for (const p of paragraphs) {
      if ((currentChunk + '\n\n' + p).length > MAX_CHUNK_LENGTH && currentChunk.length > 500) {
        chapters.push({
          id: `ch_part_${Date.now()}_${partNum}`,
          index: chapters.length,
          title: `${defaultTitle} · 第 ${partNum} 部分`,
          originalText: currentChunk.trim(),
        });
        currentChunk = p;
        partNum++;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${p}` : p;
      }
    }

    if (currentChunk.trim().length > 0) {
      chapters.push({
        id: `ch_part_${Date.now()}_${partNum}`,
        index: chapters.length,
        title: `${defaultTitle} · 第 ${partNum} 部分`,
        originalText: currentChunk.trim(),
      });
    }

    return chapters;
  }

  // 正常单篇正文
  return [
    {
      id: `ch_single_${Date.now()}`,
      index: 0,
      title: defaultTitle || '正文',
      originalText: cleanText.trim(),
    },
  ];
}

/**
 * 1. 解析 TXT 文件 (智能识别 UTF-8 / GBK 编码)
 */
export async function parseTxtFile(file: File): Promise<ParsedEbook> {
  const buffer = await file.arrayBuffer();

  let text = '';
  try {
    // 优先尝试标准 UTF-8
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
    text = utf8Decoder.decode(buffer);
  } catch {
    // 失败则降级为国内网文最普遍的 GB18030 / GBK 编码
    try {
      const gbkDecoder = new TextDecoder('gb18030');
      text = gbkDecoder.decode(buffer);
    } catch {
      text = new TextDecoder('utf-8').decode(buffer);
    }
  }

  const rawName = file.name.replace(/\.[^/.]+$/, '');
  // 清洗文件名中的标点如 【无错精校】斗破苍穹.txt -> 斗破苍穹
  const cleanTitle = rawName.replace(/【[^】]*】|\[[^\]]*\]|（[^）]*）/g, '').trim() || rawName;

  const chapters = splitTextIntoChapters(text, cleanTitle);

  return {
    title: cleanTitle,
    author: '本地导入',
    chapters,
  };
}

/**
 * 2. 解析 EPUB 电子书文件 (基于 JSZip 解压并解析 OPF 与 XHTML)
 */
export async function parseEpubFile(file: File): Promise<ParsedEbook> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  // 1. 读取 META-INF/container.xml 找到 OPF 主清单文件
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) {
    throw new Error('无效的 EPUB 文件：未找到 container.xml');
  }

  const containerDoc = new DOMParser().parseFromString(containerXml, 'application/xml');
  const rootfileEl = containerDoc.querySelector('rootfile');
  const opfPath = rootfileEl?.getAttribute('full-path');
  if (!opfPath) {
    throw new Error('无效的 EPUB 文件：无法解析 content.opf 路径');
  }

  const opfDir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';

  // 2. 读取并解析 OPF 文件
  const opfContent = await zip.file(opfPath)?.async('text');
  if (!opfContent) {
    throw new Error('无效的 EPUB 文件：无法读取 OPF 配置文件');
  }

  const opfDoc = new DOMParser().parseFromString(opfContent, 'application/xml');

  // 提取书名与作者
  const titleEl = opfDoc.querySelector('title') || opfDoc.getElementsByTagNameNS('*', 'title')[0];
  const creatorEl =
    opfDoc.querySelector('creator') || opfDoc.getElementsByTagNameNS('*', 'creator')[0];

  const rawFileName = file.name.replace(/\.[^/.]+$/, '');
  const title = titleEl?.textContent?.trim() || rawFileName;
  const author = creatorEl?.textContent?.trim() || '未知作者';

  // 提取 manifest (文件映射)
  const manifestItems = new Map<string, string>();
  const itemEls = Array.from(opfDoc.querySelectorAll('manifest > item'));
  for (const item of itemEls) {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) {
      manifestItems.set(id, href);
    }
  }

  // 提取 spine (阅读顺序)
  const spineItemrefs = Array.from(opfDoc.querySelectorAll('spine > itemref'));
  const chapters: StoryChapter[] = [];

  for (let i = 0; i < spineItemrefs.length; i++) {
    const idref = spineItemrefs[i].getAttribute('idref');
    if (!idref) continue;
    const relHref = manifestItems.get(idref);
    if (!relHref) continue;

    // 拼接出 zip 内的实际路径
    const fullHref = decodeURIComponent(`${opfDir}${relHref}`.replace(/^\//, ''));
    const xhtmlFile = zip.file(fullHref);
    if (!xhtmlFile) continue;

    const htmlContent = await xhtmlFile.async('text');
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');

    // 提取章节标题
    const headingEl = doc.querySelector('h1, h2, h3, title, .chapter-title, .title');
    let chapterTitle = headingEl?.textContent?.trim();

    // 提取正文文本，保留换行段落
    const paragraphs: string[] = [];
    const pEls = doc.querySelectorAll('p, div, blockquote');
    if (pEls.length > 0) {
      pEls.forEach((p) => {
        const text = p.textContent?.trim();
        if (text && text.length > 0) {
          paragraphs.push(text);
        }
      });
    } else {
      const bodyText = doc.body?.innerText || doc.body?.textContent || '';
      paragraphs.push(bodyText.trim());
    }

    const chapterText = paragraphs.join('\n\n');

    if (!chapterTitle) {
      chapterTitle = paragraphs[0]?.slice(0, 30) || `第 ${chapters.length + 1} 章`;
    }

    // 过滤掉只有封面图或字数过少的空页面
    if (chapterText.length > 40) {
      chapters.push({
        id: `ch_epub_${Date.now()}_${chapters.length}`,
        index: chapters.length,
        title: chapterTitle,
        originalText: chapterText,
      });
    }
  }

  if (chapters.length === 0) {
    throw new Error('EPUB 解析成功，但未检测到有效正文章节');
  }

  return {
    title,
    author,
    chapters,
  };
}

/**
 * 3. 解压 PalmDOC LZ77 算法 (用于 MOBI 格式)
 */
function decompressPalmDoc(buf: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < buf.length) {
    const b = buf[i++];
    if (b === 0) {
      out.push(0);
    } else if (b >= 1 && b <= 8) {
      for (let j = 0; j < b && i < buf.length; j++) {
        out.push(buf[i++]);
      }
    } else if (b <= 0x7f) {
      out.push(b);
    } else if (b >= 0xc0) {
      out.push(0x20); // 空格
      out.push(b ^ 0x80);
    } else {
      // 0x80 ~ 0xBF: 2 字节距离与长度标记
      if (i >= buf.length) break;
      const b2 = buf[i++];
      const compound = ((b << 8) | b2) & 0x3fff;
      const distance = compound >> 3;
      const length = (compound & 7) + 3;
      for (let j = 0; j < length; j++) {
        const srcPos = out.length - distance;
        out.push(srcPos >= 0 ? out[srcPos] : 0x20);
      }
    }
  }
  return new Uint8Array(out);
}

/**
 * 4. 解析 MOBI 电子书文件 (Palm Database 格式)
 */
export async function parseMobiFile(file: File): Promise<ParsedEbook> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  if (buffer.byteLength < 80) {
    throw new Error('无效的 MOBI 文件：文件过小');
  }

  // 1. 读取 Palm Database Header (PDB)
  const numRecords = view.getUint16(76, false);
  const recordOffsets: number[] = [];
  for (let i = 0; i < numRecords; i++) {
    const offset = view.getUint32(78 + i * 8, false);
    recordOffsets.push(offset);
  }

  if (recordOffsets.length === 0) {
    throw new Error('无效的 MOBI 文件：未找到记录表');
  }

  // 2. 读取 Record 0 (PalmDOC Header & MOBI Header)
  const rec0Start = recordOffsets[0];
  const rec0End = recordOffsets.length > 1 ? recordOffsets[1] : buffer.byteLength;
  const compression = view.getUint16(rec0Start, false);
  const textRecordCount = view.getUint16(rec0Start + 8, false);

  // 尝试从 Record 0 提取书名
  let bookTitle = file.name.replace(/\.[^/.]+$/, '');
  try {
    const mobiHeaderOffset = rec0Start + 16;
    const fullNameOffset = view.getUint32(mobiHeaderOffset + 84, false);
    const fullNameLength = view.getUint32(mobiHeaderOffset + 88, false);
    if (fullNameLength > 0 && fullNameLength < 256) {
      const nameStart = rec0Start + fullNameOffset;
      const nameBytes = bytes.slice(nameStart, nameStart + fullNameLength);
      const decodedName = new TextDecoder('utf-8').decode(nameBytes).trim();
      if (decodedName) bookTitle = decodedName;
    }
  } catch {
    // 降级使用文件名
  }

  // 3. 读取并解压文本记录
  const textChunks: Uint8Array[] = [];
  const maxReadRecords = Math.min(textRecordCount, recordOffsets.length - 1);

  for (let i = 1; i <= maxReadRecords; i++) {
    const start = recordOffsets[i];
    const end = i < recordOffsets.length - 1 ? recordOffsets[i + 1] : buffer.byteLength;
    if (start >= end) continue;

    const chunk = bytes.slice(start, end);
    if (compression === 2) {
      // PalmDOC LZ77 压缩
      textChunks.push(decompressPalmDoc(chunk));
    } else {
      textChunks.push(chunk);
    }
  }

  // 合并全部文本字节
  const totalLength = textChunks.reduce((acc, c) => acc + c.length, 0);
  const mergedTextBytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const c of textChunks) {
    mergedTextBytes.set(c, offset);
    offset += c.length;
  }

  // 解码文本 (优先 UTF-8，兜底 GBK)
  let rawText = '';
  try {
    rawText = new TextDecoder('utf-8').decode(mergedTextBytes);
  } catch {
    try {
      rawText = new TextDecoder('gb18030').decode(mergedTextBytes);
    } catch {
      rawText = new TextDecoder('utf-8').decode(mergedTextBytes);
    }
  }

  // MOBI 解压后的正文大部分是 HTML 标签，清洗 HTML
  const parserDoc = new DOMParser().parseFromString(rawText, 'text/html');
  const paragraphs: string[] = [];
  const pEls = parserDoc.querySelectorAll('p, div, mbp\\:pagebreak');

  if (pEls.length > 0) {
    pEls.forEach((p) => {
      const t = p.textContent?.trim();
      if (t && t.length > 0) paragraphs.push(t);
    });
  } else {
    paragraphs.push(parserDoc.body?.textContent?.trim() || rawText.replace(/<[^>]+>/g, ''));
  }

  const cleanText = paragraphs.join('\n\n');
  const chapters = splitTextIntoChapters(cleanText, bookTitle);

  return {
    title: bookTitle,
    author: 'MOBI 导入',
    chapters,
  };
}

/**
 * 统一多格式电子书解析主入口 (.txt / .epub / .mobi)
 */
export async function parseUploadedEbook(
  file: File,
  targetLevel: VocabLevel = 'cet4'
): Promise<StoryNovel> {
  const fileName = file.name.toLowerCase();
  let parsed: ParsedEbook;

  if (fileName.endsWith('.epub')) {
    parsed = await parseEpubFile(file);
  } else if (fileName.endsWith('.mobi')) {
    parsed = await parseMobiFile(file);
  } else if (fileName.endsWith('.txt')) {
    parsed = await parseTxtFile(file);
  } else {
    // 默认当做纯文本处理
    parsed = await parseTxtFile(file);
  }

  const novel: StoryNovel = {
    id: `novel_local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: parsed.title,
    author: parsed.author,
    sourceId: 'local_file_upload',
    sourceName: fileName.endsWith('.epub')
      ? 'EPUB 电子书'
      : fileName.endsWith('.mobi')
      ? 'MOBI 电子书'
      : 'TXT 本地文本',
    currentChapterIndex: 0,
    totalChapters: parsed.chapters.length,
    chapters: parsed.chapters,
    targetLevel,
    insertDensity: 0.18,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return novel;
}
