export type MomentAttributeTag = 'SPI' | 'CHA' | 'INT' | 'CON' | 'DEX' | 'STR';

export interface MomentItem {
  id: string;
  themeTitle: string; // 如：今日碎碎念、晨间随想 (<=6字)
  content: string; // 碎碎念正文
  images: string[]; // 用户上传图片列表 Base64，保存在 IndexedDB
  attributeTag?: MomentAttributeTag; // 绑定的六维属性 (SPI/CHA/INT/CON/DEX/STR)
  attributeGain?: number; // 属性提升数值，默认 +2
  rewardCoins?: number; // 伴生金币
  isStarred: boolean; // 是否加入星标 (Collection)
  createdAt: number;
  dateStr: string; // 如 2026.09.22
}

export interface MomentsConfig {
  key: string; // 'config'
  customBannerUrl: string | null; // 用户自定义的朋友圈背景
  updatedAt: number;
}
