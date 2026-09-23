import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Palette, CheckCircle2, RotateCw } from 'lucide-react';
import { QuestCategory, QuestItem, AwardedStatResult } from '../../../core/quest/questTypes';
import {
  loadQuestJournal,
  markQuestDone,
  addCustomQuest,
  deleteCustomQuest,
  loadQuestPalette,
  saveQuestPalette,
} from '../../../core/quest/questStorage';
import { fetchColormindPalette, rgbToHex } from '../../../core/theme/colormindService';
import { QuestCard } from './components/QuestCard';
import { CreateQuestModal } from './components/CreateQuestModal';
import { FloatingStatToast } from './components/FloatingStatToast';

interface QuestJournalAppProps {
  onBack: () => void;
  onOpenApp?: (appId: string) => void;
}

export const QuestJournalApp: React.FC<QuestJournalAppProps> = ({ onBack, onOpenApp }) => {
  const [quests, setQuests] = useState<QuestItem[]>(loadQuestJournal);
  const [activeTab, setActiveTab] = useState<QuestCategory>('main');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [floatingStat, setFloatingStat] = useState<AwardedStatResult | null>(null);
  const [palette, setPalette] = useState<string[]>(loadQuestPalette);
  const [isColoring, setIsColoring] = useState(false);

  // 监听任务更新与彩蛋解锁全局事件
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

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // 打卡完成（静默联动六维，触发上空飘字，不在面板上显示多余数值）
  const handleDone = (questId: string) => {
    const { items: updated, awardedStat } = markQuestDone(questId);
    setQuests(updated);
    if (awardedStat) {
      setFloatingStat(awardedStat);
      setTimeout(() => setFloatingStat(null), 1900);
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
        <button
          type="button"
          onClick={onBack}
          className="nm-rebound-btn nm-btn-circle"
          style={{ width: '38px', height: '38px' }}
          title="返回主屏"
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 900, color: 'var(--nm-text-main, #334257)', margin: 0 }}>
            日常手账
          </h2>
          <span style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--nm-text-sub, #7D8CA3)' }}>
            Daily Rituals & Discoveries
          </span>
        </div>

        {/* 右侧发布新任务按钮 */}
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="nm-rebound-btn nm-btn-circle"
          style={{ width: '38px', height: '38px', color: 'var(--nm-primary, #5096C6)' }}
          title="收录自定义任务"
        >
          <Plus size={20} strokeWidth={2.6} />
        </button>
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
    </div>
  );
};
