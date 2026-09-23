import React, { useState, useRef } from 'react';
import { X, Upload, Link, Check, RefreshCw, Image as ImageIcon, Sparkles } from 'lucide-react';

interface AvatarUploadModalProps {
  currentUrl: string | null;
  currentBgUrl?: string | null;
  onSave: (url: string | null) => void;
  onSaveBg?: (url: string | null) => void | Promise<void>;
  onClose: () => void;
  defaultTab?: 'avatar' | 'background';
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  currentUrl,
  currentBgUrl = null,
  onSave,
  onSaveBg,
  onClose,
  defaultTab = 'avatar',
}) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'background'>(defaultTab);

  // 立绘状态
  const [avatarInput, setAvatarInput] = useState(currentUrl || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUrl);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // 背景状态
  const [bgInput, setBgInput] = useState(currentBgUrl || '');
  const [bgPreview, setBgPreview] = useState<string | null>(currentBgUrl);
  const bgFileRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarInput('');
    };
    reader.readAsDataURL(file);
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBgPreview(result);
      setBgInput('');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    // 保存立绘
    const finalAvatar = avatarPreview || (avatarInput.trim() ? avatarInput.trim() : null);
    onSave(finalAvatar);

    // 保存背景（存入 IndexedDB）
    if (onSaveBg) {
      const finalBg = bgPreview || (bgInput.trim() ? bgInput.trim() : null);
      onSaveBg(finalBg);
    }

    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 99,
        background: 'rgba(33, 48, 71, 0.45)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="nm-card"
        style={{
          width: '100%',
          maxWidth: '340px',
          background: '#E9EEF5',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 20px 40px rgba(166, 180, 200, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* 顶部标题与关闭按钮 */}
        <div
          style={{
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* 二合一双选项胶囊切换栏 */}
          <div
            className="nm-inset-sm"
            style={{
              display: 'flex',
              padding: '3px',
              borderRadius: '20px',
              gap: '4px',
              background: '#DCE4EE',
            }}
          >
            <button
              onClick={() => setActiveTab('avatar')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                background:
                  activeTab === 'avatar'
                    ? 'linear-gradient(135deg, #5096C6, #3B82F6)'
                    : 'transparent',
                color: activeTab === 'avatar' ? '#ffffff' : '#64748B',
                boxShadow:
                  activeTab === 'avatar'
                    ? '0 2px 6px rgba(59, 130, 246, 0.35)'
                    : 'none',
              }}
            >
              <Sparkles size={13} />
              角色立绘
            </button>

            <button
              onClick={() => setActiveTab('background')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                background:
                  activeTab === 'background'
                    ? 'linear-gradient(135deg, #5096C6, #3B82F6)'
                    : 'transparent',
                color: activeTab === 'background' ? '#ffffff' : '#64748B',
                boxShadow:
                  activeTab === 'background'
                    ? '0 2px 6px rgba(59, 130, 246, 0.35)'
                    : 'none',
              }}
            >
              <ImageIcon size={13} />
              更换背景
            </button>
          </div>

          <button
            onClick={onClose}
            className="nm-btn"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7D8CA3',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* 内容区域：选项一：角色立绘 */}
        {activeTab === 'avatar' && (
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              className="nm-inset"
              style={{
                width: '130px',
                height: '180px',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                position: 'relative',
              }}
            >
              {avatarPreview || avatarInput ? (
                <img
                  src={avatarPreview || avatarInput}
                  alt="立绘预览"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={() => {}}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={24} color="#A3B1C6" />
                  <span style={{ fontSize: '12px', color: '#A3B1C6' }}>暂无立绘</span>
                </div>
              )}
            </div>

            {/* 本地上传按钮 */}
            <input
              type="file"
              ref={avatarFileRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarFileChange}
            />

            <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '12px' }}>
              <button
                onClick={() => avatarFileRef.current?.click()}
                className="nm-btn"
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: '12px',
                  color: '#5096C6',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <Upload size={14} />
                本地上传
              </button>

              <button
                onClick={() => {
                  setAvatarPreview(null);
                  setAvatarInput('');
                }}
                className="nm-btn"
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  color: '#7D8CA3',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <RefreshCw size={13} />
                重置
              </button>
            </div>

            {/* URL 输入框 */}
            <div
              className="nm-inset-sm"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '12px',
                padding: '8px 12px',
                gap: '6px',
              }}
            >
              <Link size={14} color="#A3B1C6" />
              <input
                type="text"
                placeholder="或输入图片直链地址"
                value={avatarInput}
                onChange={(e) => {
                  setAvatarInput(e.target.value);
                  setAvatarPreview(null);
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '12px',
                  width: '100%',
                  color: '#334257',
                }}
              />
            </div>
          </div>
        )}

        {/* 内容区域：选项二：更换背景（存入 IndexedDB） */}
        {activeTab === 'background' && (
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* 舞台背板预览框 (宽屏比例) */}
            <div
              className="nm-inset"
              style={{
                width: '100%',
                height: '160px',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                position: 'relative',
                background: bgPreview || bgInput ? 'transparent' : 'radial-gradient(circle, #FFFFFF 0%, #E9EEF5 70%)',
              }}
            >
              {bgPreview || bgInput ? (
                <img
                  src={bgPreview || bgInput}
                  alt="背景背板预览"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => {}}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={28} color="#94A3B8" />
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>
                    默认背景（柔光穹顶舞台）
                  </span>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                    上传后将替换舞台背板
                  </span>
                </div>
              )}

              {/* 预览角标 */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(33, 48, 71, 0.6)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                }}
              >
                舞台背板
              </div>
            </div>

            {/* 本地上传背景图片 */}
            <input
              type="file"
              ref={bgFileRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleBgFileChange}
            />

            <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '10px' }}>
              <button
                onClick={() => bgFileRef.current?.click()}
                className="nm-btn"
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: '12px',
                  color: '#5096C6',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <Upload size={14} />
                本地上传背景
              </button>

              <button
                onClick={() => {
                  setBgPreview(null);
                  setBgInput('');
                }}
                className="nm-btn"
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  color: '#7D8CA3',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
                title="恢复默认背景"
              >
                <RefreshCw size={13} />
                恢复默认
              </button>
            </div>

            {/* URL 输入框 */}
            <div
              className="nm-inset-sm"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '12px',
                padding: '8px 12px',
                gap: '6px',
                marginBottom: '8px',
              }}
            >
              <Link size={14} color="#A3B1C6" />
              <input
                type="text"
                placeholder="或输入背景图片直链"
                value={bgInput}
                onChange={(e) => {
                  setBgInput(e.target.value);
                  setBgPreview(null);
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '12px',
                  width: '100%',
                  color: '#334257',
                }}
              />
            </div>

            {/* IndexedDB 存储说明提示 */}
            <div
              style={{
                fontSize: '11px',
                color: '#64748B',
                background: 'rgba(80, 150, 198, 0.08)',
                padding: '5px 10px',
                borderRadius: '8px',
                width: '100%',
                textAlign: 'center',
                border: '1px solid rgba(80, 150, 198, 0.18)',
              }}
            >
              💾 图片将自动保存至本地 IndexedDB 数据库
            </div>
          </div>
        )}

        {/* 底部确认栏 */}
        <div
          style={{
            padding: '12px 18px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.8)',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            onClick={onClose}
            className="nm-btn"
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: '12px',
              color: '#7D8CA3',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="nm-btn"
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: '12px',
              background: '#5096C6',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              border: 'none',
              boxShadow: '0 4px 10px rgba(80, 150, 198, 0.35)',
            }}
          >
            <Check size={14} />
            保存应用
          </button>
        </div>
      </div>
    </div>
  );
};
