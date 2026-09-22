import React, { useState } from 'react';
import { X, Upload, RotateCcw, Check } from 'lucide-react';

interface BannerUploadModalProps {
  currentBanner: string | null;
  onSave: (url: string | null) => void;
  onClose: () => void;
}

export const BannerUploadModal: React.FC<BannerUploadModalProps> = ({
  currentBanner,
  onSave,
  onClose,
}) => {
  const [preview, setPreview] = useState<string | null>(currentBanner);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    onSave(preview);
    onClose();
  };

  const handleResetDefault = () => {
    setPreview(null);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 95,
        background: 'rgba(25, 20, 20, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '320px',
          background: '#FFFDF7',
          border: '3px solid #502428',
          borderRadius: '24px',
          boxShadow: '0 10px 28px rgba(80, 36, 40, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            background: 'linear-gradient(180deg, #F5BA38 0%, #D97706 100%)',
            borderBottom: '2.5px solid #502428',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 900,
              color: '#FFFFFF',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              textShadow: '1px 1px 0 #502428, -1px -1px 0 #502428, 1px -1px 0 #502428, -1px 1px 0 #502428',
            }}
          >
            自定义背景
          </span>
          <button
            onClick={onClose}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#FAF4E8',
              border: '2px solid #502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} color="#502428" strokeWidth={3} />
          </button>
        </div>

        {/* 预览区域 */}
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              width: '100%',
              height: '110px',
              borderRadius: '14px',
              border: '2px solid #502428',
              overflow: 'hidden',
              background: preview ? 'transparent' : 'linear-gradient(180deg, #38BDF8 0%, #BAE6FD 60%, #4ADE80 60%, #22C55E 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {preview ? (
              <img src={preview} alt="背景预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  color: '#065F46',
                  fontFamily: '"ZCOOL KuaiLe", sans-serif',
                  background: 'rgba(255,255,255,0.8)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #502428',
                }}
              >
                当前：原画蓝天草地
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <label
              style={{
                flex: 1,
                height: '34px',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: '1.8px solid #502428',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '11.5px',
                fontWeight: 800,
                color: '#502428',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = '';
                }}
                onChange={handleFileChange}
              />
              <Upload size={13} strokeWidth={2.5} />
              <span>本地上传</span>
            </label>

            {preview && (
              <button
                onClick={handleResetDefault}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  background: '#F3EFE6',
                  border: '1.8px solid #502428',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: '#87470E',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} />
                <span>恢复预设</span>
              </button>
            )}
          </div>
        </div>

        {/* 底部确认 */}
        <div style={{ padding: '0 14px 14px', display: 'flex', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '12px',
              background: '#F3EFE6',
              border: '2px solid #502428',
              fontSize: '12px',
              fontWeight: 900,
              color: '#502428',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)',
              border: '2px solid #502428',
              boxShadow: '0 2px 0 #B45309',
              fontSize: '12.5px',
              fontWeight: 900,
              color: '#502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Check size={14} strokeWidth={3} />
            <span>确定保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
