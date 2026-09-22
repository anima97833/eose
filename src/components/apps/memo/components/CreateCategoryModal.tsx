import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { MemoCategory } from '../../../../core/memo/memoTypes';

interface CreateCategoryModalProps {
  onSave: (category: MemoCategory) => void;
  onClose: () => void;
  existingCount: number;
}

const PRESET_COLORS = ['#D97706', '#059669', '#2563EB', '#DC2626', '#7C3AED', '#DB2777', '#4B5563'];
const PRESET_ICONS = [
  { id: 'book', label: '📖 书籍' },
  { id: 'wallet', label: '💰 记账' },
  { id: 'check', label: '✅ 清单' },
  { id: 'heart', label: '💖 心情' },
  { id: 'star', label: '⭐ 灵感' },
  { id: 'folder', label: '📁 归档' },
];

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  onSave,
  onClose,
  existingCount,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat: MemoCategory = {
      id: `cat_${Date.now()}`,
      name: name.trim().slice(0, 6),
      icon: selectedIcon,
      color: selectedColor,
      order: existingCount,
      createdAt: Date.now(),
    };
    onSave(newCat);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 120,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '300px',
          background: '#FFFBEB',
          border: '3px solid #502428',
          borderRadius: '22px',
          boxShadow: '0 8px 0 #502428, 0 16px 28px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 弹窗顶条 */}
        <div
          style={{
            background: 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)',
            borderBottom: '2.5px solid #502428',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 900,
              color: '#FFFFFF',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
              textShadow: '1px 1px 0 #502428, -1px -1px 0 #502428',
            }}
          >
            🏷️ 新增标签分类
          </span>
          <button
            onClick={onClose}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '2px solid #502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={14} color="#502428" strokeWidth={3} />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#502428', marginBottom: '6px' }}>
              分类名称（如：记账、随笔）
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入分类名 (最多6字)"
              maxLength={6}
              autoFocus
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px',
                borderRadius: '12px',
                border: '2px solid #502428',
                background: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                color: '#502428',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 选择图标 */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#502428', marginBottom: '6px' }}>
              选择书签图标
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => setSelectedIcon(icon.id)}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '10px',
                    border: '2px solid #502428',
                    background: selectedIcon === icon.id ? '#FDE68A' : '#FFFFFF',
                    boxShadow: selectedIcon === icon.id ? 'inset 0 2px 0 rgba(0,0,0,0.1)' : 'none',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#502428',
                    cursor: 'pointer',
                  }}
                >
                  {icon.label}
                </button>
              ))}
            </div>
          </div>

          {/* 选择书签色 */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#502428', marginBottom: '6px' }}>
              书签颜色
            </label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {PRESET_COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: c,
                    border: '2px solid #502428',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: selectedColor === c ? '0 0 0 2px #FFFFFF, 0 0 0 4px #502428' : 'none',
                  }}
                >
                  {selectedColor === c && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </div>
              ))}
            </div>
          </div>

          {/* 提交按钮 */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '12px',
                background: '#FFFFFF',
                border: '2px solid #502428',
                fontSize: '13px',
                fontWeight: 800,
                color: '#502428',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '12px',
                background: name.trim() ? '#10B981' : '#A7F3D0',
                border: '2px solid #502428',
                fontSize: '13px',
                fontWeight: 800,
                color: '#FFFFFF',
                boxShadow: name.trim() ? '0 2px 0 #047857' : 'none',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              确定新增
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
