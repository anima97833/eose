import React from 'react';
import { MapPin, BookOpen, CheckCircle2, Clock, Plus, Minus } from 'lucide-react';
import { PhysicalBookRecord } from '../../../../core/books/bookTypes';
import { generateFallbackBookCover } from '../../../../core/books/bookApi';
import { NM } from '../bookNeumorphism';

interface BookShelfCardProps {
  book: PhysicalBookRecord;
  onClick: () => void;
  onUpdateProgress: (book: PhysicalBookRecord, delta: number) => void;
}

export const BookShelfCard: React.FC<BookShelfCardProps> = ({
  book,
  onClick,
  onUpdateProgress,
}) => {
  const percent = book.pageCount > 0
    ? Math.min(100, Math.round((book.currentPage / book.pageCount) * 100))
    : 0;

  const isCompleted = book.status === 'read' || percent >= 100;
  const isReading = book.status === 'reading' && !isCompleted;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexShrink: 0,
        backgroundColor: NM.cardBg,
        border: NM.borderLight,
        borderRadius: 18,
        padding: '12px 14px',
        boxShadow: NM.convexSm,
        gap: 14,
        cursor: 'pointer',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = NM.convex;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = NM.convexSm;
      }}
    >
      {/* 左侧实体图书拟物封面与书脊厚度 */}
      <div
        style={{
          width: 70,
          height: 98,
          flexShrink: 0,
          borderRadius: 8,
          backgroundColor: NM.bgInset,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '3px 4px 10px rgba(180, 160, 130, 0.35), inset -2px 0 3px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 书脊装订立体阴影与高光 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 6,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.22) 0%, rgba(255,255,255,0.35) 45%, rgba(0,0,0,0.1) 100%)',
            zIndex: 2,
          }}
        />

        <img
          src={book.coverUrl || generateFallbackBookCover(book.title, book.author)}
          alt={book.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            const fallback = generateFallbackBookCover(book.title, book.author);
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            }
          }}
        />
      </div>

      {/* 右侧书本信息与物理位置 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* 标题与类别 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
            <h4
              style={{
                margin: 0,
                fontSize: '0.98rem',
                fontWeight: 700,
                color: NM.textMain,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={book.title}
            >
              {book.title}
            </h4>

            {/* 状态徽章轻拟物凸起胶囊（干净圆润，无印章） */}
            {isCompleted ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 14,
                  backgroundColor: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  boxShadow: NM.convexXs,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={11} />
                <span>已读完</span>
              </span>
            ) : isReading ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 14,
                  backgroundColor: '#FFFBEB',
                  color: '#B45309',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  boxShadow: NM.convexXs,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  flexShrink: 0,
                }}
              >
                <BookOpen size={11} />
                <span>在读 {percent}%</span>
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 14,
                  backgroundColor: NM.bgLighter,
                  color: NM.textSub,
                  border: NM.borderLight,
                  boxShadow: NM.convexXs,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  flexShrink: 0,
                }}
              >
                <Clock size={11} />
                <span>想读</span>
              </span>
            )}
          </div>

          {/* 作者与出版社 */}
          <div
            style={{
              fontSize: '0.78rem',
              color: NM.textSub,
              marginTop: 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {book.author || '未知作者'} · {book.publisher || '出版社未注明'}
          </div>

          {/* 物理书架位置与定价标签 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 6,
              flexWrap: 'wrap',
            }}
          >
            {/* 物理位置胶囊 */}
            <span
              style={{
                fontSize: '0.72rem',
                color: NM.textMain,
                backgroundColor: NM.bgLighter,
                border: NM.borderLight,
                boxShadow: NM.convexXs,
                borderRadius: 8,
                padding: '2px 7px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
              }}
            >
              <MapPin size={11} color={NM.primary} />
              <span>{book.physicalLocation || '未归位'}</span>
            </span>

            {/* 定价 */}
            {book.price && (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: NM.textSub,
                  backgroundColor: NM.bgLighter,
                  borderRadius: 8,
                  padding: '2px 6px',
                  border: NM.borderLight,
                  boxShadow: NM.convexXs,
                }}
              >
                {book.price}
              </span>
            )}
          </div>
        </div>

        {/* 底部阅读进度指示条（如果书目为“想读”，则不出现阅读进度；在读或已读才出现） */}
        {book.status !== 'unread' && (
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: NM.textSub,
                marginBottom: 4,
              }}
            >
              <span>
                {book.currentPage} / {book.pageCount} 页
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* 微调步进按钮 */}
                <div style={{ display: 'flex', gap: 3 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateProgress(book, -5);
                    }}
                    title="退5页"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: NM.borderLight,
                      backgroundColor: NM.cardBg,
                      boxShadow: NM.convexXs,
                      color: NM.textSub,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Minus size={9} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateProgress(book, 5);
                    }}
                    title="进5页"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: NM.borderLight,
                      backgroundColor: NM.cardBg,
                      boxShadow: NM.convexXs,
                      color: NM.textSub,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Plus size={9} />
                  </button>
                </div>

                <span style={{ fontWeight: 700, color: isCompleted ? NM.emerald : NM.primary }}>
                  {percent}%
                </span>
              </div>
            </div>

            {/* 内凹雕刻进度槽 */}
            <div
              style={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                backgroundColor: NM.bgInset,
                boxShadow: NM.insetXs,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  borderRadius: 3,
                  background: isCompleted
                    ? 'linear-gradient(90deg, #34D399 0%, #10B981 100%)'
                    : 'linear-gradient(90deg, #FBBF24 0%, #D97706 100%)',
                  boxShadow: isCompleted
                    ? '0 1px 3px rgba(16, 185, 129, 0.4)'
                    : '0 1px 3px rgba(217, 119, 6, 0.4)',
                  transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
