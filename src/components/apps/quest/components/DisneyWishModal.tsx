import React, { useState, useEffect } from 'react';
import { DisneyWishCard, getRandomDisneyWish } from '../../../../core/quest/disneyWishService';

interface DisneyWishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisneyWishModal: React.FC<DisneyWishModalProps> = ({ isOpen, onClose }) => {
  const [currentWish, setCurrentWish] = useState<DisneyWishCard>(() => getRandomDisneyWish());
  const [isFlipping, setIsFlipping] = useState(false);

  // 每次打开时抽取一张新卡片
  useEffect(() => {
    if (isOpen) {
      setCurrentWish(getRandomDisneyWish());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 换一签
  const handleShuffle = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentWish((prev) => getRandomDisneyWish(prev.id));
      setIsFlipping(false);
    }, 280);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(7, 13, 27, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '16px',
        animation: 'starryFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={onClose}
    >
      {/* 动态星空微粒背景 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {/* 闪烁星芒 1 */}
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '18%',
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: '#FDE047',
            boxShadow: '0 0 12px 3px rgba(253, 224, 71, 0.8)',
            animation: 'twinkleStar 2.4s infinite ease-in-out',
          }}
        />
        {/* 闪烁星芒 2 */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            right: '22%',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#BAE6FD',
            boxShadow: '0 0 14px 4px rgba(186, 230, 253, 0.8)',
            animation: 'twinkleStar 3.1s infinite ease-in-out 0.8s',
          }}
        />
        {/* 闪烁星芒 3 */}
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '26%',
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: '#F472B6',
            boxShadow: '0 0 14px 3px rgba(244, 114, 182, 0.7)',
            animation: 'twinkleStar 2.8s infinite ease-in-out 1.4s',
          }}
        />
        {/* 闪烁星芒 4 */}
        <div
          style={{
            position: 'absolute',
            bottom: '28%',
            right: '16%',
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: '#C084FC',
            boxShadow: '0 0 10px 2px rgba(192, 132, 252, 0.8)',
            animation: 'twinkleStar 3.6s infinite ease-in-out 0.4s',
          }}
        />
      </div>

      {/* 选项 A：星夜飘落 · 纯美治愈晚安信笺 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '430px',
          background: 'linear-gradient(175deg, #FFFFFF 0%, #F8FAFD 55%, #F1F5F9 100%)',
          borderRadius: '30px',
          boxShadow:
            '0 28px 65px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.85) inset, 0 0 35px rgba(186, 230, 253, 0.3)',
          padding: '24px 22px 22px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isFlipping ? 0.35 : 1,
          transform: isFlipping ? 'scale(0.96) translateY(8px)' : 'scale(1) translateY(0)',
          animation: 'cardGlideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* 顶部轻奢火漆星光印章 */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '5px 14px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.9) 0%, rgba(253, 230, 138, 0.9) 100%)',
            boxShadow: '0 3px 10px rgba(217, 119, 6, 0.18), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '13px' }}>✨</span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#92400E',
              letterSpacing: '0.08em',
            }}
          >
            童话星愿签 · 晚安寄语
          </span>
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              color: '#B45309',
              fontWeight: 600,
            }}
          >
            {currentWish.healingTag}
          </span>
        </div>

        {/* 角色立绘展示窗 */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '190px',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12), 0 1px 0 rgba(255, 255, 255, 0.9) inset',
            border: '2px solid #FFFFFF',
            marginBottom: '18px',
            backgroundColor: '#F1F5F9',
          }}
        >
          <img
            src={currentWish.avatarUrl}
            alt={currentWish.character}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%',
              transition: 'transform 0.5s ease',
            }}
          />
          {/* 底部微柔渐变投影 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0) 55%)',
            }}
          />

          {/* 角色名字与作品标签贴 */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '14px',
              right: '14px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              color: '#FFFFFF',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.04em' }}>
                {currentWish.character}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    marginLeft: '6px',
                    opacity: 0.85,
                  }}
                >
                  {currentWish.characterEn}
                </span>
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '1px' }}>
                {currentWish.movie}
              </div>
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              ⭐
            </div>
          </div>
        </div>

        {/* 寄语文本框（中英双语，优雅字体排印，纯净心灵抚慰，绝不加六维属性） */}
        <div
          style={{
            width: '100%',
            padding: '16px 14px',
            borderRadius: '18px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 18px rgba(148, 163, 184, 0.12), 0 1px 3px rgba(0, 0, 0, 0.04)',
            border: '1px solid #EEF2F6',
            marginBottom: '20px',
            position: 'relative',
          }}
        >
          {/* 装饰引号 */}
          <span
            style={{
              position: 'absolute',
              top: '6px',
              left: '12px',
              fontSize: '26px',
              lineHeight: 1,
              color: '#CBD5E1',
              fontFamily: 'Georgia, serif',
            }}
          >
            “
          </span>

          <p
            style={{
              margin: '8px 8px 10px',
              fontSize: '15px',
              lineHeight: 1.68,
              fontWeight: 600,
              color: '#1E293B',
              letterSpacing: '0.02em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {currentWish.quoteCn}
          </p>

          <p
            style={{
              margin: '0 8px 4px',
              fontSize: '11px',
              lineHeight: 1.5,
              color: '#94A3B8',
              fontStyle: 'italic',
            }}
          >
            {currentWish.quoteEn}
          </p>

          <span
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '12px',
              fontSize: '26px',
              lineHeight: 1,
              color: '#CBD5E1',
              fontFamily: 'Georgia, serif',
            }}
          >
            ”
          </span>
        </div>

        {/* 底部操作行 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
          }}
        >
          {/* 换一签 */}
          <button
            onClick={handleShuffle}
            title="换一张星愿信笺"
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F1F5F9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
            }}
          >
            <span>🌠</span>
            <span>换一签</span>
          </button>

          {/* 晚安 · 收下今日星愿（关闭弹窗） */}
          <button
            onClick={onClose}
            style={{
              flex: 2,
              padding: '12px 16px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #38BDF8 0%, #2563EB 100%)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.42), 0 1px 0 rgba(255, 255, 255, 0.3) inset',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                '0 10px 24px -4px rgba(37, 99, 235, 0.52), 0 1px 0 rgba(255, 255, 255, 0.3) inset';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 8px 20px -4px rgba(37, 99, 235, 0.42), 0 1px 0 rgba(255, 255, 255, 0.3) inset';
            }}
          >
            <span>晚安 · 收下今日星愿</span>
            <span style={{ fontSize: '15px' }}>✨</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes starryFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardGlideDown {
          from {
            opacity: 0;
            transform: translateY(-42px) scale(0.92) rotate(-1.5deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }
        @keyframes twinkleStar {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
};
