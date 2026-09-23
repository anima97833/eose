import React from 'react';
import { RotateCw, RotateCcw } from 'lucide-react';

interface TuningKnobProps {
  angle: number; // 0 ~ 360 度
  onRotateStep: (delta: number) => void;
  accentColor: string;
  label?: string;
}

export const TuningKnob: React.FC<TuningKnobProps> = ({
  angle,
  onRotateStep,
  accentColor,
  label = 'TUNING',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        userSelect: 'none',
      }}
    >
      {/* 旋钮主体外框与两侧快捷微调 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* 逆时针微调按键 */}
        <button
          type="button"
          onClick={() => onRotateStep(-1)}
          className="nm-rebound-btn nm-btn-circle"
          style={{
            width: '32px',
            height: '32px',
            color: '#64748B',
            border: 'none',
          }}
          title="向低频微调"
        >
          <RotateCcw size={15} strokeWidth={2.4} />
        </button>

        {/* 拟物金属大旋钮 */}
        <div
          style={{
            position: 'relative',
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #F8FAFC 0%, #D8E2EC 100%)',
            boxShadow:
              '0 10px 20px -3px rgba(0, 0, 0, 0.22), 0 3px 6px rgba(0, 0, 0, 0.12), inset 0 2px 3px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
          onClick={() => onRotateStep(1)}
          title="点击或使用两侧按钮旋转调频"
        >
          {/* 金属拉丝内圈 */}
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 50%, #94A3B8 100%)',
              boxShadow:
                'inset 0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `rotate(${angle}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {/* 指示小凹点 (Indicator Dot) */}
            <div
              style={{
                position: 'absolute',
                top: '7px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                boxShadow:
                  '0 0 6px rgba(239, 68, 68, 0.8), inset 0 1px 1px rgba(0, 0, 0, 0.4)',
              }}
            />

            {/* 旋钮核心轴承 */}
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #F1F5F9 0%, #94A3B8 100%)',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
              }}
            />
          </div>
        </div>

        {/* 顺时针微调按键 */}
        <button
          type="button"
          onClick={() => onRotateStep(1)}
          className="nm-rebound-btn nm-btn-circle"
          style={{
            width: '32px',
            height: '32px',
            color: '#64748B',
            border: 'none',
          }}
          title="向高频微调"
        >
          <RotateCw size={15} strokeWidth={2.4} />
        </button>
      </div>

      {/* 旋钮说明铭牌 */}
      <span
        style={{
          fontSize: '10px',
          fontWeight: 800,
          color: 'var(--nm-text-sub, #64748B)',
          letterSpacing: '0.12em',
          fontFamily: 'monospace',
        }}
      >
        {label}
      </span>
    </div>
  );
};
