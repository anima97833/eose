import React, { useState } from 'react';
import { FolderPlus, X, Check } from 'lucide-react';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = folderName.trim();
    if (!cleanName) return;

    setLoading(true);
    try {
      await onCreate(cleanName);
      setFolderName('');
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
          maxWidth: '340px',
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-convex-lg)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
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
              <FolderPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--nm-text-main)' }}>新建文件夹</h3>
              <p style={{ fontSize: '11px', color: 'var(--nm-text-sub)' }}>在当前目录下创建新分类</p>
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
              borderRadius: '50%',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-inset-sm)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <input
              type="text"
              placeholder="请输入文件夹名称 (如: 工作笔记)"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
              maxLength={40}
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
              disabled={!folderName.trim() || loading}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '14px',
                border: 'none',
                background: folderName.trim() ? 'var(--nm-primary)' : 'var(--nm-bg-darker)',
                color: folderName.trim() ? '#fff' : 'var(--nm-text-muted)',
                boxShadow: folderName.trim() ? '0 4px 12px rgba(80, 150, 198, 0.4)' : 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: folderName.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Check size={16} />
              {loading ? '创建中...' : '确定创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
