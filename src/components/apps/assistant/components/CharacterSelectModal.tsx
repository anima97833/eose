import React, { useRef } from 'react';
import { X, Check, Upload, Trash2, Sparkles, User } from 'lucide-react';
import { CharacterProfile } from '../../../../types/character';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterProfile[];
  selectedCharacterId: string | null;
  onSelectCharacter: (charId: string) => void;
  customAvatarUrl: string | null;
  onUploadCustomAvatar: (dataUrl: string | null) => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  onClose,
  characters,
  selectedCharacterId,
  onSelectCharacter,
  customAvatarUrl,
  onUploadCustomAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUploadCustomAvatar(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(5, 11, 20, 0.72)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '75vh',
          backgroundColor: '#0f172a',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '18px 16px 24px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '10px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="#facc15" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
              切换星空伴侣与草地形象
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 自定义图片上传横幅 */}
        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.65)',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {customAvatarUrl ? (
              <img
                src={customAvatarUrl}
                alt="自定义形象"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #38bdf8',
                }}
              />
            ) : (
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Upload size={18} />
              </div>
            )}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>
                {customAvatarUrl ? '自定义草地立绘已生效' : '上传专属草地形象'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {customAvatarUrl ? '保存在本地 IndexedDB 中' : '支持任何照片/二次元角色/萌宠立绘'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {customAvatarUrl ? '替换' : '上传'}
            </button>
            {customAvatarUrl && (
              <button
                type="button"
                onClick={() => onUploadCustomAvatar(null)}
                title="清除自定义图片，恢复角色原图或小兔"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 微聊角色列表 */}
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
          选择微聊角色（自动装载语气与人设）：
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '4px',
          }}
        >
          {/* 选项 0：默认背包小兔 */}
          <div
            onClick={() => onSelectCharacter('')}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: !selectedCharacterId ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.04)',
              border: !selectedCharacterId ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                🐰
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  小兔学伴 (默认童话学伴)
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  温柔、治愈、充满好奇心的星空小向导
                </div>
              </div>
            </div>
            {!selectedCharacterId && <Check size={16} color="#38bdf8" />}
          </div>

          {/* 微聊所有角色 */}
          {characters.map((char) => {
            const isSelected = selectedCharacterId === char.id;
            return (
              <div
                key={char.id}
                onClick={() => onSelectCharacter(char.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={char.avatar}
                    alt={char.name}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                      {char.name}
                      {char.title && (
                        <span style={{ fontSize: '10px', color: '#facc15', marginLeft: '6px', fontWeight: 600 }}>
                          [{char.title}]
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        maxWidth: '220px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {char.persona || char.description || '微聊伙伴'}
                    </div>
                  </div>
                </div>
                {isSelected && <Check size={16} color="#38bdf8" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
