/**
 * 冒险任务手账 (Quest Journal) 数据类型定义
 * 纯粹生活习惯与奇遇探索，不与 RPG 金币/EXP 强制绑定
 * 支持静默六维属性联动与上空飘字反馈
 */

export type QuestCategory = 'main' | 'side' | 'easter_egg';

export type QuestStatus = 'in_progress' | 'completed';

export type RPGStatKey = 'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA';

export interface QuestStatGain {
  fixed?: number;
  min?: number;
  max?: number;
}

export interface QuestItem {
  id: string;
  category: QuestCategory;
  title: string;
  desc: string;
  icon: string; // 物品大图/Emoji（参考“我的-背包”视觉）
  tag?: string; // 六维维度标签（如“🧠 精力”、“📚 智力”、“⚔️ 力量”等）
  statKey?: RPGStatKey; // 联动的六维属性
  statGain?: QuestStatGain; // 属性提升配置
  currentProgress: number;
  targetProgress: number;
  status: QuestStatus;
  isDailyRepeatable?: boolean; // 每日 00:00 自动重置（日常主线）
  isCustom?: boolean; // 用户自定义任务
  routeAppId?: string; // 跳转应用（可选）
  completedAt?: number; // 完成时间戳

  // 彩蛋特有字段
  easterEggClue?: string; // 谜面暗号（未解锁时展示）
  unlockedAt?: number; // 解锁时间戳
  easterEggCode?: string; // 彩蛋唯一标识代码
}

export interface QuestStorageState {
  lastResetDate: string; // YYYY-MM-DD
  items: QuestItem[];
  paletteHexes?: string[]; // 当前手账使用的 Colormind 5 色调色盘
}

export interface AwardedStatResult {
  key: RPGStatKey;
  name: string;
  icon: string;
  gain: number;
}
