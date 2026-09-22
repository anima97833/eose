import React from 'react';

interface MealDiaryIconProps {
  size?: number;
}

/**
 * 每日美食手账入口图标（深度还原用户图1：兔兔和果子餐盘）
 * 包含：粉红心形拱门背景、木质托盘、两只带嫩绿耳尖与红眼睛的白兔和果子、粉色蝴蝶结飘带
 */
export const MealDiaryIcon: React.FC<MealDiaryIconProps> = ({ size = 28 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 粉色半圆拱门底衬（对齐图1背景） */}
        <path
          d="M 6 36 L 6 22 C 6 12 14 4 24 4 C 34 4 42 12 42 22 L 42 36 Z"
          fill="#FED7E2"
          stroke="#502428"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* 拱门内部爱心斑纹装饰 */}
        <path
          d="M 24 10 C 23 8.5 20.5 8.5 20 10.5 C 19.5 12.5 24 15.5 24 15.5 C 24 15.5 28.5 12.5 28 10.5 C 27.5 8.5 25 8.5 24 10 Z"
          fill="#FFFFFF"
          opacity="0.85"
        />
        <path
          d="M 14 18 C 13.5 17 11.5 17 11 18.5 C 10.5 20 14 22 14 22 C 14 22 17.5 20 17 18.5 C 16.5 17 14.5 17 14 18 Z"
          fill="#FFFFFF"
          opacity="0.75"
        />
        <path
          d="M 34 18 C 33.5 17 31.5 17 31 18.5 C 30.5 20 34 22 34 22 C 34 22 37.5 20 37 18.5 C 36.5 17 34.5 17 34 18 Z"
          fill="#FFFFFF"
          opacity="0.75"
        />

        {/* 浅褐色木质点心托盘（对齐图1木盘） */}
        <polygon
          points="8,35 34,26 42,30 16,40"
          fill="#D49A6A"
          stroke="#502428"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon
          points="8,35 16,40 16,43 8,38"
          fill="#A4683E"
          stroke="#502428"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon
          points="16,40 42,30 42,33 16,43"
          fill="#B5794C"
          stroke="#502428"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* 左侧小白兔和果子 */}
        <ellipse
          cx="19"
          cy="26"
          rx="7.5"
          ry="6.5"
          transform="rotate(-15 19 26)"
          fill="#FFFFFF"
          stroke="#502428"
          strokeWidth="2"
        />
        {/* 左兔浅绿草叶耳尖 */}
        <path
          d="M 17 21 C 15 18 17 15 19 18 C 19 19 18 20 17 21 Z"
          fill="#A3E635"
          stroke="#502428"
          strokeWidth="1.2"
        />
        <path
          d="M 21 21 C 21 17 23 15 24 18 C 24 19 22 20 21 21 Z"
          fill="#A3E635"
          stroke="#502428"
          strokeWidth="1.2"
        />
        {/* 左兔红眼睛小点 */}
        <circle cx="14.5" cy="27" r="1.2" fill="#E11D48" />

        {/* 右侧小白兔和果子（稍微交叠） */}
        <ellipse
          cx="28"
          cy="29"
          rx="8"
          ry="7"
          transform="rotate(-15 28 29)"
          fill="#FFFFFF"
          stroke="#502428"
          strokeWidth="2"
        />
        {/* 右兔浅绿草叶耳尖 */}
        <path
          d="M 26 24 C 24 21 26 18 28 21 C 28 22 27 23 26 24 Z"
          fill="#A3E635"
          stroke="#502428"
          strokeWidth="1.2"
        />
        <path
          d="M 30 24 C 30 20 32 18 33 21 C 33 22 31 23 30 24 Z"
          fill="#A3E635"
          stroke="#502428"
          strokeWidth="1.2"
        />
        {/* 右兔红眼睛小点 */}
        <circle cx="23.5" cy="30" r="1.2" fill="#E11D48" />

        {/* 底部粉色飘带波浪下檐（对齐图1底部丝带） */}
        <path
          d="M 4 39 C 14 36, 34 36, 44 39 L 44 43 C 34 40, 14 40, 4 43 Z"
          fill="#F472B6"
          stroke="#502428"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
