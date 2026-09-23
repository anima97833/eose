// 计算两点经纬度之间的地表直线距离（单位：米）
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // 地球半径（米）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// 格式化经纬度显示（度分秒）
export function formatCoordinateDMS(lat: number, lng: number): { latStr: string; lngStr: string } {
  const formatSingle = (val: number, positiveDir: string, negativeDir: string) => {
    const dir = val >= 0 ? positiveDir : negativeDir;
    const abs = Math.abs(val);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = Math.round((minFloat - min) * 60);
    return `${deg}°${min}'${sec}" ${dir}`;
  };
  return {
    latStr: formatSingle(lat, 'N', 'S'),
    lngStr: formatSingle(lng, 'E', 'W'),
  };
}

// 格式化方位角描述（例如：正北、东北、西北等）
export function getHeadingDirectionName(deg: number): string {
  const normalized = (deg % 360 + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return '正北 N';
  if (normalized >= 22.5 && normalized < 67.5) return '东北 NE';
  if (normalized >= 67.5 && normalized < 112.5) return '正东 E';
  if (normalized >= 112.5 && normalized < 157.5) return '东南 SE';
  if (normalized >= 157.5 && normalized < 202.5) return '正南 S';
  if (normalized >= 202.5 && normalized < 247.5) return '西南 SW';
  if (normalized >= 247.5 && normalized < 292.5) return '正西 W';
  return '西北 NW';
}

// 默认初始坐标：如果浏览器未授权或PC定位不可用，默认定位在上海外滩/徐汇（可平滑移动）
export const DEFAULT_FALLBACK_LOCATION = {
  lat: 31.2304,
  lng: 121.4737,
  city: '上海市 · 黄浦区',
};

// 启动罗盘方向角监听（兼容真机陀螺仪与PC）
export function watchDeviceOrientation(
  onUpdate: (heading: number) => void
): () => void {
  let isListening = true;

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (!isListening) return;

    // iOS 设备有 webkitCompassHeading
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyEvent = e as any;
    if (typeof anyEvent.webkitCompassHeading === 'number') {
      onUpdate(Math.round(anyEvent.webkitCompassHeading));
      return;
    }

    // Android/标准 alpha
    if (e.alpha !== null) {
      // 0 是正北（如果绝对方向支持）
      const heading = (360 - e.alpha) % 360;
      onUpdate(Math.round(heading));
    }
  };

  if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
  }

  return () => {
    isListening = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    }
  };
}
