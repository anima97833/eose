import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  pocketAudio,
  SoundpackId,
  PAD_DEFINITIONS,
  PadDefinition,
} from './pocketPadAudio';
import { fetchColormindPalette, rgbToHex } from '../../../core/theme/colormindService';
import {
  ArrowLeft,
  VolumeX,
  Zap,
  Sliders,
  Sparkles,
  Circle,
  Repeat,
  Flame,
  Palette,
  RotateCw,
} from 'lucide-react';

interface PocketPadAppProps {
  onBack: () => void;
}

interface RecordedNote {
  padId: number;
  timeMs: number;
}

interface PocketPadTheme {
  bg: string;
  panelBg: string;
  cardBg: string;
  accent: string;
  accent2: string;
  palette: string[];
}

const DEFAULT_THEME: PocketPadTheme = {
  bg: '#12141a',
  panelBg: '#1a1d26',
  cardBg: '#181b24',
  accent: '#00ff88',
  accent2: '#38bdf8',
  palette: ['#ff3366', '#00ff88', '#38bdf8', '#ffd000', '#a200ff'],
};

export const PocketPadApp: React.FC<PocketPadAppProps> = ({ onBack }) => {
  const [pack, setPack] = useState<SoundpackId>('cyber');
  const [activePadIds, setActivePadIds] = useState<Set<number>>(new Set());
  const [loopingPadIds, setLoopingPadIds] = useState<Set<number>>(new Set());
  // 'loop' = 点击开启循环; 'oneshot' = 单发点击
  const [padMode, setPadMode] = useState<'loop' | 'oneshot'>('loop');

  const [currentLoopStep, setCurrentLoopStep] = useState<number>(-1);
  const [bpm, setBpm] = useState<number>(124);
  const [filterMode, setFilterMode] = useState<'open' | 'warm' | 'muffled'>('open');
  const [driveEnabled, setDriveEnabled] = useState<boolean>(false);
  const [lightshowMode, setLightshowMode] = useState<'ripple' | 'flash'>('ripple');

  // Colormind 拟物与仪表盘配色
  const [theme, setTheme] = useState<PocketPadTheme>(() => {
    try {
      const saved = localStorage.getItem('pocketpad_colormind_theme_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_THEME;
  });
  const [isRollingColor, setIsRollingColor] = useState(false);

  // 演奏录制与回放
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState<boolean>(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const playbackTimersRef = useRef<number[]>([]);

  // 最近触发提示
  const [lastTriggeredName, setLastTriggeredName] = useState<string>('READY');

  const pads: PadDefinition[] = PAD_DEFINITIONS[pack];

  // ================= Colormind 自由配色换肤 =================
  const handleRollColormind = async () => {
    try {
      setIsRollingColor(true);
      const rgbList = await fetchColormindPalette({ model: 'ui' });
      if (rgbList && rgbList.length >= 5) {
        const hexes = rgbList.map(rgbToHex);
        const newTheme: PocketPadTheme = {
          bg: '#111319',
          panelBg: '#181b24',
          cardBg: '#151821',
          accent: hexes[1] || '#00ff88',
          accent2: hexes[2] || '#38bdf8',
          palette: [
            hexes[0] || '#ff3366',
            hexes[1] || '#00ff88',
            hexes[2] || '#38bdf8',
            hexes[3] || '#ffd000',
            hexes[4] || '#a200ff',
          ],
        };
        setTheme(newTheme);
        localStorage.setItem('pocketpad_colormind_theme_v2', JSON.stringify(newTheme));
      }
    } catch {
      // ignore
    } finally {
      setIsRollingColor(false);
    }
  };

  // 16 步时钟步进回调
  const handleStepTick = useCallback((step: number, triggeredPads: number[]) => {
    setCurrentLoopStep(step);
    if (triggeredPads && triggeredPads.length > 0) {
      setActivePadIds((prev) => {
        const next = new Set(prev);
        triggeredPads.forEach((id) => next.add(id));
        return next;
      });
      setTimeout(() => {
        setActivePadIds((prev) => {
          const next = new Set(prev);
          triggeredPads.forEach((id) => next.delete(id));
          return next;
        });
      }, 100);
    }
  }, []);

  // 波纹光效
  const triggerRippleEffect = useCallback((padId: number) => {
    if (lightshowMode !== 'ripple') return;
    const row = Math.floor(padId / 4);
    const col = padId % 4;
    const neighbors: number[] = [];
    if (col > 0) neighbors.push(padId - 1);
    if (col < 3) neighbors.push(padId + 1);
    if (row > 0) neighbors.push(padId - 4);
    if (row < 3) neighbors.push(padId + 4);

    setTimeout(() => {
      setActivePadIds((prev) => {
        const next = new Set(prev);
        neighbors.forEach((n) => next.add(n));
        return next;
      });
      setTimeout(() => {
        setActivePadIds((prev) => {
          const next = new Set(prev);
          neighbors.forEach((n) => next.delete(n));
          return next;
        });
      }, 80);
    }, 40);
  }, [lightshowMode]);

  // ================= 按键点击处理 =================
  const handlePadInteraction = useCallback(
    (padId: number, isDirectUserHit = true) => {
      const targetPad = pads[padId];
      if (targetPad) {
        setLastTriggeredName(`${targetPad.name} [${targetPad.keyLabel}]`);
      }

      if (isDirectUserHit && isRecording) {
        const timeOffset = Date.now() - recordStartTimeRef.current;
        setRecordedNotes((prev) => [...prev, { padId, timeMs: timeOffset }]);
      }

      setActivePadIds((prev) => {
        const next = new Set(prev);
        next.add(padId);
        return next;
      });
      setTimeout(() => {
        setActivePadIds((prev) => {
          const next = new Set(prev);
          next.delete(padId);
          return next;
        });
      }, 110);

      triggerRippleEffect(padId);

      if (padMode === 'loop') {
        pocketAudio.togglePadLoop(padId, pack, handleStepTick);
        const activeLoops = pocketAudio.getActiveLoops();
        setLoopingPadIds(new Set(activeLoops));
      } else {
        pocketAudio.triggerPad(padId, pack);
      }
    },
    [pack, pads, isRecording, padMode, triggerRippleEffect, handleStepTick]
  );

  // 键盘快捷键监听 (PC 16键)
  useEffect(() => {
    const keyMap: Record<string, number> = {
      '1': 0, '2': 1, '3': 2, '4': 3,
      'q': 4, 'w': 5, 'e': 6, 'r': 7,
      'a': 8, 's': 9, 'd': 10, 'f': 11,
      'z': 12, 'x': 13, 'c': 14, 'v': 15,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key in keyMap) {
        e.preventDefault();
        handlePadInteraction(keyMap[key]);
      } else if (key === ' ') {
        e.preventDefault();
        if (loopingPadIds.size > 0) {
          handleMuteAll();
        } else {
          handlePresetRhythm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePadInteraction, loopingPadIds]);

  // 控制操作
  const handleMuteAll = () => {
    pocketAudio.clearAllLoops();
    setLoopingPadIds(new Set());
    setCurrentLoopStep(-1);
  };

  const handlePresetRhythm = () => {
    pocketAudio.activateDefaultRhythm(pack, handleStepTick);
    setLoopingPadIds(new Set([0, 1, 3]));
  };

  const handleBpmChange = (delta: number) => {
    const nextBpm = Math.max(70, Math.min(170, bpm + delta));
    setBpm(nextBpm);
    pocketAudio.setBpm(nextBpm);
    if (pocketAudio.isLooping()) {
      pocketAudio.startLoop(pack, handleStepTick);
    }
  };

  const handleSoundpackChange = (newPack: SoundpackId) => {
    setPack(newPack);
    const defaultBpms: Record<SoundpackId, number> = {
      cyber: 124,
      lofi: 88,
      arcade: 136,
    };
    const targetBpm = defaultBpms[newPack];
    setBpm(targetBpm);
    pocketAudio.setBpm(targetBpm);

    if (pocketAudio.isLooping()) {
      pocketAudio.startLoop(newPack, handleStepTick);
    }
  };

  const handleFilterChange = (mode: 'open' | 'warm' | 'muffled') => {
    setFilterMode(mode);
    const cutoffs = {
      open: 19000,
      warm: 3200,
      muffled: 750,
    };
    pocketAudio.setFilterCutoff(cutoffs[mode]);
  };

  const toggleDrive = () => {
    const next = !driveEnabled;
    setDriveEnabled(next);
    pocketAudio.setDrive(next);
  };

  // 录音
  const startRecording = () => {
    if (isPlayingRecording) stopPlayback();
    setRecordedNotes([]);
    recordStartTimeRef.current = Date.now();
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const playRecordedBeat = () => {
    if (recordedNotes.length === 0) return;
    if (isRecording) stopRecording();
    stopPlayback();

    setIsPlayingRecording(true);
    const lastNoteTime = recordedNotes[recordedNotes.length - 1].timeMs;

    recordedNotes.forEach((note) => {
      const tid = window.setTimeout(() => {
        handlePadInteraction(note.padId, false);
      }, note.timeMs);
      playbackTimersRef.current.push(tid);
    });

    const loopTid = window.setTimeout(() => {
      setIsPlayingRecording(false);
    }, lastNoteTime + 500);
    playbackTimersRef.current.push(loopTid);
  };

  const stopPlayback = () => {
    playbackTimersRef.current.forEach((id) => clearTimeout(id));
    playbackTimersRef.current = [];
    setIsPlayingRecording(false);
  };

  useEffect(() => {
    return () => {
      pocketAudio.stopLoop();
      stopPlayback();
    };
  }, []);

  const isAnyLooping = loopingPadIds.size > 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.bg,
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 顶部拟物硬件钛合金装饰条 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: `linear-gradient(180deg, ${theme.panelBg} 0%, ${theme.bg} 100%)`,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          zIndex: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(145deg, #1e222d, #141720)',
            boxShadow: '2px 2px 5px #0a0c11, -1px -1px 3px rgba(255,255,255,0.06)',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isAnyLooping ? theme.accent : theme.accent2,
              boxShadow: `0 0 10px ${isAnyLooping ? theme.accent : theme.accent2}`,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 2,
              color: '#f8fafc',
            }}
          >
            POCKET PAD
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: 4,
              backgroundColor: isAnyLooping ? `${theme.accent}22` : 'rgba(255,255,255,0.07)',
              color: isAnyLooping ? theme.accent : '#94a3b8',
              border: isAnyLooping ? `1px solid ${theme.accent}66` : 'none',
            }}
          >
            {isAnyLooping ? `${loopingPadIds.size} LOOP` : '16-MPC'}
          </span>
        </div>

        {/* 右侧：Colormind 换肤与光效切换 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={handleRollColormind}
            disabled={isRollingColor}
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
              border: 'none',
              background: 'linear-gradient(145deg, #1e222d, #141720)',
              boxShadow: '2px 2px 5px #0a0c11',
              color: theme.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Colormind AI 换肤"
          >
            <Palette size={14} className={isRollingColor ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setLightshowMode((m) => (m === 'ripple' ? 'flash' : 'ripple'))}
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
              border: 'none',
              background: 'linear-gradient(145deg, #1e222d, #141720)',
              boxShadow: '2px 2px 5px #0a0c11',
              color: lightshowMode === 'ripple' ? theme.accent2 : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="光效切换"
          >
            <Sparkles size={14} />
          </button>
        </div>
      </div>

      {/* 控制台操作区域 */}
      <div
        style={{
          padding: '8px 12px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          backgroundColor: theme.panelBg,
        }}
      >
        {/* 声乐套件选择胶囊 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            background: '#0d0f14',
            padding: 4,
            borderRadius: 10,
            boxShadow: 'inset 2px 2px 5px #05070a',
          }}
        >
          {(
            [
              { id: 'cyber', label: '⚡ CYBER 808', color: theme.palette[0] || '#ff3366' },
              { id: 'lofi', label: '☕ LO-FI BEAT', color: theme.palette[3] || '#d97736' },
              { id: 'arcade', label: '👾 8-BIT RETRO', color: theme.palette[1] || '#00e1d9' },
            ] as const
          ).map((item) => {
            const isSelected = pack === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSoundpackChange(item.id)}
                style={{
                  border: 'none',
                  padding: '7px 4px',
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: 0.5,
                  transition: 'all 0.15s ease',
                  background: isSelected
                    ? `linear-gradient(135deg, ${item.color}22, ${item.color}44)`
                    : 'transparent',
                  color: isSelected ? item.color : '#64748b',
                  boxShadow: isSelected ? `0 0 10px ${item.color}44` : 'none',
                  borderBottom: isSelected ? `2px solid ${item.color}` : '2px solid transparent',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* 紧凑按钮控制栏（彻底消除换行与大段文字） */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 5,
          }}
        >
          {/* 模式按键：极简紧凑图标+英文标签 */}
          <button
            onClick={() => setPadMode((m) => (m === 'loop' ? 'oneshot' : 'loop'))}
            style={{
              height: 32,
              padding: '0 8px',
              borderRadius: 7,
              border: padMode === 'loop' ? `1px solid ${theme.accent}` : '1px solid rgba(255,255,255,0.08)',
              background: padMode === 'loop' ? `${theme.accent}22` : 'linear-gradient(145deg, #1e222d, #141720)',
              color: padMode === 'loop' ? theme.accent : '#94a3b8',
              boxShadow: padMode === 'loop' ? `0 0 10px ${theme.accent}44` : '2px 2px 4px #0a0c11',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 900,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Repeat size={12} />
            <span>{padMode === 'loop' ? 'LOOP' : 'SHOT'}</span>
          </button>

          {/* 全停 / 预设 */}
          {isAnyLooping ? (
            <button
              onClick={handleMuteAll}
              style={{
                height: 32,
                padding: '0 8px',
                borderRadius: 7,
                border: '1px solid #ef4444',
                background: '#ef444433',
                color: '#fca5a5',
                boxShadow: '0 0 8px #ef444455',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10,
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <VolumeX size={12} />
              <span>STOP ({loopingPadIds.size})</span>
            </button>
          ) : (
            <button
              onClick={handlePresetRhythm}
              style={{
                height: 32,
                padding: '0 8px',
                borderRadius: 7,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(145deg, #1e222d, #141720)',
                color: '#cbd5e1',
                boxShadow: '2px 2px 4px #0a0c11',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Flame size={12} color="#f59e0b" />
              <span>BEAT</span>
            </button>
          )}

          {/* BPM */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#0d0f14',
              borderRadius: 7,
              padding: '1px 3px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <button
              onClick={() => handleBpmChange(-4)}
              style={{
                width: 18,
                height: 26,
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: 12,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              -
            </button>
            <div style={{ textAlign: 'center', minWidth: 38 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
                {bpm}
              </div>
              <div style={{ fontSize: 7, color: '#64748b', fontWeight: 800 }}>BPM</div>
            </div>
            <button
              onClick={() => handleBpmChange(4)}
              style={{
                width: 18,
                height: 26,
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: 12,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>

          {/* 滤波 (Filter) */}
          <button
            onClick={() => {
              const next =
                filterMode === 'open' ? 'warm' : filterMode === 'warm' ? 'muffled' : 'open';
              handleFilterChange(next);
            }}
            style={{
              height: 32,
              padding: '0 6px',
              borderRadius: 7,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(145deg, #1e222d, #141720)',
              color: filterMode === 'open' ? theme.accent2 : filterMode === 'warm' ? '#fbbf24' : '#f87171',
              boxShadow: '2px 2px 4px #0a0c11',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Sliders size={11} />
            <span>FLT</span>
          </button>

          {/* 过载失真 (Drive) */}
          <button
            onClick={toggleDrive}
            style={{
              height: 32,
              padding: '0 6px',
              borderRadius: 7,
              border: driveEnabled ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.08)',
              background: driveEnabled ? '#f43f5e22' : 'linear-gradient(145deg, #1e222d, #141720)',
              color: driveEnabled ? '#f43f5e' : '#64748b',
              boxShadow: driveEnabled ? '0 0 8px #f43f5e44' : '2px 2px 4px #0a0c11',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Zap size={11} />
            <span>DRV</span>
          </button>

          {/* 录音 */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
              border: isRecording ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
              background: isRecording ? '#ef444433' : 'linear-gradient(145deg, #1e222d, #141720)',
              color: isRecording ? '#ef4444' : '#94a3b8',
              boxShadow: isRecording ? '0 0 10px #ef444466' : '2px 2px 4px #0a0c11',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Circle size={12} fill={isRecording ? '#ef4444' : 'none'} />
          </button>
        </div>

        {/* 16 步节奏跑马灯进度指示 */}
        {isAnyLooping && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(16, 1fr)',
              gap: 2,
              padding: '2px 0',
            }}
          >
            {Array.from({ length: 16 }).map((_, stepIdx) => {
              const isCurrent = currentLoopStep === stepIdx;
              const isBeatHead = stepIdx % 4 === 0;
              return (
                <div
                  key={stepIdx}
                  style={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: isCurrent
                      ? theme.accent
                      : isBeatHead
                      ? 'rgba(255,255,255,0.22)'
                      : 'rgba(255,255,255,0.06)',
                    boxShadow: isCurrent ? `0 0 8px ${theme.accent}` : 'none',
                    transition: 'all 0.05s ease',
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 4×4 经典 16 宫格打击垫矩阵 (主舞台) */}
      <div
        style={{
          flex: 1,
          padding: '8px 12px 12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: 10,
          boxSizing: 'border-box',
        }}
      >
        {pads.map((item) => {
          const isFlashing = activePadIds.has(item.id);
          const isLoopingThis = loopingPadIds.has(item.id);

          // 结合 Colormind 调色盘色卡赋予和谐色
          const colormindTone = theme.palette[item.id % theme.palette.length];
          const padColor = colormindTone || item.color;

          return (
            <div
              key={item.id}
              onPointerDown={(e) => {
                e.preventDefault();
                handlePadInteraction(item.id);
              }}
              style={{
                position: 'relative',
                borderRadius: 14,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '8px 7px',
                boxSizing: 'border-box',
                transition: 'all 0.08s ease',
                transform: isFlashing ? 'scale(0.96) translateY(2px)' : 'scale(1)',
                background: isFlashing
                  ? `radial-gradient(circle at 50% 50%, ${padColor}ff 0%, ${padColor}aa 100%)`
                  : isLoopingThis
                  ? `linear-gradient(145deg, ${padColor}28, ${theme.cardBg})`
                  : `linear-gradient(145deg, ${theme.cardBg}, #101217)`,
                boxShadow: isFlashing
                  ? `0 0 25px ${padColor}, 0 0 50px ${padColor}aa, inset 0 0 10px rgba(255,255,255,0.6)`
                  : isLoopingThis
                  ? `0 0 14px ${padColor}77, inset 0 0 10px ${padColor}44, 3px 3px 6px #0b0d12`
                  : '4px 4px 8px #08090d, -2px -2px 6px rgba(255,255,255,0.04), inset 1px 1px 1px rgba(255,255,255,0.06)',
                border: isFlashing
                  ? `1px solid ${padColor}`
                  : isLoopingThis
                  ? `1.5px solid ${padColor}`
                  : `1px solid ${padColor}22`,
              }}
            >
              {/* 顶部标识：快捷键提示与类型 + 极简 [↻] 标识 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 10,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    backgroundColor: isFlashing
                      ? 'rgba(0,0,0,0.5)'
                      : isLoopingThis
                      ? `${padColor}33`
                      : 'rgba(255,255,255,0.06)',
                    color: isFlashing ? '#ffffff' : isLoopingThis ? padColor : '#94a3b8',
                    padding: '2px 4px',
                    borderRadius: 4,
                    fontSize: 9,
                    letterSpacing: 0.5,
                  }}
                >
                  {item.keyLabel}
                </span>

                {isLoopingThis ? (
                  <div
                    style={{
                      padding: '1px 3px',
                      borderRadius: 3,
                      backgroundColor: `${padColor}33`,
                      border: `1px solid ${padColor}88`,
                      color: isFlashing ? '#ffffff' : padColor,
                      fontSize: 8,
                      fontWeight: 900,
                      boxShadow: `0 0 6px ${padColor}66`,
                    }}
                  >
                    ↻
                  </div>
                ) : (
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: padColor,
                      boxShadow: `0 0 6px ${padColor}`,
                      opacity: isFlashing ? 1 : 0.4,
                    }}
                  />
                )}
              </div>

              {/* 中间/底部声音名称 */}
              <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: 0.5,
                    color: isFlashing ? '#ffffff' : '#f1f5f9',
                    textShadow: isFlashing
                      ? '0 0 10px rgba(0,0,0,0.8)'
                      : isLoopingThis
                      ? `0 0 8px ${padColor}`
                      : '0 1px 2px rgba(0,0,0,0.9)',
                    lineHeight: 1.15,
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: isFlashing ? '#ffffffcc' : `${padColor}bb`,
                    marginTop: 2,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  {item.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部液晶仪表盘风格状态条 (纯净数值，无大段文字) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px 10px',
          background: `linear-gradient(180deg, ${theme.bg} 0%, #090a0d 100%)`,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: 10,
          color: '#64748b',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: theme.accent2 }}>TRIG:</span>
          <span style={{ color: '#f8fafc', fontWeight: 700 }}>{lastTriggeredName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>MODE: <strong style={{ color: padMode === 'loop' ? theme.accent : theme.accent2 }}>{padMode.toUpperCase()}</strong></span>
          <span style={{ color: theme.accent }}>● 0ms</span>
        </div>
      </div>
    </div>
  );
};
