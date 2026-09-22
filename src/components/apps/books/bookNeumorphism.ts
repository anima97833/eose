/**
 * 浅黄色轻拟物设计系统代币 (Pale-Yellow Neumorphism Design Tokens)
 * 深度对标番茄钟的双向漫反射光影与触觉回弹质感
 */

export const NM = {
  // 底色与卡片表面（温润浅黄奶油基调）
  bg: '#F6F2E7',
  cardBg: '#F7F3E9',
  cardBgActive: '#F3EDE0',
  bgInset: '#EFE8DA',
  bgLighter: '#FAF7F0',

  // 双向漫反射阴影（外凸 Extruded）
  convexXs: '2px 2px 5px rgba(198, 186, 162, 0.45), -2px -2px 5px rgba(255, 255, 255, 0.95)',
  convexSm: '3px 3px 8px rgba(198, 186, 162, 0.45), -3px -3px 8px rgba(255, 255, 255, 0.95)',
  convex: '5px 5px 12px rgba(198, 186, 162, 0.48), -5px -5px 12px rgba(255, 255, 255, 0.95)',
  convexLg: '7px 7px 18px rgba(198, 186, 162, 0.5), -7px -7px 18px rgba(255, 255, 255, 0.95)',

  // 双向漫反射阴影（内凹 Inset）
  insetXs: 'inset 2px 2px 4px rgba(198, 186, 162, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.95)',
  insetSm: 'inset 2px 2px 5px rgba(198, 186, 162, 0.45), inset -2px -2px 5px rgba(255, 255, 255, 0.95)',
  inset: 'inset 3px 3px 8px rgba(198, 186, 162, 0.48), inset -3px -3px 8px rgba(255, 255, 255, 0.95)',
  insetDeep: 'inset 4px 4px 10px rgba(198, 186, 162, 0.55), inset -4px -4px 10px rgba(255, 255, 255, 0.95)',

  // 边框（柔和的高光反射边）
  borderLight: '1px solid rgba(255, 255, 255, 0.8)',
  borderSoft: '1px solid rgba(216, 204, 180, 0.35)',

  // 文字颜色
  textMain: '#362E22',
  textSub: '#726450',
  textMuted: '#A0927C',

  // 强调色
  primary: '#D97706',      // 温暖琥珀黄
  primaryLight: '#F59E0B',
  primaryDark: '#B45309',
  emerald: '#10B981',      // 已读薄荷绿
  blue: '#3B82F6',         // 索引蓝
  purple: '#8B5CF6',
};
