import React, { useEffect, useState } from 'react';

interface SpeakerGrillProps {
  isPlaying: boolean;
  accentColor: string;
}

export const SpeakerGrill: React.FC<SpeakerGrillProps> = ({ isPlaying, accentColor }) => {
  // 模拟播放时的动态频谱高度
  const [barHeights, setBarHeights] = useState<number[]>(() =>
    Array.from({ length: 16 }, () => 20)
  );

  useEffect(() => {
    if (!isPlaying) {
      setBarHeights(Array.from({ length: 16 }, () => 14));
      return;
    }

    const interval = setInterval(() => {
      setBarHeights(
        Array.from({ length: 16 }, () => Math.floor(Math.random() * 55) + 15)
      );
    }, 110);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        padding: '12px 14px',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        boxShadow:
          'inset 0 3px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(255, 255, 255, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* 动态跳动脉冲光谱 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          height: '42px',
        }}
      >
        {barHeights.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              maxWidth: '6px',
              height: `${isPlaying ? h : 10}%`,
              minHeight: '4px',
              borderRadius: '2px',
              background: isPlaying
                ? `linear-gradient(180deg, #38BDF8 0%, ${accentColor} 70%, #2563EB 100%)`
                : '#334155',
              boxShadow: isPlaying ? `0 0 6px ${accentColor}80` : 'none',
              transition: 'height 0.1s ease',
            }}
          />
        ))}
      </div>

      {/* 底部扬声器铭牌 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '4px',
        }}
      >
        <span
          style={{
            fontSize: '9px',
            color: '#64748B',
            fontWeight: 800,
            letterSpacing: '0.1em',
            fontFamily: 'monospace',
          }}
        >
          HI-FI DYNAMIC ACOUSTIC
        </span>
        <span
          style={{
            fontSize: '9px',
            color: isPlaying ? '#10B981' : '#64748B',
            fontWeight: 700,
            fontFamily: 'monospace',
          }}
        >
          {isPlaying ? '● LIVE STREAM' : '○ STANDBY'}
        </span>
      </div>
    </div>
  );
};
