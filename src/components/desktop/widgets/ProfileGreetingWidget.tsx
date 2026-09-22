import React from 'react';

interface ProfileGreetingWidgetProps {
  name?: string;
  avatarUrl?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const ProfileGreetingWidget: React.FC<ProfileGreetingWidgetProps> = ({
  name = 'Hasna!',
  avatarUrl,
  subtitle = 'How are you?',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="nm-card-sm"
      style={{
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        height: '100%',
        borderRadius: '20px',
        transition: 'transform 0.15s ease',
      }}
      title="点击查看角色档案"
    >
      {/* 双层同心拟物立体头像底座（精确复刻参考图） */}
      <div
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          backgroundColor: 'var(--nm-bg)',
          boxShadow: 'var(--nm-convex-round)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
          padding: '3px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            boxShadow: 'var(--nm-inset-sm)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1E232A',
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 35% 35%, #4C596D, #1A222D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              H
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          fontSize: '13px',
          fontWeight: 800,
          color: '#475971',
          marginBottom: '2px',
          letterSpacing: '0.1px',
        }}
      >
        Hi, {name}
      </div>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: '#8E9EAF',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};
