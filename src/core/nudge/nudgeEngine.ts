import { NudgeNotification } from './nudgeTypes';
import { getAllCourses } from '../kanban/courseKanbanStorage';
import { Course, CourseChapter } from '../kanban/courseKanbanTypes';
import { db } from '../storage/db';
import { MemoChapter } from '../memo/memoTypes';

const LAST_NUDGE_TIME_KEY = 'cloudfly_last_nudge_timestamp';
const NEXT_INTERVAL_KEY = 'cloudfly_next_nudge_interval_ms';
const NUDGE_ROTATION_IDX_KEY = 'cloudfly_nudge_rotation_idx';

/**
 * 获取随机冷却间隔（15 ~ 20 分钟）
 */
function getRandomCooldownMs(): number {
  const minMs = 15 * 60 * 1000; // 15 分钟
  const maxMs = 20 * 60 * 1000; // 20 分钟
  return Math.floor(minMs + Math.random() * (maxMs - minMs));
}

/**
 * 检查当前是否已过冷却窗口
 */
function isCooldownPassed(): boolean {
  try {
    const lastTime = parseInt(localStorage.getItem(LAST_NUDGE_TIME_KEY) || '0', 10);
    const interval = parseInt(localStorage.getItem(NEXT_INTERVAL_KEY) || `${15 * 60 * 1000}`, 10);
    return Date.now() - lastTime >= interval;
  } catch {
    return true;
  }
}

/**
 * 标记刚刚触发过提醒，并预定下次 15~20 分钟随机时间
 */
export function markNudgeTriggered(): void {
  try {
    localStorage.setItem(LAST_NUDGE_TIME_KEY, `${Date.now()}`);
    localStorage.setItem(NEXT_INTERVAL_KEY, `${getRandomCooldownMs()}`);
  } catch (err) {
    console.warn('[NudgeEngine] 记录提醒冷却失败:', err);
  }
}

/**
 * 重置冷却（用于手动测试）
 */
export function resetNudgeCooldown(): void {
  try {
    localStorage.removeItem(LAST_NUDGE_TIME_KEY);
    localStorage.removeItem(NEXT_INTERVAL_KEY);
  } catch (err) {
    console.warn('[NudgeEngine] 重置冷却失败:', err);
  }
}

/**
 * 格式化精简课程名称，避免太长挤爆胶囊
 */
function trimTitle(title: string, maxLen = 18): string {
  if (!title) return '未命名课程';
  const clean = title.replace(/【.*?】/g, '').replace(/\[.*?\]/g, '').trim();
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}...` : clean;
}

/**
 * 智能嗅探所有待提醒事项池，采用轮换交替机制 (Round-Robin)
 * 即使上一项未完成/被忽视，下一次也会智能轮换弹别的！
 */
export async function detectEarthOnlineNudge(force: boolean = false): Promise<NudgeNotification | null> {
  if (!force && !isCooldownPassed()) {
    return null;
  }

  const candidatePool: NudgeNotification[] = [];

  // 1. 搜集所有滞后/未学完的课程技能书
  try {
    const courses: Course[] = getAllCourses();
    const laggingCourses = courses.filter((c: Course) => {
      if (c.status === 'completed') return false;
      const progress = c.totalChapters > 0 ? (c.completedChapters / c.totalChapters) * 100 : 0;
      const daysSinceUpdate = (Date.now() - (c.updatedAt || c.createdAt)) / (1000 * 60 * 60 * 24);
      return progress < 60 || daysSinceUpdate >= 1.5 || c.completedChapters === 0;
    });

    for (const course of laggingCourses) {
      const progressPct = course.totalChapters > 0 
        ? Math.round((course.completedChapters / course.totalChapters) * 100) 
        : 0;
      const nextChapter = course.chapters.find((ch: CourseChapter) => !ch.isCompleted);
      const chapterLabel = nextChapter ? `第${nextChapter.index + 1}节` : '下节';
      const shortName = trimTitle(course.title, 11);

      candidatePool.push({
        id: `nudge_course_${course.id}_${Date.now()}`,
        source: 'course',
        tag: '地球Online · 技能树',
        icon: 'skill',
        message: `研读《${shortName}》${chapterLabel}，熟练度+20%！`,
        targetAppId: 'course_kanban',
        courseId: course.id,
        createdAt: Date.now(),
      });
    }
  } catch (err) {
    console.warn('[NudgeEngine] 检查课程失败:', err);
  }

  // 2. 搜集番茄钟专注结界候选
  try {
    if (!db.isOpen()) await db.open();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySessions = await db.pomodoro_sessions
      .where('completedAt')
      .aboveOrEqual(todayStart.getTime())
      .toArray();

    if (todaySessions.length === 0) {
      candidatePool.push({
        id: `nudge_pomodoro_${Date.now()}`,
        source: 'pomodoro',
        tag: '地球Online · 心流结界',
        icon: 'focus',
        message: `耐力条满溢，开启25分钟专注结界回蓝刷经验！`,
        targetAppId: 'pomodoro',
        createdAt: Date.now(),
      });
    }
  } catch (err) {
    console.warn('[NudgeEngine] 检查番茄钟失败:', err);
  }

  // 3. 搜集手账日记存盘点候选
  try {
    if (!db.isOpen()) await db.open();
    const chapters: MemoChapter[] = await db.memo_chapters.toArray();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const hasTodayEntry = chapters.some((ch: MemoChapter) => ch.updatedAt >= todayStart.getTime());
    if (!hasTodayEntry) {
      candidatePool.push({
        id: `nudge_memo_${Date.now()}`,
        source: 'memo',
        tag: '地球Online · 存档点',
        icon: 'save',
        message: `今日剧情丰富，尚未生成每日存档，速去记录！`,
        targetAppId: 'memo',
        createdAt: Date.now(),
      });
    }
  } catch (err) {
    console.warn('[NudgeEngine] 检查日记手账失败:', err);
  }

  // 兜底候选项
  if (candidatePool.length === 0) {
    candidatePool.push({
      id: `nudge_daily_${Date.now()}`,
      source: 'daily',
      tag: '地球Online · 系统广播',
      icon: 'earth',
      message: `亚太东八区服务器运行良好，去课程本刷刷经验吧！`,
      targetAppId: 'course_kanban',
      createdAt: Date.now(),
    });
  }

  // 4. 关键改进：轮换调度机制 (Round-Robin)
  // 即使没完成或忽视，下一次也会智能挑选下一个，绝不卡在同一项！
  let rotationIdx = 0;
  try {
    rotationIdx = parseInt(localStorage.getItem(NUDGE_ROTATION_IDX_KEY) || '0', 10);
  } catch {
    rotationIdx = 0;
  }

  const selectedNudge = candidatePool[rotationIdx % candidatePool.length];

  // 指针步进，下一次自动弹出另一个不同任务
  try {
    localStorage.setItem(NUDGE_ROTATION_IDX_KEY, `${rotationIdx + 1}`);
  } catch (err) {
    console.warn('[NudgeEngine] 更新轮换指针失败:', err);
  }

  return selectedNudge;
}
