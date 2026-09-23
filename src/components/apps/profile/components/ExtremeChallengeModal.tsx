import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Play, Pause, RotateCcw, Sparkles, Flame } from 'lucide-react';
import { RPGProfile, ExtremeChallengeType } from '../../../../core/rpg/types';
import {
  CHALLENGE_PROJECTS,
  checkChallengeTimeWindow,
  executeExtremeCheckIn,
  getBeijingTimeInfo,
  getProjectProgress,
} from '../../../../core/rpg/extremeChallengeStorage';

interface ExtremeChallengeModalProps {
  profile: RPGProfile;
  onUpdateProfile: (updater: (prev: RPGProfile) => RPGProfile) => void;
  onClose: () => void;
  onToast: (text: string) => void;
}

export const ExtremeChallengeModal: React.FC<ExtremeChallengeModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
  onToast,
}) => {
  const [activeType, setActiveType] = useState<ExtremeChallengeType>(
    profile.extremeChallenge?.activeType || 'early_bird'
  );

  const activeProgress = getProjectProgress(profile.extremeChallenge, activeType);

  // 实时北京时间走字时钟
  const [bjTime, setBjTime] = useState(getBeijingTimeInfo());

  useEffect(() => {
    const timer = setInterval(() => {
      setBjTime(getBeijingTimeInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 运动 15 分钟倒计时器辅助
  const [workoutSeconds, setWorkoutSeconds] = useState(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && workoutSeconds > 0) {
      interval = setInterval(() => {
        setWorkoutSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (workoutSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      onToast('🎉 恭喜完成 15 分钟运动！可以打卡啦！');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, workoutSeconds]);

  const currentProject =
    CHALLENGE_PROJECTS.find((p) => p.type === activeType) || CHALLENGE_PROJECTS[0];

  const timeCheck = checkChallengeTimeWindow(activeType);
  const alreadyCheckedInToday = activeProgress.lastCheckInDate === bjTime.dateStr;
  const isEligibleToClaim = timeCheck.valid && !alreadyCheckedInToday;

  const handleSelectType = (type: ExtremeChallengeType) => {
    setActiveType(type);
    onUpdateProfile((prev) => ({
      ...prev,
      extremeChallenge: {
        ...(prev.extremeChallenge || {}),
        activeType: type,
      },
    }));
  };

  const handleClaim = () => {
    const res = executeExtremeCheckIn(profile, activeType);
    if (!res.success) {
      onToast(res.message);
      return;
    }
    onUpdateProfile(() => res.updatedProfile);
    onToast(res.message);
  };

  // 100% 临摹图1：挂历顶梁（红色横板 + 4个穿孔银白挂环）
  const renderCalendarHeader = () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '58px',
        background: 'linear-gradient(180deg, #F87171 0%, #EF4444 60%, #DC2626 100%)',
        borderBottom: '3px solid #B91C1C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.45)',
      }}
    >
      {/* 4 根银白色金属装订装圈（Ring Binder） */}
      <div
        style={{
          position: 'absolute',
          top: '-12px',
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0 32px',
          pointerEvents: 'none',
        }}
      >
        {[1, 2, 3, 4].map((ring) => (
          <div
            key={ring}
            style={{
              width: '16px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #E2E8F0 0%, #FFFFFF 40%, #94A3B8 100%)',
              border: '2px solid #475569',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            }}
          >
            {/* 环孔打孔阴影 */}
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                left: '2px',
                right: '2px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.35)',
              }}
            />
          </div>
        ))}
      </div>

      {/* 居中大标题（对齐图1白色大字 Daily Reward / 极限挑战） */}
      <div
        style={{
          fontSize: '18px',
          fontWeight: 900,
          color: '#FFFFFF',
          letterSpacing: '1px',
          fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
          textShadow: '0 1.5px 3px rgba(0, 0, 0, 0.45)',
          marginTop: '6px',
        }}
      >
        极限挑战 · {currentProject.title}
      </div>

      {/* 右上角红色白叉关闭按钮（对齐图1） */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #FCA5A5 0%, #F87171 100%)',
          border: '2px solid #991B1B',
          color: '#FFFFFF',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        <X size={14} strokeWidth={3} />
      </button>
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* 挂历画板主体（100% 临摹图1：米白卡纸 + 挂梁 + 7张一字排开卡牌） */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#FFFDF9',
          borderRadius: '26px',
          border: '3px solid #3E1F1A',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* 顶部挂历装订梁 */}
        {renderCalendarHeader()}

        {/* ================= 1. 四大项目胶囊切换栏 ================= */}
        <div
          style={{
            display: 'flex',
            padding: '12px 14px 6px',
            gap: '6px',
            overflowX: 'auto',
          }}
        >
          {CHALLENGE_PROJECTS.map((proj) => {
            const isSelected = activeType === proj.type;
            const projProgress = getProjectProgress(profile.extremeChallenge, proj.type);
            const isProjDoneToday = projProgress.lastCheckInDate === bjTime.dateStr;
            return (
              <button
                key={proj.type}
                onClick={() => handleSelectType(proj.type)}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid #3E1F1A' : '1.5px solid #E2E8F0',
                  background: isSelected ? proj.accentColor : '#F8FAFC',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  fontSize: '11.5px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                }}
              >
                <span>{proj.icon}</span>
                <span>{proj.shortTitle}</span>
                {isProjDoneToday && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isSelected ? '#FFFFFF' : '#16A34A',
                      marginLeft: '2px',
                    }}
                    title="今日已打卡"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ================= 2. 严苛时段与北京时间说明栏 ================= */}
        <div
          style={{
            margin: '4px 14px 10px',
            padding: '8px 12px',
            borderRadius: '14px',
            background: isEligibleToClaim ? '#ECFDF5' : '#FFF1F2',
            border: isEligibleToClaim ? '1.5px solid #6EE7B7' : '1.5px solid #FECDD3',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} color={isEligibleToClaim ? '#059669' : '#E11D48'} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>
                规定时段: <b>{currentProject.timeWindowText}</b>
              </span>
            </div>

            {/* 实时北京时间 */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#1E293B',
                fontFamily: 'monospace',
                background: '#FFFFFF',
                padding: '1px 6px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
              }}
            >
              {bjTime.timeStr}
            </div>
          </div>

          <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
            {alreadyCheckedInToday ? (
              <span style={{ color: '#059669', fontWeight: 700 }}>✓ 今日已完成打卡，明天继续保持！</span>
            ) : isEligibleToClaim ? (
              <span style={{ color: '#059669', fontWeight: 800 }}>⚡ 铁律时段有效中，请立即点击下方打卡！</span>
            ) : (
              <span style={{ color: '#E11D48' }}>🔒 {timeCheck.message}</span>
            )}
          </div>

          {/* 运动项目专属：15分钟计时器辅助 */}
          {activeType === 'workout' && (
            <div
              style={{
                marginTop: '6px',
                paddingTop: '6px',
                borderTop: '1px dashed #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={13} color="#EF4444" />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E293B' }}>
                  15分钟计时:{' '}
                  <b>
                    {String(Math.floor(workoutSeconds / 60)).padStart(2, '0')}:
                    {String(workoutSeconds % 60).padStart(2, '0')}
                  </b>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: isTimerRunning ? '#FEF2F2' : '#EFF6FF',
                    color: isTimerRunning ? '#DC2626' : '#2563EB',
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  {isTimerRunning ? <Pause size={10} /> : <Play size={10} />}
                  {isTimerRunning ? '暂停' : '开始'}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setWorkoutSeconds(15 * 60);
                  }}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#64748B',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={10} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= 3. 七天卡牌横排展示（100% 临摹图1） ================= */}
        <div
          style={{
            padding: '4px 12px 14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '5px',
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const isClaimed = (activeProgress.claimedDays || []).includes(day);
            const isCurrentDay = activeProgress.currentDayIndex === day && !alreadyCheckedInToday;
            const isFinalDay = day === 7;

            return (
              <div
                key={day}
                style={{
                  height: '96px',
                  borderRadius: '12px',
                  // 对齐图1：选中/打卡为金色微星卡牌，待打卡为粉红波点卡牌
                  background: isClaimed || (isCurrentDay && isEligibleToClaim)
                    ? 'radial-gradient(circle at center, #FFFDEB 0%, #FEF08A 65%, #FACC15 100%)'
                    : isFinalDay
                    ? 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)'
                    : '#FFE4E6',
                  backgroundImage: !isClaimed && !isCurrentDay && !isFinalDay
                    ? 'radial-gradient(#FDA4AF 12%, transparent 12%)'
                    : undefined,
                  backgroundSize: '8px 8px',
                  border: isCurrentDay
                    ? '2.5px solid #F59E0B'
                    : isClaimed
                    ? '2px solid #CA8A04'
                    : '1.5px solid #FB7185',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 2px 6px',
                  position: 'relative',
                  boxShadow: isCurrentDay
                    ? '0 0 10px rgba(245, 158, 11, 0.55)'
                    : '0 2px 4px rgba(0, 0, 0, 0.08)',
                  transform: isCurrentDay ? 'scale(1.03)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* 顶部天数标签（对齐图1 Day 1 / Day 2 黑色粗体小字） */}
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 900,
                    color: isClaimed ? '#713F12' : '#3D1F1A',
                    lineHeight: 1,
                  }}
                >
                  Day {day}
                </span>

                {/* 卡牌中心奖励图标 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isFinalDay ? (
                    <span style={{ fontSize: '20px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                      👑
                    </span>
                  ) : (
                    <span style={{ fontSize: '18px' }}>{currentProject.icon}</span>
                  )}
                </div>

                {/* 底部奖励数值 */}
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 900,
                    color: isClaimed ? '#854D0E' : isFinalDay ? '#78350F' : '#E11D48',
                    lineHeight: 1,
                  }}
                >
                  {isFinalDay ? '+1钻' : '+2片'}
                </span>

                {/* 已打卡绿色对勾章 */}
                {isClaimed && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      background: '#16A34A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Check size={10} strokeWidth={3.5} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 奖励预览小横条 */}
        <div
          style={{
            margin: '0 14px 12px',
            padding: '6px 10px',
            borderRadius: '10px',
            background: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10.5px',
            color: '#475569',
          }}
        >
          <span>🎯 今日打卡奖励: <b>{currentProject.dailyRewardText}</b></span>
          <span style={{ color: '#D97706', fontWeight: 800 }}>7天大奖 👑</span>
        </div>

        {/* ================= 4. 底部亮绿果冻胶囊大打卡按钮（100% 临摹图1 Claim 按钮） ================= */}
        <div style={{ padding: '0 14px 18px' }}>
          <button
            onClick={handleClaim}
            disabled={!isEligibleToClaim}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '24px',
              border: '2.5px solid #14532D',
              background: isEligibleToClaim
                ? 'linear-gradient(180deg, #86EFAC 0%, #22C55E 50%, #15803D 100%)'
                : alreadyCheckedInToday
                ? 'linear-gradient(180deg, #94A3B8 0%, #64748B 100%)'
                : 'linear-gradient(180deg, #E2E8F0 0%, #94A3B8 100%)',
              color: '#FFFFFF',
              fontSize: '17px',
              fontWeight: 900,
              letterSpacing: '2px',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", "幼圆", cursive, sans-serif',
              textShadow: '0 1.5px 2px rgba(0, 0, 0, 0.45)',
              cursor: isEligibleToClaim ? 'pointer' : 'not-allowed',
              boxShadow: isEligibleToClaim
                ? '0 6px 14px rgba(34, 197, 94, 0.45), inset 0 2px 2px rgba(255, 255, 255, 0.5)'
                : 'none',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 果冻顶部反光条 */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '10%',
                right: '10%',
                height: '14px',
                borderRadius: '10px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              }}
            />

            {alreadyCheckedInToday
              ? '今日已打卡 ✓'
              : !timeCheck.valid
              ? `未在时段内 (${currentProject.timeWindowText})`
              : '立 即 打 卡 (Claim)'}
          </button>
        </div>
      </div>
    </div>
  );
};
