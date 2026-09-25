import { RPGAchievement, DEFAULT_ACHIEVEMENTS } from './achievementTypes';

const STORAGE_KEY = 'cloudfly_user_achievements_v2';
const LEGACY_STORAGE_KEY = 'cloudfly_user_achievements_v1';

const LEGACY_PRESET_IDS = new Set([
  'ach_first_focus',
  'ach_firmware_1',
  'ach_firmware_2',
  'ach_body_1',
  'ach_body_2',
  'ach_npc_1',
  'ach_pathway_1',
  'ach_pathway_2',
  'ach_resilience_1',
  'ach_resilience_2',
  'ach_easter_1',
]);

export function loadAchievements(): RPGAchievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 合并新预设成就
        const existingIds = new Set(parsed.map((a: RPGAchievement) => a.id));
        const merged = [...parsed];
        for (const def of DEFAULT_ACHIEVEMENTS) {
          if (!existingIds.has(def.id)) {
            merged.push(def);
          }
        }
        return merged;
      }
    }

    // 检查是否存在 v1 旧数据迁移
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        // 提取用户自定义创建的成就 (非旧版11个预设)
        const customUserAchievements = legacyParsed.filter(
          (item: RPGAchievement) => !LEGACY_PRESET_IDS.has(item.id)
        );

        // 如果旧版解锁了新手专注，迁移解锁第一条成就
        const hadFirstFocusUnlocked = legacyParsed.some(
          (item: RPGAchievement) => item.id === 'ach_first_focus' && item.unlocked
        );

        const initialList = DEFAULT_ACHIEVEMENTS.map((item) => {
          if (item.id === 'ach_firmware_1' && hadFirstFocusUnlocked) {
            return { ...item, unlocked: true };
          }
          return item;
        });

        const merged = [...initialList, ...customUserAchievements];
        saveAchievements(merged);
        return merged;
      }
    }
  } catch (err) {
    console.error('Failed to load achievements from storage:', err);
  }
  return DEFAULT_ACHIEVEMENTS;
}

export function saveAchievements(achievements: RPGAchievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  } catch (err) {
    console.error('Failed to save achievements to storage:', err);
  }
}

/**
 * 解锁指定成就并派发实时事件
 */
export function unlockAchievementById(id: string): RPGAchievement | null {
  // 兼容旧调用 ID
  const effectiveId = id === 'ach_first_focus' ? 'ach_firmware_1' : id;
  const list = loadAchievements();
  let target: RPGAchievement | null = null;
  const updated = list.map((item) => {
    if (item.id === effectiveId) {
      target = { ...item, unlocked: true };
      return target;
    }
    return item;
  });

  if (target) {
    saveAchievements(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('rpg_achievement_unlocked', { detail: target })
      );
    }
  }
  return target;
}


/**
 * 检查指定成就是否已解锁
 */
export function isAchievementUnlocked(id: string): boolean {
  const list = loadAchievements();
  return list.some((item) => item.id === id && item.unlocked);
}

const SHOWCASE_STORAGE_KEY = 'cloudfly_showcase_badge_ids_v1';
export const SHOWCASE_SLOTS_COUNT = 6;

/**
 * 读取用户自选的 6 个荣誉展位成就 ID (null 表示留空展位)
 */
export function loadShowcaseBadges(): (string | null)[] {
  try {
    const raw = localStorage.getItem(SHOWCASE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const res: (string | null)[] = [];
        for (let i = 0; i < SHOWCASE_SLOTS_COUNT; i++) {
          res.push(typeof parsed[i] === 'string' ? parsed[i] : null);
        }
        return res;
      }
    }
  } catch (err) {
    console.error('Failed to load showcase badges:', err);
  }

  // 默认装配策略：初次进入自动装配前几个已解锁成就，其余展位虚位以待
  const achievements = loadAchievements();
  const unlocked = achievements.filter((a) => a.unlocked).map((a) => a.id);
  const initial: (string | null)[] = [];
  for (let i = 0; i < SHOWCASE_SLOTS_COUNT; i++) {
    initial.push(unlocked[i] || null);
  }
  return initial;
}

/**
 * 保存 6 个荣誉展位配置
 */
export function saveShowcaseBadges(slotBadgeIds: (string | null)[]): void {
  try {
    localStorage.setItem(
      SHOWCASE_STORAGE_KEY,
      JSON.stringify(slotBadgeIds.slice(0, SHOWCASE_SLOTS_COUNT))
    );
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cloudfly_showcase_badges_changed'));
    }
  } catch (err) {
    console.error('Failed to save showcase badges:', err);
  }
}

