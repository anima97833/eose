import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Calendar,
  Sparkles,
  RotateCw,
  CheckCircle2,
  Circle,
  Clock,
  Tag
} from 'lucide-react';
import { PosterRecord, PosterCategory } from '../../../core/poster/posterTypes';
import { POSTER_TEMPLATES } from '../../../core/poster/posterTemplates';
import { getDaysDiff, isPosterActiveOnDate, formatWeekdaysText, getDaysOfWeekBetween } from '../../../core/poster/posterStorage';
import './posterAlbum.css';

interface PosterCardViewProps {
  poster: PosterRecord;
  interactive?: boolean;
  onToggleItem?: (posterId: string, itemId: string) => void;
  onOpenDetail?: (poster: PosterRecord) => void;
  style?: React.CSSProperties;
}

export const PosterCardView: React.FC<PosterCardViewProps> = ({
  poster,
  interactive = true,
  onToggleItem,
  onOpenDetail,
  style = {},
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const isActiveToday = isPosterActiveOnDate(poster);
  const daysToEnd = getDaysDiff(poster.endDate);
  const daysToStart = getDaysDiff(poster.startDate);

  // 状态计算
  let statusText = '上映中';
  let statusClass = 'pa-status-active';

  if (poster.isArchived) {
    statusText = '已归档';
    statusClass = 'pa-status-archived';
  } else if (daysToStart > 0) {
    statusText = `剩 ${daysToStart} 天`;
    statusClass = 'pa-status-upcoming';
  } else if (isActiveToday) {
    statusText = poster.repeatMode === 'weekly' ? '今日展映' : daysToEnd === 0 ? '今日截止' : `剩 ${daysToEnd} 天`;
    statusClass = 'pa-status-active';
  } else if (poster.repeatMode === 'weekly') {
    statusText = '周循环';
    statusClass = 'pa-status-upcoming';
  } else if (poster.repeatMode === 'monthly') {
    statusText = '月循环';
    statusClass = 'pa-status-upcoming';
  } else if (poster.repeatMode === 'yearly') {
    statusText = '年循环';
    statusClass = 'pa-status-upcoming';
  } else if (daysToEnd < 0) {
    statusText = `已逾期`;
    statusClass = 'pa-status-expired';
  }

  const dateSummaryText = poster.repeatMode === 'weekly'
    ? `${formatWeekdaysText(poster.repeatDaysOfWeek || getDaysOfWeekBetween(poster.startDate, poster.endDate))}`
    : poster.repeatMode === 'monthly'
    ? `每月重复 · ${poster.startDate} 至 ${poster.endDate}`
    : poster.repeatMode === 'yearly'
    ? `每年重复 · ${poster.startDate} 至 ${poster.endDate}`
    : `${poster.startDate} 至 ${poster.endDate}`;

  // 分类图标
  const renderCategoryIcon = (category: PosterCategory) => {
    switch (category) {
      case 'romance':
        return <Heart size={14} color="#e11d48" fill="rgba(225,29,72,0.15)" />;
      case 'event':
        return <ShoppingBag size={14} color="#d97706" />;
      case 'schedule':
        return <Calendar size={14} color="#0284c7" />;
      default:
        return <Sparkles size={14} color="#7c3aed" />;
    }
  };

  const templateDef = poster.templateId ? POSTER_TEMPLATES[poster.templateId] : null;
  const currentTheme = templateDef?.themes.find((t) => t.id === poster.templateTheme) || templateDef?.themes[0];

  return (
    <div className="pa-card-wrapper" style={style}>
      <div className={`pa-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* ===================== 正面 (FRONT) ===================== */}
        <div
          className="pa-card-front"
          onClick={() => {
            if (interactive && onOpenDetail) {
              onOpenDetail(poster);
            }
          }}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          {poster.imageUrl ? (
            /* 自定义上传图片模式 */
            <div className="pa-front-img-box">
              <img src={poster.imageUrl} alt={poster.title} className="pa-front-img" />
              <div className="pa-front-tape" />
            </div>
          ) : (
            /* 极简拟物模板渲染 */
            <div
              style={{
                flex: 1,
                width: '100%',
                borderRadius: 12,
                padding: '16px 14px',
                boxSizing: 'border-box',
                background: currentTheme?.bgGradient || 'linear-gradient(135deg, #fff9db 0%, #ffec99 100%)',
                color: currentTheme?.textColor || '#451a03',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              {/* 顶部标签 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: currentTheme?.badgeBg || 'rgba(0,0,0,0.06)',
                    color: currentTheme?.textColor || '#451a03',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Tag size={10} />
                  {poster.tagText || templateDef?.defaultTag || '重要日子'}
                </span>
                <span className={`pa-status-pill ${statusClass}`}>{statusText}</span>
              </div>

              {/* 中间核心标题（简洁明了） */}
              <div style={{ margin: 'auto 0', textAlign: 'center' }}>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    margin: '0 0 4px 0',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}
                >
                  {poster.title}
                </h3>
                {poster.subtitle && (
                  <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 500 }}>
                    {poster.subtitle}
                  </div>
                )}
              </div>

              {/* 底部日期 */}
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 600,
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  paddingTop: 6,
                }}
              >
                <Clock size={12} />
                <span>{dateSummaryText}</span>
              </div>
            </div>
          )}

          {/* 底部信息条 (图文模式) */}
          {poster.imageUrl && (
            <div className="pa-front-info">
              <div className="pa-front-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
                  {renderCategoryIcon(poster.category)}
                  <h4 className="pa-front-title">{poster.title}</h4>
                </div>
                <span className={`pa-status-pill ${statusClass}`}>{statusText}</span>
              </div>
              <div className="pa-front-date-row">
                <Clock size={11} />
                <span>{dateSummaryText}</span>
              </div>
            </div>
          )}

          {/* 归档印章 */}
          {poster.isArchived && (
            <div className="pa-stamp">
              {poster.stamp === 'celebrated' ? '留念归档' : poster.stamp === 'expired' ? '已过期' : '已达成'}
            </div>
          )}

          {/* 翻转按钮 */}
          <button
            type="button"
            className="pa-flip-btn"
            title="翻转看备忘清单"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(true);
            }}
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* ===================== 背面 (BACK) ===================== */}
        <div className="pa-card-back">
          <div className="pa-back-header">
            <h4 className="pa-back-title">备忘清单</h4>
            <button
              type="button"
              className="pa-btn-icon"
              style={{ width: 26, height: 26, borderRadius: 6 }}
              title="翻回正面"
              onClick={() => setIsFlipped(false)}
            >
              <RotateCw size={13} />
            </button>
          </div>

          <div className="pa-back-body">
            {poster.backNote && (
              <div className="pa-back-note">{poster.backNote}</div>
            )}

            {poster.backItems && poster.backItems.length > 0 ? (
              <div className="pa-checklist">
                {poster.backItems.map((item) => (
                  <div
                    key={item.id}
                    className={`pa-check-item ${item.completed ? 'done' : ''}`}
                    onClick={() => onToggleItem && onToggleItem(poster.id, item.id)}
                  >
                    {item.completed ? (
                      <CheckCircle2 size={14} color="#16a34a" />
                    ) : (
                      <Circle size={14} color="#94a3b8" />
                    )}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              !poster.backNote && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, padding: '20px 0' }}>
                  暂无备忘清单
                </div>
              )
            )}
          </div>

          <div className="pa-back-footer">
            <button
              type="button"
              className="pa-btn pa-btn-secondary"
              style={{ padding: '4px 10px', fontSize: 11 }}
              onClick={() => setIsFlipped(false)}
            >
              看正面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
