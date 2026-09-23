import React from 'react';

interface ChestIconProps {
  size?: number;
}

export const ChestIcon: React.FC<ChestIconProps> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    style={{ overflow: 'visible', flexShrink: 0 }}
  >
    <defs>
      {/* 宝箱盖顶弧形渐变 */}
      <linearGradient id="chestLidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFAA82" />
        <stop offset="35%" stopColor="#F5936C" />
        <stop offset="100%" stopColor="#DF734A" />
      </linearGradient>

      {/* 宝箱下半身木箱渐变 */}
      <linearGradient id="chestBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F48F66" />
        <stop offset="60%" stopColor="#DD6E44" />
        <stop offset="100%" stopColor="#BD4F28" />
      </linearGradient>

      {/* 宝箱金边与十字锁扣金色渐变 */}
      <linearGradient id="chestGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF2B2" />
        <stop offset="45%" stopColor="#FED44E" />
        <stop offset="100%" stopColor="#D99B26" />
      </linearGradient>
    </defs>

    {/* 阴影底衬 */}
    <ellipse cx="20" cy="36" rx="14" ry="3.5" fill="rgba(60, 25, 20, 0.22)" />

    {/* ================= 1. 宝箱底身 ================= */}
    {/* 底身深色轮廓 */}
    <rect
      x="6.5"
      y="18.5"
      width="27"
      height="15.5"
      rx="3.5"
      fill="#522321"
      stroke="#522321"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* 底身暖木主体 */}
    <rect
      x="7.5"
      y="19"
      width="25"
      height="14"
      rx="3"
      fill="url(#chestBodyGrad)"
    />

    {/* 底身左右金包角 */}
    <path
      d="M 7.5 28 L 7.5 33 L 12.5 33 L 12.5 30 L 10 30 L 10 28 Z"
      fill="url(#chestGoldGrad)"
      stroke="#522321"
      strokeWidth="1"
    />
    <path
      d="M 32.5 28 L 32.5 33 L 27.5 33 L 27.5 30 L 30 30 L 30 28 Z"
      fill="url(#chestGoldGrad)"
      stroke="#522321"
      strokeWidth="1"
    />

    {/* ================= 2. 宝箱圆拱顶盖 ================= */}
    {/* 顶盖深色外轮廓 */}
    <path
      d="M 6.5 19.5 C 6.5 19.5, 6 9, 20 8.5 C 34 9, 33.5 19.5, 33.5 19.5 Z"
      fill="#522321"
      stroke="#522321"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* 顶盖暖木主体 */}
    <path
      d="M 7.5 19 C 7.5 19, 7.2 9.8, 20 9.5 C 32.8 9.8, 32.5 19, 32.5 19 Z"
      fill="url(#chestLidGrad)"
    />

    {/* 顶盖木纹弧线装饰 */}
    <path
      d="M 12 18.5 C 12 14, 15 10.8, 20 10.5 C 25 10.8, 28 14, 28 18.5"
      fill="none"
      stroke="rgba(255, 230, 210, 0.45)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* 顶盖边缘金包边 */}
    <path
      d="M 6.5 17.5 L 33.5 17.5 L 33.5 20.5 L 6.5 20.5 Z"
      fill="#522321"
      stroke="#522321"
      strokeWidth="1"
    />
    <rect
      x="7.5"
      y="18"
      width="25"
      height="2"
      fill="url(#chestGoldGrad)"
    />

    {/* 顶盖高光条 */}
    <path
      d="M 12 11.5 Q 20 10.2 27 11.8"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.3"
      strokeLinecap="round"
      opacity="0.75"
    />

    {/* ================= 3. 黄金十字/小花锁扣（对齐图1） ================= */}
    {/* 锁扣深色底壳 */}
    <path
      d="M 20 15 
         C 18.5 15, 17.5 16, 17.5 17.5 
         C 17.5 18.2, 16 19, 16 20
         C 16 21.2, 17.5 21.8, 18 22
         L 18 25
         C 18 26.5, 22 26.5, 22 25
         L 22 22
         C 22.5 21.8, 24 21.2, 24 20
         C 24 19, 22.5 18.2, 22.5 17.5
         C 22.5 16, 21.5 15, 20 15 Z"
      fill="#522321"
      stroke="#522321"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    {/* 黄金锁扣主体 */}
    <path
      d="M 20 16 
         C 18.8 16, 18.2 16.6, 18.2 17.5 
         C 18.2 18.2, 16.8 19.2, 16.8 20
         C 16.8 20.8, 18 21.3, 18.8 21.6
         L 18.8 24.5
         C 18.8 25.5, 21.2 25.5, 21.2 24.5
         L 21.2 21.6
         C 22 21.3, 23.2 20.8, 23.2 20
         C 23.2 19.2, 21.8 18.2, 21.8 17.5
         C 21.8 16.6, 21.2 16, 20 16 Z"
      fill="url(#chestGoldGrad)"
    />
    {/* 锁孔小黑点 */}
    <circle cx="20" cy="20.5" r="1" fill="#522321" />
  </svg>
);
