export interface RouteConfig {
  id: 'primary' | 'branch';
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  useProxy?: boolean;
  boundApps: string[];
}

export interface UserPreset {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface DualRouteSettings {
  activeTab: 'primary' | 'branch';
  primary: RouteConfig;
  branch: RouteConfig;
  presets: UserPreset[];
}

export const AVAILABLE_APPS_OPTIONS = [
  { id: 'chat', label: '仿真即时通讯 (Chat)' },
  { id: 'moments', label: '朋友圈/动态圈 (Moments)' },
  { id: 'checkphone', label: '查手机秘密/日记 (Checkphone)' },
  { id: 'image_gen', label: '场景画图与自拍 (Image Gen)' },
  { id: 'diary', label: '心事日记本 (Diary)' },
  { id: 'voice', label: '实时连麦语音 (Voice)' },
];

export const DEFAULT_SETTINGS: DualRouteSettings = {
  activeTab: 'primary',
  primary: {
    id: 'primary',
    baseUrl: '',
    apiKey: '',
    model: '',
    temperature: 0.7,
    boundApps: ['chat', 'moments', 'voice'],
  },
  branch: {
    id: 'branch',
    baseUrl: '',
    apiKey: '',
    model: '',
    temperature: 0.5,
    boundApps: ['checkphone', 'image_gen', 'diary'],
  },
  // 纯粹由用户自己保存的预设，不预设 DeepSeek 等
  presets: [],
};

const STORAGE_KEY = 'neumorphic_phone_dual_route_settings';

export function loadStoredSettings(): DualRouteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        primary: { ...DEFAULT_SETTINGS.primary, ...(parsed.primary || {}) },
        branch: { ...DEFAULT_SETTINGS.branch, ...(parsed.branch || {}) },
        presets: Array.isArray(parsed.presets) ? parsed.presets : [],
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: DualRouteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // fallback
  }
}
