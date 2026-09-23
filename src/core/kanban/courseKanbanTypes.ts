export type CoursePlatform = 'bilibili' | 'pan' | 'custom';
export type CourseStatus = 'backlog' | 'in_progress' | 'completed';
export type CourseAttributeTag = 'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA';

export interface CourseChapter {
  id: string;
  index: number;
  title: string;
  durationSeconds: number;
  isCompleted: boolean;
  completedAt?: number;
  url?: string;
  reflection?: string; // 课时心得感想
  reflectionSubmittedAt?: number; // 感想提交时间
  rewardClaimed?: boolean; // 是否已发放六维奖励（防刷）
}

export interface Course {
  id: string;
  title: string;
  platform: CoursePlatform;
  status: CourseStatus;
  author: string;
  coverUrl?: string;
  sourceUrl?: string;
  intro?: string;
  totalChapters: number;
  completedChapters: number;
  totalDurationSeconds: number;
  chapters: CourseChapter[];
  dailyGoalMinutes: number; // 每天计划投入时间（默认30分钟）
  attributeTag?: CourseAttributeTag; // 六维分类标签 (STR/DEX/INT/SPI/CON/CHA)
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface KanbanStats {
  backlogCount: number;
  inProgressCount: number;
  completedCount: number;
  totalHours: number;
  completedHours: number;
}

export interface CourseReflectionRecord {
  id: string;
  courseId?: string;
  courseTitle: string;
  attributeTag: CourseAttributeTag;
  chapterIndex?: number;
  chapterTitle?: string;
  content: string;
  createdAt: number;
  isCustom?: boolean;
}
