import React, { useState, useRef } from 'react';
import { MessageSquareText, Image as ImageIcon, Search, Settings } from 'lucide-react';

export interface DockItem {
  id: string;
  icon: React.ReactNode;
  hasBadge?: boolean;
}

const DEFAULT_ITEMS: DockItem[] = [
  {
    id: 'chat',
    icon: <MessageSquareText size={20} strokeWidth={2.3} />,
    hasBadge: true,
  },
  {
    id: 'moments',
    icon: <ImageIcon size={20} strokeWidth={2.3} />,
    hasBadge: false,
  },
  {
    id: 'checkphone',
    icon: <Search size={20} strokeWidth={2.3} />,
    hasBadge: false,
  },
  {
    id: 'settings',
    icon: <Settings size={20} strokeWidth={2.3} />,
    hasBadge: false,
  },
];

interface DockBarProps {
  onAppClick?: (appId: string) => void;
  activeApp?: string | null;
}

export const DockBar: React.FC<DockBarProps> = ({ onAppClick, activeApp }) => {
  const [items, setItems] = useState<DockItem[]>(DEFAULT_ITEMS);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const draggingIndexRef = useRef<number>(-1);
  const isMovedRef = useRef<boolean>(false);

  const handlePointerDown = (id: string, index: number, e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    draggingIndexRef.current = index;
    isMovedRef.current = false;
    
    // 按下瞬间：立即触发内凹深雕刻阴影
    setPressedId(id);
    setDragOffset(0);

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIndexRef.current === -1 || !containerRef.current) return;

    const deltaX = e.clientX - startXRef.current;
    
    // 只有滑动超过 4px 才真正进入“拖拽悬浮”状态；否则保持“按下内凹”状态
    if (Math.abs(deltaX) > 4) {
      if (!isMovedRef.current) {
        isMovedRef.current = true;
        const curId = items[draggingIndexRef.current]?.id;
        if (curId) {
          setDraggingId(curId);
          setHoverIndex(draggingIndexRef.current);
          setPressedId(null); // 离开内凹，进入拖拽浮起
        }
      }
      setDragOffset(deltaX);

      // 计算当前悬停的目标插槽
      const containerWidth = containerRef.current.offsetWidth;
      const itemWidth = containerWidth / items.length;
      const currentCenter = (draggingIndexRef.current + 0.5) * itemWidth + deltaX;
      const targetIdx = Math.max(0, Math.min(items.length - 1, Math.floor(currentCenter / itemWidth)));

      if (targetIdx !== hoverIndex) {
        setHoverIndex(targetIdx);
      }
    }
  };

  const handlePointerUp = (id: string, e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const fromIdx = draggingIndexRef.current;
    const toIdx = hoverIndex;

    // 释放按下状态，触发弹性回弹
    setPressedId(null);

    // 未发生拖动时为常规点击
    if (!isMovedRef.current) {
      onAppClick?.(id);
    } else if (fromIdx !== -1 && toIdx !== null && fromIdx !== toIdx) {
      // 拖拽换位逻辑
      const newItems = [...items];
      const [moved] = newItems.splice(fromIdx, 1);
      newItems.splice(toIdx, 0, moved);
      setItems(newItems);
    }

    setDraggingId(null);
    setHoverIndex(null);
    setDragOffset(0);
    draggingIndexRef.current = -1;
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 8px 2px',
        width: '100%',
        position: 'relative',
        touchAction: 'none',
      }}
    >
      {items.map((item, index) => {
        const isDragging = draggingId === item.id;
        const isPressed = pressedId === item.id;
        const isActive = activeApp === item.id;

        // 计算相邻图标平滑避让位移
        let shiftX = 0;
        if (draggingId && hoverIndex !== null && !isDragging) {
          const fromIdx = draggingIndexRef.current;
          const toIdx = hoverIndex;
          if (fromIdx < toIdx && index > fromIdx && index <= toIdx) {
            shiftX = -100;
          } else if (fromIdx > toIdx && index >= toIdx && index < fromIdx) {
            shiftX = 100;
          }
        }

        return (
          <div
            key={item.id}
            onPointerDown={(e) => handlePointerDown(item.id, index, e)}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => handlePointerUp(item.id, e)}
            onPointerCancel={(e) => handlePointerUp(item.id, e)}
            style={{
              position: 'relative',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isDragging ? 'grabbing' : 'pointer',
              zIndex: isDragging ? 50 : 1,
              transform: isDragging
                ? `translate3d(${dragOffset}px, -4px, 0)`
                : `translate3d(${shiftX}%, 0, 0)`,
              transition: isDragging
                ? 'none'
                : 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div
              className={`nm-rebound-btn nm-btn-circle ${isPressed ? 'nm-pressed' : ''} ${isDragging ? 'nm-dragging' : ''} ${isActive ? 'active' : ''}`}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                color: isPressed || isActive ? '#5096C6' : '#52647A',
                backgroundColor: 'var(--nm-bg)',
                // 深度内凹雕刻阴影（按下时精确呈现）
                boxShadow: isPressed
                  ? 'inset 4px 4px 8px rgba(150, 168, 190, 0.75), inset -4px -4px 8px rgba(255, 255, 255, 0.95)'
                  : isDragging
                  ? '7px 7px 18px rgba(166, 180, 200, 0.65), -7px -7px 18px rgba(255, 255, 255, 0.95)'
                  : '4px 4px 8px rgba(166, 180, 200, 0.55), -4px -4px 8px rgba(255, 255, 255, 0.95)',
                transform: isPressed
                  ? 'scale(0.91)'
                  : isDragging
                  ? 'scale(1.12)'
                  : 'scale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: isPressed
                  ? 'transform 0.06s ease-out, box-shadow 0.06s ease-out'
                  : 'transform 0.36s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s ease',
              }}
            >
              {item.icon}

              {/* 未读红点提示 */}
              {item.hasBadge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--nm-accent-red)',
                    boxShadow: '0 0 6px var(--nm-accent-red)',
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
