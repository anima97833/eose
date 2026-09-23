import { db, RPGActivityBannerRecord } from '../storage/db';

export interface ActivityBannerItem {
  id: string;
  title: string;
  subtitle: string;
  themeColor: string; // 默认卡片底色主题 (red | yellow | green | purple)
  customBgUrl: string | null;
  tagText?: string;
}

export const DEFAULT_ACTIVITY_BANNERS: ActivityBannerItem[] = [
  {
    id: 'signin_7d',
    title: '七日签到',
    subtitle: '萌宠每日相伴 · 累积登录领好礼',
    themeColor: 'coral',
    customBgUrl: null,
    tagText: '每日更新',
  },
  {
    id: 'extreme_challenge',
    title: '极限挑战',
    subtitle: '突破体能与思维极限 · 冲刺高额经验',
    themeColor: 'amber',
    customBgUrl: null,
    tagText: '限时挑战',
  },
  {
    id: 'activity_1',
    title: '活动一',
    subtitle: '春日野营特训 · 探索未知营地',
    themeColor: 'emerald',
    customBgUrl: null,
    tagText: '进行中',
  },
  {
    id: 'activity_2',
    title: '活动二',
    subtitle: '神秘工坊集市 · 隐藏宝藏掉落',
    themeColor: 'violet',
    customBgUrl: null,
    tagText: '筹备中',
  },
];

/**
 * 获取所有活动横幅（优先使用 IndexedDB 中的自定义配置与背景）
 */
export async function getAllActivityBanners(): Promise<ActivityBannerItem[]> {
  try {
    const records = await db.rpg_activity_banners.toArray();
    const map = new Map<string, RPGActivityBannerRecord>();
    for (const r of records) {
      map.set(r.id, r);
    }

    return DEFAULT_ACTIVITY_BANNERS.map((def) => {
      const saved = map.get(def.id);
      if (saved) {
        return {
          ...def,
          title: saved.title || def.title,
          subtitle: saved.subtitle || def.subtitle,
          themeColor: saved.themeColor || def.themeColor,
          customBgUrl: saved.customBgUrl,
        };
      }
      return def;
    });
  } catch (err) {
    console.error('Failed to load activity banners from IndexedDB:', err);
    return DEFAULT_ACTIVITY_BANNERS;
  }
}

/**
 * 保存单个活动横幅的自定义背景图片及信息到 IndexedDB
 */
export async function saveActivityBanner(item: Partial<RPGActivityBannerRecord> & { id: string }): Promise<void> {
  try {
    const existing = await db.rpg_activity_banners.get(item.id);
    const def = DEFAULT_ACTIVITY_BANNERS.find((b) => b.id === item.id);
    await db.rpg_activity_banners.put({
      id: item.id,
      title: item.title ?? existing?.title ?? def?.title ?? '',
      subtitle: item.subtitle ?? existing?.subtitle ?? def?.subtitle,
      themeColor: item.themeColor ?? existing?.themeColor ?? def?.themeColor,
      customBgUrl: item.customBgUrl !== undefined ? item.customBgUrl : (existing?.customBgUrl ?? null),
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save activity banner to IndexedDB:', err);
  }
}

/**
 * 清除单个活动横幅的自定义背景，恢复默认
 */
export async function resetActivityBannerBg(id: string): Promise<void> {
  try {
    const existing = await db.rpg_activity_banners.get(id);
    if (existing) {
      await db.rpg_activity_banners.update(id, {
        customBgUrl: null,
        updatedAt: Date.now(),
      });
    }
  } catch (err) {
    console.error('Failed to reset activity banner in IndexedDB:', err);
  }
}
