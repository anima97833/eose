import React, { useState, useEffect, useMemo } from 'react';
import {
  GachaPalette,
  WishItem,
  CapsuleColorKey,
  DEFAULT_GACHA_PALETTE,
  generateColormindGachaPalette,
  GachaMode,
  DecisionTaskItem,
  EntertainmentItem,
  EntertainmentSubFilter,
} from './core/gachaTypes';
import {
  loadWishes,
  addWish,
  markWishCompleted,
  returnWishToMachine,
  deleteWish,
  loadGachaPalette,
  saveGachaPalette,
} from './core/gachaStorage';
import {
  fetchUncompletedDecisionTasks,
  markDecisionTaskDone,
} from './core/gachaDecisionSync';
import { fetchEntertainmentItems } from './core/gachaEntertainmentSync';
import { gachaAudio } from './core/gachaAudio';
import { fetchColormindPalette } from '../../../core/theme/colormindService';
import { GachaMachineStage } from './components/GachaMachineStage';
import { CapsuleOpenModal } from './components/CapsuleOpenModal';
import { DecisionTaskOpenModal } from './components/DecisionTaskOpenModal';
import { EntertainmentOpenModal } from './components/EntertainmentOpenModal';
import { TaskPoolSyncModal } from './components/TaskPoolSyncModal';
import { AddWishModal } from './components/AddWishModal';
import { WishArchiveModal } from './components/WishArchiveModal';
import { ArrowLeft, Palette, BookOpen, Plus, Sparkles, RefreshCw } from 'lucide-react';

interface GachaponAppProps {
  onBack: () => void;
  onOpenApp?: (appId: string) => void;
}

export const GachaponApp: React.FC<GachaponAppProps> = ({ onBack, onOpenApp }) => {
  const [palette, setPalette] = useState<GachaPalette>(loadGachaPalette());
  const [activeMode, setActiveMode] = useState<GachaMode>('wish');

  // 1. 心愿池状态 (Wish Pool - 治愈与生活期许)
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [droppedWish, setDroppedWish] = useState<WishItem | null>(null);
  const [openingWish, setOpeningWish] = useState<WishItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);

  // 2. 待办决断池状态 (Task Pool - 专属于日记与番茄钟未打钩任务)
  const [decisionTasks, setDecisionTasks] = useState<DecisionTaskItem[]>([]);
  const [droppedDecisionTask, setDroppedDecisionTask] = useState<DecisionTaskItem | null>(null);
  const [openingDecisionTask, setOpeningDecisionTask] = useState<DecisionTaskItem | null>(null);
  const [showTaskSyncModal, setShowTaskSyncModal] = useState<boolean>(false);

  // 3. 娱乐消遣池状态 (Entertainment Pool - 书藏待读/在读 + 放映室待上映/想看电影)
  const [entertainmentItems, setEntertainmentItems] = useState<EntertainmentItem[]>([]);
  const [entertainmentSubFilter, setEntertainmentSubFilter] = useState<EntertainmentSubFilter>('all');
  const [droppedEntertainmentItem, setDroppedEntertainmentItem] = useState<EntertainmentItem | null>(null);
  const [openingEntertainmentItem, setOpeningEntertainmentItem] = useState<EntertainmentItem | null>(null);

  // 通用状态
  const [isCranking, setIsCranking] = useState<boolean>(false);
  const [isChangingColor, setIsChangingColor] = useState<boolean>(false);
  const [toastText, setToastText] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 1800);
  };

  // 加载日记与番茄钟中未打钩的待办任务
  const loadTasks = async () => {
    const list = await fetchUncompletedDecisionTasks();
    setDecisionTasks(list);
  };

  // 加载书藏与时光放映室中的娱乐条目
  const loadEntertainment = async () => {
    const list = await fetchEntertainmentItems('all');
    setEntertainmentItems(list);
  };

  // 初始化数据
  useEffect(() => {
    const list = loadWishes();
    setWishes(list);
    loadTasks();
    loadEntertainment();

    // 监听任务更新（外部番茄钟或日记打钩时自动同步）
    const handleSyncTasks = () => {
      loadTasks();
    };

    const handleSyncEntertainment = () => {
      loadEntertainment();
    };

    window.addEventListener('cloudfly_pomodoro_tasks_updated', handleSyncTasks);
    window.addEventListener('cloudfly_quests_updated', handleSyncTasks);
    window.addEventListener('cloudfly_books_updated', handleSyncEntertainment);
    window.addEventListener('cloudfly_movies_updated', handleSyncEntertainment);
    window.addEventListener('cloudfly_games_updated', handleSyncEntertainment);

    return () => {
      window.removeEventListener('cloudfly_pomodoro_tasks_updated', handleSyncTasks);
      window.removeEventListener('cloudfly_quests_updated', handleSyncTasks);
      window.removeEventListener('cloudfly_books_updated', handleSyncEntertainment);
      window.removeEventListener('cloudfly_movies_updated', handleSyncEntertainment);
      window.removeEventListener('cloudfly_games_updated', handleSyncEntertainment);
    };
  }, []);

  // Colormind AI 配色一键切换
  const handleColormindChange = async () => {
    if (isChangingColor) return;
    setIsChangingColor(true);
    try {
      const rgbList = await fetchColormindPalette({ model: 'ui' });
      if (rgbList && rgbList.length >= 5) {
        const newPalette = generateColormindGachaPalette(rgbList);
        setPalette(newPalette);
        saveGachaPalette(newPalette);
        showToast('🎨 已应用 Colormind 全新配色');
      }
    } catch (err) {
      console.warn('Colormind failed, falling back', err);
    } finally {
      setIsChangingColor(false);
    }
  };

  // 点击扭蛋机核心抽卡逻辑（根据卡带严格区分池子，绝不混池）
  const handleDraw = () => {
    if (isCranking) return;

    if (activeMode === 'wish') {
      const available = wishes.filter((w) => w.status === 'in_machine');
      if (available.length === 0) {
        setShowAddModal(true);
        return;
      }

      setIsCranking(true);
      gachaAudio.playRattle();

      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * available.length);
        const chosen = available[randomIndex];
        gachaAudio.playDrop();
        setDroppedWish(chosen);
        setIsCranking(false);
      }, 750);
    } else if (activeMode === 'task') {
      // 待办决断池
      if (decisionTasks.length === 0) {
        showToast('🎯 当前世界线与番茄钟无未完成任务');
        setShowTaskSyncModal(true);
        return;
      }

      setIsCranking(true);
      gachaAudio.playRattle();

      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * decisionTasks.length);
        const chosen = decisionTasks[randomIndex];
        gachaAudio.playDrop();
        setDroppedDecisionTask(chosen);
        setIsCranking(false);
      }, 750);
    } else {
      // 3. 娱乐消遣池 (Entertainment Pool)
      const pool = entertainmentItems.filter(
        (item) => entertainmentSubFilter === 'all' || item.type === entertainmentSubFilter
      );
      if (pool.length === 0) {
        showToast(
          entertainmentSubFilter === 'book'
            ? '📖 书藏中暂无在读或待读书目'
            : entertainmentSubFilter === 'movie'
            ? '🍿 放映室中暂无想看/待上映电影'
            : entertainmentSubFilter === 'game'
            ? '🕹️ 游戏仓中暂无在玩或想玩卡带'
            : '✨ 暂无在读/待读、想看电影或在玩卡带'
        );
        return;
      }

      setIsCranking(true);
      gachaAudio.playRattle();

      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * pool.length);
        const chosen = pool[randomIndex];
        gachaAudio.playDrop();
        setDroppedEntertainmentItem(chosen);
        setIsCranking(false);
      }, 750);
    }
  };

  // ===================== 心愿池操作 =====================
  const handleAddWish = (content: string, colorKey: CapsuleColorKey, icon: string) => {
    addWish(content, colorKey, icon);
    setWishes(loadWishes());
    showToast('✨ 愿望纸条已装填入扭蛋机');
  };

  const handleCompleteWish = (id: string) => {
    const { newMood } = markWishCompleted(id);
    setWishes(loadWishes());
    setDroppedWish(null);
    showToast(`✨ 心情提升至 ${newMood}`);
  };

  const handleReturnWishToMachine = (id: string) => {
    returnWishToMachine(id);
    setWishes(loadWishes());
    setDroppedWish(null);
  };

  const handleDeleteWish = (id: string) => {
    deleteWish(id);
    setWishes(loadWishes());
    if (droppedWish?.id === id) setDroppedWish(null);
  };

  // ===================== 待办决断池操作 =====================
  const handleCompleteDecisionTask = async (task: DecisionTaskItem) => {
    await markDecisionTaskDone(task);
    await loadTasks();
    setDroppedDecisionTask(null);
    showToast(`✅ 已搞定打钩：${task.title}`);
  };

  const handleReturnDecisionTask = () => {
    setDroppedDecisionTask(null);
  };

  // 映射到玻璃球内展示的实体球
  const activeBalls: WishItem[] = useMemo(() => {
    if (activeMode === 'wish') {
      return wishes.filter((w) => w.status === 'in_machine');
    }
    if (activeMode === 'task') {
      return decisionTasks.map((t) => ({
        id: t.id,
        content: t.title,
        colorKey: t.colorKey,
        icon: t.icon,
        status: 'in_machine' as const,
        createdAt: t.createdAt,
      }));
    }
    // 娱乐消遣池：根据子标签过滤（全部 / 仅书籍 / 仅电影）
    const filtered = entertainmentItems.filter(
      (item) => entertainmentSubFilter === 'all' || item.type === entertainmentSubFilter
    );
    return filtered.map((e) => ({
      id: e.id,
      content: e.title,
      colorKey: e.colorKey,
      icon: e.icon,
      status: 'in_machine' as const,
      createdAt: e.createdAt,
    }));
  }, [activeMode, wishes, decisionTasks, entertainmentItems, entertainmentSubFilter]);

  const activeDroppedCapsule: WishItem | null = useMemo(() => {
    if (activeMode === 'wish') return droppedWish;
    if (activeMode === 'task') {
      return droppedDecisionTask
        ? {
            id: droppedDecisionTask.id,
            content: droppedDecisionTask.title,
            colorKey: droppedDecisionTask.colorKey,
            icon: droppedDecisionTask.icon,
            status: 'in_machine' as const,
            createdAt: droppedDecisionTask.createdAt,
          }
        : null;
    }
    return droppedEntertainmentItem
      ? {
          id: droppedEntertainmentItem.id,
          content: droppedEntertainmentItem.title,
          colorKey: droppedEntertainmentItem.colorKey,
          icon: droppedEntertainmentItem.icon,
          status: 'in_machine' as const,
          createdAt: droppedEntertainmentItem.createdAt,
        }
      : null;
  }, [activeMode, droppedWish, droppedDecisionTask, droppedEntertainmentItem]);

  const inMachineWishCount = wishes.filter((w) => w.status === 'in_machine').length;
  const completedWishCount = wishes.filter((w) => w.status === 'completed').length;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: palette.background,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.5s ease',
      }}
    >
      {/* 顶部轻拟物顶栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px 4px',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* 返回主屏幕 */}
        <button
          onClick={onBack}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: `2px solid ${palette.buttonBorder || palette.secondary}`,
            background: palette.buttonBg || '#FFFFFF',
            color: palette.buttonText || palette.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: `0 3px 0 ${palette.buttonBorder || palette.secondary}33`,
            transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        {/* 标题与当前池计数 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: palette.titleColor || palette.secondary,
              letterSpacing: 1,
              transition: 'color 0.3s ease',
            }}
          >
            {activeMode === 'wish'
              ? '扭蛋 · 心愿'
              : activeMode === 'task'
              ? '扭蛋 · 决断'
              : '扭蛋 · 娱乐'}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 10,
              background: palette.badgeBg || palette.secondary,
              color: palette.badgeText || '#FFFFFF',
              border: `1.5px solid ${palette.buttonBorder || palette.secondary}`,
              transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease',
            }}
          >
            {activeMode === 'wish'
              ? `${inMachineWishCount} 枚`
              : activeMode === 'task'
              ? `${decisionTasks.length} 项`
              : `${entertainmentItems.length} 部`}
          </span>
        </div>

        {/* 右侧动作图标栏 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Colormind 换色 */}
          <button
            title="Colormind 配色切换"
            onClick={handleColormindChange}
            disabled={isChangingColor}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: `2px solid ${palette.buttonBorder || palette.secondary}`,
              background: palette.buttonBg || '#FFFFFF',
              color: palette.buttonText || palette.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isChangingColor ? 'default' : 'pointer',
              boxShadow: `0 3px 0 ${palette.buttonBorder || palette.secondary}33`,
              transform: isChangingColor ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.4s, background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
            }}
          >
            <Palette size={18} />
          </button>

          {/* 手帐 / 决断清单 / 娱乐刷新 */}
          <button
            title={
              activeMode === 'wish'
                ? '心愿手帐'
                : activeMode === 'task'
                ? '待办清单'
                : '刷新书藏与放映室'
            }
            onClick={() => {
              if (activeMode === 'wish') {
                setShowArchiveModal(true);
              } else if (activeMode === 'task') {
                setShowTaskSyncModal(true);
              } else {
                loadEntertainment();
                showToast('🍿 已同步书藏与放映室最新书影');
              }
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: `2px solid ${palette.buttonBorder || palette.secondary}`,
              background: palette.buttonBg || '#FFFFFF',
              color: palette.buttonText || palette.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 3px 0 ${palette.buttonBorder || palette.secondary}33`,
              position: 'relative',
              transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
            }}
          >
            {activeMode === 'entertainment' ? <RefreshCw size={17} /> : <BookOpen size={18} />}
            {activeMode === 'wish' && completedWishCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: palette.accent,
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1.5px solid ${palette.buttonBg || '#FFFFFF'}`,
                }}
              >
                {completedWishCount}
              </span>
            )}
          </button>

          {/* 添加 / 同步操作 */}
          <button
            title={
              activeMode === 'wish'
                ? '放入新愿望'
                : activeMode === 'task'
                ? '同步最新待办'
                : '前往书藏/放映室添加'
            }
            onClick={() => {
              if (activeMode === 'wish') {
                setShowAddModal(true);
              } else if (activeMode === 'task') {
                setShowTaskSyncModal(true);
              } else {
                onOpenApp?.('bookvault');
              }
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: `2px solid ${palette.buttonBorder || palette.secondary}`,
              background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 3px 0 ${palette.buttonBorder || palette.secondary}`,
              transition: 'background 0.3s ease, border-color 0.3s ease',
            }}
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* 🌟 双卡带/双机身切换拨片 (Dual Cartridge Mode Switcher) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px 6px',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '3px',
            borderRadius: 16,
            background: 'rgba(0, 0, 0, 0.05)',
            border: `1.5px solid ${palette.buttonBorder}`,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
            gap: 3,
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          {/* 卡带 1：生活心愿池 */}
          <button
            onClick={() => {
              if (activeMode !== 'wish') {
                setActiveMode('wish');
                setDroppedWish(null);
                setDroppedDecisionTask(null);
                setDroppedEntertainmentItem(null);
                gachaAudio.playPop();
              }
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 12,
              border: 'none',
              background: activeMode === 'wish' ? palette.buttonBg : 'transparent',
              color: activeMode === 'wish' ? palette.buttonText : palette.buttonBorder,
              fontSize: 11.5,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: activeMode === 'wish' ? `0 2px 6px ${palette.buttonBorder}26` : 'none',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              flexShrink: 0,
            }}
          >
            <span>🌸</span>
            <span>心愿手帐池</span>
          </button>

          {/* 卡带 2：待办决断池 */}
          <button
            onClick={() => {
              if (activeMode !== 'task') {
                setActiveMode('task');
                setDroppedWish(null);
                setDroppedDecisionTask(null);
                setDroppedEntertainmentItem(null);
                gachaAudio.playPop();
                loadTasks();
              }
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 12,
              border: 'none',
              background: activeMode === 'task' ? palette.buttonBg : 'transparent',
              color: activeMode === 'task' ? palette.buttonText : palette.buttonBorder,
              fontSize: 11.5,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: activeMode === 'task' ? `0 2px 6px ${palette.buttonBorder}26` : 'none',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              flexShrink: 0,
            }}
          >
            <span>🎯</span>
            <span>待办决断池</span>
            {decisionTasks.length > 0 && (
              <span
                style={{
                  padding: '1px 5px',
                  borderRadius: 8,
                  fontSize: 9.5,
                  background: palette.accent,
                  color: '#FFFFFF',
                  fontWeight: 900,
                }}
              >
                {decisionTasks.length}
              </span>
            )}
          </button>

          {/* 卡带 3：娱乐消遣池 (书藏待读/在读 + 放映室待上映/想看) */}
          <button
            onClick={() => {
              if (activeMode !== 'entertainment') {
                setActiveMode('entertainment');
                setDroppedWish(null);
                setDroppedDecisionTask(null);
                setDroppedEntertainmentItem(null);
                gachaAudio.playPop();
                loadEntertainment();
              }
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 12,
              border: 'none',
              background: activeMode === 'entertainment' ? palette.buttonBg : 'transparent',
              color: activeMode === 'entertainment' ? palette.buttonText : palette.buttonBorder,
              fontSize: 11.5,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: activeMode === 'entertainment' ? `0 2px 6px ${palette.buttonBorder}26` : 'none',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              flexShrink: 0,
            }}
          >
            <span>🍿</span>
            <span>娱乐消遣池</span>
            {entertainmentItems.length > 0 && (
              <span
                style={{
                  padding: '1px 5px',
                  borderRadius: 8,
                  fontSize: 9.5,
                  background: '#8B5CF6',
                  color: '#FFFFFF',
                  fontWeight: 900,
                }}
              >
                {entertainmentItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 扭蛋机中央主舞台 */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0 8px',
        }}
      >
        <GachaMachineStage
          palette={palette}
          wishes={activeBalls}
          onDrawWish={handleDraw}
          isCranking={isCranking}
          droppedWish={activeDroppedCapsule}
          onOpenDroppedCapsule={() => {
            if (activeMode === 'wish' && droppedWish) {
              setOpeningWish(droppedWish);
            } else if (activeMode === 'task' && droppedDecisionTask) {
              setOpeningDecisionTask(droppedDecisionTask);
            } else if (activeMode === 'entertainment' && droppedEntertainmentItem) {
              setOpeningEntertainmentItem(droppedEntertainmentItem);
            }
          }}
        />
      </div>

      {/* 底部轻量状态提示与娱乐模式双模子筛选 */}
      <div
        style={{
          padding: '4px 16px 10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {activeMode === 'wish' ? (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '6px 16px',
              borderRadius: 16,
              background: palette.buttonBg || 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(4px)',
              border: `1.5px solid ${palette.buttonBorder || palette.secondary}`,
              color: palette.buttonText || palette.secondary,
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: `0 3px 0 ${palette.buttonBorder || palette.secondary}26`,
              transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
            }}
          >
            <Plus size={14} strokeWidth={3} />
            <span>写下心愿塞入</span>
          </button>
        ) : activeMode === 'task' ? (
          <button
            onClick={() => setShowTaskSyncModal(true)}
            style={{
              padding: '6px 16px',
              borderRadius: 16,
              background: palette.buttonBg || 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(4px)',
              border: `1.5px solid ${palette.buttonBorder || palette.secondary}`,
              color: palette.buttonText || palette.secondary,
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: `0 3px 0 ${palette.buttonBorder || palette.secondary}26`,
              transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
            }}
          >
            <RefreshCw size={14} />
            <span>待办决断池：已同步 {decisionTasks.length} 项任务</span>
          </button>
        ) : (
          /* 选项 A：双模自由切（全部混抽 / 仅书籍 / 仅电影） */
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0, 0, 0, 0.05)',
              padding: '3px 6px',
              borderRadius: 16,
              border: `1.5px solid ${palette.buttonBorder}`,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {[
              { key: 'all', label: '全部混抽', icon: '🎲' },
              { key: 'book', label: '仅书籍', icon: '📖' },
              { key: 'movie', label: '仅电影', icon: '🍿' },
              { key: 'game', label: '仅游戏', icon: '🎮' },
            ].map((tab) => {
              const isSelected = entertainmentSubFilter === tab.key;
              const count =
                tab.key === 'all'
                  ? entertainmentItems.length
                  : entertainmentItems.filter((i) => i.type === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setEntertainmentSubFilter(tab.key as EntertainmentSubFilter);
                    setDroppedEntertainmentItem(null);
                    gachaAudio.playPop();
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    border: 'none',
                    background: isSelected ? palette.buttonBg : 'transparent',
                    color: isSelected ? palette.buttonText : palette.buttonBorder,
                    fontSize: 11,
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: isSelected ? `0 2px 4px ${palette.buttonBorder}26` : 'none',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: 9.5,
                      opacity: isSelected ? 0.9 : 0.6,
                      marginLeft: 1,
                    }}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 弹窗 1：打开心愿胶囊 */}
      {openingWish && (
        <CapsuleOpenModal
          wish={openingWish}
          palette={palette}
          onClose={() => setOpeningWish(null)}
          onReturnToMachine={handleReturnWishToMachine}
          onMarkComplete={handleCompleteWish}
        />
      )}

      {/* 弹窗 2：打开待办决断胶囊 */}
      {openingDecisionTask && (
        <DecisionTaskOpenModal
          task={openingDecisionTask}
          palette={palette}
          onClose={() => setOpeningDecisionTask(null)}
          onReturnToMachine={handleReturnDecisionTask}
          onMarkComplete={handleCompleteDecisionTask}
          onOpenApp={onOpenApp}
        />
      )}

      {/* 弹窗 3：打开娱乐消遣胶囊 */}
      {openingEntertainmentItem && (
        <EntertainmentOpenModal
          item={openingEntertainmentItem}
          palette={palette}
          onClose={() => setOpeningEntertainmentItem(null)}
          onReturnToMachine={() => {
            setDroppedEntertainmentItem(null);
          }}
          onLockForToday={(item) => {
            setDroppedEntertainmentItem(null);
            showToast(`✨ 今日消遣已锁定：《${item.title}》`);
          }}
          onOpenApp={onOpenApp}
        />
      )}

      {/* 弹窗 4：装入新心愿 */}
      {showAddModal && (
        <AddWishModal
          palette={palette}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddWish}
        />
      )}

      {/* 弹窗 4：心愿手帐历史 */}
      {showArchiveModal && (
        <WishArchiveModal
          wishes={wishes}
          palette={palette}
          onClose={() => setShowArchiveModal(false)}
          onReturnToMachine={handleReturnWishToMachine}
          onDeleteWish={handleDeleteWish}
        />
      )}

      {/* 弹窗 5：待办决断任务同步与核对 */}
      {showTaskSyncModal && (
        <TaskPoolSyncModal
          tasks={decisionTasks}
          palette={palette}
          onClose={() => setShowTaskSyncModal(false)}
          onRefresh={loadTasks}
          onOpenApp={onOpenApp}
        />
      )}

      {/* 极简 Toast 飘字 */}
      {toastText && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(38, 28, 30, 0.88)',
            color: '#FFFFFF',
            padding: '8px 18px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.2s',
          }}
        >
          <Sparkles size={14} color="#FFDE59" />
          <span>{toastText}</span>
        </div>
      )}
    </div>
  );
};
