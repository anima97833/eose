import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, BookOpen, Award, Heart, Sparkles, Plus } from 'lucide-react';
import { SavedPoemRecord, PoemStatus, PoetryStats } from '../../../core/poetry/poetryTypes';
import {
  loadAllSavedPoems,
  savePoemRecord,
  deletePoemRecord,
  togglePoemFavorite,
  markPoemPassed,
  markPoemLearning,
  updatePoemNotes,
  calculatePoetryStats,
} from '../../../core/poetry/poetryStorage';
import { getRankBadgeInfo } from '../../../core/poetry/clozeEngine';
import { PoetryCard } from './components/PoetryCard';
import { PoetrySearchModal } from './components/PoetrySearchModal';
import { PoetryExamModal } from './components/PoetryExamModal';
import { PoetryDetailModal } from './components/PoetryDetailModal';

interface PoetryAppProps {
  onBack: () => void;
}

type TabType = 'learning' | 'mastered' | 'favorite';

export const PoetryApp: React.FC<PoetryAppProps> = ({ onBack }) => {
  const [poems, setPoems] = useState<SavedPoemRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('learning');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [examPoem, setExamPoem] = useState<SavedPoemRecord | null>(null);
  const [detailPoem, setDetailPoem] = useState<SavedPoemRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  // 首次挂载加载诗词
  useEffect(() => {
    loadAllSavedPoems().then((data) => {
      setPoems(data);
    });
  }, []);

  const stats: PoetryStats = useMemo(() => calculatePoetryStats(poems), [poems]);
  const badge = getRankBadgeInfo(stats.currentRank);

  // 过滤当前标签对应的诗歌
  const filteredPoems = useMemo(() => {
    if (activeTab === 'learning') {
      return poems.filter((p) => p.status === 'learning');
    }
    if (activeTab === 'mastered') {
      return poems.filter((p) => p.status === 'mastered');
    }
    return poems.filter((p) => p.isFavorite);
  }, [poems, activeTab]);

  const existingIds = useMemo(() => new Set(poems.map((p) => p.id)), [poems]);

  // 新增/收录诗词
  const handleAddPoem = async (newPoem: SavedPoemRecord) => {
    await savePoemRecord(newPoem);
    setPoems((prev) => [newPoem, ...prev.filter((p) => p.id !== newPoem.id)]);
    showToast('已收入诗阁');
  };

  // 删除诗词
  const handleDelete = async (id: string) => {
    await deletePoemRecord(id);
    setPoems((prev) => prev.filter((p) => p.id !== id));
    if (detailPoem?.id === id) setDetailPoem(null);
    if (examPoem?.id === id) setExamPoem(null);
    showToast('已移出诗阁');
  };

  // 切换收藏
  const handleToggleFavorite = async (id: string) => {
    const isFav = await togglePoemFavorite(id);
    setPoems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: isFav } : p))
    );
    if (detailPoem?.id === id) {
      setDetailPoem((prev) => (prev ? { ...prev, isFavorite: isFav } : null));
    }
    showToast(isFav ? '已入心仪' : '取消心仪');
  };

  // 切换在背/熟背状态
  const handleToggleStatus = async (id: string) => {
    const current = poems.find((p) => p.id === id);
    if (!current) return;

    if (current.status === 'mastered') {
      await markPoemLearning(id);
      setPoems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'learning' } : p))
      );
      if (detailPoem?.id === id) {
        setDetailPoem((prev) => (prev ? { ...prev, status: 'learning' } : null));
      }
      showToast('移至在背');
    } else {
      await markPoemPassed(id);
      setPoems((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'mastered', quizPassCount: (p.quizPassCount || 0) + 1 }
            : p
        )
      );
      if (detailPoem?.id === id) {
        setDetailPoem((prev) =>
          prev
            ? { ...prev, status: 'mastered', quizPassCount: (prev.quizPassCount || 0) + 1 }
            : null
        );
      }
      showToast('荣登熟背');
    }
  };

  // 考核成功完成
  const handleExamSuccess = async (poemId: string) => {
    await markPoemPassed(poemId);
    setPoems((prev) =>
      prev.map((p) =>
        p.id === poemId
          ? {
              ...p,
              status: 'mastered',
              quizPassCount: (p.quizPassCount || 0) + 1,
            }
          : p
      )
    );
    showToast('科举通关！');
  };

  // 保存随笔笔记
  const handleSaveNotes = async (id: string, notes: string) => {
    await updatePoemNotes(id, notes);
    setPoems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, userNotes: notes } : p))
    );
    if (detailPoem?.id === id) {
      setDetailPoem((prev) => (prev ? { ...prev, userNotes: notes } : null));
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f6f1e6',
        color: '#2b2319',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Songti SC", "SimSun", sans-serif',
      }}
    >
      {/* 顶部导航栏 */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e3d7c3',
          background: 'linear-gradient(180deg, #fdfbf7 0%, #f7f2e8 100%)',
          boxShadow: '0 2px 8px rgba(100, 75, 45, 0.05)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              color: '#5a4c3d',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 8,
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.18rem',
                  fontWeight: 800,
                  color: '#261e15',
                  fontFamily: '"Songti SC", "SimSun", serif',
                  letterSpacing: '0.04em',
                }}
              >
                诗阁
              </h2>

              {/* 科举功名阶位徽章 */}
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: badge.color,
                  backgroundColor: badge.bg,
                  border: `1px solid ${badge.border}`,
                  padding: '1px 6px',
                  borderRadius: 4,
                }}
              >
                {badge.label}
              </span>
            </div>
          </div>
        </div>

        {/* 顶部寻诗按钮 */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #b91c1c',
            background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(185, 28, 28, 0.25)',
          }}
        >
          <Plus size={15} strokeWidth={2.4} />
          <span>寻诗</span>
        </button>
      </div>

      {/* 诗阁统计与功名进度胶囊 */}
      <div style={{ padding: '12px 16px 6px' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5dac9',
            borderRadius: 14,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            boxShadow: '0 2px 6px rgba(100, 80, 50, 0.04)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#b91c1c' }}>
              {stats.masteredCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7a6854', marginTop: 1 }}>
              熟背通关
            </div>
          </div>

          <div style={{ width: 1, height: 24, backgroundColor: '#ece2d2' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#8a6833' }}>
              {stats.learningCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7a6854', marginTop: 1 }}>
              在背温习
            </div>
          </div>

          <div style={{ width: 1, height: 24, backgroundColor: '#ece2d2' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563eb' }}>
              {stats.totalPasses}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7a6854', marginTop: 1 }}>
              殿试累捷
            </div>
          </div>
        </div>
      </div>

      {/* 方向A三大分类活页切换（在背、熟背、心仪） */}
      <div
        style={{
          padding: '6px 16px 8px',
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('learning')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 8,
            border: activeTab === 'learning' ? '1.5px solid #b0894c' : '1px solid #dfd3c0',
            background: activeTab === 'learning' ? '#faf4e8' : '#f0e8d8',
            color: activeTab === 'learning' ? '#70542a' : '#7f6f5d',
            fontSize: '0.84rem',
            fontWeight: activeTab === 'learning' ? 800 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          在背 ({stats.learningCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mastered')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 8,
            border: activeTab === 'mastered' ? '1.5px solid #b91c1c' : '1px solid #dfd3c0',
            background: activeTab === 'mastered' ? '#fef2f2' : '#f0e8d8',
            color: activeTab === 'mastered' ? '#b91c1c' : '#7f6f5d',
            fontSize: '0.84rem',
            fontWeight: activeTab === 'mastered' ? 800 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          熟背 ({stats.masteredCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favorite')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 8,
            border: activeTab === 'favorite' ? '1.5px solid #dc2626' : '1px solid #dfd3c0',
            background: activeTab === 'favorite' ? '#fff1f2' : '#f0e8d8',
            color: activeTab === 'favorite' ? '#be123c' : '#7f6f5d',
            fontSize: '0.84rem',
            fontWeight: activeTab === 'favorite' ? 800 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          心仪 ({stats.favoriteCount})
        </button>
      </div>

      {/* 诗篇宣纸卡片列表区 */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '4px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {filteredPoems.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              color: '#8c7b68',
            }}
          >
            <BookOpen size={36} strokeWidth={1.5} color="#b5a593" />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {activeTab === 'learning'
                ? '在背篇章已空，所有诗篇皆已通关！'
                : activeTab === 'mastered'
                ? '暂无熟背诗篇，快去开展挖词殿试通关吧！'
                : '暂无心仪诗篇，遇到喜欢的诗可点亮红心'}
            </div>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '7px 16px',
                borderRadius: 8,
                border: '1px solid #b91c1c',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              <Search size={14} />
              <span>寻觅新篇</span>
            </button>
          </div>
        ) : (
          filteredPoems.map((poem) => (
            <PoetryCard
              key={poem.id}
              poem={poem}
              onOpenDetail={(p) => setDetailPoem(p)}
              onStartExam={(p) => setExamPoem(p)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* 浮动 Toast 反馈 */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(38, 30, 22, 0.92)',
            color: '#faf5ed',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 600,
            zIndex: 2000,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(210, 185, 150, 0.3)',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 寻诗模态框 */}
      {isSearchOpen && (
        <PoetrySearchModal
          onClose={() => setIsSearchOpen(false)}
          onAddPoem={handleAddPoem}
          existingIds={existingIds}
        />
      )}

      {/* 考核通关考场模态框（方向B交互） */}
      {examPoem && (
        <PoetryExamModal
          poem={examPoem}
          onClose={() => setExamPoem(null)}
          onExamSuccess={handleExamSuccess}
        />
      )}

      {/* 诵读与赏析详情模态框 */}
      {detailPoem && (
        <PoetryDetailModal
          poem={detailPoem}
          onClose={() => setDetailPoem(null)}
          onStartExam={(p) => {
            setDetailPoem(null);
            setExamPoem(p);
          }}
          onToggleFavorite={handleToggleFavorite}
          onToggleStatus={handleToggleStatus}
          onSaveNotes={handleSaveNotes}
        />
      )}
    </div>
  );
};
