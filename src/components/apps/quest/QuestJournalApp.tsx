import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Palette, CheckCircle2, RotateCw, GitBranch, FileUp, Dices } from 'lucide-react';
import { QuestCategory, QuestItem, AwardedStatResult } from '../../../core/quest/questTypes';
import {
  loadQuestJournal,
  markQuestDone,
  addCustomQuest,
  deleteCustomQuest,
  updateQuestItem,
  deleteQuest,
  loadQuestPalette,
  saveQuestPalette,
  triggerEasterEgg,
} from '../../../core/quest/questStorage';
import { dropRandomQuest } from '../../../core/quest/randomQuestDropService';
import { addRPGAttribute } from '../../../core/rpg/rpgStorage';
import { fetchColormindPalette, rgbToHex } from '../../../core/theme/colormindService';
import { QuestCard } from './components/QuestCard';
import { CreateQuestModal } from './components/CreateQuestModal';
import { ImportQuestTxtModal } from './components/ImportQuestTxtModal';
import { QuestDetailModal } from './components/QuestDetailModal';
import { FloatingStatToast } from './components/FloatingStatToast';
import { FactQuizModal } from './components/FactQuizModal';
import { MultiverseAgentModal } from './components/MultiverseAgentModal';
import { DisneyWishModal } from './components/DisneyWishModal';

interface QuestJournalAppProps {
  onBack: () => void;
  onOpenApp?: (appId: string) => void;
}

export const QuestJournalApp: React.FC<QuestJournalAppProps> = ({ onBack, onOpenApp }) => {
  const [quests, setQuests] = useState<QuestItem[]>(loadQuestJournal);
  const [activeTab, setActiveTab] = useState<QuestCategory>('main');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFactQuizModal, setShowFactQuizModal] = useState(false);
  const [showMultiverseModal, setShowMultiverseModal] = useState(false);
  const [showDisneyWishModal, setShowDisneyWishModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [floatingStat, setFloatingStat] = useState<AwardedStatResult | null>(null);
  const [palette, setPalette] = useState<string[]>(loadQuestPalette);
  const [isColoring, setIsColoring] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [isDropping, setIsDropping] = useState(false);
  const [selectedQuestForDetail, setSelectedQuestForDetail] = useState<QuestItem | null>(null);

  // 1. 监听任务更新与彩蛋解锁全局事件
  useEffect(() => {
    const handleQuestsUpdated = (e: any) => {
      if (e.detail) setQuests(e.detail);
    };

    const handleEasterEggUnlocked = (e: any) => {
      if (e.detail) {
        showToast(`✨ 惊奇偶遇！解锁了隐藏彩蛋：${e.detail.title}`);
      }
    };

    window.addEventListener('cloudfly_quests_updated', handleQuestsUpdated);
    window.addEventListener('cloudfly_easter_egg_unlocked', handleEasterEggUnlocked);

    return () => {
      window.removeEventListener('cloudfly_quests_updated', handleQuestsUpdated);
      window.removeEventListener('cloudfly_easter_egg_unlocked', handleEasterEggUnlocked);
    };
  }, []);

  // 2. 触发机制 A：静止沉思 10 秒自动开启冷知识脑洞彩蛋
  useEffect(() => {
    let idleTimer: any;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        triggerEasterEgg('FACT_QUIZ');
        setShowFactQuizModal(true);
      }, 10000);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    window.addEventListener('keydown', resetIdle);
    resetIdle();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      window.removeEventListener('keydown', resetIdle);
    };
  }, []);

  // 3. 触发机制 B：摇晃手机触发
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0, lastTime = 0;
    const handleMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current) return;
      const now = Date.now();
      if (now - lastTime > 150) {
        const diffTime = now - lastTime;
        lastTime = now;
        const speed =
          Math.abs((current.x || 0) + (current.y || 0) + (current.z || 0) - lastX - lastY - lastZ) /
          diffTime * 10000;
        if (speed > 1200) {
          triggerEasterEgg('FACT_QUIZ');
          setShowFactQuizModal(true);
        }
        lastX = current.x || 0;
        lastY = current.y || 0;
        lastZ = current.z || 0;
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion);
    }
    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, []);

  // 4. 触发机制 C：连续轻叩顶部标题/书签 3 次
  const handleTitleTap = () => {
    const next = tapCount + 1;
    if (next >= 3) {
      setTapCount(0);
      triggerEasterEgg('FACT_QUIZ');
      setShowFactQuizModal(true);
    } else {
      setTapCount(next);
      setTimeout(() => setTapCount(0), 1200);
    }
  };

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // 🎲 随机派发任务掉落（从 500 条每日任务库中不重复抽取，下发至当前任务栏目）
  const handleDropRandomQuest = () => {
    if (isDropping) return;
    setIsDropping(true);
    setTimeout(() => setIsDropping(false), 500);

    try {
      const res = dropRandomQuest(activeTab);
      const targetName = res.targetCategory === 'main' ? '生活主线' : '冒险支线';

      // 若当前在彩蛋栏目，自动切回主线以便直观查阅掉落的任务
      if (activeTab === 'easter_egg') {
        setActiveTab('main');
      }

      if (res.isPoolReset) {
        showToast(`✨ 500条任务库已开启新轮回！已掉落至【${targetName}】：${res.quest.title}`);
      } else {
        showToast(`🎲 随机任务掉落！已下发至【${targetName}】：${res.quest.title}（${res.quest.tag}）`);
      }
    } catch (err) {
      console.warn('随机掉落任务异常:', err);
      showToast('⚠️ 任务派发遇到问题，请重试');
    }
  };

  // 保存任务配置修改（支持修改名称、六维维度与增益数值、图标、栏目等）
  const handleUpdateQuest = (updated: QuestItem) => {
    const list = updateQuestItem(updated);
    setQuests(list);
    showToast(`✓ 已成功保存修改：${updated.title}`);
  };

  // 彻底删掉这个任务
  const handleDeleteQuest = (questId: string) => {
    const target = quests.find((q) => q.id === questId);
    const list = deleteQuest(questId);
    setQuests(list);
    showToast(`🗑️ 已删掉任务：${target?.title || '任务已移除'}`);
  };

  // 打卡完成（静默联动六维，触发上空飘字，不在面板上显示多余数值）
  const handleDone = (questId: string) => {
    if (questId === 'egg_fact_quiz') {
      setShowFactQuizModal(true);
      return;
    }
    if (questId === 'egg_multiverse_agent') {
      setShowMultiverseModal(true);
      return;
    }
    if (questId === 'egg_disney_wish') {
      setShowDisneyWishModal(true);
      return;
    }

    const { items: updated, awardedStat } = markQuestDone(questId);
    setQuests(updated);
    if (awardedStat) {
      setFloatingStat(awardedStat);
      setTimeout(() => setFloatingStat(null), 1900);
    }

    // 1. 玩法 2：童话星愿签 · 温暖治愈寄语（夜晚打卡完成一天所有手账后掉落）
    // 检查更新后当天主线任务是否已全量完成
    const remainingMain = updated.filter((q) => q.category === 'main' && q.status !== 'completed').length;
    const totalMainCount = updated.filter((q) => q.category === 'main').length;
    if (totalMainCount > 0 && remainingMain === 0) {
      setTimeout(() => {
        triggerEasterEgg('DISNEY_WISH');
        setShowDisneyWishModal(true);
      }, 850);
    } else {
      // 2. 随机完成一项主线或者支线任务后触发多元宇宙彩蛋 (概率严格控制在 10%~15%，取 12%)
      const targetQuest = quests.find((q) => q.id === questId);
      if (targetQuest && (targetQuest.category === 'main' || targetQuest.category === 'side')) {
        const luckyRoll = Math.random() < 0.12;
        if (luckyRoll) {
          setTimeout(() => {
            triggerEasterEgg('MULTIVERSE_PORTAL');
            setShowMultiverseModal(true);
          }, 750);
        }
      }
    }
  };

  // 自定义创建
  const handleCreateQuest = (
    quest: Omit<QuestItem, 'id' | 'currentProgress' | 'status' | 'isCustom'>
  ) => {
    const updated = addCustomQuest(quest);
    setQuests(updated);
    showToast('📜 新生活任务已成功收录至手账！');
  };

  // Colormind 和谐配色一键切换
  const handleRandomizePalette = async () => {
    if (isColoring) return;
    setIsColoring(true);
    try {
      const rgbColors = await fetchColormindPalette({ model: 'ui' });
      if (rgbColors && rgbColors.length === 5) {
        const hexes = rgbColors.map(rgbToHex);
        setPalette(hexes);
        saveQuestPalette(hexes);
        showToast('🎨 已生成并应用全新 Colormind 和谐调色盘！');
      } else {
        // 本地轮换柔和调色盘兜底
        const fallbacks = [
          ['#F6F8FB', '#E5EDF7', '#5096C6', '#2D445D', '#6CA8D6'],
          ['#F7FBF9', '#E6F4ED', '#38A169', '#1C4532', '#68D391'],
          ['#FBF7FB', '#F4E8F4', '#9333EA', '#4C1D95', '#C084FC'],
          ['#FDF8F5', '#FCE8E2', '#E06D53', '#5E291C', '#F6AD55'],
          ['#FAF7EE', '#F3EDD7', '#B7791F', '#5F370E', '#D69E2E'],
        ];
        const next = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        setPalette(next);
        saveQuestPalette(next);
        showToast('🎨 已切换一套新雅致配色！');
      }
    } catch {
      showToast('🎨 配色已刷新！');
    } finally {
      setIsColoring(false);
    }
  };

  // 当前分类下的过滤列表
  const filteredQuests = quests.filter((q) => q.category === activeTab);

  // 主线进度汇总 (如 3/5 达成)
  const mainTotal = quests.filter((q) => q.category === 'main').length;
  const mainDone = quests.filter((q) => q.category === 'main' && q.status === 'completed').length;
  const progressPercent = mainTotal > 0 ? Math.round((mainDone / mainTotal) * 100) : 0;

  // 待办未打卡任务统计（主线与支线）
  const mainRemaining = quests.filter((q) => q.category === 'main' && q.status === 'in_progress').length;
  const sideRemaining = quests.filter((q) => q.category === 'side' && q.status === 'in_progress').length;
  const eggRemaining = quests.filter((q) => q.category === 'easter_egg' && q.status === 'in_progress').length;

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--nm-bg, #E9EEF5)',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部标题栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px 8px',
          borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
          background: 'var(--nm-bg-lighter, #F2F6FB)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={onBack}
            className="nm-rebound-btn nm-btn-circle"
            style={{ width: '38px', height: '38px' }}
            title="返回主屏"
          >
            <ArrowLeft size={18} strokeWidth={2.4} />
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="nm-rebound-btn nm-btn-circle"
            style={{ width: '38px', height: '38px', color: 'var(--nm-text-main, #334257)' }}
            title="导入TXT任务"
          >
            <FileUp size={17} strokeWidth={2.3} />
          </button>
        </div>

        <div
          onClick={handleTitleTap}
          style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          title="连续轻触 3 次唤醒暗号彩蛋"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <GitBranch size={16} strokeWidth={2.4} style={{ color: 'var(--nm-primary, #5096C6)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 900, color: 'var(--nm-text-main, #334257)', margin: 0 }}>
              世界线
            </h2>
          </div>
          <span style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--nm-text-sub, #7D8CA3)' }}>
            Worldline & Quests
          </span>
        </div>

        {/* 右侧动作区：随机任务派发按钮 + 收录自定义任务按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleDropRandomQuest}
            disabled={isDropping}
            className="nm-rebound-btn nm-btn-circle"
            style={{
              width: '36px',
              height: '36px',
              color: 'var(--nm-primary, #5096C6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isDropping ? 'wait' : 'pointer',
            }}
            title={`随机派发一条任务至当前【${activeTab === 'side' ? '冒险支线' : '生活主线'}】(从500条任务库不重复抽取)`}
          >
            <Dices
              size={17}
              strokeWidth={2.4}
              style={{
                transform: isDropping ? 'rotate(180deg) scale(0.88)' : 'rotate(0deg) scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="nm-rebound-btn nm-btn-circle"
            style={{ width: '36px', height: '36px', color: 'var(--nm-primary, #5096C6)' }}
            title="收录自定义任务"
          >
            <Plus size={18} strokeWidth={2.6} />
          </button>
        </div>
      </div>

      {/* 达成率与 Colormind 换色控制条 */}
      <div
        style={{
          padding: '8px 14px',
          background: 'var(--nm-bg)',
          borderBottom: '1px solid rgba(166, 180, 200, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: '10px',
        }}
      >
        {/* 左侧：今日达成度 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <CheckCircle2 size={15} style={{ color: palette[2] || '#10B981', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                今日日常达成 {mainDone}/{mainTotal}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
                ({progressPercent}%)
              </span>
            </div>
            {/* 迷你轻拟物进度条 */}
            <div
              style={{
                width: '110px',
                height: '4px',
                borderRadius: '3px',
                background: '#CBD5E1',
                overflow: 'hidden',
                marginTop: '2px',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${palette[2] || '#10B981'}, ${palette[4] || '#059669'})`,
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* 右侧：Colormind 一键更换和谐配色 */}
        <button
          type="button"
          onClick={handleRandomizePalette}
          disabled={isColoring}
          className="nm-rebound-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            background: 'var(--nm-bg)',
            boxShadow: 'var(--nm-convex-xs)',
            cursor: isColoring ? 'wait' : 'pointer',
            flexShrink: 0,
          }}
          title="点击获取一套全新的 Colormind 和谐色彩"
        >
          {isColoring ? (
            <RotateCw size={13} className="spin-animation" style={{ color: palette[2] }} />
          ) : (
            <Palette size={13} style={{ color: palette[2] || 'var(--nm-primary)' }} />
          )}
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
            换套配色
          </span>
          {/* 配色色点预览 */}
          <div style={{ display: 'flex', gap: '2px', marginLeft: '2px' }}>
            {palette.slice(1, 4).map((c, i) => (
              <span
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                }}
              />
            ))}
          </div>
        </button>
      </div>

      {/* 三栏切页分段器 (主线 / 支线 / 彩蛋) */}
      <div style={{ padding: '8px 14px 4px', flexShrink: 0 }}>
        <div
          className="nm-inset-sm"
          style={{
            padding: '3px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '4px',
            borderRadius: '16px',
          }}
        >
          {/* 1. 主线任务 */}
          <button
            type="button"
            onClick={() => setActiveTab('main')}
            style={{
              position: 'relative',
              padding: '8px 0',
              borderRadius: '13px',
              fontSize: '11.5px',
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'main' ? 'var(--nm-bg, #E9EEF5)' : 'transparent',
              boxShadow: activeTab === 'main' ? 'var(--nm-convex-sm)' : 'none',
              color: activeTab === 'main' ? (palette[2] || 'var(--nm-primary, #5096C6)') : 'var(--nm-text-sub)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🌟 主线日常</span>
            {mainRemaining > 0 && (
              <span
                style={{
                  fontSize: '9px',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  background: palette[2] || '#5096C6',
                  color: '#FFFFFF',
                  fontWeight: 800,
                }}
              >
                {mainRemaining}
              </span>
            )}
          </button>

          {/* 2. 支线任务 */}
          <button
            type="button"
            onClick={() => setActiveTab('side')}
            style={{
              position: 'relative',
              padding: '8px 0',
              borderRadius: '13px',
              fontSize: '11.5px',
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'side' ? 'var(--nm-bg, #E9EEF5)' : 'transparent',
              boxShadow: activeTab === 'side' ? 'var(--nm-convex-sm)' : 'none',
              color: activeTab === 'side' ? (palette[2] || 'var(--nm-primary, #5096C6)') : 'var(--nm-text-sub)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🗺️ 支线探索</span>
            {sideRemaining > 0 && (
              <span
                style={{
                  fontSize: '9px',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  background: 'rgba(125, 140, 163, 0.6)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                }}
              >
                {sideRemaining}
              </span>
            )}
          </button>

          {/* 3. 彩蛋任务 */}
          <button
            type="button"
            onClick={() => setActiveTab('easter_egg')}
            style={{
              position: 'relative',
              padding: '8px 0',
              borderRadius: '13px',
              fontSize: '11.5px',
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'easter_egg' ? 'var(--nm-bg, #E9EEF5)' : 'transparent',
              boxShadow: activeTab === 'easter_egg' ? 'var(--nm-convex-sm)' : 'none',
              color: activeTab === 'easter_egg' ? '#9333EA' : 'var(--nm-text-sub)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🥚 彩蛋奇遇</span>
            {eggRemaining > 0 && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#9333EA',
                }}
              />
            )}
          </button>
        </div>
      </div>

      {/* 任务滚动列表 (接入和谐 UI 条调色盘) */}
      <div
        style={{
          flex: 1,
          padding: '8px 14px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxSizing: 'border-box',
        }}
      >
        {filteredQuests.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--nm-text-sub)',
            }}
          >
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📜</span>
            <span style={{ fontSize: '13px', fontWeight: 800 }}>暂无该类别的任务</span>
            <p style={{ fontSize: '11px', marginTop: '4px' }}>
              点击右上角「＋」可立即收录属于你的日常仪式
            </p>
          </div>
        ) : (
          filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              palette={palette}
              onDone={handleDone}
              onDelete={quest.isCustom ? deleteCustomQuest : undefined}
              onOpenDetail={(q) => setSelectedQuestForDetail(q)}
            />
          ))
        )}
      </div>

      {/* 屏幕上空飘字微动效 (静默提升六维属性，无面板干扰) */}
      {floatingStat && <FloatingStatToast stat={floatingStat} palette={palette} />}

      {/* 浮动轻提示 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 自定义任务发布弹窗 */}
      {showCreateModal && (
        <CreateQuestModal
          initialCategory={activeTab}
          onSave={handleCreateQuest}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* 批量TXT导入任务弹窗 */}
      <ImportQuestTxtModal
        isOpen={showImportModal}
        initialCategory={activeTab}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={(count, cat) => {
          setQuests(loadQuestJournal());
          setActiveTab(cat);
          showToast(`🎉 成功导入 ${count} 项${cat === 'main' ? '主线' : '支线'}任务！`);
        }}
      />

      {/* 冷知识“真的假的？”脑洞小测验弹窗 */}
      {showFactQuizModal && (
        <FactQuizModal
          palette={palette}
          onAwardStat={(stat) => {
            setFloatingStat(stat);
            setTimeout(() => setFloatingStat(null), 1900);
            // 真实累加六维属性数值（答对智力 INT +8 / 答错体质 CON +5）
            addRPGAttribute(stat.key as any, stat.gain);
            // 自动标记彩蛋完成
            const res = markQuestDone('egg_fact_quiz');
            setQuests(res.items);
          }}
          onClose={() => setShowFactQuizModal(false)}
        />
      )}

      {/* 瑞克和莫蒂多元宇宙特工证件卡弹窗 */}
      {showMultiverseModal && (
        <MultiverseAgentModal
          palette={palette}
          onAwardStat={(stat) => {
            setFloatingStat(stat);
            setTimeout(() => setFloatingStat(null), 1900);
            // 真实累加六维属性数值
            addRPGAttribute(stat.key as any, stat.gain);
            // 自动标记彩蛋完成
            const res = markQuestDone('egg_multiverse_agent');
            setQuests(res.items);
          }}
          onClose={() => setShowMultiverseModal(false)}
        />
      )}

      {/* 玩法 2：日常手账彩蛋【童话星愿签 · 温暖治愈寄语】（绝不和六维联动） */}
      {showDisneyWishModal && (
        <DisneyWishModal
          isOpen={showDisneyWishModal}
          onClose={() => {
            setShowDisneyWishModal(false);
            // 标记彩蛋手账为已阅读打卡（无六维加成）
            const res = markQuestDone('egg_disney_wish');
            setQuests(res.items);
          }}
        />
      )}

      {/* 任务详情查看、六维属性配置与删除模态框 */}
      {selectedQuestForDetail && (
        <QuestDetailModal
          quest={selectedQuestForDetail}
          isOpen={true}
          onClose={() => setSelectedQuestForDetail(null)}
          onSave={handleUpdateQuest}
          onDelete={handleDeleteQuest}
          onDone={handleDone}
        />
      )}
    </div>
  );
};
