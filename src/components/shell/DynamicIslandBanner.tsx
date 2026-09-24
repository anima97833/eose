import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  BookOpen, 
  Clock, 
  Save, 
  ArrowRight, 
  X,
  Sparkles,
  Feather,
  Zap,
} from 'lucide-react';
import { NudgeNotification } from '../../core/nudge/nudgeTypes';
import { 
  detectEarthOnlineNudge, 
  markNudgeTriggered, 
  resetNudgeCooldown 
} from '../../core/nudge/nudgeEngine';

interface DynamicIslandBannerProps {
  isOnDesktop: boolean;
  onOpenApp: (appId: string) => void;
}

export const DynamicIslandBanner: React.FC<DynamicIslandBannerProps> = ({
  isOnDesktop,
  onOpenApp,
}) => {
  const [activeNudge, setActiveNudge] = useState<NudgeNotification | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 探测逻辑：停顿发呆时探测
  const triggerNudgeCheck = async (force = false) => {
    try {
      const nudge = await detectEarthOnlineNudge(force);
      if (nudge) {
        setActiveNudge(nudge);
        setIsExpanded(true);
        markNudgeTriggered();
      }
    } catch (err) {
      console.warn('[DynamicIsland] 探测提醒失败:', err);
    }
  };

  useEffect(() => {
    // 监听手动测试触发事件
    const handleManualTest = () => {
      resetNudgeCooldown();
      triggerNudgeCheck(true);
    };
    window.addEventListener('cloudfly_test_nudge', handleManualTest);

    // 桌面发呆探测定时器
    let idleTimer: ReturnType<typeof setTimeout>;
    let intervalTimer: ReturnType<typeof setInterval>;

    if (isOnDesktop) {
      // 停留在桌面 3.5 秒后，若已过 15~20 分钟冷却期，则平滑滑出
      idleTimer = setTimeout(() => {
        triggerNudgeCheck(false);
      }, 3500);

      // 每隔 1 分钟心跳检查是否已到下次 15~20 分钟随机触发时机
      intervalTimer = setInterval(() => {
        if (!isExpanded) {
          triggerNudgeCheck(false);
        }
      }, 60000);
    }

    return () => {
      clearTimeout(idleTimer);
      clearInterval(intervalTimer);
      window.removeEventListener('cloudfly_test_nudge', handleManualTest);
    };
  }, [isOnDesktop, isExpanded]);

  // 点击前往
  const handleAction = () => {
    if (!activeNudge) return;
    const target = activeNudge.targetAppId;

    // 爽文背词错词突袭：暂存标记，打开应用后直开错词阁
    if (target === 'storyword' && activeNudge.source === 'word') {
      sessionStorage.setItem('cloudfly_storyword_open_mistakes', 'true');
      window.dispatchEvent(new CustomEvent('cloudfly_open_storyword_mistakes'));
    }

    // 诗阁：暂存选中的诗词 ID，打开应用后直开诗歌赏析/考核
    if (target === 'poetry' && activeNudge.poemId) {
      sessionStorage.setItem('cloudfly_poetry_selected_id', activeNudge.poemId);
      window.dispatchEvent(new CustomEvent('cloudfly_open_poetry_detail', { detail: { poemId: activeNudge.poemId } }));
    }

    // 书藏：暂存选中的书籍 ID，打开应用后直开书籍详情
    if (target === 'books' && activeNudge.bookId) {
      sessionStorage.setItem('cloudfly_books_selected_id', activeNudge.bookId);
      window.dispatchEvent(new CustomEvent('cloudfly_open_book_detail', { detail: { bookId: activeNudge.bookId } }));
    }

    setIsExpanded(false);
    setTimeout(() => {
      setActiveNudge(null);
      onOpenApp(target);
    }, 280);
  };

  // 关闭收起
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    setTimeout(() => {
      setActiveNudge(null);
    }, 350);
  };

  // 渲染图标
  const renderIcon = () => {
    if (!activeNudge) return null;
    switch (activeNudge.icon) {
      case 'skill':
        return <BookOpen size={16} color="#38bdf8" />;
      case 'focus':
        return <Clock size={16} color="#f59e0b" />;
      case 'save':
        return <Save size={16} color="#10b981" />;
      case 'poetry':
        return <Feather size={16} color="#ec4899" />;
      case 'book':
        return <BookOpen size={16} color="#a855f7" />;
      case 'word':
        return <Zap size={16} color="#eab308" />;
      default:
        return <Globe size={16} color="#a855f7" />;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={() => {
          if (!isExpanded) {
            triggerNudgeCheck(true);
          } else {
            handleAction();
          }
        }}
        title={!isExpanded ? '轻触唤醒地球Online灵动提示' : undefined}
        style={{
          width: isExpanded ? '366px' : '74px',
          maxWidth: 'calc(100vw - 16px)',
          height: isExpanded ? '96px' : '18px',
          backgroundColor: isExpanded ? '#111318' : 'var(--nm-bg)',
          borderRadius: isExpanded ? '26px' : '12px',
          boxShadow: isExpanded
            ? '0 12px 36px rgba(0,0,0,0.55), 0 3px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.22)'
            : 'var(--nm-inset-sm)',
          border: isExpanded ? '1px solid rgba(255,255,255,0.12)' : 'none',
          display: 'flex',
          alignItems: isExpanded ? 'stretch' : 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          padding: isExpanded ? '10px 14px' : '0',
          cursor: isExpanded ? 'pointer' : 'default',
          transition: 'all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.2)',
          overflow: 'hidden',
          userSelect: 'none',
          boxSizing: 'border-box',
        }}
      >
        {!isExpanded ? (
          /* 初始态：微型镜头与听筒孔 */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#334257',
                opacity: 0.35,
                marginRight: '6px',
              }}
            />
            <div
              style={{
                width: '32px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: '#334257',
                opacity: 0.25,
              }}
            />
          </div>
        ) : (
          /* 展开态：双倍高度豪华灵动岛卡片 (完整文字展示与精致按钮) */
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* 顶栏：身份标签与关闭小叉 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {renderIcon()}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#f59e0b',
                    letterSpacing: '0.2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {activeNudge?.tag}
                  <Sparkles size={10} />
                </span>
              </div>

              <button
                type="button"
                style={{
                  border: 'none',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
                title="收起"
                onClick={handleDismiss}
              >
                <X size={12} />
              </button>
            </div>

            {/* 中间核心文字：大字号两行自然展示，绝不截断 */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#f8fafc',
                lineHeight: 1.4,
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                margin: '2px 0',
              }}
            >
              {activeNudge?.message}
            </div>

            {/* 底栏：服务器状态与极简前往按钮 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                亚太东八区 · 实时督导
              </span>

              <button
                type="button"
                style={{
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(217,119,6,0.4)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction();
                }}
              >
                <span>{activeNudge?.actionLabel || '前往'}</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
