export interface MemoCategory {
  id: string; // e.g. 'cat_essays', 'cat_accounting', 'cat_xxx'
  name: string; // 用户自定义名称：如 "记账"、"随笔"、"工作"
  icon: string; // 图标标识 (如 'book', 'wallet', 'sparkles', 'heart', 'star', 'folder')
  color: string; // 标签拟物主色调 (如 '#F59E0B', '#10B981', '#6366F1')
  order: number;
  createdAt: number;
}

export interface MemoChapter {
  id: string;
  categoryId: string; // 严格绑定所属标签分类（数据彻底隔离）
  titleLevel1: string; // 一级标题（如 "2026年度收支大盘" 或 "秋日私语"）
  titleLevel2: string; // 二级标题（如 "9月家庭餐饮开销" 或 "雨夜随想录"）
  chapterName: string; // 底部深黄托盘展示的篇章名称（如 "第1篇·日常记账" 或 "卷一·初醒"）
  pages: string[]; // 活页纸张内容数组，支持 [第1页, 第2页, ...]
  currentPageIndex: number; // 当前翻到的页码（0-indexed）
  createdAt: number;
  updatedAt: number;
}
