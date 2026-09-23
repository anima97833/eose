import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Palette,
  Timer,
  Radio as RadioIcon,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import {
  RadioStation,
  PRESET_STATIONS,
  findStationByFrequency,
} from '../../../core/radio/radioService';
import {
  loadRadioPalette,
  saveRadioPalette,
  loadLastStationId,
  saveLastStationId,
  loadRadioVolume,
  saveRadioVolume,
} from '../../../core/radio/radioThemeStorage';
import { fetchColormindPalette, rgbToHex } from '../../../core/theme/colormindService';
import { FrequencyDial } from './components/FrequencyDial';
import { TuningKnob } from './components/TuningKnob';
import { SpeakerGrill } from './components/SpeakerGrill';

interface RadioAppProps {
  onBack: () => void;
}

export const RadioApp: React.FC<RadioAppProps> = ({ onBack }) => {
  // 电台与音频状态
  const [currentStation, setCurrentStation] = useState<RadioStation>(() => {
    const lastId = loadLastStationId();
    return PRESET_STATIONS.find((s) => s.id === lastId) || PRESET_STATIONS[0];
  });
  const [currentFreq, setCurrentFreq] = useState<number>(currentStation.freqMhz);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(loadRadioVolume);
  const [isMuted, setIsMuted] = useState(false);

  // 旋钮旋转角度
  const [knobAngle, setKnobAngle] = useState(45);

  // 定时睡眠关闭 (分钟: 0 | 15 | 30 | 60)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(0);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);

  // Colormind 调色盘
  const [palette, setPalette] = useState<string[]>(loadRadioPalette);
  const [isColoring, setIsColoring] = useState(false);

  // 实际 audio 元素引用
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. 初始化 Audio 元素
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = volume;
    // 关键：阻止发送 Referer 头，防止触发防盗链 403
    try {
      (audio as any).referrerPolicy = 'no-referrer';
    } catch {}
    audioRef.current = audio;

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setErrorMsg(null);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      // 尝试备用流
      if (currentStation.backupStreamUrl && audio.src !== currentStation.backupStreamUrl) {
        audio.src = currentStation.backupStreamUrl;
        audio.load();
        audio.play().catch(() => setErrorMsg('该电台源暂不可用，轻拨换一台吧'));
      } else {
        setErrorMsg('该电台源暂不可用，轻拨换一台吧');
      }
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, [currentStation]);

  // 2. 音量与静音同步
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    saveRadioVolume(volume);
  }, [volume, isMuted]);

  // 3. 切换电台
  const playStation = (station: RadioStation) => {
    setCurrentStation(station);
    setCurrentFreq(station.freqMhz);
    saveLastStationId(station.id);
    setErrorMsg(null);

    if (audioRef.current) {
      audioRef.current.src = station.streamUrl;
      audioRef.current.load();
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setErrorMsg(null);
        })
        .catch((err) => {
          console.warn('Play error:', err);
          setIsLoading(false);
          setIsPlaying(false);
        });
    }
  };

  // 播放 / 暂停切换
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || !audioRef.current.src.includes(currentStation.streamUrl)) {
        audioRef.current.src = currentStation.streamUrl;
      }
      audioRef.current.load();
      setIsLoading(true);
      setErrorMsg(null);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setErrorMsg(null);
        })
        .catch((err) => {
          console.warn('Toggle play error:', err);
          setIsLoading(false);
          setIsPlaying(false);
          setErrorMsg('轻触播放失败，请检查网络或重试');
        });
    }
  };

  // 4. 旋钮步进切换上一个/下一个电台
  const handleRotateStep = (delta: number) => {
    setKnobAngle((prev) => (prev + delta * 30) % 360);
    const currentIndex = PRESET_STATIONS.findIndex((s) => s.id === currentStation.id);
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) nextIndex = PRESET_STATIONS.length - 1;
    if (nextIndex >= PRESET_STATIONS.length) nextIndex = 0;
    playStation(PRESET_STATIONS[nextIndex]);
  };

  // 5. 点击刻度盘调频
  const handleDialFreqChange = (newFreq: number) => {
    setCurrentFreq(newFreq);
    const matched = findStationByFrequency(newFreq);
    if (matched && matched.id !== currentStation.id) {
      playStation(matched);
    }
  };

  // 6. Colormind 自由配色换肤
  const handleRandomizePalette = async () => {
    if (isColoring) return;
    setIsColoring(true);
    try {
      const rgbColors = await fetchColormindPalette({ model: 'ui' });
      if (rgbColors && rgbColors.length === 5) {
        const hexes = rgbColors.map(rgbToHex);
        setPalette(hexes);
        saveRadioPalette(hexes);
      }
    } catch {
      // 优雅柔和复古色轮换
      const fallbacks = [
        ['#F4F6F9', '#E1E8F0', '#4A6B82', '#1E293B', '#D97706'], // 经典复古蓝金
        ['#F7FBF9', '#E6F4ED', '#2E7D32', '#143818', '#059669'], // 墨绿经典唱机
        ['#FFFBEB', '#FEF3C7', '#B45309', '#451A03', '#F59E0B'], // 暖木琥珀收音机
        ['#FBF7FB', '#F5E6F5', '#7E22CE', '#3B0764', '#EC4899'], // 霓虹蒸汽波
      ];
      const next = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setPalette(next);
      saveRadioPalette(next);
    } finally {
      setIsColoring(false);
    }
  };

  // 7. 定时助眠倒计时
  useEffect(() => {
    if (!sleepTimerMinutes) {
      setSleepTimeRemaining(null);
      return;
    }

    setSleepTimeRemaining(sleepTimerMinutes * 60);
    const interval = setInterval(() => {
      setSleepTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          setSleepTimerMinutes(0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  const cycleSleepTimer = () => {
    const options = [0, 15, 30, 60];
    const currIdx = options.indexOf(sleepTimerMinutes);
    const nextIdx = (currIdx + 1) % options.length;
    setSleepTimerMinutes(options[nextIdx]);
  };

  const primaryAccent = palette[2] || '#4A6B82';
  const glowAccent = palette[4] || '#D97706';

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: palette[0] || 'var(--nm-bg, #E9EEF5)',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部标题控制栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px 8px',
          borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
          background: 'var(--nm-bg-lighter, #F2F6FB)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="nm-rebound-btn nm-btn-circle"
          style={{ width: '38px', height: '38px' }}
          title="返回主屏"
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>

        <div style={{ textAlign: 'center', userSelect: 'none' }}>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 900,
              color: 'var(--nm-text-main, #334257)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>声音电台</span>
            <RadioIcon size={15} style={{ color: primaryAccent }} />
          </h2>
          <span style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--nm-text-sub, #7D8CA3)' }}>
            Vintage Frequency FM · 24H Live
          </span>
        </div>

        {/* 右侧动作区：Colormind 换色 + 定时睡眠 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* 定时睡眠 */}
          <button
            type="button"
            onClick={cycleSleepTimer}
            className="nm-rebound-btn nm-btn-circle"
            style={{
              width: '36px',
              height: '36px',
              color: sleepTimerMinutes > 0 ? '#10B981' : '#64748B',
              position: 'relative',
            }}
            title={
              sleepTimerMinutes > 0
                ? `定时睡眠已开启：${Math.ceil((sleepTimeRemaining || 0) / 60)} 分钟后关机`
                : '开启定时睡眠关机'
            }
          >
            <Timer size={16} strokeWidth={2.4} />
            {sleepTimerMinutes > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 5px #10B981',
                }}
              />
            )}
          </button>

          {/* Colormind 自由配色 */}
          <button
            type="button"
            onClick={handleRandomizePalette}
            disabled={isColoring}
            className="nm-rebound-btn nm-btn-circle"
            style={{
              width: '36px',
              height: '36px',
              color: primaryAccent,
              opacity: isColoring ? 0.6 : 1,
            }}
            title="一键调色（Colormind 智能和谐配色）"
          >
            <Palette size={16} strokeWidth={2.4} className={isColoring ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 主面板内容区 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxSizing: 'border-box',
        }}
      >
        {/* 【机身主体】：轻拟物经典收音机框体 */}
        <div
          style={{
            borderRadius: '24px',
            background: `linear-gradient(165deg, ${palette[1] || '#E1E8F0'} 0%, ${palette[0] || '#F4F6F9'} 100%)`,
            boxShadow:
              '0 16px 36px -8px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.06), inset 0 2px 3px rgba(255, 255, 255, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.08)',
            border: '2px solid rgba(255, 255, 255, 0.7)',
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* 1. 复古长条调频刻度视窗 */}
          <FrequencyDial
            currentFreq={currentFreq}
            onFreqChange={handleDialFreqChange}
            accentColor={primaryAccent}
            glowColor={glowAccent}
            isLockedStation={Boolean(findStationByFrequency(currentFreq))}
          />

          {/* 2. 当前电台信息液晶状态铭牌 */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '14px',
              background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#FFFFFF',
            }}
          >
            <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: glowAccent,
                    fontFamily: 'monospace',
                  }}
                >
                  {currentStation.frequency}
                </span>
                <span
                  style={{
                    fontSize: '9.5px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#94A3B8',
                  }}
                >
                  {currentStation.categoryLabel}
                </span>
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing: '0.02em',
                }}
              >
                {currentStation.name}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: '#94A3B8',
                  marginTop: '1px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {isLoading ? '📡 正在调谐载入音频流...' : errorMsg || currentStation.description}
              </div>
            </div>

            {/* 播放 / 暂停拟物大按钮 */}
            <button
              type="button"
              onClick={togglePlay}
              className="nm-rebound-btn nm-btn-circle"
              style={{
                width: '44px',
                height: '44px',
                background: isPlaying
                  ? `linear-gradient(135deg, ${glowAccent} 0%, #B45309 100%)`
                  : `linear-gradient(135deg, #38BDF8 0%, ${primaryAccent} 100%)`,
                color: '#FFFFFF',
                border: 'none',
                boxShadow: isPlaying
                  ? `0 6px 18px -3px ${glowAccent}80, inset 0 1px 0 rgba(255, 255, 255, 0.4)`
                  : '0 6px 18px -3px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                flexShrink: 0,
              }}
              title={isPlaying ? '暂停' : '收听此电台'}
            >
              {isPlaying ? (
                <Pause size={18} fill="#FFFFFF" />
              ) : (
                <Play size={18} fill="#FFFFFF" style={{ marginLeft: '2px' }} />
              )}
            </button>
          </div>

          {/* 3. 扬声器网格与声波律动柱 */}
          <SpeakerGrill isPlaying={isPlaying} accentColor={primaryAccent} />

          {/* 4. 下方控制区：旋钮与音量控制 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 4px 0',
            }}
          >
            {/* 左侧：音量调节滑块 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                flex: 1,
                maxWidth: '140px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isMuted ? '#EF4444' : '#64748B',
                    padding: 0,
                    display: 'flex',
                  }}
                  title={isMuted ? '取消静音' : '静音'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    color: '#64748B',
                    fontFamily: 'monospace',
                  }}
                >
                  VOL: {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                style={{
                  width: '100%',
                  accentColor: primaryAccent,
                  cursor: 'pointer',
                  height: '4px',
                }}
              />
            </div>

            {/* 右侧：金属调谐旋转旋钮 */}
            <TuningKnob
              angle={knobAngle}
              onRotateStep={handleRotateStep}
              accentColor={primaryAccent}
              label="TUNING · 换台"
            />
          </div>
        </div>

        {/* 【预设电台卡槽列表】：可快速点播 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: 'var(--nm-text-sub, #64748B)',
                letterSpacing: '0.08em',
              }}
            >
              PRESET STATIONS · 预设频道 ({PRESET_STATIONS.length})
            </span>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>即点即听</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {PRESET_STATIONS.map((station, index) => {
              const isSelected = station.id === currentStation.id;
              return (
                <div
                  key={station.id}
                  onClick={() => playStation(station)}
                  className="nm-flat"
                  style={{
                    padding: '9px 10px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    border: isSelected
                      ? `1.5px solid ${primaryAccent}`
                      : '1px solid rgba(255, 255, 255, 0.6)',
                    background: isSelected
                      ? 'var(--nm-bg-lighter, #FFFFFF)'
                      : 'var(--nm-bg, #E9EEF5)',
                    boxShadow: isSelected
                      ? `0 4px 14px -2px ${primaryAccent}30`
                      : '0 2px 6px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: isSelected ? primaryAccent : '#64748B',
                        fontFamily: 'monospace',
                      }}
                    >
                      P{index + 1} · {station.frequency}
                    </span>
                    {isSelected && isPlaying && (
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#10B981',
                          boxShadow: '0 0 6px #10B981',
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isSelected ? 'var(--nm-text-main, #1E293B)' : '#475569',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {station.name.split('·')[0].trim()}
                  </div>
                  <div
                    style={{
                      fontSize: '9.5px',
                      color: '#94A3B8',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {station.categoryLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
