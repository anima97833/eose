import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface RufflePlayerViewProps {
  gameData: ArrayBuffer | null;
  gameTitle: string;
  isMuted?: boolean;
}

declare global {
  interface Window {
    RufflePlayer?: {
      newest: () => {
        createPlayer: () => any;
      };
      config?: Record<string, any>;
    };
  }
}

// 动态载入 Ruffle 引擎（带多源 CDN 容灾重试）
let ruffleLoadingPromise: Promise<void> | null = null;
function ensureRuffleLoaded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.RufflePlayer) return Promise.resolve();
  if (ruffleLoadingPromise) return ruffleLoadingPromise;

  ruffleLoadingPromise = new Promise((resolve, reject) => {
    // 预设 Ruffle 全局参数
    const ruffleObj = (window as any).RufflePlayer || {};
    (window as any).RufflePlayer = ruffleObj;
    ruffleObj.config = {
      autoplay: 'on',
      unmuteOverlay: 'hidden',
      letterbox: 'on',
      warnOnUnsupportedContent: false,
    };

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@ruffle-rs/ruffle';
    script.async = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      // 容灾备用 CDN
      console.warn('[Ruffle] unpkg 加载失败，切换 jsdelivr...');
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle';
      fallbackScript.async = true;
      fallbackScript.onload = () => resolve();
      fallbackScript.onerror = () => reject(new Error('无法载入 Flash 模拟器引擎，请检查网络连接'));
      document.head.appendChild(fallbackScript);
    };

    document.head.appendChild(script);
  });

  return ruffleLoadingPromise;
}

export const RufflePlayerView: React.FC<RufflePlayerViewProps> = ({
  gameData,
  gameTitle,
  isMuted = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const blobUrlRef = useRef<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!gameData || gameData.byteLength === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // 清理旧播放器
    if (playerRef.current) {
      try {
        playerRef.current.remove();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    ensureRuffleLoaded()
      .then(() => {
        if (isCancelled || !containerRef.current) return;

        const ruffle = window.RufflePlayer?.newest();
        if (!ruffle) {
          throw new Error('RufflePlayer 初始化异常');
        }

        const player = ruffle.createPlayer();
        playerRef.current = player;

        // 设置播放器在容器内自适应填满与可聚焦状态
        player.style.width = '100%';
        player.style.height = '100%';
        player.style.display = 'block';
        player.style.outline = 'none';
        player.setAttribute('tabindex', '0');

        // 挂载到 DOM
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(player);

        // 生成 Blob URL 载入
        const blob = new Blob([gameData], { type: 'application/x-shockwave-flash' });
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;

        const loadPromise = player.load({
          url: blobUrl,
          allowScriptAccess: false,
          parameters: {},
          scale: 'showAll',
          letterbox: 'on',
        });

        // 自动聚焦保证物理按键与触控事件直达 WASM 核心
        setTimeout(() => {
          try {
            player.focus();
            const canvas = player.shadowRoot?.querySelector('canvas');
            if (canvas) {
              canvas.setAttribute('tabindex', '0');
              canvas.focus();
            }
          } catch {
            // ignore
          }
        }, 200);

        return loadPromise;
      })
      .then(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('[Ruffle] 运行失败:', err);
          setErrorMsg(err.message || 'Flash 游戏加载失败');
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      if (playerRef.current) {
        try {
          playerRef.current.remove();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [gameData]);

  // 静音控制
  useEffect(() => {
    if (playerRef.current) {
      try {
        if (isMuted) {
          playerRef.current.volume = 0;
        } else {
          playerRef.current.volume = 1;
        }
      } catch {
        // ignore
      }
    }
  }, [isMuted]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#0F172A',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 实际挂载 Ruffle Player 的视口 */}
      <div
        ref={containerRef}
        onClick={() => {
          if (playerRef.current) {
            try {
              playerRef.current.focus();
              const canvas = playerRef.current.shadowRoot?.querySelector('canvas');
              if (canvas) {
                canvas.focus();
              }
            } catch {
              // ignore
            }
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />

      {/* 加载提示 */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            zIndex: 10,
          }}
        >
          <RefreshCw size={24} color="#38BDF8" className="spin-animation" />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#38BDF8',
              fontFamily: 'monospace',
              letterSpacing: '1px',
            }}
          >
            RUFFLE WASM BOOTING...
          </span>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>正在装载 {gameTitle}</span>
        </div>
      )}

      {/* 错误提示 */}
      {errorMsg && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <AlertCircle size={28} color="#EF4444" style={{ marginBottom: '8px' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#F87171' }}>{errorMsg}</span>
          <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
            请确认该文件为有效的 .swf 文件，或检查网络以载入模拟器
          </span>
        </div>
      )}
    </div>
  );
};
