import React from 'react';

interface QuestBoardIconProps {
  size?: number;
  hasNotification?: boolean;
}

/**
 * 任务清单入口图标（深度还原用户图1）
 * 包含：灰米色清单纸板、3条横道滑轨、3个圆点指示槽、左上角手撕纸签+红底白叹号
 */
export const QuestBoardIcon: React.FC<QuestBoardIconProps> = ({
  size = 28,
  hasNotification = true,
}) => {
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
        {/* 清单底板主体（米黄暖灰圆角方块，对齐图1） */}
        <rect
          x="6"
          y="6"
          width="36"
          height="36"
          rx="10"
          fill="#D6CCC2"
          stroke="#502428"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* 内芯微光高光 */}
        <rect
          x="8.5"
          y="8.5"
          width="31"
          height="31"
          rx="8"
          fill="#EAE2D6"
        />

        {/* 左侧 3 条横向圆角药丸条目 (深度对齐图1) */}
        {/* 第 1 条 */}
        <rect
          x="13"
          y="15"
          width="15"
          height="4.5"
          rx="2.25"
          fill="#A89078"
          stroke="#502428"
          strokeWidth="1.5"
        />
        {/* 第 2 条 */}
        <rect
          x="13"
          y="23"
          width="15"
          height="4.5"
          rx="2.25"
          fill="#A89078"
          stroke="#502428"
          strokeWidth="1.5"
        />
        {/* 第 3 条 */}
        <rect
          x="13"
          y="31"
          width="15"
          height="4.5"
          rx="2.25"
          fill="#A89078"
          stroke="#502428"
          strokeWidth="1.5"
        />

        {/* 右侧 3 颗圆形指示点 (深度对齐图1) */}
        {/* 第 1 点 */}
        <circle
          cx="33.5"
          cy="17.25"
          r="2.8"
          fill="#EAE2D6"
          stroke="#502428"
          strokeWidth="2"
        />
        {/* 第 2 点 */}
        <circle
          cx="33.5"
          cy="25.25"
          r="2.8"
          fill="#EAE2D6"
          stroke="#502428"
          strokeWidth="2"
        />
        {/* 第 3 点 */}
        <circle
          cx="33.5"
          cy="33.25"
          r="2.8"
          fill="#EAE2D6"
          stroke="#502428"
          strokeWidth="2"
        />

        {/* 左上角手撕感叹号便签角标 (对齐图1) */}
        {hasNotification && (
          <g>
            {/* 不规则手绘外边框纸片 */}
            <path
              d="M 5 18 C 3 14, 4 9, 8 6 C 12 3, 16 4, 18 8 C 20 12, 16 19, 12 20 C 8 21, 6 21, 5 18 Z"
              fill="#FAF4E8"
              stroke="#502428"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* 红色药丸感叹标 */}
            <rect
              x="9.5"
              y="7.5"
              width="5"
              height="9"
              rx="2.5"
              fill="#E05D44"
              stroke="#502428"
              strokeWidth="1.2"
            />
            {/* 叹号圆点 */}
            <circle
              cx="12"
              cy="18.5"
              r="1.2"
              fill="#E05D44"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
