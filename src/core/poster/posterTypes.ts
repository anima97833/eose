export type PosterCategory = 'romance' | 'event' | 'schedule' | 'custom';

export type PosterRepeatMode = 'none' | 'weekly' | 'monthly' | 'yearly';

export type PosterStampType = 'achieved' | 'expired' | 'celebrated';

export type PosterTemplateId = 
  | 'polaroid_love'       // 浪漫拍立得（相恋纪念日、伴侣生日、情书）
  | 'supermarket_sale'    // 超市生鲜特惠（醒目黄黑/红黄、打折券剪角风）
  | 'vintage_ticket'      // 复古展演门票（音乐节、电影票根、展览）
  | 'minimal_memo';       // 极简拟物黑板/便签（考试打卡、目标冲刺）

export interface PosterBackMemoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface PosterRecord {
  id: string;
  title: string;
  category: PosterCategory;
  subtitle?: string;
  description?: string;
  
  // 图片或免图模板
  imageUrl?: string | null;
  templateId?: PosterTemplateId;
  templateTheme?: string; // 主题配色如 'warm_wood' | 'sunset' | 'cherry' | 'fresh_lemon' | 'deep_navy'
  tagText?: string;       // 角标，例如 "50% OFF"、"❤️ 365 DAYS"、"会员日"

  // 日期与周期
  startDate: string;      // 格式：YYYY-MM-DD
  endDate: string;        // 格式：YYYY-MM-DD
  repeatMode: PosterRepeatMode; // 'none' | 'weekly' | 'monthly' | 'yearly'
  repeatDaysOfWeek?: number[];  // 周循环选中的星期：0=周日, 1=周一, 2=周二, 3=周三, 4=周四, 5=周五, 6=周六

  // 背面便签与备忘清单（支持轻拟物 3D 翻转）
  backNote?: string;
  backItems?: PosterBackMemoItem[];

  // 状态与生命周期
  isArchived?: boolean;
  archivedAt?: number;
  stamp?: PosterStampType | null;

  createdAt: number;
  updatedAt: number;
}
