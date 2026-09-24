import React, { useState, useEffect } from 'react';
import {
  GachaPalette,
  WishItem,
  CapsuleColorKey,
  DEFAULT_GACHA_PALETTE,
  generateColormindGachaPalette,
  GachaMode,
  DecisionTaskItem,
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
import { gachaAudio } from './core/gachaAudio';
import { fetchColormindPalette } from '../../../core/theme/colormindService';
import { GachaMachineStage } from './components/GachaMachineStage';
import { CapsuleOpenModal } from './components/CapsuleOpenModal';
import { DecisionTaskOpenModal } from './components/DecisionTaskOpenModal';
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

  // 初始化数据
  useEffect(() => {
    const list = loadWishes();
    setWishes(list);
    loadTasks();

    // 监听任务更新（外部番茄钟或日记打钩时自动同步）
    const handleSyncTasks = () => {
      loadTasks();
    };

    window.addEventListener('cloudfly_pomodoro_tasks_updated', handleSyncTasks);
    window.addEventListener('cloudfly_quests_updated', handleSyncTasks);

    return () => {
      window.removeEventListener('cloudfly_pomodoro_tasks_updated', handleSyncTasks);
      window.removeEventListener('cloudfly_quests_updated', handleSyncTasks);
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
    } else {
      // 待办决断池
      if (decisionTasks.length === 0) {
        showToast('🎯 当前日记与番茄钟无未完成任务');
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
  const activeBalls: WishItem[] = activeMode === 'wish'
    ? wishes.filter((w) => w.status === 'in_machine')
    : decisionTasks.map((t) => ({
        id: t.id,
        content: t.title,
        colorKey: t.colorKey,
        icon: t.icon,
        status: 'in_machine' as const,
        createdAt: t.createdAt,
      }));

  const activeDroppedCapsule: WishItem | null = activeMode === 'wish'
    ? droppedWish
    : droppedDecisionTask
      ? {
          id: droppedDecisionTask.id,
          content: droppedDecisionTask.title,
          colorKey: droppedDecisionTask.colorKey,
          icon: droppedDecisionTask.icon,
          status: 'in_machine' as const,
          createdAt: droppedDecisionTask.createdAt,
        }
      : null;

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
            {activeMode === 'wish' ? '扭蛋 · 心愿' : '扭蛋 · 决断'}
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
            {activeMode === 'wish' ? `${inMachineWishCount} 枚` : `${decisionTasks.length} 项`}
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

          {/* 手帐 / 决断清单 */}
          <button
            title={activeMode === 'wish' ? '心愿手帐' : '待办清单'}
            onClick={() => {
              if (activeMode === 'wish') {
                setShowArchiveModal(true);
              } else {
                setShowTaskSyncModal(true);
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
            <BookOpen size={18} />
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
            title={activeMode === 'wish' ? '放入新愿望' : '同步最新待办'}
            onClick={() => {
              if (activeMode === 'wish') {
                setShowAddModal(true);
              } else {
                setShowTaskSyncModal(true);
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
            gap: 4,
          }}
        >
          {/* 卡带 1：生活心愿池 */}
          <button
            onClick={() => {
              if (activeMode !== 'wish') {
                setActiveMode('wish');
                setDroppedWish(null);
                setDroppedDecisionTask(null);
                gachaAudio.playPop();
              }
            }}
            style={{
              padding: '5px 14px',
              borderRadius: 12,
              border: 'none',
              background: activeMode === 'wish' ? palette.buttonBg : 'transparent',
              color: activeMode === 'wish' ? palette.buttonText : palette.buttonBorder,
              fontSize: 12,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: activeMode === 'wish' ? `0 2px 6px ${palette.buttonBorder}26` : 'none',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                gachaAudio.playPop();
                loadTasks();
              }
            }}
            style={{
              padding: '5px 14px',
              borderRadius: 12,
              border: 'none',
              background: activeMode === 'task' ? palette.buttonBg : 'transparent',
              color: activeMode === 'task' ? palette.buttonText : palette.buttonBorder,
              fontSize: 12,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: activeMode === 'task' ? `0 2px 6px ${palette.buttonBorder}26` : 'none',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <span>🎯</span>
            <span>待办决断池</span>
            {decisionTasks.length > 0 && (
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: 8,
                  fontSize: 10,
                  background: palette.accent,
                  color: '#FFFFFF',
                  fontWeight: 900,
                }}
              >
                {decisionTasks.length}
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
            }
          }}
        />
      </div>

      {/* 底部轻量状态提示 */}
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
        ) : (
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

      {/* 弹窗 3：装入新心愿 */}
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
