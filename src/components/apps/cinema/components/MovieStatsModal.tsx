import React from 'react';
import { X, Film, Clock, Star, Award, TrendingUp } from 'lucide-react';
import { MovieRecord, CinemaStats } from '../../../../core/cinema/cinemaTypes';

interface MovieStatsModalProps {
  stats: CinemaStats;
  movies: MovieRecord[];
  onClose: () => void;
}

export const MovieStatsModal: React.FC<MovieStatsModalProps> = ({
  stats,
  movies,
  onClose,
}) => {
  const watchedMovies = movies.filter((m) => m.status === 'watched');
  // 评分最高 TOP 3
  const topMovies = [...watchedMovies]
    .filter((m) => m.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        zIndex: 120,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          backgroundColor: '#F8FAFC',
          borderRadius: '24px',
          padding: '20px 18px',
          boxSizing: 'border-box',
          boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          animation: 'slideUp 0.24s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* 标题 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#D97706" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#1E293B' }}>
              个人观影时空盘
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#E2E8F0',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* 核心数据大卡片 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <div
            style={{
              padding: '12px 10px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#D97706', marginBottom: '2px' }}>
              <Film size={14} />
              <span style={{ fontSize: '11px', fontWeight: 800 }}>累计阅片</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', fontFamily: 'monospace' }}>
              {stats.totalWatched}
            </span>
            <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '2px' }}>部</span>
          </div>

          <div
            style={{
              padding: '12px 10px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#2563EB', marginBottom: '2px' }}>
              <Clock size={14} />
              <span style={{ fontSize: '11px', fontWeight: 800 }}>光影穿梭</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', fontFamily: 'monospace' }}>
              {stats.totalHours}
            </span>
            <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '2px' }}>小时</span>
          </div>

          <div
            style={{
              padding: '12px 10px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#F59E0B', marginBottom: '2px' }}>
              <Star size={14} fill="#F59E0B" />
              <span style={{ fontSize: '11px', fontWeight: 800 }}>综合均分</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', fontFamily: 'monospace' }}>
              {stats.avgRating}
            </span>
            <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '2px' }}>分</span>
          </div>

          <div
            style={{
              padding: '12px 10px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#10B981', marginBottom: '2px' }}>
              <Award size={14} />
              <span style={{ fontSize: '11px', fontWeight: 800 }}>想看储备</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#1E293B', fontFamily: 'monospace' }}>
              {stats.totalWishlist}
            </span>
            <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '2px' }}>部</span>
          </div>
        </div>

        {/* 评分最高 TOP 3 */}
        {topMovies.length > 0 && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>
              👑 殿堂高分 TOP 3
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {topMovies.map((m, idx) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : '#B45309',
                        color: '#FFFFFF',
                        fontSize: '9px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span
                      style={{
                        color: '#1E293B',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {m.title}
                    </span>
                  </div>
                  <span style={{ color: '#D97706', fontWeight: 900, fontFamily: 'monospace' }}>
                    ★ {m.rating.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
