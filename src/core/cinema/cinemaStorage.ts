import { db } from '../storage/db';
import { MovieRecord, CinemaStats } from './cinemaTypes';

export async function loadAllMovies(): Promise<MovieRecord[]> {
  try {
    const list = await db.movies.toArray();
    if (list.length === 0) {
      // 首次初始化预置 2 部温润经典电影票根样例
      const presets = getPresetMovies();
      await db.movies.bulkAdd(presets);
      return presets;
    }
    // 按观影日期或创建时间倒序排列
    return list.sort((a, b) => {
      const timeA = a.watchedDate ? new Date(a.watchedDate).getTime() : a.createdAt;
      const timeB = b.watchedDate ? new Date(b.watchedDate).getTime() : b.createdAt;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('[CinemaStorage] 读取电影记录失败:', err);
    return [];
  }
}

export async function saveMovie(movie: MovieRecord): Promise<void> {
  try {
    await db.movies.put(movie);
  } catch (err) {
    console.error('[CinemaStorage] 保存电影记录失败:', err);
    throw err;
  }
}

export async function deleteMovie(id: string): Promise<void> {
  try {
    await db.movies.delete(id);
  } catch (err) {
    console.error('[CinemaStorage] 删除电影记录失败:', err);
    throw err;
  }
}

export function calculateCinemaStats(movies: MovieRecord[]): CinemaStats {
  const watched = movies.filter((m) => m.status === 'watched');
  const wishlist = movies.filter((m) => m.status === 'wishlist');

  const totalMinutes = watched.reduce((sum, m) => sum + (m.runtimeMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const rated = watched.filter((m) => typeof m.rating === 'number' && m.rating > 0);
  const avgRating = rated.length > 0
    ? (rated.reduce((sum, m) => sum + m.rating, 0) / rated.length).toFixed(1)
    : '0.0';

  return {
    totalWatched: watched.length,
    totalWishlist: wishlist.length,
    totalMinutes,
    totalHours,
    avgRating,
  };
}

function getPresetMovies(): MovieRecord[] {
  const now = Date.now();
  return [
    {
      id: 'preset_spirited_away',
      title: '千与千寻',
      originalTitle: 'Spirited Away',
      posterUrl: 'https://images.justwatch.com/poster/175492990/s332/spirited-away.jpg',
      backdropUrl: 'https://images.justwatch.com/backdrop/176258301/s1920/spirited-away.jpg',
      year: 2001,
      runtimeMinutes: 125,
      status: 'watched',
      rating: 9.5,
      watchedDate: '2026-09-18',
      comment: '无论重温多少次，依然会被神隐世界里的列车与无脸男深深治愈。',
      tags: ['动画', '宫崎骏', '治愈'],
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 4,
    },
    {
      id: 'preset_interstellar',
      title: '星际穿越',
      originalTitle: 'Interstellar',
      posterUrl: 'https://images.justwatch.com/poster/8732599/s332/interstellar.jpg',
      backdropUrl: 'https://images.justwatch.com/backdrop/8732600/s1920/interstellar.jpg',
      year: 2014,
      runtimeMinutes: 169,
      status: 'watched',
      rating: 9.8,
      watchedDate: '2026-09-20',
      comment: '爱是唯一可以超越时间与空间的维度。汉斯·季默的管风琴震颤心灵。',
      tags: ['科幻', '诺兰', '神作'],
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
    },
  ];
}
