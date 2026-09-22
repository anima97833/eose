import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, CheckSquare, BarChart3, Settings, ArrowLeft, Target, X, ChevronRight } from 'lucide-react';
import { PomodoroTimerTab, PomodoroMode } from './PomodoroTimerTab';
import { PomodoroTasksTab } from './PomodoroTasksTab';
import { PomodoroAnalyticsTab } from './PomodoroAnalyticsTab';
import { PomodoroSettingsTab, PomodoroSettings } from './PomodoroSettingsTab';
import {
  playCompletionChime,
  playClickSound,
  startAmbientNoise,
  stopAmbientNoise,
} from './soundSynthesizer';
import {
  initPomodoroTasksIfEmpty,
  recordPomodoroSession,
} from './pomodoroStorage';
import { settlePomodoroFocus, settlePomodoroBreak } from '../../../core/rpg/rpgStorage';
import { db, PomodoroTaskRecord } from '../../../core/storage/db';

interface PomodoroAppProps {
  onBack?: () => void;
}

type TabType = 'timer' | 'tasks' | 'analytics' | 'settings';

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartNextPomodoro: false,
  soundEnabled: true,
  vibrationEnabled: true,
  ambientSoundDefault: 'none',
};

export const PomodoroApp: React.FC<PomodoroAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('timer');
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedPomodorosInCycle, setCompletedPomodorosInCycle] = useState<number>(0);
  
  // 任务管理与选择
  const [tasks, setTasks] = useState<PomodoroTaskRecord[]>([]);
  const [activeTask, setActiveTask] = useState<PomodoroTaskRecord | null>(null);
  const [isTaskExpanded, setIsTaskExpanded] = useState<boolean>(false);

  // 白噪音状态 ('rain' | 'clock' | 'cafe' | 'off')
  const [ambientNoise, setAmbientNoise] = useState<'rain' | 'clock' | 'cafe' | 'off'>('off');

  // 用户设置
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    try {
      const saved = localStorage.getItem('pomodoro_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // 获取各阶段秒数
  const getModeDurationSeconds = useCallback(
    (currentMode: PomodoroMode): number => {
      switch (currentMode) {
        case 'focus':
          return settings.focusDuration * 60;
        case 'short_break':
          return settings.shortBreakDuration * 60;
        case 'long_break':
          return settings.longBreakDuration * 60;
      }
    },
    [settings]
  );

  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(() =>
    settings.focusDuration * 60
  );
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() =>
    settings.focusDuration * 60
  );

  // 加载任务
  const refreshTasks = useCallback(async () => {
    try {
      const loaded = await initPomodoroTasksIfEmpty();
      setTasks(loaded);
      // 如果当前绑定的任务已更新，同步 activeTask
      if (activeTask) {
        const found = loaded.find((t) => t.id === activeTask.id);
        if (found) {
          setActiveTask(found);
        }
      } else if (loaded.length > 0) {
        const firstUncompleted = loaded.find((t) => !t.isCompleted);
        if (firstUncompleted) setActiveTask(firstUncompleted);
      }
    } catch (err) {
      console.error('Failed to load pomodoro tasks', err);
    }
  }, [activeTask]);

  useEffect(() => {
    refreshTasks();
  }, []);

  // 更新设置
  const handleUpdateSettings = (newSettings: Partial<PomodoroSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      localStorage.setItem('pomodoro_settings', JSON.stringify(merged));
    } catch {
      // ignore
    }

    if (!isRunning) {
      if (newSettings.focusDuration && mode === 'focus') {
        const sec = newSettings.focusDuration * 60;
        setTotalDurationSeconds(sec);
        setTimeLeftSeconds(sec);
      } else if (newSettings.shortBreakDuration && mode === 'short_break') {
        const sec = newSettings.shortBreakDuration * 60;
        setTotalDurationSeconds(sec);
        setTimeLeftSeconds(sec);
      } else if (newSettings.longBreakDuration && mode === 'long_break') {
        const sec = newSettings.longBreakDuration * 60;
        setTotalDurationSeconds(sec);
        setTimeLeftSeconds(sec);
      }
    }
  };

  // 白噪音伴奏启停控制
  const handleToggleNoise = (type: 'rain' | 'clock' | 'cafe' | 'off') => {
    playClickSound();
    setAmbientNoise(type);
    if (type === 'off') {
      stopAmbientNoise();
    } else {
      startAmbientNoise(type);
    }
  };

  // 退出或停止倒计时时处理白噪音
  useEffect(() => {
    if (!isRunning && ambientNoise !== 'off') {
      // 专注暂停时保持静音，专注运行时恢复
      stopAmbientNoise();
    } else if (isRunning && ambientNoise !== 'off') {
      startAmbientNoise(ambientNoise);
    }
    return () => {
      stopAmbientNoise();
    };
  }, [isRunning, ambientNoise]);

  const [rpgNotice, setRpgNotice] = useState<string | null>(null);

  const showRpgNotice = (text: string) => {
    setRpgNotice(text);
    setTimeout(() => setRpgNotice(null), 3000);
  };

  // 阶段完成自动流转与 IndexedDB 保存
  const handleStageCompleted = useCallback(async () => {
    // 1. 感官反馈提示
    if (settings.soundEnabled) {
      playCompletionChime();
    }
    if (settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 150]);
    }

    // 2. 如果是专注阶段，存入 IndexedDB
    if (mode === 'focus') {
      const plannedMin = Math.round(totalDurationSeconds / 60);
      try {
        await recordPomodoroSession({
          taskId: activeTask?.id,
          taskTitle: activeTask?.title,
          category: activeTask?.category || 'work',
          mode: 'focus',
          durationMinutes: plannedMin,
          actualSeconds: totalDurationSeconds,
          isCompleted: true,
          completedAt: Date.now(),
        });
        await refreshTasks();
      } catch (err) {
        console.error('Failed to record pomodoro session in IndexedDB', err);
      }

      // 后台 RPG 区间随机结算
      try {
        const settle = settlePomodoroFocus(activeTask?.difficulty, activeTask?.targetAttr);
        if (settle.leveledUp) {
          showRpgNotice('角色升级');
        } else if (settle.clearedDebuff) {
          showRpgNotice('拖延已破除');
        } else {
          const attrMap: Record<string, string> = {
            STR: '力量', DEX: '敏捷', INT: '智力', SPI: '精神', CON: '体质', CHA: '魅力'
          };
          showRpgNotice(`${attrMap[settle.attrKey] || '属性'}+${settle.attrGain}`);
        }
      } catch (err) {
        console.warn('RPG settlement error', err);
      }

      const nextCycleCount = completedPomodorosInCycle + 1;
      setCompletedPomodorosInCycle(nextCycleCount);

      // 决定下一步是短休息还是长休息
      const isLongBreak = nextCycleCount % settings.longBreakInterval === 0;
      const nextMode: PomodoroMode = isLongBreak ? 'long_break' : 'short_break';
      const nextSec = getModeDurationSeconds(nextMode);

      setMode(nextMode);
      setTotalDurationSeconds(nextSec);
      setTimeLeftSeconds(nextSec);
      setIsRunning(settings.autoStartBreak);
    } else {
      // 休息阶段完成 -> RPG 恢复结算
      try {
        const bSettle = settlePomodoroBreak(mode === 'long_break');
        showRpgNotice(`精力+${bSettle.mpRecover}`);
      } catch (err) {
        console.warn('RPG break settlement error', err);
      }

      // 进入下一轮专注
      const nextSec = getModeDurationSeconds('focus');
      setMode('focus');
      setTotalDurationSeconds(nextSec);
      setTimeLeftSeconds(nextSec);
      setIsRunning(settings.autoStartNextPomodoro);
    }
  }, [
    mode,
    totalDurationSeconds,
    activeTask,
    completedPomodorosInCycle,
    settings,
    getModeDurationSeconds,
    refreshTasks,
  ]);

  // 核心计时 Interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            handleStageCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, handleStageCompleted]);

  // 控制按钮动作
  const handleStartPause = () => {
    playClickSound();
    setIsRunning((prev) => !prev);
  };

  const handleReset = async () => {
    playClickSound();
    const elapsedSeconds = totalDurationSeconds - timeLeftSeconds;
    // 如果是专注阶段且已经坚持超过 1 分钟，记录为中途取消会话保存到 IndexedDB
    if (mode === 'focus' && elapsedSeconds >= 60) {
      const actualMin = Math.max(1, Math.round(elapsedSeconds / 60));
      try {
        await recordPomodoroSession({
          taskId: activeTask?.id,
          taskTitle: activeTask?.title,
          category: activeTask?.category || 'work',
          mode: 'focus',
          durationMinutes: Math.round(totalDurationSeconds / 60),
          actualSeconds: elapsedSeconds,
          isCompleted: false,
          completedAt: Date.now(),
        });
        await refreshTasks();
      } catch (err) {
        console.error('Failed to log abandoned session', err);
      }
    }

    setIsRunning(false);
    setTimeLeftSeconds(totalDurationSeconds);
  };

  const handleSkip = () => {
    playClickSound();
    setIsRunning(false);
    if (mode === 'focus') {
      const isLongBreak = (completedPomodorosInCycle + 1) % settings.longBreakInterval === 0;
      const nextMode: PomodoroMode = isLongBreak ? 'long_break' : 'short_break';
      const sec = getModeDurationSeconds(nextMode);
      setMode(nextMode);
      setTotalDurationSeconds(sec);
      setTimeLeftSeconds(sec);
    } else {
      const sec = getModeDurationSeconds('focus');
      setMode('focus');
      setTotalDurationSeconds(sec);
      setTimeLeftSeconds(sec);
    }
  };

  const handleSelectTaskFromList = (task: PomodoroTaskRecord | null) => {
    playClickSound();
    setActiveTask(task);
    setActiveTab('timer'); // 切换到主计时界面
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#EDF5EE',
        color: '#283618',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* 顶部标题栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px 8px',
          backgroundColor: '#EDF5EE',
          borderBottom: '1px solid rgba(195, 218, 205, 0.4)',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => {
            playClickSound();
            stopAmbientNoise();
            onBack?.();
          }}
          className="nm-btn nm-btn-circle"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4E7D63',
            backgroundColor: '#EDF5EE',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
          }}
          title="返回桌面"
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isRunning ? '#3A8259' : '#88AA95',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#244837', letterSpacing: '0.5px' }}>
            番茄钟
          </span>
        </div>

        {/* 极简 RPG 浮层通知（<=5字） */}
        {rpgNotice && (
          <div
            onClick={() => setRpgNotice(null)}
            style={{
              position: 'absolute',
              top: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 999,
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '1.5px solid #f59e0b',
              color: '#92400e',
              padding: '4px 14px',
              borderRadius: '14px',
              fontSize: '11px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>✨</span>
            <span>{rpgNotice}</span>
          </div>
        )}

        {/* 右侧目标胶囊（平时是图标，点击后展开） */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setIsTaskExpanded((prev) => !prev);
            }}
            className="nm-btn nm-btn-circle"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTask ? '#276743' : '#6A8A73',
              backgroundColor: isTaskExpanded ? 'rgba(215, 235, 220, 0.95)' : '#EDF5EE',
              boxShadow: isTaskExpanded
                ? 'inset 2px 2px 5px rgba(160, 185, 170, 0.65), inset -2px -2px 5px rgba(255, 255, 255, 0.9)'
                : '2px 2px 6px rgba(160, 185, 170, 0.45), -2px -2px 6px rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              position: 'relative',
            }}
            title={activeTask ? `当前目标: ${activeTask.title} (点击展开)` : '指定专注任务 (点击展开)'}
          >
            <Target size={17} />
            {activeTask && (
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  right: '3px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#3A8259',
                  border: '1.5px solid #EDF5EE',
                }}
              />
            )}
          </button>

          {/* 点击外部遮罩 */}
          {isTaskExpanded && (
            <div
              onClick={() => setIsTaskExpanded(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 40,
              }}
            />
          )}

          {/* 展开的轻拟物悬浮胶囊卡片 */}
          {isTaskExpanded && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                right: '0px',
                width: '230px',
                backgroundColor: '#EDF5EE',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '6px 8px 22px rgba(140, 170, 150, 0.5), -4px -4px 12px rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.85)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#6A8A73', fontWeight: 700 }}>
                  当前专注任务
                </span>
                <button
                  type="button"
                  onClick={() => setIsTaskExpanded(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#8CA695',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {activeTask ? (
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1E3D2A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    🎯 {activeTask.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5B7A66', marginTop: '3px' }}>
                    已完成: {activeTask.completedPoms}/{activeTask.estimatedPoms} 🍅 ({activeTask.categoryLabel || '工作'})
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.55)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    fontSize: '11px',
                    color: '#6A8A73',
                    textAlign: 'center',
                  }}
                >
                  暂未关联任何专注任务
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsTaskExpanded(false);
                    setActiveTab('tasks');
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#3A8259',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '1px 2px 5px rgba(35, 75, 50, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                  }}
                >
                  <span>{activeTask ? '切换任务' : '选择任务'}</span>
                  <ChevronRight size={12} />
                </button>

                {activeTask && (
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveTask(null);
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'rgba(215, 235, 222, 0.8)',
                      color: '#557962',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    解除
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主视图区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {activeTab === 'timer' && (
          <PomodoroTimerTab
            mode={mode}
            timeLeftSeconds={timeLeftSeconds}
            totalDurationSeconds={totalDurationSeconds}
            isRunning={isRunning}
            activeTask={activeTask}
            ambientNoise={ambientNoise}
            nextStageText={
              mode === 'focus'
                ? (completedPomodorosInCycle + 1) % settings.longBreakInterval === 0
                  ? `${String(settings.longBreakDuration).padStart(2, '0')}:00 长休息 (Long break)`
                  : `${String(settings.shortBreakDuration).padStart(2, '0')}:00 短休息 (Short break)`
                : `${String(settings.focusDuration).padStart(2, '0')}:00 深度专注 (Focus)`
            }
            onStartPause={handleStartPause}
            onReset={handleReset}
            onSkip={handleSkip}
            onToggleNoise={handleToggleNoise}
            onSelectTaskClick={() => {
              playClickSound();
              setActiveTab('tasks');
            }}
          />
        )}

        {activeTab === 'tasks' && (
          <PomodoroTasksTab
            tasks={tasks}
            activeTaskId={activeTask?.id || null}
            onSelectTask={handleSelectTaskFromList}
            onRefreshTasks={refreshTasks}
          />
        )}

        {activeTab === 'analytics' && <PomodoroAnalyticsTab />}

        {activeTab === 'settings' && (
          <PomodoroSettingsTab
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </div>

      {/* 底部 Tab 栏 (Neumorphic Tabs) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: '56px',
          backgroundColor: '#EDF5EE',
          borderTop: '1px solid rgba(195, 218, 205, 0.45)',
          boxShadow: '0 -4px 14px rgba(160, 185, 170, 0.12)',
          flexShrink: 0,
          zIndex: 20,
          padding: '0 8px',
        }}
      >
        {/* 计时 Tab */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setIsTaskExpanded(false);
            setActiveTab('timer');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            width: '64px',
            height: '42px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'timer' ? 'rgba(215, 235, 220, 0.7)' : 'transparent',
            boxShadow:
              activeTab === 'timer'
                ? 'inset 2px 2px 5px rgba(160, 185, 170, 0.55), inset -2px -2px 5px rgba(255, 255, 255, 0.9)'
                : 'none',
            color: activeTab === 'timer' ? '#244837' : '#739580',
            fontWeight: activeTab === 'timer' ? 700 : 500,
            transition: 'all 0.15s ease',
          }}
        >
          <Clock size={17} />
          <span style={{ fontSize: '10px' }}>计时</span>
        </button>

        {/* 任务 Tab */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setIsTaskExpanded(false);
            setActiveTab('tasks');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            width: '64px',
            height: '42px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'tasks' ? 'rgba(215, 235, 220, 0.7)' : 'transparent',
            boxShadow:
              activeTab === 'tasks'
                ? 'inset 2px 2px 5px rgba(160, 185, 170, 0.55), inset -2px -2px 5px rgba(255, 255, 255, 0.9)'
                : 'none',
            color: activeTab === 'tasks' ? '#244837' : '#739580',
            fontWeight: activeTab === 'tasks' ? 700 : 500,
            transition: 'all 0.15s ease',
          }}
        >
          <CheckSquare size={17} />
          <span style={{ fontSize: '10px' }}>任务</span>
        </button>

        {/* 统计 Tab */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setIsTaskExpanded(false);
            setActiveTab('analytics');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            width: '64px',
            height: '42px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'analytics' ? 'rgba(215, 235, 220, 0.7)' : 'transparent',
            boxShadow:
              activeTab === 'analytics'
                ? 'inset 2px 2px 5px rgba(160, 185, 170, 0.55), inset -2px -2px 5px rgba(255, 255, 255, 0.9)'
                : 'none',
            color: activeTab === 'analytics' ? '#244837' : '#739580',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            transition: 'all 0.15s ease',
          }}
        >
          <BarChart3 size={17} />
          <span style={{ fontSize: '10px' }}>统计</span>
        </button>

        {/* 设置 Tab */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setIsTaskExpanded(false);
            setActiveTab('settings');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            width: '64px',
            height: '42px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'settings' ? 'rgba(215, 235, 220, 0.7)' : 'transparent',
            boxShadow:
              activeTab === 'settings'
                ? 'inset 2px 2px 5px rgba(160, 185, 170, 0.55), inset -2px -2px 5px rgba(255, 255, 255, 0.9)'
                : 'none',
            color: activeTab === 'settings' ? '#244837' : '#739580',
            fontWeight: activeTab === 'settings' ? 700 : 500,
            transition: 'all 0.15s ease',
          }}
        >
          <Settings size={17} />
          <span style={{ fontSize: '10px' }}>设置</span>
        </button>
      </div>
    </div>
  );
};
