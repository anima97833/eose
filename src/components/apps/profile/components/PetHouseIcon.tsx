import React from 'react';

interface PetHouseIconProps {
  size?: number;
}

export const PetHouseIcon: React.FC<PetHouseIconProps> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    style={{ overflow: 'visible', flexShrink: 0 }}
  >
    <defs>
      {/* 屋顶暖棕色渐变 */}
      <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#DF8B34" />
        <stop offset="100%" stopColor="#B46219" />
      </linearGradient>

      {/* 房屋墙面象牙暖白渐变 */}
      <linearGradient id="houseWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF7E6" />
        <stop offset="100%" stopColor="#F5E4C4" />
      </linearGradient>

      {/* 狗耳朵深暖棕 */}
      <linearGradient id="earGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8D5528" />
        <stop offset="100%" stopColor="#6C3B14" />
      </linearGradient>
    </defs>

    {/* ================= 1. 屋顶双耳 ================= */}
    {/* 左耳底壳 */}
    <ellipse cx="10" cy="11.5" rx="3.5" ry="4.5" fill="#502428" />
    <ellipse cx="10" cy="11.5" rx="2.5" ry="3.5" fill="url(#earGrad)" />

    {/* 右耳底壳 */}
    <ellipse cx="26" cy="11.5" rx="3.5" ry="4.5" fill="#502428" />
    <ellipse cx="26" cy="11.5" rx="2.5" ry="3.5" fill="url(#earGrad)" />

    {/* ================= 2. 房屋墙面主体 ================= */}
    {/* 墙身底壳深色厚轮廓 */}
    <path
      d="M 6.5 17 L 29.5 17 L 27.5 32 C 27.5 33.5 26 34.5 24.5 34.5 L 11.5 34.5 C 10 34.5 8.5 33.5 8.5 32 Z"
      fill="#502428"
      stroke="#502428"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* 墙身主体 */}
    <path
      d="M 7.5 17 L 28.5 17 L 26.8 31.5 C 26.8 32.5 25.8 33.5 24 33.5 L 12 33.5 C 10.2 33.5 9.2 32.5 9.2 31.5 Z"
      fill="url(#houseWallGrad)"
    />

    {/* 拱形门洞底壳 */}
    <path
      d="M 13.5 33.5 L 13.5 23 C 13.5 20 22.5 20 22.5 23 L 22.5 33.5 Z"
      fill="#502428"
    />
    {/* 门洞阴影深色内部 */}
    <path
      d="M 14.5 33.5 L 14.5 23.5 C 14.5 21.5 21.5 21.5 21.5 23.5 L 21.5 33.5 Z"
      fill="#3A171D"
    />

    {/* ================= 3. 萌系人字形屋顶 ================= */}
    {/* 屋顶深色外边框底壳 */}
    <path
      d="M 18 4 L 33.5 16.5 C 34.5 17.5 33.8 19 32.5 19 L 29.5 19 L 18 9 L 6.5 19 L 3.5 19 C 2.2 19 1.5 17.5 2.5 16.5 Z"
      fill="#502428"
      stroke="#502428"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* 屋顶暖棕主体 */}
    <path
      d="M 18 5 L 32.5 16.8 L 30 17.8 L 18 8 L 6 17.8 L 3.5 16.8 Z"
      fill="url(#roofGrad)"
      stroke="url(#roofGrad)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* 屋顶脊线反光 */}
    <path
      d="M 18 6.5 L 29 15.5"
      stroke="rgba(255, 255, 255, 0.45)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
