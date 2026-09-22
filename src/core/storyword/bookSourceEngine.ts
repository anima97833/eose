import { BookSourceRule, StoryChapter, StoryNovel, VocabLevel } from './storyWordTypes';

const CORS_PROXIES = [
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

/**
 * 过滤第三方小说网站常见干扰广告与废话
 */
function cleanNovelParagraphs(rawText: string): string {
  const adPatterns = [
    /请记住本站域名.*/gi,
    /天才一秒记住.*/gi,
    /手机用户请浏览.*/gi,
    /最新网址.*/gi,
    /加入书签.*/gi,
    /下一章.*/gi,
    /上一章.*/gi,
    /点击下一页继续阅读.*/gi,
    /<br\s*\/?>/gi,
  ];

  let cleaned = rawText;
  for (const p of adPatterns) {
    cleaned = cleaned.replace(p, '');
  }

  // 整理换行与段落
  return cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n\n');
}

/**
 * 跨域抓取网页 HTML (带多中继代理自动容错重试)
 */
export async function fetchHtmlWithProxy(targetUrl: string): Promise<string> {
  let lastError: any = null;

  for (const makeProxyUrl of CORS_PROXIES) {
    try {
      const proxyUrl = makeProxyUrl(targetUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000); // 9秒超时

      const res = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 100) {
          return text;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(lastError?.message || '跨域抓取失败，请检查网络或小说网址是否有效');
}

/**
 * 从小说网页抓取并解析单章节正文
 */
export async function crawlChapterFromUrl(
  chapterUrl: string,
  sourceRule?: BookSourceRule
): Promise<{ title: string; content: string }> {
  const html = await fetchHtmlWithProxy(chapterUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. 提取标题
  let title = '';
  if (sourceRule?.titleSelector) {
    const el = doc.querySelector(sourceRule.titleSelector);
    if (el?.textContent?.trim()) title = el.textContent.trim();
  }
  if (!title) {
    const fallbackTitleEl = doc.querySelector('h1, .title, .read-title, .chapter-title, .bookname h1');
    if (fallbackTitleEl?.textContent?.trim()) {
      title = fallbackTitleEl.textContent.trim();
    } else {
      title = doc.title?.split(/[-_|_]/)[0]?.trim() || '章节正文';
    }
  }

  // 2. 提取正文内容
  let content = '';
  const selectorsToTry = [
    sourceRule?.contentSelector,
    '#content',
    '#chaptercontent',
    '#htmlContent',
    '.read-content',
    '.novel-content',
    '.chapter-content',
    '#chapter_content',
    'article',
  ].filter(Boolean) as string[];

  for (const sel of selectorsToTry) {
    const el = doc.querySelector(sel);
    if (el) {
      // 移除 script, style, a 标签等干扰物
      el.querySelectorAll('script, style, iframe, nav, .ad, .ads').forEach((n) => n.remove());
      const inner = el.textContent || '';
      if (inner.trim().length > 150) {
        content = inner;
        break;
      }
    }
  }

  // 容错：如果特定选择器未命中，寻找最大文字块
  if (!content) {
    let maxLen = 0;
    doc.querySelectorAll('div, section, article').forEach((div) => {
      div.querySelectorAll('script, style').forEach((n) => n.remove());
      const txt = div.textContent || '';
      if (txt.length > maxLen) {
        maxLen = txt.length;
        content = txt;
      }
    });
  }

  if (!content || content.length < 50) {
    throw new Error('未能在该网页中识别出小说章节正文，请检查选择器规则');
  }

  return {
    title,
    content: cleanNovelParagraphs(content),
  };
}

/**
 * 本地 TXT 文本智能分章节导入
 */
export function parseTxtNovelContent(
  rawTxt: string,
  bookTitle = '导入本地小说',
  author = '未知作者',
  level: VocabLevel = 'cet4'
): StoryNovel {
  const cleaned = rawTxt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 正则匹配常见中文章节头，如：“第一章 归来”、“第12回 试剑”、“第3节”
  const chapterRegex = /(第\s*[0-9一二三四五六七八九十百千]+\s*[章回节卷集部篇][^\n]*)/g;

  const matches = Array.from(cleaned.matchAll(chapterRegex));
  const chapters: StoryChapter[] = [];

  if (matches.length >= 2) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const title = match[1].trim();
      const startIndex = (match.index || 0) + match[0].length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index : cleaned.length;
      const chapterBody = cleaned.slice(startIndex, endIndex).trim();

      chapters.push({
        id: `ch_txt_${i}_${Date.now()}`,
        index: i,
        title,
        originalText: cleanNovelParagraphs(chapterBody),
      });
    }
  } else {
    // 若未识别出明确章节，每 1200 字切为一折
    const chunkSize = 1200;
    let chIndex = 0;
    for (let pos = 0; pos < cleaned.length; pos += chunkSize) {
      const chunk = cleaned.slice(pos, pos + chunkSize).trim();
      if (chunk.length > 30) {
        chapters.push({
          id: `ch_txt_chunk_${chIndex}_${Date.now()}`,
          index: chIndex,
          title: `第 ${chIndex + 1} 幕`,
          originalText: cleanNovelParagraphs(chunk),
        });
        chIndex++;
      }
    }
  }

  return {
    id: `novel_txt_${Date.now()}`,
    title: bookTitle.trim() || '导入小说',
    author: author.trim() || '佚名',
    intro: chapters[0]?.originalText?.slice(0, 100) + '…',
    sourceId: 'local_txt',
    sourceName: '本地TXT/粘贴导入',
    currentChapterIndex: 0,
    totalChapters: chapters.length,
    chapters: chapters.length > 0 ? chapters : [
      {
        id: `ch_single_${Date.now()}`,
        index: 0,
        title: '正文',
        originalText: cleanNovelParagraphs(cleaned),
      },
    ],
    targetLevel: level,
    insertDensity: 0.18,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * 将开源阅读 Legado 语法转换为网页可用选择器
 */
export function convertLegadoSelector(ruleStr?: string): string {
  if (!ruleStr) return '#content, .read-content, article';
  let base = ruleStr.split('##')[0].trim();
  base = base.replace(/@html|@text/gi, '').trim();
  base = base.replace(/^@css:/i, '').trim();
  base = base.replace(/^id\.([a-zA-Z0-9_-]+)/i, '#$1');
  base = base.replace(/^class\.([a-zA-Z0-9_-]+)/i, '.$1');
  base = base.replace(/^tag\.([a-zA-Z0-9_-]+)/i, '$1');
  if (!base || base.startsWith('@js') || base.startsWith('data.') || base.startsWith('$..')) {
    return '#content, .read-content, article';
  }
  return base;
}

/**
 * 导入自定义 JSON 书源规则 (兼容开源阅读 Legado 关键字段)
 */
export function parseBookSourceRulesFromJson(jsonInput: string | any[]): BookSourceRule[] {
  try {
    const parsed = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    const list = Array.isArray(parsed) ? parsed : [parsed];
    const results: BookSourceRule[] = [];

    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      const name = item.bookSourceName || item.name || '外部导入书源';
      const host = item.bookSourceUrl || item.host || 'http://unknown.com';
      const rawContent = item.ruleContent?.content || item.contentSelector || '';
      const contentSelector = convertLegadoSelector(rawContent);

      results.push({
        id: `source_custom_${Date.now()}_${results.length}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        host,
        contentSelector,
        searchUrlPattern: item.searchUrl,
        titleSelector: convertLegadoSelector(item.ruleContent?.title || item.titleSelector || ''),
        isEnabled: true,
      });
    }

    return results;
  } catch (err) {
    throw new Error('书源 JSON 格式不合法，请检查是否符合规范');
  }
}

/**
 * 远端一键网络拉取书源合集 (支持 ghproxy / github raw / gitee 等各类 JSON 订阅链接)
 */
export async function fetchRemoteBookSources(sourceUrl: string): Promise<BookSourceRule[]> {
  let cleanUrl = sourceUrl.trim();
  if (!cleanUrl) throw new Error('请输入有效的书源网络链接');

  // 剥离已失效或多余的旧 ghproxy 前缀，提取真实 raw 链接
  const ghproxyRegex = /^https?:\/\/(?:ghproxy\.com|mirror\.ghproxy\.com)\/(https?:\/\/.*)$/i;
  const match = cleanUrl.match(ghproxyRegex);
  if (match && match[1]) {
    cleanUrl = match[1];
  }

  // 构造自动降级中继镜像池
  const mirrors = [
    cleanUrl,
    `https://ghfast.top/${cleanUrl}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`,
  ];

  let lastErr: any = null;
  for (const mirrorUrl of mirrors) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(mirrorUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json, text/plain, */*' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const trimmed = text.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          return parseBookSourceRulesFromJson(trimmed);
        }
      }
    } catch (e) {
      lastErr = e;
    }
  }

  throw new Error(lastErr?.message || '无法通过网络拉取该书源合集，请检查网络或链接有效性');
}

// 统一便捷导出别名
export const createNovelFromTxt = parseTxtNovelContent;
export const importLegadoBookSources = parseBookSourceRulesFromJson;

export async function crawlNovelChapterFromUrl(
  url: string,
  sourceRule?: BookSourceRule
): Promise<StoryChapter> {
  const result = await crawlChapterFromUrl(url, sourceRule);
  return {
    id: `ch_crawled_${Date.now()}`,
    index: 0,
    title: result.title,
    originalText: result.content,
    sourceUrl: url,
  };
}


