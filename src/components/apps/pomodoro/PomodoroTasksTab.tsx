import React, { useState } from 'react';
import { Plus, Check, Trash2, Target, CheckCircle2, Circle, Edit3, X, Zap, Clock, FolderPlus, ArrowRightLeft, Layers } from 'lucide-react';
import { PomodoroTaskRecord, db } from '../../../core/storage/db';
import { CustomDurationSection, FOCUS_PRESETS } from './CustomDurationSection';
import {
  getPomodoroTaskGroups,
  savePomodoroTaskGroup,
  deletePomodoroTaskGroup,
  moveTaskToGroup,
  PomodoroTaskGroup,
} from './pomodoroStorage';

interface PomodoroTasksTabProps {
  tasks: PomodoroTaskRecord[];
  activeTaskId: string | null;
  onSelectTask: (task: PomodoroTaskRecord | null) => void;
  onRefreshTasks: () => void;
}

const CATEGORIES = [
  { key: 'work', label: '工作', color: '#5096C6', defaultAttr: 'INT' as const },
  { key: 'study', label: '学习', color: '#4E937A', defaultAttr: 'INT' as const },
  { key: 'read', label: '阅读', color: '#D4A373', defaultAttr: 'SPI' as const },
  { key: 'fitness', label: '健身', color: '#E07A5F', defaultAttr: 'STR' as const },
  { key: 'life', label: '生活', color: '#9D8189', defaultAttr: 'CON' as const },
];

const GROUP_PALETTE = ['#5096C6', '#4E937A', '#D4A373', '#E07A5F', '#9D8189', '#6366F1'];

const ATTR_MAP: Record<string, string> = {
  STR: '力量',
  DEX: '敏捷',
  INT: '智力',
  SPI: '精神',
  CON: '体质',
  CHA: '魅力',
};

const DIFF_MAP: Record<string, { label: string; color: string }> = {
  easy: { label: '简单', color: '#10b981' },
  normal: { label: '普通', color: '#3b82f6' },
  hard: { label: '困难', color: '#f59e0b' },
  expert: { label: '攻坚', color: '#ef4444' },
};

export const PomodoroTasksTab: React.FC<PomodoroTasksTabProps> = ({
  tasks,
  activeTaskId,
  onSelectTask,
  onRefreshTasks,
}) => {
  // 大类（任务集）状态
  const [groups, setGroups] = useState<PomodoroTaskGroup[]>(getPomodoroTaskGroups());
  const [showAddGroupModal, setShowAddGroupModal] = useState<boolean>(false);
  const [newGroupTitle, setNewGroupTitle] = useState<string>('');
  const [newGroupColor, setNewGroupColor] = useState<string>(GROUP_PALETTE[0]);
  const [movingTask, setMovingTask] = useState<PomodoroTaskRecord | null>(null);

  // 新建任务弹窗状态
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newGroupId, setNewGroupId] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'work' | 'study' | 'read' | 'fitness' | 'life'>('work');
  const [newTargetAttr, setNewTargetAttr] = useState<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA'>('INT');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'normal' | 'hard' | 'expert'>('normal');
  const [newEstimated, setNewEstimated] = useState<number>(2);
  const [newFocusDuration, setNewFocusDuration] = useState<number>(25);
  const [newTimerType, setNewTimerType] = useState<'countdown' | 'countup'>('countdown');

  // 编辑任务弹窗状态
  const [editingTask, setEditingTask] = useState<PomodoroTaskRecord | null>(null);
  const [editGroupId, setEditGroupId] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<'work' | 'study' | 'read' | 'fitness' | 'life'>('work');
  const [editTargetAttr, setEditTargetAttr] = useState<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA'>('INT');
  const [editDifficulty, setEditDifficulty] = useState<'easy' | 'normal' | 'hard' | 'expert'>('normal');
  const [editEstimated, setEditEstimated] = useState<number>(2);
  const [editFocusDuration, setEditFocusDuration] = useState<number>(25);
  const [editTimerType, setEditTimerType] = useState<'countdown' | 'countup'>('countdown');

  // 轻拟物 Toast 提示
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const handleCategoryChange = (catKey: 'work' | 'study' | 'read' | 'fitness' | 'life', isEdit = false) => {
    const catMeta = CATEGORIES.find((c) => c.key === catKey);
    if (isEdit) {
      setEditCategory(catKey);
      if (catMeta) setEditTargetAttr(catMeta.defaultAttr);
    } else {
      setNewCategory(catKey);
      if (catMeta) setNewTargetAttr(catMeta.defaultAttr);
    }
  };

  // 创建新任务集（大类）
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;
    const created = savePomodoroTaskGroup(newGroupTitle.trim(), newGroupColor);
    const updated = getPomodoroTaskGroups();
    setGroups(updated);
    setNewGroupTitle('');
    setShowAddGroupModal(false);
    showToast(`已创建任务集「${created.title}」`);
  };

  // 删除任务集（大类）
  const handleDeleteGroup = async (groupId: string, groupTitle: string) => {
    if (groups.length <= 1) {
      showToast('至少保留一个任务集，无法删除唯一的任务集');
      return;
    }
    await deletePomodoroTaskGroup(groupId);
    const updated = getPomodoroTaskGroups();
    setGroups(updated);
    onRefreshTasks();
    showToast(`已删除任务集「${groupTitle}」，其下任务已并入备用任务集`);
  };

  // 移动具体任务到目标大类
  const handleMoveTask = async (taskId: string, targetGroupId: string) => {
    const targetGroup = groups.find((g) => g.id === targetGroupId);
    if (!targetGroup) return;
    await moveTaskToGroup(taskId, targetGroup.id, targetGroup.title);
    setMovingTask(null);
    onRefreshTasks();
    showToast(`已成功将任务移至「${targetGroup.title}」`);
  };

  // 创建新具体任务
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetGroupId = newGroupId || groups[0]?.id || 'group_work';
    const targetGroup = groups.find((g) => g.id === targetGroupId) || groups[0];
    const catMeta = CATEGORIES.find((c) => c.key === newCategory)!;

    const newTask: PomodoroTaskRecord = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: catMeta.label,
      targetAttr: newTargetAttr,
      difficulty: newDifficulty,
      estimatedPoms: Math.max(1, newEstimated),
      completedPoms: 0,
      isCompleted: false,
      focusDurationMinutes: newFocusDuration,
      timerType: newTimerType,
      groupId: targetGroupId,
      groupTitle: targetGroup?.title || '日常工作攻坚',
      createdAt: Date.now(),
    };

    await db.pomodoro_tasks.put(newTask);
    setNewTitle('');
    setShowAddModal(false);
    onRefreshTasks();
    showToast(`已添加到任务集「${targetGroup?.title || '默认'}」`);
  };

  // 打开编辑任务弹窗
  const handleOpenEdit = (task: PomodoroTaskRecord) => {
    setEditingTask(task);
    setEditGroupId(task.groupId || groups[0]?.id || 'group_work');
    setEditTitle(task.title);
    setEditCategory(task.category);
    setEditTargetAttr(task.targetAttr || 'INT');
    setEditDifficulty(task.difficulty || 'normal');
    setEditEstimated(task.estimatedPoms || 2);
    setEditFocusDuration(task.focusDurationMinutes || 25);
    setEditTimerType(task.timerType || 'countdown');
  };

  // 保存编辑
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    const targetGroup = groups.find((g) => g.id === editGroupId) || groups[0];
    const catMeta = CATEGORIES.find((c) => c.key === editCategory)!;

    const updated: PomodoroTaskRecord = {
      ...editingTask,
      title: editTitle.trim(),
      category: editCategory,
      categoryLabel: catMeta.label,
      targetAttr: editTargetAttr,
      difficulty: editDifficulty,
      estimatedPoms: Math.max(1, editEstimated),
      focusDurationMinutes: editFocusDuration,
      timerType: editTimerType,
      groupId: editGroupId || editingTask.groupId || groups[0]?.id || 'group_work',
      groupTitle: targetGroup?.title || editingTask.groupTitle || '日常工作攻坚',
    };

    await db.pomodoro_tasks.put(updated);
    setEditingTask(null);
    onRefreshTasks();

    if (activeTaskId === updated.id) {
      onSelectTask(updated);
    }
    showToast('任务配置已保存');
  };

  // 需求2：任务清单条目左侧的勾选，由用户真的完成计时后系统自动勾选
  const handleCheckboxClick = (task: PomodoroTaskRecord) => {
    if (task.isCompleted) {
      showToast(`✅ 任务「${task.title}」已通过完成专注计时由系统自动勾选打卡！`);
    } else {
      showToast(`⌛ 此任务尚未完成计时。请在计时页完成专注后，由系统为您自动勾选打卡！`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (activeTaskId === id) {
      onSelectTask(null);
    }
    await db.pomodoro_tasks.delete(id);
    onRefreshTasks();
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px 14px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* 头部：标题与「新建任务集」按钮 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#2F614C' }}>
            任务清单 (Tasks)
          </div>
          <div style={{ fontSize: '11px', color: '#6A8A73' }}>
            支持大类任务集管理 · 计时达成系统自动勾选
          </div>
        </div>

        {/* 需求3：把 新建任务 改为 新建任务集 ，单击后创建 */}
        <button
          type="button"
          onClick={() => setShowAddGroupModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '7px 13px',
            borderRadius: '16px',
            backgroundColor: '#3A5A40',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(58, 90, 64, 0.3)',
          }}
        >
          <FolderPlus size={15} />
          <span>新建任务集</span>
        </button>
      </div>

      {/* 轻拟物 Toast 提示栏 */}
      {toastMsg && (
        <div
          style={{
            marginBottom: '12px',
            padding: '8px 14px',
            borderRadius: '12px',
            backgroundColor: '#2F614C',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(47, 97, 76, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 按大类(任务集)分块呈现 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {groups.map((group) => {
          const groupTasks = tasks.filter(
            (t) => (t.groupId || groups[0]?.id) === group.id
          );
          const completedCount = groupTasks.filter((t) => t.isCompleted).length;

          return (
            <div
              key={group.id}
              className="nm-card-sm"
              style={{
                borderRadius: '18px',
                backgroundColor: 'rgba(245, 250, 246, 0.85)',
                border: '1px solid rgba(220, 235, 225, 0.9)',
                boxShadow: '0 3px 10px rgba(40, 70, 50, 0.05)',
                padding: '12px 14px',
              }}
            >
              {/* 大类(任务集) 头部 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  marginBottom: '10px',
                  borderBottom: '1px solid rgba(160, 185, 170, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '5px',
                      height: '14px',
                      borderRadius: '3px',
                      backgroundColor: group.color || '#5096C6',
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#283618' }}>
                    {group.title}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#6A8A73',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(215, 235, 220, 0.65)',
                      fontWeight: 600,
                    }}
                  >
                    {groupTasks.length} 项 · {completedCount} 完成
                  </span>
                </div>

                {/* 任务集右侧：增加具体任务按钮 & 删除任务集按钮 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNewGroupId(group.id);
                      setShowAddModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: '#3A5A40',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(58, 90, 64, 0.25)',
                    }}
                    title="在此任务集下新增具体小任务"
                  >
                    <Plus size={13} />
                    <span>具体任务</span>
                  </button>

                  {groups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(group.id, group.title)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#A0AEC0',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="删除任务集"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* 任务集下的小任务列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {groupTasks.map((task) => {
                  const isCurrentActive = activeTaskId === task.id;
                  const catMeta = CATEGORIES.find((c) => c.key === task.category) || CATEGORIES[0];
                  const duration = task.focusDurationMinutes || 25;
                  const isCountup = task.timerType === 'countup';

                  return (
                    <div
                      key={task.id}
                      className="nm-card-sm"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        backgroundColor: isCurrentActive ? 'rgba(230, 245, 235, 0.95)' : '#FFFFFF',
                        border: isCurrentActive ? '1.5px solid #4E937A' : '1px solid rgba(220, 235, 225, 0.65)',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                      }}
                    >
                      {/* 复选框（严格由计时完成后系统自动勾选）与标题 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleCheckboxClick(task)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title={task.isCompleted ? '专注完成系统自动勾选' : '完成专注计时后系统将自动勾选'}
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 size={19} color="#4E937A" />
                          ) : (
                            <Circle size={19} color="#A0AEC0" />
                          )}
                        </button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: task.isCompleted ? '#8A9A90' : '#283618',
                              textDecoration: task.isCompleted ? 'line-through' : 'none',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {task.title}
                          </div>

                          {/* 标签与番茄统计 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '9px',
                                padding: '1px 5px',
                                borderRadius: '5px',
                                backgroundColor: catMeta.color,
                                color: '#FFFFFF',
                                fontWeight: 700,
                              }}
                            >
                              {catMeta.label}
                            </span>

                            {/* 专属用时与计时模式徽章 */}
                            <span
                              style={{
                                fontSize: '9px',
                                padding: '1px 6px',
                                borderRadius: '5px',
                                backgroundColor: isCountup ? 'rgba(254, 243, 199, 0.85)' : 'rgba(215, 235, 220, 0.85)',
                                color: isCountup ? '#92400e' : '#2F614C',
                                fontWeight: 700,
                                border: isCountup ? '1px solid #fde68a' : '1px solid rgba(160, 185, 170, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                              title={isCountup ? `正向计时（目标 ${duration}分钟）` : `倒计时（${duration}分钟）`}
                            >
                              {isCountup ? `⏳ 正向 (${duration}m)` : `⏱️ ${duration}m`}
                            </span>

                            {task.targetAttr && (
                              <span
                                style={{
                                  fontSize: '9px',
                                  padding: '1px 5px',
                                  borderRadius: '5px',
                                  backgroundColor: '#e0e7ff',
                                  color: '#4338ca',
                                  fontWeight: 700,
                                }}
                              >
                                {ATTR_MAP[task.targetAttr] || task.targetAttr}
                              </span>
                            )}

                            {task.difficulty && (
                              <span
                                style={{
                                  fontSize: '9px',
                                  padding: '1px 5px',
                                  borderRadius: '5px',
                                  backgroundColor: DIFF_MAP[task.difficulty]?.color || '#3b82f6',
                                  color: '#FFFFFF',
                                  fontWeight: 700,
                                }}
                              >
                                {DIFF_MAP[task.difficulty]?.label || '普通'}
                              </span>
                            )}

                            <span style={{ fontSize: '10px', color: '#6A8A73', fontWeight: 600 }}>
                              🍅 {task.completedPoms}/{task.estimatedPoms}
                            </span>

                            {task.completedPoms >= task.estimatedPoms && (
                              <span style={{ fontSize: '9px', color: '#4E937A', fontWeight: 700 }}>
                                ✓ 达成
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 操作区：指定为当前专注 / 移动到大类 / 编辑 / 删除 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <button
                          type="button"
                          onClick={() => onSelectTask(isCurrentActive ? null : task)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: isCurrentActive ? '#3A5A40' : 'rgba(215, 230, 220, 0.7)',
                            color: isCurrentActive ? '#FFFFFF' : '#344E41',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                          title={isCurrentActive ? '已设为当前目标' : '设为当前目标'}
                        >
                          <Target size={11} />
                          <span>{isCurrentActive ? '专注中' : '去专注'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMovingTask(task)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#4E937A',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="移动到其它大类(任务集)"
                        >
                          <ArrowRightLeft size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(task)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#557962',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="编辑任务与用时"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#A0AEC0',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="删除任务"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {groupTasks.length === 0 && (
                  <div
                    style={{
                      padding: '16px 0',
                      textAlign: 'center',
                      color: '#8A9A90',
                      fontSize: '11px',
                    }}
                  >
                    此任务集暂无任务，点击右上角「具体任务」添加吧~
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {/* 1. 新建任务弹窗 */}
      {showAddModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(25, 40, 30, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000,
            boxSizing: 'border-box',
          }}
        >
          <form
            onSubmit={handleAddTask}
            className="nm-card"
            style={{
              width: '100%',
              maxWidth: '360px',
              maxHeight: 'min(86vh, 600px)',
              borderRadius: '22px',
              backgroundColor: '#F0F5F1',
              boxShadow: '0 16px 36px rgba(20, 40, 30, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* 固定顶部 Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(160, 185, 170, 0.3)',
                backgroundColor: '#EDF5EE',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#2F614C' }}>
                添加专注任务
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6A8A73',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 可滚动的主体表单区域 */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* 所属任务集选择 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px', fontWeight: 600 }}>
                  所属大类（任务集）:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {groups.map((g) => {
                    const isSelected = (newGroupId || groups[0]?.id) === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setNewGroupId(g.id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '10px',
                          border: isSelected ? `1.5px solid ${g.color || '#3A8259'}` : '1px solid rgba(160, 185, 170, 0.4)',
                          backgroundColor: isSelected ? '#FFFFFF' : 'rgba(215, 230, 220, 0.5)',
                          color: isSelected ? '#283618' : '#4E6655',
                          fontSize: '11px',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: g.color || '#5096C6' }} />
                        <span>{g.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="任务名称（例如：阅读《算法导论》）"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(160, 185, 170, 0.5)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: '#283618',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />

              {/* 计时模式选择：倒计时 vs 正向计时 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px', fontWeight: 600 }}>
                  计时模式:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setNewTimerType('countdown')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: newTimerType === 'countdown' ? '#3A8259' : 'rgba(215, 230, 220, 0.6)',
                      color: newTimerType === 'countdown' ? '#FFFFFF' : '#4E6655',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: newTimerType === 'countdown' ? '0 2px 6px rgba(58, 130, 89, 0.3)' : 'none',
                    }}
                  >
                    ⏱️ 倒计时 (限时专注)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTimerType('countup')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: newTimerType === 'countup' ? '#D97706' : 'rgba(215, 230, 220, 0.6)',
                      color: newTimerType === 'countup' ? '#FFFFFF' : '#4E6655',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: newTimerType === 'countup' ? '0 2px 6px rgba(217, 119, 6, 0.3)' : 'none',
                    }}
                  >
                    ⏳ 正向计时 (自由累计)
                  </button>
                </div>
              </div>

              {/* 节奏与时长模块（复用带微调和预设的 CustomDurationSection） */}
              <div
                style={{
                  borderRadius: '14px',
                  backgroundColor: 'rgba(235, 245, 238, 0.85)',
                  border: '1px solid rgba(160, 185, 170, 0.4)',
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', color: '#2F614C', fontSize: '11px', fontWeight: 700 }}>
                  <Zap size={13} color="#3A8259" />
                  <span>节奏与时长 (支持自定义)</span>
                </div>
                <CustomDurationSection
                  title={newTimerType === 'countdown' ? '单次专注时长' : '建议专注目标'}
                  value={newFocusDuration}
                  presets={FOCUS_PRESETS}
                  min={1}
                  max={180}
                  stepPresets={[1, 5]}
                  onSelect={(val) => setNewFocusDuration(val)}
                />
              </div>

              {/* 分类选择 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px' }}>
                  分类标签:
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategoryChange(cat.key as any, false)}
                      style={{
                        flex: 1,
                        padding: '5px 0',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: newCategory === cat.key ? cat.color : 'rgba(215, 230, 220, 0.6)',
                        color: newCategory === cat.key ? '#FFFFFF' : '#4E6655',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 目标六维 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px' }}>
                  目标六维:
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['STR', 'DEX', 'INT', 'SPI', 'CON', 'CHA'] as const).map((attr) => (
                    <button
                      key={attr}
                      type="button"
                      onClick={() => setNewTargetAttr(attr)}
                      style={{
                        flex: 1,
                        padding: '5px 0',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: newTargetAttr === attr ? '#4338ca' : 'rgba(215, 230, 220, 0.6)',
                        color: newTargetAttr === attr ? '#FFFFFF' : '#4E6655',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {ATTR_MAP[attr]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 难易度 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px' }}>
                  任务难度:
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['easy', 'normal', 'hard', 'expert'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setNewDifficulty(diff)}
                      style={{
                        flex: 1,
                        padding: '5px 0',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: newDifficulty === diff ? DIFF_MAP[diff].color : 'rgba(215, 230, 220, 0.6)',
                        color: newDifficulty === diff ? '#FFFFFF' : '#4E6655',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {DIFF_MAP[diff].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 预计番茄数 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px' }}>
                  预计番茄数 (每个 {newFocusDuration} 分钟):
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewEstimated(num)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: newEstimated === num ? '#3A5A40' : 'rgba(215, 230, 220, 0.6)',
                        color: newEstimated === num ? '#FFFFFF' : '#344E41',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🍅 {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 固定底部操作按钮栏 */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 16px 12px',
                borderTop: '1px solid rgba(160, 185, 170, 0.3)',
                backgroundColor: '#EDF5EE',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'rgba(200, 215, 205, 0.65)',
                  color: '#4E6655',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#3A5A40',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(58, 90, 64, 0.3)',
                }}
              >
                确认创建
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. 编辑任务弹窗（后期可随时自由编辑用时与模式） */}
      {editingTask && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTask(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(25, 40, 30, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000,
            boxSizing: 'border-box',
          }}
        >
          <form
            onSubmit={handleSaveEdit}
            className="nm-card"
            style={{
              width: '100%',
              maxWidth: '360px',
              maxHeight: 'min(86vh, 600px)',
              borderRadius: '22px',
              backgroundColor: '#F0F5F1',
              boxShadow: '0 16px 36px rgba(20, 40, 30, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* 固定顶部 Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(160, 185, 170, 0.3)',
                backgroundColor: '#EDF5EE',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#2F614C' }}>
                编辑任务配置
              </div>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6A8A73',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 可滚动的主体表单区域 */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* 所属任务集选择 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px', fontWeight: 600 }}>
                  所属大类（任务集）:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {groups.map((g) => {
                    const isSelected = (editGroupId || groups[0]?.id) === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setEditGroupId(g.id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '10px',
                          border: isSelected ? `1.5px solid ${g.color || '#3A8259'}` : '1px solid rgba(160, 185, 170, 0.4)',
                          backgroundColor: isSelected ? '#FFFFFF' : 'rgba(215, 230, 220, 0.5)',
                          color: isSelected ? '#283618' : '#4E6655',
                          fontSize: '11px',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: g.color || '#5096C6' }} />
                        <span>{g.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="任务名称"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(160, 185, 170, 0.5)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: '#283618',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              {/* 计时模式选择：倒计时 vs 正向计时 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px', fontWeight: 600 }}>
                  计时模式:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setEditTimerType('countdown')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: editTimerType === 'countdown' ? '#3A8259' : 'rgba(215, 230, 220, 0.6)',
                      color: editTimerType === 'countdown' ? '#FFFFFF' : '#4E6655',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: editTimerType === 'countdown' ? '0 2px 6px rgba(58, 130, 89, 0.3)' : 'none',
                    }}
                  >
                    ⏱️ 倒计时 (限时专注)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTimerType('countup')}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: editTimerType === 'countup' ? '#D97706' : 'rgba(215, 230, 220, 0.6)',
                      color: editTimerType === 'countup' ? '#FFFFFF' : '#4E6655',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: editTimerType === 'countup' ? '0 2px 6px rgba(217, 119, 6, 0.3)' : 'none',
                    }}
                  >
                    ⏳ 正向计时 (自由累计)
                  </button>
                </div>
              </div>

              {/* 节奏与时长模块（复用带微调和预设的 CustomDurationSection） */}
              <div
                style={{
                  borderRadius: '14px',
                  backgroundColor: 'rgba(235, 245, 238, 0.85)',
                  border: '1px solid rgba(160, 185, 170, 0.4)',
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', color: '#2F614C', fontSize: '11px', fontWeight: 700 }}>
                  <Zap size={13} color="#3A8259" />
                  <span>节奏与时长 (支持自定义)</span>
                </div>
                <CustomDurationSection
                  title={editTimerType === 'countdown' ? '单次专注时长' : '建议专注目标'}
                  value={editFocusDuration}
                  presets={FOCUS_PRESETS}
                  min={1}
                  max={180}
                  stepPresets={[1, 5]}
                  onSelect={(val) => setEditFocusDuration(val)}
                />
              </div>

              {/* 分类选择 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px' }}>
                  分类标签:
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategoryChange(cat.key as any, true)}
                      style={{
                        flex: 1,
                        padding: '5px 0',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: editCategory === cat.key ? cat.color : 'rgba(215, 230, 220, 0.6)',
                        color: editCategory === cat.key ? '#FFFFFF' : '#4E6655',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 目标六维 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px' }}>
                  目标六维:
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['STR', 'DEX', 'INT', 'SPI', 'CON', 'CHA'] as const).map((attr) => (
                    <button
                      key={attr}
                      type="button"
                      onClick={() => setEditTargetAttr(attr)}
                      style={{
                        flex: 1,
                        padding: '5px 0',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: editTargetAttr === attr ? '#4338ca' : 'rgba(215, 230, 220, 0.6)',
                        color: editTargetAttr === attr ? '#FFFFFF' : '#4E6655',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {ATTR_MAP[attr]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 难易度 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px' }}>
                  任务难度:
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['easy', 'normal', 'hard', 'expert'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setEditDifficulty(diff)}
                      style={{
                        flex: 1,
                        padding: '5px 0',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: editDifficulty === diff ? DIFF_MAP[diff].color : 'rgba(215, 230, 220, 0.6)',
                        color: editDifficulty === diff ? '#FFFFFF' : '#4E6655',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {DIFF_MAP[diff].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 预计番茄数 */}
              <div>
                <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '6px' }}>
                  预计番茄数 (每个 {editFocusDuration} 分钟):
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setEditEstimated(num)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: editEstimated === num ? '#3A5A40' : 'rgba(215, 230, 220, 0.6)',
                        color: editEstimated === num ? '#FFFFFF' : '#344E41',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🍅 {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 固定底部操作按钮栏 */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 16px 12px',
                borderTop: '1px solid rgba(160, 185, 170, 0.3)',
                backgroundColor: '#EDF5EE',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'rgba(200, 215, 205, 0.65)',
                  color: '#4E6655',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#3A5A40',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(58, 90, 64, 0.3)',
                }}
              >
                保存修改
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. 新建任务集（大类）弹窗 */}
      {showAddGroupModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddGroupModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(25, 40, 30, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000,
            boxSizing: 'border-box',
          }}
        >
          <form
            onSubmit={handleCreateGroup}
            className="nm-card"
            style={{
              width: '100%',
              maxWidth: '340px',
              borderRadius: '22px',
              backgroundColor: '#F0F5F1',
              boxShadow: '0 16px 36px rgba(20, 40, 30, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(160, 185, 170, 0.3)',
                backgroundColor: '#EDF5EE',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#2F614C', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FolderPlus size={16} />
                <span>新建任务集 (大类)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddGroupModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6A8A73',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 表单内容 */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#6A8A73', marginBottom: '6px', fontWeight: 600 }}>
                  任务集大类名称
                </label>
                <input
                  type="text"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  placeholder="例如: 2026年终决战 / 考研政治 / 生活美学"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(160, 185, 170, 0.5)',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    color: '#283618',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#6A8A73', marginBottom: '6px', fontWeight: 600 }}>
                  主题色标
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {GROUP_PALETTE.map((color) => {
                    const isSelected = newGroupColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewGroupColor(color)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #283618' : '1px solid rgba(0,0,0,0.1)',
                          backgroundColor: color,
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 16px 14px',
                borderTop: '1px solid rgba(160, 185, 170, 0.3)',
                backgroundColor: '#EDF5EE',
              }}
            >
              <button
                type="button"
                onClick={() => setShowAddGroupModal(false)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'rgba(200, 215, 205, 0.65)',
                  color: '#4E6655',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#3A5A40',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(58, 90, 64, 0.3)',
                }}
              >
                创建任务集
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. 移动任务到大类（任务集）弹窗 */}
      {movingTask && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setMovingTask(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(25, 40, 30, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000,
            boxSizing: 'border-box',
          }}
        >
          <div
            className="nm-card"
            style={{
              width: '100%',
              maxWidth: '320px',
              borderRadius: '22px',
              backgroundColor: '#F0F5F1',
              boxShadow: '0 16px 36px rgba(20, 40, 30, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(160, 185, 170, 0.3)',
                backgroundColor: '#EDF5EE',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#2F614C' }}>
                  移动任务到大类
                </div>
                <div style={{ fontSize: '10px', color: '#6A8A73', marginTop: '2px' }}>
                  任务: {movingTask.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMovingTask(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6A8A73',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#6A8A73', marginBottom: '2px' }}>
                选择目标任务集:
              </div>
              {groups.map((g) => {
                const isCurrent = (movingTask.groupId || groups[0]?.id) === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => handleMoveTask(movingTask.id, g.id)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: isCurrent ? '1.5px solid rgba(160, 185, 170, 0.3)' : '1px solid rgba(160, 185, 170, 0.4)',
                      backgroundColor: isCurrent ? 'rgba(215, 230, 220, 0.3)' : '#FFFFFF',
                      color: isCurrent ? '#8A9A90' : '#283618',
                      fontSize: '12px',
                      fontWeight: isCurrent ? 500 : 700,
                      cursor: isCurrent ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: g.color || '#5096C6' }} />
                      <span>{g.title}</span>
                    </div>
                    {isCurrent && (
                      <span style={{ fontSize: '10px', color: '#6A8A73' }}>(当前大类)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
