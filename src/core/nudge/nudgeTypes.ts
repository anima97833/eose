export type NudgeSource = 'course' | 'pomodoro' | 'memo' | 'daily';

export interface NudgeNotification {
  id: string;
  source: NudgeSource;
  tag: string;         // e.g. "地球Online · 技能树"
  icon: 'earth' | 'skill' | 'focus' | 'save';
  message: string;     // 简洁、生动的地球Online提示语
  targetAppId: string; // 'course_kanban' | 'pomodoro' | 'memo'
  courseId?: string;
  createdAt: number;
}
