import React from 'react';

interface CharacterProps {
  isAccelerating?: boolean;
}

/**
 * 1. 🐶 狗狗角色（极致还原参考图：平背平腹、正规转折脖子、圆黑鼻、闭眼微笑、黑项圈小绿挂牌、向前弯折可爱小狗爪）
 */
export const DogCharacter: React.FC<CharacterProps> = ({ isAccelerating }) => {
  const duration = isAccelerating ? 0.35 : 0.65;
  const speed = `${duration}s`;

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
            0%, 100% { transform: rotate(-6deg); }
            50% { transform: rotate(16deg); }
          }
          @keyframes dogLegSwingA {
            0% { transform: rotate(-24deg); }
            50% { transform: rotate(22deg); }
            100% { transform: rotate(-24deg); }
          }
          @keyframes dogLegSwingB {
            0% { transform: rotate(22deg); }
            50% { transform: rotate(-24deg); }
            100% { transform: rotate(22deg); }
          }
          @keyframes shadowPulse {
            0%, 100% { transform: scaleX(1); opacity: 0.6; }
            50% { transform: scaleX(0.86); opacity: 0.4; }
          }
        `}</style>
      </defs>

      {/* 地面胶囊阴影（与参考图一致的柔和灰棕色） */}
      <ellipse
        cx="110"
        cy="158"
        rx="52"
        ry="6"
        fill="#D4C5B5"
        style={{
          transformOrigin: '110px 158px',
          animation: `shadowPulse ${speed} ease-in-out infinite`,
        }}
      />

      {/* 后排腿（右后腿、右前腿，颜色稍深产生光影空间感） */}
      <g style={{ fill: '#E6942C' }}>
        {/* 后排右后腿 */}
        <g style={{ transformOrigin: '72px 124px', animation: `dogLegSwingB ${speed} ease-in-out infinite` }}>
          <path d="M 68 124 L 68 142 C 68 147, 70 150, 75 150 L 82 150 C 86 150, 88 146, 86 142 C 84 138, 77 139, 77 124 Z" />
        </g>
        {/* 后排右前腿 */}
        <g style={{ transformOrigin: '138px 124px', animation: `dogLegSwingA ${speed} ease-in-out infinite` }}>
          <path d="M 134 124 L 134 142 C 134 147, 136 150, 141 150 L 148 150 C 152 150, 154 146, 152 142 C 150 138, 143 139, 143 124 Z" />
        </g>
      </g>

      {/* 躯干、头部、脖子、尾巴一体（上下轻快颠簸） */}
      <g
        style={{
          transformOrigin: '110px 100px',
          animation: `dogBob ${speed} ease-in-out infinite`,
        }}
      >
        {/* 向上俏皮竖起的小尾巴 */}
        <g style={{ transformOrigin: '54px 92px', animation: `dogTail ${speed} ease-in-out infinite` }}>
          <path
            d="M 54 94 C 48 84, 42 74, 50 68 C 55 64, 58 74, 60 88 Z"
            fill="#F9A436"
          />
        </g>

        {/* 身体主轮廓：圆角平直躯干与连贯直角脖颈 */}
        <path
          d="M 52 86 
             L 116 86 
             L 116 46 C 116 40, 122 36, 128 36 
             L 138 36 C 142 36, 144 40, 144 46 
             L 144 58 
             L 174 58 C 182 58, 184 66, 182 74 C 180 82, 172 86, 162 86 
             L 146 86 
             L 146 114 C 146 122, 140 126, 132 126 
             L 66 126 C 58 126, 52 120, 52 112 Z"
          fill="#F9A436"
        />

        {/* 耷拉在脑袋一侧的萌萌小圆耳 */}
        <path
          d="M 122 36 C 114 34, 112 46, 114 56 C 116 66, 122 68, 126 66 C 130 64, 128 40, 122 36 Z"
          fill="#E6942C"
        />

        {/* 黑色项圈与小绿吊牌 */}
        <rect x="114" y="74" width="32" height="10" rx="3" fill="#241B15" />
        <circle cx="148" cy="86" r="4.5" fill="#5B9A42" />

        {/* 标志性大黑圆按钮鼻 */}
        <circle cx="175" cy="67" r="7.5" fill="#241B15" />

        {/* 闭目享受的弯弯笑眼弧 */}
        <path
          d="M 138 52 Q 144 60 150 52"
          stroke="#241B15"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* 前排腿（左后腿、左前腿，明亮暖黄，自然前屈小肉垫足部） */}
      <g style={{ fill: '#F9A436' }}>
        {/* 前排左后腿 */}
        <g style={{ transformOrigin: '78px 124px', animation: `dogLegSwingA ${speed} ease-in-out infinite` }}>
          <path d="M 74 124 L 74 142 C 74 147, 76 150, 81 150 L 88 150 C 92 150, 94 146, 92 142 C 90 138, 83 139, 83 124 Z" />
        </g>
        {/* 前排左前腿 */}
        <g style={{ transformOrigin: '132px 124px', animation: `dogLegSwingB ${speed} ease-in-out infinite` }}>
          <path d="M 128 124 L 128 142 C 128 147, 130 150, 135 150 L 142 150 C 146 150, 148 146, 146 142 C 144 138, 137 139, 137 124 Z" />
        </g>
      </g>
    </svg>
  );
};

/**
 * 2. 🐱 猫猫角色（与狗狗同画风的圆润萌猫：浑然一体的胸颈身躯、绝无突兀断层、珊瑚粉项圈金铃铛、灵动三角耳与前屈软肉爪）
 */
export const CatCharacter: React.FC<CharacterProps> = ({ isAccelerating }) => {
  const duration = isAccelerating ? 0.32 : 0.6;
  const speed = `${duration}s`;

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
            50% { transform: translateY(-4px); }
          }
          @keyframes catTailWave {
            0%, 100% { transform: rotate(-6deg); }
            50% { transform: rotate(12deg); }
          }
          @keyframes catLegSwingA {
            0% { transform: rotate(-22deg); }
            50% { transform: rotate(20deg); }
            100% { transform: rotate(-22deg); }
          }
          @keyframes catLegSwingB {
            0% { transform: rotate(20deg); }
            50% { transform: rotate(-22deg); }
            100% { transform: rotate(20deg); }
          }
          @keyframes shadowPulseCat {
            0%, 100% { transform: scaleX(1); opacity: 0.6; }
            50% { transform: scaleX(0.88); opacity: 0.42; }
          }
        `}</style>
      </defs>

      {/* 地面胶囊阴影 */}
      <ellipse
        cx="110"
        cy="158"
        rx="48"
        ry="6"
        fill="#D4C5B5"
        style={{
          transformOrigin: '110px 158px',
          animation: `shadowPulseCat ${speed} ease-in-out infinite`,
        }}
      />

      {/* 后排腿（深暖金黄，前屈小猫爪） */}
      <g style={{ fill: '#E6A700' }}>
        {/* 后右腿 */}
        <g style={{ transformOrigin: '72px 124px', animation: `catLegSwingB ${speed} ease-in-out infinite` }}>
          <path d="M 69 124 L 69 142 C 69 146, 71 149, 75 149 L 81 149 C 84 149, 85 146, 84 142 C 82 138, 77 139, 77 124 Z" />
        </g>
        {/* 前右腿 */}
        <g style={{ transformOrigin: '134px 124px', animation: `catLegSwingA ${speed} ease-in-out infinite` }}>
          <path d="M 131 124 L 131 142 C 131 146, 133 149, 137 149 L 143 149 C 146 149, 147 146, 146 142 C 144 138, 139 139, 139 124 Z" />
        </g>
      </g>

      {/* 躯干、头部、脖子、尾巴整体容器（自然颠簸起伏） */}
      <g
        style={{
          transformOrigin: '110px 100px',
          animation: `catBob ${speed} ease-in-out infinite`,
        }}
      >
        {/* 优雅高挺的 S 型波浪长猫尾巴 */}
        <g style={{ transformOrigin: '56px 98px', animation: `catTailWave ${speed} ease-in-out infinite` }}>
          <path
            d="M 56 98 C 42 92, 34 74, 42 56 C 46 48, 54 50, 52 58 C 46 70, 48 84, 62 90 Z"
            fill="#FACC15"
          />
        </g>

        {/* 浑然一体的猫身与坚实胸颈（连贯无断层、无白色缝隙） */}
        <path
          d="M 54 88
             C 54 84, 68 84, 88 84
             L 116 84
             C 120 74, 126 64, 134 58
             L 146 58
             C 152 66, 150 78, 146 90
             L 146 114
             C 146 122, 140 126, 132 126
             L 66 126
             C 58 126, 54 120, 54 112 Z"
          fill="#FACC15"
        />

        {/* 可爱猫头（自然覆于胸颈上方，位置和谐端正） */}
        <circle cx="140" cy="56" r="21" fill="#FACC15" />

        {/* 尖尖立体三角猫耳（外黄内粉） */}
        {/* 左耳 */}
        <path d="M 125 44 L 131 22 L 141 38 Z" fill="#FACC15" />
        <path d="M 128 40 L 132 27 L 138 36 Z" fill="#F472B6" />
        {/* 右耳 */}
        <path d="M 143 38 L 152 22 L 158 42 Z" fill="#FACC15" />
        <path d="M 146 36 L 152 27 L 156 39 Z" fill="#F472B6" />

        {/* 优雅珊瑚粉红项圈与金黄色小铃铛 */}
        <rect x="122" y="70" width="28" height="8" rx="4" fill="#FB7185" />
        <circle cx="148" cy="82" r="4" fill="#F59E0B" />
        <circle cx="148" cy="82" r="1.3" fill="#78350F" />

        {/* 闭目微笑治愈系猫眼 */}
        <path
          d="M 134 54 Q 140 60 146 54"
          stroke="#241B15"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* 小巧粉嫩倒三角鼻子 */}
        <polygon points="152,58 157,58 154.5,61.5" fill="#F43F5E" />

        {/* 治愈小猫须 */}
        <line x1="156" y1="56" x2="169" y2="54" stroke="#241B15" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="156" y1="60" x2="170" y2="63" stroke="#241B15" strokeWidth="1.6" strokeLinecap="round" />
      </g>

      {/* 前排腿（亮黄前躯，前屈可爱软爪） */}
      <g style={{ fill: '#FACC15' }}>
        {/* 前左后腿 */}
        <g style={{ transformOrigin: '78px 124px', animation: `catLegSwingA ${speed} ease-in-out infinite` }}>
          <path d="M 75 124 L 75 142 C 75 146, 77 149, 81 149 L 87 149 C 90 149, 91 146, 90 142 C 88 138, 83 139, 83 124 Z" />
        </g>
        {/* 前左前腿 */}
        <g style={{ transformOrigin: '128px 124px', animation: `catLegSwingB ${speed} ease-in-out infinite` }}>
          <path d="M 125 124 L 125 142 C 125 146, 127 149, 131 149 L 137 149 C 140 149, 141 146, 140 142 C 138 138, 133 139, 133 124 Z" />
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

          {/* 可爱豆豆眼与微笑 */}
          <circle cx="102" cy="116" r="3.5" fill="#292524" />
          <circle cx="126" cy="116" r="3.5" fill="#292524" />
          <path d="M 111 125 Q 114 129 118 125" stroke="#292524" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* 呆萌腮红 */}
          <circle cx="95" cy="123" r="3.5" fill="#F472B6" opacity="0.65" />
          <circle cx="133" cy="123" r="3.5" fill="#F472B6" opacity="0.65" />
        </g>

        {/* 头顶小草双叶 */}
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
 * 6. 🚶 人类服 · 地球玩家（大师级现代极简矢量插画：清晰修长颈部、连帽风衣、斜挎小包、卷边裤、经典白底复古球鞋）
 */
export const HumanCharacter: React.FC<CharacterProps> = ({ isAccelerating }) => {
  const duration = isAccelerating ? 0.35 : 0.65;
  const speed = `${duration}s`;

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
          @keyframes humanWalkBob {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          @keyframes humanLegA {
            0% { transform: rotate(-26deg); }
            50% { transform: rotate(26deg); }
            100% { transform: rotate(-26deg); }
          }
          @keyframes humanLegB {
            0% { transform: rotate(26deg); }
            50% { transform: rotate(-26deg); }
            100% { transform: rotate(26deg); }
          }
          @keyframes humanArmSwingA {
            0% { transform: rotate(28deg); }
            50% { transform: rotate(-26deg); }
            100% { transform: rotate(28deg); }
          }
          @keyframes humanArmSwingB {
            0% { transform: rotate(-26deg); }
            50% { transform: rotate(28deg); }
            100% { transform: rotate(-26deg); }
          }
        `}</style>
      </defs>

      {/* 地面阴影 */}
      <ellipse cx="110" cy="158" rx="38" ry="6" fill="#D4C5B5" opacity="0.65" />

      {/* 后手臂（右臂，随左腿向前而向后摆动） */}
      <g style={{ transformOrigin: '110px 84px', animation: `humanArmSwingB ${speed} ease-in-out infinite` }}>
        {/* 暖棕深袖管 */}
        <path d="M 106 82 L 102 108 C 101 113, 105 116, 110 116 C 114 116, 117 112, 116 107 L 114 82 Z" fill="#D97706" />
        {/* 露出的右手 */}
        <circle cx="106" cy="116" r="4.5" fill="#FED7AA" />
      </g>

      {/* 后腿（右腿，带时尚卷边裤与复古运动鞋） */}
      <g style={{ transformOrigin: '110px 116px', animation: `humanLegB ${speed} ease-in-out infinite` }}>
        {/* 深炭灰裤腿 */}
        <path d="M 107 114 L 105 142 L 115 142 L 117 114 Z" fill="#334155" />
        {/* 卷边裤口 */}
        <rect x="104" y="140" width="12" height="3" rx="1.5" fill="#475569" />
        {/* 右脚球鞋：白色橡胶鞋头与鞋底、深色鞋身 */}
        <g transform="translate(103, 143)">
          {/* 鞋身 */}
          <path d="M 2 4 L 2 11 L 18 11 C 21 11, 23 9, 21 5 L 14 3 Z" fill="#1E293B" />
          {/* 白色鞋头防护罩 */}
          <path d="M 14 3 C 17 3, 22 7, 21 11 L 15 11 Z" fill="#F8FAFC" />
          {/* 白色厚底 */}
          <rect x="1" y="11" width="21" height="3" rx="1.5" fill="#F8FAFC" />
          {/* 鞋底防滑黑线 */}
          <rect x="2" y="13" width="19" height="1" fill="#0F172A" />
        </g>
      </g>

      {/* 头部、脖子、上身驱干主容器（有节律上下浮动） */}
      <g style={{ transformOrigin: '110px 92px', animation: `humanWalkBob ${speed} ease-in-out infinite` }}>
        {/* 1. 清晰修长、比例协调的脖子！连接下颌与衣领 */}
        <rect x="106" y="62" width="10" height="13" rx="3" fill="#FDBA74" />

        {/* 2. 温暖姜黄风衣 / 连帽卫衣躯干 */}
        <path
          d="M 96 74 
             C 96 70, 102 68, 111 68 
             C 120 68, 126 70, 126 74 
             L 128 114 C 128 118, 124 120, 119 120 
             L 103 120 C 98 120, 94 118, 94 114 Z"
          fill="#F59E0B"
        />

        {/* 卫衣罗纹领口细节 */}
        <path d="M 103 72 Q 111 77 119 72" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* 潮酷深色斜挎包肩带 */}
        <line x1="98" y1="74" x2="124" y2="108" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        {/* 腰间小挎包 */}
        <rect x="118" y="100" width="12" height="15" rx="3" fill="#334155" />
        <rect x="120" y="104" width="8" height="2" fill="#E2E8F0" />

        {/* 3. 头部造型：暖杏色皮肤、蓬松有型的发丝 */}
        {/* 脸部基底 */}
        <ellipse cx="111" cy="48" rx="14" ry="16" fill="#FED7AA" />

        {/* 层次感短发（深暖黑褐色，侧面蓬松刘海弧度） */}
        <path
          d="M 97 46 
             C 96 32, 110 24, 124 28 
             C 128 30, 130 36, 128 42 
             C 126 40, 122 38, 116 38 
             C 106 38, 101 44, 99 50 Z"
          fill="#3B1F0A"
        />
        {/* 额头前微卷的可爱小碎发 */}
        <path d="M 118 36 Q 124 40 122 46" stroke="#3B1F0A" strokeWidth="3.2" strokeLinecap="round" fill="none" />

        {/* 侧脸清秀可人的闭目微笑弧（呼应狗狗与猫猫的自得神态） */}
        <path
          d="M 116 48 Q 121 54 126 48"
          stroke="#451A03"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* 柔嫩腮红 */}
        <circle cx="119" cy="54" r="3.2" fill="#FB7185" opacity="0.65" />

        {/* 嘴角微微扬起的治愈微笑 */}
        <path d="M 124 56 Q 126 58 128 55" stroke="#451A03" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </g>

      {/* 前腿（左腿，步伐自信向前迈步） */}
      <g style={{ transformOrigin: '110px 116px', animation: `humanLegA ${speed} ease-in-out infinite` }}>
        {/* 深炭灰修身裤腿 */}
        <path d="M 106 114 L 104 142 L 115 142 L 117 114 Z" fill="#1E293B" />
        {/* 卷边裤口 */}
        <rect x="103" y="140" width="13" height="3" rx="1.5" fill="#475569" />
        {/* 左脚球鞋 */}
        <g transform="translate(104, 143)">
          <path d="M 2 4 L 2 11 L 18 11 C 21 11, 23 9, 21 5 L 14 3 Z" fill="#334155" />
          <path d="M 14 3 C 17 3, 22 7, 21 11 L 15 11 Z" fill="#F8FAFC" />
          <rect x="1" y="11" width="21" height="3" rx="1.5" fill="#F8FAFC" />
          <rect x="2" y="13" width="19" height="1" fill="#0F172A" />
        </g>
      </g>

      {/* 前手臂（左臂，前向大方摆动） */}
      <g style={{ transformOrigin: '110px 84px', animation: `humanArmSwingA ${speed} ease-in-out infinite` }}>
        {/* 亮橙黄卫衣外袖 */}
        <path d="M 106 82 L 104 108 C 103 113, 107 116, 112 116 C 116 116, 119 112, 118 107 L 115 82 Z" fill="#F59E0B" />
        {/* 前端露出的小圆手 */}
        <circle cx="108" cy="116" r="4.5" fill="#FED7AA" />
      </g>
    </svg>
  );
};
