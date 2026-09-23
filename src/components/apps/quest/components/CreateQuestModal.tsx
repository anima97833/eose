import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { QuestCategory, QuestItem, RPGStatKey } from '../../../../core/quest/questTypes';

interface CreateQuestModalProps {
  initialCategory: QuestCategory;
  onSave: (quest: Omit<QuestItem, 'id' | 'currentProgress' | 'status' | 'isCustom'>) => void;
  onClose: () => void;
}

const ICON_OPTIONS = [
  '🍳', '🪥', '🍱', '🍲', '💧',
  '🏃', '📖', '🍵', '🧹', '🎒',
  '💬', '🛌', '🧘', '💻', '✨'
];

const STAT_OPTIONS: { key: RPGStatKey; name: string; icon: string }[] = [
  { key: 'SPI', name: '精力', icon: '⚡' },
  { key: 'INT', name: '智力', icon: '📚' },
  { key: 'STR', name: '力量', icon: '⚔️' },
  { key: 'DEX', name: '敏捷', icon: '🏹' },
  { key: 'CON', name: '体质', icon: '💪' },
  { key: 'CHA', name: '魅力', icon: '✨' },
];

export const CreateQuestModal: React.FC<CreateQuestModalProps> = ({
  initialCategory,
  onSave,
  onClose,
}) => {
  const [category, setCategory] = useState<QuestCategory>(
    initialCategory === 'easter_egg' ? 'main' : initialCategory
  );
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🍳');
  const [selectedStat, setSelectedStat] = useState<RPGStatKey>('SPI');
  const [isDailyRepeatable, setIsDailyRepeatable] = useState(category === 'main');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const statMeta = STAT_OPTIONS.find((s) => s.key === selectedStat) || STAT_OPTIONS[0];
    const statGain = category === 'main' ? { min: 3, max: 5 } : { min: 5, max: 10 };

    onSave({
      category,
      title: title.trim(),
      desc: desc.trim() || '保持热爱，奔赴下一次生活仪式',
      icon: selectedIcon,
      tag: `${statMeta.icon} ${statMeta.name}`,
      statKey: selectedStat,
      statGain,
      targetProgress: 1,
      isDailyRepeatable,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
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
          maxWidth: '336px',
          background: 'var(--nm-bg, #E9EEF5)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popInSpring 0.28s cubic-bezier(0.18, 0.9, 0.32, 1.2)',
          boxSizing: 'border-box',
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
                width: '30px',
                height: '30px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--nm-primary-light, #6BA8D6), var(--nm-primary, #5096C6))',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={16} strokeWidth={3} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--nm-text-main, #334257)' }}>
              收录新任务
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
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

        {/* 表单主体 */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '11px',
            boxSizing: 'border-box',
            maxHeight: '440px',
            overflowY: 'auto',
          }}
        >
          {/* 任务类型选择 */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)', marginBottom: '4px' }}>
              任务类别
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setCategory('main');
                  setIsDailyRepeatable(true);
                }}
                style={{
                  padding: '7px 0',
                  borderRadius: '10px',
                  border: 'none',
                  background: category === 'main' ? 'var(--nm-primary)' : 'var(--nm-bg)',
                  color: category === 'main' ? '#FFFFFF' : 'var(--nm-text-sub)',
                  boxShadow: category === 'main' ? 'var(--nm-convex-xs)' : 'var(--nm-inset-xs)',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🌟 主线日常任务
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('side');
                  setIsDailyRepeatable(false);
                }}
                style={{
                  padding: '7px 0',
                  borderRadius: '10px',
                  border: 'none',
                  background: category === 'side' ? 'var(--nm-primary)' : 'var(--nm-bg)',
                  color: category === 'side' ? '#FFFFFF' : 'var(--nm-text-sub)',
                  boxShadow: category === 'side' ? 'var(--nm-convex-xs)' : 'var(--nm-inset-xs)',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🗺️ 支线探索任务
              </button>
            </div>
          </div>

          {/* 六维维度联动选择 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                培养六维维度
              </label>
              <span style={{ fontSize: '9.5px', color: '#10B981', fontWeight: 800 }}>
                {category === 'main' ? '打卡随机 +3 ~ +5' : '打卡随机 +5 ~ +10'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {STAT_OPTIONS.map((stat) => {
                const isSelected = selectedStat === stat.key;
                return (
                  <button
                    key={stat.key}
                    type="button"
                    onClick={() => setSelectedStat(stat.key)}
                    style={{
                      padding: '6px 4px',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid var(--nm-primary)' : '1px solid rgba(166,180,200,0.3)',
                      background: isSelected ? 'var(--nm-bg-lighter)' : 'var(--nm-bg)',
                      color: isSelected ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: isSelected ? 'var(--nm-inset-xs)' : 'none',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <span>{stat.icon}</span>
                    <span>{stat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 图标选择 (背包风格拟物图标库) */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)', marginBottom: '4px' }}>
              专属背包徽章图标
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                padding: '6px',
                borderRadius: '12px',
                background: 'rgba(166, 180, 200, 0.15)',
              }}
            >
              {ICON_OPTIONS.map((ico) => {
                const isSelected = selectedIcon === ico;
                return (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => setSelectedIcon(ico)}
                    style={{
                      height: '36px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--nm-primary, #5096C6)' : '1px solid rgba(255,255,255,0.7)',
                      background: isSelected ? 'var(--nm-bg-lighter, #F2F6FB)' : 'var(--nm-bg, #E9EEF5)',
                      boxShadow: isSelected ? 'var(--nm-inset-xs)' : 'var(--nm-convex-xs)',
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.12s ease',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    {ico}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 任务标题 */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)', marginBottom: '4px' }}>
              任务名称
            </label>
            <input
              type="text"
              required
              maxLength={15}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：背诵20个单词 / 慢跑两公里"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid rgba(166, 180, 200, 0.4)',
                background: '#FFFFFF',
                fontSize: '12px',
                color: 'var(--nm-text-main)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* 任务描述 */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main)', marginBottom: '4px' }}>
              情境激励语 (选填)
            </label>
            <input
              type="text"
              maxLength={30}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="如：积跬步以致千里，持续进化"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1px solid rgba(166, 180, 200, 0.4)',
                background: '#FFFFFF',
                fontSize: '11px',
                color: 'var(--nm-text-main)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* 每日循环重置勾选 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              id="dailyRepeat"
              checked={isDailyRepeatable}
              onChange={(e) => setIsDailyRepeatable(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="dailyRepeat" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nm-text-sub)', cursor: 'pointer' }}>
              每天 00:00 自动重置为待完成（循环日常）
            </label>
          </div>

          {/* 提交按钮 */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--nm-bg)',
                color: 'var(--nm-text-sub)',
                fontSize: '12px',
                fontWeight: 800,
                boxShadow: 'var(--nm-convex-xs)',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                flex: 1.6,
                padding: '9px 0',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--nm-primary-light), var(--nm-primary))',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 900,
                boxShadow: 'var(--nm-convex-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={13} />
              <span>确认收录手账</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
