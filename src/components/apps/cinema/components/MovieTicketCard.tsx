import React from 'react';
import { Star, Clock, Calendar, Film, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { MovieRecord } from '../../../../core/cinema/cinemaTypes';

interface MovieTicketCardProps {
  movie: MovieRecord;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MovieTicketCard: React.FC<MovieTicketCardProps> = ({
  movie,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const isWatched = movie.status === 'watched';

  return (
    <div
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        flexShrink: 0, // 避免多票据时被 flexbox 压缩原有空间，确保可上下滑动
        borderRadius: '16px',
        background: '#FAF6EE', // 经典微黄纸质票根
        boxShadow:
          '5px 7px 16px rgba(160, 175, 195, 0.45), -4px -4px 12px rgba(255, 255, 255, 0.95), inset 0 0 1px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        border: '1px solid rgba(220, 215, 200, 0.6)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* 顶部与底部的电影票剪角圆凹槽 */}
      <div
        style={{
          position: 'absolute',
          left: '92px',
          top: '-8px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: 'var(--nm-bg, #E9EFF6)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '92px',
          bottom: '-8px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: 'var(--nm-bg, #E9EFF6)',
          boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2)',
          zIndex: 5,
        }}
      />

      {/* 左侧：电影海报截面 (带虚线齿痕) */}
      <div
        style={{
          width: '100px',
          padding: '10px 8px 10px 10px',
          borderRight: '1.5px dashed #D1C7B7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          background: 'linear-gradient(135deg, #F5EFE3 0%, #EDE4D3 100%)',
        }}
      >
        <div
          style={{
            width: '74px',
            height: '104px',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#334155',
            boxShadow: '0 3px 8px rgba(0,0,0,0.22)',
            position: 'relative',
          }}
        >
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                gap: '4px',
              }}
            >
              <Film size={22} />
              <span style={{ fontSize: '9px' }}>无海报</span>
            </div>
          )}

          {/* 年份标签小标贴 */}
          {movie.year > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#FDE047',
                fontSize: '8.5px',
                fontWeight: 800,
                padding: '1px 4px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                backdropFilter: 'blur(4px)',
              }}
            >
              {movie.year}
            </span>
          )}
        </div>

        {/* 片长标识 */}
        {movie.runtimeMinutes > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              marginTop: '6px',
              fontSize: '9px',
              fontWeight: 800,
              color: '#8C7E6A',
              fontFamily: 'monospace',
            }}
          >
            <Clock size={10} />
            <span>{movie.runtimeMinutes}m</span>
          </div>
        )}
      </div>

      {/* 右侧：票面详细信息与评分 */}
      <div
        style={{
          flex: 1,
          padding: '10px 12px 8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
          position: 'relative',
        }}
      >
        {/* 顶部行：标题与管理更多按钮 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '14.5px',
                  fontWeight: 900,
                  color: '#2C251E',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.25',
                }}
              >
                {movie.title}
              </h3>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: '10px',
                    color: '#9E9282',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontFamily: 'monospace',
                  }}
                >
                  {movie.originalTitle}
                </p>
              )}
            </div>

            {/* 更多小按钮 */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8C7E6A',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <MoreVertical size={15} />
            </div>

            {/* 操作气泡浮层 */}
            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: '32px',
                  right: '12px',
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  padding: '4px',
                  zIndex: 30,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                >
                  <Edit3 size={13} />
                  编辑
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#EF4444',
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                >
                  <Trash2 size={13} />
                  删除
                </button>
              </div>
            )}
          </div>

          {/* 评分与日期小胶囊 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            {isWatched ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'linear-gradient(135deg, #FDE047 0%, #EAB308 100%)',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  boxShadow: '0 1.5px 3px rgba(234, 179, 8, 0.4)',
                }}
              >
                <Star size={11} fill="#78350F" color="#78350F" />
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#78350F', fontFamily: 'monospace' }}>
                  {movie.rating > 0 ? movie.rating.toFixed(1) : '未评分'}
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: '#E2E8F0',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  color: '#475569',
                  fontSize: '10px',
                  fontWeight: 800,
                }}
              >
                待看清单
              </div>
            )}

            {movie.watchedDate && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#8C7E6A',
                  fontFamily: 'monospace',
                }}
              >
                <Calendar size={11} />
                <span>{movie.watchedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* 观后短评金句 */}
        {movie.comment ? (
          <p
            style={{
              margin: '6px 0 4px',
              fontSize: '11.5px',
              color: '#4A3E31',
              fontStyle: 'italic',
              lineHeight: '1.35',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            “{movie.comment}”
          </p>
        ) : (
          <p
            style={{
              margin: '6px 0 4px',
              fontSize: '11px',
              color: '#BDB3A4',
              fontStyle: 'italic',
            }}
          >
            暂无观影速评，点击添笔...
          </p>
        )}

        {/* 底部：复古条形码与印章 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderTop: '1px dotted #D1C7B7',
            paddingTop: '5px',
            marginTop: '4px',
          }}
        >
          {/* 拟物钢印章 */}
          <div
            style={{
              fontSize: '8px',
              fontWeight: 900,
              padding: '1.5px 6px',
              borderRadius: '4px',
              border: isWatched ? '1.5px solid #DC2626' : '1.5px solid #2563EB',
              color: isWatched ? '#DC2626' : '#2563EB',
              transform: 'rotate(-4deg)',
              letterSpacing: '0.8px',
              fontFamily: 'monospace',
            }}
          >
            {isWatched ? '★ ADMIT ONE ★' : '⌚ COMING SOON'}
          </div>

          {/* 复古条形码视觉 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '1.5px', height: '14px', alignItems: 'flex-end' }}>
              {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 1, 2, 3, 1, 2].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: `${w}px`,
                    height: '100%',
                    backgroundColor: '#8C7E6A',
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '6.5px', color: '#8C7E6A', fontFamily: 'monospace', marginTop: '1px' }}>
              NO.{movie.id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
