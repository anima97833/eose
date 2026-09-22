import React, { useState, useRef, useCallback } from 'react';

interface SliderWidgetProps {
  initialValue?: number;
  onChange?: (val: number) => void;
}

export const SliderWidget: React.FC<SliderWidgetProps> = ({ initialValue = 87, onChange }) => {
  const [value, setValue] = useState<number>(initialValue);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  const calculateValueFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const rawPos = (clientX - rect.left) / rect.width;
      const clamped = Math.max(0, Math.min(100, Math.round(rawPos * 100)));
      setValue(clamped);
      onChange?.(clamped);
    },
    [onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    calculateValueFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    calculateValueFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'relative',
        width: '100%',
        height: '42px',
        backgroundColor: 'var(--nm-bg)',
        borderRadius: '21px',
        boxShadow: 'var(--nm-inset)',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        touchAction: 'none',
        overflow: 'hidden',
        padding: '2px',
      }}
    >
      {/* 蓝色已填充区域（对标参考图 #5096C6） */}
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          borderRadius: '19px 0 0 19px',
          background: '#5096C6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: value > 25 ? 'flex-start' : 'center',
          paddingLeft: '14px',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 700,
          transition: isDragging.current ? 'none' : 'width 0.1s ease',
          pointerEvents: 'none',
        }}
      >
        {value > 15 ? `${value}%` : ''}
      </div>

      {/* 圆形轻拟物浮雕手柄 */}
      <div
        style={{
          position: 'absolute',
          left: `calc(${value}% - 19px)`,
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: 'var(--nm-bg)',
          boxShadow: '3px 3px 8px rgba(166, 180, 200, 0.55), -3px -3px 8px rgba(255, 255, 255, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 10,
          transition: isDragging.current ? 'none' : 'left 0.1s ease',
        }}
      />

      {/* 右侧刻度与 100% 标签 */}
      <div
        style={{
          position: 'absolute',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#7E8F9E',
          fontSize: '11px',
          fontWeight: 600,
          pointerEvents: 'none',
          opacity: value > 75 ? 0.15 : 0.85,
          transition: 'opacity 0.2s ease',
        }}
      >
        <span style={{ letterSpacing: '3px', opacity: 0.5 }}>| |</span>
        <span>100%</span>
      </div>
    </div>
  );
};
