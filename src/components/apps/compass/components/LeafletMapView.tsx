import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckInSpot, DiscoveredArea, TrailPoint, SPOT_CATEGORIES } from '../../../../core/compass/types';
import { TILE_PROVIDERS, TileLayerOption } from '../../../../core/compass/tileProviders';

interface LeafletMapViewProps {
  currentLat: number | null;
  currentLng: number | null;
  heading: number;
  spots: CheckInSpot[];
  discoveredAreas: DiscoveredArea[];
  activeTrailPoints: TrailPoint[];
  tileProviderKey?: string;
  onSelectSpot: (spot: CheckInSpot) => void;
  onMapClick?: (lat: number, lng: number) => void;
  showFog?: boolean;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  currentLat,
  currentLng,
  heading,
  spots,
  discoveredAreas,
  activeTrailPoints,
  tileProviderKey = 'osmStandard',
  onSelectSpot,
  onMapClick,
  showFog = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const spotsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const trailPolylineRef = useRef<L.Polyline | null>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mapReady, setMapReady] = useState<boolean>(false);

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = currentLat || 31.2304;
    const initialLng = currentLng || 121.4737;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false, // 自定义轻拟物缩放按钮
      attributionControl: false,
    });

    const provider: TileLayerOption = TILE_PROVIDERS[tileProviderKey] || TILE_PROVIDERS.amapStandard;
    const tileLayer = L.tileLayer(provider.url, {
      subdomains: provider.subdomains,
      maxZoom: provider.maxZoom,
      minZoom: provider.minZoom,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // 图钉图层组
    const spotsGroup = L.layerGroup().addTo(map);
    spotsLayerGroupRef.current = spotsGroup;

    // 足迹折线
    const trailLine = L.polyline([], {
      color: '#096dd9',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: undefined,
    }).addTo(map);
    trailPolylineRef.current = trailLine;

    // 地图点击事件
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 切换瓦片源
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const provider: TileLayerOption = TILE_PROVIDERS[tileProviderKey] || TILE_PROVIDERS.amapStandard;
    tileLayerRef.current.setUrl(provider.url);
  }, [tileProviderKey]);

  // 更新用户定位标记（呼吸雷达光环 + 角色微缩徽章）
  useEffect(() => {
    if (!mapInstanceRef.current || currentLat === null || currentLng === null) return;
    const map = mapInstanceRef.current;

    const iconHtml = `
      <div class="user-radar-container" style="
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- 呼吸波纹 -->
        <div style="
          position: absolute;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(80, 150, 198, 0.25);
          animation: pulseRadar 2s infinite ease-out;
        "></div>
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(80, 150, 198, 0.4);
          animation: pulseRadar 2s infinite ease-out 0.6s;
        "></div>

        <!-- 中心角色轻拟物核心图章 -->
        <div style="
          position: relative;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.22), inset 0 -2px 4px rgba(80,150,198,0.4);
          border: 2.5px solid #5096C6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          transform: rotate(${heading}deg);
          transition: transform 0.2s ease-out;
          z-index: 10;
        ">
          <div style="
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 9px solid #e53935;
            position: absolute;
            top: 2px;
          "></div>
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #5096C6;
            margin-top: 4px;
          "></div>
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-user-marker',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([currentLat, currentLng], { icon: customIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([currentLat, currentLng]);
      userMarkerRef.current.setIcon(customIcon);
    }
  }, [currentLat, currentLng, heading]);

  // 更新已打卡据点（Markers）
  useEffect(() => {
    if (!mapInstanceRef.current || !spotsLayerGroupRef.current) return;
    const group = spotsLayerGroupRef.current;
    group.clearLayers();

    spots.forEach((spot) => {
      const cat = SPOT_CATEGORIES[spot.category] || SPOT_CATEGORIES.cafe;
      const isBase = spot.level >= 3;

      const markerHtml = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));
          transform: translateY(-8px);
          transition: transform 0.15s ease-out;
        ">
          <!-- 气泡图钉主体 -->
          <div style="
            padding: 4px 7px;
            border-radius: 16px;
            background: ${cat.bgLight};
            border: 2px solid ${cat.color};
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 2px 3px 7px rgba(0,0,0,0.15);
            position: relative;
          ">
            <span style="font-size: 14px;">${cat.icon}</span>
            <span style="font-size: 11px; font-weight: 700; color: ${cat.color}; white-space: nowrap; max-width: 68px; overflow: hidden; text-overflow: ellipsis;">
              ${spot.name}
            </span>
            ${isBase ? `<span style="font-size: 9px; background: #faad14; color: #fff; padding: 1px 4px; border-radius: 6px; font-weight: 800;">Lv.${spot.level}</span>` : ''}
          </div>
          <!-- 图钉下尖角 -->
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 7px solid ${cat.color};
            margin-top: -1px;
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-spot-marker',
        iconSize: [110, 36],
        iconAnchor: [55, 34],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon });
      marker.on('click', () => {
        onSelectSpot(spot);
      });
      group.addLayer(marker);
    });
  }, [spots, onSelectSpot]);

  // 更新漫步轨迹 Polyline
  useEffect(() => {
    if (!trailPolylineRef.current) return;
    const latlngs: [number, number][] = activeTrailPoints.map((p) => [p.lat, p.lng]);
    trailPolylineRef.current.setLatLngs(latlngs);
  }, [activeTrailPoints]);

  // 宝可梦式战争迷雾绘制渲染器（Canvas Overlay）
  const renderFog = useCallback(() => {
    const canvas = fogCanvasRef.current;
    const map = mapInstanceRef.current;
    if (!canvas || !map || !showFog) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制轻薄微拟物迷雾底色（轻薄雾霭，绝不遮挡底层街区路网）
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(215, 226, 240, 0.35)';
    ctx.fillRect(0, 0, width, height);

    // 使用 destination-out 擦除已探索区域（羽化渐变圆）
    ctx.globalCompositeOperation = 'destination-out';

    // 收集所有需要点亮的圆：包括持久化的 discoveredAreas 以及当前实时位置
    const areasToDraw: { lat: number; lng: number; radius: number }[] = [...discoveredAreas];
    if (currentLat !== null && currentLng !== null) {
      areasToDraw.push({ lat: currentLat, lng: currentLng, radius: 280 });
    }

    areasToDraw.forEach((area) => {
      const point = map.latLngToContainerPoint([area.lat, area.lng]);

      // 计算当前缩放级别下米到像素的转换比例
      const centerLatLng = map.getCenter();
      const point1 = map.latLngToContainerPoint(centerLatLng);
      const point2 = map.latLngToContainerPoint([centerLatLng.lat + 0.001, centerLatLng.lng]);
      const metersPerPixel = 111 / Math.max(1, Math.abs(point2.y - point1.y));
      const pixelRadius = Math.max(30, Math.min(260, area.radius / metersPerPixel));

      // 径向渐变，羽化边缘
      const grad = ctx.createRadialGradient(
        point.x,
        point.y,
        pixelRadius * 0.45,
        point.x,
        point.y,
        pixelRadius
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.75, 'rgba(0, 0, 0, 0.85)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(point.x, point.y, pixelRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 恢复合成模式
    ctx.globalCompositeOperation = 'source-over';
  }, [discoveredAreas, currentLat, currentLng, showFog]);

  // 地图平移、缩放以及数据变化时重绘迷雾
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const handleResize = () => {
      if (!mapContainerRef.current || !fogCanvasRef.current) return;
      const rect = mapContainerRef.current.getBoundingClientRect();
      fogCanvasRef.current.width = rect.width;
      fogCanvasRef.current.height = rect.height;
      renderFog();
    };

    handleResize();
    map.on('move', renderFog);
    map.on('zoom', renderFog);
    map.on('resize', handleResize);

    return () => {
      map.off('move', renderFog);
      map.off('zoom', renderFog);
      map.off('resize', handleResize);
    };
  }, [mapReady, renderFog]);

  // 居中到用户当前位置
  const handleRecenter = () => {
    if (!mapInstanceRef.current || currentLat === null || currentLng === null) return;
    mapInstanceRef.current.flyTo([currentLat, currentLng], 16, { duration: 0.8 });
  };

  // 暴露外部 ref 调用方法
  useEffect(() => {
    const handleCenterEvent = () => handleRecenter();
    const handleFlyToEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ lat: number; lng: number; zoom?: number }>;
      if (!mapInstanceRef.current || !customEvent.detail) return;
      const { lat, lng, zoom } = customEvent.detail;
      mapInstanceRef.current.flyTo([lat, lng], zoom || 15, { duration: 1.2 });
    };

    window.addEventListener('cloudfly_compass_recenter', handleCenterEvent);
    window.addEventListener('cloudfly_compass_fly_to', handleFlyToEvent);
    return () => {
      window.removeEventListener('cloudfly_compass_recenter', handleCenterEvent);
      window.removeEventListener('cloudfly_compass_fly_to', handleFlyToEvent);
    };
  }, [currentLat, currentLng]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: '20px',
        boxShadow: 'inset 3px 3px 8px rgba(166, 180, 200, 0.6), inset -3px -3px 8px #ffffff',
      }}
    >
      <style>{`
        @keyframes pulseRadar {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .custom-user-marker, .custom-spot-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>

      {/* Leaflet 地图 DOM 视窗 */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      {/* 宝可梦式战争迷雾 Canvas 遮罩图层 */}
      {showFog && (
        <canvas
          ref={fogCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 400,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 地图右下角轻拟物缩放与回位控制浮动胶囊 */}
      <div
        style={{
          position: 'absolute',
          right: '12px',
          bottom: '80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 500,
        }}
      >
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(240, 244, 250, 0.95)',
            boxShadow: '3px 3px 7px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
            color: '#2d3748',
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>

        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(240, 244, 250, 0.95)',
            boxShadow: '3px 3px 7px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
            color: '#2d3748',
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          -
        </button>

        <button
          onClick={handleRecenter}
          title="回正到我的位置"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: '#5096C6',
            boxShadow: '3px 3px 8px rgba(80, 150, 198, 0.5), -2px -2px 5px #ffffff',
            color: '#ffffff',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🎯
        </button>
      </div>
    </div>
  );
};
