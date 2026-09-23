import React, { useRef } from 'react';

interface FrequencyDialProps {
  currentFreq: number; // 87.5 ~ 108.0
  onFreqChange: (freq: number) => void;
  accentColor: string;
  glowColor: string;
  isLockedStation: boolean;
}

const MIN_FREQ = 87.5;
const MAX_FREQ = 108.0;

export const FrequencyDial: React.FC<FrequencyDialProps> = ({
  currentFreq,
  onFreqChange,
  accentColor,
  glowColor,
  isLockedStation,
}) => {
  const dialRef = useRef<HTMLDivElement>(null);

  // 计算游标在刻度盘上的百分比 (0% ~ 100%)
  const percentage = Math.min(
    100,
    Math.max(0, ((currentFreq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100)
  );

  // 点击刻度盘直接粗调
  const handleDialClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, clickX / rect.width));
    const newFreq = +(MIN_FREQ + ratio * (MAX_FREQ - MIN_FREQ)).toFixed(1);
    onFreqChange(newFreq);
  };

  const majorTicks = [88, 92, 96, 100, 104, 108];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        padding: '12px 14px 14px',
        borderRadius: '18px',
        background: 'linear-gradient(180deg, #18202F 0%, #0F172A 100%)',
        boxShadow:
          '0 12px 24px -6px rgba(0, 0, 0, 0.45), inset 0 2px 5px rgba(0, 0, 0, 0.6), inset 0 -1px 2px rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      ref={dialRef}
      onClick={handleDialClick}
      title="点击任意刻度可平滑调频"
    >
      {/* 玻璃微反光与琥珀背光 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 120%, ${glowColor}25 0%, transparent 75%)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 顶部指示带：标头与信号锁定 LED */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.12em',
              color: '#F8FAFC',
              fontFamily: 'monospace',
            }}
          >
            FM TUNING BAND
          </span>
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              fontFamily: 'monospace',
            }}
          >
            87.5 - 108.0 MHz
          </span>
        </div>

        {/* 调谐锁定信号灯 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: isLockedStation ? '#10B981' : '#64748B',
              boxShadow: isLockedStation
                ? '0 0 10px 2px #10B981, inset 0 1px 2px rgba(255, 255, 255, 0.8)'
                : 'none',
              transition: 'all 0.3s ease',
            }}
          />
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 800,
              color: isLockedStation ? '#34D399' : '#64748B',
              letterSpacing: '0.05em',
              fontFamily: 'monospace',
            }}
          >
            {isLockedStation ? 'TUNED' : 'SEARCH'}
          </span>
        </div>
      </div>

      {/* 刻度槽与游标滑动区 */}
      <div
        style={{
          position: 'relative',
          height: '42px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          zIndex: 2,
        }}
      >
        {/* 刻度柱线渲染 */}
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '0 4px',
          }}
        >
          {Array.from({ length: 41 }).map((_, idx) => {
            const isMajor = idx % 8 === 0;
            const isMedium = idx % 4 === 0;
            return (
              <div
                key={idx}
                style={{
                  width: isMajor ? '2px' : '1px',
                  height: isMajor ? '16px' : isMedium ? '11px' : '7px',
                  backgroundColor: isMajor ? '#E2E8F0' : isMedium ? '#94A3B8' : '#475569',
                  borderRadius: '1px',
                  opacity: isMajor ? 0.95 : 0.6,
                }}
              />
            );
          })}
        </div>

        {/* 主刻度数字 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 2px',
            position: 'relative',
          }}
        >
          {majorTicks.map((tick) => (
            <span
              key={tick}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#CBD5E1',
                fontFamily: 'monospace',
                letterSpacing: '-0.02em',
              }}
            >
              {tick}
            </span>
          ))}
        </div>

        {/* 红色发光调谐游标针 (Needle) */}
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            bottom: '0px',
            left: `${percentage}%`,
            width: '2.5px',
            backgroundColor: '#EF4444',
            boxShadow: '0 0 10px 2px rgba(239, 68, 68, 0.9), 0 0 3px #FFFFFF',
            transform: 'translateX(-50%)',
            transition: 'left 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
            pointerEvents: 'none',
          }}
        >
          {/* 针尖高光徽记 */}
          <div
            style={{
              position: 'absolute',
              top: '-3px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 6px #EF4444',
            }}
          />
        </div>
      </div>
    </div>
  );
};
