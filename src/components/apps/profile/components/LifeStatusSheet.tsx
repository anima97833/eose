import React, { useState } from 'react';
import { X, Plus, Shield, Sparkles, Check, Trash2, BatteryCharging } from 'lucide-react';
import { LifeStatus } from '../../../../core/rpg/types';

interface LifeStatusSheetProps {
  statuses: LifeStatus[];
  onToggleStatus: (id: string) => void;
  onAddStatus: (status: LifeStatus) => void;
  onDeleteStatus: (id: string) => void;
  onClose: () => void;
}

const PRESET_EMOJIS = ['🍔', '☕', '🌧️', '🔋', '📱', '🐈', '💤', '🍵', '🍕', '🎮', '🛌', '⚡'];

export const LifeStatusSheet: React.FC<LifeStatusSheetProps> = ({
  statuses,
  onToggleStatus,
  onAddStatus,
  onDeleteStatus,
  onClose,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'active' | 'debuff' | 'buff'>('all');

  // 自定义状态表单
  const [newIcon, setNewIcon] = useState('💤');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'buff' | 'debuff' | 'protect'>('debuff');
  const [newEffect, setNewEffect] = useState('');
  const [newAdvice, setNewAdvice] = useState('');

  const activeCount = statuses.filter((s) => s.active).length;
  const isEnergyZeroActive = statuses.find((s) => s.id === 'status_energy_zero')?.active || false;

  const handleCreateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddStatus({
      id: `status_custom_${Date.now()}`,
      name: newName.trim(),
      icon: newIcon,
      type: newType,
      effectText: newEffect.trim() || '身心处于该状态中',
      systemAdvice: newAdvice.trim() || '建议顺应状态，适当放松减负',
      active: true,
      isCustom: true,
    });

    setNewName('');
    setNewEffect('');
    setNewAdvice('');
    setShowAddModal(false);
  };

  const displayedStatuses = statuses.filter((s) => {
    if (filterType === 'active') return s.active;
    if (filterType === 'debuff') return s.type === 'debuff';
    if (filterType === 'buff') return s.type === 'buff';
    return true;
  });

  const getTypeBadge = (type: 'buff' | 'debuff' | 'protect') => {
    switch (type) {
      case 'buff':
        return { label: 'Buff 提振', bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'debuff':
        return { label: 'Debuff 减负', bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' };
      case 'protect':
        return { label: '结界 防护', bg: '#F3E8FF', text: '#7E22CE', border: '#D8B4FE' };
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'rgba(26, 20, 22, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxHeight: '88%',
          background: '#FFFDF9',
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          borderTop: '2px solid #502428',
          borderLeft: '2px solid #502428',
          borderRight: '2px solid #502428',
          boxShadow: '0 -8px 30px rgba(80, 36, 40, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 顶部标题栏：干净利落 */}
        <div
          style={{
            padding: '14px 18px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1.5px solid rgba(80, 36, 40, 0.1)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#502428' }}>
              身心状态
            </span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '10px',
                background: activeCount > 0 ? '#FEF3C7' : '#F3F4F6',
                color: activeCount > 0 ? '#B45309' : '#6B7280',
                border: `1px solid ${activeCount > 0 ? '#FCD34D' : '#E5E7EB'}`,
              }}
            >
              {activeCount > 0 ? `生效中 ${activeCount} 项` : '平稳正常'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #502428',
                borderRadius: '10px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#502428',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                boxShadow: '0 2px 0 #502428',
              }}
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>新增状态</span>
            </button>
            <button
              onClick={onClose}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(80, 36, 40, 0.08)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#502428',
              }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* 顶部一键快捷减负大按钮 */}
        <div style={{ padding: '10px 16px 4px', flexShrink: 0 }}>
          <button
            onClick={() => onToggleStatus('status_energy_zero')}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '14px',
              border: '2px solid #502428',
              background: isEnergyZeroActive
                ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
                : 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              color: isEnergyZeroActive ? '#FFFFFF' : '#9A3412',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 3px 0 #502428',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{isEnergyZeroActive ? '🛡️' : '🔋'}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 900 }}>
                  {isEnergyZeroActive ? '合法摆烂防护盾生效中' : '一键开启「精力见底」保护结界'}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.85, fontWeight: 700 }}>
                  {isEnergyZeroActive ? '任务已自动降级为“活着并呼吸”' : '屏蔽所有催促，拒绝内耗'}
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '8px',
                background: isEnergyZeroActive ? 'rgba(255,255,255,0.25)' : '#EA580C',
                color: '#FFFFFF',
              }}
            >
              {isEnergyZeroActive ? '解除' : '开启'}
            </span>
          </button>
        </div>

        {/* 分类快捷标签 */}
        <div style={{ display: 'flex', gap: '6px', padding: '8px 16px 4px', flexShrink: 0 }}>
          {[
            { key: 'all', label: '全部状态' },
            { key: 'active', label: `已开启 (${activeCount})` },
            { key: 'debuff', label: '减负 Debuff' },
            { key: 'buff', label: '超频 Buff' },
          ].map((tab) => {
            const isSelected = filterType === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key as any)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #502428' : '1px solid rgba(80, 36, 40, 0.2)',
                  background: isSelected ? '#502428' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#6B4A34',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 状态卡片清单 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '6px 16px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {displayedStatuses.map((item) => {
            const badge = getTypeBadge(item.type);
            return (
              <div
                key={item.id}
                style={{
                  background: item.active ? '#FFFBF5' : '#FFFFFF',
                  border: item.active ? '2px solid #502428' : '1.5px solid rgba(80, 36, 40, 0.2)',
                  borderRadius: '14px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: item.active ? '0 3px 0 #502428' : '0 1px 3px rgba(80,36,40,0.06)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* 左侧 Emoji 图标 */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: item.active ? badge.bg : 'rgba(80, 36, 40, 0.05)',
                    border: `1.5px solid ${item.active ? badge.border : 'rgba(80,36,40,0.15)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>

                {/* 中间信息：极简一句话，拒绝大段提示 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#502428' }}>
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* 精炼效果短语：单行超简 */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6B4A34',
                      fontWeight: 700,
                      marginTop: '3px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.effectText}{item.systemAdvice ? ` · ${item.systemAdvice}` : ''}
                  </div>
                </div>

                {/* 右侧明了操作按钮 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #502428',
                      background: item.active ? '#10B981' : '#FFFFFF',
                      color: item.active ? '#FFFFFF' : '#502428',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: item.active ? '0 2px 0 #047857' : '0 2px 0 #502428',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {item.active && <Check size={12} strokeWidth={3} />}
                    <span>{item.active ? '生效中' : '开启'}</span>
                  </button>

                  {item.isCustom && (
                    <button
                      onClick={() => onDeleteStatus(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9CA3AF',
                        padding: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 新增状态对话框 */}
        {showAddModal && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 90,
              background: 'rgba(26, 20, 22, 0.65)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '300px',
                background: '#FFFDF9',
                borderRadius: '18px',
                border: '2px solid #502428',
                padding: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#502428' }}>自定义新状态</span>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#502428' }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Emoji 快速选择 */}
                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '3px' }}>
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewIcon(emoji)}
                      style={{
                        fontSize: '18px',
                        padding: '3px 6px',
                        borderRadius: '8px',
                        background: newIcon === emoji ? '#FEF3C7' : '#F3F4F6',
                        border: newIcon === emoji ? '1.5px solid #D97706' : '1px solid #E5E7EB',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* 状态名称 */}
                <div>
                  <input
                    type="text"
                    placeholder="状态名称（如：周一应激）"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={10}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1.5px solid #502428',
                      fontSize: '12px',
                      fontWeight: 800,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 类型药丸选择 */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { key: 'debuff', label: '减负 Debuff' },
                    { key: 'buff', label: '提振 Buff' },
                    { key: 'protect', label: '保护结界' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setNewType(t.key as any)}
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        borderRadius: '8px',
                        border: newType === t.key ? '1.5px solid #502428' : '1px solid #D1D5DB',
                        background: newType === t.key ? '#502428' : '#FFFFFF',
                        color: newType === t.key ? '#FFFFFF' : '#4B5563',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* 效果短语 */}
                <div>
                  <input
                    type="text"
                    placeholder="一句话效果（如：工作欲望归零）"
                    value={newEffect}
                    onChange={(e) => setNewEffect(e.target.value)}
                    maxLength={25}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1.5px solid rgba(80,36,40,0.3)',
                      fontSize: '11px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 建议短语 */}
                <div>
                  <input
                    type="text"
                    placeholder="一句话建议（如：吃杯奶茶回血）"
                    value={newAdvice}
                    onChange={(e) => setNewAdvice(e.target.value)}
                    maxLength={25}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1.5px solid rgba(80,36,40,0.3)',
                      fontSize: '11px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  style={{
                    padding: '8px 0',
                    borderRadius: '10px',
                    background: '#502428',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '12px',
                    cursor: newName.trim() ? 'pointer' : 'default',
                    opacity: newName.trim() ? 1 : 0.5,
                    boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
                    marginTop: '4px',
                  }}
                >
                  保存并加入状态库
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
