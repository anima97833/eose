import React from 'react';

interface CharacterProps {
  isAccelerating?: boolean;
}

/**
 * 1. 🐶 狗狗角色（忠实还原参考图：暖黄几何身形、圆黑鼻、闭眼微笑、黑项圈小绿牌、四足原地踱步）
 */
export const DogCharacter: React.FC<CharacterProps> = ({ isAccelerating }) => {
  const speed = isAccelerating ? '0.35s' : '0.65s';

  return (
    <svg
      width="220"
      height="180"
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <style>{`
          @keyframes dogBob {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          @keyframes dogTail {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(15deg); }
          }
          @keyframes legFrontA {
            0% { transform: rotate(-22deg); }
            50% { transform: rotate(20deg); }
            100% { transform: rotate(-22deg); }
          }
          @keyframes legFrontB {
            0% { transform: rotate(20deg); }
            50% { transform: rotate(-22deg); }
            100% { transform: rotate(20deg); }
          }
          @keyframes shadowPulse {
            0%, 100% { transform: scaleX(1); opacity: 0.65; }
            50% { transform: scaleX(0.88); opacity: 0.45; }
          }
        `}</style>
      </defs>

      {/* 地面椭圆胶囊阴影 */}
      <ellipse
        cx="110"
        cy="158"
        rx="50"
        ry="6"
        fill="#D4C5B5"
        style={{
          transformOrigin: '110px 158px',
          animation: `shadowPulse ${speed} ease-in-out infinite`,
        }}
      />

      {/* 后排腿（右前腿、右后腿，颜色略暗制造景深） */}
      <g style={{ fill: '#E6942C' }}>
        {/* 后排右后腿 */}
        <g style={{ transformOrigin: '70px 125px', animation: `legFrontB ${speed} ease-in-out infinite` }}>
          <path d="M 66 125 C 66 125, 60 142, 63 150 C 64 153, 72 153, 75 149 C 78 144, 76 125, 76 125 Z" />
        </g>
        {/* 后排右前腿 */}
        <g style={{ transformOrigin: '142px 125px', animation: `legFrontA ${speed} ease-in-out infinite` }}>
          <path d="M 138 125 C 138 125, 133 142, 136 150 C 138 153, 146 153, 149 149 C 151 144, 147 125, 147 125 Z" />
        </g>
      </g>

      {/* 主躯干与头部（带微幅上下颠簸） */}
      <g
        style={{
          transformOrigin: '110px 100px',
          animation: `dogBob ${speed} ease-in-out infinite`,
        }}
      >
        {/* 尾巴（欢快摇晃） */}
        <g style={{ transformOrigin: '54px 92px', animation: `dogTail ${speed} ease-in-out infinite` }}>
          <path
            d="M 54 92 C 50 82, 45 74, 52 70 C 58 66, 61 78, 62 86 Z"
            fill="#F9A436"
          />
        </g>

        {/* 身体主轮廓（圆角几何长条） */}
        <rect x="52" y="86" width="94" height="42" rx="14" fill="#F9A436" />

        {/* 脖子与头部 */}
        <path
          d="M 118 100 L 118 48 C 118 42, 124 38, 130 38 L 138 38 C 142 38, 144 42, 144 48 L 144 62 L 172 62 C 180 62, 184 68, 182 76 C 180 84, 172 88, 164 88 L 146 88 L 146 100 Z"
          fill="#F9A436"
        />

        {/* 耷拉的小圆耳 */}
        <path
          d="M 128 38 C 122 36, 120 46, 120 54 C 120 62, 126 64, 130 62 C 134 60, 133 42, 128 38 Z"
          fill="#E6942C"
        />

        {/* 项圈（深黑褐色）与小绿坠 */}
        <rect x="117" y="74" width="29" height="10" rx="3" fill="#2E241E" />
        <circle cx="150" cy="85" r="4.5" fill="#65A30D" />

        {/* 黑色大圆按钮鼻子 */}
        <circle cx="178" cy="69" r="7.5" fill="#2E241E" />

        {/* 闭眼陶醉微笑眼弧 */}
        <path
          d="M 141 54 Q 147 62 153 54"
          stroke="#2E241E"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* 前排腿（左前腿、左后腿，亮色） */}
      <g style={{ fill: '#F9A436' }}>
        {/* 前排左后腿 */}
        <g style={{ transformOrigin: '76px 125px', animation: `legFrontA ${speed} ease-in-out infinite` }}>
          <path d="M 72 125 C 72 125, 66 142, 69 150 C 71 153, 79 153, 82 149 C 84 144, 82 125, 82 125 Z" />
        </g>
        {/* 前排左前腿 */}
        <g style={{ transformOrigin: '132px 125px', animation: `legFrontB ${speed} ease-in-out infinite` }}>
          <path d="M 128 125 C 128 125, 123 142, 126 150 C 128 153, 136 153, 139 149 C 141 144, 138 125, 138 125 Z" />
        </g>
      </g>
    </svg>
  );
};

/**
 * 2. 🐱 猫猫角色（轻盈奶油橘猫、尖尖三角耳、优雅问号尾、高冷闭眼）
 */
export const CatCharacter: React.FC<CharacterProps> = ({ isAccelerating }) => {
  const speed = isAccelerating ? '0.32s' : '0.6s';

  return (
    <svg
      width="220"
      height="180"
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <style>{`
          @keyframes catBob {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          @keyframes catTail {
            0%, 100% { transform: rotate(-8deg); }
            50% { transform: rotate(12deg); }
          }
          @keyframes catLegA {
            0% { transform: rotate(-24deg); }
            50% { transform: rotate(22deg); }
            100% { transform: rotate(-24deg); }
          }
          @keyframes catLegB {
            0% { transform: rotate(22deg); }
            50% { transform: rotate(-24deg); }
            100% { transform: rotate(22deg); }
          }
        `}</style>
      </defs>

      <ellipse cx="110" cy="158" rx="46" ry="6" fill="#D4C5B5" opacity="0.6" />

      {/* 后排腿 */}
      <g style={{ fill: '#EAB308' }}>
        <g style={{ transformOrigin: '76px 125px', animation: `catLegB ${speed} ease-in-out infinite` }}>
          <rect x="73" y="125" width="8" height="26" rx="4" />
        </g>
        <g style={{ transformOrigin: '136px 125px', animation: `catLegA ${speed} ease-in-out infinite` }}>
          <rect x="133" y="125" width="8" height="26" rx="4" />
        </g>
      </g>

      {/* 主躯干与头部 */}
      <g style={{ transformOrigin: '110px 100px', animation: `catBob ${speed} ease-in-out infinite` }}>
        {/* 优雅高挑波浪猫尾巴 */}
        <g style={{ transformOrigin: '58px 105px', animation: `catTail ${speed} ease-in-out infinite` }}>
          <path
            d="M 58 105 C 42 100, 36 75, 45 58 C 49 50, 56 50, 54 58 C 50 68, 48 90, 64 96 Z"
            fill="#FACC15"
          />
        </g>

        {/* 猫身 */}
        <rect x="58" y="90" width="84" height="38" rx="16" fill="#FACC15" />

        {/* 尖尖猫耳朵 */}
        <path d="M 124 50 L 132 30 L 140 48 Z" fill="#FACC15" />
        <path d="M 127 48 L 132 35 L 137 47 Z" fill="#F472B6" />

        <path d="M 144 50 L 152 30 L 160 48 Z" fill="#FACC15" />
        <path d="M 147 48 L 152 35 L 157 47 Z" fill="#F472B6" />

        {/* 圆圆猫头 */}
        <circle cx="142" cy="65" r="22" fill="#FACC15" />

        {/* 猫眼睛：弯月微笑弧 */}
        <path d="M 140 64 Q 146 70 152 64" stroke="#2E241E" strokeWidth="2.8" strokeLinecap="round" fill="none" />

        {/* 小粉鼻 */}
        <polygon points="156,69 161,69 158.5,73" fill="#F43F5E" />

        {/* 胡须 */}
        <line x1="162" y1="67" x2="175" y2="65" stroke="#2E241E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="162" y1="71" x2="176" y2="73" stroke="#2E241E" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* 前排腿 */}
      <g style={{ fill: '#FACC15' }}>
        <g style={{ transformOrigin: '84px 125px', animation: `catLegA ${speed} ease-in-out infinite` }}>
          <rect x="80" y="125" width="8" height="26" rx="4" />
        </g>
        <g style={{ transformOrigin: '128px 125px', animation: `catLegB ${speed} ease-in-out infinite` }}>
          <rect x="124" y="125" width="8" height="26" rx="4" />
        </g>
      </g>
    </svg>
  );
};

/**
 * 3. 🪨 无机物服 · 呆萌圆润石头（滚动漫游、头上顶着一株小青苔豆芽）
 */
export const StoneCharacter: React.FC<CharacterProps> = ({ isAccelerating }) => {
  const duration = isAccelerating ? 0.4 : 0.8;
  const speed = `${duration}s`;
  const rollSpeed = `${duration * 2}s`;

  return (
    <svg
      width="220"
      height="180"
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <style>{`
          @keyframes stoneRoll {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes stoneBounce {
            0%, 100% { transform: translateY(0px) scale(1, 1); }
            50% { transform: translateY(-8px) scale(0.96, 1.04); }
          }
          @keyframes dustPuff {
            0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
            50% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(-25px, -12px) scale(1.4); }
          }
        `}</style>
      </defs>

      {/* 地面阴影 */}
      <ellipse cx="110" cy="156" rx="42" ry="7" fill="#D4C5B5" opacity="0.7" />

      {/* 滚动扬尘效果 */}
      <circle cx="68" cy="152" r="5" fill="#E2D4C5" style={{ animation: `dustPuff ${speed} ease-out infinite` }} />
      <circle cx="58" cy="155" r="3.5" fill="#E2D4C5" style={{ animation: `dustPuff ${speed} ease-out 0.2s infinite` }} />

      {/* 弹跳与旋转容器 */}
      <g style={{ transformOrigin: '110px 120px', animation: `stoneBounce ${speed} ease-in-out infinite` }}>
        <g style={{ transformOrigin: '110px 120px', animation: `stoneRoll ${rollSpeed} linear infinite` }}>
          {/* 石头主体（圆润温和的卵石形状） */}
          <path
            d="M 75 120 C 72 95, 92 78, 115 78 C 142 78, 155 98, 150 125 C 146 146, 130 152, 110 152 C 86 152, 77 138, 75 120 Z"
            fill="#A8A29E"
          />
          {/* 石头表面浅色高光斑 */}
          <ellipse cx="120" cy="94" rx="16" ry="8" fill="#D6D3D1" opacity="0.6" transform="rotate(-15, 120, 94)" />

          {/* 可爱豆豆眼与微笑 (即使倒立也有一种憨态) */}
          <circle cx="102" cy="116" r="3.5" fill="#292524" />
          <circle cx="126" cy="116" r="3.5" fill="#292524" />
          <path d="M 111 125 Q 114 129 118 125" stroke="#292524" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* 呆萌腮红 */}
          <circle cx="95" cy="123" r="3.5" fill="#F472B6" opacity="0.65" />
          <circle cx="133" cy="123" r="3.5" fill="#F472B6" opacity="0.65" />
        </g>

        {/* 头顶顽强生长的小草双叶（固定在顶部，随跳跃微晃） */}
        <g style={{ transformOrigin: '110px 78px' }}>
          <path d="M 110 78 Q 110 65 102 60 Q 112 66 110 78" fill="#84CC16" />
          <path d="M 110 78 Q 112 62 122 62 Q 112 68 110 78" fill="#65A30D" />
        </g>
      </g>
    </svg>
  );
};

/**
 * 4. 🦋 昆虫服 · 扑腾向光小彩蝶（薄荷粉双色翅、3D 扇动、空中波浪起伏）
 */
export const ButterflyCharacter: React.FC<CharacterProps> = ({ isAccelerating }) => {
  const duration = isAccelerating ? 0.2 : 0.4;
  const speed = `${duration}s`;
  const hoverSpeed = `${duration * 2}s`;

  return (
    <svg
      width="220"
      height="180"
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <style>{`
          @keyframes flyHover {
            0%, 100% { transform: translateY(0px) rotate(4deg); }
            50% { transform: translateY(-16px) rotate(-4deg); }
          }
          @keyframes wingLeft {
            0%, 100% { transform: scaleX(1); }
            50% { transform: scaleX(0.25); }
          }
          @keyframes wingRight {
            0%, 100% { transform: scaleX(1); }
            50% { transform: scaleX(0.25); }
          }
        `}</style>
      </defs>

      <ellipse cx="110" cy="158" rx="28" ry="5" fill="#D4C5B5" opacity="0.45" />

      {/* 飞舞浮动容器 */}
      <g style={{ transformOrigin: '110px 100px', animation: `flyHover ${hoverSpeed} ease-in-out infinite` }}>
        {/* 左侧大翅膀 */}
        <g style={{ transformOrigin: '106px 95px', animation: `wingLeft ${speed} ease-in-out infinite` }}>
          <path
            d="M 106 95 C 90 60, 52 56, 56 82 C 60 102, 85 106, 106 102 Z"
            fill="#34D399"
          />
          <path
            d="M 106 102 C 86 110, 68 126, 76 136 C 85 144, 98 128, 106 110 Z"
            fill="#F472B6"
            opacity="0.85"
          />
          <circle cx="78" cy="82" r="5" fill="#FFFFFF" opacity="0.75" />
        </g>

        {/* 蝴蝶躯干 */}
        <rect x="105" y="80" width="10" height="34" rx="5" fill="#334155" />

        {/* 两根可爱的触角带小圆珠 */}
        <path d="M 107 82 Q 100 70 94 66" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="93" cy="65" r="2.5" fill="#34D399" />

        <path d="M 113 82 Q 120 70 126 66" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="127" cy="65" r="2.5" fill="#34D399" />

        {/* 右侧大翅膀 */}
        <g style={{ transformOrigin: '114px 95px', animation: `wingRight ${speed} ease-in-out infinite` }}>
          <path
            d="M 114 95 C 130 60, 168 56, 164 82 C 160 102, 135 106, 114 102 Z"
            fill="#34D399"
          />
          <path
            d="M 114 102 C 134 110, 152 126, 144 136 C 135 144, 122 128, 114 110 Z"
            fill="#F472B6"
            opacity="0.85"
          />
          <circle cx="142" cy="82" r="5" fill="#FFFFFF" opacity="0.75" />
        </g>
      </g>
    </svg>
  );
};

/**
 * 5. 🐋 海洋服 · 治愈巨鲸（浪花波浪游弋、喷水气泡、憨憨白肚皮）
 */
export const WhaleCharacter: React.FC<CharacterProps> = ({ isAccelerating }) => {
  const duration = isAccelerating ? 0.35 : 0.7;
  const speed = `${duration}s`;
  const swimSpeed = `${duration * 1.5}s`;

  return (
    <svg
      width="220"
      height="180"
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <style>{`
          @keyframes whaleSwim {
            0%, 100% { transform: translateY(0px) rotate(-3deg); }
            50% { transform: translateY(-8px) rotate(4deg); }
          }
          @keyframes whaleTail {
            0%, 100% { transform: rotate(-15deg); }
            50% { transform: rotate(18deg); }
          }
          @keyframes flipperPaddle {
            0%, 100% { transform: rotate(10deg); }
            50% { transform: rotate(-15deg); }
          }
          @keyframes waterSpout {
            0% { opacity: 0; transform: translateY(0) scale(0.4); }
            50% { opacity: 0.9; }
            100% { opacity: 0; transform: translateY(-22px) scale(1.1); }
          }
        `}</style>
      </defs>

      <ellipse cx="110" cy="158" rx="55" ry="6" fill="#D4C5B5" opacity="0.5" />

      {/* 鲸鱼主体泳动容器 */}
      <g style={{ transformOrigin: '110px 105px', animation: `whaleSwim ${swimSpeed} ease-in-out infinite` }}>
        {/* 头顶喷水小水滴动画 */}
        <g style={{ animation: `waterSpout ${swimSpeed} ease-out infinite` }}>
          <circle cx="132" cy="52" r="3.5" fill="#60A5FA" />
          <circle cx="127" cy="42" r="2.5" fill="#93C5FD" />
          <circle cx="138" cy="44" r="2.5" fill="#93C5FD" />
        </g>

        {/* 鲸鱼尾巴 */}
        <g style={{ transformOrigin: '55px 105px', animation: `whaleTail ${speed} ease-in-out infinite` }}>
          <path
            d="M 58 105 C 42 100, 30 85, 32 75 C 36 76, 46 88, 52 98 C 45 88, 35 78, 30 82 C 28 92, 42 112, 58 108 Z"
            fill="#3B82F6"
          />
        </g>

        {/* 鲸鱼蓝色后背 */}
        <path
          d="M 52 105 C 50 82, 85 64, 135 64 C 172 64, 185 85, 182 105 C 180 126, 155 138, 120 138 C 75 138, 54 125, 52 105 Z"
          fill="#3B82F6"
        />

        {/* 憨憨白色大圆肚皮 */}
        <path
          d="M 78 116 C 95 110, 130 110, 165 116 C 160 134, 142 138, 120 138 C 95 138, 82 130, 78 116 Z"
          fill="#EFF6FF"
        />

        {/* 鲸鱼微笑弧线与黑豆眼 */}
        <circle cx="160" cy="94" r="3.5" fill="#1E3A8A" />
        <path d="M 154 102 Q 164 108 174 102" stroke="#1E3A8A" strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* 划水小鱼鳍 */}
        <g style={{ transformOrigin: '120px 115px', animation: `flipperPaddle ${speed} ease-in-out infinite` }}>
          <path d="M 120 115 C 122 128, 135 132, 140 126 C 142 120, 132 115, 120 115 Z" fill="#2563EB" />
        </g>
      </g>
    </svg>
  );
};

/**
 * 6. 🚶 人类服 · 地球玩家（昂首阔步、双手微摆、终点站定、展开光环）
 */
export const HumanCharacter: React.FC<CharacterProps> = ({ isAccelerating }) => {
  const speed = isAccelerating ? '0.35s' : '0.65s';

  return (
    <svg
      width="220"
      height="180"
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <style>{`
          @keyframes humanBob {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          @keyframes humanLegL {
            0% { transform: rotate(-26deg); }
            50% { transform: rotate(26deg); }
            100% { transform: rotate(-26deg); }
          }
          @keyframes humanLegR {
            0% { transform: rotate(26deg); }
            50% { transform: rotate(-26deg); }
            100% { transform: rotate(26deg); }
          }
          @keyframes humanArmL {
            0% { transform: rotate(28deg); }
            50% { transform: rotate(-28deg); }
            100% { transform: rotate(28deg); }
          }
          @keyframes humanArmR {
            0% { transform: rotate(-28deg); }
            50% { transform: rotate(28deg); }
            100% { transform: rotate(-28deg); }
          }
        `}</style>
      </defs>

      {/* 地面阴影 */}
      <ellipse cx="110" cy="158" rx="36" ry="6" fill="#D4C5B5" opacity="0.65" />

      {/* 后手臂（右臂） */}
      <g style={{ transformOrigin: '110px 82px', animation: `humanArmR ${speed} ease-in-out infinite` }}>
        <rect x="106" y="80" width="8" height="32" rx="4" fill="#D97706" />
      </g>

      {/* 后腿（右腿） */}
      <g style={{ transformOrigin: '110px 115px', animation: `humanLegR ${speed} ease-in-out infinite` }}>
        <rect x="106" y="112" width="9" height="38" rx="4.5" fill="#334155" />
        <ellipse cx="114" cy="150" rx="7" ry="4" fill="#1E293B" />
      </g>

      {/* 头部与身体 */}
      <g style={{ transformOrigin: '110px 90px', animation: `humanBob ${speed} ease-in-out infinite` }}>
        {/* 温暖亮黄风衣/卫衣躯干 */}
        <rect x="98" y="74" width="24" height="42" rx="8" fill="#F59E0B" />

        {/* 头部 */}
        <circle cx="110" cy="52" r="15" fill="#FDE68A" />

        {/* 呆萌头发/毛线帽 */}
        <path d="M 96 50 C 96 38, 124 38, 124 50 Z" fill="#78350F" />
        <circle cx="110" cy="36" r="3.5" fill="#F59E0B" />

        {/* 侧脸闭眼微笑 */}
        <circle cx="116" cy="52" r="2" fill="#78350F" />
        <path d="M 115 57 Q 118 60 122 57" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      {/* 前腿（左腿） */}
      <g style={{ transformOrigin: '110px 115px', animation: `humanLegL ${speed} ease-in-out infinite` }}>
        <rect x="105" y="112" width="10" height="38" rx="5" fill="#475569" />
        <ellipse cx="115" cy="150" rx="8" ry="4.5" fill="#0F172A" />
      </g>

      {/* 前手臂（左臂） */}
      <g style={{ transformOrigin: '110px 82px', animation: `humanArmL ${speed} ease-in-out infinite` }}>
        <rect x="106" y="80" width="9" height="32" rx="4.5" fill="#F59E0B" />
        <circle cx="110" cy="112" r="5" fill="#FDE68A" />
      </g>
    </svg>
  );
};
