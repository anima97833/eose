import React, { useState } from 'react';
import { Plus, Check, Trash2, Target, CheckCircle2, Circle } from 'lucide-react';
import { PomodoroTaskRecord, db } from '../../../core/storage/db';

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
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'work' | 'study' | 'read' | 'fitness' | 'life'>('work');
  const [newTargetAttr, setNewTargetAttr] = useState<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA'>('INT');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'normal' | 'hard' | 'expert'>('normal');
  const [newEstimated, setNewEstimated] = useState<number>(2);

  const handleCategoryChange = (catKey: 'work' | 'study' | 'read' | 'fitness' | 'life') => {
    setNewCategory(catKey);
    const catMeta = CATEGORIES.find((c) => c.key === catKey);
    if (catMeta) {
      setNewTargetAttr(catMeta.defaultAttr);
    }
  };

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
      createdAt: Date.now(),
    };

    await db.pomodoro_tasks.put(newTask);
    setNewTitle('');
    setShowAddModal(false);
    onRefreshTasks();
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
            绑定事项至番茄钟，对比预估与实际用时
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
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

              {/* 操作区：指定为当前专注 / 删除 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

      {/* 新建任务弹窗 */}
      {showAddModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(30, 45, 35, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999,
          }}
        >
          <form
            onSubmit={handleAddTask}
            className="nm-card"
            style={{
              width: '100%',
              borderRadius: '20px',
              padding: '18px 16px',
              backgroundColor: '#F0F5F1',
              boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#2F614C' }}>
              添加专注任务
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
                    onClick={() => handleCategoryChange(cat.key as any)}
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
                预计番茄数 (每个25分钟):
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

            {/* 按钮组 */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: 'rgba(200, 215, 205, 0.6)',
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
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: '#3A5A40',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                确认创建
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
