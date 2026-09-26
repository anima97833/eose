/**
 * 扭蛋机 · 待办决断池同步引擎
 * 仅同步「番茄钟」和「日记（Quest Journal）」中未打钩的任务
 * 严格与心愿池隔离，独立出蛋、独立交互
 */

import { db } from '../../../../core/storage/db';
import { loadQuestJournal, markQuestDone } from '../../../../core/quest/questStorage';
import { DecisionTaskItem, CapsuleColorKey } from './gachaTypes';

const TASK_CAPSULE_COLORS: CapsuleColorKey[] = ['blue', 'yellow', 'green', 'purple', 'orange', 'pink'];

/**
 * 实时拉取番茄钟与日记中的未完成任务
 */
export async function fetchUncompletedDecisionTasks(): Promise<DecisionTaskItem[]> {
  const result: DecisionTaskItem[] = [];

  // 1. 同步番茄钟未完成任务
  try {
    const pomoList = await db.pomodoro_tasks.toArray();
    const uncompletedPomos = (pomoList || []).filter((t) => !t.isCompleted);
    uncompletedPomos.forEach((t, idx) => {
      result.push({
        id: `pomo_${t.id}`,
        originalId: t.id,
        source: 'pomodoro',
        sourceLabel: '🍅 番茄钟待办',
        title: t.title,
        desc: t.categoryLabel ? `分类：${t.categoryLabel} · 预计 ${t.estimatedPoms || 1} 番茄` : undefined,
        icon: t.category === 'read' ? '📖' : t.category === 'study' ? '📚' : '💼',
        colorKey: TASK_CAPSULE_COLORS[idx % TASK_CAPSULE_COLORS.length],
        estimatedPoms: t.estimatedPoms,
        tag: t.categoryLabel || '专注',
        createdAt: t.createdAt || Date.now(),
      });
    });
  } catch (err) {
    console.warn('Failed to load pomodoro tasks for decision gachapon:', err);
  }

  // 2. 同步日记手帐 (Quest Journal) 中未完成任务
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

  return result;
}

/**
 * 标记决断任务为已完成（直接联动回番茄钟或日记存储，实现打钩同步）
 */
export async function markDecisionTaskDone(task: DecisionTaskItem): Promise<void> {
  if (task.source === 'pomodoro') {
    try {
      const existing = await db.pomodoro_tasks.get(task.originalId);
      if (existing) {
        existing.isCompleted = true;
        await db.pomodoro_tasks.put(existing);
        window.dispatchEvent(new CustomEvent('cloudfly_pomodoro_tasks_updated'));
      }
    } catch (err) {
      console.warn('Failed to complete pomodoro task from gachapon:', err);
    }
  } else if (task.source === 'diary') {
    try {
      markQuestDone(task.originalId);
      window.dispatchEvent(new CustomEvent('cloudfly_quests_updated'));
    } catch (err) {
      console.warn('Failed to complete quest task from gachapon:', err);
    }
  }
}
