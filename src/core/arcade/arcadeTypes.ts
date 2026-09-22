export interface SWFGame {
  id: string;
  title: string;
  fileSize: number;
  data: ArrayBuffer; // 存储在 IndexedDB 中的完整 SWF 二进制数据
  coverEmoji?: string; // 卡带封面图标
  color?: string; // 卡带外壳颜色
  createdAt: number;
  lastPlayedAt?: number;
}
