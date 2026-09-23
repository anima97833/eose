// 电台主题配色与本地播放偏好持久化

const RADIO_PALETTE_KEY = 'cloudfly_radio_palette';
const RADIO_LAST_STATION_KEY = 'cloudfly_radio_last_station';
const RADIO_VOLUME_KEY = 'cloudfly_radio_volume';

// 默认复古暖金轻拟物调色盘
export const DEFAULT_RADIO_PALETTE = [
  '#F4F6F9', // 0: 浅底/高光
  '#E1E8F0', // 1: 机身浅色渐变
  '#4A6B82', // 2: 旋钮/主辅色
  '#1E293B', // 3: 深色刻度/文字
  '#D97706', // 4: 调谐红线/琥珀背光发光色
];

export function loadRadioPalette(): string[] {
  if (typeof window === 'undefined') return DEFAULT_RADIO_PALETTE;
  try {
    const raw = localStorage.getItem(RADIO_PALETTE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 5) return parsed;
    }
  } catch {}
  return DEFAULT_RADIO_PALETTE;
}

export function saveRadioPalette(palette: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RADIO_PALETTE_KEY, JSON.stringify(palette));
  } catch {}
}

export function loadLastStationId(): string {
  if (typeof window === 'undefined') return 'groove_salad';
  return localStorage.getItem(RADIO_LAST_STATION_KEY) || 'groove_salad';
}

export function saveLastStationId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RADIO_LAST_STATION_KEY, id);
  } catch {}
}

export function loadRadioVolume(): number {
  if (typeof window === 'undefined') return 0.8;
  const val = localStorage.getItem(RADIO_VOLUME_KEY);
  if (val) {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 1) return num;
  }
  return 0.8;
}

export function saveRadioVolume(vol: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RADIO_VOLUME_KEY, vol.toString());
  } catch {}
}
