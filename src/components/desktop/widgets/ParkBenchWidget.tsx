import React, { useState } from 'react';

export const ParkBenchWidget: React.FC = () => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      title="拟物长椅"
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
      {/* 纯橡胶质感凹凸浮雕公园长椅 (与负一屏同色 #E9EEF5，通过光影产生立体凸起与板条压凹缝) */}
      <svg
        width="118"
        height="85"
        viewBox="0 0 118 85"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* 橡胶受光面微渐变（模拟左上45度柔和自然光） */}
          <linearGradient id="benchRubberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4F8FC" />
            <stop offset="45%" stopColor="var(--nm-bg, #E9EEF5)" />
            <stop offset="100%" stopColor="#DFE5EF" />
          </linearGradient>

          {/* 板条间隙凹槽缝阴影 */}
          <linearGradient id="slatGapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F2F6FB" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* 1. 地面轻微压陷软阴影 */}
        <ellipse cx="59" cy="80" rx="46" ry="3.5" fill="#CBD5E1" opacity="0.4" />

        {/* 2. 铸铁构架背部支架（微凸起圆柱） */}
        {/* 左后椅腿与靠背支架 */}
        <path
          d="M20 16 Q15 36 21 54 L25 78 L20 78"
          fill="none"
          stroke="url(#benchRubberGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M19 16 Q14 36 20 54 L24 78"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.65"
          strokeLinecap="round"
        />

        {/* 右后椅腿与靠背支架 */}
        <path
          d="M98 16 Q93 36 99 54 L103 78 L98 78"
          fill="none"
          stroke="url(#benchRubberGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M97 16 Q92 36 98 54 L102 78"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.65"
          strokeLinecap="round"
        />

        {/* 中间加强柱 */}
        <path
          d="M59 20 Q57 37 60 54 L61 77"
          fill="none"
          stroke="url(#benchRubberGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* 前支撑椅腿 */}
        <path d="M26 55 L24 78" stroke="url(#benchRubberGrad)" strokeWidth="3" strokeLinecap="round" />
        <path d="M25.5 55 L23.5 78" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />

        <path d="M96 55 L94 78" stroke="url(#benchRubberGrad)" strokeWidth="3" strokeLinecap="round" />
        <path d="M95.5 55 L93.5 78" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />

        {/* 3. 靠背三根凸起长板条 (带有细腻的顶部高光与底部阴影) */}
        {/* 靠背板条 1 (顶) */}
        <rect
          x="14"
          y="18"
          width="90"
          height="6.5"
          rx="3"
          fill="url(#benchRubberGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.8"
        />
        {/* 板条1下阴影压线 */}
        <line x1="16" y1="25" x2="102" y2="25" stroke="#B8C5D6" strokeWidth="0.8" strokeOpacity="0.5" />

        {/* 靠背板条 2 (中) */}
        <rect
          x="15"
          y="28"
          width="88"
          height="6.5"
          rx="3"
          fill="url(#benchRubberGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.8"
        />
        {/* 板条2下阴影压线 */}
        <line x1="17" y1="35" x2="101" y2="35" stroke="#B8C5D6" strokeWidth="0.8" strokeOpacity="0.5" />

        {/* 靠背板条 3 (底) */}
        <rect
          x="16"
          y="38"
          width="86"
          height="6.5"
          rx="3"
          fill="url(#benchRubberGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.8"
        />
        {/* 板条3下阴影压线 */}
        <line x1="18" y1="45" x2="100" y2="45" stroke="#B8C5D6" strokeWidth="0.8" strokeOpacity="0.5" />

        {/* 4. 坐垫三根前伸透视板条 */}
        {/* 坐垫板条 1 (后) */}
        <rect
          x="16"
          y="48"
          width="86"
          height="6"
          rx="2.5"
          fill="url(#benchRubberGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.8"
        />
        {/* 坐垫板条 2 (中) */}
        <rect
          x="14.5"
          y="55"
          width="89"
          height="6"
          rx="2.5"
          fill="url(#benchRubberGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.8"
        />
        {/* 坐垫板条 3 (前边缘) */}
        <rect
          x="13"
          y="62"
          width="92"
          height="6"
          rx="2.5"
          fill="url(#benchRubberGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.8"
        />

        {/* 5. 左右古典扶手（优雅圆润弧线） */}
        {/* 左扶手 */}
        <path
          d="M17 60 Q10 48 18 41 Q24 39 27 48 L25 60"
          fill="none"
          stroke="url(#benchRubberGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M16 59 Q9 47 17 40 Q23 38 26 47"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="0.9"
          strokeOpacity="0.75"
          strokeLinecap="round"
        />

        {/* 右扶手 */}
        <path
          d="M101 60 Q94 48 102 41 Q108 39 111 48 L109 60"
          fill="none"
          stroke="url(#benchRubberGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M100 59 Q93 47 101 40 Q107 38 110 47"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="0.9"
          strokeOpacity="0.75"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
