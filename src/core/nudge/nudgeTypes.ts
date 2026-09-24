export type NudgeSource = 'course' | 'pomodoro' | 'memo' | 'poetry' | 'book' | 'word' | 'daily';

export interface NudgeNotification {
  id: string;
  source: NudgeSource;
  tag: string;         // e.g. "地球Online · 技能树", "地球Online · 诗阁"
  icon: 'earth' | 'skill' | 'focus' | 'save' | 'poetry' | 'book' | 'word';
  message: string;     // 简洁、生动、活人感的地球Online提示语
  targetAppId: string; // 'course_kanban' | 'pomodoro' | 'memo' | 'poetry' | 'books' | 'storyword'
  actionLabel?: string; // 简洁场景化动词，如 "去对诗" | "去翻书" | "去攻克" | "去研读" | "去专注" | "去记录"
  courseId?: string;
  poemId?: string;
  bookId?: string;
  word?: string;
  createdAt: number;
}
