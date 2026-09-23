/**
 * 轻拟物色彩与主题引擎 (Neumorphic Theme Engine)
 * 负责将 Colormind 产出的 5 色调色板转化为自适应拟物 CSS 变量系统并全局应用
 */

import { RGBColor, rgbToHex, rgbToHsl, hslToRgb } from './colormindService';

export interface NeumorphicTheme {
  id: string;
  name: string;
  palette: RGBColor[];
  isCustom?: boolean;
  source?: 'preset' | 'ai_colormind' | 'character' | 'horoscope';
  createdAt?: number;

  // 映射后的拟物颜色
  bg: string;
  bgDarker: string;
  bgLighter: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  textMain: string;
  textSub: string;
  accent: string;
  shadow: string;
  shadowSoft: string;
  light: string;
}

const STORAGE_THEME_KEY = 'cloudfly_active_theme_v1';

/**
 * 经典水蓝预设主题（原生轻拟物基底）
 */
export const CLASSIC_AQUA_THEME: NeumorphicTheme = {
  id: 'classic_aqua',
  name: '经典水蓝',
  palette: [
    [233, 238, 245], // #E9EEF5
    [242, 246, 251], // #F2F6FB
    [80, 150, 198],  // #5096C6
    [51, 66, 87],    // #334257
    [56, 211, 159],  // #38D39F
  ],
  isCustom: false,
  source: 'preset',
  bg: '#E9EEF5',
  bgDarker: '#DFE5EF',
  bgLighter: '#F2F6FB',
  primary: '#5096C6',
  primaryLight: '#6BA8D6',
  primaryDark: '#3E7FA9',
  textMain: '#334257',
  textSub: '#7D8CA3',
  accent: '#38D39F',
  shadow: 'rgba(166, 180, 200, 0.55)',
  shadowSoft: 'rgba(166, 180, 200, 0.35)',
  light: 'rgba(255, 255, 255, 0.95)',
};

/**
 * 其他预设主题
 */
export const PRESET_THEMES: NeumorphicTheme[] = [
  CLASSIC_AQUA_THEME,
  createThemeFromPalette('浅草薄荷', [
    [236, 245, 240],
    [244, 250, 247],
    [52, 180, 130],
    [40, 65, 55],
    [16, 185, 129],
  ], false, 'preset'),
  createThemeFromPalette('蜜桃暖阳', [
    [248, 241, 238],
    [253, 248, 245],
    [235, 120, 100],
    [70, 50, 48],
    [245, 158, 11],
  ], false, 'preset'),
  createThemeFromPalette('薰衣草雾', [
    [242, 240, 248],
    [249, 248, 253],
    [130, 115, 210],
    [55, 48, 75],
    [236, 72, 153],
  ], false, 'preset'),
];

/**
 * 将 Colormind 5 色数组转化为具有拟物明暗、高低光层次的完整主题对象
 */
export function createThemeFromPalette(
  name: string,
  palette: RGBColor[],
  isCustom = true,
  source: NeumorphicTheme['source'] = 'ai_colormind'
): NeumorphicTheme {
  // 分析每个色彩的亮度 (Lightness) 与饱和度 (Saturation)
  const hslList = palette.map((rgb, idx) => ({
    rgb,
    hsl: rgbToHsl(rgb),
    idx,
  }));

  // 1. 寻找最亮的作为界面底色 (bg)
  const sortedByLightness = [...hslList].sort((a, b) => b.hsl[2] - a.hsl[2]);
  let bgRgb = sortedByLightness[0].rgb;

  // 确保拟物背景处于舒适区间 (明度 88~95%)
  const [bgH, bgS, bgL] = rgbToHsl(bgRgb);
  bgRgb = hslToRgb(bgH, Math.min(22, bgS), Math.max(89, Math.min(96, bgL)));

  // 2. 寻找最暗的作为正文主文字色 (textMain)
  const sortedByDarkness = [...hslList].sort((a, b) => a.hsl[2] - b.hsl[2]);
  let textRgb = sortedByDarkness[0].rgb;
  const [txtH, txtS] = rgbToHsl(textRgb);
  textRgb = hslToRgb(txtH, Math.min(30, txtS), 24);

  // 3. 寻找最亮眼的饱和色作为主色 (primary)
  const remaining = hslList.filter(
    (item) => item.idx !== sortedByLightness[0].idx && item.idx !== sortedByDarkness[0].idx
  );
  const sortedBySat = remaining.sort((a, b) => b.hsl[1] - a.hsl[1]);
  const primaryRgb = sortedBySat.length > 0 ? sortedBySat[0].rgb : palette[2];
  const accentRgb = sortedBySat.length > 1 ? sortedBySat[1].rgb : palette[4];

  const [pH, pS] = rgbToHsl(primaryRgb);
  const primaryLight = hslToRgb(pH, pS, 65);
  const primaryDark = hslToRgb(pH, pS, 42);

  // 背景的微亮与微暗层
  const bgLighter = hslToRgb(bgH, Math.max(0, bgS - 4), Math.min(99, bgL + 3));
  const bgDarker = hslToRgb(bgH, bgS + 4, Math.max(80, bgL - 4));

  // 自动推算拟物暗影（根据背景 RGB 调暗 26%）
  const shadowR = Math.round(bgRgb[0] * 0.72);
  const shadowG = Math.round(bgRgb[1] * 0.72);
  const shadowB = Math.round(bgRgb[2] * 0.74);

  return {
    id: `theme_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    palette,
    isCustom,
    source,
    createdAt: Date.now(),
    bg: rgbToHex(bgRgb),
    bgDarker: rgbToHex(bgDarker),
    bgLighter: rgbToHex(bgLighter),
    primary: rgbToHex(primaryRgb),
    primaryLight: rgbToHex(primaryLight),
    primaryDark: rgbToHex(primaryDark),
    textMain: rgbToHex(textRgb),
    textSub: rgbToHex(hslToRgb(txtH, Math.min(20, txtS), 55)),
    accent: rgbToHex(accentRgb),
    shadow: `rgba(${shadowR}, ${shadowG}, ${shadowB}, 0.55)`,
    shadowSoft: `rgba(${shadowR}, ${shadowG}, ${shadowB}, 0.35)`,
    light: 'rgba(255, 255, 255, 0.95)',
  };
}

/**
 * 将主题动态写入 document.documentElement.style
 */
export function applyTheme(theme: NeumorphicTheme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  root.style.setProperty('--nm-bg', theme.bg);
  root.style.setProperty('--nm-bg-darker', theme.bgDarker);
  root.style.setProperty('--nm-bg-lighter', theme.bgLighter);
  root.style.setProperty('--nm-primary', theme.primary);
  root.style.setProperty('--nm-primary-light', theme.primaryLight);
  root.style.setProperty('--nm-primary-dark', theme.primaryDark);
  root.style.setProperty('--nm-text-main', theme.textMain);
  root.style.setProperty('--nm-text-sub', theme.textSub);
  root.style.setProperty('--nm-shadow', theme.shadow);
  root.style.setProperty('--nm-shadow-soft', theme.shadowSoft);
  root.style.setProperty('--nm-light', theme.light);

  // 持久化存储
  try {
    localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(theme));
  } catch {
    // 忽略异常
  }

  // 广播全局主题变更事件
  window.dispatchEvent(new CustomEvent('cloudfly_theme_changed', { detail: theme }));
}

/**
 * 读取当前激活的主题
 */
export function loadActiveTheme(): NeumorphicTheme {
  if (typeof window === 'undefined') return CLASSIC_AQUA_THEME;
  try {
    const raw = localStorage.getItem(STORAGE_THEME_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.bg && parsed.primary) {
        return parsed as NeumorphicTheme;
      }
    }
  } catch {
    // 忽略
  }
  return CLASSIC_AQUA_THEME;
}

/**
 * 客户端启动初始化主题
 */
export function initThemeEngine(): void {
  const current = loadActiveTheme();
  applyTheme(current);
}
