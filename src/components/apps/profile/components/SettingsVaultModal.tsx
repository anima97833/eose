import React, { useState } from 'react';
import { RPGProfile } from '../../../../core/rpg/types';
import {
  addVaultLog,
  calculateFreeDays,
} from '../../../../core/rpg/vaultStorage';
import { playClickSound } from '../../pomodoro/soundSynthesizer';

interface SettingsVaultModalProps {
  profile: RPGProfile;
  onUpdateProfile: (updater: (prev: RPGProfile) => RPGProfile) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const SettingsVaultModal: React.FC<SettingsVaultModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
  showToast,
}) => {
  // 当前子视图：'overview' (参考图原貌) | 'deposit' (存款与记账) | 'fire' (自由天数) | 'editGoal' (编辑横幅寄语)
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'fire'>('overview');

  // 本地开关状态
  const [privacy, setPrivacy] = useState(profile.isPrivacyHidden ?? false);

  // 校准存款表单状态
  const [calibrateAmount, setCalibrateAmount] = useState(String(profile.gold));

  // 自由天数设置
  const [dailyCostInput, setDailyCostInput] = useState(String(profile.dailyCost || 100));
  const [goalDaysInput, setGoalDaysInput] = useState(String(profile.savingGoalDays || 365));

  // 横幅目标寄语编辑
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalNoteInput, setGoalNoteInput] = useState(
    profile.savingGoalNote || `自由生活目标: ${profile.savingGoalDays || 365}天 🏖️`
  );

  const triggerSound = () => {
    playClickSound();
  };

  const handleTogglePrivacy = () => {
    triggerSound();
    const next = !privacy;
    setPrivacy(next);
    onUpdateProfile((p) => ({ ...p, isPrivacyHidden: next }));
    showToast(next ? '隐私遮罩已开启' : '隐私遮罩已关闭');
  };

  // 直接校准当前存款总额
  const handleCalibrate = () => {
    triggerSound();
    const val = parseFloat(calibrateAmount);
    if (isNaN(val) || val < 0) {
      showToast('请输入有效金额');
      return;
    }
    const rounded = Math.round(val);
    const diff = rounded - profile.gold;

    addVaultLog({
      type: 'adjust',
      amount: rounded,
      note: diff >= 0 ? `校准总存款 (+${diff})` : `校准总存款 (${diff})`,
    });

    onUpdateProfile((p) => ({
      ...p,
      gold: rounded,
    }));
    showToast('存款已校准');
  };

  // 保存生活成本与自由天数
  const handleSaveDailyCost = () => {
    triggerSound();
    const cost = Math.max(1, Math.round(parseFloat(dailyCostInput) || 100));
    const goal = Math.max(1, Math.round(parseFloat(goalDaysInput) || 365));

    onUpdateProfile((p) => ({
      ...p,
      dailyCost: cost,
      savingGoalDays: goal,
    }));
    showToast('自由天数已重算');
  };

  // 保存横幅寄语
  const handleSaveGoalNote = () => {
    triggerSound();
    const text = goalNoteInput.trim() || `自由生活目标: ${profile.savingGoalDays || 365}天 🏖️`;
    onUpdateProfile((p) => ({ ...p, savingGoalNote: text }));
    setIsEditingGoal(false);
    showToast('寄语已更新');
  };

  const freeDays = calculateFreeDays(profile.gold, profile.dailyCost || 100, profile.crystals || 0);
  const parsedGoal = parseInt(goalDaysInput, 10);
  const goalDays = (!isNaN(parsedGoal) && parsedGoal > 0) ? parsedGoal : (profile.savingGoalDays || 365);
  const progressPercent = Math.min(100, Math.round((freeDays / goalDays) * 100));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'rgba(30, 24, 20, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      {/* 弹窗核心卡片（对齐参考图：复古羊皮纸 + 萌猫探头 + 右上角缎带叉号） */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '350px',
          background: '#FFF9EB', // 参考图暖黄羊皮纸底色
          borderRadius: '26px',
          border: '3px solid #502428', // 参考图深可可棕描边
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px 16px 20px',
        }}
      >
        {/* ================= 顶部探头趴趴猫 (精确还原参考图猫猫造型) ================= */}
        <div
          style={{
            position: 'absolute',
            top: '-42px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <svg width="108" height="52" viewBox="0 0 108 52" fill="none">
            {/* 猫猫头部白色轮廓 */}
            <path
              d="M24 48 C 22 34, 18 16, 26 8 C 31 3, 38 10, 42 16 C 50 14, 62 14, 69 16 C 73 10, 80 3, 85 8 C 93 16, 89 34, 87 48 Z"
              fill="#FFFFFF"
              stroke="#502428"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* 左耳内橘粉色 */}
            <path
              d="M26 12 C 28 8, 33 11, 36 17 C 30 18, 27 16, 26 12 Z"
              fill="#F6A27E"
            />
            {/* 右耳内橘粉色 */}
            <path
              d="M85 12 C 83 8, 78 11, 75 17 C 81 18, 84 16, 85 12 Z"
              fill="#F6A27E"
            />
            {/* 惬意眯眯眼（绿色细缝眼） */}
            <ellipse cx="44" cy="24" rx="4.5" ry="2" fill="#3D7B54" />
            <ellipse cx="67" cy="24" rx="4.5" ry="2" fill="#3D7B54" />
            <path d="M40 23 L48 24" stroke="#502428" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M63 24 L71 23" stroke="#502428" strokeWidth="1.5" strokeLinecap="round" />
            {/* 额头橘黄色小花纹 */}
            <path d="M52 14 C 54 18, 57 18, 59 14 Z" fill="#F6A27E" />
            {/* 倒三小猫嘴 */}
            <path
              d="M53 28 Q55.5 30 55.5 28.5 Q55.5 30 58 28"
              stroke="#502428"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
            {/* 胸前小红领圈/苹果挂饰 */}
            <circle cx="55.5" cy="35" r="5" fill="#E75443" stroke="#502428" strokeWidth="1.5" />
            <path d="M55.5 29 Q57 27 58 28" stroke="#3D7B54" strokeWidth="1.5" fill="none" />
            {/* 搭在边框上的两只小肉爪 */}
            <rect
              x="26"
              y="40"
              width="15"
              height="11"
              rx="5"
              fill="#FFFFFF"
              stroke="#502428"
              strokeWidth="2.5"
            />
            <path d="M31 46 L31 51" stroke="#502428" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M36 46 L36 51" stroke="#502428" strokeWidth="1.5" strokeLinecap="round" />
            <rect
              x="70"
              y="40"
              width="15"
              height="11"
              rx="5"
              fill="#FFFFFF"
              stroke="#502428"
              strokeWidth="2.5"
            />
            <path d="M75 46 L75 51" stroke="#502428" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M80 46 L80 51" stroke="#502428" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* ================= 右上角红色缎带叉号 (精确还原参考图右上角) ================= */}
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-15px',
            right: '16px',
            cursor: 'pointer',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            filter: 'drop-shadow(0 3px 4px rgba(80, 36, 40, 0.2))',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {/* 红色小书签旗帜 */}
          <div
            style={{
              width: '38px',
              height: '36px',
              background: '#EB6955', // 参考图珊瑚红
              border: '2.5px solid #502428',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* 奶白色叉号 */}
            <span
              style={{
                color: '#FFF8E7',
                fontSize: '20px',
                fontWeight: 900,
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              ✕
            </span>
          </div>
          {/* 燕尾底 */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '19px solid transparent',
              borderRight: '19px solid transparent',
              borderTop: '9px solid #EB6955',
              marginTop: '-1px',
            }}
          />
        </div>

        {/* ================= 标题：Settings / 设定与金库 ================= */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '14px',
            position: 'relative',
          }}
        >
          <span
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#502428',
              letterSpacing: '1px',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)',
            }}
          >
            Settings
          </span>
          {/* 小副标提示 */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#8A5D4D',
              marginTop: '1px',
            }}
          >
            现实存蓄 · 自由天数
          </div>
        </div>

        {/* ================= 复古胶囊滑动开关：Privacy 防窥遮罩 ================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(245, 235, 215, 0.65)',
            padding: '10px 14px',
            borderRadius: '16px',
            border: '2px dashed rgba(80, 36, 40, 0.3)',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#502428' }}>Privacy</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8A5D4D' }}>(防窥遮罩)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#8A5D4D' }}>
              {privacy ? '🔒 防窥中' : '👀 数字公开'}
            </span>
            <div
              onClick={handleTogglePrivacy}
              title="开启后主界面金币隐藏为 **** 防外人偷看"
              style={{
                width: '46px',
                height: '24px',
                borderRadius: '9999px',
                background: privacy ? '#EDAE88' : '#D1C2AF',
                border: '2px solid #502428',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
                padding: '2px',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: privacy ? '#4EA457' : '#9CA3AF',
                  border: '1.5px solid #502428',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.7)',
                  transform: privacy ? 'translateX(22px)' : 'translateX(0px)',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ================= 绿色果冻立体按钮 (对齐参考图 Languages / Support) ================= */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          {/* 按钮 1：校准存款 */}
          <button
            onClick={() => {
              triggerSound();
              setActiveTab(activeTab === 'deposit' ? 'overview' : 'deposit');
            }}
            style={{
              flex: 1,
              padding: '10px 6px',
              background: activeTab === 'deposit' ? '#3C7B47' : '#569A64', // 参考图复古草绿果冻感
              border: '2.5px solid #502428',
              borderRadius: '14px',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '13px',
              boxShadow: '0 3px 0 #31653D',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 果冻顶部反光条 */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '6px',
                right: '6px',
                height: '4px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.45)',
                pointerEvents: 'none',
              }}
            />
            <span>🪙 校准存款</span>
          </button>

          {/* 按钮 2：自由天数 FIRE */}
          <button
            onClick={() => {
              triggerSound();
              setActiveTab(activeTab === 'fire' ? 'overview' : 'fire');
            }}
            style={{
              flex: 1,
              padding: '10px 6px',
              background: activeTab === 'fire' ? '#3C7B47' : '#569A64',
              border: '2.5px solid #502428',
              borderRadius: '14px',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '13px',
              boxShadow: '0 3px 0 #31653D',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '6px',
                right: '6px',
                height: '4px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.45)',
                pointerEvents: 'none',
              }}
            />
            <span>💎 自由天数</span>
          </button>
        </div>

        {/* ================= 子视图区域 (点击对应按钮展开) ================= */}
        {activeTab === 'deposit' && (
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid #502428',
              borderRadius: '14px',
              padding: '12px',
              marginBottom: '14px',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* 当前真实存款展示 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '8px',
                borderBottom: '1.5px dashed #E5D7C2',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#8A5D4D' }}>
                当前现实总存款:
              </span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#D97706' }}>
                ¥ {profile.gold.toLocaleString()}
              </span>
            </div>

            {/* 1. 快速总额校准 */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#502428', marginBottom: '4px' }}>
                一键校准最新银行总存款:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder="如: 50000"
                  value={calibrateAmount}
                  onChange={(e) => setCalibrateAmount(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1.5px solid #502428',
                    fontSize: '12px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleCalibrate}
                  style={{
                    padding: '5px 12px',
                    background: '#EDAE88',
                    color: '#502428',
                    border: '1.5px solid #502428',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  覆盖
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 自由天数计算器面板 */}
        {activeTab === 'fire' && (
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid #502428',
              borderRadius: '14px',
              padding: '12px',
              marginBottom: '14px',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', color: '#8A5D4D', fontWeight: 800 }}>
                当前存款折算可支撑:
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#DB2777', margin: '2px 0' }}>
                💎 {freeDays} <span style={{ fontSize: '14px' }}>天自由人生</span>
              </div>
              <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                (按每日生活成本 ¥{profile.dailyCost || 100} 计算 · 钻石不可随意乱填)
              </div>
            </div>

            {/* 目标达成进度条 */}
            <div style={{ marginBottom: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#502428',
                  marginBottom: '3px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>自由进度 (目标</span>
                  <input
                    type="number"
                    value={goalDaysInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGoalDaysInput(val);
                      const parsed = parseInt(val, 10);
                      if (!isNaN(parsed) && parsed > 0) {
                        onUpdateProfile((p) => ({ ...p, savingGoalDays: parsed }));
                      }
                    }}
                    onBlur={() => {
                      const parsed = parseInt(goalDaysInput, 10);
                      if (isNaN(parsed) || parsed <= 0) {
                        setGoalDaysInput(String(profile.savingGoalDays || 365));
                      } else {
                        showToast('目标天数已更新');
                      }
                    }}
                    title="点击可直接修改目标天数"
                    style={{
                      width: '48px',
                      padding: '1px 4px',
                      borderRadius: '5px',
                      border: '1.5px solid #502428',
                      fontSize: '11px',
                      fontWeight: 900,
                      textAlign: 'center',
                      color: '#502428',
                      background: '#FFF8E7',
                      outline: 'none',
                    }}
                  />
                  <span>天)</span>
                </div>
                <span>{progressPercent}%</span>
              </div>
              <div
                style={{
                  height: '10px',
                  background: '#F3E8FF',
                  borderRadius: '9999px',
                  border: '1.5px solid #502428',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #F472B6, #EC4899)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* 成本参数微调 */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                background: '#FAF4E8',
                padding: '6px 8px',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>每日开销:</span>
              <input
                type="number"
                value={dailyCostInput}
                onChange={(e) => setDailyCostInput(e.target.value)}
                style={{
                  width: '56px',
                  padding: '3px 6px',
                  borderRadius: '6px',
                  border: '1.5px solid #502428',
                  fontSize: '11px',
                  fontWeight: 800,
                  textAlign: 'center',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>元/天</span>
              <button
                onClick={handleSaveDailyCost}
                style={{
                  marginLeft: 'auto',
                  padding: '3px 10px',
                  background: '#569A64',
                  color: '#FFFFFF',
                  border: '1.5px solid #502428',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                更新
              </button>
            </div>
          </div>
        )}

        {/* ================= 珊瑚粉红色长条横幅 (对齐参考图 Omyo's Instagram) ================= */}
        <div
          onClick={() => {
            triggerSound();
            setIsEditingGoal(!isEditingGoal);
          }}
          style={{
            background: '#F27A68', // 参考图标志性珊瑚粉
            border: '2.5px solid #502428',
            borderRadius: '16px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 3px 0 #A84436',
            cursor: 'pointer',
            marginBottom: '14px',
            position: 'relative',
          }}
        >
          {/* 左侧坐着喝茶的小红猫头像 (还原截图左侧猫猫造型) */}
          <div
            style={{
              width: '38px',
              height: '38px',
              background: '#FFF8E7',
              borderRadius: '10px',
              border: '2px solid #502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M5 24 C 4 15, 6 7, 10 5 C 12 4, 14 7, 15 10 C 17 9, 21 9, 22 10 C 24 7, 26 4, 28 5 C 31 10, 31 20, 26 24 Z"
                fill="#ED705E"
                stroke="#502428"
                strokeWidth="1.2"
                transform="scale(0.85) translate(-1, 0)"
              />
              <circle cx="11" cy="13" r="1.5" fill="#502428" />
              <circle cx="17" cy="13" r="1.5" fill="#502428" />
              <path d="M12 16 Q14 17.5 16 16" stroke="#502428" strokeWidth="1.2" fill="none" />
              {/* 小茶杯 */}
              <rect x="6" y="16" width="5" height="6" rx="1.5" fill="#FFFFFF" stroke="#502428" strokeWidth="1" />
            </svg>
          </div>

          {/* 右侧文案 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditingGoal ? (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
              >
                <input
                  type="text"
                  value={goalNoteInput}
                  onChange={(e) => setGoalNoteInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '3px 6px',
                    borderRadius: '6px',
                    border: '1.5px solid #502428',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                />
                <button
                  onClick={handleSaveGoalNote}
                  style={{
                    padding: '3px 8px',
                    background: '#FFF8E7',
                    border: '1.5px solid #502428',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 900,
                    color: '#502428',
                    cursor: 'pointer',
                  }}
                >
                  存
                </button>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textShadow: '0 1px 1px rgba(80, 36, 40, 0.4)',
                  }}
                >
                  {profile.savingGoalNote || `自由生活目标: ${profile.savingGoalDays || 365}天 🏖️`}
                </div>
                <div style={{ fontSize: '10px', color: '#FFE4DE', marginTop: '1px' }}>
                  点击自定义人生财富与自由寄语 ✎
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= 底部信息行 (对齐参考图 User ID 与 Version) ================= */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: 800,
            color: '#8C6553', // 参考图复古暖棕字体
            fontFamily: 'monospace, sans-serif',
            paddingTop: '4px',
            userSelect: 'none',
          }}
        >
          <span>User ID : {profile.userId || '417914'}</span>
          <span>Version: 1.23.0</span>
        </div>
      </div>
    </div>
  );
};
