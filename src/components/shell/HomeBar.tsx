import React from 'react';

interface HomeBarProps {
  onClick?: () => void;
}

export const HomeBar: React.FC<HomeBarProps> = () => {
  return (
    <div
      style={{
        width: '100%',
        paddingTop: '8px',
        paddingBottom: 'calc(var(--sab) + 10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        pointerEvents: 'none', // 彻底防止误触，点击无事发生
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '136px',
          height: '5px',
          borderRadius: '3px',
          backgroundColor: 'var(--nm-text-muted)',
          opacity: 0.5,
          boxShadow: 'var(--nm-convex-xs)',
        }}
      />
    </div>
  );
};
