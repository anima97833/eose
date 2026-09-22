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
  name: string; // <=5字，如：降噪耳机
  type: 'gear' | 'consumable';
  slot?: 'head' | 'body' | 'wrist' | 'tool';
  icon: string;
  effect: string; // 如：专注+5 或 体力+20
  equipped?: boolean;
  count?: number;
  imageUrl?: string; // 用户上传至 IndexedDB 的图片或外部 URL
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
  mood?: number; // 心情数值，对齐用户参考图 (默认 16)
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
  attributes: Record<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA', RPGAttribute>;
  classes: RPGClass[];
  skills: RPGSkillNode[];
  debuffs: RPGDebuff[];
  items: RPGItem[];
}

