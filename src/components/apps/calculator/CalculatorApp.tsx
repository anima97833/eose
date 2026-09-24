import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Check, Copy, Flame, RotateCcw, Award } from 'lucide-react';
import { calcAudio, AudioSwitchMode } from './calculatorAudio';
import { loadRPGProfile, saveRPGProfile } from '../../../core/rpg/rpgStorage';
import { NM } from '../storyword/storyWordNeumorphism';

type CalcAppTab = 'classic' | 'life' | 'reactor';
type LifeSubTab = 'aa' | 'discount' | 'salary';

interface CalculatorAppProps {
  onBack: () => void;
}

export const CalculatorApp: React.FC<CalculatorAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<CalcAppTab>('classic');
  const [audioMode, setAudioMode] = useState<AudioSwitchMode>('blue');

  // ================= 经典计算状态 =================
  const [val, setVal] = useState<string>('0');
  const [expr, setExpr] = useState<string>('');
  const [prevVal, setPrevVal] = useState<string>('');
  const [operator, setOperator] = useState<string>('');
  const [justCalculated, setJustCalculated] = useState<boolean>(false);

  // ================= 生活直算状态 =================
  const [lifeTab, setLifeTab] = useState<LifeSubTab>('aa');
  // AA 聚餐
  const [aaTotal, setAaTotal] = useState<number>(368);
  const [aaPeople, setAaPeople] = useState<number>(4);
  const [aaDiscountPeople, setAaDiscountPeople] = useState<number>(1);
  const [aaDiscountAmount, setAaDiscountAmount] = useState<number>(30);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // 满减比价
  const [discAPrice, setDiscAPrice] = useState<number>(300);
  const [discACut, setDiscACut] = useState<number>(50); // 满 300 减 50
  const [discBPrice, setDiscBPrice] = useState<number>(300);
  const [discBRate, setDiscBRate] = useState<number>(80); // 8折

  // 摸鱼算薪
  const [monthlySalary, setMonthlySalary] = useState<number>(15000);
  const [slackMinutes, setSlackMinutes] = useState<number>(45);

  // ================= 算术反应堆 RPG 状态 =================
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [gameTime, setGameTime] = useState<number>(45);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<{ q: string; a: number }>({ q: '7 × 8', a: 56 });
  const [gameInput, setGameInput] = useState<string>('');
  const [gameResultModal, setGameResultModal] = useState<boolean>(false);
  const [rewardIntGain, setRewardIntGain] = useState<number>(0);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // ================= 经典计算器逻辑 =================
  const handleKeyClick = (key: string) => {
    calcAudio.playKeySound(key, audioMode);

    if (key === 'C') {
      setVal('0');
      setExpr('');
      setPrevVal('');
      setOperator('');
      setJustCalculated(false);
      return;
    }

    if (key === '±') {
      const num = parseFloat(val) || 0;
      setVal(String(-num));
      return;
    }

    if (key === '%') {
      const num = (parseFloat(val) || 0) / 100;
      setVal(String(num));
      return;
    }

    if (['+', '-', '×', '÷'].includes(key)) {
      setPrevVal(val);
      setOperator(key);
      setExpr(`${val} ${key}`);
      setVal('0');
      setJustCalculated(false);
      return;
    }

    if (key === '=') {
      if (!operator || !prevVal) return;
      const a = parseFloat(prevVal);
      const b = parseFloat(val);
      let res = 0;
      if (operator === '+') res = a + b;
      if (operator === '-') res = a - b;
      if (operator === '×') res = a * b;
      if (operator === '÷') res = b === 0 ? 0 : a / b;

      const rounded = Math.round(res * 1000000) / 1000000;
      setExpr(`${prevVal} ${operator} ${val} =`);
      setVal(String(rounded));
      setPrevVal('');
      setOperator('');
      setJustCalculated(true);
      return;
    }

    // 数字与小数点
    if (justCalculated) {
      setVal(key === '.' ? '0.' : key);
      setExpr('');
      setJustCalculated(false);
      return;
    }

    if (key === '.') {
      if (!val.includes('.')) {
        setVal(val + '.');
      }
      return;
    }

    if (val === '0') {
      setVal(key);
    } else {
      if (val.length < 12) {
        setVal(val + key);
      }
    }
  };

  // ================= 算术反应堆游戏逻辑 =================
  const generateProblem = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = 0;
    let b = 0;
    let ans = 0;

    if (op === '+') {
      a = Math.floor(Math.random() * 45) + 6;
      b = Math.floor(Math.random() * 45) + 6;
      ans = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 60) + 15;
      b = Math.floor(Math.random() * a) + 2;
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 11) + 2;
      b = Math.floor(Math.random() * 11) + 2;
      ans = a * b;
    }

    setCurrentProblem({ q: `${a} ${op} ${b}`, a: ans });
    setGameInput('');
  };

  const handleStartGame = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setGameTime(45);
    setGameResultModal(false);
    setIsGameRunning(true);
    generateProblem();
  };

  // 反应堆计时器
  useEffect(() => {
    if (isGameRunning && gameTime > 0) {
      timerRef.current = window.setTimeout(() => {
        setGameTime((t) => t - 1);
      }, 1000);
    } else if (isGameRunning && gameTime <= 0) {
      // 游戏结算
      setIsGameRunning(false);
      const earnedInt = Math.max(1, Math.floor(score / 50));
      setRewardIntGain(earnedInt);

      // 发放 INT 属性
      try {
        const p = loadRPGProfile();
        if (p.attributes?.INT) {
          p.attributes.INT.value = (p.attributes.INT.value || 10) + earnedInt;
          saveRPGProfile(p);
        }
      } catch (e) {
        console.warn('RPG save error', e);
      }

      setGameResultModal(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isGameRunning, gameTime, score]);

  const handleReactorInput = (numKey: string) => {
    if (!isGameRunning) return;
    calcAudio.playKeySound(numKey, audioMode);

    if (numKey === 'C') {
      setGameInput('');
      return;
    }

    const next = gameInput + numKey;
    setGameInput(next);

    const userNum = parseInt(next, 10);
    if (userNum === currentProblem.a) {
      // 答对！
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      setScore((s) => s + 20 + nextCombo * 5);
      calcAudio.playSuccessCombo(nextCombo);
      generateProblem();
    } else if (next.length >= String(currentProblem.a).length && userNum !== currentProblem.a) {
      // 答错
      calcAudio.playFailSound();
      setCombo(0);
      setGameInput('');
      setGameTime((t) => Math.max(0, t - 1)); // 罚时 1 秒
    }
  };

  // ================= 生活直算结果计算 =================
  // 1. AA 分账
  const discountTotal = aaDiscountPeople * aaDiscountAmount;
  const regularTotal = Math.max(0, aaTotal - discountTotal);
  const aaRegularEach = aaPeople > 0 ? Math.round((regularTotal / aaPeople) * 10) / 10 : 0;
  const aaDiscountEach = Math.max(0, Math.round((aaRegularEach - aaDiscountAmount) * 10) / 10);

  const handleCopyAAText = () => {
    const text = `📢 本次聚餐账单：总计 ￥${aaTotal}\n- 正常每人：￥${aaRegularEach}\n${aaDiscountPeople > 0 ? `- 减免伙伴(${aaDiscountPeople}人)：每人 ￥${aaDiscountEach}\n` : ''}记得及时转账哦~`;
    navigator.clipboard?.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    showToast('已复制分账文案到剪贴板！');
  };

  // 2. 满减比价
  const planAPay = Math.max(0, discAPrice - discACut);
  const planADiscount = discAPrice > 0 ? Math.round((planAPay / discAPrice) * 100) : 100;
  const planBPay = Math.round(discBPrice * (discBRate / 100));
  const isAWin = planAPay < planBPay;

  // 3. 摸鱼算薪
  // 月薪按每月21.75天，每天8小时计算
  const minuteRate = monthlySalary / (21.75 * 8 * 60);
  const slackEarned = Math.round(minuteRate * slackMinutes * 100) / 100;
  const hourlyRate = Math.round(minuteRate * 60 * 10) / 10;

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: NM.bg,
        color: NM.textMain,
        boxSizing: 'border-box',
        padding: '14px 16px 18px',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* 顶部标题栏 + 轴体声音模式切换 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: NM.cardBg,
            border: NM.borderLight,
            boxShadow: NM.convexSm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: NM.textSub,
          }}
          title="返回桌面"
        >
          <ArrowLeft size={18} />
        </button>

        {/* 顶部轴体声学分段器 */}
        <div
          style={{
            display: 'flex',
            backgroundColor: NM.bgInset,
            padding: '3px',
            borderRadius: '12px',
            boxShadow: NM.insetXs,
            gap: '3px',
          }}
        >
          {[
            { id: 'blue', label: '青轴' },
            { id: 'typewriter', label: '打字机' },
            { id: 'piano', label: '音阶琴' },
            { id: 'mute', label: '静音' },
          ].map((mode) => {
            const isSel = audioMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setAudioMode(mode.id as AudioSwitchMode);
                  calcAudio.playKeySound('1', mode.id as AudioSwitchMode);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: isSel ? 800 : 600,
                  backgroundColor: isSel ? NM.cardBg : 'transparent',
                  color: isSel ? NM.amber : NM.textSub,
                  boxShadow: isSel ? NM.convexXs : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 核心三模式主分段导航按键 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          margin: '10px 0',
          flexShrink: 0,
        }}
      >
        {[
          { id: 'classic', label: '🧮 拟物计算' },
          { id: 'life', label: '💡 生活直算' },
          { id: 'reactor', label: '⚡ 算术反应堆' },
        ].map((tab) => {
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CalcAppTab)}
              style={{
                padding: '8px 0',
                borderRadius: '12px',
                border: isAct ? `1.5px solid ${NM.amber}` : NM.borderLight,
                backgroundColor: isAct ? NM.cardBg : NM.bgInset,
                color: isAct ? NM.amber : NM.textSub,
                fontSize: '12px',
                fontWeight: isAct ? 800 : 600,
                boxShadow: isAct ? NM.convexSm : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================= 模式 1: 拟物经典计算器 ================= */}
      {activeTab === 'classic' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 拟物凹陷深色屏幕 */}
          <div
            style={{
              width: '100%',
              height: '84px',
              borderRadius: '16px',
              backgroundColor: NM.bgInset,
              boxShadow: NM.insetSm,
              padding: '12px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: '13px', color: NM.textMuted, minHeight: '18px' }}>
              {expr}
            </div>
            <div
              style={{
                fontSize: val.length > 9 ? '24px' : '32px',
                fontWeight: 900,
                color: NM.textMain,
                letterSpacing: '1px',
                fontFamily: 'monospace',
              }}
            >
              {val}
            </div>
          </div>

          {/* 琴键提示指示 */}
          {audioMode === 'piano' && (
            <div
              style={{
                fontSize: '11px',
                color: NM.amber,
                fontWeight: 700,
                textAlign: 'center',
                backgroundColor: NM.bgLighter,
                padding: '4px 8px',
                borderRadius: '8px',
              }}
            >
              🎹 钢琴音阶已激活：数字 1~7 对应 Do Re Mi Fa Sol La Ti
            </div>
          )}

          {/* 键盘网格 */}
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              alignContent: 'center',
            }}
          >
            {[
              { k: 'C', color: '#EF4444' },
              { k: '±', color: NM.amber },
              { k: '%', color: NM.amber },
              { k: '÷', color: NM.amber },

              { k: '7', note: 'Ti' },
              { k: '8', note: '高Do' },
              { k: '9', note: '高Re' },
              { k: '×', color: NM.amber },

              { k: '4', note: 'Fa' },
              { k: '5', note: 'Sol' },
              { k: '6', note: 'La' },
              { k: '-', color: NM.amber },

              { k: '1', note: 'Do' },
              { k: '2', note: 'Re' },
              { k: '3', note: 'Mi' },
              { k: '+', color: NM.amber },

              { k: '0', span: 2, note: '低La' },
              { k: '.', note: '' },
              { k: '=', bg: NM.amber, color: '#fff' },
            ].map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleKeyClick(btn.k)}
                style={{
                  gridColumn: btn.span ? `span ${btn.span}` : 'span 1',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: btn.bg || NM.cardBg,
                  color: btn.color || NM.textMain,
                  border: NM.borderLight,
                  boxShadow: btn.bg ? '0 4px 10px rgba(217, 119, 6, 0.4)' : NM.convexSm,
                  fontSize: '20px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                  position: 'relative',
                  transition: 'transform 0.08s ease',
                }}
              >
                <span>{btn.k}</span>
                {audioMode === 'piano' && btn.note && (
                  <span style={{ fontSize: '9px', fontWeight: 600, color: NM.textMuted, marginTop: '-4px' }}>
                    {btn.note}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= 模式 2: 生活直算 (纯按钮+面板，无长文说教) ================= */}
      {activeTab === 'life' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 子场景分段选择 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              { id: 'aa', label: '👥 聚餐AA' },
              { id: 'discount', label: '🏷️ 满减比价' },
              { id: 'salary', label: '⏳ 摸鱼算薪' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setLifeTab(t.id as LifeSubTab)}
                style={{
                  padding: '7px 0',
                  borderRadius: '10px',
                  fontSize: '11.5px',
                  fontWeight: lifeTab === t.id ? 800 : 600,
                  border: lifeTab === t.id ? `1.5px solid ${NM.amber}` : NM.borderSoft,
                  backgroundColor: lifeTab === t.id ? NM.cardBg : 'transparent',
                  color: lifeTab === t.id ? NM.amber : NM.textSub,
                  boxShadow: lifeTab === t.id ? NM.convexXs : 'none',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 场景 1: 聚餐 AA */}
          {lifeTab === 'aa' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 总金额直接输入 */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: NM.textSub, display: 'block', marginBottom: '4px' }}>
                  消费总金额 (￥)
                </label>
                <input
                  type="number"
                  value={aaTotal}
                  onChange={(e) => setAaTotal(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: NM.borderSoft,
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    fontSize: '18px',
                    fontWeight: 800,
                    color: NM.textMain,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 人数增减按钮 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: NM.textSub }}>用餐总人数</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setAaPeople(Math.max(1, aaPeople - 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: NM.borderLight, backgroundColor: NM.cardBg, boxShadow: NM.convexXs, fontWeight: 800, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '15px', fontWeight: 800, minWidth: '36px', textAlign: 'center' }}>
                    {aaPeople} 人
                  </span>
                  <button
                    type="button"
                    onClick={() => setAaPeople(aaPeople + 1)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: NM.borderLight, backgroundColor: NM.cardBg, boxShadow: NM.convexXs, fontWeight: 800, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 特殊减免项 (如不吃辣/不喝酒减30) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: NM.textSub }}>减免人数 (少出￥{aaDiscountAmount})</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setAaDiscountPeople(Math.max(0, aaDiscountPeople - 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: NM.borderLight, backgroundColor: NM.cardBg, boxShadow: NM.convexXs, fontWeight: 800, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '15px', fontWeight: 800, minWidth: '36px', textAlign: 'center' }}>
                    {aaDiscountPeople} 人
                  </span>
                  <button
                    type="button"
                    onClick={() => setAaDiscountPeople(Math.min(aaPeople - 1, aaDiscountPeople + 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: NM.borderLight, backgroundColor: NM.cardBg, boxShadow: NM.convexXs, fontWeight: 800, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 结果大字看板 */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexSm,
                  border: NM.borderLight,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: NM.textSub }}>正常每人应付</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: NM.amber }}>
                  ￥{aaRegularEach}
                </div>
                {aaDiscountPeople > 0 && (
                  <div style={{ fontSize: '11px', color: NM.textMuted }}>
                    减免伙伴 ({aaDiscountPeople}人) 各出：￥{aaDiscountEach}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCopyAAText}
                  style={{
                    marginTop: '8px',
                    padding: '8px 0',
                    borderRadius: '10px',
                    backgroundColor: NM.bgInset,
                    border: NM.borderSoft,
                    color: copySuccess ? '#059669' : NM.textSub,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copySuccess ? '已复制收款通知' : '一键复制群聊收款文案'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 场景 2: 满减套路比价 */}
          {lifeTab === 'discount' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 方案 A */}
              <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: NM.bgInset, boxShadow: NM.insetXs }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: NM.textSub }}>方案 A：满减直折</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10px', color: NM.textMuted }}>原价总计</span>
                    <input
                      type="number"
                      value={discAPrice}
                      onChange={(e) => setDiscAPrice(parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: NM.borderSoft, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10px', color: NM.textMuted }}>满减抵扣</span>
                    <input
                      type="number"
                      value={discACut}
                      onChange={(e) => setDiscACut(parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: NM.borderSoft, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: 700, color: NM.textMain }}>
                  实付 ￥{planAPay} (折合 {planADiscount / 10} 折)
                </div>
              </div>

              {/* 方案 B */}
              <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: NM.bgInset, boxShadow: NM.insetXs }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: NM.textSub }}>方案 B：全单折扣 (如2件8折)</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10px', color: NM.textMuted }}>原价总计</span>
                    <input
                      type="number"
                      value={discBPrice}
                      onChange={(e) => setDiscBPrice(parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: NM.borderSoft, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10px', color: NM.textMuted }}>折扣 (如 80 = 8折)</span>
                    <input
                      type="number"
                      value={discBRate}
                      onChange={(e) => setDiscBRate(parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: NM.borderSoft, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: 700, color: NM.textMain }}>
                  实付 ￥{planBPay} (折合 {discBRate / 10} 折)
                </div>
              </div>

              {/* 比价裁决 */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexSm,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', color: NM.textSub }}>比价裁决结论</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: NM.amber, marginTop: '4px' }}>
                  {isAWin ? '🏆 方案 A 满减更划算！' : '🏆 方案 B 真实折扣更低！'}
                </div>
                <div style={{ fontSize: '11px', color: NM.textMuted, marginTop: '2px' }}>
                  差价立省 ￥{Math.abs(planAPay - planBPay)}
                </div>
              </div>
            </div>
          )}

          {/* 场景 3: 摸鱼算薪 */}
          {lifeTab === 'salary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: NM.textSub, display: 'block', marginBottom: '6px' }}>
                  快捷选月薪基准 (￥)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[8000, 15000, 25000, 40000].map((sal) => (
                    <button
                      key={sal}
                      type="button"
                      onClick={() => setMonthlySalary(sal)}
                      style={{
                        padding: '6px 0',
                        borderRadius: '8px',
                        border: monthlySalary === sal ? `1.5px solid ${NM.amber}` : NM.borderSoft,
                        backgroundColor: monthlySalary === sal ? NM.cardBg : NM.bgInset,
                        color: monthlySalary === sal ? NM.amber : NM.textSub,
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {sal >= 10000 ? `${sal / 10000}万` : `${sal / 1000}K`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 摸鱼时长调节 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: NM.textSub }}>本次摸鱼时长</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSlackMinutes(Math.max(5, slackMinutes - 10))}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: NM.borderLight, backgroundColor: NM.cardBg, boxShadow: NM.convexXs, fontWeight: 800, cursor: 'pointer' }}
                  >
                    -10
                  </button>
                  <span style={{ fontSize: '15px', fontWeight: 800, minWidth: '46px', textAlign: 'center' }}>
                    {slackMinutes} 分
                  </span>
                  <button
                    type="button"
                    onClick={() => setSlackMinutes(slackMinutes + 10)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: NM.borderLight, backgroundColor: NM.cardBg, boxShadow: NM.convexXs, fontWeight: 800, cursor: 'pointer' }}
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* 摸鱼收益大字看板 */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexSm,
                  border: NM.borderLight,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', color: NM.textSub }}>本次摸鱼已从老板手中净赚</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#059669', margin: '4px 0' }}>
                  ￥{slackEarned}
                </div>
                <div style={{ fontSize: '11px', color: NM.textMuted }}>
                  时薪折算：￥{hourlyRate} / 小时
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 模式 3: 算术反应堆 RPG 脑力对决 ================= */}
      {activeTab === 'reactor' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!isGameRunning && !gameResultModal ? (
            /* 未开始状态介绍面板 (按钮式，无长文) */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexLg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Flame size={32} color={NM.amber} />
              </div>

              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: NM.textMain }}>
                  算术反应堆 · 脑力觉醒
                </div>
                <div style={{ fontSize: '11px', color: NM.textSub, marginTop: '4px' }}>
                  45 秒极速算力挑战 · 连击结算角色 INT (智力) 经验
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartGame}
                style={{
                  marginTop: '10px',
                  padding: '12px 32px',
                  borderRadius: '24px',
                  backgroundColor: NM.amber,
                  color: '#fff',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
                  cursor: 'pointer',
                }}
              >
                ⚡ 开始挑战
              </button>
            </div>
          ) : isGameRunning ? (
            /* 游戏中面板 */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* 顶部计分与倒计时 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: NM.amber, fontWeight: 800 }}>
                  <Flame size={16} />
                  <span>COMBO {combo}</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: gameTime <= 10 ? '#EF4444' : NM.textMain }}>
                  ⏳ {gameTime}s
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: NM.textSub }}>
                  得分: {score}
                </div>
              </div>

              {/* 算术出题大卡片 */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexSm,
                  border: NM.borderLight,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 900, color: NM.textMain, letterSpacing: '2px' }}>
                  {currentProblem.q} = ?
                </div>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: NM.amber,
                    minHeight: '32px',
                    borderBottom: `2px solid ${NM.amber}`,
                    maxWidth: '120px',
                    margin: '0 auto',
                  }}
                >
                  {gameInput || '_'}
                </div>
              </div>

              {/* 游戏专属精简数字键盘 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k === '⌫') {
                        setGameInput((s) => s.slice(0, -1));
                      } else {
                        handleReactorInput(k);
                      }
                    }}
                    style={{
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: k === 'C' ? '#FEE2E2' : NM.cardBg,
                      color: k === 'C' ? '#EF4444' : NM.textMain,
                      border: NM.borderLight,
                      boxShadow: NM.convexXs,
                      fontSize: '18px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 结算弹窗 (按钮式) */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              <Award size={48} color={NM.amber} />
              <div style={{ fontSize: '20px', fontWeight: 900, color: NM.textMain }}>
                挑战完成！
              </div>
              <div style={{ fontSize: '13px', color: NM.textSub }}>
                终局得分: <b>{score}</b> · 最高连击: <b>{maxCombo}</b>
              </div>

              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                🎉 智力沉淀：角色 INT (智力) +{rewardIntGain}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleStartGame}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '20px',
                    backgroundColor: NM.amber,
                    color: '#fff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    boxShadow: NM.convexSm,
                    cursor: 'pointer',
                  }}
                >
                  再来一局
                </button>
                <button
                  type="button"
                  onClick={() => setGameResultModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '20px',
                    backgroundColor: NM.cardBg,
                    color: NM.textSub,
                    border: NM.borderLight,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  返回
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 提示 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(51, 66, 87, 0.92)',
            color: '#FFFFFF',
            padding: '7px 16px',
            borderRadius: '20px',
            fontSize: '11.5px',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            zIndex: 100,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
