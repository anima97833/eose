import React from 'react';
import { X, HeartPulse, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { RPGDebuff } from '../../../../core/rpg/types';

interface StatusDebuffSheetProps {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  debuffs: RPGDebuff[];
  onToggleDebuff: (id: string) => void;
  onRest: () => void;
  onClose: () => void;
}

export const StatusDebuffSheet: React.FC<StatusDebuffSheetProps> = ({
  hp,
  maxHp,
  mp,
  maxMp,
  debuffs,
  onToggleDebuff,
  onRest,
  onClose,
}) => {
  const isFatigued = hp < 20;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'rgba(33, 48, 71, 0.45)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="nm-card"
        style={{
          width: '100%',
          maxHeight: '86%',
          background: '#E9EEF5',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderBottom: 'none',
          boxShadow: '0 -10px 30px rgba(166, 180, 200, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#334257' }}>
              状态
            </span>
            {isFatigued ? (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#dc2626',
                  background: 'rgba(239, 68, 68, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                过度疲劳
              </span>
            ) : (
              <span
                className="nm-inset-sm"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#059669',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                状态良好
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="nm-btn"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              color: '#7D8CA3',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div
          style={{
            padding: '14px 18px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* 体力与精力核心雕刻卡片 */}
          <div
            className="nm-card-sm"
            style={{
              background: '#EBF1F8',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* HP 体力 */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  fontSize: '13px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <HeartPulse size={16} />
                  今日体力
                </span>
                <span style={{ fontWeight: 800, color: '#334257' }}>
                  {hp} / {maxHp}
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  background: '#DFE5EF',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: 'inset 1.5px 1.5px 3px rgba(166, 180, 200, 0.6), inset -1px -1px 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((hp / maxHp) * 100))}%`,
                    background: hp < 20
                      ? 'linear-gradient(90deg, #f87171, #ef4444)'
                      : 'linear-gradient(90deg, #34d399, #10b981)',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* MP 精力 */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  fontSize: '13px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Zap size={16} />
                  精神专注
                </span>
                <span style={{ fontWeight: 800, color: '#334257' }}>
                  {mp} / {maxMp}
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  background: '#DFE5EF',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: 'inset 1.5px 1.5px 3px rgba(166, 180, 200, 0.6), inset -1px -1px 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((mp / maxMp) * 100))}%`,
                    background: 'linear-gradient(90deg, #818cf8, #6366f1)',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* 小憩休息按钮 */}
            <button
              onClick={onRest}
              className="nm-btn"
              style={{
                marginTop: '4px',
                padding: '9px 0',
                borderRadius: '12px',
                color: '#5096C6',
                fontWeight: 700,
                fontSize: '13px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              深度小憩
            </button>
          </div>

          {/* 负面效果列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#7D8CA3' }}>
              负面状态
            </span>

            {debuffs.map((deb) => (
              <div
                key={deb.id}
                onClick={() => onToggleDebuff(deb.id)}
                className={deb.active ? 'nm-inset-sm' : 'nm-card-sm'}
                style={{
                  background: deb.active ? '#DFE5EF' : '#EBF1F8',
                  borderRadius: '16px',
                  border: deb.active ? '1px solid #fecdd3' : '1px solid rgba(255, 255, 255, 0.85)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    className="nm-btn"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      color: deb.active ? '#ef4444' : '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {deb.active ? <AlertTriangle size={17} /> : <CheckCircle size={17} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: deb.active ? '#b91c1c' : '#334257',
                      }}
                    >
                      {deb.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#7D8CA3' }}>
                      {deb.effectText}
                    </span>
                  </div>
                </div>

                <span
                  className="nm-inset-sm"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '8px',
                    color: deb.active ? '#ef4444' : '#10b981',
                  }}
                >
                  {deb.active ? '作用中' : '已清除'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
