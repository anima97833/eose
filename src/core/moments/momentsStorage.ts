import { db } from '../storage/db';
import { MomentItem, MomentsConfig, MomentAttributeTag } from './momentsTypes';
import { loadRPGProfile, saveRPGProfile, computeAttributeMax } from '../rpg/rpgStorage';

const MOMENTS_FALLBACK_KEY = 'cloudfly_moments_items_v1';
const BANNER_FALLBACK_KEY = 'cloudfly_moments_banner_v1';
const CUSTOM_THEMES_KEY = 'cloudfly_custom_moment_themes_v1';

export const PRESET_THEMES = [
  '今日碎碎念',
  '晨间随想',
  '生活瞬间',
  '灵感火花',
  '深夜低语',
];

export const MOMENT_ATTR_INFO: Record<
  MomentAttributeTag,
  { name: string; short: string; icon: string; color: string; bg: string; border: string; glow: string }
> = {
  SPI: { name: '精神', short: 'SPI', icon: '🔮', color: '#7C3AED', bg: '#F5F3FF', border: '#A78BFA', glow: 'rgba(124, 58, 237, 0.25)' },
  CHA: { name: '魅力', short: 'CHA', icon: '✨', color: '#DB2777', bg: '#FDF2F8', border: '#F472B6', glow: 'rgba(219, 39, 119, 0.25)' },
  INT: { name: '智力', short: 'INT', icon: '🧪', color: '#2563EB', bg: '#EFF6FF', border: '#60A5FA', glow: 'rgba(37, 99, 235, 0.25)' },
  CON: { name: '体质', short: 'CON', icon: '🛡️', color: '#059669', bg: '#ECFDF5', border: '#34D399', glow: 'rgba(5, 150, 105, 0.25)' },
  DEX: { name: '敏捷', short: 'DEX', icon: '⚡', color: '#D97706', bg: '#FFFBEB', border: '#FBBF24', glow: 'rgba(217, 119, 6, 0.25)' },
  STR: { name: '力量', short: 'STR', icon: '🥊', color: '#D9483B', bg: '#FEF2F2', border: '#F87171', glow: 'rgba(217, 72, 59, 0.25)' },
};

// 预设初始碎碎念动态，深度对齐原画童话治愈画风与六维属性
export const DEFAULT_MOMENTS: MomentItem[] = [
  {
    id: 'moment_default_1',
    themeTitle: '今日碎碎念',
    content: '在秘密花园收集到了第一颗粉色彩虹糖果，微风轻拂草坪，连空气都是甜甜的草莓味呢！🍓',
    images: [],
    attributeTag: 'CHA',
    attributeGain: 2,
    rewardCoins: 50,
    isStarred: true,
    createdAt: Date.now() - 3600000 * 2,
    dateStr: '2026.09.22',
  },
  {
    id: 'moment_default_2',
    themeTitle: '晨间随笔',
    content: '清晨早起呼吸新鲜空气，把昨日的烦恼全抛在脑后，今天也是元气满满的冒险家！☀️🌱',
    images: [],
    attributeTag: 'CON',
    attributeGain: 2,
    rewardCoins: 50,
    isStarred: false,
    createdAt: Date.now() - 3600000 * 18,
    dateStr: '2026.09.21',
  },
  {
    id: 'moment_default_3',
    themeTitle: '午后闲记',
    content: '和小伙伴们坐在大树荫下看白云飘过，树叶沙沙作响，这样惬意慢节奏的生活太治愈啦～🌈',
    images: [],
    attributeTag: 'SPI',
    attributeGain: 2,
    rewardCoins: 50,
    isStarred: true,
    createdAt: Date.now() - 3600000 * 42,
    dateStr: '2026.09.20',
  },
];

let customThemesCache: string[] | null = null;

/**
 * 获取自定义木标列表 (从 IndexedDB 内存缓存优先读取)
 */
export function getCustomThemes(): string[] {
  if (customThemesCache !== null) return customThemesCache;
  if (typeof window === 'undefined') return [];

  // 1. 先检查 LocalStorage 遗留数据 (触发一键迁移)
  try {
    const raw = localStorage.getItem(CUSTOM_THEMES_KEY) || localStorage.getItem('cloudfly_moments_custom_themes_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        customThemesCache = parsed;
        db.settings.put({ key: 'cloudfly_moments_custom_themes_v1', data: parsed }).catch(console.warn);
        localStorage.removeItem(CUSTOM_THEMES_KEY);
        localStorage.removeItem('cloudfly_moments_custom_themes_v1');
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // 2. 异步从 IndexedDB 加载
  db.settings.get('cloudfly_moments_custom_themes_v1').then((item) => {
    if (item && Array.isArray(item.data)) {
      customThemesCache = item.data as string[];
    }
  }).catch(console.warn);

  customThemesCache = [];
  return customThemesCache;
}

/**
 * 保存自定义木标 (持久化至 IndexedDB 并清理 LocalStorage)
 */
export function saveCustomTheme(theme: string): string[] {
  const trimmed = theme.trim().replace(/^#+|#+$/g, '');
  if (!trimmed) return getCustomThemes();
  const current = getCustomThemes();
  if (!current.includes(trimmed) && !PRESET_THEMES.includes(trimmed)) {
    const next = [...current, trimmed];
    customThemesCache = next;
    db.settings.put({ key: 'cloudfly_moments_custom_themes_v1', data: next }).catch(console.warn);
    localStorage.removeItem(CUSTOM_THEMES_KEY);
    localStorage.removeItem('cloudfly_moments_custom_themes_v1');
    return next;
  }
  return current;
}

/**
 * 删除自定义木标 (同步至 IndexedDB)
 */
export function deleteCustomTheme(theme: string): string[] {
  const current = getCustomThemes();
  const next = current.filter((t) => t !== theme);
  customThemesCache = next;
  db.settings.put({ key: 'cloudfly_moments_custom_themes_v1', data: next }).catch(console.warn);
  localStorage.removeItem(CUSTOM_THEMES_KEY);
  localStorage.removeItem('cloudfly_moments_custom_themes_v1');
  return next;
}

/**
 * 成功发布碎碎念时的 RPG 属性联动：
 * 获得对应六维属性 +2 点 (最高不超过当前等级上限)
 */
export function rewardMomentPublishToRPG(attrTag: MomentAttributeTag): {
  attrKey: string;
  attrName: string;
  attrGain: number;
  message: string;
} {
  const info = MOMENT_ATTR_INFO[attrTag] || MOMENT_ATTR_INFO.SPI;
  try {
    const profile = loadRPGProfile();
    const cap = computeAttributeMax(profile.level);

    const curVal = profile.attributes?.[attrTag]?.value || 0;
    const nextVal = Math.min(cap, curVal + 2);
    const attrGain = nextVal - curVal;

    if (profile.attributes?.[attrTag]) {
      profile.attributes[attrTag].value = nextVal;
    }

    saveRPGProfile(profile);

    return {
      attrKey: attrTag,
      attrName: info.name,
      attrGain,
      message: `${info.name} +${attrGain}`,
    };
  } catch (err) {
    console.warn('[MomentsStorage] RPG reward error:', err);
    return {
      attrKey: attrTag,
      attrName: info.name,
      attrGain: 2,
      message: `${info.name} +2`,
    };
  }
}

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
      // 兼容补全 attributeTag
      for (const m of list) {
        if (!m.attributeTag) {
          m.attributeTag = 'SPI';
          m.attributeGain = 2;
        }
      }
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
  // 1. 降级缓存更新（脱敏大图，防止超出 localStorage 5MB 配额）
  try {
    const current = await loadMomentsFromDB();
    const safeItem: MomentItem = { ...item, images: [] };
    const nextList = [safeItem, ...current.filter((m) => m.id !== item.id).map((m) => ({ ...m, images: [] }))];
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
  // 降级缓存：若为超长 base64，不写入 localStorage，避免配额溢出；仅外部链接写入
  try {
    if (url && !url.startsWith('data:')) {
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
