import React from 'react';

interface LifeDaisyIconProps {
  size?: number;
  className?: string;
}

/**
 * 精确对齐图 2 的手绘风小雏菊/太阳花图标
 * - 鹅黄色柔和花瓣（多瓣手绘轮廓）
 * - 浅褐陶土色花蕊底色
 * - 花蕊内部手绘交叉井字「#」网格纹理
 * - 自然生动的手绘黑褐描边
 */
export const LifeDaisyIcon: React.FC<LifeDaisyIconProps> = ({ size = 28, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: 'visible', flexShrink: 0 }}
    >
      <defs>
        {/* 花瓣细腻手绘暖黄渐变 */}
        <radialGradient id="daisyPetalGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFCE6" />
          <stop offset="70%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        {/* 花蕊质感渐变 */}
        <radialGradient id="daisyCoreGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#D4A373" />
          <stop offset="70%" stopColor="#B07D53" />
          <stop offset="100%" stopColor="#7F5539" />
        </radialGradient>
      </defs>

      {/* 10片手绘轮廓花瓣，围绕 (50, 50) 展开 */}
      <g stroke="#2C1810" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="url(#daisyPetalGrad)">
        {/* 正上 */}
        <path d="M 45 32 C 43 14, 57 14, 55 32 Z" />
        {/* 右上 1 */}
        <path d="M 58 35 C 72 20, 81 31, 65 43 Z" />
        {/* 右上 2 */}
        <path d="M 66 45 C 84 38, 89 53, 67 55 Z" />
        {/* 右下 1 */}
        <path d="M 65 57 C 83 66, 75 79, 59 66 Z" />
        {/* 正下 */}
        <path d="M 54 67 C 55 86, 42 85, 44 67 Z" />
        {/* 左下 1 */}
        <path d="M 42 66 C 27 79, 17 68, 34 56 Z" />
        {/* 左下 2 */}
        <path d="M 33 54 C 14 53, 14 39, 34 43 Z" />
        {/* 左上 1 */}
        <path d="M 35 42 C 18 29, 29 18, 43 34 Z" />
      </g>

      {/* 补充圆润过渡的花瓣阴影与轮廓重绘 */}
      <g stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#FEEAA3">
        {/* 斜向微透花瓣层，增加层次与手绘随性感 */}
        <path d="M 53 31 C 62 18, 70 23, 62 36 Z" />
        <path d="M 64 53 C 78 57, 76 68, 62 62 Z" />
        <path d="M 37 59 C 25 64, 25 74, 38 64 Z" />
        <path d="M 38 37 C 28 27, 36 21, 46 32 Z" />
      </g>

      {/* 中心花蕊圆盘 */}
      <ellipse
        cx="49.5"
        cy="49.5"
        rx="15"
        ry="14.5"
        fill="url(#daisyCoreGrad)"
        stroke="#2C1810"
        strokeWidth="3.6"
        strokeLinecap="round"
      />

      {/* 花蕊内部手绘交叉井字「#」网格（图2最灵魂的特征） */}
      <g stroke="#24140D" strokeWidth="3" strokeLinecap="round">
        {/* 纵向双线（略带手绘倾角与弧度） */}
        <path d="M 44.5 39 C 45 44, 44.2 55, 44.8 60" />
        <path d="M 54.2 38.5 C 54.8 44, 54 54.5, 54.5 59.5" />
        {/* 横向双线 */}
        <path d="M 38.5 45 C 44 44.5, 55 44.2, 60.5 44.8" />
        <path d="M 38 54 C 44 54.8, 55 53.8, 60.5 53.5" />
      </g>

      {/* 边缘微小手绘斑点细节 */}
      <circle cx="41" cy="41" r="1" fill="#FFF4D0" opacity="0.6" />
      <circle cx="58" cy="42" r="0.9" fill="#2C1810" opacity="0.5" />
    </svg>
  );
};
