import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Camera, Sparkles, RotateCcw } from 'lucide-react';
import { RPGAttribute } from '../../../../core/rpg/types';
import {
  getAllAttributeImages,
  saveAttributeImage,
  deleteAttributeImage,
} from '../../../../core/rpg/attributeImageStorage';

interface AttributesSheetProps {
  attributes: Record<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA', RPGAttribute>;
  onClose: () => void;
}

// 属性专属主题色彩与预设徽标
const ATTR_THEME: Record<
  string,
  { name: string; short: string; color: string; fill: string; border: string; defaultIcon: string }
> = {
  STR: {
    name: '力量',
    short: 'STR',
    color: '#D9483B',
    fill: 'linear-gradient(90deg, #E05D44, #F97316)',
    border: '#F87171',
    defaultIcon: '🥊',
  },
  DEX: {
    name: '敏捷',
    short: 'DEX',
    color: '#D97706',
    fill: 'linear-gradient(90deg, #F59E0B, #EAB308)',
    border: '#FBBF24',
    defaultIcon: '⚡',
  },
  INT: {
    name: '智力',
    short: 'INT',
    color: '#2563EB',
    fill: 'linear-gradient(90deg, #3B82F6, #6366F1)',
    border: '#60A5FA',
    defaultIcon: '🧪',
  },
  SPI: {
    name: '精神',
    short: 'SPI',
    color: '#7C3AED',
    fill: 'linear-gradient(90deg, #8B5CF6, #A855F7)',
    border: '#A78BFA',
    defaultIcon: '🔮',
  },
  CON: {
    name: '体质',
    short: 'CON',
    color: '#059669',
    fill: 'linear-gradient(90deg, #10B981, #22C55E)',
    border: '#34D399',
    defaultIcon: '🛡️',
  },
  CHA: {
    name: '魅力',
    short: 'CHA',
    color: '#DB2777',
    fill: 'linear-gradient(90deg, #EC4899, #F43F5E)',
    border: '#F472B6',
    defaultIcon: '✨',
  },
};

export const AttributesSheet: React.FC<AttributesSheetProps> = ({
  attributes,
  onClose,
}) => {
  const attrList = Object.values(attributes);
  const totalScore = attrList.reduce((acc, cur) => acc + cur.value, 0);

  // IndexedDB 存储的六维图标映射：{ [attrKey]: base64DataUrl }
  const [iconMap, setIconMap] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedAttrKey, setSelectedAttrKey] = useState<string | null>(null);

  // 文件上传引用
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadKeyRef = useRef<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg.slice(0, 5));
    setTimeout(() => setToastMsg(null), 1800);
  };

  // 初始化加载所有六维自定义图标
  useEffect(() => {
    let isMounted = true;
    getAllAttributeImages().then((map) => {
      if (isMounted) {
        setIconMap(map);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 触发图片上传
  const handleTriggerUpload = (key: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    activeUploadKeyRef.current = key;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = activeUploadKeyRef.current;
    if (!file || !key) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await saveAttributeImage(key, dataUrl);
      setIconMap((prev) => ({ ...prev, [key]: dataUrl }));
      showToast('图标已存入');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 清除自定义图标并恢复默认
  const handleClearIcon = async (key: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await deleteAttributeImage(key);
    setIconMap((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    showToast('已清图标');
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 85,
        background: 'rgba(38, 45, 42, 0.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'backdropFadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      {/* 隐藏的图片文件选择器 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* 轻浮动 Toast (<= 5 字) */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 120,
            background: 'rgba(36, 56, 50, 0.95)',
            color: '#FFFFFF',
            padding: '7px 18px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.5px',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 主抽屉面板（对齐参考图：规整格子与圆形角标形态） */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '84%',
          background: '#EAE6DD', // 暖白底框
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          border: '3px solid #2D4B46',
          borderBottom: 'none',
          boxShadow: '0 -10px 35px rgba(28, 48, 44, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideUpSpring 0.35s cubic-bezier(0.18, 0.9, 0.32, 1.25)',
        }}
      >
        {/* ================= 1. 顶部标题栏 ================= */}
        <div
          style={{
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#35635B',
            borderTopLeftRadius: '23px',
            borderTopRightRadius: '23px',
            borderBottom: '2.5px solid #244640',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.5px',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                textShadow: '0 1.5px 0 #244640',
              }}
            >
              六维属性
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#244640',
                background: '#D1FAE5',
                padding: '2px 8px',
                borderRadius: '10px',
                border: '1.5px solid #059669',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Sparkles size={11} color="#059669" />
              总评 {totalScore}
            </span>
          </div>

          {/* 圆形关闭按钮 */}
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '2px solid #244640',
              background: '#FDF8ED',
              color: '#244640',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #244640',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ================= 2. 核心格子列表（参考图同款规整矩形槽位与圆形 (+) 角标） ================= */}
        <div
          style={{
            padding: '12px 14px 28px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '66vh',
          }}
        >
          {attrList.map((attr) => {
            const theme = ATTR_THEME[attr.key] || ATTR_THEME.STR;
            const hasCustomIcon = !!iconMap[attr.key] || !!attr.iconUrl;
            const iconSrc = iconMap[attr.key] || attr.iconUrl;
            const percent = Math.min(100, Math.round((attr.value / attr.maxValue) * 100));

            return (
              <div
                key={attr.key}
                onClick={() => setSelectedAttrKey(attr.key)}
                style={{
                  // 对齐参考图的卡槽风格：浅灰暖白底色 + 精致灰褐矩形轮廓
                  background: '#F6F3EE',
                  borderRadius: '14px',
                  border: '2px solid #949086',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 5px rgba(45, 42, 38, 0.1)',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                }}
              >
                {/* ================= 参考图同款：圆形槽位徽章 (支持用户上传小图标) ================= */}
                <div
                  onClick={(e) => handleTriggerUpload(attr.key, e)}
                  title="点击上传小图标"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    // 深度还原参考图圆形 (+) 按钮凹槽与凸起双层质感
                    background: hasCustomIcon ? '#FFFFFF' : '#EAE6DD',
                    border: '2px solid #8C887E',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08), 0 2px 0 #7A766C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {hasCustomIcon ? (
                    <img
                      src={iconSrc}
                      alt={theme.name}
                      style={{
                        width: '84%',
                        height: '84%',
                        objectFit: 'contain',
                        borderRadius: '50%',
                      }}
                    />
                  ) : (
                    /* 参考图中的圆形 (+) 角标，附带默认表情底蕴 */
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <span style={{ fontSize: '18px', opacity: 0.85 }}>{theme.defaultIcon}</span>
                      {/* 参考图同款悬浮灰白加号徽记 */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-6px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: '#FFFFFF',
                          border: '1.5px solid #8C887E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#5C5850',
                        }}
                      >
                        <Plus size={11} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>

                {/* ================= 属性主要信息 ================= */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: 0,
                  }}
                >
                  {/* 首行：名称 + 侧重点 + 数值 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 900,
                          color: '#2B251F',
                          fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                        }}
                      >
                        {theme.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: theme.color,
                          background: '#FFFFFF',
                          border: `1px solid ${theme.border}`,
                          padding: '1px 5px',
                          borderRadius: '6px',
                        }}
                      >
                        {theme.short}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#6B665E',
                          fontWeight: 700,
                        }}
                      >
                        {attr.focus}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#2B251F' }}>
                        {attr.value}
                      </span>
                      <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700 }}>
                        /{attr.maxValue}
                      </span>
                    </div>
                  </div>

                  {/* 规整进度槽 (Progress Gauge) */}
                  <div
                    style={{
                      width: '100%',
                      height: '7px',
                      background: '#E2DED5',
                      borderRadius: '4px',
                      border: '1px solid #B8B3A8',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: theme.fill,
                        borderRadius: '3px',
                        transition: 'width 0.35s ease-out',
                      }}
                    />
                  </div>
                </div>

                {/* 右侧快速更换/上传图标小相机 */}
                <button
                  onClick={(e) => handleTriggerUpload(attr.key, e)}
                  title="更换图标"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1.5px solid #8C887E',
                    color: '#6B665E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    flexShrink: 0,
                  }}
                >
                  <Camera size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* ================= 3. 属性槽位图标管理小弹窗 ================= */}
        {selectedAttrKey && (
          <div
            onClick={() => setSelectedAttrKey(null)}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 95,
              background: 'rgba(38, 45, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '270px',
                background: '#FDFBF7',
                borderRadius: '22px',
                border: '3px solid #2D4B46',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setSelectedAttrKey(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#6B665E',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>

              {/* 大图徽章预览槽 */}
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  border: '3px solid #2D4B46',
                  background: '#FFFFFF',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 3px 0 #2D4B46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {iconMap[selectedAttrKey] ? (
                  <img
                    src={iconMap[selectedAttrKey]}
                    alt="attr icon"
                    style={{ width: '84%', height: '84%', objectFit: 'contain', borderRadius: '50%' }}
                  />
                ) : (
                  <span style={{ fontSize: '36px' }}>
                    {ATTR_THEME[selectedAttrKey]?.defaultIcon || '✨'}
                  </span>
                )}
              </div>

              {/* 标题 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#2D4B46' }}>
                  {ATTR_THEME[selectedAttrKey]?.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6B665E', marginTop: '2px', fontWeight: 700 }}>
                  点击传图保存在本地
                </div>
              </div>

              {/* 操作按钮组 (<= 5 字) */}
              <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    handleTriggerUpload(selectedAttrKey);
                    setSelectedAttrKey(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: '12px',
                    background: '#2A9D87',
                    color: '#FFFFFF',
                    border: '2px solid #2D4B46',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 0 #2D4B46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Camera size={13} />
                  <span>换图标</span>
                </button>

                {iconMap[selectedAttrKey] && (
                  <button
                    onClick={() => {
                      handleClearIcon(selectedAttrKey);
                      setSelectedAttrKey(null);
                    }}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '12px',
                      background: '#FEE2E2',
                      color: '#EF4444',
                      border: '2px solid #2D4B46',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 0 #2D4B46',
                    }}
                  >
                    恢复默认
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 动画 */}
      <style>{`
        @keyframes slideUpSpring {
          0% {
            transform: translateY(100%);
            opacity: 0.4;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes backdropFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
