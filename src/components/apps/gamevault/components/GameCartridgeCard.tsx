import React, { useState } from 'react';
import { GameRecord, PLATFORM_NAMES, STATUS_NAMES } from '../../../../core/games/gameTypes';
import { Star, Clock, Trophy, MoreVertical, Edit3, Trash2 } from 'lucide-react';

interface GameCartridgeCardProps {
  game: GameRecord;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const GameCartridgeCard: React.FC<GameCartridgeCardProps> = ({
  game,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = () => {
    switch (game.status) {
      case 'playing':
        return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'cleared':
        return { bg: '#FEF9C3', text: '#B45309', border: '#FDE047' };
      case 'wishlist':
        return { bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' };
      case 'dropped':
        return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
    }
  };

  const statusStyle = getStatusColor();

  return (
    <div
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        background: 'linear-gradient(145deg, #E6E9EE 0%, #D8DCE3 100%)',
        borderRadius: '16px',
        border: '2px solid #502428',
        boxShadow:
          '0 4px 10px rgba(80, 36, 40, 0.18), inset 0 2px 2px rgba(255,255,255,0.7), inset 0 -2px 3px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        padding: '10px 10px 10px 12px',
        gap: '12px',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* 卡带左侧抓握防滑凹槽 (Retro Grip Ridges) */}
      <div
        style={{
          position: 'absolute',
          left: '3px',
          top: '12px',
          bottom: '12px',
          width: '5px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity: 0.45,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '100%',
              height: '3px',
              borderRadius: '2px',
              background: '#502428',
              boxShadow: '0 1px 1px rgba(255,255,255,0.6)',
            }}
          />
        ))}
      </div>

      {/* 卡带正面贴纸图片槽 (Glossy Cartridge Label) */}
      <div
        style={{
          width: '74px',
          height: '92px',
          borderRadius: '10px',
          border: '2px solid #502428',
          background: '#2B2D42',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.display = 'none';
              if (target.parentElement) {
                const fallback = target.parentElement.querySelector('.card-img-fallback') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className="card-img-fallback"
          style={{
            display: game.coverUrl ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: game.platform === 'mobile' ? '#EC4899' : '#3B82F6',
            color: '#FFFFFF',
            textAlign: 'center',
            padding: '4px',
          }}
        >
          <span style={{ fontSize: '24px', lineHeight: 1 }}>{game.platform === 'mobile' ? '📱' : '🎮'}</span>
          <span style={{ fontSize: '10px', fontWeight: 900, marginTop: '4px', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {game.title}
          </span>
        </div>

        {/* 贴纸反光高光 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '35%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* 平台角标 */}
        <div
          style={{
            position: 'absolute',
            bottom: '3px',
            right: '3px',
            background: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            padding: '1px 3px',
            color: '#FFFFFF',
            fontSize: '8px',
            fontWeight: 900,
          }}
        >
          {PLATFORM_NAMES[game.platform]}
        </div>
      </div>

      {/* 卡带右侧信息面 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* 头部：标题与更多操作 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
            <div
              style={{
                fontSize: '14.5px',
                fontWeight: 900,
                color: '#341518',
                lineHeight: 1.3,
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {game.title}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: '#6B4A34',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                flexShrink: 0,
              }}
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* 状态徽章与时长 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '1px 6px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 900,
                background: statusStyle.bg,
                color: statusStyle.text,
                border: `1px solid ${statusStyle.border}`,
              }}
            >
              {STATUS_NAMES[game.status]}
            </span>

            {game.playtimeHours > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '10.5px',
                  color: '#6B5446',
                  fontWeight: 800,
                }}
              >
                <Clock size={11} />
                <span>{game.playtimeHours}h</span>
              </span>
            )}

            {game.rating && game.rating > 0 && (
              <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
                {Array.from({ length: game.rating }).map((_, i) => (
                  <Star key={i} size={11} fill="#F59E0B" color="#B45309" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部评语或通关日期 */}
        {game.comment ? (
          <div
            style={{
              fontSize: '10.5px',
              color: '#5C383C',
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '6px',
              padding: '3px 6px',
              border: '1px solid rgba(80,36,40,0.15)',
              lineHeight: 1.3,
              marginTop: '4px',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontStyle: 'italic',
            }}
          >
            “{game.comment}”
          </div>
        ) : game.tags && game.tags.length > 0 ? (
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px', overflow: 'hidden' }}>
            {game.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '9.5px',
                  color: '#8A5D4D',
                  background: 'rgba(0,0,0,0.04)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* 快捷操作浮层 */}
      {showMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '28px',
            right: '10px',
            zIndex: 30,
            background: '#FAF4E8',
            border: '2px solid #502428',
            borderRadius: '10px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '2px',
          }}
        >
          <button
            onClick={() => {
              setShowMenu(false);
              onEdit();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'none',
              border: 'none',
              fontSize: '11px',
              fontWeight: 800,
              color: '#502428',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Edit3 size={12} />
            <span>编辑记录</span>
          </button>
          <button
            onClick={() => {
              setShowMenu(false);
              onDelete();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'none',
              border: 'none',
              fontSize: '11px',
              fontWeight: 800,
              color: '#DC2626',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Trash2 size={12} />
            <span>移出私藏</span>
          </button>
        </div>
      )}
    </div>
  );
};
