import { db } from '../storage/db';
import { MomentItem, MomentsConfig } from './momentsTypes';

const MOMENTS_FALLBACK_KEY = 'cloudfly_moments_items_v1';
const BANNER_FALLBACK_KEY = 'cloudfly_moments_banner_v1';

// 预设初始碎碎念动态，深度对齐原画童话治愈画风
export const DEFAULT_MOMENTS: MomentItem[] = [
  {
    id: 'moment_default_1',
    themeTitle: '今日碎碎念',
    content: '在秘密花园收集到了第一颗粉色彩虹糖果，微风轻拂草坪，连空气都是甜甜的草莓味呢！🍓',
    images: [],
    rewardCoins: 5000,
    isStarred: true,
    createdAt: Date.now() - 3600000 * 2,
    dateStr: '2026.09.22',
  },
  {
    id: 'moment_default_2',
    themeTitle: '晨间随笔',
    content: '清晨早起呼吸新鲜空气，把昨日的烦恼全抛在脑后，今天也是元气满满的冒险家！☀️🌱',
    images: [],
    rewardCoins: 5000,
    isStarred: false,
    createdAt: Date.now() - 3600000 * 18,
    dateStr: '2026.09.21',
  },
  {
    id: 'moment_default_3',
    themeTitle: '午后闲记',
    content: '和小伙伴们坐在大树荫下看白云飘过，树叶沙沙作响，这样惬意慢节奏的生活太治愈啦～🌈',
    images: [],
    rewardCoins: 5000,
    isStarred: true,
    createdAt: Date.now() - 3600000 * 42,
    dateStr: '2026.09.20',
  },
];

/**
 * 读取动态列表（IndexedDB + localStorage 降级双重保障）
 */
export async function loadMomentsFromDB(): Promise<MomentItem[]> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const list = await db.moments_items.toArray();
    if (list && list.length > 0) {
      return list.sort((a, b) => b.createdAt - a.createdAt);
    }
    // 首次载入预设
    await db.moments_items.bulkPut(DEFAULT_MOMENTS);
    return DEFAULT_MOMENTS;
  } catch (err) {
    console.warn('[IndexedDB] 读取动态列表异常，尝试降级缓存:', err);
  }

  try {
    const raw = localStorage.getItem(MOMENTS_FALLBACK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Storage] 读取降级动态缓存失败:', e);
  }

  return DEFAULT_MOMENTS;
}

/**
 * 保存或新增单条动态
 */
export async function saveMomentToDB(item: MomentItem): Promise<void> {
  // 1. 降级缓存更新
  try {
    const current = await loadMomentsFromDB();
    const nextList = [item, ...current.filter((m) => m.id !== item.id)];
    localStorage.setItem(MOMENTS_FALLBACK_KEY, JSON.stringify(nextList));
  } catch (e) {
    console.warn('[Storage] 写入动态降级缓存失败:', e);
  }

  // 2. 写入 IndexedDB
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    await db.moments_items.put(item);
  } catch (err) {
    console.warn('[IndexedDB] 写入动态异常:', err);
  }
}

/**
 * 切换动态星标状态
 */
export async function toggleStarMomentInDB(id: string): Promise<boolean> {
  let nextStarred = false;
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const target = await db.moments_items.get(id);
    if (target) {
      nextStarred = !target.isStarred;
      target.isStarred = nextStarred;
      await db.moments_items.put(target);
    }
  } catch (err) {
    console.warn('[IndexedDB] 切换星标状态异常:', err);
  }

  // 保持降级缓存同步
  try {
    const raw = localStorage.getItem(MOMENTS_FALLBACK_KEY);
    if (raw) {
      const list: MomentItem[] = JSON.parse(raw);
      const updated = list.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m));
      localStorage.setItem(MOMENTS_FALLBACK_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('[Storage] 更新星标降级缓存失败:', e);
  }

  return nextStarred;
}

/**
 * 删除动态
 */
export async function deleteMomentFromDB(id: string): Promise<void> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    await db.moments_items.delete(id);
  } catch (err) {
    console.warn('[IndexedDB] 删除动态异常:', err);
  }

  try {
    const raw = localStorage.getItem(MOMENTS_FALLBACK_KEY);
    if (raw) {
      const list: MomentItem[] = JSON.parse(raw);
      const updated = list.filter((m) => m.id !== id);
      localStorage.setItem(MOMENTS_FALLBACK_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('[Storage] 删除降级动态失败:', e);
  }
}

/**
 * 读取朋友圈自定义背景图
 */
export async function loadBannerUrlFromDB(): Promise<string | null> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const config = await db.moments_config.get('config');
    if (config && config.customBannerUrl) {
      return config.customBannerUrl;
    }
  } catch (err) {
    console.warn('[IndexedDB] 读取朋友圈背景图异常:', err);
  }

  try {
    return localStorage.getItem(BANNER_FALLBACK_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * 保存朋友圈自定义背景图
 */
export async function saveBannerUrlToDB(url: string | null): Promise<void> {
  try {
    if (url) {
      localStorage.setItem(BANNER_FALLBACK_KEY, url);
    } else {
      localStorage.removeItem(BANNER_FALLBACK_KEY);
    }
  } catch (e) {
    console.warn('[Storage] 写入背景图降级缓存失败:', e);
  }

  try {
    if (!db.isOpen()) {
      await db.open();
    }
    await db.moments_config.put({
      key: 'config',
      customBannerUrl: url,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('[IndexedDB] 保存朋友圈背景图异常:', err);
  }
}
