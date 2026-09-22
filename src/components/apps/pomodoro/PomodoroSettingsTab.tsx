import React from 'react';
import { Volume2, Bell, Vibrate, RefreshCw, Zap, CheckCircle2, Sliders } from 'lucide-react';
import { playCompletionChime, playClickSound } from './soundSynthesizer';

export interface PomodoroSettings {
  focusDuration: number;     // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number;  // in minutes
  longBreakInterval: number;  // every N pomodoros
  autoStartBreak: boolean;
  autoStartNextPomodoro: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  ambientSoundDefault: 'none' | 'rain' | 'ticking' | 'cafe';
}

interface PomodoroSettingsTabProps {
  settings: PomodoroSettings;
  onUpdateSettings: (newSettings: Partial<PomodoroSettings>) => void;
}

const FOCUS_PRESETS = [15, 25, 30, 45, 50, 60];
const SHORT_BREAK_PRESETS = [3, 5, 10];
const LONG_BREAK_PRESETS = [15, 20, 30];

interface CustomDurationSectionProps {
  title: string;
  value: number;
  presets: number[];
  min: number;
  max: number;
  stepPresets?: number[];
  onSelect: (val: number) => void;
}

const CustomDurationSection: React.FC<CustomDurationSectionProps> = ({
  title,
  value,
  presets,
  min,
  max,
  stepPresets = [1, 5],
  onSelect,
}) => {
  const isPreset = presets.includes(value);

  const handleStep = (delta: number) => {
    playClickSound();
    const next = Math.max(min, Math.min(max, value + delta));
    onSelect(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      const clamped = Math.max(min, Math.min(max, val));
      onSelect(clamped);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 头部标题与当前值 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#446652', fontWeight: 600 }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {!isPreset && (
            <span
              style={{
                fontSize: '10px',
                color: '#3A8259',
                backgroundColor: 'rgba(215, 235, 220, 0.6)',
                padding: '1px 6px',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              自定义
            </span>
          )}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#245239',
              backgroundColor: 'rgba(215, 235, 220, 0.9)',
              padding: '2px 8px',
              borderRadius: '10px',
              border: '1px solid rgba(160, 185, 170, 0.45)',
            }}
          >
            {value} 分钟
          </span>
        </div>
      </div>

      {/* 常用预设选项胶囊 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${presets.length}, 1fr)`,
          gap: '6px',
        }}
      >
        {presets.map((dur) => {
          const isSelected = value === dur;
          return (
            <button
              key={dur}
              type="button"
              onClick={() => {
                playClickSound();
                onSelect(dur);
              }}
              style={{
                padding: '7px 0',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                transition: 'all 0.15s ease',
                backgroundColor: isSelected ? '#3A8259' : '#EDF5EE',
                color: isSelected ? '#FFFFFF' : '#4E7D63',
                boxShadow: isSelected
                  ? 'inset 2px 2px 5px rgba(25, 60, 40, 0.5), inset -2px -2px 5px rgba(255, 255, 255, 0.2)'
                  : '2px 2px 6px rgba(160, 185, 170, 0.45), -2px -2px 6px rgba(255, 255, 255, 0.9)',
              }}
            >
              {dur}
            </button>
          );
        })}
      </div>

      {/* 自定义微调控制器：+/- 步进与直接数字编辑 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(215, 235, 220, 0.45)',
          borderRadius: '12px',
          padding: '5px 8px',
          border: '1px solid rgba(160, 185, 170, 0.35)',
        }}
      >
        <span style={{ fontSize: '11px', color: '#527760', fontWeight: 600 }}>
          自定义微调:
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* -5 快捷微调 */}
          {stepPresets.includes(5) && (
            <button
              type="button"
              onClick={() => handleStep(-5)}
              disabled={value <= min}
              style={{
                padding: '3px 6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#EDF5EE',
                color: '#446652',
                fontSize: '10px',
                fontWeight: 700,
                cursor: value <= min ? 'not-allowed' : 'pointer',
                opacity: value <= min ? 0.4 : 1,
                boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.4)',
              }}
              title="减 5 分钟"
            >
              -5
            </button>
          )}

          {/* -1 微调按键 */}
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={value <= min}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: '#EDF5EE',
              color: '#345E44',
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: value <= min ? 'not-allowed' : 'pointer',
              opacity: value <= min ? 0.4 : 1,
              boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.4)',
            }}
          >
            -
          </button>

          {/* 数字直接输入框 */}
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={handleInputChange}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(160, 185, 170, 0.5)',
              backgroundColor: '#FFFFFF',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1E3D2A',
              outline: 'none',
              boxShadow: 'inset 1px 1px 3px rgba(160, 185, 170, 0.4)',
            }}
          />

          <span style={{ fontSize: '10px', color: '#557962', fontWeight: 600 }}>分</span>

          {/* +1 微调按键 */}
          <button
            type="button"
            onClick={() => handleStep(1)}
            disabled={value >= max}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: '#EDF5EE',
              color: '#345E44',
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: value >= max ? 'not-allowed' : 'pointer',
              opacity: value >= max ? 0.4 : 1,
              boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.4)',
            }}
          >
            +
          </button>

          {/* +5 快捷微调 */}
          {stepPresets.includes(5) && (
            <button
              type="button"
              onClick={() => handleStep(5)}
              disabled={value >= max}
              style={{
                padding: '3px 6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#EDF5EE',
                color: '#446652',
                fontSize: '10px',
                fontWeight: 700,
                cursor: value >= max ? 'not-allowed' : 'pointer',
                opacity: value >= max ? 0.4 : 1,
                boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.4)',
              }}
              title="加 5 分钟"
            >
              +5
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const PomodoroSettingsTab: React.FC<PomodoroSettingsTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const handleToggle = (key: keyof PomodoroSettings) => {
    playClickSound();
    onUpdateSettings({ [key]: !settings[key] });
  };

  const testAudio = () => {
    playCompletionChime();
    if (settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '14px 16px 20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        color: '#283618',
        userSelect: 'none',
      }}
    >
      {/* 标题 */}
      <div>
        <div style={{ fontSize: '17px', fontWeight: 800, color: '#244837', letterSpacing: '0.3px' }}>
          番茄钟偏好设置
        </div>
        <div style={{ fontSize: '11px', color: '#6A8A73', marginTop: '2px' }}>
          自由调整节奏与时长，打造最舒适的个人专注流
        </div>
      </div>

      {/* 模块1：节奏与时长（支持自定义输入与微调） */}
      <div
        style={{
          borderRadius: '16px',
          backgroundColor: '#EDF5EE',
          boxShadow: '4px 4px 10px rgba(160, 185, 170, 0.45), -4px -4px 10px rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          padding: '14px 14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2F614C', fontWeight: 700, fontSize: '13px' }}>
          <Zap size={15} color="#3A8259" />
          <span>节奏与时长 (支持自定义)</span>
        </div>

        {/* 专注时长自定义 */}
        <CustomDurationSection
          title="专注时长 (分钟)"
          value={settings.focusDuration}
          presets={FOCUS_PRESETS}
          min={1}
          max={180}
          stepPresets={[1, 5]}
          onSelect={(dur) => onUpdateSettings({ focusDuration: dur })}
        />

        {/* 短休息时长自定义 */}
        <CustomDurationSection
          title="短休息时长 (分钟)"
          value={settings.shortBreakDuration}
          presets={SHORT_BREAK_PRESETS}
          min={1}
          max={30}
          stepPresets={[1, 5]}
          onSelect={(dur) => onUpdateSettings({ shortBreakDuration: dur })}
        />

        {/* 长休息时长自定义 */}
        <CustomDurationSection
          title="长休息时长 (分钟)"
          value={settings.longBreakDuration}
          presets={LONG_BREAK_PRESETS}
          min={1}
          max={60}
          stepPresets={[1, 5]}
          onSelect={(dur) => onUpdateSettings({ longBreakDuration: dur })}
        />

        {/* 长休息触发间隔 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '6px',
            borderTop: '1px solid rgba(195, 218, 205, 0.45)',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#446652', fontWeight: 600 }}>长休息触发间隔</div>
            <div style={{ fontSize: '10px', color: '#6A8A73' }}>每完成几个番茄钟后享受长休息</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onUpdateSettings({ longBreakInterval: Math.max(2, settings.longBreakInterval - 1) });
              }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#EDF5EE',
                color: '#345E44',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.4)',
              }}
            >
              -
            </button>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#245239',
                backgroundColor: 'rgba(215, 235, 220, 0.8)',
                padding: '2px 8px',
                borderRadius: '8px',
              }}
            >
              每 {settings.longBreakInterval} 个
            </span>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onUpdateSettings({ longBreakInterval: Math.min(8, settings.longBreakInterval + 1) });
              }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#EDF5EE',
                color: '#345E44',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.4)',
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 模块2：自动流转 */}
      <div
        style={{
          borderRadius: '16px',
          backgroundColor: '#EDF5EE',
          boxShadow: '4px 4px 10px rgba(160, 185, 170, 0.45), -4px -4px 10px rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          padding: '14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2F614C', fontWeight: 700, fontSize: '13px' }}>
          <RefreshCw size={15} color="#3A8259" />
          <span>自动流转</span>
        </div>

        {/* 自动进休息 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '10px',
            borderBottom: '1px solid rgba(195, 218, 205, 0.45)',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#244837' }}>
              专注结束后自动进入休息
            </div>
            <div style={{ fontSize: '10px', color: '#6A8A73', marginTop: '1px' }}>
              无需手动点击，专注完成即刻开始倒数
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('autoStartBreak')}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              backgroundColor: settings.autoStartBreak ? '#3A8259' : '#C7D9CD',
              boxShadow: settings.autoStartBreak
                ? 'inset 1px 1px 3px rgba(20, 50, 30, 0.4)'
                : 'inset 1px 1px 3px rgba(130, 150, 135, 0.4)',
              transition: 'all 0.2s ease',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow: '1px 1px 4px rgba(0, 0, 0, 0.2)',
                transform: settings.autoStartBreak ? 'translateX(20px)' : 'translateX(0px)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </button>
        </div>

        {/* 自动进下一番茄 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '2px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#244837' }}>
              休息结束后自动开始下一番茄
            </div>
            <div style={{ fontSize: '10px', color: '#6A8A73', marginTop: '1px' }}>
              快速进入连续专注心流模式
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('autoStartNextPomodoro')}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              backgroundColor: settings.autoStartNextPomodoro ? '#3A8259' : '#C7D9CD',
              boxShadow: settings.autoStartNextPomodoro
                ? 'inset 1px 1px 3px rgba(20, 50, 30, 0.4)'
                : 'inset 1px 1px 3px rgba(130, 150, 135, 0.4)',
              transition: 'all 0.2s ease',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow: '1px 1px 4px rgba(0, 0, 0, 0.2)',
                transform: settings.autoStartNextPomodoro ? 'translateX(20px)' : 'translateX(0px)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </button>
        </div>
      </div>

      {/* 模块3：感官反馈 */}
      <div
        style={{
          borderRadius: '16px',
          backgroundColor: '#EDF5EE',
          boxShadow: '4px 4px 10px rgba(160, 185, 170, 0.45), -4px -4px 10px rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          padding: '14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2F614C', fontWeight: 700, fontSize: '13px' }}>
            <Bell size={15} color="#3A8259" />
            <span>感官反馈与提示</span>
          </div>
          <button
            type="button"
            onClick={testAudio}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              backgroundColor: 'rgba(215, 235, 220, 0.75)',
              color: '#276743',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.35)',
            }}
          >
            <Volume2 size={12} />
            测试提示音
          </button>
        </div>

        {/* 音效开关 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '10px',
            borderBottom: '1px solid rgba(195, 218, 205, 0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={15} color="#527460" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#244837' }}>
              阶段完成音效提示 (空灵风铃)
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('soundEnabled')}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: settings.soundEnabled ? '#3A8259' : '#C7D9CD',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow: '1px 1px 4px rgba(0, 0, 0, 0.2)',
                transform: settings.soundEnabled ? 'translateX(20px)' : 'translateX(0px)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </button>
        </div>

        {/* 振动反馈 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Vibrate size={15} color="#527460" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#244837' }}>
              触觉马达振动反馈
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('vibrationEnabled')}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: settings.vibrationEnabled ? '#3A8259' : '#C7D9CD',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow: '1px 1px 4px rgba(0, 0, 0, 0.2)',
                transform: settings.vibrationEnabled ? 'translateX(20px)' : 'translateX(0px)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </button>
        </div>
      </div>

      {/* 提示卡片 */}
      <div
        style={{
          borderRadius: '14px',
          backgroundColor: 'rgba(215, 235, 220, 0.55)',
          border: '1px solid rgba(160, 185, 170, 0.4)',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          color: '#385845',
          fontSize: '11px',
          lineHeight: 1.5,
        }}
      >
        <CheckCircle2 size={16} color="#3A8259" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <span style={{ fontWeight: 700, color: '#1B3D2B' }}>IndexedDB 本地储存运行中</span>
          <p style={{ margin: '2px 0 0', color: '#4E735B' }}>
            无需网络连接，所有已完成及放弃的专注会话都将实时安全归档至本地数据库。
          </p>
        </div>
      </div>
    </div>
  );
};
