import React, { useRef } from 'react';
import { getAppIcon, getAppHasBadge, getAppTitle } from './desktopIconHelper';
import { ShoppingBag } from 'lucide-react';

interface DesktopPage2Props {
  appIds: string[];
  draggedAppId: string | null;
  hoverIndex: number | null;
  isHoverZone: boolean;
  onOpenApp?: (appId: string) => void;
  onStartDrag: (appId: string, index: number, e: React.PointerEvent) => void;
  onManageApp: (appId: string) => void;
}

export const DesktopPage2: React.FC<DesktopPage2Props> = ({
  appIds,
  draggedAppId,
  hoverIndex,
  isHoverZone,
  onOpenApp,
  onStartDrag,
  onManageApp,
}) => {
  const longPressTimerRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);

  const handlePointerDown = (appId: string, index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    startPosRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;

    // 长按 420ms 呼出快捷管理菜单
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => {
      if (!isDraggingRef.current) {
        onManageApp(appId);
      }
    }, 420);

    const targetEl = e.currentTarget as HTMLElement;

    const handlePointerMove = (moveEvt: PointerEvent) => {
      const dx = moveEvt.clientX - startPosRef.current.x;
      const dy = moveEvt.clientY - startPosRef.current.y;
      if (Math.hypot(dx, dy) > 5) {
        isDraggingRef.current = true;
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        // 交接给全局桌面拖拽引擎
        onStartDrag(appId, index, e);
      }
    };

    const handlePointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!isDraggingRef.current) {
        const dx = upEvt.clientX - startPosRef.current.x;
        const dy = upEvt.clientY - startPosRef.current.y;
        if (Math.hypot(dx, dy) <= 5) {
          onOpenApp?.(appId);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '16px 2px 10px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* 4 列应用网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          columnGap: '10px',
          rowGap: '20px',
          width: '100%',
          alignItems: 'start',
        }}
      >
        {appIds.map((appId, index) => {
          const isBeingDragged = draggedAppId === appId;
          const isDropSlot = isHoverZone && hoverIndex === index && !isBeingDragged;
          const hasBadge = getAppHasBadge(appId);
          const title = getAppTitle(appId);

          return (
            <div
              key={appId}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: '76px',
              }}
            >
              {/* 插入槽位占位符 */}
              {isDropSlot && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    border: '2px dashed #5096C6',
                    backgroundColor: 'rgba(80, 150, 198, 0.12)',
                    boxShadow:
                      'inset 3px 3px 8px rgba(160, 175, 195, 0.4), inset -3px -3px 8px rgba(255, 255, 255, 0.9)',
                    zIndex: 2,
                    pointerEvents: 'none',
                    animation: 'pulse 1.2s infinite ease-in-out',
                  }}
                />
              )}

              {/* 图标主体 */}
              <div
                onPointerDown={(e) => handlePointerDown(appId, index, e)}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--nm-bg)',
                  border: '1px solid rgba(255, 255, 255, 0.55)',
                  boxShadow: isBeingDragged
                    ? 'inset 4px 4px 10px rgba(150, 170, 195, 0.8), inset -4px -4px 10px rgba(255, 255, 255, 0.98)'
                    : '5px 5px 12px rgba(160, 175, 195, 0.52), -5px -5px 12px rgba(255, 255, 255, 0.96)',
                  color: isBeingDragged ? '#5096C6' : '#475971',
                  opacity: isBeingDragged ? 0.35 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  touchAction: 'none',
                  userSelect: 'none',
                  transform: isBeingDragged ? 'scale(0.92)' : 'scale(1)',
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                }}
              >
                {getAppIcon(appId, 24)}

                {hasBadge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      right: '3px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--nm-accent-red)',
                      boxShadow: '0 0 6px var(--nm-accent-red)',
                    }}
                  />
                )}
              </div>

              {/* 应用名称 */}
              <span
                style={{
                  marginTop: '6px',
                  fontSize: '11px',
                  color: 'var(--nm-text-sub)',
                  textAlign: 'center',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {title}
              </span>
            </div>
          );
        })}

        {/* 若此区域正好处于尾部吸附 */}
        {isHoverZone && hoverIndex !== null && hoverIndex >= appIds.length && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '76px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: '2px dashed #5096C6',
                backgroundColor: 'rgba(80, 150, 198, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5096C6',
                fontSize: '16px',
              }}
            >
              +
            </div>
            <span style={{ marginTop: '6px', fontSize: '11px', color: '#5096C6' }}>放置此处</span>
          </div>
        )}
      </div>

      {/* 底部微型引导条 */}
      <div
        style={{
          marginTop: 'auto',
          padding: '24px 8px 12px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => onOpenApp?.('appstore')}
          className="nm-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            color: 'var(--nm-text-sub)',
            cursor: 'pointer',
          }}
        >
          <ShoppingBag size={14} color="#5096C6" />
          <span>前往应用商店获取更多</span>
        </button>
      </div>
    </div>
  );
};
