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
