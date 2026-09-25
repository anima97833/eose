export type GameStatus = 'wishlist' | 'playing' | 'cleared' | 'dropped';

export type GamePlatform = 'steam' | 'switch' | 'playstation' | 'xbox' | 'mobile' | 'pc';

export interface GameRecord {
  id: string; // 唯一 ID (如 "g_steam_1086940" 或 "g_itunes_1529124401")
  title: string; // 游戏名称
  originalTitle?: string; // 英文名 / 别名
  coverUrl?: string; // 竖版高清海报/卡带正面贴纸封面 (600x900 或 512x512)
  bannerUrl?: string; // 宽屏横版剧照/背景图
  platform: GamePlatform; // 主平台
  status: GameStatus; // 想玩 / 在玩 / 通关 / 封盘
  playtimeHours: number; // 游玩时长 (小时)
  rating?: number; // 评分 1~5 星
  clearedDate?: string; // 通关日期 (YYYY.MM.DD)
  comment?: string; // 通关评语 / 心得札记
  tags?: string[]; // 标签 (如 "动作", "开放世界", "独立神作")
  developer?: string; // 开发商 / 发行商
  source: 'steam' | 'itunes' | 'manual';
  externalId?: string; // 关联的外部平台 ID (如 steam appId)
  createdAt: number;
  updatedAt: number;
}

export interface GameSearchResult {
  id: string;
  title: string;
  originalTitle?: string;
  coverUrl?: string;
  bannerUrl?: string;
  platform: GamePlatform;
  source: 'steam' | 'itunes';
  releaseYear?: number;
  developer?: string;
  genre?: string;
}

export interface GameStats {
  totalCount: number;
  playingCount: number;
  clearedCount: number;
  wishlistCount: number;
  droppedCount: number;
  totalPlaytimeHours: number;
}

export const PLATFORM_NAMES: Record<GamePlatform, string> = {
  steam: 'Steam',
  switch: 'Switch',
  playstation: 'PlayStation',
  xbox: 'Xbox',
  mobile: '手游',
  pc: 'PC 单机',
};

export const STATUS_NAMES: Record<GameStatus, string> = {
  wishlist: '想玩',
  playing: '在玩',
  cleared: '通关',
  dropped: '封盘',
};
