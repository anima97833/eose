export type PoemStatus = 'learning' | 'mastered';

export type KejuRank = '童生' | '秀才' | '举人' | '贡士' | '探花' | '榜眼' | '状元';

export interface SavedPoemRecord {
  id: string;              // 唯一 ID（如 "p_309946"）
  title: string;           // 诗名
  author: string;          // 诗家姓名（如 "李白"）
  dynasty: string;         // 朝代（如 "唐"、"宋"）
  type: string;            // 体裁（如 "五言绝句"、"宋词"）
  content: string[];       // 诗句正文（每一行为数组元素）
  status: PoemStatus;      // 学习中 / 已熟背
  isFavorite: boolean;     // 是否心仪收藏
  masteredAt?: string;     // 熟背通关时间（ISO 字符串）
  quizPassCount: number;   // 考核通关次数
  lastReviewedAt?: string; // 最近温故时间
  userNotes?: string;      // 用户赏析随笔 / 记忆口诀
  createdAt: string;
}

export interface PoetryOnlineItem {
  id: number;
  title: string;
  author?: { id?: number; name?: string };
  dynasty?: { id?: number; name?: string };
  type?: { id?: number; name?: string };
  content: string[];
}

export interface BlankQuestion {
  lineIndex: number;
  charIndex: number;
  correctChar: string;
  options: string[];       // 包含正确字和干扰字的 4 个候选字
  userChoice?: string;     // 用户填入的字
}

export interface PoetryExamQuestion {
  poem: SavedPoemRecord;
  blanks: BlankQuestion[];
  totalBlanks: number;
}

export interface PoetryStats {
  totalCount: number;      // 诗阁总收录
  learningCount: number;   // 在背温故中
  masteredCount: number;   // 已熟背金榜
  favoriteCount: number;   // 心仪诗篇
  totalPasses: number;     // 累计科举通关次数
  currentRank: KejuRank;   // 当前科举位阶
}
