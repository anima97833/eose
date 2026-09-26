/**
 * 扭蛋机 · 待办决断池同步引擎
 * 仅同步「番茄钟」和「日记（Quest Journal）」中未打钩的任务
 * 严格与心愿池隔离，独立出蛋、独立交互
 */

import { loadQuestJournal, markQuestDone } from '../../../../core/quest/questStorage';
import { DecisionTaskItem, CapsuleColorKey } from './gachaTypes';

const TASK_CAPSULE_COLORS: CapsuleColorKey[] = ['blue', 'yellow', 'green', 'purple', 'orange', 'pink'];

/**
 * 实时拉取世界线手帐 (Quest Journal) 中未完成任务
 */
export async function fetchUncompletedDecisionTasks(): Promise<DecisionTaskItem[]> {
  const result: DecisionTaskItem[] = [];

  // 同步世界线手帐 (Quest Journal) 中未完成任务
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
 * 标记决断任务为已完成（直接联动回世界线存储，实现打钩同步）
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
}
