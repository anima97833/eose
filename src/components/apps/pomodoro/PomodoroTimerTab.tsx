import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Target, Volume2, Check } from 'lucide-react';
import { PomodoroTaskRecord } from '../../../core/storage/db';

export type PomodoroMode = 'focus' | 'short_break' | 'long_break';
export type TimerType = 'countdown' | 'countup';

interface PomodoroTimerTabProps {
  mode: PomodoroMode;
  timerType: TimerType;
  timeLeftSeconds: number;
  elapsedSeconds: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  activeTask: PomodoroTaskRecord | null;
  ambientNoise: 'rain' | 'clock' | 'cafe' | 'off';
  nextStageText?: string;
  onStartPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onFinishCountup: () => void;
  onToggleTimerType: (type: TimerType) => void;
  onToggleNoise: (type: 'rain' | 'clock' | 'cafe' | 'off') => void;
  onSelectTaskClick: () => void;
}

export const PomodoroTimerTab: React.FC<PomodoroTimerTabProps> = ({
  mode,
  timerType,
  timeLeftSeconds,
  elapsedSeconds,
  totalDurationSeconds,
  isRunning,
  activeTask,
  ambientNoise,
  nextStageText,
  onStartPause,
  onReset,
  onSkip,
  onFinishCountup,
  onToggleTimerType,
  onToggleNoise,
  onSelectTaskClick,
}) => {
  const isCountup = timerType === 'countup' && mode === 'focus';
  const displaySeconds = isCountup ? elapsedSeconds : timeLeftSeconds;

  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // 环形进度比率 (0 to 1)
  const targetDurationSeconds = totalDurationSeconds > 0 ? totalDurationSeconds : 25 * 60;
  let progressRatio = 0;
  if (isCountup) {
    // 正向计时：根据当前已耗时占目标时长的百分比递增
    progressRatio = Math.min(1, elapsedSeconds / targetDurationSeconds);
  } else {
    // 倒计时：根据剩余秒数逐渐递减
    progressRatio = totalDurationSeconds > 0 ? timeLeftSeconds / totalDurationSeconds : 0;
  }

  const isTargetReached = isCountup && elapsedSeconds >= targetDurationSeconds && targetDurationSeconds > 0;

  const strokeRadius = 90;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const modeTitle =
    mode === 'focus'
      ? isCountup
        ? '正向专注 (Count-up)'
        : '倒计时专注 (Focus)'
      : mode === 'short_break'
      ? 'Short Break 短休息'
      : 'Long Break 长休息';

  const modeColor = isCountup ? '#B45309' : mode === 'focus' ? '#2F614C' : '#4E7D96';
  const ringAccentColor = isTargetReached
    ? '#10B981'
    : isCountup
    ? '#D97706'
    : mode === 'focus'
    ? '#4E937A'
    : '#64A6BD';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px 14px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* 1. 顶部模式状态与倒计时/正向计时切换器 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: '17px',
            fontWeight: 800,
            color: modeColor,
            letterSpacing: '0.5px',
          }}
        >
          {modeTitle}
        </div>

        {/* 仅在专注阶段允许自由切换倒计时/正向计时 */}
        {mode === 'focus' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '3px',
              borderRadius: '20px',
              backgroundColor: 'rgba(215, 235, 220, 0.65)',
              boxShadow:
                'inset 1px 1px 3px rgba(160, 185, 170, 0.4), inset -1px -1px 3px rgba(255, 255, 255, 0.8)',
              marginTop: '2px',
            }}
          >
            <button
              type="button"
              disabled={isRunning}
              onClick={() => onToggleTimerType('countdown')}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: timerType === 'countdown' ? '#3A8259' : 'transparent',
                color: timerType === 'countdown' ? '#FFFFFF' : '#4E7D63',
                fontSize: '11px',
                fontWeight: 700,
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning && timerType !== 'countdown' ? 0.4 : 1,
                transition: 'all 0.2s ease',
              }}
              title={isRunning ? '计时运行中不可切换' : '切换为倒计时模式'}
            >
              ⏱️ 倒计时
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => onToggleTimerType('countup')}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: timerType === 'countup' ? '#D97706' : 'transparent',
                color: timerType === 'countup' ? '#FFFFFF' : '#4E7D63',
                fontSize: '11px',
                fontWeight: 700,
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning && timerType !== 'countup' ? 0.4 : 1,
                transition: 'all 0.2s ease',
              }}
              title={isRunning ? '计时运行中不可切换' : '切换为正向计时模式'}
            >
              ⏳ 正向计时
            </button>
          </div>
        )}
      </div>

      {/* 2. 核心大表盘（复刻极简环形大时钟） */}
      <div
        style={{
          position: 'relative',
          width: '210px',
          height: '210px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '10px 0',
        }}
      >
        {/* 轻拟物立体微凹底座 */}
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            backgroundColor: '#EDF5EE',
            boxShadow:
              'inset 6px 6px 14px rgba(165, 190, 175, 0.55), inset -6px -6px 14px rgba(255, 255, 255, 0.98), 8px 10px 24px rgba(170, 195, 180, 0.35)',
          }}
        />

        {/* SVG 圆环进度条 */}
        <svg
          width="210"
          height="210"
          style={{
            position: 'absolute',
            transform: 'rotate(-90deg)',
          }}
        >
          {/* 灰色轨道底环 */}
          <circle
            cx="105"
            cy="105"
            r={strokeRadius}
            fill="none"
            stroke="rgba(195, 218, 205, 0.45)"
            strokeWidth="10"
          />
          {/* 动态平滑进度环 */}
          <circle
            cx="105"
            cy="105"
            r={strokeRadius}
            fill="none"
            stroke={ringAccentColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: isRunning ? 'stroke-dashoffset 0.95s linear' : 'stroke-dashoffset 0.3s ease',
            }}
          />
        </svg>

        {/* 居中现代极简加粗计时大字 */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#283618',
              letterSpacing: '-0.5px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {timeFormatted}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: isTargetReached ? '#10B981' : isCountup ? '#B45309' : '#6A8A73',
              fontWeight: 700,
              marginTop: '-4px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            {isTargetReached ? (
              '🎯 目标达成'
            ) : isRunning ? (
              isCountup ? (
                `Counting (目标 ${Math.round(targetDurationSeconds / 60)}m)`
              ) : (
                'Running'
              )
            ) : (
              'Paused'
            )}
          </span>
        </div>
      </div>

      {/* 3. 基础控制按键组（左中右三粒胶囊控制键） */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          width: '100%',
        }}
      >
        {/* 启动 / 暂停 (长胶囊键) */}
        <button
          type="button"
          onClick={onStartPause}
          className="nm-btn"
          style={{
            width: '84px',
            height: '46px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#283618',
            backgroundColor: isRunning ? 'rgba(215, 235, 220, 0.95)' : '#EDF5EE',
            boxShadow: isRunning
              ? 'inset 3px 3px 7px rgba(160, 185, 170, 0.65), inset -3px -3px 7px rgba(255, 255, 255, 0.95)'
              : '4px 4px 10px rgba(160, 185, 170, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.65)',
            cursor: 'pointer',
          }}
          title={isRunning ? '暂停专注' : '开始专注'}
        >
          {isRunning ? <Pause size={20} fill="#283618" /> : <Play size={20} fill="#283618" />}
        </button>

        {/* 放弃 / 重置 (圆形按键) */}
        <button
          type="button"
          onClick={onReset}
          className="nm-btn nm-btn-circle"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6A8A73',
            backgroundColor: '#EDF5EE',
            border: '1px solid rgba(255, 255, 255, 0.65)',
            cursor: 'pointer',
          }}
          title="重置计时"
        >
          <RotateCcw size={18} />
        </button>

        {/* 右侧按键：如果是正向计时专注中，显示“完成结算”；如果是倒计时，显示“跳过” */}
        {isCountup ? (
          <button
            type="button"
            onClick={onFinishCountup}
            disabled={elapsedSeconds < 10}
            className="nm-btn"
            style={{
              padding: '0 16px',
              height: '46px',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: elapsedSeconds >= 10 ? '#FFFFFF' : '#6A8A73',
              backgroundColor: elapsedSeconds >= 10 ? '#10B981' : '#EDF5EE',
              boxShadow: elapsedSeconds >= 10
                ? '0 4px 12px rgba(16, 185, 129, 0.35)'
                : '4px 4px 10px rgba(160, 185, 170, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.65)',
              cursor: elapsedSeconds >= 10 ? 'pointer' : 'not-allowed',
              opacity: elapsedSeconds >= 10 ? 1 : 0.6,
              fontWeight: 800,
              fontSize: '12px',
            }}
            title={elapsedSeconds >= 10 ? '完成当前正向专注并结算' : '请至少专注 10 秒后结算'}
          >
            <Check size={16} strokeWidth={2.8} />
            <span>结算</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSkip}
            className="nm-btn"
            style={{
              width: '68px',
              height: '46px',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6A8A73',
              backgroundColor: '#EDF5EE',
              border: '1px solid rgba(255, 255, 255, 0.65)',
              cursor: 'pointer',
            }}
            title="跳过至下一阶段"
          >
            <SkipForward size={18} />
          </button>
        )}
      </div>

      {/* 4. 下一阶段预告 (Up next) */}
      <div
        style={{
          marginTop: '8px',
          fontSize: '11px',
          color: '#718E7B',
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        <span style={{ fontSize: '10px', opacity: 0.85 }}>
          {isCountup ? '正向模式说明' : '下一阶段预告'}
        </span>
        <div style={{ fontWeight: 700, fontSize: '12px', color: '#3A5A40' }}>
          {isCountup
            ? `自由专注积累，建议达成 ${Math.round(targetDurationSeconds / 60)} 分钟后结算`
            : nextStageText || (mode === 'focus' ? '05:00 短休息' : '25:00 深度专注')}
        </div>
      </div>

      {/* 5. 沉浸伴奏白噪音小面板 */}
      <div
        style={{
          marginTop: '8px',
          padding: '6px 10px',
          borderRadius: '16px',
          backgroundColor: 'rgba(235, 245, 238, 0.75)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: 'inset 1px 1px 3px rgba(160, 185, 170, 0.3), inset -1px -1px 3px rgba(255, 255, 255, 0.8)',
        }}
      >
        <span style={{ fontSize: '10px', color: '#6A8A73', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Volume2 size={12} /> 白噪音:
        </span>
        {[
          { key: 'off', label: '关' },
          { key: 'rain', label: '🌧️ 春雨' },
          { key: 'clock', label: '⏰ 滴答' },
          { key: 'cafe', label: '☕ 咖啡' },
        ].map((item) => {
          const isSelected = ambientNoise === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggleNoise(item.key as typeof ambientNoise)}
              style={{
                border: 'none',
                background: isSelected ? '#3A8259' : 'transparent',
                color: isSelected ? '#FFFFFF' : '#4E6655',
                padding: '3px 7px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
