import React from 'react';
import { Footprints, MapPin, Layers, Eye, EyeOff, BarChart2 } from 'lucide-react';

interface TrailControlBarProps {
  isWalking: boolean;
  walkDistanceMeters: number;
  walkDurationSeconds: number;
  showFog: boolean;
  tileProviderKey: string;
  onOpenReport: () => void;
  onTriggerCheckIn: () => void;
  onToggleFog: () => void;
  onChangeTileProvider: () => void;
}

export const TrailControlBar: React.FC<TrailControlBarProps> = ({
  isWalking,
  walkDistanceMeters,
  walkDurationSeconds,
  showFog,
  tileProviderKey,
  onOpenReport,
  onTriggerCheckIn,
  onToggleFog,
  onChangeTileProvider,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        right: '12px',
        zIndex: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'rgba(238, 243, 250, 0.94)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        boxShadow: '0 8px 24px rgba(166, 180, 200, 0.7), inset 1px 1px 2px #ffffff',
        border: '1px solid rgba(255, 255, 255, 0.8)',
      }}
    >
      {/* 左侧：出行统计入口按钮 (替换原开始漫步) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onOpenReport}
          style={{
            padding: '8px 13px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #e6f9f0, #c8f3dd)',
            boxShadow: '3px 3px 7px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
            color: '#0f5948',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
          }}
        >
          <BarChart2 size={15} color="#0f5948" />
          <span>出行统计</span>
        </button>

        {isWalking && (
          <span style={{ fontSize: '11px', color: '#096dd9', fontWeight: 700 }}>
            {(walkDistanceMeters / 1000).toFixed(2)} km
          </span>
        )}
      </div>

      {/* 中间：打卡大按钮 */}
      <button
        onClick={onTriggerCheckIn}
        style={{
          padding: '10px 18px',
          borderRadius: '20px',
          border: 'none',
          background: 'linear-gradient(135deg, #5096C6, #3275a5)',
          boxShadow: '4px 5px 12px rgba(80, 150, 198, 0.5), -2px -2px 6px #ffffff',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transform: 'translateY(-2px)',
        }}
      >
        <MapPin size={16} />
        <span>在此打卡</span>
      </button>

      {/* 右侧小功能区：迷雾开关与底图切换 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* 迷雾切换 */}
        <button
          onClick={onToggleFog}
          title={showFog ? '隐藏战争迷雾' : '显示战争迷雾'}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            background: showFog ? '#e6f7ff' : '#ebf1f8',
            boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: showFog ? '#096dd9' : '#718096',
          }}
        >
          {showFog ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>

        {/* 底图样式切换 */}
        <button
          onClick={onChangeTileProvider}
          title="切换高德矢量/卫星/极简样式"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            background: '#ebf1f8',
            boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#4a5568',
          }}
        >
          <Layers size={15} />
        </button>
      </div>
    </div>
  );
};
