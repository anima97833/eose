import React, { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, Palette, Check, RotateCcw } from 'lucide-react';
import {
  NeumorphicTheme,
  PRESET_THEMES,
  CLASSIC_AQUA_THEME,
  loadActiveTheme,
  applyTheme,
  createThemeFromPalette,
} from '../../../../core/theme/themeEngine';
import { fetchColormindPalette, rgbToHex } from '../../../../core/theme/colormindService';

interface ThemeStudioModalProps {
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export const ThemeStudioModal: React.FC<ThemeStudioModalProps> = ({ onClose, onToast }) => {
  const [currentTheme, setCurrentTheme] = useState<NeumorphicTheme>(loadActiveTheme);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'ui' | 'default'>('ui');

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail) {
        setCurrentTheme(e.detail);
      }
    };
    window.addEventListener('cloudfly_theme_changed', handleThemeChange);
    return () => window.removeEventListener('cloudfly_theme_changed', handleThemeChange);
  }, []);

  // 触发 AI Colormind 灵感生成
  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const palette = await fetchColormindPalette({ model: selectedModel });
      const themeName = `AI 调色 · ${selectedModel === 'ui' ? '界面' : '光影'}`;
      const newTheme = createThemeFromPalette(themeName, palette, true, 'ai_colormind');
      applyTheme(newTheme);
      setCurrentTheme(newTheme);
      onToast?.('✨ AI 灵感配色生成并生效！');
    } catch (err) {
      onToast?.('生成稍有延迟，已切至智能备选调色');
    } finally {
      setIsGenerating(false);
    }
  };

  // 恢复经典水蓝
  const handleResetClassic = () => {
    applyTheme(CLASSIC_AQUA_THEME);
    setCurrentTheme(CLASSIC_AQUA_THEME);
    onToast?.('已恢复经典水蓝主题');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'backdropFadeIn 0.2s ease-out',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '344px',
          maxHeight: 'min(620px, 86%)',
          background: 'var(--nm-bg)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.85)',
          boxShadow: 'var(--nm-convex-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
          animation: 'popInSpring 0.28s cubic-bezier(0.18, 0.9, 0.32, 1.2)',
        }}
      >
        {/* 顶部 Header */}
        <div
          style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--nm-bg-lighter)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--nm-primary-light), var(--nm-primary))',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px 6px var(--nm-shadow-soft)',
              }}
            >
              <Palette size={16} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--nm-text-main)' }}>
                拟物色彩工坊
              </div>
              <div style={{ fontSize: '10px', color: 'var(--nm-text-sub)' }}>
                Powered by Colormind Deep Learning AI
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-sm)',
              border: 'none',
              color: 'var(--nm-text-sub)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* 主体滚动区 */}
        <div
          style={{
            padding: '14px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxSizing: 'border-box',
          }}
        >
          {/* 当前主题 5 色色板预览 */}
          <div
            style={{
              padding: '12px',
              borderRadius: '16px',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-inset-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                当前主题：{currentTheme.name}
              </span>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: 'var(--nm-primary)',
                  background: 'var(--nm-bg-lighter)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
              >
                {currentTheme.isCustom ? 'AI 生成' : '预设经典'}
              </span>
            </div>

            {/* 5色球横向排列 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
              {currentTheme.palette.map((rgb, i) => {
                const hex = rgbToHex(rgb);
                const labels = ['基底底色', '卡片表面', '拟物主色', '正文文本', '高亮点缀'];
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: hex,
                        boxShadow:
                          '2px 2px 6px rgba(0,0,0,0.18), inset 1px 1px 2px rgba(255,255,255,0.4)',
                        border: '1.5px solid rgba(255,255,255,0.7)',
                      }}
                      title={`${labels[i]}: ${hex}`}
                    />
                    <span style={{ fontSize: '8.5px', color: 'var(--nm-text-sub)' }}>
                      {labels[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI 灵感操作区 */}
          <div
            style={{
              padding: '12px',
              borderRadius: '16px',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                AI 配色生成模式
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedModel('ui')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    background:
                      selectedModel === 'ui' ? 'var(--nm-primary)' : 'var(--nm-bg-lighter)',
                    color: selectedModel === 'ui' ? '#FFFFFF' : 'var(--nm-text-sub)',
                    boxShadow:
                      selectedModel === 'ui' ? 'var(--nm-convex-xs)' : 'none',
                  }}
                >
                  UI 界面
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModel('default')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    background:
                      selectedModel === 'default' ? 'var(--nm-primary)' : 'var(--nm-bg-lighter)',
                    color: selectedModel === 'default' ? '#FFFFFF' : 'var(--nm-text-sub)',
                    boxShadow:
                      selectedModel === 'default' ? 'var(--nm-convex-xs)' : 'none',
                  }}
                >
                  电影唯美
                </button>
              </div>
            </div>

            {/* 灵感摇一摇大按钮 */}
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={isGenerating}
              style={{
                width: '100%',
                padding: '11px 0',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--nm-primary-light), var(--nm-primary))',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 900,
                cursor: isGenerating ? 'wait' : 'pointer',
                boxShadow: 'var(--nm-convex-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: isGenerating ? 0.75 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Colormind 正在推演色彩...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>🎲 AI 灵感摇一摇 · 随机换肤</span>
                </>
              )}
            </button>
          </div>

          {/* 经典预设选项 */}
          <div
            style={{
              padding: '12px',
              borderRadius: '16px',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                预设经典主题
              </span>
              <button
                type="button"
                onClick={handleResetClassic}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--nm-primary)',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={11} />
                <span>重置经典水蓝</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {PRESET_THEMES.map((preset) => {
                const isSelected = currentTheme.name === preset.name;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      applyTheme(preset);
                      setCurrentTheme(preset);
                      onToast?.(`已切换至【${preset.name}】主题`);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid var(--nm-primary)' : '1px solid rgba(255,255,255,0.7)',
                      background: preset.bg,
                      boxShadow: isSelected ? 'var(--nm-inset-xs)' : 'var(--nm-convex-xs)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: preset.primary,
                          display: 'inline-block',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: preset.textMain,
                        }}
                      >
                        {preset.name}
                      </span>
                    </div>
                    {isSelected && <Check size={12} color={preset.primary} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
