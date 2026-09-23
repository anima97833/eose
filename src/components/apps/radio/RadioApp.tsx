import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Palette,
  Radio as RadioIcon,
  Globe2,
} from 'lucide-react';
import {
  RadioStation,
  PRESET_STATIONS,
  findStationByFrequency,
} from '../../../core/radio/radioService';
import {
  loadRadioPalette,
  saveRadioPalette,
} from '../../../core/radio/radioThemeStorage';
import { fetchColormindPalette, rgbToHex } from '../../../core/theme/colormindService';
import { radioGlobalPlayer, RadioPlayerState } from '../../../core/radio/radioGlobalPlayer';
import { FrequencyDial } from './components/FrequencyDial';
import { TuningKnob } from './components/TuningKnob';
import { SpeakerGrill } from './components/SpeakerGrill';
import { RadioSourceDrawer } from './components/RadioSourceDrawer';

interface RadioAppProps {
  onBack: () => void;
}

export const RadioApp: React.FC<RadioAppProps> = ({ onBack }) => {
  // 电台列表
  const [stationList, setStationList] = useState<RadioStation[]>(PRESET_STATIONS);

  // 全局播放器状态同步
  const [playerState, setPlayerState] = useState<RadioPlayerState>(() =>
    radioGlobalPlayer.getState()
  );

  const { currentStation, isPlaying, isLoading, errorMsg, volume, isMuted } = playerState;
  const [currentFreq, setCurrentFreq] = useState<number>(currentStation.freqMhz);

  // 换源抽屉
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 旋钮旋转角度
  const [knobAngle, setKnobAngle] = useState(45);

  // Colormind 调色盘
  const [palette, setPalette] = useState<string[]>(loadRadioPalette);
  const [isColoring, setIsColoring] = useState(false);

  // 订阅全局音频播放器状态 (退出后台不中断)
  useEffect(() => {
    const unsubscribe = radioGlobalPlayer.subscribe((state) => {
      setPlayerState(state);
      setCurrentFreq(state.currentStation.freqMhz);
    });
    return () => unsubscribe();
  }, []);

  // 切换电台
  const handlePlayStation = (station: RadioStation) => {
    if (!stationList.some((s) => s.id === station.id)) {
      setStationList((prev) => [station, ...prev]);
    }
    radioGlobalPlayer.playStation(station);
  };

  // 播放 / 暂停切换
  const handleTogglePlay = () => {
    radioGlobalPlayer.togglePlay();
  };

  // 旋钮步进切换
  const handleRotateStep = (delta: number) => {
    setKnobAngle((prev) => (prev + delta * 30) % 360);
    if (delta > 0) {
      radioGlobalPlayer.nextStation(stationList);
    } else {
      radioGlobalPlayer.prevStation(stationList);
    }
  };

  // 点击刻度盘调频
  const handleDialFreqChange = (newFreq: number) => {
    setCurrentFreq(newFreq);
    const matched = findStationByFrequency(newFreq, stationList);
    if (matched && matched.id !== currentStation.id) {
      handlePlayStation(matched);
    }
  };

  // Colormind 自由配色换肤
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
      const fallbacks = [
        ['#F4F6F9', '#E1E8F0', '#4A6B82', '#1E293B', '#D97706'],
        ['#F7FBF9', '#E6F4ED', '#2E7D32', '#143818', '#059669'],
        ['#FFFBEB', '#FEF3C7', '#B45309', '#451A03', '#F59E0B'],
        ['#FBF7FB', '#F5E6F5', '#7E22CE', '#3B0764', '#EC4899'],
      ];
      const next = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setPalette(next);
      saveRadioPalette(next);
    } finally {
      setIsColoring(false);
    }
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
      {/* 顶部标题控制栏：彻底去掉了计时器按钮 */}
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
          title="返回主屏 (后台持续播放不中断)"
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
            FM Tuner · Background Audio
          </span>
        </div>

        {/* 右侧动作区：换源 + Colormind 换色（已移除计时器） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* 换源 / 在线电台库 */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="nm-rebound-btn nm-btn-circle"
            style={{
              width: '36px',
              height: '36px',
              color: primaryAccent,
            }}
            title="电台换源与全球电台库 (Radio Browser API)"
          >
            <Globe2 size={16} strokeWidth={2.4} />
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
            isLockedStation={Boolean(findStationByFrequency(currentFreq, stationList))}
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
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  style={{
                    fontSize: '9px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: `${primaryAccent}40`,
                    color: '#BAE6FD',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  换源
                </button>
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
              onClick={handleTogglePlay}
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
                  onClick={() => radioGlobalPlayer.toggleMute()}
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
                  radioGlobalPlayer.setVolume(parseFloat(e.target.value));
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

        {/* 【当前可用电台卡槽列表】 */}
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
              CHANNELS · 频段列表 ({stationList.length})
            </span>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              style={{
                fontSize: '11px',
                color: primaryAccent,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Globe2 size={12} />
              <span>更换更多电台源</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {stationList.map((station, index) => {
              const isSelected = station.id === currentStation.id;
              return (
                <div
                  key={station.id}
                  onClick={() => handlePlayStation(station)}
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

      {/* 电台换源与全球电台库抽屉 */}
      <RadioSourceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentStationId={currentStation.id}
        onSelectStation={handlePlayStation}
        accentColor={primaryAccent}
      />
    </div>
  );
};
