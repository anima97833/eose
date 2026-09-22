import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Music } from 'lucide-react';

interface MusicTrack {
  title: string;
  artist: string;
}

const PLAYLIST: MusicTrack[] = [
  { title: 'Surah Al-Mulk', artist: 'Ismail Annuri' },
  { title: 'Peaceful Ambient', artist: 'Cloudfly Sounds' },
  { title: 'Morning Lofi', artist: 'Soft Breeze' },
];

interface MusicWidgetProps {
  title?: string;
  artist?: string;
}

export const MusicWidget: React.FC<MusicWidgetProps> = ({
  title: defaultTitle,
  artist: defaultArtist,
}) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(35); // 初始进度 35%

  const currentTrack = defaultTitle
    ? { title: defaultTitle, artist: defaultArtist || 'Ismail Annuri' }
    : PLAYLIST[trackIndex];

  // Web Audio 柔和环境音生成器（纯本地、免外网资源依赖、即点即响）
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let timer: number;
    if (isPlaying) {
      // 进度条平滑自增
      timer = window.setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 1000);

      // 启动 Web Audio 优雅轻音乐氛围音阶
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
          masterGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 1.2);
          masterGain.connect(ctx.destination);
          gainNodeRef.current = masterGain;

          // 循环生成静谧宁神磬音
          const notes = [261.63, 329.63, 392.00, 523.25, 440.00]; // C4, E4, G4, C5, A4
          let noteIdx = 0;

          const playAmbientNote = () => {
            if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[noteIdx % notes.length], ctx.currentTime);
            noteIdx++;

            noteGain.gain.setValueAtTime(0.05, ctx.currentTime);
            noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

            osc.connect(noteGain);
            noteGain.connect(masterGain);

            osc.start();
            osc.stop(ctx.currentTime + 3.0);
          };

          playAmbientNote();
          intervalRef.current = window.setInterval(playAmbientNote, 2400);
        }
      } catch {
        // 浏览器自动静音降级
      }
    } else {
      if (gainNodeRef.current && audioCtxRef.current) {
        try {
          gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.4);
          setTimeout(() => {
            audioCtxRef.current?.close();
            audioCtxRef.current = null;
          }, 450);
        } catch {
          // ignore
        }
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      clearInterval(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setProgress(0);
  };

  return (
    <div
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
      }}
    >
      {/* 左侧：黑胶/音符徽标 + 曲目与歌手信息 */}
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
            animation: isPlaying ? 'spin 5s linear infinite' : 'none',
          }}
        >
          <Music size={15} strokeWidth={2.4} />
        </div>

        {/* 歌名与作者 */}
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
            {currentTrack.title}
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.85)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '1px',
            }}
          >
            {currentTrack.artist}
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

      {/* 右侧控制按钮组：切歌 + 触觉播放键 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        {/* 下一曲小按钮 */}
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
          title="下一首"
        >
          <SkipForward size={14} strokeWidth={2.4} />
        </button>

        {/* 核心圆形轻拟物白色触控播放按键（复刻原手柄触感） */}
        <button
          type="button"
          onClick={togglePlay}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: 'none',
            boxShadow:
              '0 2px 8px rgba(30, 75, 110, 0.35), inset 0 1px 1px #ffffff',
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
          title={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? (
            <Pause size={14} strokeWidth={2.8} fill="#468EC0" />
          ) : (
            <Play size={14} strokeWidth={2.8} fill="#468EC0" style={{ marginLeft: '2px' }} />
          )}
        </button>
      </div>

      {/* 底部极细光泽播放进度条 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.22)',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
            transition: 'width 0.4s linear',
          }}
        />
      </div>

      {/* 唱片旋转与音波 CSS 关键帧 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes musicWave {
          0% { height: 4px; }
          100% { height: 13px; }
        }
      `}</style>
    </div>
  );
};

