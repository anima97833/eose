import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, TrendingUp, Film, Clock, Star, Sparkles } from 'lucide-react';
import { MovieRecord, CinemaStats, MovieStatus } from '../../../core/cinema/cinemaTypes';
import {
  loadAllMovies,
  saveMovie,
  deleteMovie,
  calculateCinemaStats,
} from '../../../core/cinema/cinemaStorage';
import { MovieTicketCard } from './components/MovieTicketCard';
import { MovieSearchModal } from './components/MovieSearchModal';
import { MovieEditModal } from './components/MovieEditModal';
import { MovieStatsModal } from './components/MovieStatsModal';

interface CinemaAppProps {
  onBack: () => void;
}

export const CinemaApp: React.FC<CinemaAppProps> = ({ onBack }) => {
  const [movies, setMovies] = useState<MovieRecord[]>([]);
  const [currentTab, setCurrentTab] = useState<MovieStatus>('watched');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Partial<MovieRecord> | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 初始化加载 IndexedDB 观影数据
  useEffect(() => {
    let isMounted = true;
    loadAllMovies().then((list) => {
      if (isMounted) setMovies(list);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleSaveMovie = async (movie: MovieRecord) => {
    try {
      await saveMovie(movie);
      const updatedList = await loadAllMovies();
      setMovies(updatedList);
      setEditingMovie(null);
      setShowSearchModal(false);
      showToast('票根已保存');
    } catch {
      showToast('保存失败');
    }
  };

  const handleDeleteMovie = async (id: string) => {
    try {
      await deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      showToast('票根已移除');
    } catch {
      showToast('删除失败');
    }
  };

  const handleSelectFromSearch = (draft: Partial<MovieRecord>) => {
    setShowSearchModal(false);
    setEditingMovie(draft);
  };

  const handleManualCreate = () => {
    setShowSearchModal(false);
    const today = new Date().toISOString().slice(0, 10);
    setEditingMovie({
      status: currentTab,
      rating: 8.5,
      watchedDate: today,
      year: new Date().getFullYear(),
    });
  };

  const stats: CinemaStats = calculateCinemaStats(movies);
  const filteredMovies = movies.filter((m) => m.status === currentTab);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--nm-bg, #E9EFF6)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        userSelect: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部标题栏 */}
      <div
        style={{
          height: '46px',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          background: 'rgba(233, 239, 246, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 10,
        }}
      >
        {/* 返回桌面 */}
        <button
          onClick={onBack}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--nm-bg, #E9EFF6)',
            boxShadow: '3px 3px 7px rgba(160, 175, 195, 0.5), -3px -3px 7px rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569',
          }}
          title="返回"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
        </button>

        {/* 标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Film size={17} color="#D97706" />
          <span
            style={{
              fontSize: '15px',
              fontWeight: 900,
              color: '#1E293B',
              letterSpacing: '0.5px',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            时光放映室
          </span>
        </div>

        {/* 右侧功能按钮：看板 + 搜片 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowStatsModal(true)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--nm-bg, #E9EFF6)',
              boxShadow: '3px 3px 7px rgba(160, 175, 195, 0.5), -3px -3px 7px rgba(255, 255, 255, 0.9)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#D97706',
            }}
            title="统计看板"
          >
            <TrendingUp size={16} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setShowSearchModal(true)}
            style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: '16px',
              backgroundColor: '#D97706',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.35)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 900,
            }}
          >
            <Plus size={15} strokeWidth={3} />
            <span>录票</span>
          </button>
        </div>
      </div>

      {/* 顶部拟物胶卷时光条（点击呼出全景看板） */}
      <div style={{ padding: '8px 14px 4px', flexShrink: 0 }}>
        <div
          onClick={() => setShowStatsModal(true)}
          style={{
            padding: '8px 12px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2C251E 0%, #17130F 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            border: '1px solid #4A3E31',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
              }}
            >
              <Film size={15} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#FDE047' }}>
                已放映 {stats.totalWatched} 部 · 穿梭 {stats.totalHours} 小时
              </span>
              <span style={{ fontSize: '9.5px', color: '#BDB3A4' }}>
                均分 {stats.avgRating} · 点击查看观影时空盘
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '3px 8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              fontSize: '10px',
              fontWeight: 800,
              color: '#FAF6EE',
            }}
          >
            报告 »
          </div>
        </div>
      </div>

      {/* 双 Tab 切换栏：已放映 vs 待上映 */}
      <div
        style={{
          padding: '6px 14px 4px',
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setCurrentTab('watched')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: '12px',
            border: 'none',
            fontSize: '12px',
            fontWeight: 900,
            cursor: 'pointer',
            backgroundColor: currentTab === 'watched' ? '#FFFFFF' : 'transparent',
            color: currentTab === 'watched' ? '#D97706' : '#64748B',
            boxShadow:
              currentTab === 'watched'
                ? '3px 3px 8px rgba(160, 175, 195, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.9)'
                : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
          }}
        >
          <Star size={13} fill={currentTab === 'watched' ? '#D97706' : 'none'} />
          <span>已放映</span>
          <span style={{ fontSize: '10px', opacity: 0.75, fontFamily: 'monospace' }}>
            ({movies.filter((m) => m.status === 'watched').length})
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('wishlist')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: '12px',
            border: 'none',
            fontSize: '12px',
            fontWeight: 900,
            cursor: 'pointer',
            backgroundColor: currentTab === 'wishlist' ? '#FFFFFF' : 'transparent',
            color: currentTab === 'wishlist' ? '#2563EB' : '#64748B',
            boxShadow:
              currentTab === 'wishlist'
                ? '3px 3px 8px rgba(160, 175, 195, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.9)'
                : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
          }}
        >
          <Clock size={13} />
          <span>待上映</span>
          <span style={{ fontSize: '10px', opacity: 0.75, fontFamily: 'monospace' }}>
            ({movies.filter((m) => m.status === 'wishlist').length})
          </span>
        </button>
      </div>

      {/* 票根流列表容器（设置 minHeight: 0 与 overflowY: auto，确保多票据时纵向平滑滚动，不被压缩） */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '8px 14px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
        }}
      >
        {filteredMovies.length === 0 ? (
          /* 空票夹引导卡片 */
          <div
            onClick={() => setShowSearchModal(true)}
            style={{
              marginTop: '40px',
              padding: '32px 20px',
              borderRadius: '20px',
              border: '2px dashed #CBD5E1',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', animation: 'bounce 1.6s infinite' }}>🎟️</div>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#475569' }}>
              {currentTab === 'watched' ? '票夹空空如也' : '暂无待看影片'}
            </span>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
              点击此处，搜索中英文片名即刻收入票夹
            </span>
          </div>
        ) : (
          filteredMovies.map((movie) => (
            <MovieTicketCard
              key={movie.id}
              movie={movie}
              onClick={() => setEditingMovie(movie)}
              onEdit={() => setEditingMovie(movie)}
              onDelete={() => handleDeleteMovie(movie.id)}
            />
          ))
        )}
      </div>

      {/* 搜索入库弹窗 */}
      {showSearchModal && (
        <MovieSearchModal
          onSelectMovie={handleSelectFromSearch}
          onManualCreate={handleManualCreate}
          onClose={() => setShowSearchModal(false)}
        />
      )}

      {/* 编辑与打分标注弹窗 */}
      {editingMovie && (
        <MovieEditModal
          initialMovie={editingMovie}
          onSave={handleSaveMovie}
          onClose={() => setEditingMovie(null)}
        />
      )}

      {/* 统计看板弹窗 */}
      {showStatsModal && (
        <MovieStatsModal
          stats={stats}
          movies={movies}
          onClose={() => setShowStatsModal(false)}
        />
      )}

      {/* 轻量 Toast 提示 */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 800,
            zIndex: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
