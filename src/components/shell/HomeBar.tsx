import React from 'react';

interface HomeBarProps {
  onClick?: () => void;
}

export const HomeBar: React.FC<HomeBarProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: '100%',
        paddingTop: '8px',
        paddingBottom: 'calc(var(--sab) + 10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 50,
      }}
      title="点击返回桌面"
    >
      <div
        style={{
          width: '136px',
          height: '5px',
          borderRadius: '3px',
          backgroundColor: 'var(--nm-text-muted)',
          opacity: 0.6,
          boxShadow: 'var(--nm-convex-xs)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'scaleY(1.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.transform = 'scaleY(1)';
        }}
      />
    </div>
  );
};
