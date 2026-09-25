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

export const DEFAULT_ACHIEVEMENTS: RPGAchievement[] = [
  // 1. 固件升级 (学习 / 专注 / 多巴胺脱瘾)
  {
    id: 'ach_first_focus',
    title: '新手教程通关',
    tier: 1,
    category: 'firmware',
    statLabel: '首次 专注',
    desc: '成功抵抗多巴胺闲散流，首次脱机运转25分钟',
    iconType: 'atk',
    badgeEmoji: '👑',
    unlocked: false,
    claimed: false,
    coinReward: 100,
  },
  {
    id: 'ach_firmware_1',
    title: '多巴胺脱瘾',
    tier: 1,
    category: 'firmware',
    statLabel: '专注 90分',
    desc: '单次深度专注超过90分钟，重获大脑注意力主权',
    iconType: 'atk',
    badgeEmoji: '⚡',
    unlocked: false,
    claimed: false,
    coinReward: 120,
  },
  {
    id: 'ach_firmware_2',
    title: '固件版本更新',
    tier: 2,
    category: 'firmware',
    statLabel: '阅读 5本',
    desc: '完成5本专业与兴趣读物，下载高阶文明拓展包',
    iconType: 'book',
    badgeEmoji: '📖',
    unlocked: false,
    isDerived: true,
    prerequisiteTitle: '新手教程通关',
    coinReward: 150,
  },

  // 2. 肉身维护 (生活保养 / 健身运动 / 睡眠作息)
  {
    id: 'ach_body_1',
    title: '机体尚未生锈',
    tier: 1,
    category: 'body',
    statLabel: '步数 万步',
    desc: '巡城任务完成，碳基骨骼运转正常',
    iconType: 'heal',
    badgeEmoji: '🏃',
    unlocked: false,
    claimed: false,
    coinReward: 80,
  },
  {
    id: 'ach_body_2',
    title: '防沉迷断电',
    tier: 1,
    category: 'body',
    statLabel: '早起 7天',
    desc: '与地球自转保持最高同步率，连续早起自检打卡',
    iconType: 'hp',
    badgeEmoji: '🌅',
    unlocked: false,
    claimed: false,
    coinReward: 110,
  },

  // 3. NPC出没 (社交 / 现实互动 / 羁绊)
  {
    id: 'ach_npc_1',
    title: '偶遇野生搭子',
    tier: 1,
    category: 'npc',
    statLabel: '好友 1位',
    desc: '解锁全新NPC交互语音与支线，建立现实联系',
    iconType: 'star',
    badgeEmoji: '👥',
    unlocked: false,
    claimed: false,
    coinReward: 100,
  },

  // 4. 路在何方 (人生主线重大抉择)
  {
    id: 'ach_pathway_1',
    title: '新手村毕业',
    tier: 1,
    category: 'pathway',
    statLabel: '人生 进阶',
    desc: '完成学业毕业或第一份工，进入无保护开放大世界',
    iconType: 'crit',
    badgeEmoji: '🧭',
    unlocked: false,
    claimed: false,
    coinReward: 200,
  },
  {
    id: 'ach_pathway_2',
    title: '转职任务达成',
    tier: 2,
    category: 'pathway',
    statLabel: '转职 跨越',
    desc: '成功跨行或入职新岗位，切换全新职业技能树',
    iconType: 'crit',
    badgeEmoji: '🚀',
    unlocked: false,
    isDerived: true,
    prerequisiteTitle: '新手村毕业',
    coinReward: 300,
  },

  // 5. 并非定局 (重大挫折逆风重生)
  {
    id: 'ach_resilience_1',
    title: '血条清空未死',
    tier: 1,
    category: 'resilience',
    statLabel: '逆风 坚持',
    desc: '这局虽然被暴击，但我还没退出游戏',
    iconType: 'hp',
    badgeEmoji: '❤️',
    unlocked: false,
    claimed: false,
    coinReward: 200,
  },
  {
    id: 'ach_resilience_2',
    title: '删档重练协议',
    tier: 2,
    category: 'resilience',
    statLabel: '重开 启航',
    desc: '告别错的人或项目从头再来，旧经验已刻入灵魂',
    iconType: 'heal',
    badgeEmoji: '🔥',
    unlocked: false,
    isDerived: true,
    prerequisiteTitle: '血条清空未死',
    coinReward: 350,
  },

  // 6. 隐藏彩蛋 (沙盒奇遇)
  {
    id: 'ach_easter_1',
    title: '凌晨白日梦',
    tier: 1,
    category: 'easter_egg',
    statLabel: '静止 沉思',
    desc: '在地球服务器沉睡时仰望星空，触发隐藏彩蛋',
    iconType: 'star',
    badgeEmoji: '✨',
    unlocked: false,
    claimed: false,
    coinReward: 188,
  },
];
