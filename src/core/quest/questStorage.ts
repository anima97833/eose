/**
 * 冒险任务手账 (Quest Journal) 存储与业务引擎
 * 专注生活习惯与奇遇探索，不联动 RPG 金币与经验数值
 * 静默联动六维属性（上空飘字无感反馈）
 */

import {
  QuestItem,
  QuestStorageState,
  RPGStatKey,
  AwardedStatResult,
} from './questTypes';
import { loadRPGProfile, saveRPGProfile } from '../rpg/rpgStorage';

const QUEST_STORAGE_KEY = 'cloudfly_quest_journal_v2';
const QUEST_PALETTE_KEY = 'cloudfly_quest_palette_v1';

// 默认 Colormind 柔和协调五色调色盘 (底色、卡片、主强调、文本、辅助点缀)
export const DEFAULT_QUEST_PALETTE = ['#F0FDF4', '#E0F2FE', '#38BDF8', '#334155', '#F59E0B'];

export const STAT_META: Record<RPGStatKey, { name: string; icon: string }> = {
  SPI: { name: '精力', icon: '⚡' },
  INT: { name: '智力', icon: '📚' },
  STR: { name: '力量', icon: '⚔️' },
  DEX: { name: '敏捷', icon: '🏹' },
  CON: { name: '体质', icon: '💪' },
  CHA: { name: '魅力', icon: '✨' },
};

function getTodayString(): string {
  const now = new Date();
  const beijingTime = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
  return beijingTime.toISOString().slice(0, 10);
}

/**
 * 官方预设任务清单（图标与六维 Tag 联动）
 */
export const DEFAULT_PRESET_QUESTS: QuestItem[] = [
  // 1. 主线任务 (生活日常，每日 00:00 自动跨日重置，每项打卡固定精力 +2)
  {
    id: 'main_breakfast',
    category: 'main',
    title: '早饭时刻',
    desc: '吃一顿热气腾腾的早餐，为一天注入饱满能量',
    icon: '🍳',
    tag: '⚡ 精力',
    statKey: 'SPI',
    statGain: { fixed: 2 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
    isDailyRepeatable: true,
  },
  {
    id: 'main_wash',
    category: 'main',
    title: '晨间洗漱与温水',
    desc: '洗漱净面并饮下一杯温水，唤醒沉睡机体',
    icon: '🪥',
    tag: '⚡ 精力',
    statKey: 'SPI',
    statGain: { fixed: 2 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
    isDailyRepeatable: true,
  },
  {
    id: 'main_lunch',
    category: 'main',
    title: '午间适时充能',
    desc: '按时午餐，休息片刻，卸下半日的忙碌疲惫',
    icon: '🍱',
    tag: '⚡ 精力',
    statKey: 'SPI',
    statGain: { fixed: 2 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
    isDailyRepeatable: true,
  },
  {
    id: 'main_dinner',
    category: 'main',
    title: '晚餐与生活歇息',
    desc: '温馨晚宴，犒赏自己一整天以来的专注与辛勤',
    icon: '🍲',
    tag: '⚡ 精力',
    statKey: 'SPI',
    statGain: { fixed: 2 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
    isDailyRepeatable: true,
  },
  {
    id: 'main_dungeon',
    category: 'main',
    title: '通关日常副本',
    desc: '在番茄钟专注一个周期或完成一次心智深度聚焦',
    icon: '⚔️',
    tag: '⚡ 精力',
    statKey: 'SPI',
    statGain: { fixed: 2 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
    isDailyRepeatable: true,
  },

  // 2. 支线任务 (系统与虚拟世界探索，纯打卡，每项打卡固定精力 +10)
  {
    id: 'side_server_stroll',
    category: 'side',
    title: '前往其他服务器漫步',
    desc: '走出舒适区，探索未知的知识或社区新鲜事',
    icon: '🌐',
    tag: '⚡ 精力',
    statKey: 'SPI',
    statGain: { fixed: 10 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
  },
  {
    id: 'side_clean_inventory',
    category: 'side',
    title: '清理角色背包',
    desc: '前往个人中心背包盘点道具装备，告别冗余杂乱',
    icon: '🎒',
    tag: '⚡ 精力',
    statKey: 'SPI',
    statGain: { fixed: 10 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
  },
  {
    id: 'side_chat_player',
    category: 'side',
    title: '与其他玩家/伴侣交流',
    desc: '向身边的朋友或微聊专属伴侣发送一句真心问候',
    icon: '💬',
    tag: '⚡ 精力',
    statKey: 'SPI',
    statGain: { fixed: 10 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
  },

  // 3. 彩蛋任务 (高情绪价值偶然交互，奇遇魅力提升)
  {
    id: 'egg_night_rain',
    category: 'easter_egg',
    title: '【深夜听雨者】',
    desc: '在 23:00 后打开微聊通讯，收到伴侣专属夜安问候。',
    easterEggClue: '夜深人静，当指针越过子夜 23 点，微聊或旋律正在等待一个不眠之人…',
    easterEggCode: 'NIGHT_RAIN',
    icon: '🌙',
    tag: '✨ 奇遇',
    statKey: 'CHA',
    statGain: { fixed: 6 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
  },
  {
    id: 'egg_clock_rift',
    category: 'easter_egg',
    title: '【时空的缝隙】',
    desc: '连续轻击状态栏时间 5 次，掉落开发怀旧碎片。',
    easterEggClue: '时间并非不可动摇，连续轻叩顶部时光之轮，缝隙将悄然裂开…',
    easterEggCode: 'CLOCK_RIFT',
    icon: '🕰️',
    tag: '✨ 奇遇',
    statKey: 'CHA',
    statGain: { fixed: 6 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
  },
  {
    id: 'egg_wind_direction',
    category: 'easter_egg',
    title: '【微风的去向】',
    desc: '在罗盘应用中转动满 360°，收集一缕虚拟世界的诗意清风信件。',
    easterEggClue: '迷失在无垠旷野中？让指针在指尖划过完整的圆环…',
    easterEggCode: 'WIND_DIRECTION',
    icon: '🧭',
    tag: '✨ 奇遇',
    statKey: 'CHA',
    statGain: { fixed: 6 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
  },
  {
    id: 'egg_street_cat',
    category: 'easter_egg',
    title: '【街角的流浪猫】',
    desc: '在朋友圈中连续点赞 3 次动态，偶遇街角猫咪送来神秘谢礼。',
    easterEggClue: '在生活动态的画卷中，为治愈与萌物驻足三次…',
    easterEggCode: 'STREET_CAT',
    icon: '🐱',
    tag: '✨ 奇遇',
    statKey: 'CHA',
    statGain: { fixed: 6 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
  },
  {
    id: 'egg_idle_master',
    category: 'easter_egg',
    title: '【发呆大师】',
    desc: '在小手机主桌面静止沉思 15 秒没有任何触控，触发白日梦冥想。',
    easterEggClue: '最伟大的冒险有时来自纯粹的静止，驻足 15 秒聆听白日梦…',
    easterEggCode: 'IDLE_MASTER',
    icon: '💭',
    tag: '✨ 奇遇',
    statKey: 'CHA',
    statGain: { fixed: 6 },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
  },
];

/**
 * 读取任务手账列表（带跨日每日主线重置检查）
 */
export function loadQuestJournal(): QuestItem[] {
  if (typeof window === 'undefined') return DEFAULT_PRESET_QUESTS;

  const today = getTodayString();
  try {
    const raw = localStorage.getItem(QUEST_STORAGE_KEY);
    if (raw) {
      const state: QuestStorageState = JSON.parse(raw);
      const presetMap = new Map(DEFAULT_PRESET_QUESTS.map((p) => [p.id, p]));

      let items = (state.items || []).map((q) => {
        // 同步补全预设任务的 statKey / statGain / tag
        const preset = presetMap.get(q.id);
        if (preset) {
          return {
            ...q,
            statKey: preset.statKey,
            statGain: preset.statGain,
            tag: preset.tag,
          };
        }
        return q;
      });

      // 确保新增预设不丢失
      const existingIds = new Set(items.map((i) => i.id));
      for (const preset of DEFAULT_PRESET_QUESTS) {
        if (!existingIds.has(preset.id)) {
          items.push({ ...preset });
        }
      }

      // 跨日重置机制：若日期变更，将所有 isDailyRepeatable 的日常任务重置
      if (state.lastResetDate !== today) {
        items = items.map((q) => {
          if (q.isDailyRepeatable) {
            return {
              ...q,
              currentProgress: 0,
              status: 'in_progress' as const,
            };
          }
          return q;
        });

        saveQuestJournal(items, today);
      }

      return items;
    }
  } catch (err) {
    console.warn('Failed to load quest journal, resetting to defaults', err);
  }

  // 首次运行初始化
  saveQuestJournal(DEFAULT_PRESET_QUESTS, today);
  return DEFAULT_PRESET_QUESTS;
}

/**
 * 保存任务手账列表
 */
export function saveQuestJournal(items: QuestItem[], dateStr = getTodayString()): void {
  try {
    const state: QuestStorageState = {
      lastResetDate: dateStr,
      items,
    };
    localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('cloudfly_quests_updated', { detail: items }));
  } catch (err) {
    console.error('Failed to save quest journal', err);
  }
}

/**
 * 手动打卡完成任务（静默提升六维属性，无感上浮飘字）
 */
export function markQuestDone(questId: string): {
  items: QuestItem[];
  awardedStat?: AwardedStatResult;
} {
  const current = loadQuestJournal();
  let awarded: AwardedStatResult | undefined;

  const updated = current.map((q) => {
    if (q.id === questId && q.status === 'in_progress') {
      // 1. 计算本次获得的六维数值
      let gain = 2;
      if (q.statGain?.fixed !== undefined) {
        gain = q.statGain.fixed;
      } else if (q.statGain?.min !== undefined && q.statGain?.max !== undefined) {
        const min = q.statGain.min;
        const max = q.statGain.max;
        gain = Math.floor(Math.random() * (max - min + 1)) + min;
      } else {
        // 自定义默认回退：主线 3~5，支线 5~10
        if (q.category === 'main') {
          gain = Math.floor(Math.random() * 3) + 3; // 3, 4, 5
        } else if (q.category === 'side') {
          gain = Math.floor(Math.random() * 6) + 5; // 5 ~ 10
        }
      }

      const statKey: RPGStatKey = q.statKey || 'SPI';
      const meta = STAT_META[statKey] || { name: '精力', icon: '⚡' };
      awarded = {
        key: statKey,
        name: meta.name,
        icon: meta.icon,
        gain,
      };

      // 2. 静默更新角色六维属性与即时精力
      try {
        const profile = loadRPGProfile();
        if (profile && profile.attributes) {
          if (profile.attributes[statKey]) {
            profile.attributes[statKey].value = (profile.attributes[statKey].value || 0) + gain;
          }
          // 若为精力 (SPI)，同步恢复即时精力池 mp
          if (statKey === 'SPI' && typeof profile.mp === 'number') {
            const maxMp = profile.maxMp || 100;
            profile.mp = Math.min(maxMp, profile.mp + gain);
          }
          saveRPGProfile(profile);
          window.dispatchEvent(new CustomEvent('cloudfly_profile_updated', { detail: profile }));
        }
      } catch (err) {
        console.warn('Failed to silently update RPG stat on quest checkin', err);
      }

      return {
        ...q,
        currentProgress: q.targetProgress,
        status: 'completed' as const,
        completedAt: Date.now(),
      };
    }
    return q;
  });

  saveQuestJournal(updated);
  return { items: updated, awardedStat: awarded };
}

/**
 * 用户自定义添加任务
 */
export function addCustomQuest(
  quest: Omit<QuestItem, 'id' | 'currentProgress' | 'status' | 'isCustom'>
): QuestItem[] {
  const current = loadQuestJournal();
  const newQuest: QuestItem = {
    ...quest,
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    currentProgress: 0,
    status: 'in_progress',
    isCustom: true,
  };
  const updated = [newQuest, ...current];
  saveQuestJournal(updated);
  return updated;
}

/**
 * 删除自定义任务
 */
export function deleteCustomQuest(questId: string): QuestItem[] {
  const current = loadQuestJournal();
  const updated = current.filter((q) => q.id !== questId);
  saveQuestJournal(updated);
  return updated;
}

/**
 * 触发彩蛋任务判定
 */
export function triggerEasterEggByCode(code: string): QuestItem | null {
  const current = loadQuestJournal();
  let unlockedQuest: QuestItem | null = null;

  const updated = current.map((q) => {
    if (q.category === 'easter_egg' && q.easterEggCode === code && q.status === 'in_progress') {
      unlockedQuest = {
        ...q,
        currentProgress: q.targetProgress,
        status: 'completed' as const,
        unlockedAt: Date.now(),
        completedAt: Date.now(),
      };
      return unlockedQuest;
    }
    return q;
  });

  if (unlockedQuest) {
    saveQuestJournal(updated);
    window.dispatchEvent(
      new CustomEvent('cloudfly_easter_egg_unlocked', { detail: unlockedQuest })
    );
  }

  return unlockedQuest;
}

export const triggerEasterEgg = triggerEasterEggByCode;

/**
 * 读取 Colormind 调色盘
 */
export function loadQuestPalette(): string[] {
  if (typeof window === 'undefined') return DEFAULT_QUEST_PALETTE;
  try {
    const raw = localStorage.getItem(QUEST_PALETTE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 5) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load quest palette', err);
  }
  return DEFAULT_QUEST_PALETTE;
}

/**
 * 保存 Colormind 调色盘
 */
export function saveQuestPalette(palette: string[]): void {
  try {
    localStorage.setItem(QUEST_PALETTE_KEY, JSON.stringify(palette));
  } catch (err) {
    console.error('Failed to save quest palette', err);
  }
}
