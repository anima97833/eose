import React, { useState, useEffect } from 'react';
import { EntertainmentItem, CAPSULE_COLORS, GachaPalette } from '../core/gachaTypes';
import { gachaAudio } from '../core/gachaAudio';
import { RotateCcw, Sparkles, BookOpen, Film, Joystick, ExternalLink } from 'lucide-react';

interface EntertainmentOpenModalProps {
  item: EntertainmentItem;
  palette: GachaPalette;
  onClose: () => void;
  onReturnToMachine: (id: string) => void;
  onLockForToday: (item: EntertainmentItem) => void;
  onOpenApp?: (appId: string) => void;
}

export const EntertainmentOpenModal: React.FC<EntertainmentOpenModalProps> = ({
  item,
  palette,
  onClose,
  onReturnToMachine,
  onLockForToday,
  onOpenApp,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLockedAnim, setIsLockedAnim] = useState<boolean>(false);

  const cCol = CAPSULE_COLORS[item.colorKey] || CAPSULE_COLORS.purple;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      gachaAudio.playPop();
    }, 220);
    return () => clearTimeout(timer);
  }, []);

  const handleReturn = () => {
    onReturnToMachine(item.id);
    onClose();
  };

  const handleLock = () => {
    setIsLockedAnim(true);
    gachaAudio.playComplete();
    setTimeout(() => {
      onLockForToday(item);
      onClose();
    }, 600);
  };

  const handleLaunchApp = () => {
    if (item.type === 'book') {
      onOpenApp?.('bookvault');
    } else if (item.type === 'movie') {
      onOpenApp?.('cinema');
    } else if (item.type === 'game') {
      onOpenApp?.('gamevault');
    }
  };

  const isBook = item.type === 'book';
  const isMovie = item.type === 'movie';
  const isGame = item.type === 'game';

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
        padding: '20px 16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLockedAnim) {
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

        {/* 内部展开的娱乐纸条卡片 */}
        <div
          style={{
            width: '100%',
            background: '#FFFDF9',
            borderRadius: 22,
            border: `2.5px solid ${palette.secondary}`,
            boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
            padding: '24px 18px 18px',
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
          {/* 来源类型标签 Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: 12,
              background: isBook ? '#FEF3C7' : '#FCE7F3',
              color: isBook ? '#B45309' : '#BE185D',
              fontSize: 11,
              fontWeight: 800,
              marginBottom: 10,
              border: `1px solid ${isBook ? '#FDE68A' : '#FBCFE8'}`,
            }}
          >
            <span>{item.typeLabel}</span>
          </div>

          {/* 封面海报或大图标 */}
          <div
            style={{
              width: 72,
              height: isBook ? 96 : 104,
              borderRadius: isBook ? 8 : 10,
              overflow: 'hidden',
              background: '#F3F4F6',
              border: `2px solid ${palette.secondary}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              position: 'relative',
            }}
          >
            {item.coverUrl ? (
              <img
                src={item.coverUrl}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span style={{ fontSize: 36 }}>{item.icon}</span>
            )}
          </div>

          {/* 书影名称 */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#1F2937',
              lineHeight: 1.35,
              marginBottom: 4,
              wordBreak: 'break-word',
              letterSpacing: 0.3,
            }}
          >
            《{item.title}》
          </div>

          {/* 作者/上映信息 */}
          {item.subtitle && (
            <div
              style={{
                fontSize: 11.5,
                color: '#6B7280',
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              {item.subtitle}
            </div>
          )}

          {/* 进度/片长标记 */}
          {item.progressLabel && (
            <div
              style={{
                fontSize: 11,
                color: palette.secondary,
                fontWeight: 800,
                background: 'rgba(0,0,0,0.04)',
                padding: '3px 8px',
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              {item.progressLabel}
            </div>
          )}

          {/* 地球 Online 趣味寄语气泡 */}
          {item.flavorQuote && (
            <div
              style={{
                fontSize: 11,
                color: '#78350F',
                background: '#FEF9C3',
                border: '1px dashed #F59E0B',
                borderRadius: 10,
                padding: '6px 10px',
                lineHeight: 1.4,
                marginBottom: 14,
                fontWeight: 700,
                textAlign: 'left',
              }}
            >
              {item.flavorQuote}
            </div>
          )}

          {/* 按钮动作栏 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, width: '100%' }}>
            {/* 核心动作：直达书藏阅读 / 直达放映室 / 直达游戏私藏 */}
            {onOpenApp && (
              <button
                onClick={handleLaunchApp}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: 14,
                  border: `2px solid ${palette.buttonBorder}`,
                  background: isBook
                    ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                    : isMovie
                    ? 'linear-gradient(135deg, #EC4899, #BE185D)'
                    : 'linear-gradient(135deg, #10B981, #059669)',
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
                {isBook ? (
                  <>
                    <BookOpen size={16} strokeWidth={2.5} />
                    <span>📖 翻开书藏阅读</span>
                  </>
                ) : isMovie ? (
                  <>
                    <Film size={16} strokeWidth={2.5} />
                    <span>🍿 前往时光放映室</span>
                  </>
                ) : (
                  <>
                    <Joystick size={16} strokeWidth={2.5} />
                    <span>🕹️ 启动游戏仓</span>
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
                  fontSize: 12.5,
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

              {/* 锁定今日消遣 */}
              <button
                onClick={handleLock}
                disabled={isLockedAnim}
                style={{
                  flex: 1.3,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: `1.5px solid ${palette.buttonBorder}`,
                  background: '#8B5CF6',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 12.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 #6D28D9',
                }}
              >
                <Sparkles size={14} />
                <span>锁定今日消遣</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
