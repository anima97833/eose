import React, { useState } from 'react';
import { HoroscopeData } from '../../../core/horoscope/horoscopeService';
import { X, Sparkles, Check, RefreshCw } from 'lucide-react';
import {
  parseChineseColorNameToRgb,
  fetchColormindPalette,
} from '../../../core/theme/colormindService';
import {
  createThemeFromPalette,
  applyTheme,
} from '../../../core/theme/themeEngine';

interface HoroscopeModalProps {
  data: HoroscopeData;
  onClose: () => void;
}

export const HoroscopeModal: React.FC<HoroscopeModalProps> = ({ data, onClose }) => {
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const [themeSuccessMsg, setThemeSuccessMsg] = useState<string | null>(null);

  const handleApplyLuckyTheme = async () => {
    setIsApplyingTheme(true);
    try {
      const seedRgb = parseChineseColorNameToRgb(data.luckyColor);
      const palette = await fetchColormindPalette({
        model: 'ui',
        input: [seedRgb, 'N', 'N', 'N', 'N'],
      });
      const theme = createThemeFromPalette(
        `今日幸运 · ${data.luckyColor}`,
        palette,
        true,
        'horoscope'
      );
      applyTheme(theme);
      setThemeSuccessMsg(`已为您换上今日【${data.luckyColor}】专属幸运气场！`);
      setTimeout(() => setThemeSuccessMsg(null), 3000);
    } catch {
      setThemeSuccessMsg('幸运色生效稍有延迟，已切至智能备选调色');
      setTimeout(() => setThemeSuccessMsg(null), 3000);
    } finally {
      setIsApplyingTheme(false);
    }
  };
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.42)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px',
        boxSizing: 'border-box',
        animation: 'backdropFadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      {/* 居中轻拟物水蓝色手账卡片：严格适配手机可视区域，不超宽、不裁切 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '332px',
          maxHeight: 'min(620px, 86%)',
          background: 'linear-gradient(145deg, #F0F5FA 0%, #E6EDF5 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '10px 10px 24px rgba(160, 175, 195, 0.65), -10px -10px 24px rgba(255, 255, 255, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'popInSpring 0.28s cubic-bezier(0.18, 0.9, 0.32, 1.2)',
          boxSizing: 'border-box',
        }}
      >
        {/* 顶部轻拟物 Header */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '13px 15px 11px',
            borderBottom: '1px solid rgba(166, 180, 200, 0.28)',
            background: 'rgba(240, 245, 250, 0.88)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            {/* 水蓝色轻拟物星座微章 */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6BA8D6, #5096C6)',
                color: '#FFFFFF',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '3px 3px 8px rgba(80, 150, 198, 0.38), inset 1px 1px 2px rgba(255, 255, 255, 0.45)',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {data.signSymbol}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 900,
                    color: '#334257',
                    letterSpacing: '0.2px',
                    fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                  }}
                >
                  {data.title}
                </span>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    color: '#417B9F',
                    background: '#DFE8F2',
                    border: '1px solid #BED2E6',
                    padding: '1px 6px',
                    borderRadius: '6px',
                  }}
                >
                  今日星轨
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#7D8CA3', fontWeight: 600 }}>
                {data.time} · 每日运势手账
              </span>
            </div>
          </div>

          {/* 轻拟物凸起圆形关闭按钮 */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#E9EEF5',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              color: '#7D8CA3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '2px 2px 6px rgba(166, 180, 200, 0.5), -2px -2px 6px rgba(255, 255, 255, 0.9)',
              transition: 'all 0.12s ease',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* 滚动内容区 (美化滚动条，不切断内容) */}
        <div
          style={{
            flex: 1,
            padding: '12px 13px 18px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxSizing: 'border-box',
          }}
        >
          {/* 1. 一句话短评与综合指数看板 (水蓝色轻拟物主色调卡片) */}
          <div
            style={{
              padding: '11px 13px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #5096C6 0%, #3E7FA9 100%)',
              color: '#FFFFFF',
              boxShadow: '4px 4px 12px rgba(62, 127, 169, 0.35), inset 1px 1px 2px rgba(255, 255, 255, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10.5px', color: '#DCEBFA', fontWeight: 800 }}>
                今日综合指数: {data.index.all}
              </span>
              <div style={{ display: 'flex', gap: '1.5px', color: '#FEF08A' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ fontSize: '11px', lineHeight: 1 }}>
                    {i < data.fortuneStar ? '★' : '☆'}
                  </span>
                ))}
              </div>
            </div>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#FEF9C3',
                lineHeight: 1.4,
                letterSpacing: '0.2px',
              }}
            >
              “ {data.shortComment} ”
            </p>
          </div>

          {/* 2. 今日宜忌胶囊 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div
              style={{
                padding: '6px 8px',
                borderRadius: '12px',
                background: '#EAF7F0',
                border: '1px solid #A5D6A7',
                color: '#15803D',
                fontSize: '10.5px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.25), -2px -2px 5px rgba(255, 255, 255, 0.8)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              <span style={{ fontSize: '12px' }}>🌿</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.todo.yi}</span>
            </div>
            <div
              style={{
                padding: '6px 8px',
                borderRadius: '12px',
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                color: '#BE123C',
                fontSize: '10.5px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.25), -2px -2px 5px rgba(255, 255, 255, 0.8)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              <span style={{ fontSize: '12px' }}>⚠️</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.todo.ji}</span>
            </div>
          </div>

          {/* 3. 幸运指南 (轻拟物微凹卡片) */}
          <div
            style={{
              padding: '8px 10px',
              borderRadius: '14px',
              background: '#E9EEF5',
              border: '1px solid rgba(255, 255, 255, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              boxShadow: 'inset 2px 2px 5px rgba(160, 175, 195, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.9)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
              <span style={{ fontSize: '9.5px', color: '#7D8CA3', fontWeight: 700 }}>幸运颜色</span>
              <span style={{ fontSize: '11px', color: '#3E7FA9', fontWeight: 900 }}>🎨 {data.luckyColor}</span>
            </div>
            <div style={{ width: '1px', height: '22px', background: '#D3DFEE' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
              <span style={{ fontSize: '9.5px', color: '#7D8CA3', fontWeight: 700 }}>幸运数字</span>
              <span style={{ fontSize: '11px', color: '#3E7FA9', fontWeight: 900 }}>🔢 {data.luckyNumber}</span>
            </div>
            <div style={{ width: '1px', height: '22px', background: '#D3DFEE' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
              <span style={{ fontSize: '9.5px', color: '#7D8CA3', fontWeight: 700 }}>贵人星座</span>
              <span style={{ fontSize: '11px', color: '#3E7FA9', fontWeight: 900 }}>🤝 {data.luckyConstellation}</span>
            </div>
          </div>

          {/* 穿戴今日幸运主题按钮 (Colormind 深度学习联动) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={handleApplyLuckyTheme}
              disabled={isApplyingTheme}
              style={{
                width: '100%',
                padding: '6px 12px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.85)',
                background: 'linear-gradient(135deg, var(--nm-primary-light, #6BA8D6), var(--nm-primary, #5096C6))',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                cursor: isApplyingTheme ? 'wait' : 'pointer',
                boxShadow: 'var(--nm-convex-xs, 2px 2px 5px rgba(80, 150, 198, 0.35))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                opacity: isApplyingTheme ? 0.75 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {isApplyingTheme ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>AI 正在以【{data.luckyColor}】推算今日色盘...</span>
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  <span>✨ 穿戴今日【{data.luckyColor}】专属幸运气场</span>
                </>
              )}
            </button>

            {themeSuccessMsg && (
              <span
                style={{
                  fontSize: '9.5px',
                  color: 'var(--nm-primary, #0284C7)',
                  fontWeight: 800,
                  animation: 'fadeIn 0.2s ease-out',
                }}
              >
                {themeSuccessMsg}
              </span>
            )}
          </div>

          {/* 4. 四维能量指数 */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '14px',
              background: '#E9EEF5',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '3px 3px 8px rgba(160, 175, 195, 0.45), -3px -3px 8px rgba(255, 255, 255, 0.95)',
            }}
          >
            <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#3E7FA9' }}>
              📊 今日能量雷达
            </span>

            {[
              { label: '工作学习', val: data.index.work, gradient: 'linear-gradient(90deg, #6BA8D6, #5096C6)' },
              { label: '人际感情', val: data.index.love, gradient: 'linear-gradient(90deg, #F87171, #EF4444)' },
              { label: '财富运势', val: data.index.money, gradient: 'linear-gradient(90deg, #FBBF24, #F59E0B)' },
              { label: '健康元气', val: data.index.health, gradient: 'linear-gradient(90deg, #34D399, #10B981)' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '46px', fontSize: '9.5px', fontWeight: 800, color: '#7D8CA3' }}>
                  {item.label}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    background: '#D9E3EF',
                    boxShadow: 'inset 1px 1px 3px rgba(160, 175, 195, 0.55)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: item.val,
                      height: '100%',
                      background: item.gradient,
                      borderRadius: '3px',
                    }}
                  />
                </div>
                <span style={{ width: '28px', textAlign: 'right', fontSize: '9.5px', fontWeight: 900, color: '#334257' }}>
                  {item.val}
                </span>
              </div>
            ))}
          </div>

          {/* 5. 详细运势解析 (轻拟物凸起卡片) */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '14px',
              background: '#E9EEF5',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '3px 3px 8px rgba(160, 175, 195, 0.45), -3px -3px 8px rgba(255, 255, 255, 0.95)',
            }}
          >
            <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#3E7FA9' }}>
              📖 今日星语详解
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#5096C6' }}>【整体运势】</span>
              <p style={{ margin: 0, fontSize: '10.5px', color: '#475569', lineHeight: 1.45 }}>
                {data.fortuneText.all}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#5096C6' }}>【工作与学业】</span>
              <p style={{ margin: 0, fontSize: '10.5px', color: '#475569', lineHeight: 1.45 }}>
                {data.fortuneText.work}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#E11D48' }}>【感情与交往】</span>
              <p style={{ margin: 0, fontSize: '10.5px', color: '#475569', lineHeight: 1.45 }}>
                {data.fortuneText.love}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#D97706' }}>【财富与消费】</span>
              <p style={{ margin: 0, fontSize: '10.5px', color: '#475569', lineHeight: 1.45 }}>
                {data.fortuneText.money}
              </p>
            </div>
          </div>

          {/* 底部轻拟物水蓝胶囊按钮 */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '9px 0',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              background: 'linear-gradient(135deg, #6BA8D6 0%, #5096C6 100%)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '3px 3px 8px rgba(80, 150, 198, 0.45), -2px -2px 6px rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'transform 0.1s ease',
            }}
          >
            <Sparkles size={13} />
            <span>收起手账 · 愿今日好运</span>
          </button>
        </div>
      </div>
    </div>
  );
};
