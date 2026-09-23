import React, { useState, useEffect } from 'react';
import { Compass, Navigation, Mountain, Footprints, ShieldCheck, Zap } from 'lucide-react';
import { getHeadingDirectionName, formatCoordinateDMS } from '../../../../core/compass/locationService';
import { loadRPGProfile } from '../../../../core/rpg/rpgStorage';

interface CompassHUDProps {
  heading: number;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  speed: number | null;
  walkDistanceMeters: number;
  unlockedCount: number;
  isWalking: boolean;
  onCenterMap?: () => void;
  isCompact?: boolean;
}

export const CompassHUD: React.FC<CompassHUDProps> = ({
  heading,
  latitude,
  longitude,
  altitude,
  speed,
  walkDistanceMeters,
  unlockedCount,
  isWalking,
  onCenterMap,
  isCompact = false,
}) => {
  const [hpInfo, setHpInfo] = useState<{ hp: number; maxHp: number }>(() => {
    try {
      const p = loadRPGProfile();
      return { hp: p.hp ?? 100, maxHp: p.maxHp || 100 };
    } catch {
      return { hp: 100, maxHp: 100 };
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const p = loadRPGProfile();
        setHpInfo({ hp: p.hp ?? 100, maxHp: p.maxHp || 100 });
      } catch {}
    };
    window.addEventListener('cloudfly_rpg_updated', handleUpdate);
    return () => window.removeEventListener('cloudfly_rpg_updated', handleUpdate);
  }, []);

  const dirName = getHeadingDirectionName(heading);
  const coords =
    latitude !== null && longitude !== null
      ? formatCoordinateDMS(latitude, longitude)
      : { latStr: '--°--\'--" N', lngStr: '--°--\'--" E' };

  // 紧凑模式（放置在地图顶部悬浮）
  if (isCompact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'rgba(238, 242, 248, 0.92)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '4px 4px 10px rgba(166, 180, 200, 0.6), -3px -3px 8px rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          width: '100%',
          boxSizing: 'border-box',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 微型动态旋转指针 */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#e8edf5',
              boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.7), inset -2px -2px 5px #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                transform: `rotate(${heading}deg)`,
                transition: 'transform 0.15s ease-out',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Navigation size={18} color="#e53935" fill="#e53935" />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{Math.round(heading)}°</span>
              <span style={{ fontSize: '11px', color: '#5096C6', fontWeight: 600 }}>{dirName}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#718096', fontFamily: 'monospace' }}>
              {latitude ? `${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : '正在定位...'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* 今日体力胶囊指示 */}
          <div
            title={`今日体力: ${hpInfo.hp}/${hpInfo.maxHp}（打卡消耗 6~12 点）`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: '4px 7px',
              borderRadius: '12px',
              background: hpInfo.hp <= 20 ? '#fff1f0' : '#f0fdf4',
              color: hpInfo.hp <= 20 ? '#cf1322' : '#15803d',
              border: `1px solid ${hpInfo.hp <= 20 ? '#ffa39e' : '#bbf7d0'}`,
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.04)',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            <Zap size={11} color={hpInfo.hp <= 20 ? '#cf1322' : '#16a34a'} fill={hpInfo.hp <= 20 ? '#cf1322' : '#16a34a'} />
            <span>{hpInfo.hp}</span>
          </div>

          {isWalking && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '10px',
                background: '#e6f7ff',
                color: '#096dd9',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <Footprints size={12} />
              <span>{(walkDistanceMeters / 1000).toFixed(2)} km</span>
            </div>
          )}

          {onCenterMap && (
            <button
              onClick={onCenterMap}
              style={{
                padding: '6px 10px',
                borderRadius: '12px',
                border: 'none',
                background: '#ebf0f8',
                boxShadow: '3px 3px 6px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
                color: '#4a5568',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Compass size={13} color="#5096C6" />
              <span>回位</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 完整拟真机械大罗盘视图
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 12px 10px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 拟真双层微拟物机械罗盘盘面 */}
      <div
        style={{
          width: '210px',
          height: '210px',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #e4ebf5, #f5f9ff)',
          boxShadow: '10px 10px 22px rgba(166, 180, 200, 0.7), -10px -10px 22px #ffffff',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #f0f4f9',
          margin: '0 auto 16px',
        }}
      >
        {/* 内凹金属刻度内盘 */}
        <div
          style={{
            width: '176px',
            height: '176px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #dbe3ed, #f3f7fd)',
            boxShadow: 'inset 6px 6px 12px rgba(166, 180, 200, 0.8), inset -6px -6px 12px #ffffff',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 罗盘四个主要方向刻度标记 */}
          <span style={{ position: 'absolute', top: '8px', fontSize: '13px', fontWeight: 800, color: '#e53935' }}>北</span>
          <span style={{ position: 'absolute', bottom: '8px', fontSize: '12px', fontWeight: 700, color: '#4a5568' }}>南</span>
          <span style={{ position: 'absolute', left: '10px', fontSize: '12px', fontWeight: 700, color: '#4a5568' }}>西</span>
          <span style={{ position: 'absolute', right: '10px', fontSize: '12px', fontWeight: 700, color: '#4a5568' }}>东</span>

          {/* 360° 微细转动刻度环 */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              transform: `rotate(${-heading}deg)`,
              transition: 'transform 0.1s linear',
              pointerEvents: 'none',
            }}
          >
            {/* 30度一个刻度点 */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '50%',
                  width: '2px',
                  height: deg % 90 === 0 ? '8px' : '4px',
                  background: deg === 0 ? '#e53935' : 'rgba(100, 120, 150, 0.4)',
                  transformOrigin: '50% 84px',
                  transform: `translateX(-50%) rotate(${deg}deg)`,
                }}
              />
            ))}
          </div>

          {/* 罗盘中心磁针（红蓝机械指针） */}
          <div
            style={{
              position: 'absolute',
              width: '22px',
              height: '130px',
              transform: `rotate(${heading}deg)`,
              transition: 'transform 0.15s cubic-bezier(0.1, 0.9, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 3,
            }}
          >
            {/* 北极红色尖端 */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderBottom: '55px solid #e53935',
                filter: 'drop-shadow(2px 2px 3px rgba(229, 57, 53, 0.35))',
              }}
            />
            {/* 南极深灰尖端 */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '55px solid #5a6a85',
                filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.2))',
              }}
            />
          </div>

          {/* 中心配重黄铜轴帽 */}
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #f6d365 0%, #fda085 100%)',
              boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.3)',
              zIndex: 5,
            }}
          />
        </div>
      </div>

      {/* 罗盘下方数值看板 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          width: '100%',
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#1a202c', letterSpacing: '0.5px' }}>
          {Math.round(heading)}° <span style={{ fontSize: '18px', color: '#5096C6' }}>{dirName}</span>
        </div>

        {/* 经纬度 */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#4a5568',
            background: '#eef3fa',
            padding: '4px 12px',
            borderRadius: '20px',
            boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.6), inset -2px -2px 5px #ffffff',
          }}
        >
          <span>{coords.latStr}</span>
          <span style={{ color: '#cbd5e0' }}>|</span>
          <span>{coords.lngStr}</span>
        </div>

        {/* 状态统计小卡片 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            width: '100%',
            marginTop: '10px',
          }}
        >
          <div
            style={{
              padding: '8px 6px',
              borderRadius: '14px',
              background: '#ebf1f8',
              boxShadow: '3px 3px 7px rgba(166, 180, 200, 0.5), -2px -2px 5px #ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#718096' }}>
              <Mountain size={11} color="#5096C6" /> 海拔
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#2d3748', marginTop: '2px' }}>
              {altitude ? `${Math.round(altitude)} m` : '8 m'}
            </div>
          </div>

          <div
            style={{
              padding: '8px 6px',
              borderRadius: '14px',
              background: '#ebf1f8',
              boxShadow: '3px 3px 7px rgba(166, 180, 200, 0.5), -2px -2px 5px #ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#718096' }}>
              <Footprints size={11} color="#389e0d" /> 漫步里程
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#2d3748', marginTop: '2px' }}>
              {(walkDistanceMeters / 1000).toFixed(2)} km
            </div>
          </div>

          <div
            style={{
              padding: '8px 6px',
              borderRadius: '14px',
              background: '#ebf1f8',
              boxShadow: '3px 3px 7px rgba(166, 180, 200, 0.5), -2px -2px 5px #ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#718096' }}>
              <ShieldCheck size={11} color="#722ed1" /> 点亮街区
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#2d3748', marginTop: '2px' }}>
              {unlockedCount} 块
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
