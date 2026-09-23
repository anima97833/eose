import React from 'react';
import { AwardedStatResult } from '../../../../core/quest/questTypes';

interface FloatingStatToastProps {
  stat: AwardedStatResult;
  palette: string[];
}

export const FloatingStatToast: React.FC<FloatingStatToastProps> = ({ stat, palette }) => {
  const primaryColor = palette[2] || '#5096C6';

  return (
    <div
      style={{
        position: 'absolute',
        top: '64px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 16px',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${primaryColor}55`,
        boxShadow: `0 8px 24px ${primaryColor}30, 0 2px 6px rgba(0, 0, 0, 0.08)`,
        animation: 'floatUpAndFade 1.8s cubic-bezier(0.18, 0.89, 0.32, 1) forwards',
      }}
    >
      <style>{`
        @keyframes floatUpAndFade {
          0% {
            opacity: 0;
            transform: translate(-50%, 15px) scale(0.85);
          }
          18% {
            opacity: 1;
            transform: translate(-50%, 0px) scale(1.05);
          }
          30% {
            transform: translate(-50%, -4px) scale(1);
          }
          75% {
            opacity: 1;
            transform: translate(-50%, -18px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -36px) scale(0.92);
          }
        }
      `}</style>

      {/* 动态图标与光芒 */}
      <span
        style={{
          fontSize: '18px',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
        }}
      >
        {stat.icon}
      </span>

      {/* 属性名称与加成 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 900,
            color: '#1E293B',
            letterSpacing: '0.2px',
          }}
        >
          {stat.name}
        </span>
        <span
          style={{
            fontSize: '15px',
            fontWeight: 900,
            color: '#10B981',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          +{stat.gain}
        </span>
      </div>

      {/* 微拟物光晕星芒 */}
      <span style={{ fontSize: '11px', color: '#F59E0B', marginLeft: '1px' }}>✨</span>
    </div>
  );
};
