/**
 * Colormind AI 配色引擎服务
 * 提供在线 API 调用 (http://colormind.io/api/)、Seed 局部补全、以及智能离线色彩调和算法兜底
 */

export type RGBColor = [number, number, number];

export interface ColormindPaletteOptions {
  model?: 'ui' | 'default';
  input?: (RGBColor | 'N')[];
}

/**
 * 将 RGB 转换为 Hex 字符串 (如 [80, 150, 198] -> '#5096c6')
 */
export function rgbToHex([r, g, b]: RGBColor): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 将 Hex 字符串转换为 RGB 数组
 */
export function hexToRgb(hex: string): RGBColor {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return [80, 150, 198]; // 默认经典水蓝
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * RGB 转换为 HSL
 */
export function rgbToHsl([r, g, b]: RGBColor): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * HSL 转换为 RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGBColor {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/**
 * 常见中文色彩名称（如星座幸运色）解析为对应 RGB 基准色
 */
export function parseChineseColorNameToRgb(name: string): RGBColor {
  const map: Record<string, RGBColor> = {
    '天青蓝': [80, 150, 198],
    '水蓝色': [56, 189, 248],
    '海蓝色': [14, 165, 233],
    '宝蓝色': [37, 99, 235],
    '薄荷绿': [52, 211, 153],
    '翡翠绿': [16, 185, 129],
    '草木绿': [34, 197, 94],
    '琥珀金': [245, 158, 11],
    '柠檬黄': [250, 204, 21],
    '落日橙': [249, 115, 22],
    '珊瑚粉': [251, 113, 133],
    '樱花粉': [244, 114, 182],
    '蜜桃粉': [253, 164, 175],
    '薰衣草紫': [167, 139, 250],
    '罗兰紫': [139, 92, 246],
    '珍珠白': [248, 250, 252],
    '银灰色': [203, 213, 225],
    '曜石黑': [30, 41, 59],
  };

  for (const [key, rgb] of Object.entries(map)) {
    if (name.includes(key) || key.includes(name)) {
      return rgb;
    }
  }

  // 若带字眼智能模糊匹配
  if (name.includes('蓝')) return [80, 150, 198];
  if (name.includes('绿')) return [52, 211, 153];
  if (name.includes('黄') || name.includes('金')) return [245, 158, 11];
  if (name.includes('粉') || name.includes('红')) return [251, 113, 133];
  if (name.includes('紫')) return [167, 139, 250];
  if (name.includes('橙')) return [249, 115, 22];

  return [80, 150, 198];
}

/**
 * 离线/故障平滑兜底：基于色彩调和学（Harmonic Color Theory）生成高质感 5 色拟物色盘
 */
export function generateFallbackPalette(seedRgb?: RGBColor): RGBColor[] {
  const seed = seedRgb || [80, 150, 198];
  const [h, s] = rgbToHsl(seed);

  // 1. 基底浅背景色 (Light Neumorphic Background)
  const bg = hslToRgb(h, Math.min(22, Math.max(10, s * 0.3)), 94);
  // 2. 界面卡片与微凸色 (Surface / Card Highlight)
  const card = hslToRgb(h, Math.min(26, Math.max(12, s * 0.35)), 97);
  // 3. 拟物主强调色 (Primary Accent, 靠近 Seed)
  const primary = hslToRgb(h, Math.max(45, Math.min(75, s)), 55);
  // 4. 文字与深色构件 (Text / Structure)
  const text = hslToRgb(h, Math.min(30, s * 0.4), 26);
  // 5. 互补/三角色点缀 (Secondary Contrast Accent: 旋转 35° 或 160°)
  const accent = hslToRgb((h + 38) % 360, Math.max(65, s), 60);

  return [bg, card, primary, text, accent];
}

/**
 * 调用 Colormind API 获取 5 色调色盘
 * 支持指定 model ('ui' | 'default') 以及 input 局部锁定 (例如固定主色，其余位置置为 'N')
 */
export async function fetchColormindPalette(options?: ColormindPaletteOptions): Promise<RGBColor[]> {
  const model = options?.model || 'ui';
  const postBody: Record<string, any> = { model };
  if (options?.input && Array.isArray(options.input)) {
    postBody.input = options.input;
  }

  // 提取输入中的有效种子色供兜底使用
  let fallbackSeed: RGBColor | undefined;
  if (options?.input) {
    const firstValid = options.input.find((item) => Array.isArray(item)) as RGBColor | undefined;
    if (firstValid) fallbackSeed = firstValid;
  }

  const endpoints = ['/api/colormind', 'http://colormind.io/api/'];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        if (json.result && Array.isArray(json.result) && json.result.length === 5) {
          return json.result as RGBColor[];
        }
      }
    } catch {
      // 失败自动尝试下一个 endpoint 或降级到本地确定性生成
    }
  }

  // 所有网络请求遇阻（如混合内容或离线），平滑降级为本地高质量拟物调色算法
  return generateFallbackPalette(fallbackSeed);
}
