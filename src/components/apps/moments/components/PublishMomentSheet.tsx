import React, { useState } from 'react';
import { X, Plus, Image as ImageIcon, Trash2, Sparkles } from 'lucide-react';
import { MomentItem } from '../../../../core/moments/momentsTypes';

interface PublishMomentSheetProps {
  onPublish: (moment: MomentItem) => void;
  onClose: () => void;
}

const THEME_OPTIONS = [
  '今日碎碎念',
  '晨间随想',
  '生活瞬间',
  '灵感火花',
  '深夜低语',
];

export const PublishMomentSheet: React.FC<PublishMomentSheetProps> = ({
  onPublish,
  onClose,
}) => {
  const [themeTitle, setThemeTitle] = useState('今日碎碎念');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // 多图上传转 Base64，准备存入 IndexedDB
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readPromises: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      readPromises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
      );
    }

    Promise.all(readPromises).then((results) => {
      setImages((prev) => [...prev, ...results]);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirmPublish = () => {
    if (!content.trim() && images.length === 0) {
      alert('请写点碎碎念吧～');
      return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(
      today.getDate()
    ).padStart(2, '0')}`;

    const newMoment: MomentItem = {
      id: `moment_${Date.now()}`,
      themeTitle,
      content: content.trim(),
      images,
      rewardCoins: 5000,
      isStarred: false,
      createdAt: Date.now(),
      dateStr,
    };

    onPublish(newMoment);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
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
      {/* 弹层卡片 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
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
        {/* 顶部木质标题栏 */}
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
              fontSize: '15px',
              fontWeight: 900,
              color: '#FFFFFF',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              textShadow: '1px 1px 0 #502428, -1px -1px 0 #502428, 1px -1px 0 #502428, -1px 1px 0 #502428',
            }}
          >
            写碎碎念
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
              boxShadow: '0 1.5px 0 #502428',
            }}
          >
            <X size={14} color="#502428" strokeWidth={3} />
          </button>
        </div>

        {/* 内容输入体 */}
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 主题标签选择器 */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#87470E',
                marginBottom: '5px',
              }}
            >
              选择主题木标
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {THEME_OPTIONS.map((t) => {
                const isSelected = themeTitle === t;
                return (
                  <button
                    key={t}
                    onClick={() => setThemeTitle(t)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: '1.5px solid #502428',
                      background: isSelected ? '#FBBF24' : '#F3EFE6',
                      color: isSelected ? '#502428' : '#78350F',
                      boxShadow: isSelected ? '0 2px 0 #B45309' : '0 1.5px 0 #502428',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 文本输入框 */}
          <div
            style={{
              width: '100%',
              height: '96px',
              background: '#FFFFFF',
              border: '2px solid #502428',
              borderRadius: '12px',
              padding: '8px',
              boxSizing: 'border-box',
              boxShadow: 'inset 0 1.5px 3px rgba(0,0,0,0.06)',
            }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享今日小发现、奇思妙想或悄悄话..."
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                background: 'transparent',
                fontSize: '12px',
                lineHeight: '18px',
                fontWeight: 600,
                color: '#451A03',
                padding: 0,
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* 图片上传区域 */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#87470E',
                marginBottom: '5px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>生活照片（保存在本地）</span>
              <span style={{ fontSize: '10px', color: '#9C7A5B' }}>{images.length}/6 张</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    width: '54px',
                    height: '54px',
                    borderRadius: '10px',
                    border: '1.8px solid #502428',
                    overflow: 'hidden',
                  }}
                >
                  <img src={img} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'rgba(80, 36, 40, 0.85)',
                      border: 'none',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}

              {images.length < 6 && (
                <label
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '10px',
                    border: '1.8px dashed #87470E',
                    background: '#FAF6EE',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#87470E',
                    gap: '2px',
                  }}
                  title="上传图片"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = '';
                    }}
                    onChange={handleFileChange}
                  />
                  <Plus size={18} strokeWidth={2.5} />
                  <span style={{ fontSize: '9px', fontWeight: 800 }}>传图</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮栏 */}
        <div
          style={{
            padding: '8px 14px 14px',
            display: 'flex',
            gap: '10px',
            borderTop: '1px solid #F3EFE6',
          }}
        >
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
            onClick={handleConfirmPublish}
            style={{
              flex: 2,
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)',
              border: '2px solid #502428',
              boxShadow: '0 2.5px 0 #B45309',
              fontSize: '13px',
              fontWeight: 900,
              color: '#502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} color="#87470E" />
            <span>发布 (+5000)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
