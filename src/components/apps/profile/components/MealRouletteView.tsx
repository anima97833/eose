import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, X, RotateCw, Sparkles, Check, Plus, Utensils } from 'lucide-react';
import { RPGMealRecord } from '../../../../core/storage/db';

interface MealRouletteViewProps {
  records: RPGMealRecord[];
  onBack: () => void;
  onSelectMealToLog: (dishName: string, mealType: RPGMealRecord['mealType']) => void;
}

// 扇区马卡龙和果子配色方案
const SLICE_COLORS = [
  '#FFE4E6', // 樱粉
  '#DCFCE7', // 薄荷青
  '#E0F2FE', // 晴空蓝
  '#FEF9C3', // 奶黄
  '#F3E8FF', // 薰衣草
  '#FFEDD5', // 杏子橙
  '#CCFBF1', // 抹茶海青
  '#FCE7F3', // 蜜桃粉
];

// 保底精选美味库（当历史记录不足时智能补全）
const FALLBACK_DISHES = [
  '热气牛肉面',
  '治愈寿喜烧',
  '鲜虾云吞面',
  '轻食能量碗',
  '日式猪排饭',
  '番茄肥牛锅',
  '慢炖土豆牛腩',
  '暖心鸡汤饭',
];

export const MealRouletteView: React.FC<MealRouletteViewProps> = ({
  records,
  onBack,
  onSelectMealToLog,
}) => {
  // 根据当前本地时间自动推荐时段
  const defaultMealType = useMemo<RPGMealRecord['mealType']>(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 17 && hour < 21) return 'dinner';
    return 'snack';
  }, []);

  const [activeTab, setActiveTab] = useState<'ALL' | RPGMealRecord['mealType']>('ALL');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [randomSeed, setRandomSeed] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTickAngleRef = useRef(0);

  // 提取去重的美食候选池
  const candidatePool = useMemo(() => {
    let pool = records;
    if (activeTab !== 'ALL') {
      pool = pool.filter((r) => r.mealType === activeTab);
    }
    // 过滤差评 (<=2星)
    pool = pool.filter((r) => (r.rating ?? 3) >= 3);

    const names = Array.from(new Set(pool.map((r) => r.dishName.trim()))).filter(Boolean);

    // 如果不足 4 个，补齐保底美食
    if (names.length < 4) {
      for (const fallback of FALLBACK_DISHES) {
        if (!names.includes(fallback)) {
          names.push(fallback);
        }
        if (names.length >= 6) break;
      }
    }
    return names;
  }, [records, activeTab]);

  // 从候选池中抽取 6~8 个扇区展示（如果多于 8 个，支持“换一批”）
  const activeSlices = useMemo(() => {
    if (candidatePool.length <= 8) return candidatePool;
    // 使用随机种子打乱抽取 8 个
    const shuffled = [...candidatePool].sort(
      (a, b) =>
        ((a.charCodeAt(0) * 17 + randomSeed) % 100) -
        ((b.charCodeAt(0) * 17 + randomSeed) % 100)
    );
    return shuffled.slice(0, 8);
  }, [candidatePool, randomSeed]);

  // 音频播放轻脆机械咔哒声
  const playTickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // 忽略音频限制
    }
  };

  // 绘制 Canvas 大转盘
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const total = activeSlices.length;
    const arc = (2 * Math.PI) / total;

    ctx.clearRect(0, 0, size, size);

    // 绘制外圈木质/金属边框
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#502428';
    ctx.fill();

    // 外圈金铆钉点缀
    for (let i = 0; i < total * 2; i++) {
      const angle = (i * Math.PI) / total;
      const dotX = center + (radius + 2) * Math.cos(angle);
      const dotY = center + (radius + 2) * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 1.8, 0, 2 * Math.PI);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
    }
    ctx.restore();

    // 绘制旋转的扇区
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);

    for (let i = 0; i < total; i++) {
      const startAngle = i * arc;
      const endAngle = startAngle + arc;

      // 扇区底色
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();

      // 扇区分界线
      ctx.strokeStyle = '#502428';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 放射文字排布
      ctx.save();
      const textAngle = startAngle + arc / 2;
      ctx.rotate(textAngle);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#3E1C20';
      ctx.font = 'bold 11px "ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif';

      // 文本截断
      const text = activeSlices[i].slice(0, 5);
      ctx.fillText(text, radius - 14, 4);
      ctx.restore();
    }

    // 中心装饰圆盘
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFBF2';
    ctx.fill();
    ctx.strokeStyle = '#502428';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }, [activeSlices, rotation]);

  // 开始旋转
  const handleSpin = () => {
    if (isSpinning || activeSlices.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    const total = activeSlices.length;
    const arcDeg = 360 / total;

    // 随机旋转圈数 (5 ~ 8 圈) + 随机角度
    const randomExtraRounds = 5 + Math.floor(Math.random() * 3);
    const randomStopAngle = Math.random() * 360;
    const targetTotalAngle = rotation + randomExtraRounds * 360 + randomStopAngle;

    const startAngle = rotation;
    const deltaAngle = targetTotalAngle - startAngle;
    const duration = 3400; // 3.4 秒阻尼
    const startTime = performance.now();
    lastTickAngleRef.current = startAngle;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 经典减速曲线 (Cubic Ease-Out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + deltaAngle * easeProgress;
      setRotation(currentAngle);

      // 扇区碰撞音效判定 (每掠过一个扇区触发一次咔哒)
      if (Math.abs(currentAngle - lastTickAngleRef.current) >= arcDeg) {
        playTickSound();
        lastTickAngleRef.current = currentAngle;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // 指针固定在顶部 12 点钟位置（-90度或270度）
        // 计算停在正上方的扇区索引
        const normalizedAngle = (360 - (currentAngle % 360) + 270) % 360;
        const winnerIndex = Math.floor(normalizedAngle / arcDeg) % total;
        const pickedDish = activeSlices[winnerIndex];
        setWinner(pickedDish);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* 顶部操作栏：返回手账 + 标题 */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 4px 6px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: '#FFF0F5',
            border: '2px solid #502428',
            borderRadius: '12px',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 900,
            color: '#DB2777',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            boxShadow: '0 2px 0 #502428',
          }}
        >
          <ChevronLeft size={14} strokeWidth={3} />
          <span>返回手账</span>
        </button>

        <div
          style={{
            fontSize: '14px',
            fontWeight: 900,
            color: '#502428',
            fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
            letterSpacing: '0.5px',
          }}
        >
          今天吃什么？
        </div>

        <button
          onClick={() => setRandomSeed((s) => s + 1)}
          title="换一批候选美味"
          disabled={isSpinning || candidatePool.length <= 8}
          style={{
            background: candidatePool.length > 8 ? '#FFFDF0' : '#F3F4F6',
            border: '1.5px solid #502428',
            borderRadius: '10px',
            padding: '3px 6px',
            fontSize: '10px',
            fontWeight: 800,
            color: candidatePool.length > 8 ? '#B45309' : '#9CA3AF',
            cursor: candidatePool.length > 8 ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            opacity: candidatePool.length > 8 ? 1 : 0.6,
          }}
        >
          <RotateCw size={11} />
          <span>换一批</span>
        </button>
      </div>

      {/* 时段过滤标签栏 */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          margin: '6px 0 10px',
        }}
      >
        {[
          { key: 'ALL', label: '全部' },
          { key: 'breakfast', label: '早餐' },
          { key: 'lunch', label: '午餐' },
          { key: 'dinner', label: '晚餐' },
          { key: 'snack', label: '加餐' },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (!isSpinning) {
                  setActiveTab(tab.key as 'ALL' | RPGMealRecord['mealType']);
                  setWinner(null);
                }
              }}
              style={{
                padding: '3px 8px',
                borderRadius: '10px',
                border: isSelected ? '1.5px solid #502428' : '1.5px solid #E5D8C8',
                background: isSelected ? '#502428' : '#FAF4E8',
                color: isSelected ? '#FFFFFF' : '#7D5A44',
                fontSize: '10.5px',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'all 0.1s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 转盘与中心指针区域 */}
      <div
        style={{
          position: 'relative',
          width: '210px',
          height: '210px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '2px 0 8px',
        }}
      >
        {/* 顶部中央固定红色指针 (向下指) */}
        <div
          style={{
            position: 'absolute',
            top: '-7px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            width: '0',
            height: '0',
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '16px solid #E11D48',
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
          }}
        />

        {/* 转盘 Canvas */}
        <canvas
          ref={canvasRef}
          width={210}
          height={210}
          style={{
            width: '210px',
            height: '210px',
            borderRadius: '50%',
            boxShadow: '0 6px 16px rgba(80, 36, 40, 0.25)',
          }}
        />

        {/* 中心旋转发射按钮 */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: isSpinning
              ? '#D1D5DB'
              : 'radial-gradient(circle, #F43F5E 30%, #BE123C 100%)',
            border: '2.5px solid #502428',
            boxShadow: isSpinning
              ? 'none'
              : 'inset 0 2px 2px rgba(255,255,255,0.6), 0 3px 6px rgba(0,0,0,0.3)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 900,
            cursor: isSpinning ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={(e) => {
            if (!isSpinning) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.92)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
          }}
        >
          {isSpinning ? '...' : '抽！'}
        </button>
      </div>

      {/* 底部结果卡片或引导文案 */}
      {winner ? (
        <div
          style={{
            width: '100%',
            background: '#FFF0F5',
            border: '2px solid #502428',
            borderRadius: '16px',
            padding: '10px 12px',
            boxShadow: '0 3px 0 #502428',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideUpSpring 0.25s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="#DB2777" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#7E3040' }}>
              今日天选美味
            </span>
          </div>

          <div
            style={{
              fontSize: '17px',
              fontWeight: 900,
              color: '#BE123C',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            【 {winner} 】
          </div>

          {/* 快捷操作组 */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '2px' }}>
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: '10px',
                background: '#FAF4E8',
                border: '1.5px solid #502428',
                color: '#502428',
                fontSize: '11px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              再转一次
            </button>
            <button
              onClick={() => onSelectMealToLog(winner, activeTab === 'ALL' ? defaultMealType : activeTab)}
              style={{
                flex: 1.5,
                padding: '6px 0',
                borderRadius: '10px',
                background: '#10B981',
                border: '1.5px solid #064E3B',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                boxShadow: '0 2px 0 #064E3B',
              }}
            >
              <Check size={13} strokeWidth={3} />
              <span>吃这个！记一餐</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '10px 14px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#8A6D55',
            lineHeight: 1.4,
          }}
        >
          {isSpinning
            ? '轮盘正在命运齿轮中飞速旋转...'
            : '点击中央按钮，让手账里的美味替你做选择'}
        </div>
      )}
    </div>
  );
};
