import { BookSourceRule, StoryChapter, StoryNovel, VocabLevel } from './storyWordTypes';
import { getAllBookSources, saveStoryNovel } from './storyWordStorage';
import { crawlChapterFromUrl, fetchHtmlWithProxy } from './bookSourceEngine';

export interface SearchNovelResult {
  id: string;
  title: string;
  author: string;
  sourceName: string;
  sourceId: string;
  externalUrl: string;
  sourceRule?: BookSourceRule;
  latestChapter?: string;
  intro?: string;
}

/**
 * 智能解析与清洗书源搜索 URL（兼容开源阅读 Legado 各种语法、POST格式及相对路径）
 */
function resolveSearchUrl(source: BookSourceRule, keyword: string): string | null {
  let raw = (source.searchUrlPattern || '').trim();

  // 如果没有显式配置搜索规则，尝试以 host/search 为默认
  if (!raw) {
    if (source.host && source.host !== 'local' && source.host !== 'universal') {
      raw = `${source.host}/search?key={{key}}`;
    } else {
      return null;
    }
  }

  // 1. 如果规则包含 Legado 的 @js: 或 <js> 脚本，提取其中的真实 HTTP URL，无法提取则安全跳过
  if (raw.startsWith('@js:') || raw.startsWith('<js>')) {
    const match = raw.match(/https?:\/\/[^\s"'`]+/);
    if (match) {
      raw = match[0];
    } else {
      return null;
    }
  }

  // 2. Legado 语法中，逗号后面通常是 POST 参数或 headers 如: "url, {'method': 'POST'}"
  if (raw.includes(',')) {
    const parts = raw.split(',');
    if (parts[0].includes('http') || parts[0].includes('/')) {
      raw = parts[0].trim();
    }
  }

  // 3. 替换各类搜索占位符 (支持 {{key}}, {{searchKey}}, %s 等)
  let searchUrl = raw
    .replace(/\{\{\s*key\s*\}\}/g, encodeURIComponent(keyword))
    .replace(/\{\{\s*searchKey\s*\}\}/g, encodeURIComponent(keyword))
    .replace(/%s/g, encodeURIComponent(keyword));

  // 4. 清理残留的多余外部代理前缀
  if (searchUrl.includes('api.allorigins.win/raw?url=')) {
    searchUrl = decodeURIComponent(searchUrl.split('api.allorigins.win/raw?url=')[1]);
  }
  if (searchUrl.includes('corsproxy.io/?')) {
    searchUrl = decodeURIComponent(searchUrl.split('corsproxy.io/?')[1]);
  }

  // 5. 如果是相对路径 (如 /fiction/search 或 novel/search)，结合 source.host 补全绝对路径
  if (!searchUrl.startsWith('http://') && !searchUrl.startsWith('https://')) {
    let host = (source.host || '').trim();
    if (!host || host === 'local' || host === 'universal') return null;
    if (!host.startsWith('http://') && !host.startsWith('https://')) {
      host = `https://${host}`;
    }
    if (host.endsWith('/')) host = host.slice(0, -1);
    if (!searchUrl.startsWith('/')) searchUrl = `/${searchUrl}`;
    searchUrl = `${host}${searchUrl}`;
  }

  // 6. 最终严格校验：必须是合法的 http/https 协议
  try {
    const parsed = new URL(searchUrl);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return searchUrl;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * 严格只从用户已导入且启用的书源中进行全网真实检索
 * 绝无任何硬编码预设书目，绝无任何伪造数据
 */
export async function searchFromImportedSources(
  query: string
): Promise<{ results: SearchNovelResult[]; error?: string }> {
  const keyword = query.trim();
  if (!keyword) {
    return { results: [] };
  }

  // 1. 读取用户已导入并启用的真实书源
  const allSources = await getAllBookSources();
  const enabledSources = allSources.filter((s) => s.isEnabled && (s.searchUrlPattern || s.host));

  if (enabledSources.length === 0) {
    return {
      results: [],
      error: '暂无可用的已启用书源，请先在规则库中导入或启用书源',
    };
  }

  const results: SearchNovelResult[] = [];
  const seenUrls = new Set<string>();

  // 2. 并发向已启用的各书源发送真实检索请求
  const tasks = enabledSources.map(async (source) => {
    try {
      const searchUrl = resolveSearchUrl(source, keyword);
      if (!searchUrl) return;

      const html = await fetchHtmlWithProxy(searchUrl);
      if (!html) return;

      const trimmed = html.trim();

      // 2.1 针对返回 JSON 数据的接口型书源进行解析
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const json = JSON.parse(trimmed);
          const list = Array.isArray(json)
            ? json
            : Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.list)
            ? json.list
            : Array.isArray(json.result)
            ? json.result
            : Array.isArray(json.books)
            ? json.books
            : [];

          for (const item of list) {
            if (!item || typeof item !== 'object') continue;
            const title =
              item.title || item.bookName || item.name || item.articlename || '';
            const author = item.author || item.writer || '网络作者';
            let bookUrl =
              item.url ||
              item.bookUrl ||
              item.link ||
              (item.id && source.host ? `${source.host}/book/${item.id}` : '');

            if (title && (title.includes(keyword) || keyword.includes(title))) {
              if (bookUrl && !bookUrl.startsWith('http')) {
                try {
                  bookUrl = new URL(bookUrl, searchUrl).href;
                } catch {
                  // ignore
                }
              }
              if (bookUrl && !seenUrls.has(bookUrl)) {
                seenUrls.add(bookUrl);
                results.push({
                  id: `src_res_${Date.now()}_${results.length}_${Math.random().toString(36).slice(2, 6)}`,
                  title,
                  author,
                  sourceName: source.name || '外部书源',
                  sourceId: source.id,
                  externalUrl: bookUrl,
                  sourceRule: source,
                  intro: item.intro || item.desc || '',
                });
              }
            }
          }
          return;
        } catch {
          // 不是合法 json，继续向下执行 HTML 提取
        }
      }

      // 2.2 针对返回 HTML 网页的标准书源进行提取
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // 提取链接与书名
      const links = Array.from(doc.querySelectorAll('a'));

      for (const a of links) {
        const text = a.textContent?.trim() || '';
        const href = a.getAttribute('href') || '';

        // 仅匹配与关键词相关的超链接
        if (
          text.length >= 1 &&
          text.length <= 50 &&
          (text.includes(keyword) || keyword.includes(text)) &&
          href &&
          !href.startsWith('javascript') &&
          !href.startsWith('#')
        ) {
          let fullUrl = href;
          try {
            fullUrl = new URL(href, searchUrl).href;
          } catch {
            continue;
          }

          if (seenUrls.has(fullUrl)) continue;
          seenUrls.add(fullUrl);

          // 尝试提取作者与简介
          let author = '网络连载';
          const parent = a.closest('li, tr, div, .bookbox, .item, .novel-item');
          if (parent) {
            const authorEl = parent.querySelector(
              '.author, .s4, .author-name, td:nth-child(3), .book-author'
            );
            if (authorEl?.textContent?.trim()) {
              author = authorEl.textContent.trim().replace(/^作者[:：\s]*/, '');
            }
          }

          results.push({
            id: `src_res_${Date.now()}_${results.length}_${Math.random().toString(36).slice(2, 6)}`,
            title: text,
            author,
            sourceName: source.name || '外部书源',
            sourceId: source.id,
            externalUrl: fullUrl,
            sourceRule: source,
          });

          if (results.length >= 25) break;
        }
      }
    } catch {
      // 外部书源网络波动或单源失效时跳过，不影响其他书源
    }
  });

  await Promise.allSettled(tasks);

  return { results };
}

/**
 * 将检索到的真实小说一键抓取并加入书架
 */
export async function addSearchedNovelToShelf(
  item: SearchNovelResult,
  targetLevel: VocabLevel = 'cet4'
): Promise<StoryNovel> {
  const chapterData = await crawlChapterFromUrl(item.externalUrl, item.sourceRule);

  const novel: StoryNovel = {
    id: `novel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: item.title,
    author: item.author || '网络作者',
    sourceId: item.sourceId,
    sourceName: item.sourceName,
    currentChapterIndex: 0,
    totalChapters: 1,
    targetLevel,
    insertDensity: 0.18,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    chapters: [
      {
        id: `ch_${Date.now()}_0`,
        index: 0,
        title: chapterData.title || `${item.title} · 第1章`,
        originalText: chapterData.content,
        sourceUrl: item.externalUrl,
      },
    ],
  };

  await saveStoryNovel(novel);
  return novel;
}
