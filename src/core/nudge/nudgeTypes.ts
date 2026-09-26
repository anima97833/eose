export type NudgeSource = 'course' | 'memo' | 'poetry' | 'book' | 'word' | 'daily' | 'quest' | 'answers' | 'mindmap';

export interface NudgeNotification {
  id: string;
  source: NudgeSource;
  tag: string;         // e.g. "地球Online · 任务手账", "地球Online · 先知神谕", "地球Online · 脑图闪卡"
  icon: 'earth' | 'skill' | 'save' | 'poetry' | 'book' | 'word' | 'quest' | 'answers' | 'mindmap';
  message: string;     // 简洁、生动、活人感的地球Online提示语
  targetAppId: string; // 'course_kanban' | 'memo' | 'poetry' | 'books' | 'storyword' | 'diary' | 'mood_fortune' | 'files'
  actionLabel?: string; // 场景化动词，如 "去交任务" | "重温神谕" | "看思维导图"
  courseId?: string;
  poemId?: string;
  bookId?: string;
  word?: string;
  questId?: string;
  mindmapId?: string;
  createdAt: number;
}

