import React, { useState } from 'react';

export const StreetLampWidget: React.FC = () => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      title="拟物路灯"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        cursor: 'pointer',
        userSelect: 'none',
        transform: isPressed ? 'scale(0.96) translateY(2px)' : 'scale(1)',
        transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: isPressed
          ? 'drop-shadow(-1px -1px 2px rgba(255, 255, 255, 0.8)) drop-shadow(2px 2px 4px rgba(160, 175, 195, 0.5))'
          : 'drop-shadow(-3px -3px 6px rgba(255, 255, 255, 0.95)) drop-shadow(4px 4px 8px rgba(155, 172, 195, 0.6))',
      }}
    >
      {/* 纯橡胶质感凹凸浮雕路灯 (与负一屏同色 #E9EEF5，通过光影产生立体凸起与压凹感) */}
      <svg
        width="68"
        height="120"
        viewBox="0 0 68 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* 橡胶受光面微渐变（模拟左上45度柔和自然光） */}
          <linearGradient id="rubberLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F2F6FB" />
            <stop offset="50%" stopColor="var(--nm-bg, #E9EEF5)" />
            <stop offset="100%" stopColor="#DFE5EF" />
          </linearGradient>

          {/* 凹槽缝隙阴影渐变 */}
          <linearGradient id="rubberInsetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F2F6FB" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* 1. 顶端小圆珠球冠 */}
        <circle cx="34" cy="9" r="3.5" fill="url(#rubberLightGrad)" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.6" />

        {/* 2. 尖顶小伞盖 */}
        <path
          d="M30 12 L38 12 L43 20 L25 20 Z"
          fill="url(#rubberLightGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.5"
          strokeLinejoin="round"
        />

        {/* 3. 灯顶古典宽雨檐（圆润微弧倒角） */}
        <path
          d="M17 20 Q34 16 51 20 L55 24 Q34 21 13 24 Z"
          fill="url(#rubberLightGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.7"
        />

        {/* 4. 六边形透光灯笼主体（内凹浮雕） */}
        <path
          d="M18 24 L50 24 L45 52 L23 52 Z"
          fill="url(#rubberInsetGrad)"
          stroke="var(--nm-bg, #E9EEF5)"
          strokeWidth="1.5"
        />

        {/* 内部凸起圆润灯芯 (凸起软胶球) */}
        <circle
          cx="34"
          cy="36"
          r="6.5"
          fill="url(#rubberLightGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.8"
        />

        {/* 5. 支撑肋条 (软胶凸起棱线) */}
        <line x1="34" y1="24" x2="34" y2="52" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round" />
        <line x1="35" y1="24" x2="35" y2="52" stroke="#B8C5D6" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
        
        <line x1="26" y1="24" x2="28" y2="52" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />
        <line x1="42" y1="24" x2="40" y2="52" stroke="#B8C5D6" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />

        {/* 6. 灯笼底座托盘 */}
        <path
          d="M21 52 L47 52 L43 58 L25 58 Z"
          fill="url(#rubberLightGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.7"
        />

        {/* 7. 双侧古典涡卷灯臂 (优雅铸模浮雕曲线) */}
        <path
          d="M25 56 Q13 60 16 68 Q21 72 28 64"
          fill="none"
          stroke="url(#rubberLightGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M43 56 Q55 60 52 68 Q47 72 40 64"
          fill="none"
          stroke="url(#rubberLightGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* 8. 挺拔主灯柱 (带有高光脊线) */}
        <rect
          x="31.5"
          y="58"
          width="5"
          height="45"
          rx="2.5"
          fill="url(#rubberLightGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.7"
          strokeOpacity="0.6"
        />

        {/* 灯柱中部凸起环箍 */}
        <rect
          x="29.5"
          y="74"
          width="9"
          height="3"
          rx="1.5"
          fill="url(#rubberLightGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeOpacity="0.7"
        />

        {/* 9. 梯形多阶凸起底座 */}
        <path
          d="M28 103 L40 103 L44 110 L24 110 Z"
          fill="url(#rubberLightGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.7"
        />
        <rect
          x="18"
          y="110"
          width="32"
          height="4.5"
          rx="2"
          fill="url(#rubberLightGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.7"
        />

        {/* 地面轻微压陷暗槽 */}
        <ellipse cx="34" cy="115" rx="20" ry="2.5" fill="#CBD5E1" opacity="0.4" />
      </svg>
    </div>
  );
};
