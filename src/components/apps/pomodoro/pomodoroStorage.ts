import { db, PomodoroSessionRecord, PomodoroTaskRecord } from '../../../core/storage/db';

export const DEFAULT_POMODORO_TASKS: PomodoroTaskRecord[] = [
  {
    id: 'task_default_1',
    title: '完成《轻拟物UI设计规范稿》',
    category: 'work',
    categoryLabel: '工作',
    estimatedPoms: 4,
    completedPoms: 2,
    isCompleted: false,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'task_default_2',
    title: '阅读《思考，快与慢》30分钟',
    category: 'read',
    categoryLabel: '阅读',
    estimatedPoms: 2,
    completedPoms: 1,
    isCompleted: false,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'task_default_3',
    title: 'TypeScript 高阶架构与沙盒学习',
    category: 'study',
    categoryLabel: '学习',
    estimatedPoms: 3,
    completedPoms: 3,
    isCompleted: true,
    createdAt: Date.now() - 86400000 * 3,
  },
];

export async function initPomodoroTasksIfEmpty(): Promise<PomodoroTaskRecord[]> {
  try {
    const list = await db.pomodoro_tasks.toArray();
    if (!list || list.length === 0) {
      for (const t of DEFAULT_POMODORO_TASKS) {
        await db.pomodoro_tasks.put(t);
      }
      return DEFAULT_POMODORO_TASKS;
    }
    return list;
  } catch (err) {
    console.error('Failed to init tasks:', err);
    return DEFAULT_POMODORO_TASKS;
  }
}

export async function recordPomodoroSession(session: Omit<PomodoroSessionRecord, 'id'>): Promise<void> {
  try {
    const record: PomodoroSessionRecord = {
      ...session,
      id: `pomsess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    await db.pomodoro_sessions.put(record);

    // 如果关联了任务且完成了专注阶段，自动为任务累计番茄数
    if (session.taskId && session.isCompleted && session.mode === 'focus') {
      const task = await db.pomodoro_tasks.get(session.taskId);
      if (task) {
        task.completedPoms += 1;
        if (task.completedPoms >= task.estimatedPoms) {
          task.isCompleted = true;
        }
        await db.pomodoro_tasks.put(task);
      }
    }
  } catch (err) {
    console.error('Failed to record session:', err);
  }
}

export interface DayFocusStat {
  dayLabel: string;
  minutes: number;
  pomodoros: number;
}

export interface CategoryStat {
  category: string;
  label: string;
  color: string;
  minutes: number;
  percentage: number;
}

export interface PomodoroOverviewStats {
  todayMinutes: number;
  todayPoms: number;
  weekMinutes: number;
  weekPoms: number;
  totalMinutes: number;
  totalPoms: number;
  dailyTrend: DayFocusStat[];
  categoryBreakdown: CategoryStat[];
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  work: { label: '工作', color: '#5096C6' },
  study: { label: '学习', color: '#68B39B' },
  read: { label: '阅读', color: '#D4A373' },
  fitness: { label: '健身', color: '#E07A5F' },
  life: { label: '生活', color: '#9D8189' },
};

export async function calculatePomodoroStats(): Promise<PomodoroOverviewStats> {
  const allSessions = await db.pomodoro_sessions.toArray();
  const focusSessions = allSessions.filter((s) => s.mode === 'focus');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneDayMs = 86400000;
  const weekStart = todayStart - 6 * oneDayMs;

  let todayMinutes = 0;
  let todayPoms = 0;
  let weekMinutes = 0;
  let weekPoms = 0;
  let totalMinutes = 0;

  // 初始化近7日数据
  const dayMap = new Map<string, { minutes: number; poms: number }>();
  const dayLabels: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart - i * oneDayMs);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    dayLabels.push(label);
    dayMap.set(label, { minutes: 0, poms: 0 });
  }

  const categoryTimeMap = new Map<string, number>();

  focusSessions.forEach((s) => {
    const min = Math.round(s.actualSeconds / 60);
    totalMinutes += min;

    if (s.completedAt >= todayStart) {
      todayMinutes += min;
      if (s.isCompleted) todayPoms += 1;
    }
    if (s.completedAt >= weekStart) {
      weekMinutes += min;
      if (s.isCompleted) weekPoms += 1;
    }

    // 填充7日柱状图
    const sDate = new Date(s.completedAt);
    const label = `${sDate.getMonth() + 1}/${sDate.getDate()}`;
    if (dayMap.has(label)) {
      const cur = dayMap.get(label)!;
      cur.minutes += min;
      if (s.isCompleted) cur.poms += 1;
    }

    // 标签时间归类
    const cat = s.category || 'work';
    categoryTimeMap.set(cat, (categoryTimeMap.get(cat) || 0) + min);
  });

  const dailyTrend: DayFocusStat[] = dayLabels.map((lbl) => ({
    dayLabel: lbl,
    minutes: dayMap.get(lbl)?.minutes || 0,
    pomodoros: dayMap.get(lbl)?.poms || 0,
  }));

  const totalCatTime = Array.from(categoryTimeMap.values()).reduce((a, b) => a + b, 0);
  const categoryBreakdown: CategoryStat[] = Array.from(categoryTimeMap.entries()).map(
    ([cat, min]) => {
      const meta = CATEGORY_META[cat] || { label: cat, color: '#A0AEC0' };
      return {
        category: cat,
        label: meta.label,
        color: meta.color,
        minutes: min,
        percentage: totalCatTime > 0 ? Math.round((min / totalCatTime) * 100) : 0,
      };
    }
  );

  return {
    todayMinutes,
    todayPoms,
    weekMinutes,
    weekPoms,
    totalMinutes,
    totalPoms: focusSessions.filter((s) => s.isCompleted).length,
    dailyTrend,
    categoryBreakdown,
  };
}
