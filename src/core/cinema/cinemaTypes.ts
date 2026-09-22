export type MovieStatus = 'watched' | 'wishlist';

export interface MovieRecord {
  id: string; // 唯一 ID (自增 uuid 或 API id)
  title: string; // 用户自定/中文标题 (如: 千与千寻)
  originalTitle: string; // 官方原名/英文标题 (如: Spirited Away)
  posterUrl: string; // 高清海报 URL
  backdropUrl?: string; // 宽屏剧照背景 URL
  year: number; // 上映年份
  runtimeMinutes: number; // 片长分钟数
  status: MovieStatus; // 'watched' (已看) | 'wishlist' (想看)
  rating: number; // 滑动评分 0 ~ 10 (步进 0.5)
  watchedDate: string; // 观影日期 YYYY-MM-DD
  comment: string; // 观后感 / 评论短评
  tags?: string[]; // 自定义标签 (如: 治愈, 催泪, 科幻)
  createdAt: number; // 记录创建时间戳
  updatedAt: number; // 记录更新时间戳
}

export interface MovieSearchResult {
  id: string;
  title: string;
  year: number;
  runtimeMinutes: number;
  posterUrl: string;
  backdropUrl?: string;
  type?: string;
}

export interface CinemaStats {
  totalWatched: number;
  totalWishlist: number;
  totalMinutes: number;
  totalHours: string;
  avgRating: string;
}
