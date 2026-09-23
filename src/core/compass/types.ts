export type SpotCategory =
  | 'cafe'      // 咖啡馆
  | 'food'      // 美食餐厅
  | 'walk'      // 漫步路线/公园
  | 'secret'    // 秘密回忆/约会地
  | 'work'      // 学习/工作站
  | 'nature'    // 露营/自然风景
  | 'landmark'; // 城市地标

export interface SpotCategoryMeta {
  id: SpotCategory;
  name: string;
  icon: string;
  color: string;
  bgLight: string;
  rpgBonus: string;
}

export const SPOT_CATEGORIES: Record<SpotCategory, SpotCategoryMeta> = {
  cafe: {
    id: 'cafe',
    name: '咖啡手账',
    icon: '☕',
    color: '#935438',
    bgLight: '#fdf6f0',
    rpgBonus: '灵性 +10, 疲劳恢复',
  },
  food: {
    id: 'food',
    name: '美食寻味',
    icon: '🍜',
    color: '#d46b08',
    bgLight: '#fff7e6',
    rpgBonus: '体力 +15, 好心情',
  },
  walk: {
    id: 'walk',
    name: '散步巡游',
    icon: '🌳',
    color: '#389e0d',
    bgLight: '#f6ffed',
    rpgBonus: '耐力 +10, 经验 +80',
  },
  secret: {
    id: 'secret',
    name: '秘密回忆',
    icon: '💖',
    color: '#c41d7f',
    bgLight: '#fff0f6',
    rpgBonus: '羁绊 +15, 隐藏剧情',
  },
  work: {
    id: 'work',
    name: '专注工坊',
    icon: '💼',
    color: '#096dd9',
    bgLight: '#e6f7ff',
    rpgBonus: '智力 +12, 效率提升',
  },
  nature: {
    id: 'nature',
    name: '自然露营',
    icon: '⛺',
    color: '#08979c',
    bgLight: '#e6fffb',
    rpgBonus: '生命上限 +5',
  },
  landmark: {
    id: 'landmark',
    name: '城市地标',
    icon: '🏛️',
    color: '#722ed1',
    bgLight: '#f9f0ff',
    rpgBonus: '全属性 +5, 稀有称号',
  },
};

export interface CheckInSpot {
  id: string;
  name: string;
  category: SpotCategory;
  lat: number;
  lng: number;
  altitude?: number;
  address?: string;
  note?: string;
  photos: string[];
  checkInCount: number;
  level: number; // 1 ~ 5
  levelTitle: string;
  createdAt: number;
  lastCheckInAt: number;
  customDate?: string; // 自定义打卡日期 (YYYY-MM-DD)
  customTime?: string; // 自定义打卡时间 (HH:mm)
  companions?: string; // 随行人员 (如: "独自一人", "和伴侣", "朋友同行")
  companionComment?: string;
}

export interface DiscoveredArea {
  id: string;
  lat: number;
  lng: number;
  radius: number; // 探索半径（米）
  discoveredAt: number;
}

export interface TrailPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number;
}

export interface WalkTrail {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
  points: TrailPoint[];
  distanceMeters: number;
  durationSeconds: number;
  isActive: boolean;
}

export interface CompassState {
  heading: number; // 0 ~ 360 度的指向
  accuracy: number | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  speed: number | null;
  isWatchingLocation: boolean;
  permissionGranted: boolean | null;
  errorMsg: string | null;
}

export interface ExplorationStats {
  totalDistanceMeters: number;
  totalSpotsCount: number;
  unlockedAreasCount: number;
  secretBasesCount: number;
  walksCount: number;
}
