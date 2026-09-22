import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Lock, Check, Sparkles, Coins, Gift, ChevronRight } from 'lucide-react';
import { RPGAchievement, DEFAULT_ACHIEVEMENTS } from '../../../../core/rpg/achievementTypes';
import { loadAchievements, saveAchievements } from '../../../../core/rpg/achievementStorage';

interface AchievementSheetProps {
  onClose: () => void;
  onRewardCoins?: (coins: number) => void;
}

export const AchievementSheet: React.FC<AchievementSheetProps> = ({
  onClose,
  onRewardCoins,
}) => {
  const [achievements, setAchievements] = useState<RPGAchievement[]>(loadAchievements);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNLOCKED' | 'DERIVED'>('ALL');
  const [selectedAch, setSelectedAch] = useState<RPGAchievement | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 新增表单状态
  const [newTitle, setNewTitle] = useState('');
  const [newStat, setNewStat] = useState('');
  const [newDesc, setNewDesc] = useState('');
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

  // 切换解锁状态
  const handleToggleUnlock = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = achievements.map((item) => {
      if (item.id === id) {
        const nextUnlocked = !item.unlocked;
        showToast(nextUnlocked ? '已达成' : '已重置');
        return {
          ...item,
          unlocked: nextUnlocked,
          claimed: nextUnlocked ? item.claimed : false,
        };
      }
      return item;
    });
    updateAchievements(updated);
    if (selectedAch?.id === id) {
      setSelectedAch((prev) => (prev ? { ...prev, unlocked: !prev.unlocked } : null));
    }
  };

  // 领取成就金币奖励
  const handleClaimReward = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = achievements.find((a) => a.id === id);
    if (!target || !target.unlocked || target.claimed) return;

    const updated = achievements.map((item) =>
      item.id === id ? { ...item, claimed: true } : item
    );
    updateAchievements(updated);
    onRewardCoins?.(target.coinReward);
    showToast('奖励已领');
    if (selectedAch?.id === id) {
      setSelectedAch((prev) => (prev ? { ...prev, claimed: true } : null));
    }
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

  // 新增成就
  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const newId = `ach_${Date.now()}`;
    const newAch: RPGAchievement = {
      id: newId,
      title: newTitle.trim().slice(0, 5), // <= 5 字
      tier: isDerivedNew ? 2 : 1,
      category: 'focus',
      statLabel: newStat.trim().slice(0, 6) || '专注 100',
      desc: newDesc.trim() || '日常积累衍生解锁',
      iconType: isDerivedNew ? 'crit' : 'hp',
      unlocked: false,
      claimed: false,
      isDerived: isDerivedNew,
      prerequisiteTitle: isDerivedNew ? prereqTitle.trim().slice(0, 5) || '初阶前置' : undefined,
      coinReward: isDerivedNew ? 300 : 100,
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
    if (activeFilter === 'UNLOCKED') return item.unlocked;
    if (activeFilter === 'DERIVED') return item.isDerived;
    return true;
  });

  // 计算成就总评点数
  const totalUnlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalScore = (
    achievements.filter((a) => a.unlocked).reduce((sum, cur) => sum + (cur.tier * 20), 0) +
    totalUnlockedCount * 5
  ).toFixed(1);

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

          {/* 气泡徽章 1：已解锁天使喵 (参考图同款白光渐变气泡) */}
          <div
            onClick={() => setActiveFilter('UNLOCKED')}
            title="已达成成就"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              background: 'radial-gradient(circle, #FFFFFF 40%, #D8EEF8 100%)',
              border: '2px solid #94BFD1',
              boxShadow: '0 2px 5px rgba(100, 160, 190, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            🐱
          </div>

          {/* 气泡徽章 2：高阶解锁猫 (参考图同款双耳饰品猫) */}
          <div
            onClick={() => setActiveFilter('UNLOCKED')}
            title="高阶达成"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              background: 'radial-gradient(circle, #FFFFFF 40%, #E6F3FA 100%)',
              border: '2px solid #94BFD1',
              boxShadow: '0 2px 5px rgba(100, 160, 190, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            🦊
          </div>

          {/* 玻璃锁气泡序列（参考图右侧 4 个青色玻璃球带黑锁头：代表未来衍生成就位） */}
          {[1, 2, 3, 4].map((slotIdx) => (
            <div
              key={slotIdx}
              onClick={() => setActiveFilter('DERIVED')}
              title="未来可能解锁的衍生成就位"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                // 深度还原参考图青蓝通透微反光玻璃球质感
                background: 'radial-gradient(circle at 35% 30%, #76C8D8 10%, #3B8DA1 60%, #266978 100%)',
                border: '2px solid #205966',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                opacity: 0.9,
              }}
            >
              <div
                style={{
                  background: 'rgba(20, 52, 60, 0.5)',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={15} color="#D1F1F8" strokeWidth={2.5} />
              </div>
            </div>
          ))}
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
            padding: '16px 0 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 贯穿左右的真实挂绳线条 */}
          <div
            style={{
              position: 'absolute',
              top: '25px',
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
              padding: '3px 16px',
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
                fontSize: '15px',
                fontWeight: 900,
                color: '#422817',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                letterSpacing: '0.5px',
              }}
            >
              成就 {totalScore}
            </span>
          </div>
        </div>

        {/* ================= 4. 核心木质挂牌卡片序列（横向滑动，深度还原参考图卡片） ================= */}
        <div
          {...plaquesDragHandlers}
          className="no-scrollbar"
          style={{
            padding: '8px 14px 24px',
            overflowX: 'auto',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            scrollSnapType: 'x proximity',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: 'grab',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {filteredList.map((ach) => {
            const isDerived = !!ach.isDerived;
            const isUnlocked = ach.unlocked;
            const isClaimed = ach.claimed;

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
                {/* 顶部挂绳木环 / 夹扣 (对齐参考图每个木牌顶部的细绳扣圈) */}
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

                {/* 木质标牌卡身 (深度还原参考图中的圆角温润木板) */}
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
                  {/* 标牌顶部：Lv. 1 等级标 (参考图同款) */}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#6B4A34',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Lv. {ach.tier}
                  </span>

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

                  {/* 标牌标题 (严格 <= 5 字) */}
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 900,
                      color: '#422817',
                      fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {ach.title}
                  </span>

                  {/* 标牌指标数值 (对齐参考图中的 ATK 10 / HP 110) */}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#6E4931',
                    }}
                  >
                    {ach.statLabel}
                  </span>

                  {/* 标牌底部：参考图同款灰黑椭圆胶囊金币按键 */}
                  <div
                    onClick={(e) => {
                      if (isUnlocked && !isClaimed) {
                        handleClaimReward(ach.id, e);
                      } else {
                        handleToggleUnlock(ach.id, e);
                      }
                    }}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      padding: '4px 6px',
                      borderRadius: '16px',
                      // 深度还原参考图深灰胶囊底色与内嵌高光
                      background: isClaimed
                        ? '#059669' // 已达成绿色
                        : isUnlocked
                        ? '#EAB308' // 可领奖金黄
                        : '#475569', // 未解锁深灰 (参考图同款)
                      border: '1.5px solid #1E293B',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 0 #1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {/* 左侧金币图标 */}
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#FBBF24',
                        border: '1px solid #78350F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 900,
                        color: '#78350F',
                        flexShrink: 0,
                      }}
                    >
                      $
                    </div>

                    {/* 中间状态/锁图标与文案 (<= 5 字) */}
                    {isClaimed ? (
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#FFFFFF' }}>
                        已达成
                      </span>
                    ) : isUnlocked ? (
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#FFFFFF' }}>
                        领奖励
                      </span>
                    ) : isDerived ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Lock size={10} color="#CBD5E1" />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#CBD5E1' }}>
                          待衍生
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Lock size={10} color="#CBD5E1" />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#CBD5E1' }}>
                          待达成
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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

              {/* 成就标题与阶级 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#422817' }}>
                  {selectedAch.title} (Lv.{selectedAch.tier})
                </div>
                <div style={{ fontSize: '12px', color: '#8D4952', fontWeight: 800, marginTop: '2px' }}>
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

              {/* 操作按钮组 (<= 5 字) */}
              <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleToggleUnlock(selectedAch.id)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '12px',
                    background: selectedAch.unlocked ? '#D1FAE5' : '#FEF3C7',
                    color: selectedAch.unlocked ? '#065F46' : '#92400E',
                    border: '2px solid #6E462A',
                    fontSize: '12px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 2px 0 #6E462A',
                  }}
                >
                  {selectedAch.unlocked ? '已达成' : '标记达成'}
                </button>

                <button
                  onClick={() => handleDelete(selectedAch.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    border: '2px solid #6E462A',
                    fontSize: '12px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 2px 0 #6E462A',
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
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
