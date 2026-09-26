import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Search, Trophy, Clock, Sparkles, Filter, Joystick, BarChart3, Star, X } from 'lucide-react';
import { GameRecord, GameStatus, GamePlatform, GameSearchResult, STATUS_NAMES } from '../../../core/games/gameTypes';
import { loadAllGames, saveGame, deleteGame, calculateGameStats } from '../../../core/games/gameStorage';
import { GameCartridgeCard } from './components/GameCartridgeCard';
import { GameSearchModal } from './components/GameSearchModal';
import { GameEditModal } from './components/GameEditModal';

interface GameVaultAppProps {
  onBack: () => void;
  onOpenApp?: (appId: string) => void;
}

export const GameVaultApp: React.FC<GameVaultAppProps> = ({ onBack }) => {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | GameStatus>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | GamePlatform>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 模态框状态
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Partial<GameRecord> | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const reloadData = async () => {
    const list = await loadAllGames();
    setGames(list);
  };

  useEffect(() => {
    reloadData();

    const handleSync = () => {
      reloadData();
    };
    window.addEventListener('cloudfly_games_updated', handleSync);
    return () => {
      window.removeEventListener('cloudfly_games_updated', handleSync);
    };
  }, []);

  const stats = useMemo(() => calculateGameStats(games), [games]);

  // 过滤展示卡带
  const displayedGames = useMemo(() => {
    return games.filter((g) => {
      if (activeStatusTab !== 'all' && g.status !== activeStatusTab) return false;
      if (platformFilter !== 'all' && g.platform !== platformFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          g.title.toLowerCase().includes(q) ||
          (g.originalTitle && g.originalTitle.toLowerCase().includes(q)) ||
          (g.tags && g.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }
      return true;
    });
  }, [games, activeStatusTab, platformFilter, searchQuery]);

  const handleSave = async (record: GameRecord) => {
    try {
      await saveGame(record);
      await reloadData();
      setEditingGame(null);
      showToast('🎮 卡带已收入私藏架');
    } catch {
      showToast('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGame(id);
      await reloadData();
      setEditingGame(null);
      showToast('卡带已移出');
    } catch {
      showToast('删除失败');
    }
  };

  const handleSelectFromSearch = (result: Partial<GameSearchResult>) => {
    setShowSearchModal(false);
    // 打开编辑弹窗并带入检索数据
    setEditingGame({
      title: result.title || '',
      originalTitle: result.originalTitle,
      coverUrl: result.coverUrl,
      bannerUrl: result.bannerUrl,
      platform: result.platform || 'steam',
      status: 'playing',
      playtimeHours: 0,
      rating: 5,
      source: result.source || 'manual',
      tags: result.genre ? [result.genre] : [],
    });
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#FAF4E8',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        color: '#502428',
      }}
    >
      {/* 顶部拟物标题导航栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px 6px',
          zIndex: 10,
          flexShrink: 0,
          borderBottom: '2px solid rgba(80, 36, 40, 0.08)',
          background: 'linear-gradient(180deg, #FFFDF8 0%, #FAF4E8 100%)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            border: '2px solid #502428',
            background: '#FFFFFF',
            color: '#502428',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 0 #502428',
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Joystick size={20} color="#502428" strokeWidth={2.5} />
          <span
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#502428',
              letterSpacing: '0.5px',
            }}
          >
            游戏仓
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 900,
              padding: '1px 7px',
              borderRadius: '10px',
              background: '#502428',
              color: '#FFFFFF',
            }}
          >
            {games.length} 部
          </span>
        </div>

        {/* 右侧动作图标栏 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            title="统计概览"
            onClick={() => setShowStatsModal(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: '2px solid #502428',
              background: '#FFFFFF',
              color: '#502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #502428',
            }}
          >
            <BarChart3 size={17} />
          </button>

          <button
            title="入库新游戏"
            onClick={() => setShowSearchModal(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: '2px solid #502428',
              background: '#10B981',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #064E3B',
            }}
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* 状态过滤标签栏 (全部 / 在玩 / 想玩 / 通关 / 封盘) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '8px 14px 4px',
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {[
          { key: 'all', label: '全部', count: stats.totalCount },
          { key: 'playing', label: '在玩', count: stats.playingCount },
          { key: 'wishlist', label: '想玩', count: stats.wishlistCount },
          { key: 'cleared', label: '通关', count: stats.clearedCount },
          { key: 'dropped', label: '封盘', count: stats.droppedCount },
        ].map((tab) => {
          const isSelected = activeStatusTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveStatusTab(tab.key as any)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: isSelected ? '1.5px solid #502428' : '1.5px solid rgba(80,36,40,0.18)',
                background: isSelected ? '#502428' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#6B4A34',
                fontSize: '11.5px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? '0 2px 0 #2A1113' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: '10px', opacity: isSelected ? 0.9 : 0.6 }}>({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* 平台筛选二级微标 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 14px 6px',
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8A6D55', whiteSpace: 'nowrap' }}>
          平台:
        </span>
        {[
          { key: 'all', label: '全部' },
          { key: 'steam', label: 'Steam' },
          { key: 'switch', label: 'Switch' },
          { key: 'mobile', label: '手游' },
          { key: 'playstation', label: 'PS' },
          { key: 'xbox', label: 'Xbox' },
          { key: 'pc', label: 'PC' },
        ].map((p) => {
          const isSelected = platformFilter === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setPlatformFilter(p.key as any)}
              style={{
                padding: '1px 7px',
                borderRadius: '6px',
                border: isSelected ? '1px solid #502428' : '1px solid transparent',
                background: isSelected ? '#FCE7F3' : 'transparent',
                color: isSelected ? '#9D174D' : '#8A6D55',
                fontSize: '10px',
                fontWeight: isSelected ? 900 : 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* 主卡带陈列架列表 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {displayedGames.length > 0 ? (
          displayedGames.map((game) => (
            <GameCartridgeCard
              key={game.id}
              game={game}
              onClick={() => setEditingGame(game)}
              onEdit={() => setEditingGame(game)}
              onDelete={() => handleDelete(game.id)}
            />
          ))
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              textAlign: 'center',
              color: '#8A6D55',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '42px', opacity: 0.8 }}>🕹️</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#502428' }}>
              私藏架空空如也
            </div>
            <div style={{ fontSize: '11.5px', lineHeight: 1.5, maxWidth: '240px' }}>
              点击右上角「+」检索 Steam 端游或手游，为你的数字生活建立专属卡带！
            </div>
            <button
              onClick={() => setShowSearchModal(true)}
              style={{
                background: '#502428',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 3px 0 #2A1113',
              }}
            >
              + 立即搜游戏入库
            </button>
          </div>
        )}
      </div>

      {/* 弹窗 1：检索游戏入库 */}
      {showSearchModal && (
        <GameSearchModal
          onClose={() => setShowSearchModal(false)}
          onSelectGame={handleSelectFromSearch}
          onOpenManual={() => {
            setShowSearchModal(false);
            setEditingGame({
              title: '',
              platform: 'steam',
              status: 'playing',
              playtimeHours: 0,
              rating: 5,
            });
          }}
        />
      )}

      {/* 弹窗 2：编辑/新增游戏记录 */}
      {editingGame && (
        <GameEditModal
          initialGame={editingGame}
          onClose={() => setEditingGame(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {/* 弹窗 3：统计概览弹窗 */}
      {showStatsModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 65,
            background: 'rgba(26, 20, 22, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowStatsModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '300px',
              background: '#FAF4E8',
              borderRadius: '20px',
              border: '2.5px solid #502428',
              padding: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#502428' }}>
                📊 游乐私藏生涯统计
              </span>
              <button
                onClick={() => setShowStatsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#502428' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1.5px solid #502428',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#8A6D55', fontWeight: 700 }}>藏卡总量</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#502428', marginTop: '2px' }}>
                  {stats.totalCount}
                </div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1.5px solid #502428',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#8A6D55', fontWeight: 700 }}>累计时长</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803D', marginTop: '2px' }}>
                  {stats.totalPlaytimeHours}h
                </div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1.5px solid #502428',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#8A6D55', fontWeight: 700 }}>通关神作</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#B45309', marginTop: '2px' }}>
                  {stats.clearedCount}
                </div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1.5px solid #502428',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#8A6D55', fontWeight: 700 }}>愿望单想玩</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#C2410C', marginTop: '2px' }}>
                  {stats.wishlistCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 极简浮动 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(38, 28, 30, 0.9)',
            color: '#FFFFFF',
            padding: '8px 18px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: 800,
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.2s',
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
