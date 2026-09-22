import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Target, Volume2 } from 'lucide-react';
import { PomodoroTaskRecord } from '../../../core/storage/db';

export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

interface PomodoroTimerTabProps {
  mode: PomodoroMode;
  timeLeftSeconds: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  activeTask: PomodoroTaskRecord | null;
  ambientNoise: 'rain' | 'clock' | 'cafe' | 'off';
  nextStageText?: string;
  onStartPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onToggleNoise: (type: 'rain' | 'clock' | 'cafe' | 'off') => void;
  onSelectTaskClick: () => void;
}

export const PomodoroTimerTab: React.FC<PomodoroTimerTabProps> = ({
  mode,
  timeLeftSeconds,
  totalDurationSeconds,
  isRunning,
  activeTask,
  ambientNoise,
  nextStageText,
  onStartPause,
  onReset,
  onSkip,
  onToggleNoise,
  onSelectTaskClick,
}) => {
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // 环形进度比率 (0 to 1)
  const progressRatio = totalDurationSeconds > 0 ? timeLeftSeconds / totalDurationSeconds : 0;
  const strokeRadius = 90;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const modeTitle =
    mode === 'focus' ? 'Focus 专注中' : mode === 'short_break' ? 'Short Break 短休息' : 'Long Break 长休息';
  const modeColor = mode === 'focus' ? '#2F614C' : '#4E7D96';
  const ringAccentColor = mode === 'focus' ? '#4E937A' : '#64A6BD';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px 14px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* 1. 顶部当前状态 */}
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
            fontSize: '18px',
            fontWeight: 800,
            color: modeColor,
            letterSpacing: '0.5px',
          }}
        >
          {modeTitle}
        </div>
      </div>

      {/* 2. 核心大表盘（复刻用户参考图中的极简环形大时钟） */}
      <div
        style={{
          position: 'relative',
          width: '210px',
          height: '210px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '14px 0',
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

        {/* 居中现代极简加粗倒计时 */}
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
              color: '#6A8A73',
              fontWeight: 600,
              marginTop: '-4px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {isRunning ? 'Running' : 'Paused'}
          </span>
        </div>
      </div>

      {/* 3. 基础控制按键组（参考用户图中左中右三粒胶囊控制键） */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
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
          title="放弃并重置当前阶段"
        >
          <RotateCcw size={18} />
        </button>

        {/* 手动跳过当前阶段 (长胶囊键) */}
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
      </div>

      {/* 4. 下一阶段预告 (Up next) */}
      <div
        style={{
          marginTop: '10px',
          fontSize: '11px',
          color: '#718E7B',
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        <span style={{ fontSize: '10px', opacity: 0.85 }}>下一阶段预告</span>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#3A5A40' }}>
          {nextStageText || (mode === 'focus' ? '05:00 短休息 (Short break)' : '25:00 深度专注 (Focus)')}
        </div>
      </div>

      {/* 5. 沉浸伴奏白噪音小面板 */}
      <div
        style={{
          marginTop: '10px',
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
                background: isSelected ? '#3A5A40' : 'transparent',
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
