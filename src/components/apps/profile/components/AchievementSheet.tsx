import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Lock, Check, Sparkles, Coins, Gift, ChevronRight, Search } from 'lucide-react';
import {
  RPGAchievement,
  DEFAULT_ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_MAP,
  AchievementCategoryKey,
} from '../../../../core/rpg/achievementTypes';
import {
  loadAchievements,
  saveAchievements,
  loadShowcaseBadges,
  saveShowcaseBadges,
  SHOWCASE_SLOTS_COUNT,
} from '../../../../core/rpg/achievementStorage';
import { ShowcasePickerModal } from './ShowcasePickerModal';

interface AchievementSheetProps {
  onClose: () => void;
  onRewardCoins?: (coins: number) => void;
}

export const AchievementSheet: React.FC<AchievementSheetProps> = ({
  onClose,
  onRewardCoins,
}) => {
  const [achievements, setAchievements] = useState<RPGAchievement[]>(loadAchievements);
  const [showcaseSlots, setShowcaseSlots] = useState<(string | null)[]>(loadShowcaseBadges);
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNLOCKED' | 'DERIVED' | AchievementCategoryKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAch, setSelectedAch] = useState<RPGAchievement | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);


  // 监听外部成就解锁及展位变动事件实时刷新
  useEffect(() => {
    const handleUnlocked = () => {
      setAchievements(loadAchievements());
    };
    const handleShowcaseChange = () => {
      setShowcaseSlots(loadShowcaseBadges());
    };
    window.addEventListener('rpg_achievement_unlocked', handleUnlocked);
    window.addEventListener('cloudfly_showcase_badges_changed', handleShowcaseChange);
    return () => {
      window.removeEventListener('rpg_achievement_unlocked', handleUnlocked);
      window.removeEventListener('cloudfly_showcase_badges_changed', handleShowcaseChange);
    };
  }, []);

  // 新增表单状态
  const [newTitle, setNewTitle] = useState('');
  const [newStat, setNewStat] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<AchievementCategoryKey>('firmware');
  const [isDerivedNew, setIsDerivedNew] = useState(false);
  const [prereqTitle, setPrereqTitle] = useState('');

  // 滚动容器引用与鼠标拖拽滑动状态
  const orbsScrollRef = useRef<HTMLDivElement | null>(null);
  const plaquesScrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingPlaquesRef = useRef(false);
  const isDraggingOrbsRef = useRef(false);

  // 绑定鼠标拖拽与滚轮横向滑动
  const bindDragScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    isDraggingFlagRef: React.MutableRefObject<boolean>
  ) => {
    return {
      ref,
      onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;
        isDraggingFlagRef.current = false;
        const startX = e.pageX - el.offsetLeft;
        const startScrollLeft = el.scrollLeft;
        let hasMoved = false;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const x = moveEvent.pageX - el.offsetLeft;
          const walk = (x - startX) * 1.5;
          if (Math.abs(x - startX) > 4) {
            hasMoved = true;
            isDraggingFlagRef.current = true;
          }
          el.scrollLeft = startScrollLeft - walk;
        };

        const handleMouseUp = () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          setTimeout(() => {
            isDraggingFlagRef.current = false;
          }, 50);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      },
      onWheel: (e: React.WheelEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) && e.deltaY !== 0) {
          el.scrollLeft += e.deltaY;
        }
      },
    };
  };

  const orbsDragHandlers = bindDragScroll(orbsScrollRef, isDraggingOrbsRef);
  const plaquesDragHandlers = bindDragScroll(plaquesScrollRef, isDraggingPlaquesRef);

  // 提示信息 (<= 5 字)
  const showToast = (msg: string) => {
    setToastMsg(msg.slice(0, 5));
    setTimeout(() => setToastMsg(null), 1800);
  };

  // 持久化保存
  const updateAchievements = (nextList: RPGAchievement[]) => {
    setAchievements(nextList);
    saveAchievements(nextList);
  };

  // 删除成就
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = achievements.filter((a) => a.id !== id);
    updateAchievements(updated);
    if (selectedAch?.id === id) {
      setSelectedAch(null);
    }
    showToast('成就已删');
  };

  // 新增成就 (严格禁止与等级挂钩，必须由系统判定达成)
  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const newId = `ach_${Date.now()}`;
    const newAch: RPGAchievement = {
      id: newId,
      title: newTitle.trim().slice(0, 5), // <= 5 字
      category: newCategory,
      statLabel: newStat.trim().slice(0, 6) || '专属成就',
      desc: newDesc.trim() || '地球 Online 专属自拟成就',
      iconType: isDerivedNew ? 'crit' : 'hp',
      unlocked: false, // 铁律：只能系统判定达成，不可手动判定
      claimed: false,
      isDerived: isDerivedNew,
      prerequisiteTitle: isDerivedNew ? prereqTitle.trim().slice(0, 5) || '初阶前置' : undefined,
    };
    const nextList = [...achievements, newAch];
    updateAchievements(nextList);
    showToast('添加成功');
    setNewTitle('');
    setNewStat('');
    setNewDesc('');
    setIsDerivedNew(false);
    setPrereqTitle('');
    setIsAdding(false);
  };

  // 筛选成就
  const filteredList = achievements.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchText = `${item.title} ${item.desc} ${item.statLabel || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    if (activeFilter === 'UNLOCKED') return item.unlocked;
    if (activeFilter === 'DERIVED') return item.isDerived;
    if (activeFilter !== 'ALL') return item.category === activeFilter;
    return true;
  });


  // 统计成就总数（铁律：严禁与等级挂钩，纯系统判定达成数）
  const totalUnlockedCount = achievements.filter((a) => a.unlocked).length;

  // 渲染参考图同款的徽章图案
  const renderCrestIcon = (type: RPGAchievement['iconType'], isDerived?: boolean) => {
    if (isDerived) {
      return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#F1E7D0',
              border: '2px solid #9E7D59',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={22} color="#7D5E3C" />
          </div>
        </div>
      );
    }

    switch (type) {
      case 'atk':
        // 参考图1：粉色翼型图腾 / 战意徽记
        return (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 6L28 14C33 11 38 12 40 18C41 23 37 28 32 30C30 33 26 38 24 42C22 38 18 33 16 30C11 28 7 23 8 18C10 12 15 11 20 14L24 6Z"
              fill="#F49EA6"
              stroke="#8D4952"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="22" r="5" fill="#FFEAEB" stroke="#8D4952" strokeWidth="2" />
          </svg>
        );
      case 'hp':
        // 参考图2：粉心小猫徽记
        return (
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#FFE8EC',
              border: '2.5px solid #8D4952',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            💖
          </div>
        );
      case 'heal':
        // 参考图3：治愈红心与加号徽记
        return (
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#FFE8EC',
              border: '2.5px solid #8D4952',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              fontSize: '22px',
            }}
          >
            🐾
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#FFD166',
                border: '1.5px solid #8D4952',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 900,
                color: '#6B3800',
              }}
            >
              +
            </span>
          </div>
        );
      default:
        return (
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#FFF3D6',
              border: '2.5px solid #8D4952',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            ⭐
          </div>
        );
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 85,
        background: 'rgba(38, 48, 38, 0.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'backdropFadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      {/* 浮动 Toast 提示 (<= 5 字) */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 120,
            background: 'rgba(54, 78, 52, 0.95)',
            color: '#FFFFFF',
            padding: '7px 18px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.5px',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 主面板容器（对齐参考图：绿色草地背景 + 挂绳木质铭牌系统） */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '86%',
          background: '#DFEBD2', // 参考图同款清新草地绿底色
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          border: '3px solid #3E5A44',
          borderBottom: 'none',
          boxShadow: '0 -10px 35px rgba(35, 52, 38, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideUpSpring 0.35s cubic-bezier(0.18, 0.9, 0.32, 1.25)',
          overflow: 'hidden',
        }}
      >
        {/* ================= 1. 顶部标题栏 ================= */}
        <div
          style={{
            padding: '12px 16px',
            background: '#568761',
            borderTopLeftRadius: '23px',
            borderTopRightRadius: '23px',
            borderBottom: '2.5px solid #3E5A44',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 900,
                color: '#FFFFFF',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                textShadow: '0 1.5px 0 #324F37',
              }}
            >
              成就馆
            </span>

            <button
              onClick={() => setIsAdding(!isAdding)}
              style={{
                padding: '3px 10px',
                borderRadius: '10px',
                border: '1.5px solid #3E5A44',
                background: isAdding ? '#F87171' : '#FDF8ED',
                color: isAdding ? '#FFFFFF' : '#3E5A44',
                fontWeight: 900,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                boxShadow: '0 1.5px 0 #3E5A44',
              }}
            >
              {isAdding ? <X size={12} /> : <Plus size={12} />}
              <span>{isAdding ? '取消' : '添成就'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '2px solid #3E5A44',
              background: '#FDF8ED',
              color: '#3E5A44',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #3E5A44',
              fontWeight: 900,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ================= 2. 顶排气泡神座序列（对齐参考图顶部 AUTO 与气泡/玻璃锁序列） ================= */}
        <div
          {...orbsDragHandlers}
          className="no-scrollbar"
          style={{
            padding: '10px 14px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: 'grab',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* 左侧第一个：复古圆钮 (参考图 AUTO OFF 样式，用于切换全部/已达成/衍生) */}
          <button
            onClick={() => {
              if (activeFilter === 'ALL') setActiveFilter('UNLOCKED');
              else if (activeFilter === 'UNLOCKED') setActiveFilter('DERIVED');
              else setActiveFilter('ALL');
            }}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#D1C6B4',
              border: '2px solid #877863',
              boxShadow: '0 2px 0 #6C604D',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '9px', fontWeight: 900, color: '#544734', lineHeight: 1 }}>
              {activeFilter === 'ALL' ? '全部' : activeFilter === 'UNLOCKED' ? '达成' : '衍生'}
            </span>
            <Lock size={10} color="#70604A" style={{ marginTop: '2px' }} />
          </button>

          {/* 自由荣誉展柜：自选固定 6 个展示席位 (可自由装配、替换、卸下) */}
          {Array.from({ length: SHOWCASE_SLOTS_COUNT }).map((_, slotIdx) => {
            const equippedId = showcaseSlots[slotIdx];
            const ach = equippedId ? achievements.find((a) => a.id === equippedId) : null;

            if (ach) {
              const isUnlocked = ach.unlocked;
              const emoji = ach.badgeEmoji || (ach.iconType === 'atk' ? '⚔️' : ach.iconType === 'hp' ? '💖' : ach.iconType === 'heal' ? '🌿' : ach.iconType === 'book' ? '📖' : ach.iconType === 'star' ? '⭐' : '✨');

              if (isUnlocked) {
                return (
                  <div
                    key={slotIdx}
                    onClick={() => {
                      if (!isDraggingOrbsRef.current) setSelectedAch(ach);
                    }}
                    title={`荣誉展位 ${slotIdx + 1}：${ach.title} (已达成 - 点击查看/更换)`}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '16px',
                      background: 'radial-gradient(circle, #FFFFFF 40%, #D8EEF8 100%)',
                      border: '2.5px solid #94BFD1',
                      boxShadow: '0 2px 5px rgba(100, 160, 190, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      position: 'relative',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {emoji}
                  </div>
                );
              }

              // 未解锁但已被设为展示目标
              return (
                <div
                  key={slotIdx}
                  onClick={() => {
                    if (!isDraggingOrbsRef.current) setSelectedAch(ach);
                  }}
                  title={`荣誉展位 ${slotIdx + 1}：${ach.title} (待解锁 - 点击查看)`}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 30%, #76C8D8 10%, #3B8DA1 60%, #266978 100%)',
                    border: '2px solid #205966',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    opacity: 0.88,
                    position: 'relative',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <div
                    style={{
                      background: 'rgba(20, 52, 60, 0.55)',
                      padding: '5px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Lock size={15} color="#D1F1F8" strokeWidth={2.5} />
                  </div>
                </div>
              );
            }

            // 虚位以待的空展位 (轻拟物微凹槽 + 虚线/加号)
            return (
              <div
                key={slotIdx}
                onClick={() => {
                  if (!isDraggingOrbsRef.current) setPickerSlotIndex(slotIdx);
                }}
                title={`第 ${slotIdx + 1} 荣誉展位 (虚位以待，点击自选佩戴)`}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '16px',
                  background: 'rgba(110, 70, 42, 0.06)',
                  border: '2px dashed #9E8C76',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  color: '#7D6A53',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.borderColor = '#059669';
                  e.currentTarget.style.background = 'rgba(5, 150, 105, 0.08)';
                  e.currentTarget.style.color = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = '#9E8C76';
                  e.currentTarget.style.background = 'rgba(110, 70, 42, 0.06)';
                  e.currentTarget.style.color = '#7D6A53';
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span style={{ fontSize: '9px', fontWeight: 900, marginTop: '1px' }}>
                  展位{slotIdx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* ================= 新增自定义成就面板 ================= */}
        {isAdding && (
          <div
            style={{
              margin: '6px 14px 8px',
              padding: '12px',
              background: '#FDF8ED',
              borderRadius: '16px',
              border: '2.5px solid #3E5A44',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="成就名(<=5字)"
                maxLength={5}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #3E5A44',
                  fontSize: '12px',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
              <input
                type="text"
                placeholder="条件(如:专注90分)"
                maxLength={6}
                value={newStat}
                onChange={(e) => setNewStat(e.target.value)}
                style={{
                  width: '110px',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: '1.5px solid #3E5A44',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder="简要达成说明"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #3E5A44',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, color: '#3E5A44', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isDerivedNew}
                  onChange={(e) => setIsDerivedNew(e.target.checked)}
                />
                衍生成就
              </label>
            </div>

            {isDerivedNew && (
              <input
                type="text"
                placeholder="前置成就名(<=5字)"
                maxLength={5}
                value={prereqTitle}
                onChange={(e) => setPrereqTitle(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #3E5A44',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '10px',
                  background: newTitle.trim() ? '#568761' : '#D1D5DB',
                  color: '#FFFFFF',
                  border: '2px solid #3E5A44',
                  fontWeight: 900,
                  fontSize: '13px',
                  cursor: newTitle.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: '0 2px 0 #3E5A44',
                }}
              >
                保存成就
              </button>
              <button
                onClick={() => setIsAdding(false)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  background: '#E5E7EB',
                  color: '#4B5563',
                  border: '2px solid #3E5A44',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 #3E5A44',
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* ================= 3. 晾绳与木质铭牌标头（对齐参考图中部的 79.2 悬挂标条） ================= */}
        <div
          style={{
            position: 'relative',
            padding: '12px 0 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 贯穿左右的真实挂绳线条 */}
          <div
            style={{
              position: 'absolute',
              top: '21px',
              left: 0,
              right: 0,
              height: '3px',
              background: '#5B3B24',
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              zIndex: 1,
            }}
          />

          {/* 居中悬挂木胶带标牌 (对齐参考图 [ 🛡️ 79.2 ] 样式) */}
          <div
            style={{
              position: 'relative',
              zIndex: 5,
              background: '#FDF3DF',
              border: '2px solid #785032',
              borderRadius: '8px',
              padding: '2px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(60, 35, 15, 0.2)',
            }}
          >
            {/* 左侧徽纹 */}
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#FFDCE1',
                border: '1.5px solid #8D4952',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
              }}
            >
              🛡️
            </div>
            {/* 核心数值 */}
            <span
              style={{
                fontSize: '14px',
                fontWeight: 900,
                color: '#422817',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                letterSpacing: '0.5px',
              }}
            >
              达成 {totalUnlockedCount}/{achievements.length}
            </span>
          </div>
        </div>

        {/* ================= 搜索框与当前筛选统计 (略微上移，与下方分类保持舒适间距) ================= */}
        <div
          style={{
            padding: '0 14px 8px',
            marginTop: '-2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: 1,
              maxWidth: '240px',
            }}
          >
            <Search
              size={12}
              color="#8A684E"
              style={{
                position: 'absolute',
                left: '9px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索415个成就或触发条件..."
              style={{
                width: '100%',
                padding: '4px 24px 4px 26px',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '12px',
                border: '1.5px solid #8A684E',
                background: '#FAF4E4',
                color: '#422817',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#8A684E',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#7D5E3C',
              flexShrink: 0,
            }}
          >
            显示 {filteredList.length} 项
          </span>
        </div>

        {/* ================= 地球Online六大分类导航栏 (<= 5 字) ================= */}
        <div
          className="no-scrollbar"
          style={{
            padding: '6px 14px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            onClick={() => setActiveFilter('ALL')}
            style={{
              padding: '5px 11px',
              borderRadius: '12px',
              border: '1.5px solid #754F35',
              background: activeFilter === 'ALL' ? '#754F35' : '#FAF4E4',
              color: activeFilter === 'ALL' ? '#FFF' : '#6B4A34',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: activeFilter === 'ALL' ? 'inset 0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            全部 (415)
          </button>
          <button
            onClick={() => setActiveFilter('UNLOCKED')}
            style={{
              padding: '5px 11px',
              borderRadius: '12px',
              border: '1.5px solid #059669',
              background: activeFilter === 'UNLOCKED' ? '#059669' : '#ECFDF5',
              color: activeFilter === 'UNLOCKED' ? '#FFF' : '#047857',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: activeFilter === 'UNLOCKED' ? 'inset 0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            已达成
          </button>
          {ACHIEVEMENT_CATEGORIES.map((cat) => {
            const isSelected = activeFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '12px',
                  border: `1.5px solid ${cat.color}`,
                  background: isSelected ? cat.color : cat.bg,
                  color: isSelected ? '#FFFFFF' : cat.color,
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: '1.2',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isSelected ? 'inset 0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= 4. 核心木质挂牌卡片序列（横向滑动，深度还原参考图卡片） ================= */}
        <div
          {...plaquesDragHandlers}
          className="no-scrollbar"
          style={{
            padding: '4px 14px 24px',
            overflowX: 'auto',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            scrollSnapType: 'x proximity',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: 'grab',
            WebkitOverflowScrolling: 'touch',
            minHeight: '230px',
          }}
        >
          {filteredList.length === 0 ? (
            <div
              style={{
                width: '100%',
                padding: '40px 16px',
                textAlign: 'center',
                color: '#8A684E',
                fontSize: '13px',
                fontWeight: 800,
              }}
            >
              未找到匹配成就，换个关键词试试~
            </div>
          ) : (
            filteredList.map((ach) => {
              const isDerived = !!ach.isDerived;
              const isUnlocked = ach.unlocked;
              const isClaimed = ach.claimed;
              const catMeta =
                ach.category && ach.category in ACHIEVEMENT_CATEGORY_MAP
                  ? ACHIEVEMENT_CATEGORY_MAP[ach.category as AchievementCategoryKey]
                  : null;

              return (
                <div
                  key={ach.id}
                  onClick={() => {
                    if (!isDraggingPlaquesRef.current) {
                      setSelectedAch(ach);
                    }
                  }}
                  style={{
                    width: '136px',
                    flexShrink: 0,
                    scrollSnapAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  {/* 顶部挂绳木环 / 夹扣 */}
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: '2.5px solid #6E462A',
                      background: '#DFEBD2',
                      marginBottom: '-4px',
                      zIndex: 4,
                    }}
                  />

                  {/* 木质标牌卡身 */}
                  <div
                    style={{
                      width: '100%',
                      background: isDerived
                        ? '#EBE3D0'
                        : isUnlocked
                        ? '#FAF4E4'
                        : '#F5ECE0',
                      borderRadius: '20px',
                      border: '2.5px solid #754F35',
                      boxShadow: '0 4px 0 #5E3E28, 0 6px 12px rgba(60, 40, 20, 0.18)',
                      padding: '8px 8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      position: 'relative',
                      opacity: isDerived ? 0.78 : 1,
                    }}
                  >
                    {/* 标牌顶部：分类小标 + 认证状态 */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0 2px',
                      }}
                    >
                      {catMeta ? (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            color: catMeta.color,
                            background: catMeta.bg,
                            padding: '1px 5px',
                            borderRadius: '6px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {catMeta.icon} {catMeta.label}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          color: isUnlocked ? '#059669' : '#94A3B8',
                        }}
                      >
                        {isUnlocked ? '✓已达成' : '🔒待触发'}
                      </span>
                    </div>

                    {/* 标牌中央：专属萌系图腾插画 */}
                    <div
                      style={{
                        height: '52px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '2px 0',
                      }}
                    >
                      {renderCrestIcon(ach.iconType, isDerived)}
                    </div>

                    {/* 标牌标题 */}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 900,
                        color: '#422817',
                        fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.25',
                        height: '30px',
                        textAlign: 'center',
                        maxWidth: '100%',
                        wordBreak: 'break-all',
                      }}
                      title={ach.title}
                    >
                      {ach.title}
                    </span>

                    {/* 标牌指标数值 */}
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#6E4931',
                      }}
                    >
                      {ach.statLabel}
                    </span>


                  {/* 标牌底部：系统判定状态条 (严禁手动判定，奖励待定) */}
                  <div
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      padding: '4px 6px',
                      borderRadius: '16px',
                      background: isUnlocked
                        ? '#059669'
                        : '#475569',
                      border: '1.5px solid #1E293B',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 0 #1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      pointerEvents: 'none',
                    }}
                  >
                    {isUnlocked ? (
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#FFFFFF' }}>
                        ★ 系统已认证
                      </span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Lock size={10} color="#CBD5E1" />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#CBD5E1' }}>
                          待系统达成
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }))}
        </div>

        {/* ================= 5. 成就详情与衍生说明弹窗 ================= */}
        {selectedAch && (
          <div
            onClick={() => setSelectedAch(null)}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 95,
              background: 'rgba(35, 48, 35, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '280px',
                background: '#FAF4E4',
                borderRadius: '22px',
                border: '3px solid #6E462A',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setSelectedAch(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#6E462A',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>

              {/* 中央图腾展示 */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#FFF3DF',
                  border: '2.5px solid #8D4952',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {renderCrestIcon(selectedAch.iconType, selectedAch.isDerived)}
              </div>

              {/* 成就标题与分类 */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <span style={{ fontSize: '20px' }}>{selectedAch.badgeEmoji || '✨'}</span>
                  <span style={{ fontSize: '17px', fontWeight: 900, color: '#422817' }}>
                    {selectedAch.title}
                  </span>
                </div>
                {selectedAch.category && (selectedAch.category in ACHIEVEMENT_CATEGORY_MAP) && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: ACHIEVEMENT_CATEGORY_MAP[selectedAch.category as AchievementCategoryKey].bg,
                      color: ACHIEVEMENT_CATEGORY_MAP[selectedAch.category as AchievementCategoryKey].color,
                      fontSize: '11px',
                      fontWeight: 800,
                      marginTop: '4px',
                    }}
                  >
                    <span>{ACHIEVEMENT_CATEGORY_MAP[selectedAch.category as AchievementCategoryKey].icon}</span>
                    <span>{ACHIEVEMENT_CATEGORY_MAP[selectedAch.category as AchievementCategoryKey].label}</span>
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#8D4952', fontWeight: 800, marginTop: '4px' }}>
                  {selectedAch.statLabel}
                </div>
                <div style={{ fontSize: '11px', color: '#6B4A34', marginTop: '4px', lineHeight: 1.4 }}>
                  {selectedAch.desc}
                </div>

                {/* 如果是未来衍生成就，显示前置要求 */}
                {selectedAch.isDerived && (
                  <div
                    style={{
                      marginTop: '8px',
                      background: '#F0E5CF',
                      border: '1px solid #9E7D59',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#6E462A',
                      fontWeight: 800,
                    }}
                  >
                    前置：需先达成【{selectedAch.prerequisiteTitle || '基础成就'}】
                  </div>
                )}
              </div>

              {/* 荣誉展柜佩戴快捷入口 */}
              <div style={{ width: '100%' }}>
                {showcaseSlots.includes(selectedAch.id) ? (
                  <button
                    onClick={() => {
                      const slotIdx = showcaseSlots.indexOf(selectedAch.id);
                      const updated = [...showcaseSlots];
                      updated[slotIdx] = null;
                      setShowcaseSlots(updated);
                      saveShowcaseBadges(updated);
                      setToastMsg(`已从荣誉展柜第 ${slotIdx + 1} 位卸下`);
                      setTimeout(() => setToastMsg(null), 2000);
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 0',
                      borderRadius: '12px',
                      background: '#FEF3C7',
                      color: '#92400E',
                      border: '1.5px solid #D97706',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    ★ 已在荣誉展柜第 {showcaseSlots.indexOf(selectedAch.id) + 1} 位 (点击卸下)
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const firstEmptyIdx = showcaseSlots.findIndex((s) => s === null);
                      if (firstEmptyIdx !== -1) {
                        const updated = [...showcaseSlots];
                        updated[firstEmptyIdx] = selectedAch.id;
                        setShowcaseSlots(updated);
                        saveShowcaseBadges(updated);
                        setToastMsg(`已佩戴至荣誉展柜第 ${firstEmptyIdx + 1} 位！`);
                        setTimeout(() => setToastMsg(null), 2500);
                      } else {
                        setPickerSlotIndex(0);
                        setToastMsg('展柜 6 个展位已满，请选择替换槽位');
                        setTimeout(() => setToastMsg(null), 2500);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 0',
                      borderRadius: '12px',
                      background: '#E0F2FE',
                      color: '#0369A1',
                      border: '1.5px solid #0284C7',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    📌 佩戴到荣誉展柜 (自选展示)
                  </button>
                )}
              </div>

              {/* 系统判定认证状态 (严格禁止手动篡改，奖励待定) */}
              <div
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '14px',
                  background: selectedAch.unlocked ? '#ECFDF5' : '#F1F5F9',
                  border: selectedAch.unlocked ? '2px solid #059669' : '1.5px solid #94A3B8',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 900,
                  color: selectedAch.unlocked ? '#065F46' : '#475569',
                }}
              >
                {selectedAch.unlocked ? (
                  <>
                    <Check size={14} color="#059669" strokeWidth={3} />
                    <span>系统认证：已达成 (地球Online触发)</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} color="#64748B" strokeWidth={2.5} />
                    <span>系统判定：待达成 (仅系统自动触发)</span>
                  </>
                )}
              </div>

              {/* 操作按钮组 (删除自定义成就) */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleDelete(selectedAch.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '10px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    border: '1.5px solid #EF4444',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={12} />
                  删除成就
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= 自由展柜装配弹窗 ================= */}
        {pickerSlotIndex !== null && (
          <ShowcasePickerModal
            slotIndex={pickerSlotIndex}
            currentBadgeId={showcaseSlots[pickerSlotIndex]}
            achievements={achievements}
            showcaseSlots={showcaseSlots}
            onSelectBadge={(badgeId) => {
              const updated = [...showcaseSlots];
              const existingIdx = updated.indexOf(badgeId);
              if (existingIdx !== -1 && existingIdx !== pickerSlotIndex) {
                updated[existingIdx] = null;
              }
              updated[pickerSlotIndex] = badgeId;
              setShowcaseSlots(updated);
              saveShowcaseBadges(updated);
              const ach = achievements.find((a) => a.id === badgeId);
              setToastMsg(`已将【${ach?.title || '徽章'}】佩戴至第 ${pickerSlotIndex + 1} 展位！`);
              setTimeout(() => setToastMsg(null), 2500);
              setPickerSlotIndex(null);
            }}
            onRemoveBadge={() => {
              const updated = [...showcaseSlots];
              updated[pickerSlotIndex] = null;
              setShowcaseSlots(updated);
              saveShowcaseBadges(updated);
              setToastMsg(`已清空第 ${pickerSlotIndex + 1} 展位`);
              setTimeout(() => setToastMsg(null), 2000);
              setPickerSlotIndex(null);
            }}
            onClose={() => setPickerSlotIndex(null)}
          />
        )}
      </div>

      {/* 动画 */}
      <style>{`
        @keyframes slideUpSpring {
          0% {
            transform: translateY(100%);
            opacity: 0.4;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes backdropFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
