import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Music, Radio as RadioIcon } from 'lucide-react';
import { radioGlobalPlayer, RadioPlayerState } from '../../../core/radio/radioGlobalPlayer';

interface MusicWidgetProps {
  onOpenApp?: () => void;
}

export const MusicWidget: React.FC<MusicWidgetProps> = ({ onOpenApp }) => {
  // 订阅全局电台播放器状态（实现退出电台App后后台无缝不中断播放与控制）
  const [playerState, setPlayerState] = useState<RadioPlayerState>(() =>
    radioGlobalPlayer.getState()
  );

  useEffect(() => {
    const unsubscribe = radioGlobalPlayer.subscribe((state) => {
      setPlayerState(state);
    });
    return () => unsubscribe();
  }, []);

  const { currentStation, isPlaying, isLoading } = playerState;

  // 播放 / 暂停切换
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    radioGlobalPlayer.togglePlay();
  };

  // 下一曲 / 下一个电台
  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    radioGlobalPlayer.nextStation();
  };

  return (
    <div
      onClick={onOpenApp}
      style={{
        position: 'relative',
        width: '100%',
        height: '46px',
        padding: '0 10px 0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '23px',
        background: 'linear-gradient(135deg, #5CA4D5 0%, #468EC0 100%)',
        boxShadow:
          '5px 5px 14px rgba(70, 142, 192, 0.42), -3px -3px 8px rgba(255, 255, 255, 0.9), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        cursor: onOpenApp ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      title="点击直达声音电台"
    >
      {/* 左侧：电台/音乐微标 + 正在播放信息 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: 0,
          flex: 1,
        }}
      >
        {/* 旋转唱片图标 */}
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            backdropFilter: 'blur(4px)',
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4)',
            animation: isPlaying ? 'spin 4s linear infinite' : 'none',
          }}
        >
          {isPlaying ? (
            <RadioIcon size={15} strokeWidth={2.4} />
          ) : (
            <Music size={15} strokeWidth={2.4} />
          )}
        </div>

        {/* 电台名称与频段标签 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
            lineHeight: 1.2,
          }}
        >
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: '0 1px 2px rgba(20, 60, 90, 0.25)',
            }}
          >
            {isLoading ? '📡 调谐缓冲中...' : currentStation.name}
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.88)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '1px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {currentStation.frequency} · {currentStation.categoryLabel}
          </span>
        </div>
      </div>

      {/* 中部：跳动音频均衡波形 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2.5px',
          height: '14px',
          margin: '0 8px',
          flexShrink: 0,
        }}
      >
        {[0.6, 1, 0.7, 0.4].map((scale, i) => (
          <div
            key={i}
            style={{
              width: '2.5px',
              height: isPlaying ? `${Math.max(4, 14 * scale)}px` : '3.5px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: '2px',
              transition: 'height 0.25s ease',
              animation: isPlaying
                ? `musicWave 0.8s ease-in-out infinite alternate ${i * 0.18}s`
                : 'none',
            }}
          />
        ))}
      </div>

      {/* 右侧控制按钮组：切台 + 触觉播放按键 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        {/* 下一个电台按钮 */}
        <button
          type="button"
          onClick={handleNextTrack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.85)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'color 0.15s ease, transform 0.15s ease',
          }}
          title="切换下一个电台"
        >
          <SkipForward size={14} strokeWidth={2.4} />
        </button>

        {/* 核心圆形轻拟物白色触控播放按键 */}
        <button
          type="button"
          onClick={handleTogglePlay}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: 'none',
            boxShadow: '0 2px 8px rgba(30, 75, 110, 0.35), inset 0 1px 1px #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#468EC0',
            cursor: 'pointer',
            transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
            padding: 0,
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.92)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={isPlaying ? '暂停电台' : '播放电台'}
        >
          {isPlaying ? (
            <Pause size={14} strokeWidth={2.8} fill="#468EC0" />
          ) : (
            <Play size={14} strokeWidth={2.8} fill="#468EC0" style={{ marginLeft: '2px' }} />
          )}
        </button>
      </div>

      <style>{`
        @keyframes musicWave {
          0% { height: 3.5px; }
          100% { height: 14px; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
