export type CoursePlatform = 'bilibili' | 'pan' | 'custom';
export type CourseStatus = 'backlog' | 'in_progress' | 'completed';

export interface CourseChapter {
  id: string;
  index: number;
  title: string;
  durationSeconds: number;
  isCompleted: boolean;
  completedAt?: number;
  url?: string;
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
