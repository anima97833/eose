import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Award, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { playCompletionChime, playClickSound } from '../apps/pomodoro/soundSynthesizer';

export interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  badgeTitle?: string;
  badgeEmoji?: string;
  categoryLabel?: string;
  description?: string;
  rewardText?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  decay: number;
  gravity: number;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  title = '恭喜完成第一次专注！',
  badgeTitle = '新手教程通关',
  badgeEmoji = '👑',
  categoryLabel = '固件升级',
  description = '检测到玩家主动切断多巴胺闲散流，首次脱机运转25分钟。当前精神状态已优化，主频超频运转中。',
  rewardText = '精神 +1  ·  🪙 金币 +100',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [countdown, setCountdown] = useState<number>(4);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // 烟花粒子与声效动画触发
  useEffect(() => {
    if (!isOpen) return;

    playCompletionChime();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([120, 60, 120, 60, 200]);
      } catch {
        // ignore
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      '#FFD166', '#06D6A0', '#118AB2', '#EF476F', 
      '#F78C6B', '#8338EC', '#3A86FF', '#FFFFFF'
    ];
    let particles: Particle[] = [];

    const createFirework = (centerX: number, centerY: number, count = 50) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          radius: Math.random() * 3 + 1.5,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01,
          gravity: 0.12,
        });
      }
    };

    // 初始多波段烟花
    const w = canvas.width;
    const h = canvas.height;
    createFirework(w * 0.5, h * 0.35, 60);
    setTimeout(() => createFirework(w * 0.3, h * 0.45, 45), 250);
    setTimeout(() => createFirework(w * 0.7, h * 0.4, 45), 500);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter((p) => p.alpha > 0.02);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  // 4 秒倒计时自动收拢入库
  useEffect(() => {
    if (!isOpen) return;
    setCountdown(4);
    setIsClosing(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSmoothClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleSmoothClose = () => {
    playClickSound();
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleSmoothClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(20, 35, 25, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        transition: 'opacity 0.25s ease',
        opacity: isClosing ? 0 : 1,
      }}
    >
      {/* Canvas 烟花粒子画布 */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* 核心立体轻拟物成就卡片 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '330px',
          backgroundColor: '#F3F7F4',
          borderRadius: '26px',
          padding: '24px 20px 20px',
          boxShadow:
            '0 24px 48px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2), inset 2px 2px 4px rgba(255, 255, 255, 0.9)',
          border: '2px solid rgba(255, 255, 255, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px',
          transform: isClosing ? 'scale(0.85)' : 'scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={handleSmoothClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: '#7A9684',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
          }}
        >
          <X size={18} />
        </button>

        {/* 顶部标签 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'rgba(58, 130, 89, 0.12)',
            color: '#2F614C',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 800,
            border: '1px solid rgba(58, 130, 89, 0.25)',
          }}
        >
          <Sparkles size={12} color="#3A8259" />
          <span>地球 Online · 里程碑突破</span>
        </div>

        {/* 主标题 */}
        <div
          style={{
            fontSize: '17px',
            fontWeight: 900,
            color: '#1C3A2B',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </div>

        {/* 核心立体浮现徽章神座 */}
        <div
          style={{
            margin: '8px 0',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 外环呼吸光晕 */}
          <div
            style={{
              position: 'absolute',
              width: '92px',
              height: '92px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(58, 130, 89, 0) 70%)',
              animation: 'pulse 2s infinite ease-in-out',
            }}
          />

          {/* 拟物气泡徽章本体 */}
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '24px',
              background: 'radial-gradient(circle at 35% 30%, #FFFFFF 30%, #E6F3FA 75%, #B4D7E8 100%)',
              border: '3px solid #8CBDD2',
              boxShadow:
                '0 8px 20px rgba(80, 140, 170, 0.45), inset 2px 2px 6px rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              transform: 'translateY(-2px)',
            }}
          >
            {badgeEmoji}
          </div>
        </div>

        {/* 徽章名称与分类 */}
        <div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 900,
              color: '#283618',
              letterSpacing: '0.5px',
            }}
          >
            【{badgeTitle}】
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#3A8259',
              fontWeight: 700,
              marginTop: '2px',
            }}
          >
            分类：{categoryLabel}
          </div>
        </div>

        {/* 戏谑地球Online系统日志说明 */}
        <div
          style={{
            fontSize: '11px',
            lineHeight: 1.55,
            color: '#557260',
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1px solid rgba(160, 185, 170, 0.4)',
          }}
        >
          {description}
        </div>

        {/* 奖励结算条 */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#B45309',
            backgroundColor: 'rgba(254, 243, 199, 0.85)',
            border: '1px solid #FCD34D',
            padding: '5px 14px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>🏆 奖励结算：</span>
          <span>{rewardText}</span>
        </div>

        {/* 底部收录与倒计时按钮 */}
        <button
          type="button"
          onClick={handleSmoothClose}
          style={{
            width: '100%',
            marginTop: '4px',
            padding: '10px 0',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: '#3A5A40',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(58, 90, 64, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>收入成就馆 ({countdown}s)</span>
        </button>
      </div>
    </div>
  );
};
