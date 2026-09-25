import React, { useState, useEffect, useRef } from 'react';

// 一言分类中文映射表
const HITOKOTO_CATEGORIES: Record<string, { label: string; icon: string }> = {
  d: { label: '文学名句', icon: '📖' },
  i: { label: '古典诗词', icon: '📜' },
  k: { label: '哲学思考', icon: '💡' },
  h: { label: '影视台词', icon: '🎬' },
  a: { label: '动画语录', icon: '🌌' },
};

interface HitokotoData {
  hitokoto: string;
  from: string;
  from_who?: string | null;
  type: string;
}

// 本地精品语料库 (涵盖用户指定的 5 种分类，网络超时或断网时 100% 优雅兜底)
const FALLBACK_HITOKOTO_LIST: HitokotoData[] = [
  // i: 古典诗词
  { hitokoto: '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。', from: '定风波·莫听穿林打叶声', from_who: '苏轼', type: 'i' },
  { hitokoto: '落霞与孤鹜齐飞，秋水共长天一色。', from: '滕王阁序', from_who: '王勃', type: 'i' },
  { hitokoto: '人生如逆旅，我亦是行人。', from: '临江仙·送钱穆父', from_who: '苏轼', type: 'i' },
  { hitokoto: '长风破浪会有时，直挂云帆济沧海。', from: '行路难', from_who: '李白', type: 'i' },
  { hitokoto: '休对故人思故国，且将新火试新茶。诗酒趁年华。', from: '望江南·超然台作', from_who: '苏轼', type: 'i' },

  // d: 文学名句
  { hitokoto: '满地都是六便士，他却抬头看见了月亮。', from: '月亮与六便士', from_who: '毛姆', type: 'd' },
  { hitokoto: '一个人并不是生来要给打败的，你尽可以消灭他，可就是打不败他。', from: '老人与海', from_who: '海明威', type: 'd' },
  { hitokoto: '每个人的生命中，都有一段格外艰难的时光，挺过去，人生就会豁然开朗。', from: '杨绛散文', from_who: '杨绛', type: 'd' },
  { hitokoto: '去爱，去生活，去受伤。', from: '约翰·克利斯朵夫', from_who: '罗曼·罗兰', type: 'd' },
  { hitokoto: '人生天地之间，若白驹之过隙，忽然而已。', from: '庄子·知北游', from_who: '庄周', type: 'd' },

  // k: 哲学思考
  { hitokoto: '未经审视的人生是不值得过的。', from: '申辩篇', from_who: '苏格拉底', type: 'k' },
  { hitokoto: '每一个不曾起舞的日子，都是对生命的辜负。', from: '查拉图斯特拉如是说', from_who: '尼采', type: 'k' },
  { hitokoto: '人是悬挂在自己编织的意义之网上的动物。', from: '文化的解释', from_who: '克利福德·格尔茨', type: 'k' },
  { hitokoto: '世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活。', from: '米开朗琪罗传', from_who: '罗曼·罗兰', type: 'k' },
  { hitokoto: '幸福就是身体的无痛苦和灵魂的无纷扰。', from: '道德书简', from_who: '塞涅卡', type: 'k' },

  // h: 影视台词
  { hitokoto: '生活就像一盒巧克力，你永远不知道下一颗是什么味道。', from: '阿甘正传', from_who: '阿甘', type: 'h' },
  { hitokoto: '希望是个好东西，也许是最好的东西，好东西是不会消亡的。', from: '肖申克的救赎', from_who: '安迪', type: 'h' },
  { hitokoto: '所有的相遇，都是久别重逢。', from: '一代宗师', from_who: '宫二', type: 'h' },
  { hitokoto: '无论何时，只要你开始认真生活，生活就会认真对待你。', from: '海街日记', from_who: '香田幸', type: 'h' },
  { hitokoto: '决定我们成为什么样人的，不是我们的能力，而是我们的选择。', from: '哈利·波特与密室', from_who: '邓布利多', type: 'h' },

  // a: 动画语录
  { hitokoto: '不管前方的路有多苦，只要走的方向正确，都比站在原地更接近幸福。', from: '千与千寻', from_who: '宫崎骏', type: 'a' },
  { hitokoto: '只要记住你的名字，不管你在世界的哪个地方，我一定会去见你。', from: '你的名字。', from_who: '新海诚', type: 'a' },
  { hitokoto: '所谓的成熟，就是能承受生命给予的一切，并依旧热爱生活。', from: '夏目友人帐', from_who: '夏目贵志', type: 'a' },
  { hitokoto: '与其想着怎样美丽地牺牲，不如想着怎样漂亮地活到最后一刻。', from: '银魂', from_who: '坂田银时', type: 'a' },
  { hitokoto: '隐约雷鸣，阴霾天空，但盼风雨来，能留你在此。', from: '言叶之庭', from_who: '新海诚', type: 'a' },
];

/**
 * 极简新拟态 · 黄昏街景小憩
 * 左侧：纯橡胶拟物路灯 (默认静夜熄灭，点击点亮)
 * 中间：黄昏暖光斜照时，由粒子扩散到汇聚浮现的拟物信封，点击拆阅一言来信
 * 右侧：纯橡胶拟物长椅 (被左侧暖黄光照耀)
 */
export const DuskParkScene: React.FC = () => {
  // 正常这个区域是黑的/熄灭的，默认 false
  const [isLampOn, setIsLampOn] = useState(false);
  const [isLampPressed, setIsLampPressed] = useState(false);
  const [isBenchPressed, setIsBenchPressed] = useState(false);
  const [isEnvelopePressed, setIsEnvelopePressed] = useState(false);

  // 一言信笺状态
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [currentHitokoto, setCurrentHitokoto] = useState<HitokotoData | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const cachedHitokotoRef = useRef<HitokotoData | null>(null);

  // 从一言 API 随机获取（涵盖文学名句、古典诗词、哲学思考、影视台词、动画语录）
  const fetchOneHitokoto = async (): Promise<HitokotoData> => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://v1.hitokoto.cn/?c=d&c=i&c=k&c=h&c=a', {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error('Hitokoto API returned error');
      const data = await res.json();
      return {
        hitokoto: data.hitokoto,
        from: data.from || '黄昏晚灯',
        from_who: data.from_who || null,
        type: data.type || 'd',
      };
    } catch {
      // 容灾兜底：从对应 5 种分类精品语料中随机抽取
      const randomIdx = Math.floor(Math.random() * FALLBACK_HITOKOTO_LIST.length);
      return FALLBACK_HITOKOTO_LIST[randomIdx];
    }
  };

  // 点亮路灯时预加载一言，熄灭时收起
  const toggleLamp = () => {
    setIsLampOn((prev) => {
      const next = !prev;
      if (next) {
        // 预加载一条一言
        fetchOneHitokoto().then((data) => {
          cachedHitokotoRef.current = data;
        });
      } else {
        setIsLetterOpen(false);
      }
      return next;
    });
  };

  // 拆阅信封 / 切换下一句一言
  const handleOpenOrRefreshLetter = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEnvelopePressed(true);
    setTimeout(() => setIsEnvelopePressed(false), 200);

    // 如果未打开，则打开；如果已打开，则刷新换下一句
    if (!isLetterOpen) {
      if (cachedHitokotoRef.current) {
        setCurrentHitokoto(cachedHitokotoRef.current);
        cachedHitokotoRef.current = null;
        setIsLetterOpen(true);
        // 悄悄预拉取下一条
        fetchOneHitokoto().then((nextData) => {
          cachedHitokotoRef.current = nextData;
        });
      } else {
        setIsLoadingQuote(true);
        setIsLetterOpen(true);
        const data = await fetchOneHitokoto();
        setCurrentHitokoto(data);
        setIsLoadingQuote(false);
      }
    } else {
      // 已打开信笺，点击信封或信纸换下一句
      setIsLoadingQuote(true);
      if (cachedHitokotoRef.current) {
        setCurrentHitokoto(cachedHitokotoRef.current);
        cachedHitokotoRef.current = null;
        setIsLoadingQuote(false);
        fetchOneHitokoto().then((nextData) => {
          cachedHitokotoRef.current = nextData;
        });
      } else {
        const data = await fetchOneHitokoto();
        setCurrentHitokoto(data);
        setIsLoadingQuote(false);
      }
    }
  };

  // 18颗不同轨迹的向心汇聚粒子参数配置
  const particles = [
    { angle: 0, dist: 38, delay: 0.05, size: 3.5 },
    { angle: 25, dist: 48, delay: 0.12, size: 4 },
    { angle: 45, dist: 35, delay: 0.02, size: 3 },
    { angle: 70, dist: 52, delay: 0.18, size: 4.5 },
    { angle: 95, dist: 40, delay: 0.08, size: 3.2 },
    { angle: 120, dist: 46, delay: 0.15, size: 3.8 },
    { angle: 145, dist: 36, delay: 0.04, size: 3 },
    { angle: 170, dist: 50, delay: 0.22, size: 4.2 },
    { angle: 195, dist: 42, delay: 0.1, size: 3.6 },
    { angle: 220, dist: 47, delay: 0.16, size: 4 },
    { angle: 245, dist: 34, delay: 0.03, size: 2.8 },
    { angle: 270, dist: 53, delay: 0.2, size: 4.5 },
    { angle: 295, dist: 39, delay: 0.07, size: 3.4 },
    { angle: 320, dist: 45, delay: 0.14, size: 3.8 },
    { angle: 340, dist: 42, delay: 0.09, size: 3 },
    { angle: 60, dist: 30, delay: 0.25, size: 2.5 },
    { angle: 180, dist: 28, delay: 0.28, size: 3 },
    { angle: 300, dist: 32, delay: 0.24, size: 2.7 },
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '136px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '6px 8px 12px 6px',
        boxSizing: 'border-box',
        overflow: 'visible',
        userSelect: 'none',
      }}
    >
      {/* ================= 核心光效层：黄昏晚灯斜照长椅 ================= */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: '18px',
          right: '4px',
          bottom: '4px',
          pointerEvents: 'none',
          opacity: isLampOn ? 1 : 0,
          transition: 'opacity 0.55s cubic-bezier(0.2, 0.8, 0.3, 1)',
          zIndex: 1,
        }}
      >
        {/* 灯头自身径向发散的柔金暖晕 */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: '8px',
            width: '110px',
            height: '90px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 45% 40%, rgba(254, 240, 138, 0.92) 0%, rgba(251, 191, 36, 0.45) 40%, rgba(245, 158, 11, 0.15) 65%, transparent 80%)',
            filter: 'blur(8px)',
            animation: isLampOn ? 'lampBreathe 4s infinite ease-in-out' : 'none',
          }}
        />

        {/* 倾泻照向右侧长椅的斜向扇形柔光斑 */}
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '30px',
            width: '260px',
            height: '110px',
            background:
              'radial-gradient(ellipse 190px 85px at 15% 25%, rgba(254, 243, 199, 0.58) 0%, rgba(251, 191, 36, 0.3) 45%, rgba(245, 158, 11, 0.08) 75%, transparent 95%)',
            filter: 'blur(10px)',
            transform: 'rotate(-3deg)',
            transformOrigin: 'top left',
          }}
        />

        {/* 长椅脚下地面的漫反射温暖晚光 */}
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '16px',
            width: '150px',
            height: '24px',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.32) 0%, rgba(245, 158, 11, 0.1) 60%, transparent 80%)',
            filter: 'blur(6px)',
          }}
        />
      </div>

      {/* ================= 左侧：纯橡胶拟物路灯 (更往左贴近边缘) ================= */}
      <div
        onClick={toggleLamp}
        onPointerDown={() => setIsLampPressed(true)}
        onPointerUp={() => setIsLampPressed(false)}
        onPointerLeave={() => setIsLampPressed(false)}
        title={isLampOn ? '点击熄灭晚灯' : '点击点亮黄昏路灯'}
        style={{
          position: 'relative',
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          cursor: 'pointer',
          marginLeft: '2px',
          transform: isLampPressed ? 'scale(0.96) translateY(2px)' : 'scale(1)',
          transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: isLampPressed
            ? 'drop-shadow(-1px -1px 2px rgba(255, 255, 255, 0.8)) drop-shadow(2px 2px 4px rgba(160, 175, 195, 0.5))'
            : isLampOn
            ? 'drop-shadow(-3px -3px 6px rgba(254, 240, 138, 0.6)) drop-shadow(4px 4px 8px rgba(155, 172, 195, 0.6))'
            : 'drop-shadow(-3px -3px 6px rgba(255, 255, 255, 0.95)) drop-shadow(4px 4px 8px rgba(155, 172, 195, 0.6))',
        }}
      >
        <svg
          width="66"
          height="122"
          viewBox="0 0 66 122"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="duskLampRubberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F4F8FC" />
              <stop offset="45%" stopColor="var(--nm-bg, #E9EEF5)" />
              <stop offset="100%" stopColor="#DFE5EF" />
            </linearGradient>

            <radialGradient id="lampWarmCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#FEF08A" />
              <stop offset="75%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
          </defs>

          {/* 1. 顶端圆球冠 */}
          <circle
            cx="33"
            cy="9"
            r="3.5"
            fill="url(#duskLampRubberGrad)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.7"
          />

          {/* 2. 尖顶小伞盖 */}
          <path
            d="M29 12 L37 12 L42 20 L24 20 Z"
            fill="url(#duskLampRubberGrad)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.6"
            strokeLinejoin="round"
          />

          {/* 3. 灯顶古典宽檐 */}
          <path
            d="M16 20 Q33 16 50 20 L54 24 Q33 21 12 24 Z"
            fill="url(#duskLampRubberGrad)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.75"
          />

          {/* 4. 灯罩主体：亮灯时透出黄昏微光，熄灭时与底板同色内凹 */}
          <path
            d="M17 24 L49 24 L44 52 L22 52 Z"
            fill={isLampOn ? 'rgba(254, 240, 138, 0.45)' : 'rgba(203, 213, 225, 0.35)'}
            stroke={isLampOn ? 'rgba(245, 158, 11, 0.6)' : 'var(--nm-bg, #E9EEF5)'}
            strokeWidth="1.4"
            style={{ transition: 'all 0.4s ease' }}
          />

          {/* 内部灯芯 */}
          <circle
            cx="33"
            cy="36"
            r={isLampOn ? 7.5 : 6}
            fill={isLampOn ? 'url(#lampWarmCoreGrad)' : 'url(#duskLampRubberGrad)'}
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeOpacity="0.9"
            style={{
              transition: 'all 0.35s ease',
              filter: isLampOn ? 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))' : 'none',
            }}
          />

          {/* 灯罩支撑肋条 */}
          <line
            x1="33"
            y1="24"
            x2="33"
            y2="52"
            stroke={isLampOn ? '#FDE68A' : '#FFFFFF'}
            strokeWidth="1.4"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />
          <line
            x1="25"
            y1="24"
            x2="27"
            y2="52"
            stroke={isLampOn ? '#FDE68A' : '#FFFFFF'}
            strokeWidth="1.1"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
          <line
            x1="41"
            y1="24"
            x2="39"
            y2="52"
            stroke={isLampOn ? '#FDE68A' : '#B8C5D6'}
            strokeWidth="1.1"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />

          {/* 5. 底座托盘 */}
          <path
            d="M20 52 L46 52 L42 58 L24 58 Z"
            fill="url(#duskLampRubberGrad)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.7"
          />

          {/* 6. 双侧优雅古典回卷灯臂 */}
          <path
            d="M24 56 Q12 60 15 68 Q20 72 27 64"
            fill="none"
            stroke="url(#duskLampRubberGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M42 56 Q54 60 51 68 Q46 72 39 64"
            fill="none"
            stroke="url(#duskLampRubberGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* 7. 主灯柱 */}
          <rect
            x="30.5"
            y="58"
            width="5"
            height="46"
            rx="2.5"
            fill="url(#duskLampRubberGrad)"
            stroke="#FFFFFF"
            strokeWidth="0.7"
            strokeOpacity="0.6"
          />

          {/* 柱身环箍 */}
          <rect
            x="28.5"
            y="75"
            width="9"
            height="3"
            rx="1.5"
            fill="url(#duskLampRubberGrad)"
            stroke="#FFFFFF"
            strokeWidth="0.6"
            strokeOpacity="0.7"
          />

          {/* 8. 阶梯底座 */}
          <path
            d="M27 104 L39 104 L43 111 L23 111 Z"
            fill="url(#duskLampRubberGrad)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.7"
          />
          <rect
            x="17"
            y="111"
            width="32"
            height="4.5"
            rx="2"
            fill="url(#duskLampRubberGrad)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.7"
          />

          {/* 底部橡胶微压凹槽 */}
          <ellipse
            cx="33"
            cy="116"
            rx="20"
            ry="2.5"
            fill={isLampOn ? 'rgba(251, 191, 36, 0.25)' : '#CBD5E1'}
            opacity="0.5"
          />
        </svg>
      </div>

      {/* ================= 中间：由粒子扩散汇聚浮现的拟物信封 ================= */}
      {isLampOn && (
        <div
          key="dusk-envelope-cluster"
          style={{
            position: 'absolute',
            left: 'calc(50% - 25px)',
            bottom: '38px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50px',
            height: '40px',
          }}
        >
          {/* 粒子扩散到向心汇聚层 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            {particles.map((p, idx) => {
              const rad = (p.angle * Math.PI) / 180;
              const x = Math.cos(rad) * p.dist;
              const y = Math.sin(rad) * p.dist;

              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle, #FFFFFF 20%, #FDE047 60%, rgba(245, 158, 11, 0.8) 100%)',
                    boxShadow: '0 0 6px rgba(251, 191, 36, 0.9)',
                    animation: `particleDisperseAndConverge 1.1s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
                    animationDelay: `${p.delay}s`,
                    // 将关键帧变量通过 style 传递
                    ['--target-x' as string]: `${x}px`,
                    ['--target-y' as string]: `${y}px`,
                  }}
                />
              );
            })}
          </div>

          {/* ================= 纯粹虚浮在空中的一言灵动诗语 (无任何卡片包裹) ================= */}
          {isLetterOpen && (
            <div
              onClick={handleOpenOrRefreshLetter}
              title="轻触换一句一言"
              style={{
                position: 'absolute',
                bottom: '46px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '260px',
                zIndex: 35,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: '0 4px',
                boxSizing: 'border-box',
                cursor: 'pointer',
                animation: 'etherealFloat 4s ease-in-out infinite, etherealFadeIn 0.4s ease-out',
                userSelect: 'none',
              }}
            >
              {isLoadingQuote ? (
                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#B45309',
                    fontWeight: 600,
                    letterSpacing: '0.4px',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.9), 0 0 8px rgba(251, 191, 36, 0.5)',
                    animation: 'lampBreathe 1.2s infinite ease-in-out',
                  }}
                >
                  微风拂暮色，灵感浮现中...
                </div>
              ) : (
                <>
                  {/* 一言正文：空灵虚浮 */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      lineHeight: '1.7',
                      color: '#1E293B',
                      fontWeight: 600,
                      letterSpacing: '0.3px',
                      textShadow:
                        '0 1px 2px rgba(255, 255, 255, 0.95), 0 0 12px rgba(254, 240, 138, 0.45)',
                    }}
                  >
                    “{currentHitokoto?.hitokoto || '微风拂晚霞，愿你卸下一身疲惫。'}”
                  </p>

                  {/* 出处来源：轻盈雅致 */}
                  {currentHitokoto && (
                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '10px',
                        color: '#64748B',
                        fontWeight: 500,
                        letterSpacing: '0.2px',
                        textShadow: '0 1px 2px rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      —— {currentHitokoto.from_who ? `${currentHitokoto.from_who} ` : ''}
                      {currentHitokoto.from ? `《${currentHitokoto.from}》` : ''}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 纯橡胶质感凹凸信封本体 (与路灯、长椅风格 100% 同色) */}
          <div
            onClick={handleOpenOrRefreshLetter}
            title={isLetterOpen ? '点击信封换下一句一言' : '拆阅一言黄昏来信'}
            style={{
              position: 'relative',
              cursor: 'pointer',
              transform: isEnvelopePressed
                ? 'scale(0.92)'
                : 'scale(1)',
              animation: 'envelopeMaterialize 1.2s cubic-bezier(0.2, 0.9, 0.3, 1) forwards, envelopeFloat 3.2s ease-in-out infinite 1.2s',
              transition: 'transform 0.15s ease',
              filter:
                'drop-shadow(-2px -2px 4px rgba(254, 240, 138, 0.75)) drop-shadow(3px 5px 8px rgba(155, 172, 195, 0.6))',
            }}
          >
            <svg
              width="44"
              height="30"
              viewBox="0 0 44 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="envelopeRubberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="35%" stopColor="#F5F2DF" />
                  <stop offset="70%" stopColor="var(--nm-bg, #E9EEF5)" />
                  <stop offset="100%" stopColor="#DFE5EF" />
                </linearGradient>
              </defs>

              {/* 信封底矩形 (同色橡胶微弧倒角) */}
              <rect
                x="2"
                y="2"
                width="40"
                height="26"
                rx="4"
                fill="url(#envelopeRubberGrad)"
                stroke="#FFFFFF"
                strokeWidth="0.9"
                strokeOpacity="0.85"
              />

              {/* 信封下三角折痕压凹线 */}
              <path
                d="M3 26 L19 14 M41 26 L25 14"
                stroke="#B8C5D6"
                strokeWidth="0.85"
                strokeOpacity="0.65"
                strokeLinecap="round"
              />
              <path
                d="M3 26.5 L19 14.5 M41 26.5 L25 14.5"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeOpacity="0.8"
                strokeLinecap="round"
              />

              {/* 上折封盖 (三角翻折凸起) */}
              <path
                d="M2.5 3 L22 17.5 L41.5 3"
                fill="none"
                stroke="url(#envelopeRubberGrad)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M2 2 L22 17 L42 2 Z"
                fill="url(#envelopeRubberGrad)"
                opacity="0.88"
              />
              <path
                d="M2 2 L22 17 L42 2"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.9"
                strokeOpacity="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 3 L22 18 L42 3"
                fill="none"
                stroke="#B8C5D6"
                strokeWidth="0.85"
                strokeOpacity="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 封盖中央：圆形封漆/内凹软胶徽章 */}
              <circle
                cx="22"
                cy="17"
                r="3.5"
                fill="url(#envelopeRubberGrad)"
                stroke="#FEF08A"
                strokeWidth="0.8"
                strokeOpacity="0.9"
                filter="drop-shadow(0 1px 2px rgba(245, 158, 11, 0.4))"
              />
              <circle cx="22" cy="17" r="1.5" fill="#F59E0B" opacity="0.85" />
            </svg>
          </div>
        </div>
      )}

      {/* ================= 右侧：纯橡胶拟物长椅 (承接黄昏晚灯照耀) ================= */}
      <div
        onPointerDown={() => setIsBenchPressed(true)}
        onPointerUp={() => setIsBenchPressed(false)}
        onPointerLeave={() => setIsBenchPressed(false)}
        title="拟物长椅"
        style={{
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          cursor: 'pointer',
          marginRight: '6px',
          transform: isBenchPressed ? 'scale(0.96) translateY(2px)' : 'scale(1)',
          transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease',
          // 亮灯时长椅迎光面泛起温暖的黄昏金边反光
          filter: isBenchPressed
            ? 'drop-shadow(-1px -1px 2px rgba(255, 255, 255, 0.8)) drop-shadow(2px 2px 4px rgba(160, 175, 195, 0.5))'
            : isLampOn
            ? 'drop-shadow(-3px -3px 6px rgba(254, 243, 199, 0.85)) drop-shadow(4px 4px 8px rgba(155, 172, 195, 0.55))'
            : 'drop-shadow(-3px -3px 6px rgba(255, 255, 255, 0.95)) drop-shadow(4px 4px 8px rgba(155, 172, 195, 0.6))',
        }}
      >
        <svg
          width="118"
          height="86"
          viewBox="0 0 118 86"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="duskBenchRubberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isLampOn ? '#FFFBEB' : '#F4F8FC'} />
              <stop offset="45%" stopColor={isLampOn ? '#F1EEDB' : 'var(--nm-bg, #E9EEF5)'} />
              <stop offset="100%" stopColor="#DFE5EF" />
            </linearGradient>
          </defs>

          {/* 地面软阴影 */}
          <ellipse
            cx="59"
            cy="81"
            rx="46"
            ry="3.5"
            fill={isLampOn ? 'rgba(217, 119, 6, 0.18)' : '#CBD5E1'}
            opacity={isLampOn ? 0.6 : 0.4}
          />

          {/* 后椅腿与靠背支架 */}
          <path
            d="M20 17 Q15 37 21 55 L25 79 L20 79"
            fill="none"
            stroke="url(#duskBenchRubberGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M19 17 Q14 37 20 55 L24 79"
            fill="none"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="1"
            strokeOpacity={isLampOn ? 0.8 : 0.65}
            strokeLinecap="round"
          />

          <path
            d="M98 17 Q93 37 99 55 L103 79 L98 79"
            fill="none"
            stroke="url(#duskBenchRubberGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M97 17 Q92 37 98 55 L102 79"
            fill="none"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="1"
            strokeOpacity={isLampOn ? 0.7 : 0.65}
            strokeLinecap="round"
          />

          {/* 中间加强铁梁 */}
          <path
            d="M59 21 Q57 38 60 55 L61 78"
            fill="none"
            stroke="url(#duskBenchRubberGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* 前椅腿 */}
          <path d="M26 56 L24 79" stroke="url(#duskBenchRubberGrad)" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M25.5 56 L23.5 79"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />

          <path d="M96 56 L94 79" stroke="url(#duskBenchRubberGrad)" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M95.5 56 L93.5 79"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />

          {/* 靠背三根凸起木板条 */}
          {/* 板条 1 (顶) */}
          <rect
            x="14"
            y="19"
            width="90"
            height="6.5"
            rx="3"
            fill="url(#duskBenchRubberGrad)"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeOpacity={isLampOn ? 0.9 : 0.8}
          />
          <line x1="16" y1="26" x2="102" y2="26" stroke="#B8C5D6" strokeWidth="0.8" strokeOpacity="0.5" />

          {/* 板条 2 (中) */}
          <rect
            x="15"
            y="29"
            width="88"
            height="6.5"
            rx="3"
            fill="url(#duskBenchRubberGrad)"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeOpacity={isLampOn ? 0.9 : 0.8}
          />
          <line x1="17" y1="36" x2="101" y2="36" stroke="#B8C5D6" strokeWidth="0.8" strokeOpacity="0.5" />

          {/* 板条 3 (底) */}
          <rect
            x="16"
            y="39"
            width="86"
            height="6.5"
            rx="3"
            fill="url(#duskBenchRubberGrad)"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeOpacity={isLampOn ? 0.9 : 0.8}
          />
          <line x1="18" y1="46" x2="100" y2="46" stroke="#B8C5D6" strokeWidth="0.8" strokeOpacity="0.5" />

          {/* 坐垫三根前伸透视板条 */}
          {/* 坐板条 1 (后) */}
          <rect
            x="16"
            y="49"
            width="86"
            height="6"
            rx="2.5"
            fill="url(#duskBenchRubberGrad)"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeOpacity={isLampOn ? 0.9 : 0.8}
          />
          {/* 坐板条 2 (中) */}
          <rect
            x="14.5"
            y="56"
            width="89"
            height="6"
            rx="2.5"
            fill="url(#duskBenchRubberGrad)"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeOpacity={isLampOn ? 0.9 : 0.8}
          />
          {/* 坐板条 3 (前边缘) */}
          <rect
            x="13"
            y="63"
            width="92"
            height="6"
            rx="2.5"
            fill="url(#duskBenchRubberGrad)"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeOpacity={isLampOn ? 0.9 : 0.8}
          />

          {/* 左右古典涡卷扶手 */}
          <path
            d="M17 61 Q10 49 18 42 Q24 40 27 49 L25 61"
            fill="none"
            stroke="url(#duskBenchRubberGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M16 60 Q9 48 17 41 Q23 39 26 48"
            fill="none"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.9"
            strokeOpacity={isLampOn ? 0.9 : 0.75}
            strokeLinecap="round"
          />

          <path
            d="M101 61 Q94 49 102 42 Q108 40 111 49 L109 61"
            fill="none"
            stroke="url(#duskBenchRubberGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M100 60 Q93 48 101 41 Q107 39 110 48"
            fill="none"
            stroke={isLampOn ? '#FEF08A' : '#FFFFFF'}
            strokeWidth="0.9"
            strokeOpacity={isLampOn ? 0.8 : 0.75}
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 动画关键帧 */}
      <style>{`
        /* 粒子扩散到向心凝聚动画 */
        @keyframes particleDisperseAndConverge {
          0% {
            transform: translate(0, 0) scale(0.2);
            opacity: 0;
          }
          30% {
            transform: translate(var(--target-x), var(--target-y)) scale(1.2);
            opacity: 1;
          }
          75% {
            transform: translate(calc(var(--target-x) * 0.15), calc(var(--target-y) * 0.15)) scale(0.5);
            opacity: 0.9;
          }
          100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
        }

        /* 信封实体凝聚成型动画 */
        @keyframes envelopeMaterialize {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(-8deg) translateY(6px);
            filter: blur(8px) brightness(1.8);
          }
          45% {
            opacity: 0.5;
            transform: scale(0.85) rotate(-3deg) translateY(3px);
            filter: blur(3px) brightness(1.4);
          }
          85% {
            opacity: 1;
            transform: scale(1.06) rotate(1deg) translateY(-2px);
            filter: blur(0px) brightness(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg) translateY(0);
            filter: blur(0px) brightness(1);
          }
        }

        /* 凝聚后的静谧微浮动 */
        @keyframes envelopeFloat {
          0%, 100% {
            transform: translateY(0px) rotate(-1deg);
          }
          50% {
            transform: translateY(-4px) rotate(1.2deg);
          }
        }

        /* 空灵虚浮呼吸轻浮动动画 */
        @keyframes etherealFloat {
          0%, 100% {
            transform: translateX(-50%) translateY(0px);
            opacity: 0.95;
          }
          50% {
            transform: translateX(-50%) translateY(-5px);
            opacity: 1;
          }
        }

        /* 虚浮诗语优雅淡入 */
        @keyframes etherealFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(8px) scale(0.96);
            filter: blur(4px);
          }
          100% {
            opacity: 0.95;
            transform: translateX(-50%) translateY(0px) scale(1);
            filter: blur(0px);
          }
        }

        /* 路灯呼吸暖光 */
        @keyframes lampBreathe {
          0%, 100% {
            opacity: 0.9;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};
