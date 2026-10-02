/**
 * 扭蛋机 · 待办决断池同步引擎
 * 同步来源：
 *   1. 「世界线（Quest Journal）」中未打钩的任务
 *   2. 「学习看板」中正在学 (in_progress) 和还没学 (backlog) 的课程
 * 严格与心愿池隔离，独立出蛋、独立交互
 */

import { loadQuestJournal, markQuestDone } from '../../../../core/quest/questStorage';
import { getAllCourses } from '../../../../core/kanban/courseKanbanStorage';
import { DecisionTaskItem, CapsuleColorKey } from './gachaTypes';

const TASK_CAPSULE_COLORS: CapsuleColorKey[] = ['blue', 'yellow', 'green', 'purple', 'orange', 'pink'];

// 学习看板平台对应图标
const PLATFORM_ICONS: Record<string, string> = {
  bilibili: '📺',
  pan:      '💾',
  custom:   '📚',
  xiaohongshu: '📕',
};

/**
 * 实时拉取所有决断池来源的待办项：
 *   - 世界线未完成任务
 *   - 学习看板「正在学」课程
 *   - 学习看板「还没学」课程
 */
export async function fetchUncompletedDecisionTasks(): Promise<DecisionTaskItem[]> {
  const result: DecisionTaskItem[] = [];

  // ① 同步世界线手帐 (Quest Journal) 中未完成任务
  try {
    const quests = loadQuestJournal();
    const uncompletedQuests = (quests || []).filter((q) => q.status === 'in_progress');
    uncompletedQuests.forEach((q, idx) => {
      result.push({
        id: `quest_${q.id}`,
        originalId: q.id,
        source: 'diary',
        sourceLabel: '🌌 世界线待办',
        title: q.title,
        desc: q.desc || q.tag,
        icon: q.icon || '📝',
        colorKey: TASK_CAPSULE_COLORS[(idx + 2) % TASK_CAPSULE_COLORS.length],
        tag: q.tag,
        createdAt: Date.now(),
      });
    });
  } catch (err) {
    console.warn('Failed to load diary quests for decision gachapon:', err);
  }

  // ② 同步学习看板「正在学」课程
  try {
    const courses = getAllCourses();

    const inProgress = courses.filter((c) => c.status === 'in_progress');
    inProgress.forEach((c, idx) => {
      const icon = PLATFORM_ICONS[c.platform] || '📚';
      const completedRatio =
        c.totalChapters > 0
          ? Math.round((c.completedChapters / c.totalChapters) * 100)
          : 0;
      result.push({
        id: `kanban_inprogress_${c.id}`,
        originalId: c.id,
        source: 'kanban',
        sourceLabel: '📖 正在学',
        title: c.title,
        desc: `进度 ${completedRatio}% · ${c.author}`,
        icon,
        colorKey: TASK_CAPSULE_COLORS[(idx + 1) % TASK_CAPSULE_COLORS.length],
        tag: c.attributeTag,
        createdAt: c.updatedAt,
      });
    });

    // ③ 同步学习看板「还没学」课程
    const backlog = courses.filter((c) => c.status === 'backlog');
    backlog.forEach((c, idx) => {
      const icon = PLATFORM_ICONS[c.platform] || '📚';
      result.push({
        id: `kanban_backlog_${c.id}`,
        originalId: c.id,
        source: 'kanban',
        sourceLabel: '⏳ 还没学',
        title: c.title,
        desc: `待开启 · ${c.author}`,
        icon,
        colorKey: TASK_CAPSULE_COLORS[(idx + 4) % TASK_CAPSULE_COLORS.length],
        tag: c.attributeTag,
        createdAt: c.createdAt,
      });
    });
  } catch (err) {
    console.warn('Failed to load kanban courses for decision gachapon:', err);
  }

  return result;
}

/**
 * 标记决断任务为已完成（直接联动回对应来源存储）
 * - diary：打钩世界线任务
 * - kanban：目前仅做记录，不自动修改学习状态（学习是长期任务）
 */
export async function markDecisionTaskDone(task: DecisionTaskItem): Promise<void> {
  if (task.source === 'diary') {
    try {
      markQuestDone(task.originalId);
      window.dispatchEvent(new CustomEvent('cloudfly_quests_updated'));
    } catch (err) {
      console.warn('Failed to complete quest task from gachapon:', err);
    }
  }
  // kanban 来源不自动打钩，用户需在学习看板中手动更新进度
}
