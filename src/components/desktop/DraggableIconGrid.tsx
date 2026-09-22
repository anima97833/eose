import React, { useState, useRef } from 'react';

export interface IconItem {
  id: string;
  icon: React.ReactNode;
  hasBadge?: boolean;
}

interface DraggableIconGridProps {
  initialItems: IconItem[];
  itemSize?: number; // 默认 54px
  columns?: number;  // 默认 4 列
  rowGap?: number;   // 默认 24px
  onItemClick?: (id: string) => void;
  activeId?: string | null;
}

export const DraggableIconGrid: React.FC<DraggableIconGridProps> = ({
  initialItems,
  itemSize = 54,
  columns: propColumns,
  rowGap = 24,
  onItemClick,
  activeId,
}) => {
  const [items, setItems] = useState<IconItem[]>(initialItems);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState<number>(0);
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const draggingIndexRef = useRef<number>(-1);
  const isMovedRef = useRef<boolean>(false);

  const columns = propColumns || Math.min(items.length, 4);
  const totalRows = Math.ceil(items.length / columns);
  const rowHeight = itemSize + rowGap;

  const handlePointerDown = (id: string, index: number, e: React.PointerEvent) => {
    // 阻止冒泡，防止触发桌面横向换页手势
    e.stopPropagation();

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    draggingIndexRef.current = index;
    isMovedRef.current = false;

    // 按下第 1 毫秒：立即呈现深雕刻内凹阴影
    setPressedId(id);
    setDragOffsetX(0);
    setDragOffsetY(0);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIndexRef.current === -1 || !containerRef.current) return;

    const deltaX = e.clientX - startXRef.current;
    const deltaY = e.clientY - startYRef.current;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 滑动超过 4px 触发全方向（上下左右 2D）自由拖拽悬浮态
    if (distance > 4) {
      if (!isMovedRef.current) {
        isMovedRef.current = true;
        const curId = items[draggingIndexRef.current]?.id;
        if (curId) {
          setDraggingId(curId);
          setHoverIndex(draggingIndexRef.current);
          setPressedId(null); // 退出按压内凹，进入拖拽浮空态
        }
      }

      setDragOffsetX(deltaX);
      setDragOffsetY(deltaY);

      // 计算 2D 网格目标插槽 (列与行)
      const containerWidth = containerRef.current.offsetWidth;
      const slotWidth = containerWidth / columns;

      const fromIdx = draggingIndexRef.current;
      const fromRow = Math.floor(fromIdx / columns);
      const fromCol = fromIdx % columns;

      const currentCenterX = (fromCol + 0.5) * slotWidth + deltaX;
      const currentCenterY = (fromRow + 0.5) * rowHeight + deltaY;

      const targetCol = Math.max(0, Math.min(columns - 1, Math.floor(currentCenterX / slotWidth)));
      const targetRow = Math.max(0, Math.min(totalRows - 1, Math.floor(currentCenterY / rowHeight)));
      const rawTargetIdx = targetRow * columns + targetCol;
      const clampedTargetIdx = Math.max(0, Math.min(items.length - 1, rawTargetIdx));

      if (clampedTargetIdx !== hoverIndex) {
        setHoverIndex(clampedTargetIdx);
      }
    }
  };

  const handlePointerUp = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const fromIdx = draggingIndexRef.current;
    const toIdx = hoverIndex;

    // 释放按下状态，触发弹簧回弹
    setPressedId(null);

    // 未移动视为轻触点击打开应用
    if (!isMovedRef.current) {
      onItemClick?.(id);
    } else if (fromIdx !== -1 && toIdx !== null && fromIdx !== toIdx) {
      // 2D 换位：跨行列平滑插槽重排
      const newItems = [...items];
      const [moved] = newItems.splice(fromIdx, 1);
      newItems.splice(toIdx, 0, moved);
      setItems(newItems);
    }

    setDraggingId(null);
    setHoverIndex(null);
    setDragOffsetX(0);
    setDragOffsetY(0);
    draggingIndexRef.current = -1;
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        rowGap: `${rowGap}px`,
        width: '100%',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {items.map((item, index) => {
        const isDragging = draggingId === item.id;
        const isPressed = pressedId === item.id;
        const isActive = activeId === item.id;

        // 2D 避让平滑位移动画计算
        let shiftXPercent = 0;
        let shiftYPx = 0;

        if (draggingId && hoverIndex !== null && !isDragging) {
          const fromIdx = draggingIndexRef.current;
          const toIdx = hoverIndex;

          let newSlot = index;
          if (fromIdx < toIdx) {
            if (index > fromIdx && index <= toIdx) {
              newSlot = index - 1;
            }
          } else if (fromIdx > toIdx) {
            if (index >= toIdx && index < fromIdx) {
              newSlot = index + 1;
            }
          }

          if (newSlot !== index) {
            const origCol = index % columns;
            const origRow = Math.floor(index / columns);
            const newCol = newSlot % columns;
            const newRow = Math.floor(newSlot / columns);

            shiftXPercent = (newCol - origCol) * 100;
            shiftYPx = (newRow - origRow) * rowHeight;
          }
        }

        return (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: `${itemSize}px`,
            }}
          >
            <div
              onPointerDown={(e) => handlePointerDown(item.id, index, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={(e) => handlePointerUp(item.id, e)}
              onPointerCancel={(e) => handlePointerUp(item.id, e)}
              style={{
                position: isDragging ? 'absolute' : 'relative',
                width: `${itemSize}px`,
                height: `${itemSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isDragging ? 'grabbing' : 'pointer',
                zIndex: isDragging ? 60 : 1,
                transform: isDragging
                  ? `translate3d(${dragOffsetX}px, ${dragOffsetY}px, 0)`
                  : `translate3d(${shiftXPercent}%, ${shiftYPx}px, 0)`,
                transition: isDragging
                  ? 'none'
                  : 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* 大尺寸圆润轻拟物按钮主体 */}
              <div
                className={`nm-rebound-btn nm-btn-circle ${isPressed ? 'nm-pressed' : ''} ${isDragging ? 'nm-dragging' : ''} ${isActive ? 'active' : ''}`}
                style={{
                  width: `${itemSize}px`,
                  height: `${itemSize}px`,
                  borderRadius: '50%',
                  color: isPressed || isActive ? '#5096C6' : '#475971',
                  backgroundColor: 'var(--nm-bg)',
                  border: '1px solid rgba(255, 255, 255, 0.55)',
                  // 深度内凹雕刻阴影（按下瞬间呈现）与悬浮深漫反射阴影（拖拽升空）
                  boxShadow: isPressed
                    ? 'inset 4px 4px 9px rgba(150, 168, 190, 0.85), inset -4px -4px 9px rgba(255, 255, 255, 0.98)'
                    : isDragging
                    ? '10px 12px 28px rgba(150, 170, 195, 0.65), -8px -10px 24px rgba(255, 255, 255, 0.95)'
                    : '5px 5px 12px rgba(160, 175, 195, 0.52), -5px -5px 12px rgba(255, 255, 255, 0.96)',
                  transform: isPressed
                    ? 'scale(0.92)'
                    : isDragging
                    ? 'scale(1.15)'
                    : 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: isPressed
                    ? 'transform 0.06s ease-out, box-shadow 0.06s ease-out'
                    : 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s ease',
                }}
              >
                {item.icon}

                {/* 红点未读提示 */}
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
          </div>
        );
      })}
    </div>
  );
};
