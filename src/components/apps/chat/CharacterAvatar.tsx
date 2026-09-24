import React from 'react';

interface CharacterAvatarProps {
  avatar?: string;
  name?: string;
  size?: number | string;
  defaultEmoji?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  avatar,
  name,
  size = 40,
  defaultEmoji = '🌸',
  className = 'nm-card-sm',
  style,
}) => {
  const isImage =
    typeof avatar === 'string' &&
    (avatar.startsWith('data:image/') ||
      avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('blob:') ||
      avatar.length > 30);

  const dim = typeof size === 'number' ? `${size}px` : size;
  const numSize = typeof size === 'number' ? size : parseInt(size, 10) || 40;

  return (
    <div
      className={className}
      style={{
        width: dim,
        height: dim,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: 'var(--nm-bg, #E9EEF5)',
        ...style,
      }}
    >
      {isImage ? (
        <img
          src={avatar}
          alt={name || '头像'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <span style={{ fontSize: `${Math.round(numSize * 0.48)}px`, lineHeight: 1 }}>
          {avatar || defaultEmoji}
        </span>
      )}
    </div>
  );
};
