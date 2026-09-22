import React from 'react';

interface AppIconProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  badge?: number | string;
  onClick: (id: string) => void;
}

export const AppIcon: React.FC<AppIconProps> = ({ id, name, icon, badge, onClick }) => {
  return (
    <div
      onClick={() => onClick(id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        width: '64px',
        transition: 'transform 0.15s ease',
      }}
      className="app-icon-item"
    >
      <div
        className="nm-btn nm-btn-circle-lg"
        style={{
          position: 'relative',
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--nm-text-main)',
        }}
      >
        {icon}

        {/* 红点未读角标 */}
        {badge ? (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'var(--nm-accent-red)',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '10px',
              boxShadow: '0 2px 5px rgba(255, 94, 126, 0.5)',
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--nm-text-main)',
          textAlign: 'center',
          letterSpacing: '0.2px',
        }}
      >
        {name}
      </span>
    </div>
  );
};
