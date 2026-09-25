import { RGBColor, rgbToHex } from '../../../../core/theme/colormindService';

export type CapsuleColorKey = 'pink' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange';

export type GachaMode = 'wish' | 'task' | 'entertainment';

export type EntertainmentSubFilter = 'all' | 'book' | 'movie' | 'game';

export interface EntertainmentItem {
  id: string;
  originalId: string;
  type: 'book' | 'movie' | 'game';
  typeLabel: string;
  title: string;
  subtitle?: string;
  coverUrl?: string;
  progressLabel?: string;
  flavorQuote?: string;
  colorKey: CapsuleColorKey;
  icon: string;
  createdAt: number;
}

export interface WishItem {
  id: string;
  content: string;
  colorKey: CapsuleColorKey;
  icon?: string;
  createdAt: number;
  completedAt?: number;
  status: 'in_machine' | 'active' | 'completed';
}

export interface DecisionTaskItem {
  id: string;
  originalId: string;
  source: 'pomodoro' | 'diary';
  sourceLabel: string;
  title: string;
  desc?: string;
  icon: string;
  colorKey: CapsuleColorKey;
  estimatedPoms?: number;
  tag?: string;
  createdAt: number;
}

export interface GachaPalette {
  name: string;
  primary: string;       // 机身主体色
  secondary: string;     // 边框、暗面与深色线条
  accent: string;        // 旋钮与点缀强调色
  background: string;    // 全屏背景色
  chute: string;         // 出蛋口内部暗面
  buttonBg: string;      // 顶部功能按键背景（由 Colormind 驱动）
  buttonBorder: string;  // 按钮外边框
  buttonText: string;    // 按钮内图标与文字（保证极高对比度）
  titleColor: string;    // 标题文字颜色
  badgeBg: string;       // 胶囊数徽章背景
  badgeText: string;     // 胶囊数徽章文字
}

export const DEFAULT_GACHA_PALETTE: GachaPalette = {
  name: '经典粉桃',
  primary: '#F0758B',
  secondary: '#8A3B49',
  accent: '#FF8DA1',
  background: '#FFF9E8',
  chute: '#B84E60',
  buttonBg: '#FFF0F3',
  buttonBorder: '#8A3B49',
  buttonText: '#8A3B49',
  titleColor: '#8A3B49',
  badgeBg: '#8A3B49',
  badgeText: '#FFFFFF',
};

/**
 * 智能解析 Colormind 5 色调色盘，依据相对亮度（Luminance）建立高可读性、全套覆盖按钮UI的拟物配色系统
 */
export function generateColormindGachaPalette(rgbList: RGBColor[]): GachaPalette {
  // 计算每种颜色的感知亮度
  const withLum = rgbList.map((rgb) => ({
    rgb,
    hex: rgbToHex(rgb),
    lum: 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2],
  }));

  // 按亮度从暗到明排序
  withLum.sort((a, b) => a.lum - b.lum);

  const dark = withLum[0];       // 最暗：线条、文字、边框核心
  const midDark = withLum[1];    // 次暗：出蛋口内部阴影
  const mid = withLum[2];        // 适中：机身主色彩
  const midLight = withLum[3];   // 偏亮：强调色/旋钮/高光
  const light = withLum[4];      // 最亮：舞台大背景

  // 1. 如果最暗色的亮度依然偏高（> 80），适度加深作为主边框与图标字色，确保 100% 清晰锐利绝不发虚
  const effectiveDarkHex = dark.lum > 80
    ? rgbToHex([
        Math.round(dark.rgb[0] * 0.45),
        Math.round(dark.rgb[1] * 0.45),
        Math.round(dark.rgb[2] * 0.45),
      ])
    : dark.hex;

  // 2. 按钮背景色：混合 25% 调色盘主调色 + 75% 纯白，生成带有该主题独特质感的柔润拟物轻彩表面
  const softButtonBg = rgbToHex([
    Math.round(midLight.rgb[0] * 0.25 + 255 * 0.75),
    Math.round(midLight.rgb[1] * 0.25 + 255 * 0.75),
    Math.round(midLight.rgb[2] * 0.25 + 255 * 0.75),
  ]);

  // 3. 标题文字颜色：根据全屏背景亮度智能适应，背景暗则用纯白，背景亮则用深色
  const titleColor = light.lum > 140 ? effectiveDarkHex : '#FFFFFF';

  return {
    name: 'Colormind 和谐色彩',
    secondary: effectiveDarkHex,
    chute: midDark.hex,
    primary: mid.hex,
    accent: midLight.hex,
    background: light.hex,
    buttonBg: softButtonBg,      // 按钮背景随 Colormind 主题变色！
    buttonBorder: effectiveDarkHex,  // 按钮深色立体边框
    buttonText: effectiveDarkHex,    // 按钮内部图标与文字，极高对比度
    titleColor: titleColor,          // 标题文字
    badgeBg: effectiveDarkHex,       // 计数胶囊徽章背景
    badgeText: '#FFFFFF',            // 徽章高对比纯白文字
  };
}

export const CAPSULE_COLORS: Record<CapsuleColorKey, { top: string; bottom: string; border: string; label: string }> = {
  pink: { top: '#FF7B95', bottom: '#FFFFFF', border: '#7A3542', label: '粉桃' },
  blue: { top: '#4EA5D9', bottom: '#FFFFFF', border: '#2B4C6F', label: '天蓝' },
  yellow: { top: '#F4B942', bottom: '#FFFFFF', border: '#8A5D19', label: '明黄' },
  green: { top: '#8AC926', bottom: '#FFFFFF', border: '#3B6015', label: '草绿' },
  purple: { top: '#9B5DE5', bottom: '#FFFFFF', border: '#4E2479', label: '薰衣' },
  orange: { top: '#F15BB5', bottom: '#FFFFFF', border: '#722153', label: '莓红' },
};

export const PRESET_ICONS = [
  '🎬', '👨‍👩‍👧', '📖', '☕', '🌲', 
  '🍰', '🎨', '✈️', '💌', '🎵', 
  '📷', '🚴', '🏊', '🧸', '🌸'
];
