import { PoetryOnlineItem } from './poetryTypes';

const POETRY_API_BASE = 'https://poetry.palemoky.com/api';

// 内存搜索缓存，减少向公用服务的频繁请求
const searchCache = new Map<string, PoetryOnlineItem[]>();

/**
 * 在线搜索古诗词（按关键词、篇名、诗人、诗句）
 */
export async function searchPoetryOnline(
  keyword: string,
  signal?: AbortSignal,
  page = 1,
  pageSize = 12
): Promise<PoetryOnlineItem[]> {
  const cleanQuery = keyword.trim();
  if (!cleanQuery) return [];

  const cacheKey = `${cleanQuery}_${page}_${pageSize}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  const url = `${POETRY_API_BASE}/search?q=${encodeURIComponent(cleanQuery)}&page=${page}&pageSize=${pageSize}&lang=zh-Hans`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8500);

  try {
    const combinedSignal = signal
      ? anySignal([signal, controller.signal])
      : controller.signal;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`诗词服务响应异常: ${res.status}`);
    }

    const json = await res.json();
    const rawItems: unknown[] = Array.isArray(json?.data) ? json.data : [];

    const normalized: PoetryOnlineItem[] = rawItems.map((item: any) => ({
      id: Number(item.id) || Date.now(),
      title: String(item.title || '无题').trim(),
      author: {
        id: item.author?.id,
        name: String(item.author?.name || '佚名').trim(),
      },
      dynasty: {
        id: item.dynasty?.id,
        name: String(item.dynasty?.name || '唐').trim(),
      },
      type: {
        id: item.type?.id,
        name: String(item.type?.name || '诗').trim(),
      },
      content: Array.isArray(item.content)
        ? item.content.map((line: any) => String(line).trim()).filter(Boolean)
        : typeof item.content === 'string'
        ? item.content.split('\n').map((l: string) => l.trim()).filter(Boolean)
        : [],
    }));

    searchCache.set(cacheKey, normalized);
    return normalized;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      console.warn('[PoetryApi] 检索超时或已被取消');
      return [];
    }
    console.error('[PoetryApi] 检索异常:', err);
    throw err;
  }
}

/**
 * 获取随机古诗一首
 */
export async function fetchRandomPoemOnline(
  filter?: { author?: string; type?: string; dynasty?: string },
  signal?: AbortSignal
): Promise<PoetryOnlineItem | null> {
  const params = new URLSearchParams({ lang: 'zh-Hans' });
  if (filter?.author) params.set('author', filter.author);
  if (filter?.type) params.set('type', filter.type);
  if (filter?.dynasty) params.set('dynasty', filter.dynasty);

  const url = `${POETRY_API_BASE}/poems/random?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const combinedSignal = signal
      ? anySignal([signal, controller.signal])
      : controller.signal;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`随机诗词请求失败: ${res.status}`);
    }

    const json = await res.json();
    const item = json?.data;
    if (!item) return null;

    return {
      id: Number(item.id) || Date.now(),
      title: String(item.title || '无题').trim(),
      author: {
        id: item.author?.id,
        name: String(item.author?.name || '佚名').trim(),
      },
      dynasty: {
        id: item.dynasty?.id,
        name: String(item.dynasty?.name || '唐').trim(),
      },
      type: {
        id: item.type?.id,
        name: String(item.type?.name || '绝句').trim(),
      },
      content: Array.isArray(item.content)
        ? item.content.map((l: any) => String(l).trim()).filter(Boolean)
        : [],
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[PoetryApi] 随机诗词拉取失败:', err);
    return null;
  }
}

// 辅助合并多个 AbortSignal
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      controller.abort();
      return controller.signal;
    }
    s.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}
