import React, { useState } from 'react';
import { CapsuleColorKey, CAPSULE_COLORS, PRESET_ICONS, GachaPalette } from '../core/gachaTypes';
import { gachaAudio } from '../core/gachaAudio';
import { X, Plus } from 'lucide-react';

interface AddWishModalProps {
  palette: GachaPalette;
  onClose: () => void;
  onSubmit: (content: string, colorKey: CapsuleColorKey, icon: string) => void;
}

export const AddWishModal: React.FC<AddWishModalProps> = ({
  palette,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<CapsuleColorKey>('pink');
  const [selectedIcon, setSelectedIcon] = useState<string>('🎬');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    gachaAudio.playDropIn();
    onSubmit(content.trim(), selectedColor, selectedIcon);
    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(26, 20, 22, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 320,
          background: '#FFFDF7',
          border: `3px solid ${palette.secondary}`,
          borderRadius: 22,
          padding: 20,
          boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
        }}
      >
        {/* 顶部标题与关闭 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 900, color: '#3A2E2B' }}>
            放入心愿纸条
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8C7D73',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 心愿输入框 */}
          <textarea
            autoFocus
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下一件想做却一直没做的事..."
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 14,
              border: `2px solid ${palette.secondary}`,
              background: '#FFFFFF',
              color: '#332724',
              fontSize: 15,
              fontWeight: 600,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
            }}
          />

          {/* 胶囊外壳颜色选择 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#8C7D73', marginBottom: 8 }}>
              胶囊颜色
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {(Object.keys(CAPSULE_COLORS) as CapsuleColorKey[]).map((cKey) => {
                const isSelected = selectedColor === cKey;
                const col = CAPSULE_COLORS[cKey];
                return (
                  <button
                    key={cKey}
                    type="button"
                    onClick={() => setSelectedColor(cKey)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      border: `2px solid ${palette.secondary}`,
                      background: `linear-gradient(135deg, ${col.top} 50%, #FFFFFF 50%)`,
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.22)' : 'none',
                      boxShadow: isSelected ? `0 0 0 3px ${palette.accent}` : 'none',
                      transition: 'transform 0.15s',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* 纸条图标选择 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#8C7D73', marginBottom: 8 }}>
              心愿印章
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {PRESET_ICONS.slice(0, 10).map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    border: selectedIcon === icon ? `2px solid ${palette.secondary}` : '2px solid transparent',
                    background: selectedIcon === icon ? '#FFF0D4' : '#F5EFE3',
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transform: selectedIcon === icon ? 'scale(1.1)' : 'none',
                    transition: 'transform 0.15s, background 0.15s',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={!content.trim()}
            style={{
              marginTop: 6,
              width: '100%',
              padding: '12px 0',
              borderRadius: 14,
              border: `2px solid ${palette.secondary}`,
              background: content.trim()
                ? `linear-gradient(180deg, ${palette.primary}, ${palette.secondary})`
                : '#DDD2C5',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 16,
              cursor: content.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: content.trim() ? `0 4px 0 ${palette.secondary}` : 'none',
              transition: 'transform 0.1s',
            }}
          >
            <Plus size={18} strokeWidth={3} />
            <span>放入扭蛋机</span>
          </button>
        </form>
      </div>
    </div>
  );
};
