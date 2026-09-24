import React, { useState } from 'react';
import { FilePlus, X, Check } from 'lucide-react';

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, content: string) => Promise<void>;
}

export const NewFileModal: React.FC<NewFileModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setLoading(true);
    try {
      await onCreate(cleanTitle, content);
      setTitle('');
      setContent('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'rgba(20, 30, 45, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-convex-lg)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--nm-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 10px rgba(80, 150, 198, 0.35)',
              }}
            >
              <FilePlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--nm-text-main)' }}>新建 Markdown 笔记</h3>
              <p style={{ fontSize: '11px', color: 'var(--nm-text-sub)' }}>保存为 .md 文档放入当前文件夹</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--nm-text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nm-text-sub)', marginBottom: '6px', display: 'block' }}>
              笔记标题
            </label>
            <div
              style={{
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-inset-sm)',
                borderRadius: '14px',
                padding: '10px 14px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <input
                type="text"
                placeholder="例如: 会议纪要与行动项"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                maxLength={60}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '14px',
                  color: 'var(--nm-text-main)',
                  fontWeight: 500,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nm-text-sub)', marginBottom: '6px', display: 'block' }}>
              初始内容 (可选)
            </label>
            <div
              style={{
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-inset-sm)',
                borderRadius: '14px',
                padding: '10px 14px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <textarea
                placeholder="支持 Markdown 语法，如 # 一级标题、- 待办列表等..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  color: 'var(--nm-text-main)',
                  lineHeight: '1.5',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '14px',
                border: 'none',
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-convex-xs)',
                color: 'var(--nm-text-sub)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '14px',
                border: 'none',
                background: title.trim() ? 'var(--nm-primary)' : 'var(--nm-bg-darker)',
                color: title.trim() ? '#fff' : 'var(--nm-text-muted)',
                boxShadow: title.trim() ? '0 4px 12px rgba(80, 150, 198, 0.4)' : 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: title.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Check size={16} />
              {loading ? '创建中...' : '保存笔记'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
