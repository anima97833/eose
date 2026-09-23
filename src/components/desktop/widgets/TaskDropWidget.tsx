import React, { useState } from 'react';
import {
  DroppedTask,
  getCurrentTaskDrop,
  skipToNextTask,
  completeTodayTask,
  isTodayTaskCompleted,
  generateAITaskDrop,
} from '../../../core/taskdrop/taskDropEngine';
import { addRPGAttribute } from '../../../core/rpg/rpgStorage';
import { Sparkles, Check, FastForward, Loader2 } from 'lucide-react';

export const TaskDropWidget: React.FC = () => {
  const [task, setTask] = useState<DroppedTask>(() => getCurrentTaskDrop());
  const [isCompletedToday, setIsCompletedToday] = useState<boolean>(() => isTodayTaskCompleted());
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [animating, setAnimating] = useState<'none' | 'done' | 'skip'>('none');
  const [floatingToast, setFloatingToast] = useState<string | null>(null);

  // 1. 跳过任务 (skip)：仅在当日未完成时生效，无事发生换一个新任务
  const handleSkip = () => {
    if (isCompletedToday) return;
    setAnimating('skip');
    setTimeout(() => {
      const next = skipToNextTask();
      setTask(next);
      setAnimating('none');
    }, 180);
  };

  // 2. 完成任务 (done)：六维-精神 +5，记录今日已完成，不再更新新任务直到次日
  const handleDone = () => {
    if (isCompletedToday) return;
    // 增加六维-精神 5 点
    const res = addRPGAttribute('SPI', 5);
    // 标记今日完成
    completeTodayTask();

    // 飘字浮动提示
    setFloatingToast(`精神 +5 🔮 (${res.newValue}/${res.maxValue})`);
    setAnimating('done');

    setTimeout(() => {
      setFloatingToast(null);
      setIsCompletedToday(true);
      setAnimating('none');
    }, 700);
  };

  // 3. 保留的 AI 灵感选项 (仅未完成时可点)
  const handleTriggerAI = async () => {
    if (isAiLoading || isCompletedToday) return;
    setIsAiLoading(true);
    try {
      const aiTask = await generateAITaskDrop();
      setTask(aiTask);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div
      className="nm-card-sm"
      style={{
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '16px',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        background: '#FFFFFF',
      }}
    >
      {/* 飘字动效: 精神 +5 */}
      {floatingToast && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeInScale 0.25s ease-out',
          }}
        >
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(109, 40, 217, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✨</span>
            <span>{floatingToast}</span>
          </div>
        </div>
      )}

      {/* 顶部 Header: 居中显示“任务掉落”，去掉骰子 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {/* 左侧占位以保持居中对称 */}
        <div style={{ width: '24px', height: '24px' }} />

        {/* 中间文字：任务掉落 */}
        <span
          style={{
            fontSize: '12px',
            fontWeight: 900,
            color: '#475569',
            letterSpacing: '0.4px',
            fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
          }}
        >
          任务掉落
        </span>

        {/* 右上角纯图标灵感按钮 (无文字，仅保留图标) */}
        <button
          type="button"
          onClick={handleTriggerAI}
          title="召唤 AI 灵感掉落"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '1px solid #CBD5E1',
            background: task.source === 'ai' ? '#EDE9FE' : '#F8FAFC',
            color: task.source === 'ai' ? '#7C3AED' : '#64748B',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease',
          }}
        >
          {isAiLoading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} color={task.source === 'ai' ? '#7C3AED' : '#8B5CF6'} />
          )}
        </button>
      </div>

      {/* 中间内容区: 若今日已完成，显示锁定达成提示；未完成则显示具体任务 */}
      {isCompletedToday ? (
        <div
          style={{
            margin: '3px 0',
            padding: '6px 8px',
            borderRadius: '10px',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '46px',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>✨</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#15803D' }}>今日任务已达成</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>明日 00:00 掉落下个任务</span>
          </div>
        </div>
      ) : (
        <div
          style={{
            margin: '3px 0',
            padding: '6px 8px',
            borderRadius: '10px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '46px',
            opacity: animating !== 'none' ? 0.4 : 1,
            transition: 'opacity 0.15s ease',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>
            {task.icon}
          </span>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#1E293B',
              lineHeight: '1.4',
              wordBreak: 'break-word',
            }}
          >
            {task.title}
          </span>
        </div>
      )}

      {/* 底部操作区: 若今日已完成，显示整条圆满微标；未完成则显示 skip 与 完成 */}
      {isCompletedToday ? (
        <div
          style={{
            width: '100%',
            padding: '5px 0',
            borderRadius: '10px',
            border: '1px solid #86EFAC',
            background: '#DCFCE7',
            color: '#166534',
            fontSize: '11px',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: 'inset 0 1px 2px rgba(22, 101, 52, 0.08)',
            userSelect: 'none',
          }}
        >
          <Check size={12} strokeWidth={2.8} />
          <span>今日已圆满（精神 +5）</span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            width: '100%',
          }}
        >
          {/* skip 按钮: 无事发生 */}
          <button
            type="button"
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: '5px 0',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              background: '#F1F5F9',
              color: '#64748B',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'background 0.1s ease',
            }}
          >
            <FastForward size={11} />
            <span>跳过</span>
          </button>

          {/* done 按钮: 纯粹只写“完成”，绝不折行 */}
          <button
            type="button"
            onClick={handleDone}
            style={{
              flex: 1,
              padding: '5px 0',
              borderRadius: '10px',
              border: '1px solid #10B981',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
              transition: 'transform 0.1s ease',
            }}
          >
            <Check size={12} strokeWidth={2.8} />
            <span>完成</span>
          </button>
        </div>
      )}
    </div>
  );
};
