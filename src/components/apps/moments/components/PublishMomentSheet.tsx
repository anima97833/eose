import React, { useState, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, Trash2, Sparkles, Check } from 'lucide-react';
import { MomentItem, MomentAttributeTag } from '../../../../core/moments/momentsTypes';
import {
  PRESET_THEMES,
  getCustomThemes,
  saveCustomTheme,
  deleteCustomTheme,
  MOMENT_ATTR_INFO,
} from '../../../../core/moments/momentsStorage';

interface PublishMomentSheetProps {
  onPublish: (moment: MomentItem) => void;
  onClose: () => void;
}

export const PublishMomentSheet: React.FC<PublishMomentSheetProps> = ({
  onPublish,
  onClose,
}) => {
  const [customThemes, setCustomThemes] = useState<string[]>([]);
  const [themeTitle, setThemeTitle] = useState('今日碎碎念');
  const [selectedAttr, setSelectedAttr] = useState<MomentAttributeTag>('CHA');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    setCustomThemes(getCustomThemes());
  }, []);

  // 根据选择的木标自动建议六维属性
  const handleSelectTheme = (t: string) => {
    setThemeTitle(t);
    if (t.includes('晨') || t.includes('生活') || t.includes('运动')) {
      setSelectedAttr('CON');
    } else if (t.includes('灵感') || t.includes('思') || t.includes('学') || t.includes('书')) {
      setSelectedAttr('INT');
    } else if (t.includes('夜') || t.includes('冥想') || t.includes('随想')) {
      setSelectedAttr('SPI');
    } else if (t.includes('碎碎念') || t.includes('聊') || t.includes('聚')) {
      setSelectedAttr('CHA');
    }
  };

  const handleAddCustomTheme = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    const updated = saveCustomTheme(trimmed);
    setCustomThemes(updated);
    setThemeTitle(trimmed);
    setCustomInput('');
    setIsAddingCustom(false);
  };

  const handleDeleteCustom = (e: React.MouseEvent, t: string) => {
    e.stopPropagation();
    const updated = deleteCustomTheme(t);
    setCustomThemes(updated);
    if (themeTitle === t) {
      setThemeTitle('今日碎碎念');
    }
  };

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
      id: `moment_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      themeTitle: themeTitle || '生活瞬间',
      content: content.trim(),
      images,
      attributeTag: selectedAttr,
      attributeGain: 2,
      rewardCoins: 50,
      isStarred: false,
      createdAt: Date.now(),
      dateStr,
    };

    onPublish(newMoment);
  };

  const allThemes = [...PRESET_THEMES, ...customThemes];
  const activeAttrInfo = MOMENT_ATTR_INFO[selectedAttr] || MOMENT_ATTR_INFO.SPI;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(54, 46, 34, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      {/* 弹窗卷轴本体 */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          maxHeight: '90vh',
          backgroundColor: '#FAF5EB',
          border: '2.5px solid #502428',
          borderRadius: '22px',
          boxShadow: '0 8px 0 #502428',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* 顶部木板抬头 */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>🪵</span>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 900,
                color: '#FFFFFF',
                textShadow: '1px 1px 0 #502428, -1px -1px 0 #502428, 1px -1px 0 #502428, -1px 1px 0 #502428',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              }}
            >
              写一段生活碎碎念
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#FFFFFF',
              border: '2px solid #502428',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
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
        <div
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: 'auto',
          }}
        >
          {/* 主题木标选择器 */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '5px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#87470E' }}>
                选择或自定义主题木标
              </div>
              {!isAddingCustom && (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D97706',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '2px 4px',
                  }}
                >
                  <Plus size={12} />
                  <span>新建木标</span>
                </button>
              )}
            </div>

            {/* 新建木标内联输入行 */}
            {isAddingCustom && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px',
                  padding: '4px 6px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFBEB',
                  border: '1.5px dashed #D97706',
                }}
              >
                <input
                  type="text"
                  placeholder="新木标名称(<=6字)"
                  maxLength={6}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #502428',
                    fontSize: '11px',
                    outline: 'none',
                    color: '#502428',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTheme}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#F59E0B',
                    color: '#502428',
                    border: '1.5px solid #502428',
                    fontSize: '10.5px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  添加
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#78350F',
                    fontSize: '10.5px',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
              </div>
            )}

            {/* 木标标签徽章列表 */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {allThemes.map((t) => {
                const isSelected = themeTitle === t;
                const isCustom = customThemes.includes(t);
                return (
                  <div
                    key={t}
                    onClick={() => handleSelectTheme(t)}
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{t}</span>
                    {isCustom && (
                      <span
                        onClick={(e) => handleDeleteCustom(e, t)}
                        title="删除自定义木标"
                        style={{
                          fontSize: '10px',
                          color: '#EF4444',
                          marginLeft: '2px',
                          padding: '0 2px',
                          fontWeight: 900,
                        }}
                      >
                        ✕
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 六维心境成长赋能 (方向 B) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#87470E', marginBottom: '5px' }}>
              修行成长归属 (发布获得对应六维 +2)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {(['SPI', 'CHA', 'INT', 'CON', 'DEX', 'STR'] as MomentAttributeTag[]).map((tagKey) => {
                const info = MOMENT_ATTR_INFO[tagKey];
                const isSel = selectedAttr === tagKey;
                return (
                  <button
                    key={tagKey}
                    type="button"
                    onClick={() => setSelectedAttr(tagKey)}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '8px',
                      border: isSel ? `2px solid ${info.color}` : '1.5px solid #D8C7A5',
                      backgroundColor: isSel ? info.bg : '#FFFFFF',
                      color: isSel ? info.color : '#78350F',
                      fontSize: '11px',
                      fontWeight: isSel ? 900 : 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      boxShadow: isSel ? `0 1.5px 0 ${info.color}` : 'none',
                    }}
                  >
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                    {isSel && <Check size={11} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 文本输入框 */}
          <div
            style={{
              width: '100%',
              height: '92px',
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
                boxSizing: 'border-box',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            />
          </div>

          {/* 图片预览与添加区域 */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#87470E', marginBottom: '5px' }}>
              生活相片 (树桩展台相框)
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {/* 已选图片展示 */}
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    width: '56px',
                    height: '56px',
                    borderRadius: '10px',
                    border: '2px solid #502428',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={img}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'rgba(80, 36, 40, 0.85)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <X size={10} color="#FFFFFF" strokeWidth={3} />
                  </button>
                </div>
              ))}

              {/* 上传按钮 */}
              <label
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '10px',
                  border: '2px dashed #87470E',
                  background: '#F5EFE6',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <ImageIcon size={18} color="#87470E" />
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#87470E', marginTop: '2px' }}>
                  传照片
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 底部按钮栏 */}
        <div
          style={{
            padding: '10px 14px',
            borderTop: '2px solid #E6DCCD',
            display: 'flex',
            gap: '8px',
            backgroundColor: '#F3EFE6',
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '2px solid #502428',
              boxShadow: '0 2px 0 #502428',
              fontSize: '12px',
              fontWeight: 800,
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
            <Sparkles size={14} color="#87470E" />
            <span>发布 (+{activeAttrInfo.name} +2)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
