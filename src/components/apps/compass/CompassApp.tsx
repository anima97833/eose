import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Sparkles, Check, Heart, Search } from 'lucide-react';
import { CompassHUD } from './components/CompassHUD';
import { LeafletMapView } from './components/LeafletMapView';
import { CheckInModal } from './components/CheckInModal';
import { SpotDetailModal } from './components/SpotDetailModal';
import { CitySearchModal } from './components/CitySearchModal';
import { TrailControlBar } from './components/TrailControlBar';
import { TravelWeeklyReportModal } from './components/TravelWeeklyReportModal';
import {
  CheckInSpot,
  DiscoveredArea,
  TrailPoint,
  WalkTrail,
} from '../../../core/compass/types';
import {
  loadCheckInSpots,
  loadDiscoveredAreas,
  unlockFogArea,
  loadWalkTrails,
  saveWalkTrails,
  getActiveTrail,
  saveActiveTrail,
  deleteCheckInSpot,
  checkInAtLocation,
} from '../../../core/compass/compassStorage';
import {
  watchDeviceOrientation,
  calculateDistanceMeters,
  DEFAULT_FALLBACK_LOCATION,
} from '../../../core/compass/locationService';
import { TILE_PROVIDERS } from '../../../core/compass/tileProviders';
import { consumeStaminaOnCheckIn } from '../../../core/rpg/rpgStorage';
import { recordCompassFullTurn } from '../../../core/quest/easterEggEngine';

interface CompassAppProps {
  onBack: () => void;
}

export const CompassApp: React.FC<CompassAppProps> = ({ onBack }) => {
  // 地图瓦片源（默认使用开源官方原生街区，绝对无水印）
  const [tileKey, setTileKey] = useState<string>('osmStandard');
  const [showFog, setShowFog] = useState<boolean>(false);

  // 传感器与定位状态
  const [heading, setHeading] = useState<number>(0);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);

  // 数据列表
  const [spots, setSpots] = useState<CheckInSpot[]>(loadCheckInSpots());
  const [discoveredAreas, setDiscoveredAreas] = useState<DiscoveredArea[]>(loadDiscoveredAreas());

  // 漫步状态
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [activeTrailPoints, setActiveTrailPoints] = useState<TrailPoint[]>([]);
  const [walkDistanceMeters, setWalkDistanceMeters] = useState<number>(0);
  const [walkDurationSeconds, setWalkDurationSeconds] = useState<number>(0);

  // 弹窗状态
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [checkInCoords, setCheckInCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<CheckInSpot | null>(null);
  const [editingSpot, setEditingSpot] = useState<CheckInSpot | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Toast 提示
  const [toastMsg, setToastMsg] = useState<{ text: string; sub?: string } | null>(null);

  const walkTimerRef = useRef<number | null>(null);
  const lastWalkPointRef = useRef<{ lat: number; lng: number } | null>(null);

  const showToast = (text: string, sub?: string) => {
    setToastMsg({ text, sub });
    setTimeout(() => setToastMsg(null), 3200);
  };

  // 1. 启动罗盘方向角监听（累计旋转 360° 触发微风去向彩蛋）
  useEffect(() => {
    let lastDeg: number | null = null;
    let accumulatedTurn = 0;

    const unwatch = watchDeviceOrientation((deg) => {
      setHeading(deg);
      if (lastDeg !== null) {
        let diff = Math.abs(deg - lastDeg);
        if (diff > 180) diff = 360 - diff;
        accumulatedTurn += diff;
        if (accumulatedTurn >= 360) {
          recordCompassFullTurn();
          accumulatedTurn = 0;
        }
      }
      lastDeg = deg;
    });
    return () => unwatch();
  }, []);

  // 2. 启动 GPS 定位监听
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      // 降级使用默认坐标
      setCurrentLat(DEFAULT_FALLBACK_LOCATION.lat);
      setCurrentLng(DEFAULT_FALLBACK_LOCATION.lng);
      return;
    }

    // 首先快速获取一次当前位置
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLat(pos.coords.latitude);
        setCurrentLng(pos.coords.longitude);
        setAltitude(pos.coords.altitude);
        setSpeed(pos.coords.speed);
        // 初次定位自动驱散周围迷雾
        unlockFogArea(pos.coords.latitude, pos.coords.longitude, 280);
      },
      (err) => {
        console.warn('获取当前GPS失败，使用沙盒默认坐标', err);
        setCurrentLat(DEFAULT_FALLBACK_LOCATION.lat);
        setCurrentLng(DEFAULT_FALLBACK_LOCATION.lng);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );

    // 持续监听运动与位置变化
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, altitude: alt, speed: spd } = pos.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        setAltitude(alt);
        setSpeed(spd);

        // 如果在漫步中，累加轨迹点与距离
        if (lastWalkPointRef.current) {
          const dist = calculateDistanceMeters(
            lastWalkPointRef.current.lat,
            lastWalkPointRef.current.lng,
            latitude,
            longitude
          );
          if (dist >= 10) {
            setWalkDistanceMeters((prev) => prev + dist);
            setActiveTrailPoints((prev) => [
              ...prev,
              { lat: latitude, lng: longitude, timestamp: Date.now(), speed: spd || undefined },
            ]);
            lastWalkPointRef.current = { lat: latitude, lng: longitude };

            // 移动超过50米自动驱散迷雾
            unlockFogArea(latitude, longitude, 250);
          }
        }
      },
      (err) => {
        console.warn('watchPosition 警告', err);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 3. 监听本地数据更新事件
  useEffect(() => {
    const handleSpotsUpdate = () => setSpots(loadCheckInSpots());
    const handleFogUpdate = () => setDiscoveredAreas(loadDiscoveredAreas());

    window.addEventListener('cloudfly_compass_spots_updated', handleSpotsUpdate);
    window.addEventListener('cloudfly_compass_fog_updated', handleFogUpdate);

    return () => {
      window.removeEventListener('cloudfly_compass_spots_updated', handleSpotsUpdate);
      window.removeEventListener('cloudfly_compass_fog_updated', handleFogUpdate);
    };
  }, []);

  // 4. 漫步计时器
  useEffect(() => {
    if (isWalking) {
      walkTimerRef.current = window.setInterval(() => {
        setWalkDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (walkTimerRef.current) {
        clearInterval(walkTimerRef.current);
        walkTimerRef.current = null;
      }
    }
    return () => {
      if (walkTimerRef.current) clearInterval(walkTimerRef.current);
    };
  }, [isWalking]);

  // 开启/结束漫步
  const handleToggleWalk = () => {
    if (!isWalking) {
      // 开始漫步
      setIsWalking(true);
      setWalkDistanceMeters(0);
      setWalkDurationSeconds(0);
      const startLat = currentLat || DEFAULT_FALLBACK_LOCATION.lat;
      const startLng = currentLng || DEFAULT_FALLBACK_LOCATION.lng;
      lastWalkPointRef.current = { lat: startLat, lng: startLng };
      setActiveTrailPoints([{ lat: startLat, lng: startLng, timestamp: Date.now() }]);
      showToast('漫步追踪已开启', '正在实时记录路线与点亮街区');
    } else {
      // 结束漫步并保存结算
      setIsWalking(false);
      lastWalkPointRef.current = null;
      if (walkDistanceMeters > 50) {
        const trail: WalkTrail = {
          id: `trail-${Date.now()}`,
          title: `户外漫步 · ${(walkDistanceMeters / 1000).toFixed(2)}km`,
          startTime: Date.now() - walkDurationSeconds * 1000,
          endTime: Date.now(),
          points: activeTrailPoints,
          distanceMeters: walkDistanceMeters,
          durationSeconds: walkDurationSeconds,
          isActive: false,
        };
        const trails = loadWalkTrails();
        trails.unshift(trail);
        saveWalkTrails(trails);
        showToast('漫步已结算！', `今日漫步 ${(walkDistanceMeters / 1000).toFixed(2)} 公里，已收录到手账`);
      } else {
        showToast('漫步已结束', '单次移动距离较短，未保存轨迹');
      }
    }
  };

  // 触发打卡
  const handleTriggerCheckIn = (targetCoords?: { lat: number; lng: number }) => {
    const lat = targetCoords ? targetCoords.lat : currentLat || DEFAULT_FALLBACK_LOCATION.lat;
    const lng = targetCoords ? targetCoords.lng : currentLng || DEFAULT_FALLBACK_LOCATION.lng;
    setEditingSpot(null);
    setCheckInCoords({ lat, lng });
    setIsCheckInOpen(true);
  };

  // 切换瓦片源
  const handleChangeTileProvider = () => {
    const keys = Object.keys(TILE_PROVIDERS);
    const nextIdx = (keys.indexOf(tileKey) + 1) % keys.length;
    setTileKey(keys[nextIdx]);
    showToast('地图底图已切换', TILE_PROVIDERS[keys[nextIdx]].name);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#eef3fa',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        userSelect: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部标题与功能栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px 8px',
          background: 'rgba(238, 243, 250, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.7)',
          zIndex: 800,
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: '#ebf1f8',
            boxShadow: '3px 3px 6px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
            cursor: 'pointer',
            color: '#4a5568',
          }}
        >
          <ArrowLeft size={16} />
        </button>

        <span style={{ fontSize: '15px', fontWeight: 800, color: '#1a202c', letterSpacing: '0.5px' }}>
          时空指南 · 探索地图
        </span>

        {/* 搜城市入口 */}
        <button
          onClick={() => setIsSearchOpen(true)}
          title="搜索城市或街区 (如: 天津, 五大道)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            borderRadius: '14px',
            border: 'none',
            background: '#e0e9f4',
            boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
            fontSize: '11px',
            fontWeight: 700,
            color: '#096dd9',
            cursor: 'pointer',
          }}
        >
          <Search size={13} color="#096dd9" />
          <span>搜城市</span>
        </button>
      </div>

      {/* 沉浸式地图核心视窗 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '4px' }}>
        {/* 地图核心视窗 */}
        <LeafletMapView
          currentLat={currentLat}
          currentLng={currentLng}
          heading={heading}
          spots={spots}
          discoveredAreas={discoveredAreas}
          activeTrailPoints={activeTrailPoints}
          tileProviderKey={tileKey}
          showFog={showFog}
          onSelectSpot={(spot) => setSelectedSpot(spot)}
          onMapClick={(lat, lng) => handleTriggerCheckIn({ lat, lng })}
        />

        {/* 地图顶部悬浮微缩 HUD */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            zIndex: 600,
          }}
        >
          <CompassHUD
            heading={heading}
            latitude={currentLat}
            longitude={currentLng}
            altitude={altitude}
            speed={speed}
            walkDistanceMeters={walkDistanceMeters}
            unlockedCount={discoveredAreas.length}
            isWalking={isWalking}
            isCompact={true}
            onCenterMap={() => window.dispatchEvent(new CustomEvent('cloudfly_compass_recenter'))}
          />
        </div>

        {/* 底部悬浮控制台 */}
        <TrailControlBar
          isWalking={isWalking}
          walkDistanceMeters={walkDistanceMeters}
          walkDurationSeconds={walkDurationSeconds}
          showFog={showFog}
          tileProviderKey={tileKey}
          onOpenReport={() => setIsReportOpen(true)}
          onTriggerCheckIn={() => handleTriggerCheckIn()}
          onToggleFog={() => {
            setShowFog(!showFog);
            showToast(showFog ? '战争迷雾已隐藏' : '战争迷雾已开启');
          }}
          onChangeTileProvider={handleChangeTileProvider}
        />
      </div>

      {/* 打卡弹窗（支持初次打卡与再次到访编辑细则） */}
      {isCheckInOpen && checkInCoords && (
        <CheckInModal
          lat={checkInCoords.lat}
          lng={checkInCoords.lng}
          altitude={altitude || undefined}
          initialSpot={editingSpot}
          onClose={() => {
            setIsCheckInOpen(false);
            setEditingSpot(null);
          }}
          onSuccess={(res) => {
            setIsCheckInOpen(false);
            setEditingSpot(null);

            // 方案 A: 极简纯随机扣除 6 ~ 12 点体力（体力见底时不阻断打卡，提示温馨疲劳提醒）
            const stamina = consumeStaminaOnCheckIn();

            if (stamina.isExhausted) {
              showToast(
                '【步履轻倦】打卡成功！',
                `体力已耗尽 (0/${stamina.maxHp}) · 记得找个地方坐坐歇脚哦～`
              );
            } else {
              showToast(
                `打卡成功！体力 -${stamina.consumed}`,
                `已在「${res.spotName}」插下探险道标 · 剩余体力 ${stamina.currentHp}/${stamina.maxHp}`
              );
            }
          }}
        />
      )}

      {/* 据点详情弹窗 */}
      {selectedSpot && (
        <SpotDetailModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          onCheckInAgain={(spot) => {
            // 点击后打开编辑细则弹窗，支持重新编辑时间、日期、随行人员等
            setEditingSpot(spot);
            setCheckInCoords({ lat: spot.lat, lng: spot.lng });
            setSelectedSpot(null);
            setIsCheckInOpen(true);
          }}
          onDelete={(id) => {
            deleteCheckInSpot(id);
            showToast('据点已删除');
          }}
        />
      )}

      {/* 七日出行人文叙事可视化报告单弹窗 */}
      {isReportOpen && (
        <TravelWeeklyReportModal
          spots={spots}
          onClose={() => setIsReportOpen(false)}
          onShowToast={(text, sub) => showToast(text, sub)}
        />
      )}

      {/* 城市与街区快速检索弹窗 */}
      {isSearchOpen && (
        <CitySearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelectLocation={(lat, lng, zoom, name) => {
            setCurrentLat(lat);
            setCurrentLng(lng);
            window.dispatchEvent(
              new CustomEvent('cloudfly_compass_fly_to', {
                detail: { lat, lng, zoom },
              })
            );
            unlockFogArea(lat, lng, 350);
            showToast(`已抵达 ${name}`, '可以开始探索与打卡啦！');
          }}
        />
      )}

      {/* 浮动 Toast 气泡 */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3000,
            background: 'rgba(30, 41, 59, 0.94)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            maxWidth: '85%',
            animation: 'fadeInToast 0.2s ease-out',
            pointerEvents: 'none',
          }}
        >
          <style>{`
            @keyframes fadeInToast {
              from { opacity: 0; transform: translate(-50%, -10px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
            <Check size={14} color="#52c41a" />
            <span>{toastMsg.text}</span>
          </div>
          {toastMsg.sub && (
            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
              {toastMsg.sub}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
