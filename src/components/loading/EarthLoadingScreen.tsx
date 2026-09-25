import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DogCharacter,
  CatCharacter,
  StoneCharacter,
  ButterflyCharacter,
  WhaleCharacter,
  HumanCharacter,
} from './SpeciesSVGs';
import { Sparkles, ArrowRight } from 'lucide-react';

interface EarthLoadingScreenProps {
  onFinished: () => void;
  /** 是否强制以演示模式运行（不记录已播放标记） */
  isDemo?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

interface ClickToast {
  id: number;
  x: number;
  y: number;
  text: string;
}

// 6 大物种服配置
const SPECIES_STAGES = [
  {
    id: 'dog',
    name: '狗狗服',
    title: '狗狗服加载中...',
    subText: '忠诚度 100% · 正在快乐巡逻摇尾巴',
    color: '#F9A436',
    Component: DogCharacter,
  },
  {
    id: 'cat',
    name: '猫猫服',
    title: '猫猫服加载中...',
    subText: '呼噜声协议就绪 · 垫步踩奶中',
    color: '#FACC15',
    Component: CatCharacter,
  },
  {
    id: 'stone',
    name: '无机物服',
    title: '无机物服加载中...',
    subText: '发呆协议已挂载 · 免受一切精神内耗',
    color: '#A8A29E',
    Component: StoneCharacter,
  },
  {
    id: 'butterfly',
    name: '昆虫服',
    title: '昆虫服加载中...',
    subText: '扑腾向光频段 · 采蜜微风信标连接中',
    color: '#34D399',
    Component: ButterflyCharacter,
  },
  {
    id: 'whale',
    name: '海洋服',
    title: '海洋服加载中...',
    subText: '沉入深蓝静谧 · 52赫兹声波同步完成',
    color: '#3B82F6',
    Component: WhaleCharacter,
  },
  {
    id: 'human',
    name: '人类服',
    title: '人类服加载完毕！',
    subText: '连接成功 · 欢迎登入「地球 Online」',
    color: '#F59E0B',
    Component: HumanCharacter,
  },
];

// Web Audio 合成器音效（零体积，不依赖外部 mp3 资源）
let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
  try {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx = new AudioCtor();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// 软木轻敲音效（走路/点击步态反馈）
function playStepTap(freq = 560): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.055);
  } catch {
    // ignore
  }
}

// 转生变身清脆和弦音
function playEvolveChime(stageIdx: number): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 880.0, 1046.5, 1174.66]; // C5, E5, G5, A5, C6, D6
    const baseFreq = notes[stageIdx % notes.length] || 659.25;

    [baseFreq, baseFreq * 1.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.04);
      osc.stop(ctx.currentTime + idx * 0.04 + 0.3);
    });
  } catch {
    // ignore
  }
}

export const EarthLoadingScreen: React.FC<EarthLoadingScreenProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [isMorphing, setIsMorphing] = useState<boolean>(false);
  const [isAccelerating, setIsAccelerating] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  // 粒子与点击浮动提示
  const [particles, setParticles] = useState<Particle[]>([]);
  const [clickToasts, setClickToasts] = useState<ClickToast[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const accelerateTimeoutRef = useRef<number | null>(null);

  // 根据进度动态计算当前所处阶段 (0 ~ 5)
  // 狗: 0~17%, 猫: 18~34%, 石头: 35~51%, 蝴蝶: 52~68%, 鲸鱼: 69~85%, 人类: 86~100%
  const calculateStageIndex = (prog: number) => {
    if (prog < 18) return 0;
    if (prog < 36) return 1;
    if (prog < 54) return 2;
    if (prog < 72) return 3;
    if (prog < 88) return 4;
    return 5;
  };

  // 触发转生变身粒子爆散
  const triggerMorphExplosion = useCallback((color: string) => {
    setIsMorphing(true);
    const newParticles: Particle[] = Array.from({ length: 14 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
      const speed = 3.5 + Math.random() * 4.5;
      return {
        id: Date.now() + i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? color : '#FCD34D',
        size: 5 + Math.random() * 5,
      };
    });
    setParticles(newParticles);

    // 变身结束后恢复角色正常形态
    window.setTimeout(() => {
      setIsMorphing(false);
      setParticles([]);
    }, 450);
  }, []);

  // 正常自增时钟：约 4.2 秒自动走完
  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        // 基础自增步长：人类阶段放慢一点点方便欣赏
        const increment = prev > 86 ? 0.9 : 1.25;
        const next = Math.min(100, prev + increment);

        // 检测是否跨过了形态分界线
        const prevStage = calculateStageIndex(prev);
        const nextStage = calculateStageIndex(next);
        if (nextStage !== prevStage) {
          setCurrentStageIdx(nextStage);
          triggerMorphExplosion(SPECIES_STAGES[nextStage].color);
          playEvolveChime(nextStage);
        }

        return next;
      });
    }, 50);

    return () => window.clearInterval(interval);
  }, [triggerMorphExplosion]);

  // 当进度达到 100% 时的优雅退出处理
  useEffect(() => {
    if (progress >= 100 && !isExiting) {
      const timer = window.setTimeout(() => {
        setIsExiting(true);
        window.setTimeout(() => {
          onFinished();
        }, 550);
      }, 700);
      return () => window.clearTimeout(timer);
    }
  }, [progress, isExiting, onFinished]);

  // 点击屏幕“狂点加速转生”交互
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExiting) return;

    // 播放小木块踩踏脚步音
    playStepTap(currentStageIdx * 40 + 520);

    // 加速角色 walk-cycle 动作 400ms
    setIsAccelerating(true);
    if (accelerateTimeoutRef.current) clearTimeout(accelerateTimeoutRef.current);
    accelerateTimeoutRef.current = window.setTimeout(() => {
      setIsAccelerating(false);
    }, 400);

    // 增加 12% 进度
    setProgress((prev) => {
      const next = Math.min(100, prev + 12);
      const prevStage = calculateStageIndex(prev);
      const nextStage = calculateStageIndex(next);
      if (nextStage !== prevStage) {
        setCurrentStageIdx(nextStage);
        triggerMorphExplosion(SPECIES_STAGES[nextStage].color);
        playEvolveChime(nextStage);
      }
      return next;
    });

    // 产生触点位置的卡通气泡扬尘
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const newToast: ClickToast = {
        id: Date.now() + Math.random(),
        x: clickX,
        y: clickY,
        text: '💨 转生加速 +12%',
      };
      setClickToasts((prev) => [...prev.slice(-3), newToast]);

      window.setTimeout(() => {
        setClickToasts((prev) => prev.filter((item) => item.id !== newToast.id));
      }, 600);
    }
  };

  // 点击右上角“跳过”直接进系统
  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExiting(true);
    playEvolveChime(5);
    window.setTimeout(() => {
      onFinished();
    }, 350);
  };

  const currentStage = SPECIES_STAGES[currentStageIdx];
  const CurrentCharacter = currentStage.Component;

  return (
    <div
      ref={containerRef}
      onClick={handleScreenClick}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#F5ECE1', // 与参考图完全一致的温暖奶油米色
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 20px 32px',
        userSelect: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {/* 动画关键帧 */}
      <style>{`
        @keyframes morphSquash {
          0% { transform: scale(1, 1); }
          30% { transform: scale(1.3, 0.65); }
          60% { transform: scale(0.85, 1.25); }
          85% { transform: scale(1.08, 0.95); }
          100% { transform: scale(1, 1); }
        }
        @keyframes toastFloat {
          0% { opacity: 0; transform: translateY(0) scale(0.8); }
          30% { opacity: 1; transform: translateY(-16px) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.9); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>

      {/* 顶部状态栏与跳过胶囊 */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(6px)',
            padding: '5px 12px',
            borderRadius: 20,
            boxShadow: '0 2px 8px rgba(180, 160, 140, 0.2)',
          }}
        >
          <Sparkles size={13} color="#D97706" />
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#451A03', letterSpacing: '0.5px' }}>
            地球 Online 客户端
          </span>
        </div>

        {/* 跳过按钮 */}
        <button
          type="button"
          onClick={handleSkip}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 12px',
            borderRadius: 20,
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            boxShadow: '2px 2px 6px rgba(190, 170, 150, 0.35)',
            color: '#78350F',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <span>跳过</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* 屏幕中央角色展示与变身区域 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
        }}
      >
        {/* 上方可爱文案与配色标注 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 24,
            transition: 'all 0.3s ease',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 3px 12px rgba(180, 155, 130, 0.18)',
              marginBottom: 8,
              border: `1.5px solid ${currentStage.color}`,
              transition: 'border-color 0.3s ease',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: currentStage.color,
                animation: 'pulseGlow 1.2s infinite ease-in-out',
              }}
            />
            <span
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                color: '#292524',
                letterSpacing: '0.5px',
              }}
            >
              {currentStage.title}
            </span>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: '#78716C',
              fontWeight: 500,
              letterSpacing: '0.2px',
            }}
          >
            {currentStage.subText}
          </p>
        </div>

        {/* 核心 SVG 角色容器（支持变身 Q 弹果冻与粒子爆散） */}
        <div
          style={{
            position: 'relative',
            width: 220,
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: isMorphing ? 'morphSquash 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        >
          <CurrentCharacter isAccelerating={isAccelerating} />

          {/* 转生变身星光微粒 */}
          {particles.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}`,
                transform: `translate(${p.vx * 12}px, ${p.vy * 12}px)`,
                opacity: 0,
                transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>

        {/* 6 大阶段指示微圆点 */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 20,
          }}
        >
          {SPECIES_STAGES.map((s, idx) => {
            const isActive = idx === currentStageIdx;
            const isPassed = idx < currentStageIdx;
            return (
              <div
                key={s.id}
                style={{
                  width: isActive ? 22 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isActive ? s.color : isPassed ? '#A8A29E' : '#E7E5E4',
                  boxShadow: isActive ? `0 0 8px ${s.color}` : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 底部进度条与狂点交互引导 */}
      <div
        style={{
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* 轻拟物进度条凹槽 */}
        <div
          style={{
            width: '100%',
            height: 10,
            backgroundColor: 'rgba(215, 200, 185, 0.45)',
            borderRadius: 8,
            padding: 2,
            boxShadow: 'inset 1px 1px 3px rgba(120, 100, 80, 0.25)',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 6,
              background: `linear-gradient(90deg, #F9A436 0%, ${currentStage.color} 100%)`,
              boxShadow: `0 0 10px ${currentStage.color}88`,
              transition: 'width 0.15s ease-out, background 0.3s ease',
            }}
          />
        </div>

        {/* 提示文案与百分比 */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              color: '#A8A29E',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>👆 点击屏幕加速演化</span>
            {isAccelerating && (
              <span style={{ color: '#D97706', fontWeight: 800 }}>⚡ 冲刺中!</span>
            )}
          </span>

          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#78350F',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* 屏幕狂点产生的浮动加速气泡 */}
      {clickToasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            position: 'absolute',
            left: toast.x,
            top: toast.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            fontSize: '0.76rem',
            fontWeight: 800,
            color: '#B45309',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '3px 10px',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(180, 120, 50, 0.25)',
            whiteSpace: 'nowrap',
            animation: 'toastFloat 0.6s ease-out forwards',
          }}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
};
