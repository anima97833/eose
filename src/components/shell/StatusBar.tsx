import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';
import { recordClockTap } from '../../core/quest/easterEggEngine';

interface StatusBarProps {
  isMobileScreen?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = () => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        paddingTop: 'calc(var(--sat) + 8px)',
        paddingLeft: 'calc(var(--sal) + 20px)',
        paddingRight: 'calc(var(--sar) + 20px)',
        paddingBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        color: 'var(--nm-text-main)',
        fontSize: '13px',
        fontWeight: 600,
        zIndex: 50,
      }}
    >
      {/* 左侧时钟 */}
      <span
        onClick={recordClockTap}
        style={{ letterSpacing: '0.2px', cursor: 'pointer', userSelect: 'none' }}
        title="双击或轻触"
      >
        {timeStr || '12:00'}
      </span>

      {/* 右侧状态图标组 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Signal size={14} strokeWidth={2.5} style={{ opacity: 0.85 }} />
        <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.85 }}>5G</span>
        <Wifi size={14} strokeWidth={2.5} style={{ opacity: 0.85 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600 }}>92%</span>
          <BatteryMedium size={17} strokeWidth={2.2} style={{ opacity: 0.9 }} />
        </div>
      </div>
    </div>
  );
};
