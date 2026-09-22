/**
 * RPG 成就数据类型定义
 */
export interface RPGAchievement {
  id: string;
  title: string; // <= 5 字，如：自律达人、心流极境
  tier: number; // 阶级，如 1, 2, 3
  category: 'focus' | 'fitness' | 'study' | 'habit' | 'social';
  statLabel: string; // 如：专注 100、早起 7天
  desc: string; // 简要描述
  iconType: 'atk' | 'hp' | 'heal' | 'crit' | 'star' | 'book';
  unlocked: boolean;
  claimed?: boolean;
  isDerived?: boolean; // 是否为未来衍生成就
  prerequisiteTitle?: string; // 前置成就名称 (<= 5 字)
  coinReward: number; // 金币奖励
}

export const DEFAULT_ACHIEVEMENTS: RPGAchievement[] = [
  {
    id: 'ach_focus_1',
    title: '心流极境',
    tier: 1,
    category: 'focus',
    statLabel: '专注 90分',
    desc: '单次专注时长超过90分钟',
    iconType: 'atk',
    unlocked: true,
    claimed: true,
    coinReward: 100,
  },
  {
    id: 'ach_habit_1',
    title: '晨曦行者',
    tier: 1,
    category: 'habit',
    statLabel: '早起 7天',
    desc: '连续一周早起打卡成功',
    iconType: 'hp',
    unlocked: true,
    claimed: false,
    coinReward: 110,
  },
  {
    id: 'ach_fitness_1',
    title: '神行百里',
    tier: 1,
    category: 'fitness',
    statLabel: '步数 万步',
    desc: '单日行走步数达成一万步',
    iconType: 'heal',
    unlocked: false,
    claimed: false,
    coinReward: 70,
  },
  {
    id: 'ach_study_1',
    title: '博览群书',
    tier: 1,
    category: 'study',
    statLabel: '阅读 5本',
    desc: '完成5本专业与兴趣读物',
    iconType: 'crit',
    unlocked: false,
    claimed: false,
    coinReward: 150,
  },
  // ================= 未来可能解锁的衍生成就 =================
  {
    id: 'ach_focus_2',
    title: '心流宗师',
    tier: 2,
    category: 'focus',
    statLabel: '专注 300分',
    desc: '累积达到五小时深度心流',
    iconType: 'atk',
    unlocked: false,
    isDerived: true,
    prerequisiteTitle: '心流极境',
    coinReward: 300,
  },
  {
    id: 'ach_habit_2',
    title: '不朽晨曦',
    tier: 2,
    category: 'habit',
    statLabel: '早起 30天',
    desc: '整月早睡早起完美自律',
    iconType: 'hp',
    unlocked: false,
    isDerived: true,
    prerequisiteTitle: '晨曦行者',
    coinReward: 400,
  },
  {
    id: 'ach_fitness_2',
    title: '铁人体魄',
    tier: 2,
    category: 'fitness',
    statLabel: '力训 20次',
    desc: '力量与体能深度蜕变',
    iconType: 'heal',
    unlocked: false,
    isDerived: true,
    prerequisiteTitle: '神行百里',
    coinReward: 500,
  },
  {
    id: 'ach_social_1',
    title: '羁绊共鸣',
    tier: 1,
    category: 'social',
    statLabel: '亲友 5位',
    desc: '建立五条高亲密亲缘线',
    iconType: 'star',
    unlocked: false,
    isDerived: true,
    prerequisiteTitle: '初识新友',
    coinReward: 250,
  },
];
