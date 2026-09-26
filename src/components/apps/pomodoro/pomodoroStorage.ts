import { db, PomodoroSessionRecord, PomodoroTaskRecord } from '../../../core/storage/db';

export interface PomodoroTaskGroup {
  id: string;
  title: string;
  color: string;
  createdAt: number;
}

export const DEFAULT_TASK_GROUPS: PomodoroTaskGroup[] = [
  { id: 'group_work', title: '日常工作攻坚', color: '#5096C6', createdAt: 1000 },
  { id: 'group_growth', title: '个人自我提升', color: '#4E937A', createdAt: 2000 },
];

export function getPomodoroTaskGroups(): PomodoroTaskGroup[] {
  try {
    const raw = localStorage.getItem('pomodoro_task_groups');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  localStorage.setItem('pomodoro_task_groups', JSON.stringify(DEFAULT_TASK_GROUPS));
  return DEFAULT_TASK_GROUPS;
}

export function savePomodoroTaskGroup(title: string, color?: string): PomodoroTaskGroup {
  const groups = getPomodoroTaskGroups();
  const newGroup: PomodoroTaskGroup = {
    id: `group_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: title.trim(),
    color: color || '#5096C6',
    createdAt: Date.now(),
  };
  const updated = [...groups, newGroup];
  localStorage.setItem('pomodoro_task_groups', JSON.stringify(updated));
  return newGroup;
}

export async function deletePomodoroTaskGroup(groupId: string): Promise<void> {
  const groups = getPomodoroTaskGroups();
  const filtered = groups.filter((g) => g.id !== groupId);
  const fallback = filtered.length > 0 ? filtered : DEFAULT_TASK_GROUPS;
  localStorage.setItem('pomodoro_task_groups', JSON.stringify(fallback));

  // 将被删除组的任务迁移到 fallback 组
  const targetGroup = fallback[0];
  const allTasks = await db.pomodoro_tasks.toArray();
  for (const t of allTasks) {
    if (t.groupId === groupId) {
      t.groupId = targetGroup.id;
      t.groupTitle = targetGroup.title;
      await db.pomodoro_tasks.put(t);
    }
  }
}

export async function moveTaskToGroup(taskId: string, targetGroupId: string, targetGroupTitle: string): Promise<void> {
  const task = await db.pomodoro_tasks.get(taskId);
  if (task) {
    task.groupId = targetGroupId;
    task.groupTitle = targetGroupTitle;
    await db.pomodoro_tasks.put(task);
  }
}

export const DEFAULT_POMODORO_TASKS: PomodoroTaskRecord[] = [
  {
    id: 'task_default_1',
    title: '完成《轻拟物UI设计规范稿》',
    category: 'work',
    categoryLabel: '工作',
    groupId: 'group_work',
    groupTitle: '日常工作攻坚',
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
    groupId: 'group_growth',
    groupTitle: '个人自我提升',
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
    groupId: 'group_growth',
    groupTitle: '个人自我提升',
    estimatedPoms: 3,
    completedPoms: 3,
    isCompleted: true,
    createdAt: Date.now() - 86400000 * 3,
  },
];

export async function initPomodoroTasksIfEmpty(): Promise<PomodoroTaskRecord[]> {
  try {
    const groups = getPomodoroTaskGroups();
    const defaultGroup = groups[0] || DEFAULT_TASK_GROUPS[0];
    const list = await db.pomodoro_tasks.toArray();

    if (!list || list.length === 0) {
      for (const t of DEFAULT_POMODORO_TASKS) {
        await db.pomodoro_tasks.put(t);
      }
      return DEFAULT_POMODORO_TASKS;
    }

    // 平滑升级：如果已有任务缺少 groupId，自动赋予默认大类
    let hasMigration = false;
    for (const t of list) {
      if (!t.groupId) {
        t.groupId = defaultGroup.id;
        t.groupTitle = defaultGroup.title;
        await db.pomodoro_tasks.put(t);
        hasMigration = true;
      }
    }
    return hasMigration ? await db.pomodoro_tasks.toArray() : list;
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

    // 如果关联了任务且完成了专注阶段，系统自动为任务累计番茄数并自动完成勾选！
    if (session.taskId && session.isCompleted && session.mode === 'focus') {
      const task = await db.pomodoro_tasks.get(session.taskId);
      if (task) {
        task.completedPoms += 1;
        // 需求2：任务清单条目左侧的勾选，应该由用户真的完成计时后，系统自动勾选
        task.isCompleted = true;
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
