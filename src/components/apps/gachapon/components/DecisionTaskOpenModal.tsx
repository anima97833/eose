import React, { useState, useEffect } from 'react';
import { DecisionTaskItem, CAPSULE_COLORS, GachaPalette } from '../core/gachaTypes';
import { gachaAudio } from '../core/gachaAudio';
import { RotateCcw, CheckCircle2, Play, ExternalLink, Sparkles } from 'lucide-react';

interface DecisionTaskOpenModalProps {
  task: DecisionTaskItem;
  palette: GachaPalette;
  onClose: () => void;
  onReturnToMachine: (id: string) => void;
  onMarkComplete: (task: DecisionTaskItem) => void;
  onOpenApp?: (appId: string) => void;
}

export const DecisionTaskOpenModal: React.FC<DecisionTaskOpenModalProps> = ({
  task,
  palette,
  onClose,
  onReturnToMachine,
  onMarkComplete,
  onOpenApp,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCompletedAnim, setIsCompletedAnim] = useState<boolean>(false);

  const cCol = CAPSULE_COLORS[task.colorKey] || CAPSULE_COLORS.blue;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      gachaAudio.playPop();
    }, 220);
    return () => clearTimeout(timer);
  }, []);

  const handleReturn = () => {
    onReturnToMachine(task.id);
    onClose();
  };

  const handleComplete = () => {
    setIsCompletedAnim(true);
    gachaAudio.playComplete();
    setTimeout(() => {
      onMarkComplete(task);
      onClose();
    }, 850);
  };

  const handleLaunchApp = () => {
    if (task.source === 'pomodoro') {
      onOpenApp?.('pomodoro');
    } else {
      onOpenApp?.('diary');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(26, 20, 22, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCompletedAnim) {
          handleReturn();
        }
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 顶部胶囊裂开外壳 */}
        <div
          style={{
            position: 'relative',
            width: 140,
            height: 70,
            marginBottom: -25,
            zIndex: 10,
          }}
        >
          {/* 左半壳 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 4,
              width: 64,
              height: 64,
              borderRadius: '50% 50% 12px 12px',
              background: `linear-gradient(135deg, ${cCol.top}, ${palette.secondary})`,
              border: `2.5px solid ${palette.secondary}`,
              transformOrigin: 'bottom left',
              transform: isOpen ? 'translate(-38px, -18px) rotate(-35deg)' : 'none',
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          />
          {/* 右半壳 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 4,
              width: 64,
              height: 64,
              borderRadius: '12px 12px 50% 50%',
              background: cCol.bottom,
              border: `2.5px solid ${palette.secondary}`,
              transformOrigin: 'bottom right',
              transform: isOpen ? 'translate(38px, -18px) rotate(35deg)' : 'none',
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          />
        </div>

        {/* 内部展开的决断任务小纸条 */}
        <div
          style={{
            width: '100%',
            background: '#FFFDF9',
            borderRadius: 22,
            border: `2.5px solid ${palette.secondary}`,
            boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
            padding: '24px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
            opacity: isOpen ? 1 : 0,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
          }}
        >
          {/* 来源标记 Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: 12,
              background: task.source === 'pomodoro' ? '#FEE2E2' : '#E0F2FE',
              color: task.source === 'pomodoro' ? '#B91C1C' : '#0369A1',
              fontSize: 11,
              fontWeight: 800,
              marginBottom: 10,
              border: `1px solid ${task.source === 'pomodoro' ? '#FCA5A5' : '#BAE6FD'}`,
            }}
          >
            <span>{task.sourceLabel}</span>
          </div>

          {/* 图标 */}
          <div
            style={{
              fontSize: 38,
              marginBottom: 10,
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.08))',
            }}
          >
            {task.icon}
          </div>

          {/* 任务标题 */}
          <div
            style={{
              fontSize: 19,
              fontWeight: 900,
              color: '#1F2937',
              lineHeight: 1.4,
              marginBottom: 8,
              wordBreak: 'break-word',
              letterSpacing: 0.3,
            }}
          >
            {task.title}
          </div>

          {/* 任务补充信息 */}
          {task.desc && (
            <div
              style={{
                fontSize: 12,
                color: '#6B7280',
                marginBottom: 18,
                fontWeight: 600,
                background: 'rgba(0,0,0,0.03)',
                padding: '4px 10px',
                borderRadius: 8,
              }}
            >
              {task.desc}
            </div>
          )}

          {/* 命运决断提示 */}
          <div
            style={{
              fontSize: 11,
              color: palette.secondary,
              fontWeight: 800,
              marginBottom: 16,
              opacity: 0.85,
            }}
          >
            🎯 命运已为您决断：现在就做这件！
          </div>

          {/* 按钮动作栏 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, width: '100%' }}>
            {/* 核心动作：开启专注 / 前往日记 */}
            {onOpenApp && (
              <button
                onClick={handleLaunchApp}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: 14,
                  border: `2px solid ${palette.buttonBorder}`,
                  background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: `0 3px 0 ${palette.buttonBorder}`,
                }}
              >
                {task.source === 'pomodoro' ? (
                  <>
                    <Play size={16} fill="#FFFFFF" />
                    <span>🍅 立即开启番茄专注</span>
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    <span>🌌 前往世界线手账打卡</span>
                  </>
                )}
              </button>
            )}

            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              {/* 放回再抽 */}
              <button
                onClick={handleReturn}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: `1.5px solid ${palette.buttonBorder}`,
                  background: palette.buttonBg,
                  color: palette.buttonText,
                  fontWeight: 800,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  boxShadow: `0 2px 0 ${palette.buttonBorder}33`,
                }}
              >
                <RotateCcw size={14} />
                <span>放回</span>
              </button>

              {/* 搞定打钩 */}
              <button
                onClick={handleComplete}
                disabled={isCompletedAnim}
                style={{
                  flex: 1.2,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: `1.5px solid ${palette.buttonBorder}`,
                  background: '#10B981',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 #059669',
                }}
              >
                <CheckCircle2 size={15} />
                <span>搞定打钩</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
