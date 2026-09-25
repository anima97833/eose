import React, { useState } from 'react';
import { X, Check, Lock, Sparkles, Trash2 } from 'lucide-react';
import {
  RPGAchievement,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_MAP,
  AchievementCategoryKey,
} from '../../../../core/rpg/achievementTypes';

interface ShowcasePickerModalProps {
  slotIndex: number;
  currentBadgeId: string | null;
  achievements: RPGAchievement[];
  showcaseSlots: (string | null)[];
  onSelectBadge: (badgeId: string) => void;
  onRemoveBadge: () => void;
  onClose: () => void;
}

export const ShowcasePickerModal: React.FC<ShowcasePickerModalProps> = ({
  slotIndex,
  currentBadgeId,
  achievements,
  showcaseSlots,
  onSelectBadge,
  onRemoveBadge,
  onClose,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'UNLOCKED' | AchievementCategoryKey>('UNLOCKED');

  const filteredAchievements = achievements.filter((ach) => {
    if (filterType === 'UNLOCKED') return ach.unlocked;
    if (filterType === 'ALL') return true;
    return ach.category === filterType;
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(20, 25, 20, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          maxHeight: '82vh',
          background: '#FAF5EA',
          borderRadius: '24px',
          border: '3px solid #6E462A',
          boxShadow: '0 12px 28px rgba(45, 25, 10, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '14px 16px 10px',
            borderBottom: '2px solid #E4D8C5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F5ECE0',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 900,
                color: '#422817',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              }}
            >
              配置第 {slotIndex + 1} 展位荣誉徽章
            </div>
            <div style={{ fontSize: '11px', color: '#7E634E', marginTop: '2px' }}>
              自选展示在个人主页顶排的名片徽章
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#E8DCB8',
              border: '1.5px solid #6E462A',
              color: '#6E462A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* 筛选标签栏 */}
        <div
          className="no-scrollbar"
          style={{
            padding: '8px 12px',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            background: '#F0E4D2',
            borderBottom: '1.5px solid #DFCDB5',
            scrollbarWidth: 'none',
          }}
        >
          <button
            onClick={() => setFilterType('UNLOCKED')}
            style={{
              padding: '3px 8px',
              borderRadius: '10px',
              border: '1.5px solid #059669',
              background: filterType === 'UNLOCKED' ? '#059669' : '#ECFDF5',
              color: filterType === 'UNLOCKED' ? '#FFF' : '#047857',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            已达成
          </button>
          <button
            onClick={() => setFilterType('ALL')}
            style={{
              padding: '3px 8px',
              borderRadius: '10px',
              border: '1.5px solid #6E462A',
              background: filterType === 'ALL' ? '#6E462A' : '#FAF4E4',
              color: filterType === 'ALL' ? '#FFF' : '#6E462A',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            全部
          </button>
          {ACHIEVEMENT_CATEGORIES.map((cat) => {
            const isSelected = filterType === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setFilterType(cat.key)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '10px',
                  border: `1.5px solid ${cat.color}`,
                  background: isSelected ? cat.color : cat.bg,
                  color: isSelected ? '#FFF' : cat.color,
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {cat.icon} {cat.label}
              </button>
            );
          })}
        </div>

        {/* 成就选择列表 */}
        <div
          className="no-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {filteredAchievements.length === 0 ? (
            <div
              style={{
                padding: '30px 10px',
                textAlign: 'center',
                color: '#8A7057',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              暂无可佩戴的成就徽章
            </div>
          ) : (
            filteredAchievements.map((ach) => {
              const isEquippedHere = currentBadgeId === ach.id;
              const equippedSlotIdx = showcaseSlots.indexOf(ach.id);
              const isEquippedElsewhere = equippedSlotIdx !== -1 && equippedSlotIdx !== slotIndex;
              const catMeta = ach.category && (ach.category in ACHIEVEMENT_CATEGORY_MAP)
                ? ACHIEVEMENT_CATEGORY_MAP[ach.category as AchievementCategoryKey]
                : null;
              const emoji = ach.badgeEmoji || (ach.iconType === 'atk' ? '⚔️' : ach.iconType === 'hp' ? '💖' : ach.iconType === 'heal' ? '🌿' : ach.iconType === 'book' ? '📖' : '✨');

              return (
                <div
                  key={ach.id}
                  onClick={() => onSelectBadge(ach.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '14px',
                    background: isEquippedHere
                      ? '#EAF7EE'
                      : ach.unlocked
                      ? '#FFFFFF'
                      : '#F2ECE1',
                    border: isEquippedHere
                      ? '2px solid #10B981'
                      : '1.5px solid #D8CABB',
                    boxShadow: '0 2px 4px rgba(60, 40, 20, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10B981')}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isEquippedHere
                      ? '#10B981'
                      : '#D8CABB';
                  }}
                >
                  {/* 左侧图腾与基本信息 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: ach.unlocked
                          ? 'radial-gradient(circle, #FFFFFF 40%, #D8EEF8 100%)'
                          : 'radial-gradient(circle at 35% 30%, #76C8D8 10%, #3B8DA1 60%, #266978 100%)',
                        border: ach.unlocked ? '2px solid #94BFD1' : '2px solid #205966',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: ach.unlocked ? '18px' : '14px',
                        flexShrink: 0,
                      }}
                    >
                      {ach.unlocked ? emoji : <Lock size={14} color="#D1F1F8" />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#422817' }}>
                          {ach.title}
                        </span>
                        {catMeta && (
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              color: catMeta.color,
                              background: catMeta.bg,
                              padding: '1px 5px',
                              borderRadius: '6px',
                            }}
                          >
                            {catMeta.label}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', color: '#7E634E', marginTop: '2px' }}>
                        {ach.statLabel} {!ach.unlocked && '(未达成)'}
                      </div>
                    </div>
                  </div>

                  {/* 右侧佩戴操作标识 */}
                  <div>
                    {isEquippedHere ? (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 900,
                          color: '#059669',
                          background: '#D1FAE5',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <Check size={12} strokeWidth={3} /> 当前展位
                      </span>
                    ) : isEquippedElsewhere ? (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#92400E',
                          background: '#FEF3C7',
                          padding: '3px 6px',
                          borderRadius: '8px',
                        }}
                      >
                        展位 {equippedSlotIdx + 1}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBadge(ach.id);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: '#059669',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        佩戴
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部卸下按钮 */}
        {currentBadgeId && (
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1.5px solid #E4D8C5',
              background: '#F5ECE0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '11px', color: '#7E634E' }}>
              当前装配了【{achievements.find((a) => a.id === currentBadgeId)?.title || '徽章'}】
            </span>
            <button
              onClick={onRemoveBadge}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '8px',
                background: '#FEE2E2',
                color: '#DC2626',
                border: '1.5px solid #EF4444',
                fontSize: '11px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={12} /> 卸下展位
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
