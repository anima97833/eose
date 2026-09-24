import React, { useState, useEffect } from 'react';
import { WishItem, CAPSULE_COLORS, GachaPalette } from '../core/gachaTypes';
import { gachaAudio } from '../core/gachaAudio';
import { RotateCcw, Check, Sparkles } from 'lucide-react';

interface CapsuleOpenModalProps {
  wish: WishItem;
  palette: GachaPalette;
  onClose: () => void;
  onReturnToMachine: (id: string) => void;
  onMarkComplete: (id: string) => void;
}

export const CapsuleOpenModal: React.FC<CapsuleOpenModalProps> = ({
  wish,
  palette,
  onClose,
  onReturnToMachine,
  onMarkComplete,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCompletedAnim, setIsCompletedAnim] = useState<boolean>(false);

  const cCol = CAPSULE_COLORS[wish.colorKey] || CAPSULE_COLORS.pink;

  useEffect(() => {
    // 弹窗打开后 200ms 自动触发胶囊对半裂开动效
    const timer = setTimeout(() => {
      setIsOpen(true);
      gachaAudio.playPop();
    }, 220);
    return () => clearTimeout(timer);
  }, []);

  const handleReturn = () => {
    onReturnToMachine(wish.id);
    onClose();
  };

  const handleComplete = () => {
    setIsCompletedAnim(true);
    gachaAudio.playComplete();
    setTimeout(() => {
      onMarkComplete(wish.id);
      onClose();
    }, 900);
  };

  const dateStr = new Date(wish.createdAt).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  });

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
      {/* 胶囊开裂与纸条展开容器 */}
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
        {/* 顶部胶囊裂开的两半外壳 */}
        <div
          style={{
            position: 'relative',
            width: 140,
            height: 70,
            marginBottom: -25,
            zIndex: 10,
          }}
        >
          {/* 左半壳 (带色半球) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 35,
              width: 70,
              height: 70,
              borderRadius: '50% 0 0 50%',
              background: `linear-gradient(135deg, ${cCol.top}, ${palette.secondary})`,
              border: `3px solid ${palette.secondary}`,
              transform: isOpen ? 'translate(-48px, -20px) rotate(-35deg)' : 'none',
              transition: 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          />
          {/* 右半壳 (白色半球) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 35,
              width: 70,
              height: 70,
              borderRadius: '0 50% 50% 0',
              background: '#FFFFFF',
              border: `3px solid ${palette.secondary}`,
              transform: isOpen ? 'translate(48px, -15px) rotate(30deg)' : 'none',
              transition: 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          />
        </div>

        {/* 核心心愿折叠小纸条 */}
        <div
          style={{
            width: '100%',
            background: 'linear-gradient(180deg, #FFFCF5 0%, #FBF6E9 100%)',
            border: `3px solid ${palette.secondary}`,
            borderRadius: 20,
            padding: '36px 24px 28px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
            transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.4) translateY(60px)',
            opacity: isOpen ? 1 : 0,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* 纸张顶部手折压痕纹路 */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              width: 60,
              height: 3,
              background: 'rgba(0,0,0,0.06)',
              borderRadius: 2,
            }}
          />

          {/* 心愿小图标 */}
          <div
            style={{
              fontSize: 42,
              marginBottom: 12,
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.08))',
            }}
          >
            {wish.icon || '✨'}
          </div>

          {/* 心愿正文 */}
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#3A2E2B',
              lineHeight: 1.5,
              marginBottom: 12,
              wordBreak: 'break-word',
              fontFamily: 'serif, "PingFang SC", sans-serif',
              letterSpacing: 0.5,
            }}
          >
            {wish.content}
          </div>

          {/* 写入时间简标 */}
          <div
            style={{
              fontSize: 12,
              color: '#8C7D73',
              marginBottom: 24,
              fontWeight: 600,
            }}
          >
            {dateStr} 放入
          </div>

          {/* 纯粹简洁的操作按钮栏 */}
          <div
            style={{
              display: 'flex',
              gap: 14,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {/* 放回按钮 */}
            <button
              onClick={handleReturn}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 14,
                border: `2px solid ${palette.secondary}`,
                background: '#FFFFFF',
                color: palette.secondary,
                fontWeight: 800,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 4px 0 rgba(0,0,0,0.08)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <RotateCcw size={16} />
              <span>放回</span>
            </button>

            {/* 完成按钮 */}
            <button
              onClick={handleComplete}
              disabled={isCompletedAnim}
              style={{
                flex: 1.2,
                padding: '12px 18px',
                borderRadius: 14,
                border: `2px solid ${palette.secondary}`,
                background: `linear-gradient(180deg, ${palette.primary}, ${palette.secondary})`,
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: isCompletedAnim ? 'default' : 'pointer',
                boxShadow: `0 4px 0 ${palette.secondary}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <Check size={18} strokeWidth={3} />
              <span>完成</span>
            </button>
          </div>

          {/* 心情增加动效气泡 */}
          {isCompletedAnim && (
            <div
              style={{
                position: 'absolute',
                top: '40%',
                background: '#FFDE59',
                color: '#573D00',
                border: '2px solid #573D00',
                padding: '8px 18px',
                borderRadius: 24,
                fontWeight: 900,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                animation: 'moodPopUp 0.8s ease-out forwards',
                zIndex: 20,
              }}
            >
              <Sparkles size={18} />
              <span>心情 +10 ✨</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes moodPopUp {
          0% {
            transform: scale(0.6) translateY(20px);
            opacity: 0;
          }
          40% {
            transform: scale(1.15) translateY(-20px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(-50px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
