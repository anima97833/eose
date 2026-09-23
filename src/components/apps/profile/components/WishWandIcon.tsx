import React from 'react';

interface WishWandIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 仙女棒心愿券专属微拟物图标
 * 高度还原用户上传的可爱黄色五角星仙女棒魔法手杖
 */
export const WishWandIcon: React.FC<WishWandIconProps> = ({
  size = 20,
  className,
  style,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: 'drop-shadow(0 2px 4px rgba(217, 119, 6, 0.3))',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* 倾斜手杖柄 (从左下角斜向五角星底部) */}
      <g transform="rotate(-38 48 56)">
        {/* 底部抓握把手 (圆润暖黄色) */}
        <rect
          x="44"
          y="58"
          width="12"
          height="34"
          rx="6"
          fill="#FBBF24"
          stroke="#D97706"
          strokeWidth="2.5"
        />
        {/* 手柄凹凸防滑刻线 */}
        <line x1="46" y1="68" x2="54" y2="68" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="46" y1="76" x2="54" y2="76" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />

        {/* 中间连接环 (凸起奶油金) */}
        <rect
          x="42"
          y="49"
          width="16"
          height="10"
          rx="3.5"
          fill="#FEF08A"
          stroke="#D97706"
          strokeWidth="2"
        />

        {/* 顶部手杖颈部 */}
        <rect
          x="45"
          y="32"
          width="10"
          height="19"
          rx="2.5"
          fill="#F59E0B"
        />
      </g>

      {/* 五角星外圈厚边 (圆润曲奇饼干黄色) */}
      <path
        d="M 54 8
           L 66 31
           L 91 35
           L 73 53
           L 77 78
           L 54 66
           L 31 78
           L 35 53
           L 17 35
           L 42 31 Z"
        fill="#FEF08A"
        stroke="#D97706"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 五角星内部明亮金黄主体 */}
      <path
        d="M 54 16
           L 63 33
           L 82 36
           L 68 50
           L 72 70
           L 54 60
           L 36 70
           L 40 50
           L 26 36
           L 45 33 Z"
        fill="url(#starGrad)"
      />

      {/* 渐变定义 */}
      <defs>
        <linearGradient id="starGrad" x1="54" y1="16" x2="54" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#EAB308" />
        </linearGradient>
      </defs>

      {/* 星星左上角微光高光点 */}
      <ellipse cx="48" cy="27" rx="3.5" ry="2.5" transform="rotate(-20 48 27)" fill="#FFFFFF" opacity="0.9" />
      <circle cx="68" cy="40" r="1.5" fill="#FFFFFF" opacity="0.75" />
    </svg>
  );
};
