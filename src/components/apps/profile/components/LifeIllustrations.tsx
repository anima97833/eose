import React from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
}

/**
 * 图1款萌系小猫咪插图 (对齐图1上方卡片)
 */
export const CuteCatStickerSVG: React.FC<IllustrationProps> = ({ size = 68, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    {/* 背景微黄色斑点与小花 */}
    <rect width="100" height="100" rx="16" fill="#FFFDF5" />
    <circle cx="20" cy="20" r="3" fill="#FDE047" opacity="0.6" />
    <circle cx="82" cy="28" r="4" fill="#FDE047" opacity="0.6" />
    <circle cx="80" cy="80" r="3" fill="#FDE047" opacity="0.5" />
    <circle cx="16" cy="78" r="4" fill="#FDE047" opacity="0.6" />
    {/* 四周小雏菊碎花 */}
    <g fill="#FDE68A" stroke="#4A3428" strokeWidth="1.2">
      <circle cx="22" cy="74" r="5" />
      <circle cx="80" cy="76" r="5" />
      <circle cx="84" cy="24" r="5" />
    </g>
    {/* 白猫身体与招手 */}
    <path
      d="M 32 46 C 30 26, 70 26, 68 46 C 74 54, 76 72, 68 84 C 58 87, 42 87, 32 84 C 24 72, 26 54, 32 46 Z"
      fill="#FFFFFF"
      stroke="#4A3428"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    {/* 猫耳朵 */}
    <path d="M 33 34 L 27 20 L 41 28 Z" fill="#FFFFFF" stroke="#4A3428" strokeWidth="2.6" strokeLinejoin="round" />
    <path d="M 67 34 L 73 20 L 59 28 Z" fill="#FFFFFF" stroke="#4A3428" strokeWidth="2.6" strokeLinejoin="round" />
    <path d="M 32 28 L 30 23 L 37 26 Z" fill="#FECDD3" />
    <path d="M 68 28 L 70 23 L 63 26 Z" fill="#FECDD3" />
    {/* 萌萌水蓝色小背带裙 */}
    <path
      d="M 34 58 C 42 56, 58 56, 66 58 C 70 70, 72 82, 65 84 C 56 86, 44 86, 35 84 C 28 82, 30 70, 34 58 Z"
      fill="#BAE6FD"
      stroke="#4A3428"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* 裙子红色小圆领 */}
    <path d="M 44 58 C 47 62, 53 62, 56 58 Z" fill="#F43F5E" />
    {/* 小黑豆眼睛与胡须 */}
    <circle cx="43" cy="40" r="2.2" fill="#24140D" />
    <circle cx="57" cy="40" r="2.2" fill="#24140D" />
    <ellipse cx="50" cy="44" rx="1.8" ry="1.2" fill="#F43F5E" />
    {/* 招起的小右手 */}
    <ellipse cx="73" cy="52" rx="4.5" ry="6" fill="#FFFFFF" stroke="#4A3428" strokeWidth="2.2" transform="rotate(25 73 52)" />
  </svg>
);

/**
 * 图1款香水护肤小瓶插图 (对齐图1下方卡片)
 */
export const PerfumeBoxStickerSVG: React.FC<IllustrationProps> = ({ size = 68, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="16" fill="#FFFDF8" />
    {/* 左侧香水瓶 */}
    <g stroke="#4A3428" strokeWidth="2.4" strokeLinejoin="round">
      <rect x="20" y="38" width="28" height="46" rx="6" fill="#FFFFFF" />
      <rect x="29" y="30" width="10" height="8" rx="2" fill="#D1D5DB" />
      {/* 瓶盖小猫耳 */}
      <path d="M 28 30 L 25 24 L 33 27 Z" fill="#FDE68A" />
      <path d="M 40 30 L 43 24 L 35 27 Z" fill="#FDE68A" />
      {/* 瓶身小玫瑰手绘 */}
      <circle cx="34" cy="56" r="4.5" fill="#FDA4AF" />
      <path d="M 34 60 C 35 68, 32 72, 34 76" stroke="#10B981" strokeWidth="1.8" />
    </g>
    {/* 右侧包装盒 */}
    <g stroke="#4A3428" strokeWidth="2.4" strokeLinejoin="round">
      <rect x="54" y="24" width="26" height="60" rx="4" fill="#E0F2FE" />
      <rect x="58" y="36" width="18" height="10" rx="2" fill="#FFFFFF" />
      <text x="60" y="43" fontSize="6" fontWeight="bold" fill="#0369A1">ROSE</text>
      {/* 盒子底部的两朵手绘小花 */}
      <circle cx="62" cy="66" r="3.5" fill="#FDA4AF" />
      <circle cx="72" cy="70" r="3.5" fill="#FDA4AF" />
    </g>
  </svg>
);

/**
 * 校园/蓝天学校手绘插画
 */
export const SchoolStickerSVG: React.FC<IllustrationProps> = ({ size = 68, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="16" fill="#F0FDF4" />
    {/* 教学楼屋顶与钟楼 */}
    <polygon points="50,18 24,36 76,36" fill="#F87171" stroke="#4A3428" strokeWidth="2.6" strokeLinejoin="round" />
    <rect x="28" y="36" width="44" height="48" rx="4" fill="#FEF3C7" stroke="#4A3428" strokeWidth="2.6" />
    {/* 钟表 */}
    <circle cx="50" cy="46" r="6" fill="#FFFFFF" stroke="#4A3428" strokeWidth="1.8" />
    <line x1="50" y1="46" x2="50" y2="43" stroke="#4A3428" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="50" y1="46" x2="53" y2="46" stroke="#4A3428" strokeWidth="1.8" strokeLinecap="round" />
    {/* 窗户和校门 */}
    <rect x="34" y="56" width="9" height="10" rx="2" fill="#BAE6FD" stroke="#4A3428" strokeWidth="1.8" />
    <rect x="57" y="56" width="9" height="10" rx="2" fill="#BAE6FD" stroke="#4A3428" strokeWidth="1.8" />
    <path d="M 46 84 L 46 72 C 46 69, 54 69, 54 72 L 54 84 Z" fill="#78350F" stroke="#4A3428" strokeWidth="2" />
    {/* 飘扬红旗 */}
    <line x1="50" y1="18" x2="50" y2="10" stroke="#4A3428" strokeWidth="2" />
    <path d="M 50 10 L 60 14 L 50 18 Z" fill="#EF4444" stroke="#4A3428" strokeWidth="1.5" />
  </svg>
);

/**
 * 自行车/骑行漫游手绘插画
 */
export const BicycleStickerSVG: React.FC<IllustrationProps> = ({ size = 68, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="16" fill="#FFF7ED" />
    {/* 后轮与前轮 */}
    <circle cx="28" cy="65" r="14" fill="#FFFFFF" stroke="#4A3428" strokeWidth="2.6" />
    <circle cx="28" cy="65" r="5" fill="#E2E8F0" stroke="#4A3428" strokeWidth="1.8" />
    <circle cx="72" cy="65" r="14" fill="#FFFFFF" stroke="#4A3428" strokeWidth="2.6" />
    <circle cx="72" cy="65" r="5" fill="#E2E8F0" stroke="#4A3428" strokeWidth="1.8" />
    {/* 车架 */}
    <path
      d="M 28 65 L 48 65 L 62 44 L 44 44 L 28 65 M 48 65 L 42 38 M 62 44 L 72 65 M 62 44 L 58 35 L 50 35"
      stroke="#F97316"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 车座与车把 */}
    <rect x="36" y="36" width="14" height="4" rx="2" fill="#4A3428" />
    <circle cx="48" cy="35" r="2" fill="#4A3428" />
  </svg>
);

/**
 * 奖状/勋章高光手绘插画
 */
export const MedalStickerSVG: React.FC<IllustrationProps> = ({ size = 68, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="16" fill="#FEFCE8" />
    {/* 奖带 */}
    <polygon points="34,22 42,50 50,42 40,20" fill="#EF4444" stroke="#4A3428" strokeWidth="2.2" strokeLinejoin="round" />
    <polygon points="66,22 58,50 50,42 60,20" fill="#3B82F6" stroke="#4A3428" strokeWidth="2.2" strokeLinejoin="round" />
    {/* 金牌主体 */}
    <circle cx="50" cy="56" r="20" fill="#FACC15" stroke="#4A3428" strokeWidth="2.8" />
    <circle cx="50" cy="56" r="15" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.8" />
    <polygon points="50,45 53,53 61,53 55,58 57,66 50,61 43,66 45,58 39,53 47,53" fill="#EAB308" stroke="#4A3428" strokeWidth="1.4" />
  </svg>
);

/**
 * 医务室/藿香正气水/中暑小药箱
 */
export const HospitalStickerSVG: React.FC<IllustrationProps> = ({ size = 68, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="16" fill="#FDF2F8" />
    <rect x="22" y="32" width="56" height="46" rx="8" fill="#FFFFFF" stroke="#4A3428" strokeWidth="2.8" />
    <path d="M 38 32 C 38 22, 62 22, 62 32" stroke="#4A3428" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    {/* 红十字 */}
    <rect x="45" y="43" width="10" height="24" rx="2" fill="#EF4444" />
    <rect x="38" y="50" width="24" height="10" rx="2" fill="#EF4444" />
  </svg>
);

/**
 * 书籍与课桌手绘插画
 */
export const BookStickerSVG: React.FC<IllustrationProps> = ({ size = 68, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="16" fill="#F5F3FF" />
    {/* 叠放的书籍 */}
    <rect x="24" y="58" width="52" height="14" rx="3" fill="#60A5FA" stroke="#4A3428" strokeWidth="2.4" />
    <rect x="28" y="44" width="46" height="14" rx="3" fill="#34D399" stroke="#4A3428" strokeWidth="2.4" />
    <rect x="32" y="30" width="40" height="14" rx="3" fill="#F472B6" stroke="#4A3428" strokeWidth="2.4" />
    {/* 书签飘带 */}
    <path d="M 44 26 L 44 40 L 48 37 L 52 40 L 52 26 Z" fill="#FBBF24" stroke="#4A3428" strokeWidth="1.5" />
  </svg>
);

/**
 * 骄阳与夏日插画
 */
export const SunStickerSVG: React.FC<IllustrationProps> = ({ size = 68, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    <rect width="100" height="100" rx="16" fill="#EFF6FF" />
    <circle cx="50" cy="50" r="20" fill="#FBBF24" stroke="#4A3428" strokeWidth="2.8" />
    {/* 光芒 */}
    <g stroke="#F59E0B" strokeWidth="3" strokeLinecap="round">
      <line x1="50" y1="18" x2="50" y2="24" />
      <line x1="50" y1="76" x2="50" y2="82" />
      <line x1="18" y1="50" x2="24" y2="50" />
      <line x1="76" y1="50" x2="82" y2="50" />
      <line x1="27" y1="27" x2="32" y2="32" />
      <line x1="68" y1="68" x2="73" y2="73" />
      <line x1="27" y1="73" x2="32" y2="68" />
      <line x1="68" y1="32" x2="73" y2="27" />
    </g>
    {/* 墨镜 */}
    <path d="M 38 48 C 38 54, 46 54, 46 48 Z" fill="#1F2937" />
    <path d="M 54 48 C 54 54, 62 54, 62 48 Z" fill="#1F2937" />
    <line x1="46" y1="49" x2="54" y2="49" stroke="#1F2937" strokeWidth="2" />
  </svg>
);

export const PRESET_STICKERS: Array<{ key: string; label: string; render: (size?: number) => React.ReactNode }> = [
  { key: 'cat', label: '萌猫', render: (size) => <CuteCatStickerSVG size={size} /> },
  { key: 'school', label: '学校', render: (size) => <SchoolStickerSVG size={size} /> },
  { key: 'bicycle', label: '骑行', render: (size) => <BicycleStickerSVG size={size} /> },
  { key: 'hospital', label: '医务', render: (size) => <HospitalStickerSVG size={size} /> },
  { key: 'medal', label: '高光', render: (size) => <MedalStickerSVG size={size} /> },
  { key: 'book', label: '求学', render: (size) => <BookStickerSVG size={size} /> },
  { key: 'perfume', label: '礼物', render: (size) => <PerfumeBoxStickerSVG size={size} /> },
  { key: 'sun', label: '夏日', render: (size) => <SunStickerSVG size={size} /> },
];

export function renderLifeIllustration(badgeKey?: string, size = 68): React.ReactNode {
  switch (badgeKey) {
    case 'cat':
      return <CuteCatStickerSVG size={size} />;
    case 'school':
      return <SchoolStickerSVG size={size} />;
    case 'bicycle':
      return <BicycleStickerSVG size={size} />;
    case 'hospital':
      return <HospitalStickerSVG size={size} />;
    case 'medal':
      return <MedalStickerSVG size={size} />;
    case 'book':
      return <BookStickerSVG size={size} />;
    case 'perfume':
      return <PerfumeBoxStickerSVG size={size} />;
    case 'sun':
      return <SunStickerSVG size={size} />;
    default:
      return <CuteCatStickerSVG size={size} />;
  }
}
