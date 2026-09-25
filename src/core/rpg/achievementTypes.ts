/**
 * RPG 成就数据类型定义（地球 Online 风格）
 */
export type AchievementCategoryKey =
  | 'firmware'
  | 'body'
  | 'npc'
  | 'pathway'
  | 'resilience'
  | 'easter_egg';

export interface CategoryMeta {
  key: AchievementCategoryKey;
  label: string;
  icon: string;
  color: string;
  bg: string;
  desc: string;
}

export const ACHIEVEMENT_CATEGORIES: CategoryMeta[] = [
  { key: 'firmware', label: '固件升级', icon: '⚡', color: '#15803D', bg: '#DCFCE7', desc: '脑力与认知升级' },
  { key: 'body', label: '肉身维护', icon: '🛡️', color: '#C2410C', bg: '#FFEDD5', desc: '碳基机体硬件保养' },
  { key: 'npc', label: 'NPC出没', icon: '👥', color: '#0369A1', bg: '#E0F2FE', desc: '现实世界人际与羁绊' },
  { key: 'pathway', label: '路在何方', icon: '🧭', color: '#854D0E', bg: '#FEF9C3', desc: '人生主线重大抉择' },
  { key: 'resilience', label: '并非定局', icon: '❤️', color: '#B91C1C', bg: '#FEE2E2', desc: '重大挫折逆风重生' },
  { key: 'easter_egg', label: '隐藏彩蛋', icon: '✨', color: '#6D28D9', bg: '#EDE9FE', desc: '偶发奇遇与未知惊喜' },
];

export const ACHIEVEMENT_CATEGORY_MAP: Record<AchievementCategoryKey, CategoryMeta> = {
  firmware: ACHIEVEMENT_CATEGORIES[0],
  body: ACHIEVEMENT_CATEGORIES[1],
  npc: ACHIEVEMENT_CATEGORIES[2],
  pathway: ACHIEVEMENT_CATEGORIES[3],
  resilience: ACHIEVEMENT_CATEGORIES[4],
  easter_egg: ACHIEVEMENT_CATEGORIES[5],
};

export interface RPGAchievement {
  id: string;
  title: string; // <= 5 字，如：新手教程通关、血条清空未死
  category: AchievementCategoryKey | string;
  statLabel: string; // 如：首次 专注、早起 7天
  desc: string; // 简要描述
  iconType: 'atk' | 'hp' | 'heal' | 'crit' | 'star' | 'book';
  badgeEmoji?: string; // 气泡徽章图腾（如 👑、⚡、🛡️、👥、🧭、❤️、✨）
  unlocked: boolean;
  claimed?: boolean;
  isDerived?: boolean; // 是否为未来衍生成就
  prerequisiteTitle?: string; // 前置成就名称 (<= 5 字)
  tier?: number; // 已废弃：成就严禁与等级挂钩
  coinReward?: number; // 奖励目前待定
}

export { DEFAULT_ACHIEVEMENTS } from './defaultAchievements';

