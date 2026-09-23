export interface RPGAttribute {
  key: 'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA';
  name: string; // 如：力量
  shortName: string; // STR
  value: number; // 当前数值
  maxValue: number; // 上限
  focus: string; // 现实对应侧重点，如：体能爆发
  level: number;
  iconUrl?: string; // 用户上传或绑定的自定义图标
}

export interface RPGSkillNode {
  id: string;
  name: string; // <=5字，如：全栈入门
  branch: 'INT' | 'STR' | 'DEX' | 'SPI' | 'CON' | 'CHA';
  level: number;
  unlocked: boolean;
  desc: string; // 简短描述
  effect: string; // 如：敏捷+2
  imageUrl?: string; // 用户上传或绑定的自定义大图
}

export interface RPGDebuff {
  id: string;
  name: string; // <=5字，如：感冒
  type: 'debuff' | 'buff';
  effectText: string; // 如：全属性-10%
  active: boolean;
}

export interface RPGItem {
  id: string;
  name: string; // 如：降噪耳机
  type: 'gear' | 'consumable' | 'wish';
  slot?: 'head' | 'body' | 'wrist' | 'tool';
  icon: string;
  effect: string; // 如：专注+5 或 奖励寄语
  equipped?: boolean;
  count?: number;
  imageUrl?: string; // 用户上传至 IndexedDB 的图片或外部 URL
  // 心愿专属字段
  wishVouchersCost?: number; // 所需心愿券数目 (用户自拟，如 15)
  lockedUntil?: number;      // 7天冷静期截止时间戳
  wishNote?: string;         // 寄语 / 理由
  isAchieved?: boolean;      // 是否已兑换圆满
  achievedAt?: number;
}

export interface RPGClass {
  id: string;
  title: string; // <=5字，如：法师
  job: string; // 职业名称：程序员/架构师
  mainAttr: string; // INT
  desc: string;
  salary?: string; // 期望薪资：如 25K-35K
  location?: string; // 期望工作地：如 上海·徐汇
  imageUrl?: string; // 用户上传图片
  icon?: string; // 预设 Emoji，如 🎃
}

export interface ProfileStoryPage {
  id: string;
  pageIndex: number;
  date: string;
  content: string;
  updatedAt: number;
}

export interface RPGSignInState {
  currentRound: number; // 轮次，从 1 开始
  currentDayIndex: number; // 当前待签到或进行到的天数 1 ~ 7
  lastSignInDate: string | null; // 上次签到日期 (YYYY-MM-DD 北京时间)
  diamondShards: number; // 当前持有的钻石碎片数量 (0 ~ 19)
  claimedDays: number[]; // 当前轮次已领取的日期列表 [1, 2, ...]
}

export interface RPGProfile {
  name: string;
  title: string;
  level: number;
  currentExp: number;
  maxExp: number;
  hp: number; // 体力值 0-100
  maxHp: number;
  mp: number; // 精力值 0-100
  maxMp: number;
  gold: number;
  crystals: number;
  wishVouchers?: number; // 仙女棒心愿券数量
  mood?: number; // 心情数值，对齐用户参考图 (每天北京时间初始重置为 100)
  zodiac?: string; // 星座 (如: 天秤座)
  mbti?: string; // MBTI (如: INFP)
  gender?: string; // 性别 (如: 女生 / 男生 / 保密)
  storyPages?: ProfileStoryPage[]; // 多页故事手账活页本
  albumPhotos?: string[]; // 个人手账相册照
  currentClassId: string;
  customAvatarUrl: string | null; // 用户上传的立绘图片 Base64 或 URL
  dossierPhotoUrl?: string | null; // 个人档案专属照片 (与主界面立绘完全分离)
  customBgUrl: string | null;
  lastActiveDate?: string;
  lastMoodResetDate?: string;
  attributes: Record<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA', RPGAttribute>;
  classes: RPGClass[];
  skills: RPGSkillNode[];
  debuffs: RPGDebuff[];
  items: RPGItem[];
  dailyCost?: number; // 每日基础生活成本 (默认 100，用于换算自由天数)
  savingGoalDays?: number; // 自由天数目标 (如 365 天)
  savingGoalNote?: string; // 自由生活目标寄语 / 横幅文案
  isPrivacyHidden?: boolean; // 是否开启资产隐私防窥遮罩
  bgmEnabled?: boolean; // 背景音乐开关
  sfxEnabled?: boolean; // 音效开关
  userId?: string; // 用户识别号 (如 417914)
  signInState?: RPGSignInState; // 七日签到与钻石碎片状态
  extremeChallenge?: ExtremeChallengeRecord; // 极限挑战状态
  pendingDailySettlement?: DailySettlementSnapshot | null; // 待展示领取的昨日修行业报
  dailyHighWaterMark?: {
    dateStr: string;
    attributes: Record<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA', number>;
  }; // 活跃日六维属性安全快照高水位
}

export interface DailySettlementSnapshot {
  dateStr: string; // 结算的日期 (前一天或上一个活跃日)
  attributes: Record<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA', number>;
  totalAttr: number;
  highestAttrKey: 'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA';
  highestAttrVal: number;
  baseExp: number;
  breakthroughBonusRate: number; // 专精突破加成率 (如 0.15 或 0.30)
  harmonyBonusRate: number; // 均衡共鸣加成率 (如 0.20 或 0.40)
  totalExpEarned: number; // 最终结算获得的总 EXP
  rating: 'S' | 'A' | 'B' | 'C'; // 评级
  ratingTitle: string; // 评级称号 (S: 气冲霄汉, A: 精进不休, B: 步履不停, C: 休养生息)
  diamondReward?: number; // 额外完整钻石奖励
  shardReward?: number; // 额外钻石碎片奖励
  wishVoucherReward?: number; // 升级获得的许愿券奖励
  oldLevel: number;
  oldExp: number;
  newLevel: number;
  newExp: number;
  maxExp: number;
  leveledUp: boolean;
  levelUpCount: number;
}

export type ExtremeChallengeType = 'early_bird' | 'early_sleep' | 'workout' | 'fruits';

export interface ExtremeProjectProgress {
  currentDayIndex: number; // 当前天数 1 ~ 7
  lastCheckInDate: string | null; // 上次打卡日期 (YYYY-MM-DD 北京时间)
  claimedDays: number[]; // 当前项目已打卡的天数 [1, 2, ...]
  isCompleted: boolean; // 是否已完成当前7天
}

export interface ExtremeChallengeRecord {
  activeType: ExtremeChallengeType; // 当前选中的挑战项目
  projects?: Record<ExtremeChallengeType, ExtremeProjectProgress>; // 四大赛道各自完全独立的打卡进度
}

