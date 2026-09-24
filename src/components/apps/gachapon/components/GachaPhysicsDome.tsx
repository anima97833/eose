import React, { useRef, useEffect, useCallback } from 'react';
import { WishItem, GachaPalette, CAPSULE_COLORS, CapsuleColorKey } from '../core/gachaTypes';
import { gachaAudio } from '../core/gachaAudio';

interface PhysicsBall {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  angularVelocity: number;
  colorKey: CapsuleColorKey;
  icon: string;
}

interface GachaPhysicsDomeProps {
  palette: GachaPalette;
  wishes: WishItem[];
  isCranking: boolean;
}

const DOME_SIZE = 184; // 玻璃圆球内部物理舞台直径 (px)
const DOME_CENTER_X = DOME_SIZE / 2;
const DOME_CENTER_Y = DOME_SIZE / 2;
const DOME_RADIUS = 86; // 玻璃罩内部碰撞半径

// 预先经物理松弛迭代计算的“静止金字塔”堆叠自然落点（零穿模、完全受力平衡）
const RESTING_POSITIONS = [
  { x: 84.0, y: 156.7, rot: 5 },
  { x: 51.6, y: 144.9, rot: -25 },
  { x: 118.2, y: 150.8, rot: 20 },
  { x: 77.6, y: 122.6, rot: 15 },
  { x: 112.6, y: 116.6, rot: -30 },
  { x: 29.0, y: 117.7, rot: -45 },
  { x: 145.2, y: 128.0, rot: 35 },
  { x: 90.4, y: 88.4, rot: -10 },
  { x: 54.9, y: 94.4, rot: 40 },
  { x: 140.3, y: 93.2, rot: -15 },
];

export const GachaPhysicsDome: React.FC<GachaPhysicsDomeProps> = ({
  palette,
  wishes,
  isCranking,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<PhysicsBall[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastSoundTimeRef = useRef<number>(0);

  // 核心状态：没有按 TAP 键时，小球处于 100% 静止休眠状态 (isPhysicsActive = false)
  const isPhysicsActiveRef = useRef<boolean>(false);
  const sleepFramesRef = useRef<number>(0);

  // 初始化 / 同步扭蛋球列表
  useEffect(() => {
    const activeWishes = wishes.filter((w) => w.status === 'in_machine');

    const presetCapsules = [
      { colorKey: 'blue' as CapsuleColorKey, icon: '📖' },
      { colorKey: 'yellow' as CapsuleColorKey, icon: '🍵' },
      { colorKey: 'green' as CapsuleColorKey, icon: '🌲' },
      { colorKey: 'pink' as CapsuleColorKey, icon: '🎬' },
      { colorKey: 'purple' as CapsuleColorKey, icon: '🌸' },
      { colorKey: 'orange' as CapsuleColorKey, icon: '🍰' },
      { colorKey: 'blue' as CapsuleColorKey, icon: '💌' },
      { colorKey: 'yellow' as CapsuleColorKey, icon: '☕' },
      { colorKey: 'green' as CapsuleColorKey, icon: '📷' },
      { colorKey: 'pink' as CapsuleColorKey, icon: '🧸' },
    ];

    const targetList: { id: string; colorKey: CapsuleColorKey; icon: string }[] = [];

    // 先填充用户真实添加的心愿
    activeWishes.forEach((w) => {
      targetList.push({
        id: w.id,
        colorKey: w.colorKey,
        icon: w.icon || '✨',
      });
    });

    // 若不足 8 个，补充预设球
    let padIdx = 0;
    while (targetList.length < 8) {
      const p = presetCapsules[padIdx % presetCapsules.length];
      targetList.push({
        id: 'preset_' + padIdx,
        colorKey: p.colorKey,
        icon: p.icon,
      });
      padIdx++;
    }

    const finalItems = targetList.slice(0, RESTING_POSITIONS.length);

    // 如果物理引擎处于静止休眠，直接精准对齐到预设稳定落点，小球完全不动
    const existingMap = new Map<string, PhysicsBall>();
    ballsRef.current.forEach((b) => existingMap.set(b.id, b));

    const updatedBalls: PhysicsBall[] = [];
    finalItems.forEach((item, idx) => {
      const rest = RESTING_POSITIONS[idx % RESTING_POSITIONS.length];
      const existing = existingMap.get(item.id);
      if (existing) {
        existing.colorKey = item.colorKey;
        existing.icon = item.icon;
        // 如果未处于激发状态，强制校准到静止位置
        if (!isPhysicsActiveRef.current) {
          existing.x = rest.x;
          existing.y = rest.y;
          existing.vx = 0;
          existing.vy = 0;
          existing.angle = (rest.rot * Math.PI) / 180;
          existing.angularVelocity = 0;
        }
        updatedBalls.push(existing);
      } else {
        updatedBalls.push({
          id: item.id,
          x: rest.x,
          y: rest.y,
          vx: 0,
          vy: 0,
          radius: 18,
          angle: (rest.rot * Math.PI) / 180,
          angularVelocity: 0,
          colorKey: item.colorKey,
          icon: item.icon,
        });
      }
    });

    ballsRef.current = updatedBalls;
  }, [wishes]);

  // 物理碰撞音效触发
  const playCollisionSound = useCallback((speed: number) => {
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 70 && speed > 3.5) {
      lastSoundTimeRef.current = now;
      gachaAudio.playRattle();
    }
  }, []);

  // 触发激烈搅拌物理脉冲 (TAP! 旋钮转动)
  const applyAgitationImpulse = useCallback(() => {
    isPhysicsActiveRef.current = true;
    sleepFramesRef.current = 0;

    ballsRef.current.forEach((ball, idx) => {
      const swirlDir = idx % 2 === 0 ? 1 : -1;
      const angle = (idx / ballsRef.current.length) * Math.PI * 2;
      ball.vx = Math.cos(angle) * (7 + Math.random() * 9) + swirlDir * 4;
      ball.vy = -13 - Math.random() * 10; // 强劲向上扬起
      ball.angularVelocity = (Math.random() - 0.5) * 0.7;
    });
  }, []);

  // 监听 isCranking：只有在按下 TAP 旋转按钮时，才激活物理运动！
  useEffect(() => {
    if (isCranking) {
      applyAgitationImpulse();
      const timer = setTimeout(() => {
        applyAgitationImpulse();
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [isCranking, applyAgitationImpulse]);

  // 主物理与渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = DOME_SIZE * dpr;
    canvas.height = DOME_SIZE * dpr;
    ctx.scale(dpr, dpr);

    const gravity = 0.38;
    const airFriction = 0.988;
    const restitution = 0.58;
    const wallRestitution = 0.52;

    const stepPhysics = () => {
      // 核心控制：当小球处于静止休眠，且未在按 TAP 时，完全不计算位移，小球绝对不动！
      if (!isPhysicsActiveRef.current) {
        return;
      }

      const balls = ballsRef.current;
      const n = balls.length;
      let totalKineticEnergy = 0;

      // 1. 重力与阻力
      for (let i = 0; i < n; i++) {
        const b = balls[i];
        b.vy += gravity;
        b.vx *= airFriction;
        b.vy *= airFriction;
        b.angle += b.angularVelocity;
        b.angularVelocity *= 0.96;

        b.x += b.vx;
        b.y += b.vy;

        totalKineticEnergy += Math.hypot(b.vx, b.vy);
      }

      // 2. 双球刚体弹性碰撞
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const b1 = balls[i];
          const b2 = balls[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            b1.x -= nx * overlap * 0.5;
            b1.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;

            const rvx = b2.vx - b1.vx;
            const rvy = b2.vy - b1.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal < 0) {
              const impulse = -(1 + restitution) * velAlongNormal * 0.5;
              b1.vx -= nx * impulse;
              b1.vy -= ny * impulse;
              b2.vx += nx * impulse;
              b2.vy += ny * impulse;

              const tangentX = -ny;
              const tangentY = nx;
              const velTangent = rvx * tangentX + rvy * tangentY;
              b1.angularVelocity += velTangent * 0.015;
              b2.angularVelocity -= velTangent * 0.015;

              if (Math.abs(velAlongNormal) > 3.8) {
                playCollisionSound(Math.abs(velAlongNormal));
              }
            }
          }
        }
      }

      // 3. 玻璃罩圆周边界约束
      for (let i = 0; i < n; i++) {
        const b = balls[i];
        const dx = b.x - DOME_CENTER_X;
        const dy = b.y - DOME_CENTER_Y;
        const dist = Math.hypot(dx, dy);
        const maxDist = DOME_RADIUS - b.radius;

        if (dist > maxDist) {
          const nx = dx / dist;
          const ny = dy / dist;

          b.x = DOME_CENTER_X + nx * maxDist;
          b.y = DOME_CENTER_Y + ny * maxDist;

          const dot = b.vx * nx + b.vy * ny;
          if (dot > 0) {
            b.vx -= (1 + wallRestitution) * dot * nx;
            b.vy -= (1 + wallRestitution) * dot * ny;

            const tx = -ny;
            const ty = nx;
            const tangDot = b.vx * tx + b.vy * ty;
            b.vx -= tangDot * 0.08 * tx;
            b.vy -= tangDot * 0.08 * ty;
            b.angularVelocity += tangDot * 0.03;

            if (dot > 4.2) {
              playCollisionSound(dot);
            }
          }
        }
      }

      // 4. 自然静止检测：当动能消散到极低且未在转动时，自动停止物理模拟
      // 4. 自然静止检测：当动能消散到极低且未在转动时，自动停止物理模拟
      if (!isCranking) {
        if (totalKineticEnergy < 0.28) {
          sleepFramesRef.current++;
          if (sleepFramesRef.current > 20) {
            // 所有小球归零速度，进入彻底静止状态
            for (let i = 0; i < n; i++) {
              balls[i].vx = 0;
              balls[i].vy = 0;
              balls[i].angularVelocity = 0;
            }
            isPhysicsActiveRef.current = false;
          }
        } else {
          sleepFramesRef.current = 0;
        }
      }
    };

    const render = () => {
      if (isPhysicsActiveRef.current) {
        stepPhysics();
        stepPhysics();
      }

      ctx.clearRect(0, 0, DOME_SIZE, DOME_SIZE);

      const balls = ballsRef.current;
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        const cCol = CAPSULE_COLORS[b.colorKey] || CAPSULE_COLORS.pink;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);

        // 1. 胶囊自身底部阴影
        ctx.beginPath();
        ctx.ellipse(1, 3, b.radius * 0.85, b.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fill();

        // 2. 下半球（白色）
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = cCol.bottom;
        ctx.fill();
        ctx.lineWidth = 2.8;
        ctx.strokeStyle = palette.secondary;
        ctx.stroke();

        // 3. 上半球（彩色）
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, Math.PI, 0, false);
        ctx.closePath();
        ctx.fillStyle = cCol.top;
        ctx.fill();
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = palette.secondary;
        ctx.stroke();

        // 4. 中间咬合缝隙线
        ctx.beginPath();
        ctx.moveTo(-b.radius, 0);
        ctx.lineTo(b.radius, 0);
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = palette.secondary;
        ctx.stroke();

        // 5. 内部折叠小纸条与微图标
        ctx.save();
        ctx.translate(0, 3);
        ctx.rotate(0.08);

        ctx.fillStyle = '#FFFDF5';
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-9, -6, 18, 12, 2.5);
        ctx.fill();
        ctx.stroke();

        ctx.font = '10px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.icon, 0, 1);
        ctx.restore();

        // 6. 顶面高光
        ctx.beginPath();
        ctx.arc(0, 0, b.radius * 0.7, Math.PI * 1.15, Math.PI * 1.45, false);
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.stroke();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [palette, isCranking, playCollisionSound]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
        pointerEvents: 'none', // 玻璃罩完全密闭，杜绝误触位移，小球仅在按下 TAP 键旋转时才受力运动
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};
