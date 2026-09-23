import React, { useState } from 'react';
import { X, Sparkles, HelpCircle, Check, RotateCcw, Brain, Shield } from 'lucide-react';
import { FactQuizItem, getRandomFactQuiz } from '../../../../core/quest/uselessFactService';
import { AwardedStatResult } from '../../../../core/quest/questTypes';

interface FactQuizModalProps {
  palette: string[];
  onAwardStat: (stat: AwardedStatResult) => void;
  onClose: () => void;
}

export const FactQuizModal: React.FC<FactQuizModalProps> = ({
  palette,
  onAwardStat,
  onClose,
}) => {
  const [quiz, setQuiz] = useState<FactQuizItem>(getRandomFactQuiz);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const primaryColor = palette[2] || '#5096C6';

  const handleSelect = (choice: boolean) => {
    if (isAnswered) return;
    setUserChoice(choice);
    setIsAnswered(true);

    const isCorrect = choice === quiz.isTrue;
    if (isCorrect) {
      // 答对：智力 +8
      onAwardStat({
        key: 'INT',
        name: '智力',
        icon: '📚',
        gain: 8,
      });
    } else {
      // 答错：体质 +5（被冷知识冻伤，锻炼了体魄抗性）
      onAwardStat({
        key: 'CON',
        name: '体质',
        icon: '💪',
        gain: 5,
      });
    }
  };

  const handleNext = () => {
    setQuiz(getRandomFactQuiz());
    setUserChoice(null);
    setIsAnswered(false);
  };

  const isCorrect = userChoice === quiz.isTrue;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 150,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'backdropFadeIn 0.2s ease-out',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '338px',
          background: 'var(--nm-bg, #E9EEF5)',
          borderRadius: '26px',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popInSpring 0.3s cubic-bezier(0.18, 0.9, 0.32, 1.2)',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '13px 16px',
            borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--nm-bg-lighter, #F2F6FB)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '11px',
                background: `linear-gradient(135deg, ${primaryColor}, #3B82F6)`,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 3px 8px ${primaryColor}44`,
              }}
            >
              <HelpCircle size={18} strokeWidth={2.6} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--nm-text-main, #334257)' }}>
                  真的假的？脑洞测验
                </span>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    color: primaryColor,
                    background: `${primaryColor}18`,
                    border: `1px solid ${primaryColor}30`,
                    padding: '1px 5px',
                    borderRadius: '6px',
                  }}
                >
                  {quiz.category}
                </span>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--nm-text-sub, #7D8CA3)' }}>
                彩蛋奇遇 · 辨识真伪
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-xs)',
              border: 'none',
              color: 'var(--nm-text-sub)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* 主体卡片区 */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 便签式命题展示框 */}
          <div
            style={{
              position: 'relative',
              padding: '16px 14px',
              borderRadius: '16px',
              background: '#FFFFFF',
              border: '1.5px solid rgba(166, 180, 200, 0.3)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
              minHeight: '85px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* 拟物黄色回形针小装饰 */}
            <div
              style={{
                position: 'absolute',
                top: '-7px',
                right: '18px',
                width: '18px',
                height: '14px',
                borderRadius: '6px 6px 0 0',
                background: '#F59E0B',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            />

            <span
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#1E293B',
                lineHeight: 1.5,
                textAlign: 'left',
              }}
            >
              “ {quiz.statement} ”
            </span>

            {quiz.source && (
              <span
                style={{
                  fontSize: '9.5px',
                  color: '#94A3B8',
                  marginTop: '8px',
                  fontWeight: 700,
                  textAlign: 'right',
                }}
              >
                —— 考证来源：{quiz.source}
              </span>
            )}
          </div>

          {/* 交互区：未作答时显示【⭕ 真的】与【❌ 假的】按钮 */}
          {!isAnswered ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleSelect(true)}
                style={{
                  padding: '12px 0',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  background: 'linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%)',
                  color: '#065F46',
                  fontSize: '14px',
                  fontWeight: 900,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'transform 0.1s ease',
                }}
              >
                <span style={{ fontSize: '16px' }}>⭕</span>
                <span>是真的！</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelect(false)}
                style={{
                  padding: '12px 0',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(239, 68, 68, 0.4)',
                  background: 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)',
                  color: '#991B1B',
                  fontSize: '14px',
                  fontWeight: 900,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'transform 0.1s ease',
                }}
              >
                <span style={{ fontSize: '16px' }}>❌</span>
                <span>胡说八道</span>
              </button>
            </div>
          ) : (
            /* 作答后揭晓真相与科普解析卡 */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                animation: 'fadeIn 0.25s ease-out',
              }}
            >
              {/* 印章横幅 */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: isCorrect ? '#ECFDF5' : '#FFFBEB',
                  border: isCorrect ? '1.5px solid #10B981' : '1.5px solid #F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{isCorrect ? '🎉' : '🥶'}</span>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 900, color: isCorrect ? '#065F46' : '#92400E' }}>
                      {isCorrect ? '直觉敏锐！辩真成功' : '被冷知识冰封啦！'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700 }}>
                      正确答案其实是：【{quiz.isTrue ? '是真的' : '是假的'}】
                    </div>
                  </div>
                </div>

                {/* 获得的六维加成徽标 */}
                <div
                  style={{
                    padding: '3px 8px',
                    borderRadius: '8px',
                    background: isCorrect ? '#10B981' : '#F59E0B',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span>{isCorrect ? '智力 +8' : '体质 +5'}</span>
                </div>
              </div>

              {/* 趣味科普解密文案 */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(166, 180, 200, 0.3)',
                  fontSize: '11.5px',
                  color: '#334155',
                  lineHeight: 1.5,
                  fontWeight: 700,
                }}
              >
                💡 <span style={{ fontWeight: 900, color: '#0F172A' }}>科学解密：</span>
                {quiz.explanation}
              </div>

              {/* 操作按钮区 */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '12px',
                    border: '1px solid rgba(166, 180, 200, 0.4)',
                    background: 'var(--nm-bg)',
                    color: 'var(--nm-text-main)',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    boxShadow: 'var(--nm-convex-xs)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <RotateCcw size={12} />
                  <span>再辨一题</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1.2,
                    padding: '8px 0',
                    borderRadius: '12px',
                    border: 'none',
                    background: `linear-gradient(135deg, ${primaryColor}, #3B82F6)`,
                    color: '#FFFFFF',
                    fontSize: '11.5px',
                    fontWeight: 900,
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.35)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={12} />
                  <span>收下灵光 · 离开</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
