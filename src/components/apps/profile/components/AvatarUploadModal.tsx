import React, { useState, useRef } from 'react';
import { X, Upload, Link, Check, RefreshCw } from 'lucide-react';

interface AvatarUploadModalProps {
  currentUrl: string | null;
  onSave: (url: string | null) => void;
  onClose: () => void;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  currentUrl,
  onSave,
  onClose,
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 读取本地图片转为 Base64
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setUrlInput('');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    onSave(preview || (urlInput.trim() ? urlInput.trim() : null));
    onClose();
  };

  const handleClear = () => {
    setPreview(null);
    setUrlInput('');
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
          maxWidth: '320px',
          background: '#E9EEF5',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 20px 40px rgba(166, 180, 200, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#334257' }}>
            更换立绘
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

        {/* 预览区域 */}
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
            }}
          >
            {preview || urlInput ? (
              <img
                src={preview || urlInput}
                alt="立绘预览"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => {}}
              />
            ) : (
              <span style={{ fontSize: '12px', color: '#A3B1C6' }}>暂无立绘</span>
            )}
          </div>

          {/* 本地上传按钮 */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '12px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
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
              onClick={handleClear}
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
              placeholder="或输入图片地址"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setPreview(null);
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
            }}
          >
            <Check size={14} />
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
