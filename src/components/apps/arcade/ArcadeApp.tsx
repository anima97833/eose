import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Disc, Maximize2, Minimize2 } from 'lucide-react';
import { SWFGame } from '../../../core/arcade/arcadeTypes';
import {
  loadAllSWFGames,
  deleteSWFGame,
  updateGameLastPlayed,
  importSWFFile,
} from '../../../core/arcade/arcadeStorage';
import { RufflePlayerView } from './components/RufflePlayerView';
import { CartridgeLibraryModal } from './components/CartridgeLibraryModal';

interface ArcadeAppProps {
  onBack: () => void;
}

export const ArcadeApp: React.FC<ArcadeAppProps> = ({ onBack }) => {
  const [games, setGames] = useState<SWFGame[]>([]);
  const [activeGame, setActiveGame] = useState<SWFGame | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const mountedAtRef = useRef<number>(Date.now());

  // 1. 初始化读取卡带库
  useEffect(() => {
    let isMounted = true;
    loadAllSWFGames().then((list) => {
      if (!isMounted) return;
      setGames(list);
      if (list.length > 0) {
        setActiveGame(list[0]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. 键位规格定义（包含完整 code, key, keyCode 与 which，保证 Flash AS2/AS3 完美兼容）
  interface KeySpec {
    code: string;
    key: string;
    keyCode: number;
  }

  const KEY_SPECS: Record<string, KeySpec> = {
    ArrowUp: { code: 'ArrowUp', key: 'ArrowUp', keyCode: 38 },
    ArrowDown: { code: 'ArrowDown', key: 'ArrowDown', keyCode: 40 },
    ArrowLeft: { code: 'ArrowLeft', key: 'ArrowLeft', keyCode: 37 },
    ArrowRight: { code: 'ArrowRight', key: 'ArrowRight', keyCode: 39 },
    Space: { code: 'Space', key: ' ', keyCode: 32 },
    Enter: { code: 'Enter', key: 'Enter', keyCode: 13 },
    ShiftLeft: { code: 'ShiftLeft', key: 'Shift', keyCode: 16 },
    KeyW: { code: 'KeyW', key: 'w', keyCode: 87 },
    KeyS: { code: 'KeyS', key: 's', keyCode: 83 },
    KeyA: { code: 'KeyA', key: 'a', keyCode: 65 },
    KeyD: { code: 'KeyD', key: 'd', keyCode: 68 },
    KeyZ: { code: 'KeyZ', key: 'z', keyCode: 90 },
    KeyX: { code: 'KeyX', key: 'x', keyCode: 88 },
    KeyJ: { code: 'KeyJ', key: 'j', keyCode: 74 },
    KeyK: { code: 'KeyK', key: 'k', keyCode: 75 },
  };

  // 向 Ruffle WASM 引擎与 DOM 深入派发键盘事件（穿透 Shadow DOM 并直达 Canvas）
  const dispatchRuffleKey = (eventType: 'keydown' | 'keyup', spec: KeySpec) => {
    const { code, key, keyCode } = spec;
    const eventInit: KeyboardEventInit = {
      code,
      key,
      bubbles: true,
      cancelable: true,
      composed: true, // 核心：允许穿透 Shadow DOM 边界
    };

    let evt: KeyboardEvent;
    try {
      evt = new KeyboardEvent(eventType, eventInit);
      Object.defineProperty(evt, 'keyCode', { value: keyCode, configurable: true });
      Object.defineProperty(evt, 'which', { value: keyCode, configurable: true });
      Object.defineProperty(evt, 'charCode', {
        value: eventType === 'keydown' ? keyCode : 0,
        configurable: true,
      });
      (evt as any).__fromArcadeBridge = true;
    } catch {
      evt = new KeyboardEvent(eventType, eventInit);
      (evt as any).__fromArcadeBridge = true;
    }

    // 1. 直达 RufflePlayer 宿主元素及其内部 ShadowRoot (Canvas + Container)
    const players = document.querySelectorAll('ruffle-player');
    players.forEach((p) => {
      try {
        p.dispatchEvent(evt);
        const shadow = p.shadowRoot;
        if (shadow) {
          const canvas = shadow.querySelector('canvas');
          if (canvas) {
            canvas.dispatchEvent(evt);
          }
          const container = shadow.getElementById('container');
          if (container) {
            container.dispatchEvent(evt);
          }
        }
      } catch {
        // ignore
      }
    });

    // 2. 向 window 与 document 派发
    try {
      window.dispatchEvent(evt);
      document.dispatchEvent(evt);
    } catch {
      // ignore
    }
  };

  // 虚拟按键动作触发器
  const handleButtonDown = (action: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'A' | 'B' | 'SPACE' | 'START' | 'SELECT') => {
    setPressedKey(action);

    // 自动让 Ruffle Player 获取焦点
    const player = document.querySelector('ruffle-player') as HTMLElement | null;
    if (player) {
      try {
        player.focus();
        const canvas = player.shadowRoot?.querySelector('canvas');
        if (canvas) (canvas as HTMLElement).focus();
      } catch {
        // ignore
      }
    }

    switch (action) {
      case 'UP':
        dispatchRuffleKey('keydown', KEY_SPECS.ArrowUp);
        dispatchRuffleKey('keydown', KEY_SPECS.KeyW);
        break;
      case 'DOWN': // 黄金矿工：下方向键放钩子！
        dispatchRuffleKey('keydown', KEY_SPECS.ArrowDown);
        dispatchRuffleKey('keydown', KEY_SPECS.KeyS);
        break;
      case 'LEFT':
        dispatchRuffleKey('keydown', KEY_SPECS.ArrowLeft);
        dispatchRuffleKey('keydown', KEY_SPECS.KeyA);
        break;
      case 'RIGHT':
        dispatchRuffleKey('keydown', KEY_SPECS.ArrowRight);
        dispatchRuffleKey('keydown', KEY_SPECS.KeyD);
        break;
      case 'A': // 主动作键：同时合并发送 空格 + 下方向键 + Z + J，兼容各种黄金矿工放钩机制
        dispatchRuffleKey('keydown', KEY_SPECS.Space);
        dispatchRuffleKey('keydown', KEY_SPECS.ArrowDown);
        dispatchRuffleKey('keydown', KEY_SPECS.KeyZ);
        dispatchRuffleKey('keydown', KEY_SPECS.KeyJ);
        break;
      case 'B': // 副动作键：发送 上方向键(炸药) + X + K + W
        dispatchRuffleKey('keydown', KEY_SPECS.ArrowUp);
        dispatchRuffleKey('keydown', KEY_SPECS.KeyX);
        dispatchRuffleKey('keydown', KEY_SPECS.KeyK);
        dispatchRuffleKey('keydown', KEY_SPECS.KeyW);
        break;
      case 'SPACE': // 独立空格键
        dispatchRuffleKey('keydown', KEY_SPECS.Space);
        dispatchRuffleKey('keydown', KEY_SPECS.ArrowDown);
        break;
      case 'START':
        dispatchRuffleKey('keydown', KEY_SPECS.Enter);
        dispatchRuffleKey('keydown', KEY_SPECS.Space);
        break;
      case 'SELECT':
        dispatchRuffleKey('keydown', KEY_SPECS.ShiftLeft);
        break;
    }
  };

  const handleButtonUp = (action: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'A' | 'B' | 'SPACE' | 'START' | 'SELECT') => {
    setPressedKey(null);

    switch (action) {
      case 'UP':
        dispatchRuffleKey('keyup', KEY_SPECS.ArrowUp);
        dispatchRuffleKey('keyup', KEY_SPECS.KeyW);
        break;
      case 'DOWN':
        dispatchRuffleKey('keyup', KEY_SPECS.ArrowDown);
        dispatchRuffleKey('keyup', KEY_SPECS.KeyS);
        break;
      case 'LEFT':
        dispatchRuffleKey('keyup', KEY_SPECS.ArrowLeft);
        dispatchRuffleKey('keyup', KEY_SPECS.KeyA);
        break;
      case 'RIGHT':
        dispatchRuffleKey('keyup', KEY_SPECS.ArrowRight);
        dispatchRuffleKey('keyup', KEY_SPECS.KeyD);
        break;
      case 'A':
        dispatchRuffleKey('keyup', KEY_SPECS.Space);
        dispatchRuffleKey('keyup', KEY_SPECS.ArrowDown);
        dispatchRuffleKey('keyup', KEY_SPECS.KeyZ);
        dispatchRuffleKey('keyup', KEY_SPECS.KeyJ);
        break;
      case 'B':
        dispatchRuffleKey('keyup', KEY_SPECS.ArrowUp);
        dispatchRuffleKey('keyup', KEY_SPECS.KeyX);
        dispatchRuffleKey('keyup', KEY_SPECS.KeyK);
        dispatchRuffleKey('keyup', KEY_SPECS.KeyW);
        break;
      case 'SPACE':
        dispatchRuffleKey('keyup', KEY_SPECS.Space);
        dispatchRuffleKey('keyup', KEY_SPECS.ArrowDown);
        break;
      case 'START':
        dispatchRuffleKey('keyup', KEY_SPECS.Enter);
        dispatchRuffleKey('keyup', KEY_SPECS.Space);
        break;
      case 'SELECT':
        dispatchRuffleKey('keyup', KEY_SPECS.ShiftLeft);
        break;
    }
  };

  // 全局物理键盘事件监听与桥接（PC 实体键盘按键无缝直通 Flash 游戏）
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 忽略由本桥接器自身派发出来的合成事件，防止无限循环
      if ((e as any).__fromArcadeBridge) return;

      // 阻止方向键与空格导致宿主网页滚动
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // 如果当前聚焦不在 Ruffle 内，让 Ruffle 获取焦点
      const player = document.querySelector('ruffle-player') as HTMLElement | null;
      if (player && document.activeElement !== player) {
        try {
          player.focus();
          const canvas = player.shadowRoot?.querySelector('canvas');
          if (canvas) (canvas as HTMLElement).focus();
        } catch {
          // ignore
        }
      }

      // 查询或构造按键定义
      const spec = KEY_SPECS[e.code] || {
        code: e.code,
        key: e.key,
        keyCode: e.keyCode || e.which || 0,
      };

      // 深度转发给 Ruffle
      dispatchRuffleKey('keydown', spec);

      // 特别适配：按下实体空格键时，向黄金矿工同时转发 ArrowDown 与 S 备选信号，确保 100% 触发放钩
      if (e.code === 'Space') {
        dispatchRuffleKey('keydown', KEY_SPECS.ArrowDown);
        dispatchRuffleKey('keydown', KEY_SPECS.KeyS);
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if ((e as any).__fromArcadeBridge) return;

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      const spec = KEY_SPECS[e.code] || {
        code: e.code,
        key: e.key,
        keyCode: e.keyCode || e.which || 0,
      };

      dispatchRuffleKey('keyup', spec);

      if (e.code === 'Space') {
        dispatchRuffleKey('keyup', KEY_SPECS.ArrowDown);
        dispatchRuffleKey('keyup', KEY_SPECS.KeyS);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    window.addEventListener('keyup', handleGlobalKeyUp, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
      window.removeEventListener('keyup', handleGlobalKeyUp, { capture: true });
    };
  }, []);

  // 3. 选择卡带
  const handleSelectGame = (game: SWFGame) => {
    setActiveGame(game);
    updateGameLastPlayed(game.id);
    setShowLibraryModal(false);
  };

  // 4. 上传本地 SWF
  const handleImportFile = async (file: File) => {
    const newGame = await importSWFFile(file);
    setGames((prev) => [newGame, ...prev]);
    setActiveGame(newGame);
    setShowLibraryModal(false);
  };

  // 5. 删除卡带
  const handleDeleteGame = async (id: string) => {
    await deleteSWFGame(id);
    const remain = games.filter((g) => g.id !== id);
    setGames(remain);
    if (activeGame?.id === id) {
      setActiveGame(remain.length > 0 ? remain[0] : null);
    }
  };

  // 6. 全屏切换
  const toggleFullscreen = () => {
    if (!screenRef.current) return;
    if (!document.fullscreenElement) {
      screenRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#CBD5E1', // 经典复古灰白 Game Boy 机身
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        userSelect: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. 掌机顶端控制条 */}
      <div
        style={{
          height: '42px',
          background: '#94A3B8',
          borderBottom: '2.5px solid #475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* 返回键 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #38BDF8 0%, #0284C7 100%)',
            border: '2px solid #1E293B',
            boxShadow: '0 2px 0 #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
          }}
          title="返回桌面"
        >
          <ArrowLeft size={15} color="#FFFFFF" strokeWidth={3.5} />
        </button>

        {/* 掌机顶部品牌标 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 900,
              color: '#1E293B',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            🕹️ CLOUDFLY BOY
          </span>
        </div>

        {/* 右侧功能快捷键：音量、卡带库、全屏 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? '开声音' : '静音'}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: isMuted ? '#FEE2E2' : '#FFFFFF',
              border: '1.5px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {isMuted ? (
              <VolumeX size={14} color="#DC2626" />
            ) : (
              <Volume2 size={14} color="#1E293B" />
            )}
          </button>

          <button
            onClick={() => setShowLibraryModal(true)}
            title="卡带收纳盒"
            style={{
              height: '28px',
              padding: '0 8px',
              borderRadius: '8px',
              background: '#FDE047',
              border: '1.5px solid #1E293B',
              boxShadow: '0 1.5px 0 #1E293B',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 900,
              color: '#1E293B',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            <Disc size={13} strokeWidth={2.5} />
            卡带
          </button>

          <button
            onClick={toggleFullscreen}
            title="全屏切换"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#FFFFFF',
              border: '1.5px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* 2. 掌机上部：复古微凹点阵屏幕视窗 */}
      <div
        style={{
          padding: '10px 14px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {/* 屏幕外边框（深灰色斜角面板，带 BATTERY 红色指示灯） */}
        <div
          style={{
            width: '100%',
            height: '240px',
            background: '#334155',
            border: '3px solid #1E293B',
            borderRadius: '16px 16px 28px 16px',
            boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.5), 0 3px 0 #1E293B',
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 10px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* 屏幕顶部标头：立体声标识与电源指示灯 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
              padding: '0 4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* 电源指示灯 */}
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: activeGame ? '#22C55E' : '#EF4444',
                  boxShadow: activeGame
                    ? '0 0 6px #22C55E, 0 0 10px #4ADE80'
                    : '0 0 6px #EF4444',
                }}
              />
              <span
                style={{
                  fontSize: '8.5px',
                  fontWeight: 900,
                  color: '#94A3B8',
                  letterSpacing: '0.8px',
                  fontFamily: 'monospace',
                }}
              >
                POWER
              </span>
            </div>

            <span
              style={{
                fontSize: '8px',
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: '1px',
                fontFamily: 'monospace',
              }}
            >
              DOT MATRIX WITH STEREO SOUND
            </span>
          </div>

          {/* 真实 Flash 渲染画面视口 */}
          <div
            ref={screenRef}
            style={{
              flex: 1,
              background: '#0F172A',
              border: '2px solid #000000',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 0 12px rgba(0,0,0,0.8)',
            }}
          >
            {activeGame ? (
              <RufflePlayerView
                gameData={activeGame.data}
                gameTitle={activeGame.title}
                isMuted={isMuted}
              />
            ) : (
              /* 无卡带时的复古待机引导画面 */
              <div
                onClick={() => setShowLibraryModal(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: 'radial-gradient(circle, #1E293B 0%, #0F172A 100%)',
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '8px', animation: 'bounce 1.5s infinite' }}>
                  📼
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 900,
                    color: '#FDE047',
                    fontFamily: '"ZCOOL KuaiLe", sans-serif',
                    letterSpacing: '1px',
                  }}
                >
                  点击插入 SWF 卡带
                </span>
                <span style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                  支持本地任意 .swf 文件免安装即插即玩
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. 掌机中部：游戏标题滚动小条 */}
      <div
        style={{
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 900,
            color: '#475569',
            fontFamily: '"ZCOOL KuaiLe", sans-serif',
          }}
        >
          {activeGame ? `当前: ${activeGame.title}` : '未插入卡带'}
        </span>

        <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace' }}>
          PC: WASD / 方向键 / Z / X
        </span>
      </div>

      {/* 4. 掌机下部：物理按键操作区（十字方向键 + A/B动作键） */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '4px 16px',
        }}
      >
        {/* 左侧：实体手感十字方向键 (D-Pad) */}
        <div
          style={{
            width: '110px',
            height: '110px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 十字键底盘阴影槽 */}
          <div
            style={{
              position: 'absolute',
              width: '104px',
              height: '36px',
              background: '#94A3B8',
              borderRadius: '6px',
              boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '36px',
              height: '104px',
              background: '#94A3B8',
              borderRadius: '6px',
              boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)',
            }}
          />

          {/* 上键 */}
          <button
            onPointerDown={() => handleButtonDown('UP')}
            onPointerUp={() => handleButtonUp('UP')}
            onPointerLeave={() => handleButtonUp('UP')}
            style={{
              position: 'absolute',
              top: '4px',
              width: '34px',
              height: '36px',
              background: pressedKey === 'UP' ? '#0F172A' : '#1E293B',
              border: '2px solid #0F172A',
              borderRadius: '6px 6px 0 0',
              boxShadow: pressedKey === 'UP' ? 'none' : '0 2px 0 #0F172A',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              padding: 0,
            }}
          >
            ▲
          </button>

          {/* 下键（黄金矿工放钩） */}
          <button
            onPointerDown={() => handleButtonDown('DOWN')}
            onPointerUp={() => handleButtonUp('DOWN')}
            onPointerLeave={() => handleButtonUp('DOWN')}
            style={{
              position: 'absolute',
              bottom: '4px',
              width: '34px',
              height: '36px',
              background: pressedKey === 'DOWN' ? '#0F172A' : '#1E293B',
              border: '2px solid #0F172A',
              borderRadius: '0 0 6px 6px',
              boxShadow: pressedKey === 'DOWN' ? 'none' : '0 2px 0 #0F172A',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              padding: 0,
            }}
          >
            ▼
          </button>

          {/* 左键 */}
          <button
            onPointerDown={() => handleButtonDown('LEFT')}
            onPointerUp={() => handleButtonUp('LEFT')}
            onPointerLeave={() => handleButtonUp('LEFT')}
            style={{
              position: 'absolute',
              left: '4px',
              width: '36px',
              height: '34px',
              background: pressedKey === 'LEFT' ? '#0F172A' : '#1E293B',
              border: '2px solid #0F172A',
              borderRadius: '6px 0 0 6px',
              boxShadow: pressedKey === 'LEFT' ? 'none' : '0 2px 0 #0F172A',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              padding: 0,
            }}
          >
            ◀
          </button>

          {/* 右键 */}
          <button
            onPointerDown={() => handleButtonDown('RIGHT')}
            onPointerUp={() => handleButtonUp('RIGHT')}
            onPointerLeave={() => handleButtonUp('RIGHT')}
            style={{
              position: 'absolute',
              right: '4px',
              width: '36px',
              height: '34px',
              background: pressedKey === 'RIGHT' ? '#0F172A' : '#1E293B',
              border: '2px solid #0F172A',
              borderRadius: '0 6px 6px 0',
              boxShadow: pressedKey === 'RIGHT' ? 'none' : '0 2px 0 #0F172A',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              padding: 0,
            }}
          >
            ▶
          </button>

          {/* 十字键中心圆盘 */}
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#1E293B',
              boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.6)',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* 中间：独立空格键 (长胶囊按键，适配黄金矿工等一键放钩) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px', zIndex: 10 }}>
          <button
            onPointerDown={() => handleButtonDown('SPACE')}
            onPointerUp={() => handleButtonUp('SPACE')}
            onPointerLeave={() => handleButtonUp('SPACE')}
            style={{
              width: '68px',
              height: '32px',
              borderRadius: '16px',
              background: pressedKey === 'SPACE' ? '#1E293B' : 'radial-gradient(circle at 35% 35%, #475569 0%, #1E293B 100%)',
              border: '2px solid #0F172A',
              boxShadow: pressedKey === 'SPACE' ? 'none' : '0 3px 0 #0F172A, 0 4px 8px rgba(0,0,0,0.25)',
              color: '#FDE047',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: pressedKey === 'SPACE' ? 'translateY(2px)' : 'none',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            ␣ 空格
          </button>
          <span style={{ fontSize: '8px', fontWeight: 800, color: '#64748B', marginTop: '4px', fontFamily: 'monospace' }}>
            放钩/确认
          </span>
        </div>

        {/* 右侧：经典斜置 A / B 圆形动作按键 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transform: 'rotate(-20deg)',
          }}
        >
          {/* B 键 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onPointerDown={() => handleButtonDown('B')}
              onPointerUp={() => handleButtonUp('B')}
              onPointerLeave={() => handleButtonUp('B')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background:
                  pressedKey === 'B'
                    ? '#991B1B'
                    : 'radial-gradient(circle at 35% 35%, #F43F5E 0%, #BE123C 100%)',
                border: '2.5px solid #4C0519',
                boxShadow: pressedKey === 'B' ? 'none' : '0 4px 0 #4C0519, 0 6px 12px rgba(0,0,0,0.25)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: pressedKey === 'B' ? 'translateY(3px)' : 'none',
              }}
            >
              B
            </button>
            <span
              style={{
                fontSize: '8.5px',
                fontWeight: 900,
                color: '#475569',
                marginTop: '4px',
                transform: 'rotate(20deg)',
                fontFamily: 'monospace',
              }}
            >
              (炸药/X)
            </span>
          </div>

          {/* A 键 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-12px' }}>
            <button
              onPointerDown={() => handleButtonDown('A')}
              onPointerUp={() => handleButtonUp('A')}
              onPointerLeave={() => handleButtonUp('A')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background:
                  pressedKey === 'A'
                    ? '#991B1B'
                    : 'radial-gradient(circle at 35% 35%, #F43F5E 0%, #BE123C 100%)',
                border: '2.5px solid #4C0519',
                boxShadow: pressedKey === 'A' ? 'none' : '0 4px 0 #4C0519, 0 6px 12px rgba(0,0,0,0.25)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: pressedKey === 'A' ? 'translateY(3px)' : 'none',
              }}
            >
              A
            </button>
            <span
              style={{
                fontSize: '8.5px',
                fontWeight: 900,
                color: '#475569',
                marginTop: '4px',
                transform: 'rotate(20deg)',
                fontFamily: 'monospace',
              }}
            >
              (放钩/Z)
            </span>
          </div>
        </div>
      </div>

      {/* 5. 掌机最底端：斜置 SELECT & START 橡胶条键 + 扬声器小孔 */}
      <div
        style={{
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}
      >
        {/* SELECT / START 按键 */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onPointerDown={() => handleButtonDown('SELECT')}
              onPointerUp={() => handleButtonUp('SELECT')}
              onPointerLeave={() => handleButtonUp('SELECT')}
              style={{
                width: '32px',
                height: '10px',
                borderRadius: '5px',
                background: pressedKey === 'SELECT' ? '#0F172A' : '#334155',
                border: '1.5px solid #0F172A',
                boxShadow: pressedKey === 'SELECT' ? 'none' : '0 1.5px 0 #0F172A',
                cursor: 'pointer',
                transform: 'rotate(-25deg)',
              }}
            />
            <span style={{ fontSize: '7.5px', fontWeight: 900, color: '#64748B', marginTop: '6px', fontFamily: 'monospace' }}>
              SELECT
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onPointerDown={() => handleButtonDown('START')}
              onPointerUp={() => handleButtonUp('START')}
              onPointerLeave={() => handleButtonUp('START')}
              style={{
                width: '32px',
                height: '10px',
                borderRadius: '5px',
                background: pressedKey === 'START' ? '#0F172A' : '#334155',
                border: '1.5px solid #0F172A',
                boxShadow: pressedKey === 'START' ? 'none' : '0 1.5px 0 #0F172A',
                cursor: 'pointer',
                transform: 'rotate(-25deg)',
              }}
            />
            <span style={{ fontSize: '7.5px', fontWeight: 900, color: '#64748B', marginTop: '6px', fontFamily: 'monospace' }}>
              START
            </span>
          </div>
        </div>

        {/* 右下角拟物扬声器微孔 */}
        <div style={{ display: 'flex', gap: '3px', transform: 'rotate(-25deg)' }}>
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              style={{
                width: '3px',
                height: '18px',
                borderRadius: '2px',
                background: '#64748B',
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.5)',
              }}
            />
          ))}
        </div>
      </div>

      {/* 卡带库管理弹窗 */}
      {showLibraryModal && (
        <CartridgeLibraryModal
          games={games}
          activeGameId={activeGame?.id || null}
          onSelectGame={handleSelectGame}
          onImportFile={handleImportFile}
          onDeleteGame={handleDeleteGame}
          onClose={() => setShowLibraryModal(false)}
        />
      )}
    </div>
  );
};
