import React, { useState } from 'react';
import { Plus, Check, Trash2, Target, CheckCircle2, Circle, Edit3, X, Zap, Clock } from 'lucide-react';
import { PomodoroTaskRecord, db } from '../../../core/storage/db';
import { CustomDurationSection, FOCUS_PRESETS } from './CustomDurationSection';

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
  // 新建任务弹窗状态
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'work' | 'study' | 'read' | 'fitness' | 'life'>('work');
  const [newTargetAttr, setNewTargetAttr] = useState<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA'>('INT');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'normal' | 'hard' | 'expert'>('normal');
  const [newEstimated, setNewEstimated] = useState<number>(2);
  const [newFocusDuration, setNewFocusDuration] = useState<number>(25);
  const [newTimerType, setNewTimerType] = useState<'countdown' | 'countup'>('countdown');

  // 编辑任务弹窗状态
  const [editingTask, setEditingTask] = useState<PomodoroTaskRecord | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<'work' | 'study' | 'read' | 'fitness' | 'life'>('work');
  const [editTargetAttr, setEditTargetAttr] = useState<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA'>('INT');
  const [editDifficulty, setEditDifficulty] = useState<'easy' | 'normal' | 'hard' | 'expert'>('normal');
  const [editEstimated, setEditEstimated] = useState<number>(2);
  const [editFocusDuration, setEditFocusDuration] = useState<number>(25);
  const [editTimerType, setEditTimerType] = useState<'countdown' | 'countup'>('countdown');

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

  // 创建新任务
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

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
      createdAt: Date.now(),
    };

    await db.pomodoro_tasks.put(newTask);
    setNewTitle('');
    setShowAddModal(false);
    onRefreshTasks();
  };

  // 打开编辑任务弹窗
  const handleOpenEdit = (task: PomodoroTaskRecord) => {
    setEditingTask(task);
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
    };

    await db.pomodoro_tasks.put(updated);
    setEditingTask(null);
    onRefreshTasks();

    // 如果当前正在专注此任务，更新目标
    if (activeTaskId === updated.id) {
      onSelectTask(updated);
    }
  };

  const handleToggleComplete = async (task: PomodoroTaskRecord) => {
    task.isCompleted = !task.isCompleted;
    await db.pomodoro_tasks.put(task);
    onRefreshTasks();
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
      {/* 头部：标题与新增按钮 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#2F614C' }}>
            任务清单 (Tasks)
          </div>
          <div style={{ fontSize: '11px', color: '#6A8A73' }}>
            支持自定义专属时长与正/倒计时模式
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '16px',
            backgroundColor: '#3A5A40',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(58, 90, 64, 0.3)',
          }}
        >
          <Plus size={14} />
          <span>新建任务</span>
        </button>
      </div>

      {/* 任务列表卡片 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {tasks.map((task) => {
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
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                backgroundColor: isCurrentActive ? 'rgba(230, 245, 235, 0.95)' : 'var(--nm-bg)',
                border: isCurrentActive ? '1.5px solid #4E937A' : '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              {/* 复选框与标题 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <button
                  type="button"
                  onClick={() => handleToggleComplete(task)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: task.isCompleted ? '#4E937A' : '#A0AEC0',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {task.isCompleted ? <CheckCircle2 size={19} /> : <Circle size={19} />}
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

              {/* 操作区：指定为当前专注 / 编辑 / 删除 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                  onClick={() => handleOpenEdit(task)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#557962',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title="编辑任务与用时"
                >
                  <Edit3 size={14} />
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
                  }}
                  title="删除任务"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div
            style={{
              padding: '30px 0',
              textAlign: 'center',
              color: '#8A9A90',
              fontSize: '12px',
            }}
          >
            暂无任务，点击右上角新建任务吧~
          </div>
        )}
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
    </div>
  );
};
