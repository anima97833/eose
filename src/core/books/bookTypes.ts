export type ReadingStatus = 'unread' | 'reading' | 'read';

export interface PhysicalBookRecord {
  id: string;              // 唯一 ID（如 "b_9787536692930"）
  isbn: string;            // 13 位 ISBN 码
  title: string;           // 书名
  subtitle?: string;       // 副标题
  author: string;          // 作者 / 译者
  publisher: string;       // 出版社
  pubDate?: string;        // 出版日期
  price?: string;          // 定价（如 "¥45.00"）
  coverUrl?: string;       // 封面图链接
  pageCount: number;       // 总页数
  currentPage: number;     // 已读页数
  status: ReadingStatus;   // 未读 / 在读 / 已读
  rating?: number;         // 评分 (1~5 星)
  physicalLocation: string;// 物理书架位置（如 "客厅书柜A1"、"卧室床头柜"）
  category: string;        // 类别标签（如 "科幻小说"、"社科"、"文学"）
  notes?: string;          // 读书随笔/心得
  createdAt: string;       // 扫码录入时间
  updatedAt: string;
}

export interface BookShelfStats {
  totalBooks: number;      // 藏书总量
  readingCount: number;    // 在读本数
  readCount: number;       // 已读完本数
  unreadCount: number;     // 想读/未读本数
  totalEstimatedPrice: number; // 藏书总价值估值（元）
  locationCounts: Record<string, number>; // 各物理书架藏书分布
}
