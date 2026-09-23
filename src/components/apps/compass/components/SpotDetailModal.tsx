import React from 'react';
import { X, MapPin, Calendar, Clock, Users, Trash2, Sparkles, Navigation } from 'lucide-react';
import { CheckInSpot, SPOT_CATEGORIES } from '../../../../core/compass/types';

interface SpotDetailModalProps {
  spot: CheckInSpot;
  onClose: () => void;
  onCheckInAgain: (spot: CheckInSpot) => void;
  onDelete: (spotId: string) => void;
}

export const SpotDetailModal: React.FC<SpotDetailModalProps> = ({
  spot,
  onClose,
  onCheckInAgain,
  onDelete,
}) => {
  const cat = SPOT_CATEGORIES[spot.category] || SPOT_CATEGORIES.cafe;
  const isBase = spot.level >= 3;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(5px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 12px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%',
          maxHeight: '85%',
          overflowY: 'auto',
          backgroundColor: '#ebf1f8',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), inset 1px 1px 2px #ffffff',
          padding: '18px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'slideUpModal 0.25s ease-out',
        }}
      >
        {/* 头部：分类与关闭 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: cat.bgLight,
                border: `2px solid ${cat.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              {cat.icon}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#1a202c' }}>{spot.name}</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '8px',
                    background: isBase ? '#faad14' : '#5096C6',
                    color: '#fff',
                  }}
                >
                  Lv.{spot.level} {spot.levelTitle}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} />
                <span>{spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}</span>
                {spot.address && <span> · {spot.address}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              background: '#e0e7f1',
              boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#718096',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 核心统计卡片 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: '#e4ebf5',
            padding: '10px',
            borderRadius: '16px',
            boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.6), inset -2px -2px 5px #ffffff',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#718096' }}>累计打卡</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#2d3748' }}>{spot.checkInCount} 次</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#718096' }}>据点等级</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: isBase ? '#faad14' : '#5096C6' }}>
              ★ {spot.level} 阶
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#718096' }}>最近到访</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#2d3748', marginTop: '2px' }}>
              {new Date(spot.lastCheckInAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 打卡日期与随行人员 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: '14px',
            background: '#e9f0f8',
            boxShadow: 'inset 1px 1px 3px rgba(166, 180, 200, 0.4), inset -1px -1px 3px #ffffff',
            fontSize: '11px',
            color: '#4a5568',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={13} color="#5096C6" />
            <span style={{ fontWeight: 600 }}>
              {spot.customDate || new Date(spot.lastCheckInAt).toLocaleDateString('zh-CN')}
            </span>
            {spot.customTime && (
              <span style={{ color: '#718096' }}>{spot.customTime}</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={13} color="#5096C6" />
            <span style={{ fontWeight: 600, color: '#2d3748' }}>
              {spot.companions || '独自漫步'}
            </span>
          </div>
        </div>

        {/* 心情与手账便签 */}
        {spot.note && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '14px',
              background: '#f8fafc',
              borderLeft: `4px solid ${cat.color}`,
              fontSize: '12px',
              color: '#334155',
              lineHeight: 1.5,
              boxShadow: '1px 2px 5px rgba(0,0,0,0.06)',
            }}
          >
            {spot.note}
          </div>
        )}

        {/* 照片画廊 */}
        {spot.photos && spot.photos.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', marginBottom: '6px' }}>
              现场实景留念 ({spot.photos.length})
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {spot.photos.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '2px 3px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <img src={p} alt="spot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮区 */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button
            onClick={() => onCheckInAgain(spot)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #5096C6, #36729e)',
              boxShadow: '3px 4px 10px rgba(80, 150, 198, 0.5), -2px -2px 6px #ffffff',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} />
            <span>再次在此打卡</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm(`确定要从地图中移除「${spot.name}」吗？`)) {
                onDelete(spot.id);
                onClose();
              }
            }}
            title="删除据点"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '16px',
              border: 'none',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '2px 2px 6px rgba(239, 68, 68, 0.25)',
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
