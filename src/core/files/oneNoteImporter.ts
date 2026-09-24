import JSZip from 'jszip';
import { db } from '../storage/db';
import { VirtualFileRecord, OneNoteImportProgress, OneNoteImportResult } from './fileTypes';
import { calculateWordCount, extractExtension } from './fileStorage';

/**
 * 递归创建文件夹路径映射
 * 例如路径: ["我的笔记本", "项目规划"]
 * 返回末级文件夹的 ID
 */
async function ensureFolderPath(
  segments: string[],
  rootParentId: string | null,
  folderCache: Map<string, string>
): Promise<string | null> {
  if (segments.length === 0) return rootParentId;

  let currentParentId = rootParentId;
  let accumulatedPath = rootParentId ? `${rootParentId}/` : '';

  for (const segment of segments) {
    const cleanSegment = segment.trim();
    if (!cleanSegment) continue;

    accumulatedPath += `${cleanSegment}/`;
    if (folderCache.has(accumulatedPath)) {
      currentParentId = folderCache.get(accumulatedPath)!;
      continue;
    }

    // 检查数据库中当前目录下是否已有同名文件夹
    const existingFolders = await db.virtual_files
      .where('parentId')
      .equals(currentParentId || '')
      .filter(item => item.type === 'folder' && item.name === cleanSegment)
      .toArray();

    let targetFolderId: string;
    if (existingFolders.length > 0) {
      targetFolderId = existingFolders[0].id;
    } else {
      const now = Date.now();
      targetFolderId = `folder_${now}_${Math.random().toString(36).substring(2, 7)}`;
      const newFolder: VirtualFileRecord = {
        id: targetFolderId,
        name: cleanSegment,
        type: 'folder',
        parentId: currentParentId,
        size: 0,
        source: 'onenote',
        createdAt: now,
        updatedAt: now,
      };
      await db.virtual_files.put(newFolder);
    }

    folderCache.set(accumulatedPath, targetFolderId);
    currentParentId = targetFolderId;
  }

  return currentParentId;
}

/**
 * 解码 Quoted-Printable 编码文本 (MHT 邮件与网页常见编码)
 */
export function decodeQuotedPrintable(input: string, charset: string = 'utf-8'): string {
  // 1. 去除软换行 (=\r\n 或 =\n)
  const clean = input.replace(/=\r?\n/g, '');

  // 2. 将 =XX 转换为原生字节
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === '=' && i + 2 < clean.length && /^[0-9A-Fa-f]{2}$/.test(clean.substring(i + 1, i + 3))) {
      bytes.push(parseInt(clean.substring(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(clean.charCodeAt(i) & 0xff);
    }
  }

  try {
    return new TextDecoder(charset).decode(new Uint8Array(bytes));
  } catch {
    try {
      return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
    } catch {
      return clean;
    }
  }
}

/**
 * 递归将 DOM 节点转换为轻拟物 Markdown 文本
 */
function nodeToMarkdown(node: Node): string {
  if (node.nodeType === 3) {
    // TEXT_NODE
    return node.textContent || '';
  }
  if (node.nodeType !== 1) {
    return '';
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  // 忽略无用样式与脚本
  if (['style', 'script', 'head', 'meta', 'link'].includes(tag)) {
    return '';
  }

  let childrenText = '';
  for (let i = 0; i < el.childNodes.length; i++) {
    childrenText += nodeToMarkdown(el.childNodes[i]);
  }

  const trimmed = childrenText.trim();
  // 过滤无意义的 &nbsp; 纯空白行
  if (trimmed === '&nbsp;' || trimmed === '&#160;' || trimmed === '\u00a0') {
    return '';
  }

  // 检查是否为 OneNote 专属大标题样式 (font-size >= 16pt 或 20pt)
  const styleAttr = el.getAttribute('style') || '';
  const fontSizeMatch = styleAttr.match(/font-size:\s*([0-9.]+)\s*pt/i);
  const fontSizePt = fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 0;

  switch (tag) {
    case 'h1':
      return trimmed ? `\n\n# ${trimmed}\n\n` : '';
    case 'h2':
      return trimmed ? `\n\n## ${trimmed}\n\n` : '';
    case 'h3':
      return trimmed ? `\n\n### ${trimmed}\n\n` : '';
    case 'h4':
    case 'h5':
    case 'h6':
      return trimmed ? `\n\n#### ${trimmed}\n\n` : '';
    case 'p':
    case 'div': {
      if (!trimmed) return '';
      // OneNote 标题自动提炼 (大字号段落转为 Markdown 标题)
      if (fontSizePt >= 18) {
        return `\n\n# ${trimmed}\n\n`;
      } else if (fontSizePt >= 14) {
        return `\n\n## ${trimmed}\n\n`;
      }
      return `\n\n${trimmed}\n\n`;
    }
    case 'br':
      return '\n';
    case 'hr':
      return '\n\n---\n\n';
    case 'b':
    case 'strong':
      return trimmed ? `**${trimmed}**` : '';
    case 'i':
    case 'em':
      return trimmed ? `*${trimmed}*` : '';
    case 'code':
      return `\`${childrenText}\``;
    case 'pre':
      return `\n\`\`\`\n${childrenText}\n\`\`\`\n`;
    case 'li':
      return trimmed ? `\n- ${trimmed}` : '';
    case 'ul':
    case 'ol':
      return `\n${childrenText}\n`;
    case 'blockquote':
      return trimmed ? `\n\n> ${trimmed}\n\n` : '';
    case 'table':
      return `\n\n${childrenText}\n\n`;
    case 'tr':
      return `\n| ${childrenText} |`;
    case 'td':
    case 'th':
      return ` ${trimmed} |`;
    case 'a': {
      const href = el.getAttribute('href') || '';
      return href ? `[${trimmed}](${href})` : childrenText;
    }
    default:
      return childrenText;
  }
}

/**
 * 将 HTML 字符串转换为 Markdown
 */
export function htmlToMarkdown(htmlString: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const body = doc.body || doc.documentElement;
    const rawMd = nodeToMarkdown(body);

    return rawMd
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } catch (e) {
    return htmlString.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

/**
 * 解析 OneNote 原生导出的 .mht (单文件网页) 文件
 */
export function parseMHTFile(content: string, defaultFilename: string): { title: string; cleanContent: string; tags: string[] } {
  let title = defaultFilename.replace(/\.(mht|mhtml)$/i, '').trim();

  // 1. 尝试从邮件头 Subject 提取标题
  const subjectMatch = content.match(/Subject:\s*([^\r\n]+)/i);
  if (subjectMatch && subjectMatch[1]) {
    const rawSubject = subjectMatch[1].trim();
    if (rawSubject && !rawSubject.startsWith('=?')) {
      title = rawSubject;
    }
  }

  // 2. MIME Multipart 边界精准拆包
  const boundaryMatch = content.match(/boundary=["']?([^"';\r\n]+)["']?/i);
  let htmlBody = '';
  let charset = 'utf-8';
  let isQP = false;
  let isBase64 = false;

  if (boundaryMatch) {
    const boundary = boundaryMatch[1].trim();
    const parts = content.split('--' + boundary);

    for (const part of parts) {
      if (/Content-Type:\s*text\/html/i.test(part)) {
        const headerEnd = part.search(/\r?\n\r?\n/);
        if (headerEnd !== -1) {
          const header = part.substring(0, headerEnd);
          const body = part.substring(headerEnd).replace(/^[\r\n]+/, '');

          const charsetMatch = header.match(/charset=["']?([a-zA-Z0-9_-]+)["']?/i);
          if (charsetMatch) charset = charsetMatch[1];

          if (/Content-Transfer-Encoding:\s*quoted-printable/i.test(header)) {
            isQP = true;
          } else if (/Content-Transfer-Encoding:\s*base64/i.test(header)) {
            isBase64 = true;
          }

          htmlBody = body;
          break;
        }
      }
    }
  }

  // 降级兜底方案：直接检索 text/html 片段并获取上下文 headers
  if (!htmlBody) {
    const htmlStart = content.search(/Content-Type:\s*text\/html/i);
    if (htmlStart !== -1) {
      const before = content.substring(Math.max(0, htmlStart - 600), htmlStart);
      const after = content.substring(htmlStart);
      const contextHeaders = before + after.substring(0, 600);

      const charsetMatch = contextHeaders.match(/charset=["']?([a-zA-Z0-9_-]+)["']?/i);
      if (charsetMatch) charset = charsetMatch[1];

      if (/Content-Transfer-Encoding:\s*quoted-printable/i.test(contextHeaders)) isQP = true;
      if (/Content-Transfer-Encoding:\s*base64/i.test(contextHeaders)) isBase64 = true;

      const headerEnd = after.search(/\r?\n\r?\n/);
      if (headerEnd !== -1) {
        htmlBody = after.substring(headerEnd).replace(/^[\r\n]+/, '');
        const nextBoundary = htmlBody.search(/[\r\n]+--/);
        if (nextBoundary !== -1) htmlBody = htmlBody.substring(0, nextBoundary);
      }
    }
  }

  // 智能格式兜底检测：如果仍然含有大量的 quoted-printable 标志（如 =3D 或十六进制 =E4=BD 等），强行激活 QP 解码
  if (!isQP && !isBase64 && (/=[0-9A-Fa-f]{2}/.test(htmlBody) || htmlBody.includes('=3D'))) {
    isQP = true;
  }

  // 执行真实解码
  if (isQP) {
    htmlBody = decodeQuotedPrintable(htmlBody, charset);
  } else if (isBase64) {
    try {
      htmlBody = atob(htmlBody.replace(/\s+/g, ''));
    } catch {
      // 保留原始内容
    }
  }

  // 3. 检查 HTML 中的 <title> 标签
  const titleTagMatch = htmlBody.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleTagMatch && titleTagMatch[1]) {
    const t = titleTagMatch[1].trim();
    if (t && t.length < 50 && !t.includes('Microsoft OneNote')) {
      title = t;
    }
  }

  // 4. 将 HTML 转为 Markdown
  const markdown = htmlToMarkdown(htmlBody);

  // 如果 Markdown 正文以 # 标题开头，使用首行标题
  const headingMatch = markdown.match(/^#\s+([^\r\n]+)/);
  if (headingMatch && headingMatch[1] && headingMatch[1].trim().length < 50) {
    title = headingMatch[1].trim();
  }

  return {
    title: title || 'OneNote 网页笔记',
    cleanContent: markdown,
    tags: ['OneNote', 'MHT网页导入'],
  };
}

/**
 * 清洗与提炼 Markdown 内容及标题
 */
function cleanOneNoteMarkdown(filename: string, content: string): { title: string; cleanContent: string; tags: string[] } {
  let title = filename.replace(/\.(md|txt|markdown|html)$/i, '').trim();
  const tags: string[] = ['OneNote'];

  // 如果内容开头是 # 标题，提取更友好的名字
  const titleMatch = content.match(/^#\s+([^\r\n]+)/);
  if (titleMatch && titleMatch[1]) {
    const candidate = titleMatch[1].trim();
    if (candidate && candidate.length <= 40) {
      title = candidate;
    }
  }

  // 提取标签 (例如 #生活 #工作)
  const tagMatches = content.match(/(?:^|\s)#([\u4e00-\u9fa5\w_-]{2,16})/g);
  if (tagMatches) {
    for (const rawTag of tagMatches) {
      const cleanTag = rawTag.trim().replace(/^#/, '');
      if (cleanTag && !tags.includes(cleanTag) && tags.length < 5) {
        tags.push(cleanTag);
      }
    }
  }

  return { title, cleanContent: content, tags };
}

/**
 * 统一处理任意文件内容（自动区分 .mht / .html / .md / .txt）
 */
export function parseNoteContent(filename: string, rawText: string): { title: string; cleanContent: string; tags: string[]; isConverted: boolean } {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.mht') || lower.endsWith('.mhtml')) {
    const res = parseMHTFile(rawText, filename);
    return { ...res, isConverted: true };
  }
  if (lower.endsWith('.html') || lower.endsWith('.htm')) {
    const titleMatch = rawText.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.(html|htm)$/i, '');
    const cleanContent = htmlToMarkdown(rawText);
    return { title, cleanContent, tags: ['OneNote', 'HTML导入'], isConverted: true };
  }
  const res = cleanOneNoteMarkdown(filename, rawText);
  return { ...res, isConverted: false };
}

/**
 * 1. 从文件夹选择器上传的文件列表导入 (包含 webkitRelativePath)
 */
export async function importFromFolderFiles(
  files: FileList | File[],
  targetParentId: string | null = null,
  onProgress?: (progress: OneNoteImportProgress) => void
): Promise<OneNoteImportResult> {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) {
    return { success: false, importedFilesCount: 0, importedFoldersCount: 0, error: '未选择任何文件' };
  }

  try {
    onProgress?.({
      stage: 'scanning',
      message: `正在扫描 ${fileArray.length} 个文件...`,
      current: 0,
      total: fileArray.length,
    });

    const folderCache = new Map<string, string>();
    let importedFilesCount = 0;
    const initialFolderCount = await db.virtual_files.where('type').equals('folder').count();

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      // 跳过隐藏文件或系统垃圾
      if (file.name.startsWith('.') || file.name.startsWith('~') || file.name.includes('__MACOSX')) {
        continue;
      }

      onProgress?.({
        stage: 'parsing',
        message: `正在解析: ${file.name}`,
        current: i + 1,
        total: fileArray.length,
      });

      // 解析 relativePath
      const relPath = (file as any).webkitRelativePath || file.name;
      const pathParts = relPath.split('/').filter(Boolean);
      const fileName = pathParts.pop() || file.name;
      const folderSegments = pathParts;

      // 递归获取所属文件夹 ID
      const folderId = await ensureFolderPath(folderSegments, targetParentId, folderCache);

      // 读取文件正文
      const text = await file.text();
      const { title, cleanContent, tags, isConverted } = parseNoteContent(fileName, text);
      const ext = isConverted ? 'md' : extractExtension(fileName);
      const now = Date.now();

      const newRecord: VirtualFileRecord = {
        id: `file_${now}_${Math.random().toString(36).substring(2, 7)}`,
        name: isConverted || ext === 'md' ? `${title}.md` : fileName,
        type: 'file',
        parentId: folderId,
        ext,
        content: cleanContent,
        size: file.size || new Blob([cleanContent]).size,
        source: 'onenote',
        tags,
        wordCount: calculateWordCount(cleanContent),
        createdAt: now,
        updatedAt: now,
      };

      await db.virtual_files.put(newRecord);
      importedFilesCount += 1;
    }

    const finalFolderCount = await db.virtual_files.where('type').equals('folder').count();
    const importedFoldersCount = Math.max(0, finalFolderCount - initialFolderCount);

    onProgress?.({
      stage: 'done',
      message: `成功导入 ${importedFilesCount} 篇笔记！`,
      current: fileArray.length,
      total: fileArray.length,
    });

    return {
      success: true,
      importedFilesCount,
      importedFoldersCount,
    };
  } catch (err: any) {
    console.error('[OneNoteImporter] importFromFolderFiles error:', err);
    onProgress?.({
      stage: 'error',
      message: `导入失败: ${err.message || '未知错误'}`,
      current: 0,
      total: fileArray.length,
    });
    return {
      success: false,
      importedFilesCount: 0,
      importedFoldersCount: 0,
      error: err.message || '导入异常',
    };
  }
}

/**
 * 2. 从 .zip 压缩包导入 (解压并自动重构目录与 Markdown 笔记)
 */
export async function importFromZipFile(
  zipFile: File,
  targetParentId: string | null = null,
  onProgress?: (progress: OneNoteImportProgress) => void
): Promise<OneNoteImportResult> {
  try {
    onProgress?.({
      stage: 'extracting',
      message: '正在解压 OneNote 压缩包...',
      current: 0,
      total: 100,
    });

    const zip = await JSZip.loadAsync(zipFile);
    const entries = Object.keys(zip.files).filter(path => {
      return !path.startsWith('__MACOSX') && !path.includes('/.') && !path.endsWith('/');
    });

    if (entries.length === 0) {
      return { success: false, importedFilesCount: 0, importedFoldersCount: 0, error: '压缩包内未找到有效文件' };
    }

    onProgress?.({
      stage: 'parsing',
      message: `找到 ${entries.length} 个文件，正在还原笔记结构...`,
      current: 0,
      total: entries.length,
    });

    const folderCache = new Map<string, string>();
    let importedFilesCount = 0;
    const initialFolderCount = await db.virtual_files.where('type').equals('folder').count();

    for (let i = 0; i < entries.length; i++) {
      const entryPath = entries[i];
      const zipEntry = zip.files[entryPath];
      if (zipEntry.dir) continue;

      const pathParts = entryPath.split('/').filter(Boolean);
      const fileName = pathParts.pop() || 'note.md';
      const folderSegments = pathParts;

      onProgress?.({
        stage: 'parsing',
        message: `正在导入: ${fileName}`,
        current: i + 1,
        total: entries.length,
      });

      const folderId = await ensureFolderPath(folderSegments, targetParentId, folderCache);

      // 解压文本内容
      let content = '';
      try {
        content = await zipEntry.async('text');
      } catch (readErr) {
        console.warn(`[OneNoteImporter] 无法读取文件 ${entryPath} 为文本，跳过`, readErr);
        continue;
      }

      const { title, cleanContent, tags, isConverted } = parseNoteContent(fileName, content);
      const ext = isConverted ? 'md' : extractExtension(fileName);
      const now = Date.now();

      const newRecord: VirtualFileRecord = {
        id: `file_${now}_${Math.random().toString(36).substring(2, 7)}`,
        name: isConverted || ext === 'md' ? `${title}.md` : fileName,
        type: 'file',
        parentId: folderId,
        ext,
        content: cleanContent,
        size: new Blob([cleanContent]).size,
        source: 'onenote',
        tags,
        wordCount: calculateWordCount(cleanContent),
        createdAt: now,
        updatedAt: now,
      };

      await db.virtual_files.put(newRecord);
      importedFilesCount += 1;
    }

    const finalFolderCount = await db.virtual_files.where('type').equals('folder').count();
    const importedFoldersCount = Math.max(0, finalFolderCount - initialFolderCount);

    onProgress?.({
      stage: 'done',
      message: `压缩包导入完成！共生成 ${importedFilesCount} 篇笔记。`,
      current: entries.length,
      total: entries.length,
    });

    return {
      success: true,
      importedFilesCount,
      importedFoldersCount,
    };
  } catch (err: any) {
    console.error('[OneNoteImporter] importFromZipFile error:', err);
    onProgress?.({
      stage: 'error',
      message: `压缩包解析失败: ${err.message || '格式不支持'}`,
      current: 0,
      total: 100,
    });
    return {
      success: false,
      importedFilesCount: 0,
      importedFoldersCount: 0,
      error: err.message || '压缩包解析异常',
    };
  }
}

/**
 * 3. 递归读取拖拽放置项 (webkitGetAsEntry)
 */
export async function importFromDroppedEntries(
  items: DataTransferItemList,
  targetParentId: string | null = null,
  onProgress?: (progress: OneNoteImportProgress) => void
): Promise<OneNoteImportResult> {
  try {
    const filesToProcess: { file: File; pathSegments: string[] }[] = [];

    // 递归遍历 entry
    async function scanEntry(entry: any, currentPath: string[] = []): Promise<void> {
      if (!entry) return;
      if (entry.isFile) {
        return new Promise(resolve => {
          entry.file((file: File) => {
            filesToProcess.push({ file, pathSegments: currentPath });
            resolve();
          }, () => resolve());
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const nextPath = [...currentPath, entry.name];

        return new Promise(resolve => {
          const readAllEntries = () => {
            dirReader.readEntries(async (entries: any[]) => {
              if (entries.length === 0) {
                resolve();
              } else {
                for (const subEntry of entries) {
                  await scanEntry(subEntry, nextPath);
                }
                readAllEntries();
              }
            }, () => resolve());
          };
          readAllEntries();
        });
      }
    }

    onProgress?.({
      stage: 'scanning',
      message: '正在扫描拖拽的文件与文件夹...',
      current: 0,
      total: items.length,
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = (item as any).webkitGetAsEntry?.();
      if (entry) {
        await scanEntry(entry, []);
      } else {
        const file = item.getAsFile();
        if (file) filesToProcess.push({ file, pathSegments: [] });
      }
    }

    if (filesToProcess.length === 0) {
      return { success: false, importedFilesCount: 0, importedFoldersCount: 0, error: '未检测到可导入的文件' };
    }

    // 检查是否有 zip 包，若有单个 zip 则走 zip 导入
    if (filesToProcess.length === 1 && filesToProcess[0].file.name.endsWith('.zip')) {
      return await importFromZipFile(filesToProcess[0].file, targetParentId, onProgress);
    }

    const folderCache = new Map<string, string>();
    let importedFilesCount = 0;
    const initialFolderCount = await db.virtual_files.where('type').equals('folder').count();

    for (let i = 0; i < filesToProcess.length; i++) {
      const { file, pathSegments } = filesToProcess[i];
      if (file.name.startsWith('.') || file.name.includes('__MACOSX')) continue;

      onProgress?.({
        stage: 'parsing',
        message: `正在导入: ${file.name}`,
        current: i + 1,
        total: filesToProcess.length,
      });

      const folderId = await ensureFolderPath(pathSegments, targetParentId, folderCache);
      const text = await file.text();
      const { title, cleanContent, tags, isConverted } = parseNoteContent(file.name, text);
      const ext = isConverted ? 'md' : extractExtension(file.name);
      const now = Date.now();

      const newRecord: VirtualFileRecord = {
        id: `file_${now}_${Math.random().toString(36).substring(2, 7)}`,
        name: isConverted || ext === 'md' ? `${title}.md` : file.name,
        type: 'file',
        parentId: folderId,
        ext,
        content: cleanContent,
        size: file.size || new Blob([cleanContent]).size,
        source: 'onenote',
        tags,
        wordCount: calculateWordCount(cleanContent),
        createdAt: now,
        updatedAt: now,
      };

      await db.virtual_files.put(newRecord);
      importedFilesCount += 1;
    }

    const finalFolderCount = await db.virtual_files.where('type').equals('folder').count();
    const importedFoldersCount = Math.max(0, finalFolderCount - initialFolderCount);

    onProgress?.({
      stage: 'done',
      message: `成功导入 ${importedFilesCount} 篇笔记！`,
      current: filesToProcess.length,
      total: filesToProcess.length,
    });

    return {
      success: true,
      importedFilesCount,
      importedFoldersCount,
    };
  } catch (err: any) {
    console.error('[OneNoteImporter] importFromDroppedEntries error:', err);
    return {
      success: false,
      importedFilesCount: 0,
      importedFoldersCount: 0,
      error: err.message || '拖拽读取失败',
    };
  }
}

/**
 * 4. 直接粘贴 OneNote 笔记文字导入
 */
export async function importFromPastedNote(
  title: string,
  content: string,
  targetParentId: string | null = null
): Promise<VirtualFileRecord> {
  const cleanTitle = title.trim() || 'OneNote 快速小记';
  const now = Date.now();
  const wordCount = calculateWordCount(content);

  const file: VirtualFileRecord = {
    id: `file_${now}_${Math.random().toString(36).substring(2, 7)}`,
    name: `${cleanTitle}.md`,
    type: 'file',
    parentId: targetParentId,
    ext: 'md',
    content,
    size: new Blob([content]).size,
    source: 'onenote',
    tags: ['OneNote', '快速录入'],
    wordCount,
    createdAt: now,
    updatedAt: now,
  };

  await db.virtual_files.put(file);
  return file;
}
