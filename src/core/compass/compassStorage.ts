import { CheckInSpot, DiscoveredArea, WalkTrail, ExplorationStats, SpotCategory, SPOT_CATEGORIES } from './types';
import { calculateDistanceMeters } from './locationService';

const SPOTS_STORAGE_KEY = 'cloudfly_compass_spots_v1';
const FOG_STORAGE_KEY = 'cloudfly_compass_fog_areas_v1';
const TRAILS_STORAGE_KEY = 'cloudfly_compass_trails_v1';
const ACTIVE_TRAIL_KEY = 'cloudfly_compass_active_trail_v1';

// 初始默认打卡点（用户可删除或自由添加）
const DEFAULT_PRESET_SPOTS: CheckInSpot[] = [
  {
    id: 'spot-preset-1',
    name: '梧桐树下的街角咖啡',
    category: 'cafe',
    lat: 31.2215,
    lng: 121.4582,
    altitude: 12,
    address: '徐汇区 · 武康路街角',
    note: '午后阳光刚好透过树叶落在窗台上，焦糖燕麦拿铁香气四溢。',
    photos: [],
    checkInCount: 4,
    level: 3,
    levelTitle: '专属秘密基地',
    createdAt: Date.now() - 86400000 * 3,
    lastCheckInAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'spot-preset-2',
    name: '滨江微风步道',
    category: 'walk',
    lat: 31.2395,
    lng: 121.4988,
    altitude: 8,
    address: '黄浦江畔 · 亲水漫步区',
    note: '江面游轮缓缓开过，江风吹散了一整天的疲倦。',
    photos: [],
    checkInCount: 2,
    level: 2,
    levelTitle: '熟悉街角',
    createdAt: Date.now() - 86400000 * 5,
    lastCheckInAt: Date.now() - 86400000,
  },
];

// 计算据点等级
export function calculateSpotLevel(count: number): { level: number; title: string } {
  if (count >= 15) return { level: 5, title: '永恒地标' };
  if (count >= 7) return { level: 4, title: '黄金秘密基地' };
  if (count >= 4) return { level: 3, title: '专属秘密基地' };
  if (count >= 2) return { level: 2, title: '熟悉街角' };
  return { level: 1, title: '探索道标' };
}

// 获取所有打卡点
export function loadCheckInSpots(): CheckInSpot[] {
  if (typeof window === 'undefined') return DEFAULT_PRESET_SPOTS;
  try {
    const raw = localStorage.getItem(SPOTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(DEFAULT_PRESET_SPOTS));
      return DEFAULT_PRESET_SPOTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRESET_SPOTS;
  }
}

// 保存打卡点列表
export function saveCheckInSpots(spots: CheckInSpot[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(spots));
  window.dispatchEvent(new CustomEvent('cloudfly_compass_spots_updated'));
}

// 添加或再次打卡某点
export function checkInAtLocation(params: {
  name: string;
  category: SpotCategory;
  lat: number;
  lng: number;
  altitude?: number;
  address?: string;
  note?: string;
  photos?: string[];
  customDate?: string;
  customTime?: string;
  companions?: string;
}): { spot: CheckInSpot; isNew: boolean } {
  const spots = loadCheckInSpots();

  // 判断是否靠近现有已有打卡点（50米以内视为同地点再次打卡）
  const existingIndex = spots.findIndex((s) => {
    const dist = calculateDistanceMeters(s.lat, s.lng, params.lat, params.lng);
    return dist <= 60;
  });

  let spot: CheckInSpot;
  let isNew = false;

  if (existingIndex >= 0) {
    const existing = spots[existingIndex];
    const newCount = existing.checkInCount + 1;
    const { level, title } = calculateSpotLevel(newCount);

    spot = {
      ...existing,
      name: params.name || existing.name,
      category: params.category || existing.category,
      note: params.note || existing.note,
      photos: params.photos && params.photos.length > 0 ? [...params.photos, ...existing.photos] : existing.photos,
      customDate: params.customDate || existing.customDate,
      customTime: params.customTime || existing.customTime,
      companions: params.companions || existing.companions,
      checkInCount: newCount,
      level,
      levelTitle: title,
      lastCheckInAt: Date.now(),
    };
    spots[existingIndex] = spot;
  } else {
    isNew = true;
    const { level, title } = calculateSpotLevel(1);
    spot = {
      id: `spot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: params.name || '未知街角坐标',
      category: params.category,
      lat: params.lat,
      lng: params.lng,
      altitude: params.altitude,
      address: params.address,
      note: params.note,
      photos: params.photos || [],
      customDate: params.customDate,
      customTime: params.customTime,
      companions: params.companions,
      checkInCount: 1,
      level,
      levelTitle: title,
      createdAt: Date.now(),
      lastCheckInAt: Date.now(),
    };
    spots.unshift(spot);
  }

  saveCheckInSpots(spots);

  // 驱散周围战争迷雾（半径 300 米）
  unlockFogArea(spot.lat, spot.lng, 300);

  return { spot, isNew };
}

// 删除打卡点
export function deleteCheckInSpot(id: string): void {
  const spots = loadCheckInSpots().filter((s) => s.id !== id);
  saveCheckInSpots(spots);
}

// 获取迷雾点亮区域
export function loadDiscoveredAreas(): DiscoveredArea[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FOG_STORAGE_KEY);
    if (!raw) {
      // 预置默认点亮区域（对应两个预设点周围）
      const initial: DiscoveredArea[] = [
        { id: 'fog-1', lat: 31.2215, lng: 121.4582, radius: 350, discoveredAt: Date.now() },
        { id: 'fog-2', lat: 31.2395, lng: 121.4988, radius: 400, discoveredAt: Date.now() },
      ];
      localStorage.setItem(FOG_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// 解锁/擦除迷雾区域
export function unlockFogArea(lat: number, lng: number, radius = 250): void {
  if (typeof window === 'undefined') return;
  const list = loadDiscoveredAreas();

  // 如果最近 100 米内已有解锁点，避免重复堆叠
  const hasNear = list.some((item) => calculateDistanceMeters(item.lat, item.lng, lat, lng) < 80);
  if (hasNear) return;

  list.push({
    id: `fog-${Date.now()}`,
    lat,
    lng,
    radius,
    discoveredAt: Date.now(),
  });

  // 最多保留 800 个点亮圆
  if (list.length > 800) list.shift();

  localStorage.setItem(FOG_STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('cloudfly_compass_fog_updated'));
}

// 漫步轨迹持久化
export function loadWalkTrails(): WalkTrail[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRAILS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWalkTrails(trails: WalkTrail[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRAILS_STORAGE_KEY, JSON.stringify(trails));
  window.dispatchEvent(new CustomEvent('cloudfly_compass_trails_updated'));
}

// 正在进行的轨迹
export function getActiveTrail(): WalkTrail | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_TRAIL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveTrail(trail: WalkTrail | null): void {
  if (typeof window === 'undefined') return;
  if (!trail) {
    localStorage.removeItem(ACTIVE_TRAIL_KEY);
  } else {
    localStorage.setItem(ACTIVE_TRAIL_KEY, JSON.stringify(trail));
  }
  window.dispatchEvent(new CustomEvent('cloudfly_compass_active_trail_updated'));
}

// 获取探险综合统计指标
export function getExplorationStats(): ExplorationStats {
  const spots = loadCheckInSpots();
  const fog = loadDiscoveredAreas();
  const trails = loadWalkTrails();

  const totalDistance = trails.reduce((acc, t) => acc + t.distanceMeters, 0);
  const secretBases = spots.filter((s) => s.level >= 3).length;

  return {
    totalDistanceMeters: totalDistance,
    totalSpotsCount: spots.length,
    unlockedAreasCount: fog.length,
    secretBasesCount: secretBases,
    walksCount: trails.length,
  };
}
