import { MovieSearchResult } from './cinemaTypes';

const API_BASE = 'https://imdb.iamidiotareyoutoo.com/justwatch';

export async function searchMoviesOnline(query: string): Promise<MovieSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const url = `${API_BASE}?q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`网络响应错误: ${response.status}`);
    }

    const data = await response.json();
    if (!data.ok || !Array.isArray(data.description)) {
      return [];
    }

    return data.description.map((item: any, idx: number): MovieSearchResult => {
      // 提取海报：优先选用中大规格清晰度 (s592 或 s332)
      let poster = '';
      if (Array.isArray(item.photo_url) && item.photo_url.length > 0) {
        poster = item.photo_url[0];
      }

      // 提取背景横屏剧照
      let backdrop = '';
      if (Array.isArray(item.backdrops) && item.backdrops.length > 0) {
        backdrop = item.backdrops[0];
      }

      return {
        id: item.id || `movie_${Date.now()}_${idx}`,
        title: item.title || '未知影片',
        year: typeof item.year === 'number' ? item.year : new Date().getFullYear(),
        runtimeMinutes: typeof item.runtime === 'number' ? item.runtime : 0,
        posterUrl: poster,
        backdropUrl: backdrop,
        type: item.type || 'MOVIE',
      };
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn('[CinemaAPI] 影视搜索请求超时');
      throw new Error('搜索连接超时，请重试');
    }
    console.error('[CinemaAPI] 搜索异常:', err);
    throw new Error(err.message || '搜索服务异常');
  }
}
