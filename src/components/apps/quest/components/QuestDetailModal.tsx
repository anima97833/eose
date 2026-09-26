import React, { useState } from 'react';
import { X, Trash2, CheckCircle2, RotateCcw, Sparkles, Check, SlidersHorizontal } from 'lucide-react';
import { QuestCategory, QuestItem, RPGStatKey } from '../../../../core/quest/questTypes';

interface QuestDetailModalProps {
  quest: QuestItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedQuest: QuestItem) => void;
  onDelete: (questId: string) => void;
  onDone?: (questId: string) => void;
}

const ICON_OPTIONS = [
  '🍳', '🪥', '🍱', '🍲', '💧', '🏃', '📖', '🍵', '🧹', '🎒',
  '💬', '🛌', '🧘', '💻', '✨', '☕', '🐱', '🌸', '🏹', '⚔️',
  '☁️', '☀️', '🚲', '📝', '🎯', '🌿', '🕯️', '🥛', '🥗', '🥊',
];

const STAT_OPTIONS: { key: RPGStatKey; name: string; icon: string; color: string }[] = [
  { key: 'SPI', name: '精力', icon: '⚡', color: '#D97706' },
  { key: 'CHA', name: '魅力', icon: '✨', color: '#DB2777' },
  { key: 'INT', name: '智力', icon: '📚', color: '#2563EB' },
  { key: 'CON', name: '体质', icon: '💪', color: '#059669' },
  { key: 'DEX', name: '敏捷', icon: '🏹', color: '#D97706' },
  { key: 'STR', name: '力量', icon: '⚔️', color: '#DC2626' },
];

export const QuestDetailModal: React.FC<QuestDetailModalProps> = ({
  quest,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onDone,
}) => {
  if (!isOpen) return null;

  // 初始值解析
  const initialStatKey: RPGStatKey = quest.statKey || 'SPI';
  const initialGain =
    quest.statGain?.fixed ??
    quest.statGain?.min ??
    (quest.category === 'main' ? 3 : 6);

  const [category, setCategory] = useState<QuestCategory>(
    quest.category === 'easter_egg' ? 'main' : quest.category
  );
  const [title, setTitle] = useState(quest.title);
  const [desc, setDesc] = useState(quest.desc || '');
  const [selectedIcon, setSelectedIcon] = useState(quest.icon || '✨');
  const [selectedStat, setSelectedStat] = useState<RPGStatKey>(initialStatKey);
  const [gainValue, setGainValue] = useState<number>(initialGain);
  const [isDailyRepeatable, setIsDailyRepeatable] = useState(
    quest.isDailyRepeatable ?? category === 'main'
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const activeStatMeta = STAT_OPTIONS.find((s) => s.key === selectedStat) || STAT_OPTIONS[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedQuest: QuestItem = {
      ...quest,
      category,
      title: title.trim(),
      desc: desc.trim() || '保持热爱，奔赴下一次生活仪式',
      icon: selectedIcon,
      tag: `${activeStatMeta.icon} ${activeStatMeta.name} +${gainValue}`,
      statKey: selectedStat,
      statGain: {
        fixed: gainValue,
        min: category === 'main' ? 3 : 6,
        max: category === 'main' ? 6 : 12,
      },
      isDailyRepeatable,
    };

    onSave(updatedQuest);
    onClose();
  };

  const handleDelete = () => {
    onDelete(quest.id);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 110,
        background: 'rgba(15, 23, 42, 0.58)',
        backdropFilter: 'blur(7px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'backdropFadeIn 0.2s ease-out',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          background: 'var(--nm-bg, #E9EEF5)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 18px 40px rgba(0, 0, 0, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popInSpring 0.28s cubic-bezier(0.18, 0.9, 0.32, 1.2)',
          boxSizing: 'border-box',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--nm-bg-lighter, #F2F6FB)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, var(--nm-primary-light, #6BA8D6), var(--nm-primary, #5096C6))',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 2px 6px rgba(80, 150, 198, 0.35)',
              }}
            >
              {selectedIcon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 900, color: 'var(--nm-text-main, #334257)' }}>
                任务详情与配置
              </span>
              <span style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--nm-text-sub, #7D8CA3)' }}>
                {quest.status === 'completed' ? '✓ 今日已达成打卡' : '进行中 · 待打卡'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="nm-rebound-btn"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-xs)',
              border: 'none',
              color: 'var(--nm-text-sub)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* 表单内容 */}
        <form
          onSubmit={handleSave}
          style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxSizing: 'border-box',
            overflowY: 'auto',
            maxHeight: '430px',
          }}
        >
          {/* 1. 任务归属栏目 */}
          <div>
            <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--nm-text-sub)', display: 'block', marginBottom: '5px' }}>
              任务栏目
            </label>
            <div
              className="nm-inset-sm"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                padding: '3px',
                borderRadius: '12px',
                gap: '3px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setCategory('main');
                  setIsDailyRepeatable(true);
                }}
                style={{
                  padding: '6px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  background: category === 'main' ? 'var(--nm-bg)' : 'transparent',
                  color: category === 'main' ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
                  boxShadow: category === 'main' ? 'var(--nm-convex-xs)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                🍳 生活主线 (日常)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('side');
                  setIsDailyRepeatable(false);
                }}
                style={{
                  padding: '6px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  background: category === 'side' ? 'var(--nm-bg)' : 'transparent',
                  color: category === 'side' ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
                  boxShadow: category === 'side' ? 'var(--nm-convex-xs)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                ⚔️ 冒险支线 (奇遇)
              </button>
            </div>
          </div>

          {/* 2. 任务标题 */}
          <div>
            <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--nm-text-sub)', display: 'block', marginBottom: '4px' }}>
              任务名称
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务名称..."
              className="nm-inset-sm"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '11px',
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--nm-text-main)',
                boxSizing: 'border-box',
                background: 'var(--nm-bg)',
              }}
              required
            />
          </div>

          {/* 3. 任务描述 */}
          <div>
            <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--nm-text-sub)', display: 'block', marginBottom: '4px' }}>
              任务描述 / 寄语
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="添加一段激励随笔或备忘..."
              rows={2}
              className="nm-inset-sm"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '11px',
                border: 'none',
                outline: 'none',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--nm-text-main)',
                boxSizing: 'border-box',
                background: 'var(--nm-bg)',
                resize: 'none',
              }}
            />
          </div>

          {/* 4. 六维属性与增益指数 (核心配置) */}
          <div
            style={{
              padding: '10px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <SlidersHorizontal size={13} style={{ color: 'var(--nm-primary)' }} />
                <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--nm-text-main)' }}>
                  六维属性与增益指数
                </span>
              </div>
              {/* 实时效果预览 Tag */}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  color: activeStatMeta.color,
                  background: `${activeStatMeta.color}15`,
                  border: `1px solid ${activeStatMeta.color}35`,
                  padding: '1px 6px',
                  borderRadius: '6px',
                }}
              >
                {activeStatMeta.icon} {activeStatMeta.name} +{gainValue}
              </span>
            </div>

            {/* 六维维度选择网格 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '5px',
                marginBottom: '8px',
              }}
            >
              {STAT_OPTIONS.map((stat) => {
                const isSelected = selectedStat === stat.key;
                return (
                  <button
                    key={stat.key}
                    type="button"
                    onClick={() => setSelectedStat(stat.key)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: '8px',
                      border: isSelected ? `1.5px solid ${stat.color}` : '1px solid rgba(166, 180, 200, 0.25)',
                      background: isSelected ? `${stat.color}15` : 'var(--nm-bg)',
                      boxShadow: isSelected ? 'var(--nm-inset-xs)' : 'var(--nm-convex-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '11px' }}>{stat.icon}</span>
                    <span style={{ fontSize: '10.5px', fontWeight: 900, color: isSelected ? stat.color : 'var(--nm-text-main)' }}>
                      {stat.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 六维增益数值调节器 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
                打卡获得点数：
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setGainValue(Math.max(1, gainValue - 1))}
                  className="nm-rebound-btn"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--nm-bg)',
                    boxShadow: 'var(--nm-convex-xs)',
                    color: 'var(--nm-text-main)',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={gainValue}
                  onChange={(e) => setGainValue(Math.max(1, parseInt(e.target.value) || 1))}
                  className="nm-inset-sm"
                  style={{
                    width: '42px',
                    padding: '3px 0',
                    textAlign: 'center',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 900,
                    color: 'var(--nm-primary)',
                    background: 'var(--nm-bg)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setGainValue(Math.min(99, gainValue + 1))}
                  className="nm-rebound-btn"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--nm-bg)',
                    boxShadow: 'var(--nm-convex-xs)',
                    color: 'var(--nm-text-main)',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 5. 更换图标 */}
          <div>
            <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--nm-text-sub)', display: 'block', marginBottom: '5px' }}>
              个性图标
            </label>
            <div
              className="nm-inset-sm"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(10, 1fr)',
                gap: '3px',
                padding: '6px',
                borderRadius: '12px',
                background: 'var(--nm-bg)',
                maxHeight: '75px',
                overflowY: 'auto',
              }}
            >
              {ICON_OPTIONS.map((ic) => {
                const isSelected = selectedIcon === ic;
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setSelectedIcon(ic)}
                    style={{
                      aspectRatio: '1/1',
                      border: 'none',
                      borderRadius: '6px',
                      background: isSelected ? 'var(--nm-primary-lighter, #E0F2FE)' : 'transparent',
                      boxShadow: isSelected ? 'var(--nm-convex-xs)' : 'none',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {ic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. 重置开关 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
              每日 00:00 自动重置打卡状态
            </span>
            <input
              type="checkbox"
              checked={isDailyRepeatable}
              onChange={(e) => setIsDailyRepeatable(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: 'var(--nm-primary)', cursor: 'pointer' }}
            />
          </div>
        </form>

        {/* 底部动作栏：删除与保存 */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(166, 180, 200, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--nm-bg-lighter, #F2F6FB)',
            gap: '10px',
          }}
        >
          {/* 删除按钮 */}
          {showDeleteConfirm ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '7px 11px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.35)',
                }}
              >
                确认删除
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '7px 8px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: 'var(--nm-bg)',
                  color: 'var(--nm-text-sub)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="nm-rebound-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 12px',
                borderRadius: '11px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                background: 'rgba(254, 242, 242, 0.8)',
                color: '#EF4444',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: 'var(--nm-convex-xs)',
              }}
              title="从手账中彻底删掉这个任务"
            >
              <Trash2 size={13} strokeWidth={2.4} />
              <span>删除任务</span>
            </button>
          )}

          {/* 保存修改按钮 */}
          <button
            type="button"
            onClick={handleSave}
            className="nm-rebound-btn"
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              background: 'linear-gradient(135deg, var(--nm-primary-light, #6BA8D6) 0%, var(--nm-primary, #5096C6) 100%)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 900,
              boxShadow: '0 3px 10px rgba(80, 150, 198, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <Check size={14} strokeWidth={3} />
            <span>保存修改</span>
          </button>
        </div>
      </div>
    </div>
  );
};
