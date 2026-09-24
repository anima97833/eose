import React, { useState } from 'react';
import { GachaPalette, WishItem, CAPSULE_COLORS } from '../core/gachaTypes';
import { gachaAudio } from '../core/gachaAudio';
import { GachaPhysicsDome } from './GachaPhysicsDome';

interface GachaMachineStageProps {
  palette: GachaPalette;
  wishes: WishItem[];
  onDrawWish: () => void;
  isCranking: boolean;
  droppedWish: WishItem | null;
  onOpenDroppedCapsule: () => void;
}

export const GachaMachineStage: React.FC<GachaMachineStageProps> = ({
  palette,
  wishes,
  onDrawWish,
  isCranking,
  droppedWish,
  onOpenDroppedCapsule,
}) => {
  const [knobRotation, setKnobRotation] = useState<number>(0);

  const handleCrankClick = () => {
    if (isCranking) return;
    setKnobRotation((prev) => prev + 360);
    gachaAudio.playCrank();
    onDrawWish();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 360,
        height: '100%',
        maxHeight: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        flex: 1,
        minHeight: 0,
      }}
    >
      <svg
        viewBox="0 18 360 464"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', maxHeight: '100%', display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* 玻璃圆球立体高光滤镜与渐变 */}
          <radialGradient id="glassSphereGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#EBF4F6" stopOpacity="0.15" />
            <stop offset="85%" stopColor="#C9DFE3" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#89AAB1" stopOpacity="0.55" />
          </radialGradient>

          {/* 底部投地阴影 */}
          <radialGradient id="floorShadowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7A7061" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#7A7061" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#7A7061" stopOpacity="0" />
          </radialGradient>

          {/* 纸条卷折渐变 */}
          <linearGradient id="noteSlipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF5" />
            <stop offset="100%" stopColor="#F5ECD7" />
          </linearGradient>

          {/* 出蛋口内部深邃阴影 */}
          <linearGradient id="chuteInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A1E26" />
            <stop offset="100%" stopColor={palette.chute} />
          </linearGradient>
        </defs>

        {/* 1. 顶部悬吊细绳 */}
        <line
          x1="180"
          y1="-20"
          x2="180"
          y2="35"
          stroke={palette.secondary}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* 2. 底部桌面椭圆柔和投影 */}
        <ellipse cx="180" cy="452" rx="125" ry="20" fill="url(#floorShadowGrad)" />

        {/* 3. 机器底部基座 (环形底盘) */}
        <path
          d="M 80 432 Q 180 458 280 432 L 272 414 Q 180 438 88 414 Z"
          fill={palette.primary}
          stroke={palette.secondary}
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* 4. 机器下部锥形机身 */}
        <path
          d="M 125 285 L 85 418 Q 180 442 275 418 L 235 285 Q 180 292 125 285 Z"
          fill={palette.primary}
          stroke={palette.secondary}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />

        {/* 5. 出蛋口圆拱门 (Chute Gate) */}
        <path
          d="M 148 424 L 148 376 A 32 32 0 0 1 212 376 L 212 424 Z"
          fill="url(#chuteInnerGrad)"
          stroke={palette.secondary}
          strokeWidth="4"
        />

        {/* 出蛋口接蛋底槽微台阶 */}
        <path
          d="M 144 424 Q 180 434 216 424 L 214 416 Q 180 424 146 416 Z"
          fill={palette.accent}
          stroke={palette.secondary}
          strokeWidth="2.5"
        />

        {/* 6. 旋钮背板白底座 */}
        <rect
          x="146"
          y="312"
          width="68"
          height="52"
          rx="8"
          fill="#FFFFFF"
          stroke={palette.secondary}
          strokeWidth="3.5"
        />

        {/* 7. 中间圆形金属旋钮轴承与把手 (可点击交互) */}
        <g
          transform={`translate(180, 338)`}
          style={{ cursor: isCranking ? 'default' : 'pointer' }}
          onClick={handleCrankClick}
        >
          {/* 外圈 */}
          <circle cx="0" cy="0" r="22" fill={palette.accent} stroke={palette.secondary} strokeWidth="3" />
          {/* 旋转手柄 */}
          <g
            style={{
              transform: `rotate(${knobRotation}deg)`,
              transformOrigin: '0 0',
              transition: isCranking ? 'transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.4s ease-out',
            }}
          >
            <rect
              x="-24"
              y="-7"
              width="48"
              height="14"
              rx="6"
              fill={palette.primary}
              stroke={palette.secondary}
              strokeWidth="2.5"
            />
            <line x1="-16" y1="0" x2="16" y2="0" stroke={palette.secondary} strokeWidth="2.5" />
          </g>
        </g>

        {/* 8. 旋钮左侧手绘卡通气泡 "TAP!" */}
        <g
          transform="translate(82, 302)"
          style={{
            cursor: isCranking ? 'default' : 'pointer',
            transition: 'transform 0.2s',
          }}
          onClick={handleCrankClick}
          className="gacha-tap-bubble"
        >
          {/* 气泡外框 */}
          <path
            d="M 12 0 C 35 0, 70 2, 72 20 C 72 32, 55 36, 40 36 L 50 48 L 32 36 C 18 36, 0 32, 0 18 C 0 6, 12 0, 12 0 Z"
            fill="#FFFFFF"
            stroke={palette.secondary}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <text
            x="36"
            y="24"
            fill="#E84A5F"
            fontSize="18"
            fontWeight="900"
            fontFamily="Arial-Black, system-ui, sans-serif"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            TAP!
          </text>
        </g>

        {/* 9. 玻璃球体连接颈座 */}
        <path
          d="M 130 286 Q 180 294 230 286 L 225 272 Q 180 278 135 272 Z"
          fill={palette.secondary}
          stroke={palette.secondary}
          strokeWidth="3"
        />

        {/* 10. 核心透明玻璃圆球底色 (Glass Sphere Backing) */}
        <circle
          cx="180"
          cy="195"
          r="92"
          fill="url(#glassSphereGrad)"
        />

        {/* 11. 真实物理刚体碰撞扭蛋球舞台 (Real Physics Collision Dome) */}
        <foreignObject x="88" y="103" width="184" height="184">
          <GachaPhysicsDome
            palette={palette}
            wishes={wishes}
            isCranking={isCranking}
          />
        </foreignObject>

        {/* 12. 玻璃球外圈与立体反光高光弧线 (Glass Rim & Specular Reflection) */}
        <circle
          cx="180"
          cy="195"
          r="92"
          fill="none"
          stroke={palette.secondary}
          strokeWidth="4.5"
          style={{ pointerEvents: 'none' }}
        />
        <path
          d="M 225 130 A 75 75 0 0 1 254 185"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.65"
          style={{ pointerEvents: 'none' }}
        />
        <circle cx="258" cy="198" r="3" fill="#FFFFFF" opacity="0.65" style={{ pointerEvents: 'none' }} />

        {/* 13. 玻璃球顶部粉色顶盖与圆钮 (Top Dome Cap) */}
        {/* 顶盖底柱 */}
        <rect
          x="142"
          y="72"
          width="76"
          height="32"
          rx="6"
          fill={palette.primary}
          stroke={palette.secondary}
          strokeWidth="4"
        />
        {/* 顶盖中间小拱钮 */}
        <path
          d="M 166 72 A 14 14 0 0 1 194 72 Z"
          fill={palette.accent}
          stroke={palette.secondary}
          strokeWidth="3.5"
        />

        {/* 14. 滚落至出蛋口的实体扭蛋 (Dropped Capsule) */}
        {droppedWish && (
          <g
            transform="translate(180, 408)"
            style={{
              cursor: 'pointer',
              animation: 'gachaDropBounce 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            }}
            onClick={onOpenDroppedCapsule}
          >
            {/* 胶囊地面阴影 */}
            <ellipse cx="0" cy="18" rx="22" ry="7" fill="rgba(0,0,0,0.3)" />

            {/* 扭蛋主体 */}
            {(() => {
              const cCol = CAPSULE_COLORS[droppedWish.colorKey] || CAPSULE_COLORS.pink;
              return (
                <g>
                  {/* 下半球白色 */}
                  <circle cx="0" cy="0" r="21" fill={cCol.bottom} stroke={palette.secondary} strokeWidth="3.5" />
                  {/* 上半球彩色 */}
                  <path
                    d="M -21 0 A 21 21 0 0 1 21 0 Z"
                    fill={cCol.top}
                    stroke={palette.secondary}
                    strokeWidth="3.5"
                  />
                  <line x1="-21" y1="0" x2="21" y2="0" stroke={palette.secondary} strokeWidth="3" />
                  {/* 露出的愿望图标 */}
                  <text x="0" y="11" fontSize="13" textAnchor="middle">
                    {droppedWish.icon || '📜'}
                  </text>
                  {/* 诱导点击跳动的轻拟物呼吸光圈 */}
                  <circle
                    cx="0"
                    cy="0"
                    r="25"
                    fill="none"
                    stroke="#FFDE59"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="gacha-pulse-ring"
                  />
                </g>
              );
            })()}
          </g>
        )}
      </svg>

      {/* 滚落胶囊下方的快速轻点提示标签 */}
      {droppedWish && (
        <button
          onClick={onOpenDroppedCapsule}
          style={{
            position: 'absolute',
            bottom: 4,
            padding: '4px 14px',
            borderRadius: 16,
            background: palette.buttonBg || '#FFFFFF',
            border: `2px solid ${palette.buttonBorder || palette.secondary}`,
            boxShadow: `0 3px 8px ${palette.buttonBorder || palette.secondary}33`,
            color: palette.buttonText || palette.secondary,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            animation: 'floatBounce 1.5s infinite ease-in-out',
            zIndex: 10,
          }}
        >
          <span>✨ 点击开启</span>
        </button>
      )}

      {/* 动画 CSS 关键帧 */}
      <style>{`
        @keyframes gachaDropBounce {
          0% {
            transform: translate(180px, 350px) scale(0.6) rotate(-40deg);
            opacity: 0;
          }
          65% {
            transform: translate(180px, 412px) scale(1.08) rotate(15deg);
            opacity: 1;
          }
          85% {
            transform: translate(180px, 404px) scale(0.96) rotate(-5deg);
          }
          100% {
            transform: translate(180px, 408px) scale(1) rotate(0deg);
          }
        }

        .gacha-tap-bubble:hover {
          transform: translate(82px, 298px) scale(1.06);
        }
        .gacha-tap-bubble:active {
          transform: translate(82px, 304px) scale(0.94);
        }

        .gacha-pulse-ring {
          animation: gachaRingRotate 3s linear infinite;
        }
        @keyframes gachaRingRotate {
          from { transform: rotate(0deg); transform-origin: 0 0; }
          to { transform: rotate(360deg); transform-origin: 0 0; }
        }

        .gacha-jitter-1 { animation: jitter1 0.12s infinite alternate; }
        .gacha-jitter-2 { animation: jitter2 0.14s infinite alternate; }
        .gacha-jitter-3 { animation: jitter3 0.11s infinite alternate; }
        .gacha-jitter-4 { animation: jitter4 0.13s infinite alternate; }

        @keyframes jitter1 {
          from { transform: translate(160px, 155px) rotate(-15deg); }
          to { transform: translate(163px, 150px) rotate(20deg); }
        }
        @keyframes jitter2 {
          from { transform: translate(215px, 165px) rotate(30deg); }
          to { transform: translate(210px, 172px) rotate(-10deg); }
        }
        @keyframes jitter3 {
          from { transform: translate(135px, 195px) rotate(-40deg); }
          to { transform: translate(142px, 188px) rotate(15deg); }
        }
        @keyframes jitter4 {
          from { transform: translate(185px, 215px) rotate(10deg); }
          to { transform: translate(180px, 206px) rotate(-25deg); }
        }

        @keyframes floatBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};
