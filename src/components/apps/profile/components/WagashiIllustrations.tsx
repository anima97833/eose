import React from 'react';

interface WagashiProps {
  size?: number;
}

// 1. 花见和果子 (Flower Wagashi - 粉白五瓣樱花果子)
export const FlowerWagashiSVG: React.FC<WagashiProps> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* 底层浅粉圆晕 */}
    <circle cx="32" cy="32" r="28" fill="#FFF5F7" />
    {/* 5 瓣花瓣 */}
    {[0, 72, 144, 216, 288].map((angle, i) => (
      <path
        key={i}
        d="M 32 32 C 24 16, 40 16, 32 32 Z"
        transform={`rotate(${angle} 32 32) translate(0 -8)`}
        fill="#F472B6"
        stroke="#502428"
        strokeWidth="1.8"
      />
    ))}
    {/* 花心 */}
    <circle cx="32" cy="32" r="6" fill="#FDE047" stroke="#502428" strokeWidth="1.8" />
    <circle cx="32" cy="32" r="2" fill="#EAB308" />
  </svg>
);

// 2. 红豆馒头 (Manju - 切开的香甜豆沙馒头)
export const ManjuSVG: React.FC<WagashiProps> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="#FFFBEB" />
    {/* 馒头整果 */}
    <ellipse cx="26" cy="28" rx="14" ry="11" fill="#FBBF24" stroke="#502428" strokeWidth="2" />
    <path d="M 26 21 C 24 18 28 17 29 19 Z" fill="#84CC16" />
    {/* 切开的红豆沙剖面 */}
    <ellipse cx="40" cy="36" rx="15" ry="12" fill="#FDE68A" stroke="#502428" strokeWidth="2" />
    <ellipse cx="40" cy="37" rx="10" ry="7.5" fill="#78350F" stroke="#502428" strokeWidth="1.5" />
    {/* 豆沙高光 */}
    <ellipse cx="38" cy="35" rx="3" ry="1.5" fill="#9A3412" opacity="0.6" />
  </svg>
);

// 3. 雪兔和果子 (Rabbit Wagashi - 木盘上的双白兔)
export const RabbitWagashiSVG: React.FC<WagashiProps> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="#FCE7F3" />
    {/* 木托盘 */}
    <polygon points="10,44 46,32 56,38 20,50" fill="#D49A6A" stroke="#502428" strokeWidth="2" />
    {/* 左兔 */}
    <ellipse cx="24" cy="34" rx="9" ry="7.5" fill="#FFFFFF" stroke="#502428" strokeWidth="2" />
    <path d="M 22 28 C 20 24 22 21 24 24 Z" fill="#84CC16" stroke="#502428" strokeWidth="1" />
    <path d="M 26 28 C 26 23 28 21 29 24 Z" fill="#84CC16" stroke="#502428" strokeWidth="1" />
    <circle cx="18" cy="35" r="1.2" fill="#E11D48" />
    {/* 右兔 */}
    <ellipse cx="36" cy="37" rx="9" ry="8" fill="#FFFFFF" stroke="#502428" strokeWidth="2" />
    <path d="M 34 31 C 32 27 34 24 36 27 Z" fill="#84CC16" stroke="#502428" strokeWidth="1" />
    <path d="M 38 31 C 38 26 40 24 41 27 Z" fill="#84CC16" stroke="#502428" strokeWidth="1" />
    <circle cx="30" cy="38" r="1.2" fill="#E11D48" />
  </svg>
);

// 4. 樱饼果子 (Sakura Mochi - 裹着咸樱叶的粉糯米团)
export const SakuraMochiSVG: React.FC<WagashiProps> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="#F0FDF4" />
    {/* 木盘 */}
    <ellipse cx="32" cy="46" rx="24" ry="8" fill="#C28B5E" stroke="#502428" strokeWidth="2" />
    {/* 粉色樱饼 */}
    <ellipse cx="32" cy="36" rx="16" ry="11" fill="#F472B6" stroke="#502428" strokeWidth="2" />
    <circle cx="38" cy="36" r="5" fill="#701A75" />
    {/* 咸樱叶环绕包裹 */}
    <path
      d="M 18 38 C 20 25, 42 25, 46 38 C 42 46, 22 46, 18 38 Z"
      fill="#65A30D"
      stroke="#502428"
      strokeWidth="1.8"
      opacity="0.85"
    />
    <path d="M 22 36 L 42 36" stroke="#3F6212" strokeWidth="1.2" />
  </svg>
);

// 5. 时令果子 (Fruit Wagashi - 柿子与水蜜桃)
export const FruitWagashiSVG: React.FC<WagashiProps> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="#FFF7ED" />
    {/* 木台 */}
    <polygon points="12,42 44,30 54,36 22,48" fill="#D49A6A" stroke="#502428" strokeWidth="2" />
    {/* 左柿子 */}
    <circle cx="26" cy="34" r="9" fill="#EA580C" stroke="#502428" strokeWidth="2" />
    <path d="M 24 25 C 22 23 28 23 27 25 Z" fill="#4D7C0F" stroke="#502428" strokeWidth="1" />
    {/* 右白桃 */}
    <ellipse cx="40" cy="36" rx="9" ry="8" fill="#FBCFE8" stroke="#502428" strokeWidth="2" />
    <path d="M 40 28 C 40 33 42 35 40 37" stroke="#DB2777" strokeWidth="1.5" />
    <path d="M 44 42 C 46 44 48 40 44 42 Z" fill="#84CC16" />
  </svg>
);

// 6. 水信玄饼 (Raindrop Mochi - 晶莹透明水珠配樱花)
export const RaindropMochiSVG: React.FC<WagashiProps> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="#E0F2FE" />
    {/* 绿箬叶底托 */}
    <path
      d="M 12 42 C 22 30, 44 32, 54 44 C 40 50, 20 48, 12 42 Z"
      fill="#84CC16"
      stroke="#502428"
      strokeWidth="1.8"
    />
    {/* 透明大水滴半球 */}
    <ellipse cx="33" cy="35" rx="14" ry="11" fill="#BAE6FD" opacity="0.6" stroke="#502428" strokeWidth="2" />
    {/* 内部凝固的粉色樱花 */}
    <circle cx="33" cy="35" r="4" fill="#F472B6" />
    <circle cx="33" cy="35" r="1.5" fill="#FDE047" />
    {/* 水晶高光弧 */}
    <path d="M 24 32 C 26 28 34 27 38 29" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 7. 草莓福袋 (Strawberry Gift)
export const StrawberryGiftSVG: React.FC<WagashiProps> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="#FFF1F2" />
    {/* 金边皇冠框花边 */}
    <path d="M 14 44 C 18 20, 46 20, 50 44 Z" fill="#FDE047" stroke="#502428" strokeWidth="2" />
    {/* 草莓 */}
    <path d="M 26 30 C 22 24, 32 24, 28 36 Z" fill="#E11D48" stroke="#502428" strokeWidth="1.5" />
    <circle cx="27" cy="29" r="0.8" fill="#FEF08A" />
    <circle cx="28" cy="32" r="0.8" fill="#FEF08A" />
    {/* 白猫头大福 */}
    <circle cx="38" cy="34" r="8" fill="#FFFFFF" stroke="#502428" strokeWidth="1.8" />
    <polygon points="33,28 35,24 37,28" fill="#FFFFFF" stroke="#502428" strokeWidth="1.2" />
    <polygon points="39,28 41,24 43,28" fill="#FFFFFF" stroke="#502428" strokeWidth="1.2" />
    {/* 粉蝴蝶结 */}
    <circle cx="34" cy="27" r="1.5" fill="#EC4899" />
  </svg>
);

// 8. 心愿礼盒 (Wagashi Gift Set - 洛可可淡紫礼盒)
export const GiftSetSVG: React.FC<WagashiProps> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="#F5F3FF" />
    {/* 紫色复古浮雕徽章底板 */}
    <path
      d="M 18 46 L 18 24 C 18 16 26 12 32 12 C 38 12 46 16 46 24 L 46 46 Z"
      fill="#DDD6FE"
      stroke="#502428"
      strokeWidth="2.2"
    />
    <ellipse cx="32" cy="32" rx="9" ry="8" fill="#EDE9FE" stroke="#502428" strokeWidth="1.5" />
    <path d="M 32 28 C 30 26 34 26 32 30" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 9. 和风茶点 (Wagashi Shop - 甜品师茶坊)
export const WagashiShopSVG: React.FC<WagashiProps> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="#FEFCE8" />
    {/* 甜品柜台 */}
    <rect x="14" y="34" width="36" height="16" rx="4" fill="#FBCFE8" stroke="#502428" strokeWidth="2" />
    {/* 小猫厨师头 */}
    <circle cx="32" cy="26" r="9" fill="#FFFFFF" stroke="#502428" strokeWidth="2" />
    <polygon points="26,20 28,15 30,19" fill="#FFFFFF" stroke="#502428" strokeWidth="1.5" />
    <polygon points="34,19 36,15 38,20" fill="#FFFFFF" stroke="#502428" strokeWidth="1.5" />
    <circle cx="28" cy="25" r="1" fill="#502428" />
    <circle cx="36" cy="25" r="1" fill="#502428" />
    <ellipse cx="32" cy="28" rx="1.2" ry="0.8" fill="#EAB308" />
    {/* 红色小蝴蝶结 */}
    <circle cx="27" cy="18" r="2" fill="#E11D48" />
  </svg>
);

// 辅助五角星组件
const SvgStar: React.FC<{ cx: number; cy: number; r: number; fill?: string }> = ({
  cx,
  cy,
  r,
  fill = '#FFFFFF',
}) => {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const currentR = i % 2 === 0 ? r : r * 0.44;
    points.push(`${cx + currentR * Math.cos(angle)},${cy + currentR * Math.sin(angle)}`);
  }
  return <polygon points={points.join(' ')} fill={fill} />;
};

// 10. 原画同款：经典星纹粉红蝴蝶结 + 悬垂蓝珍珠链 + 两侧斜向长绑带 (100% 深度还原图2原画)
export const StarredRibbonBowSVG: React.FC = () => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '46px',
      marginTop: '-2px',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 10,
    }}
  >
    <svg
      viewBox="0 0 350 48"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* 绑带及蝴蝶结柔和粉白渐变 */}
        <linearGradient id="bowPinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFAEC4" />
          <stop offset="50%" stopColor="#FF86A5" />
          <stop offset="100%" stopColor="#F46287" />
        </linearGradient>

        {/* 珍珠水光感径向渐变 */}
        <radialGradient id="bluePearlGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#CBEFFF" />
          <stop offset="100%" stopColor="#82D2FD" />
        </radialGradient>
      </defs>

      {/* ================= 1. 两侧斜向粉白长绑带（深度还原原图斜贯顶角设计） ================= */}
      {/* 左斜绑带底壳 */}
      <polygon
        points="0,38 146,14 148,24 0,48"
        fill="#502428"
        stroke="#502428"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* 左斜绑带粉色主体 */}
      <polygon
        points="0,39 145,15 147,23 0,47"
        fill="url(#bowPinkGrad)"
      />
      {/* 左斜绑带中心白色高光纹 */}
      <line
        x1="0"
        y1="43"
        x2="146"
        y2="19"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeOpacity="0.85"
        strokeLinecap="round"
      />

      {/* 右斜绑带底壳 */}
      <polygon
        points="350,38 204,14 202,24 350,48"
        fill="#502428"
        stroke="#502428"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* 右斜绑带粉色主体 */}
      <polygon
        points="350,39 205,15 203,23 350,47"
        fill="url(#bowPinkGrad)"
      />
      {/* 右斜绑带中心白色高光纹 */}
      <line
        x1="350"
        y1="43"
        x2="204"
        y2="19"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeOpacity="0.85"
        strokeLinecap="round"
      />

      {/* ================= 2. 蝴蝶结下方垂挂的淡蓝小珍珠串 (7颗晶莹珍珠) ================= */}
      <path
        d="M 152 28 Q 175 42 198 28"
        fill="none"
        stroke="#502428"
        strokeWidth="1.2"
      />
      {[
        { cx: 153, cy: 28.5, r: 3.6 },
        { cx: 160, cy: 33, r: 4.0 },
        { cx: 168, cy: 36.5, r: 4.4 },
        { cx: 175, cy: 37.5, r: 4.6 },
        { cx: 182, cy: 36.5, r: 4.4 },
        { cx: 190, cy: 33, r: 4.0 },
        { cx: 197, cy: 28.5, r: 3.6 },
      ].map((p, idx) => (
        <g key={idx}>
          <circle
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill="url(#bluePearlGrad)"
            stroke="#502428"
            strokeWidth="1.6"
          />
          {/* 珍珠高光亮斑 */}
          <circle cx={p.cx - p.r * 0.3} cy={p.cy - p.r * 0.3} r={p.r * 0.32} fill="#FFFFFF" />
        </g>
      ))}

      {/* ================= 3. 蝴蝶结下摆波浪飘带尾巴 ================= */}
      {/* 左飘带 */}
      <path
        d="M 166 22 C 150 26 138 31 122 34 C 130 31 142 28 160 24 Z"
        fill="#F46287"
        stroke="#502428"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 右飘带 */}
      <path
        d="M 184 22 C 200 26 212 31 228 34 C 220 31 208 28 190 24 Z"
        fill="#F46287"
        stroke="#502428"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* ================= 4. 蝴蝶结饱满双翼主体 ================= */}
      {/* 左翼 */}
      <path
        d="M 172 18 C 158 7 132 6 128 14 C 124 22 138 30 168 22 Z"
        fill="url(#bowPinkGrad)"
        stroke="#502428"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* 左翼内褶阴影 */}
      <path
        d="M 168 19 C 156 18 144 18 138 17"
        fill="none"
        stroke="#C93259"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* 右翼 */}
      <path
        d="M 178 18 C 192 7 218 6 222 14 C 226 22 212 30 182 22 Z"
        fill="url(#bowPinkGrad)"
        stroke="#502428"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* 右翼内褶阴影 */}
      <path
        d="M 182 19 C 194 18 206 18 212 17"
        fill="none"
        stroke="#C93259"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* ================= 5. 双翼上经典纯白五角星印花 (Stars on Bow) ================= */}
      {/* 左翼 3 颗白星 */}
      <SvgStar cx={138} cy={13} r={3.6} />
      <SvgStar cx={152} cy={11} r={3.8} />
      <SvgStar cx={146} cy={22} r={3.6} />

      {/* 右翼 3 颗白星 */}
      <SvgStar cx={212} cy={13} r={3.6} />
      <SvgStar cx={198} cy={11} r={3.8} />
      <SvgStar cx={204} cy={22} r={3.6} />

      {/* ================= 6. 中央蝴蝶结纽扣结头 ================= */}
      <rect
        x="165"
        y="8"
        width="20"
        height="20"
        rx="7"
        ry="7"
        fill="url(#bowPinkGrad)"
        stroke="#502428"
        strokeWidth="2.4"
      />
      {/* 结头中央白星 */}
      <SvgStar cx={175} cy={18} r={4.0} />
    </svg>
  </div>
);
