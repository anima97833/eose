import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DateWidget } from './widgets/DateWidget';
import { MusicWidget } from './widgets/MusicWidget';
import { TaskDropWidget } from './widgets/TaskDropWidget';
import { HoroscopeWidget } from './widgets/HoroscopeWidget';
import { HoroscopeModal } from './widgets/HoroscopeModal';
import { HoroscopeData } from '../../core/horoscope/horoscopeService';
import {
  loadDesktopLayout,
  moveDesktopApp,
  DesktopZone,
  DesktopLayout,
  APPS_PER_PAGE,
} from '../../core/sdk/desktopLayout';
import { getAppIcon, getAppHasBadge, getAppTitle } from './desktopIconHelper';
import { uninstallAppFromDesktop, listStoreCatalog } from '../../core/sdk/appStoreCatalog';
import { ArrowLeft, ArrowRight, Anchor, LogOut, Trash2, X, Check, Sparkles } from 'lucide-react';

interface DesktopHomeProps {
  onOpenApp?: (appId: string) => void;
}

interface DragSession {
  appId: string;
  fromZone: DesktopZone;
  fromIndex: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface HoverTarget {
  zone: DesktopZone;
  index: number;
}

export const DesktopHome: React.FC<DesktopHomeProps> = ({ onOpenApp }) => {
  const [layout, setLayout] = useState<DesktopLayout>(loadDesktopLayout());
  // 默认启动停留在主屏幕第 1 页 (Slide 1，对应 layout.pages[0])；向右滑为负一屏小组件 (Slide 0)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isPageSwiping, setIsPageSwiping] = useState<boolean>(false);

  // 全局跨区域/跨页面拖拽状态
  const [dragSession, setDragSession] = useState<DragSession | null>(null);
  const [hoverTarget, setHoverTarget] = useState<HoverTarget | null>(null);

  // 长按弹窗管理菜单
  const [managingAppId, setManagingAppId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 今日星轨运势弹窗状态
  const [activeHoroscopeData, setActiveHoroscopeData] = useState<HoroscopeData | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const pageGridsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  // 边缘停留自动切页计时器
  const edgeTimerRef = useRef<number | null>(null);
  const edgeDirectionRef = useRef<'left' | 'right' | null>(null);

  // 桌面壁纸全屏横滑切页手势引用
  const swipeStartXRef = useRef<number>(0);
  const swipeStartYRef = useRef<number>(0);
  const isHorizontalSwipeRef = useRef<boolean>(false);

  // 监听应用安装/卸载与布局变动事件
  useEffect(() => {
    const handleLayoutUpdate = () => {
      setLayout(loadDesktopLayout());
    };
    window.addEventListener('aiphone_layout_updated', handleLayoutUpdate);
    window.addEventListener('aiphone_store_updated', handleLayoutUpdate);
    return () => {
      window.removeEventListener('aiphone_layout_updated', handleLayoutUpdate);
      window.removeEventListener('aiphone_store_updated', handleLayoutUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleAppClick = (appId: string) => {
    onOpenApp?.(appId);
  };

  // 总滑屏数 = 1 (负一屏) + 主屏幕页面数 (layout.pages)
  const totalSlides = 1 + Math.max(1, layout.pages.length);

  // 确保页面数量变动时，当前页码合法
  useEffect(() => {
    if (currentPage >= totalSlides) {
      setCurrentPage(Math.max(0, totalSlides - 1));
    }
  }, [totalSlides, currentPage]);

  // ================= 边缘自动切页检测 =================
  const checkEdgeAutoFlip = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const edgeThreshold = 42;

      // 靠近左边边缘 -> 自动翻向上一页
      if (currentPage > 0 && clientX <= rect.left + edgeThreshold) {
        if (edgeDirectionRef.current !== 'left') {
          edgeDirectionRef.current = 'left';
          if (edgeTimerRef.current) clearTimeout(edgeTimerRef.current);
          edgeTimerRef.current = window.setTimeout(() => {
            setCurrentPage((prev) => Math.max(0, prev - 1));
            edgeDirectionRef.current = null;
          }, 320);
        }
        return;
      }

      // 靠近右边边缘 -> 自动翻向下一页
      if (currentPage < totalSlides - 1 && clientX >= rect.right - edgeThreshold) {
        if (edgeDirectionRef.current !== 'right') {
          edgeDirectionRef.current = 'right';
          if (edgeTimerRef.current) clearTimeout(edgeTimerRef.current);
          edgeTimerRef.current = window.setTimeout(() => {
            setCurrentPage((prev) => Math.min(totalSlides - 1, prev + 1));
            edgeDirectionRef.current = null;
          }, 320);
        }
        return;
      }

      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
      edgeDirectionRef.current = null;
    },
    [currentPage, totalSlides]
  );

  // ================= 计算拖拽落点目标 =================
  const computeHoverTarget = useCallback(
    (clientX: number, clientY: number): HoverTarget | null => {
      // 1. 检测是否悬停在底部常驻 Dock 栏
      if (dockRef.current) {
        const dRect = dockRef.current.getBoundingClientRect();
        if (
          clientX >= dRect.left - 10 &&
          clientX <= dRect.right + 10 &&
          clientY >= dRect.top - 15 &&
          clientY <= dRect.bottom + 15
        ) {
          const colWidth = dRect.width / Math.max(1, layout.dock.length);
          const index = Math.max(
            0,
            Math.min(layout.dock.length, Math.floor((clientX - dRect.left) / colWidth))
          );
          return { zone: 'dock', index };
        }
      }

      // 2. 检测当前应用主屏幕 (Slide 1..N 对应 page_0, page_1...)
      const pageIndex = Math.max(0, currentPage - 1);
      const gridEl = pageGridsRef.current.get(pageIndex);
      const zoneName = `page_${pageIndex}`;
      const pageApps = layout.pages[pageIndex] || [];
      const appCount = pageApps.length;

      if (gridEl) {
        const gRect = gridEl.getBoundingClientRect();
        const colWidth = gRect.width / 4;
        const col = Math.max(0, Math.min(3, Math.floor((clientX - gRect.left) / colWidth)));
        const row = Math.max(0, Math.min(3, Math.floor((clientY - gRect.top) / 82)));
        const index = Math.max(0, Math.min(Math.min(APPS_PER_PAGE - 1, appCount), row * 4 + col));
        return { zone: zoneName, index };
      }

      return { zone: zoneName, index: appCount };
    },
    [currentPage, layout]
  );

  // ================= 启动图标跨区拖拽 =================
  const handleStartDrag = (
    appId: string,
    fromZone: DesktopZone,
    fromIndex: number,
    e: React.PointerEvent
  ) => {
    e.stopPropagation();

    const startSession: DragSession = {
      appId,
      fromZone,
      fromIndex,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    };

    setDragSession(startSession);
    setHoverTarget({ zone: fromZone, index: fromIndex });

    const handleGlobalPointerMove = (moveEvt: PointerEvent) => {
      setDragSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentX: moveEvt.clientX,
          currentY: moveEvt.clientY,
        };
      });

      // 碰撞检测与边缘切页
      const target = computeHoverTarget(moveEvt.clientX, moveEvt.clientY);
      setHoverTarget(target);
      checkEdgeAutoFlip(moveEvt.clientX);
    };

    const handleGlobalPointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);

      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
      edgeDirectionRef.current = null;

      const finalTarget = computeHoverTarget(upEvt.clientX, upEvt.clientY);
      if (finalTarget) {
        // 执行落点更新
        const newLayout = moveDesktopApp(
          appId,
          fromZone,
          finalTarget.zone,
          finalTarget.index
        );
        setLayout(newLayout);

        const targetName =
          finalTarget.zone === 'dock'
            ? '底部Dock栏'
            : `主屏幕第 ${parseInt(finalTarget.zone.replace('page_', '') || '0', 10) + 1} 页`;
        showToast(`已移动到 ${targetName}`);
      }

      setDragSession(null);
      setHoverTarget(null);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
  };

  // ================= 空白处壁纸横滑翻页手势 =================
  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    if (dragSession) return;
    swipeStartXRef.current = e.clientX;
    swipeStartYRef.current = e.clientY;
    isHorizontalSwipeRef.current = false;
    setIsPageSwiping(true);
  };

  const handleBackgroundPointerMove = (e: React.PointerEvent) => {
    if (!isPageSwiping || dragSession) return;

    const deltaX = e.clientX - swipeStartXRef.current;
    const deltaY = e.clientY - swipeStartYRef.current;

    if (!isHorizontalSwipeRef.current) {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isHorizontalSwipeRef.current = true;
      } else if (Math.abs(deltaY) > 12) {
        return;
      }
    }

    if (isHorizontalSwipeRef.current) {
      let offset = deltaX;
      // 边界阻尼回弹
      if ((currentPage === 0 && deltaX > 0) || (currentPage === totalSlides - 1 && deltaX < 0)) {
        offset = deltaX * 0.28;
      }
      setDragOffset(offset);
    }
  };

  const handleBackgroundPointerUp = () => {
    if (!isPageSwiping) return;

    if (isHorizontalSwipeRef.current) {
      const threshold = 40;
      if (dragOffset < -threshold && currentPage < totalSlides - 1) {
        setCurrentPage((prev) => Math.min(totalSlides - 1, prev + 1));
      } else if (dragOffset > threshold && currentPage > 0) {
        setCurrentPage((prev) => Math.max(0, prev - 1));
      }
    }

    setIsPageSwiping(false);
    setDragOffset(0);
    isHorizontalSwipeRef.current = false;
  };

  // ================= 快捷管理菜单操作 =================
  const handleMoveToZone = (targetZone: DesktopZone) => {
    if (!managingAppId) return;

    // 寻找当前所在区域
    let fromZone: DesktopZone = 'page_0';
    if (layout.dock.includes(managingAppId)) {
      fromZone = 'dock';
    } else {
      for (let i = 0; i < layout.pages.length; i++) {
        if (layout.pages[i].includes(managingAppId)) {
          fromZone = `page_${i}`;
          break;
        }
      }
    }

    if (fromZone === targetZone) {
      setManagingAppId(null);
      return;
    }

    const newLayout = moveDesktopApp(managingAppId, fromZone, targetZone);
    setLayout(newLayout);
    setManagingAppId(null);

    const targetName =
      targetZone === 'dock'
        ? '底部Dock栏'
        : `主屏幕第 ${parseInt(targetZone.replace('page_', '') || '0', 10) + 1} 页`;
    showToast(`已移动到 ${targetName}`);
  };

  const handleUninstallApp = (appId: string) => {
    uninstallAppFromDesktop(appId);
    setLayout(loadDesktopLayout());
    setManagingAppId(null);
    showToast('已回收到应用商店');
  };

  const isManagingSystemApp = managingAppId === 'appstore';

  const managingAppZone: DesktopZone | null = (() => {
    if (!managingAppId) return null;
    if (layout.dock.includes(managingAppId)) return 'dock';
    for (let i = 0; i < layout.pages.length; i++) {
      if (layout.pages[i].includes(managingAppId)) return `page_${i}`;
    }
    return null;
  })();

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '8px 16px 10px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* 提示气泡 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(50, 65, 85, 0.92)',
            color: '#fff',
            padding: '7px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            zIndex: 999999,
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <Check size={14} color="#52c41a" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 跨页拖拽边缘指引提示 */}
      {dragSession && (
        <>
          {currentPage > 0 && (
            <div
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              style={{
                position: 'absolute',
                left: '6px',
                top: '40%',
                transform: 'translateY(-50%)',
                zIndex: 9999,
                backgroundColor: 'rgba(235, 240, 248, 0.95)',
                boxShadow:
                  '4px 4px 12px rgba(160, 175, 195, 0.6), -4px -4px 12px rgba(255, 255, 255, 0.95)',
                border: '1.5px solid #5096C6',
                borderRadius: '16px',
                padding: '10px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#5096C6',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              <span style={{ writingMode: 'vertical-lr', letterSpacing: '2px' }}>
                {currentPage === 1 ? '小组件' : `第 ${currentPage - 1} 页`}
              </span>
            </div>
          )}

          {currentPage < totalSlides - 1 && (
            <div
              onClick={() => setCurrentPage((prev) => Math.min(totalSlides - 1, prev + 1))}
              style={{
                position: 'absolute',
                right: '6px',
                top: '40%',
                transform: 'translateY(-50%)',
                zIndex: 9999,
                backgroundColor: 'rgba(235, 240, 248, 0.95)',
                boxShadow:
                  '4px 4px 12px rgba(160, 175, 195, 0.6), -4px -4px 12px rgba(255, 255, 255, 0.95)',
                border: '1.5px solid #5096C6',
                borderRadius: '16px',
                padding: '10px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#5096C6',
                cursor: 'pointer',
              }}
            >
              <ArrowRight size={16} />
              <span style={{ writingMode: 'vertical-lr', letterSpacing: '2px' }}>
                {`第 ${currentPage + 1} 页`}
              </span>
            </div>
          )}
        </>
      )}

      {/* 多页面平滑视窗 */}
      <div
        onPointerDown={handleBackgroundPointerDown}
        onPointerMove={handleBackgroundPointerMove}
        onPointerUp={handleBackgroundPointerUp}
        onPointerCancel={handleBackgroundPointerUp}
        style={{
          flex: 1,
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          touchAction: 'pan-y',
          cursor: isPageSwiping ? 'grabbing' : 'default',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: `${totalSlides * 100}%`,
            height: '100%',
            transform: `translate3d(calc(-${currentPage * (100 / totalSlides)}% + ${dragOffset}px), 0, 0)`,
            transition: isPageSwiping
              ? 'none'
              : 'transform 0.38s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* ================= 页面 0：负一屏 (小组件看板) ================= */}
          <div
            style={{
              width: `${100 / totalSlides}%`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '2px 2px 6px',
              boxSizing: 'border-box',
              overflowY: 'auto',
            }}
          >
            {/* 1. 顶部日期看板 */}
            <DateWidget />

            {/* 2. 音乐组件（深蓝轻拟物胶囊，无缝同步声音电台流） */}
            <MusicWidget onOpenApp={() => onOpenApp?.('radio')} />

            {/* 3. 双列卡片：左侧今日星座运势卡 + 右侧奇遇任务掉落卡 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.15fr',
                gap: '12px',
                alignItems: 'stretch',
                height: '138px',
              }}
            >
              <HoroscopeWidget onOpenModal={setActiveHoroscopeData} />
              <TaskDropWidget />
            </div>


          </div>

          {/* ================= 页面 1..N：应用主屏幕 (每页最多 16 个应用，横 4 竖 4) ================= */}
          {layout.pages.map((pageApps, pageIdx) => {
            const zoneName = `page_${pageIdx}`;

            return (
              <div
                key={zoneName}
                style={{
                  width: `${100 / totalSlides}%`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  padding: '8px 2px 2px',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                {/* 4x4 网格：横四个，竖四个，最多 16 个应用位，无垂直滚动条 */}
                <div
                  ref={(el) => {
                    if (el) pageGridsRef.current.set(pageIdx, el);
                    else pageGridsRef.current.delete(pageIdx);
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gridTemplateRows: 'repeat(4, minmax(74px, 86px))',
                    columnGap: '8px',
                    rowGap: '16px',
                    width: '100%',
                    alignContent: 'start',
                  }}
                >
                  {pageApps.map((appId, index) => {
                    const isBeingDragged = dragSession?.appId === appId;
                    const isDropSlot =
                      hoverTarget?.zone === zoneName &&
                      hoverTarget.index === index &&
                      !isBeingDragged;
                    const hasBadge = getAppHasBadge(appId);
                    const title = getAppTitle(appId);

                    return (
                      <div
                        key={appId}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          minHeight: '74px',
                        }}
                      >
                        {/* 插槽吸附指示器 */}
                        {isDropSlot && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-3px',
                              width: '52px',
                              height: '52px',
                              borderRadius: '50%',
                              border: '2px dashed #5096C6',
                              backgroundColor: 'rgba(80, 150, 198, 0.12)',
                              boxShadow:
                                'inset 3px 3px 8px rgba(160, 175, 195, 0.4), inset -3px -3px 8px rgba(255, 255, 255, 0.9)',
                              zIndex: 2,
                              pointerEvents: 'none',
                            }}
                          />
                        )}

                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            let moved = false;
                            const sx = e.clientX;
                            const sy = e.clientY;

                            const lpTimer = setTimeout(() => {
                              if (!moved) setManagingAppId(appId);
                            }, 420);

                            const onMove = (me: PointerEvent) => {
                              if (Math.hypot(me.clientX - sx, me.clientY - sy) > 5) {
                                moved = true;
                                clearTimeout(lpTimer);
                                window.removeEventListener('pointermove', onMove);
                                window.removeEventListener('pointerup', onUp);
                                handleStartDrag(appId, zoneName, index, e);
                              }
                            };

                            const onUp = (ue: PointerEvent) => {
                              clearTimeout(lpTimer);
                              window.removeEventListener('pointermove', onMove);
                              window.removeEventListener('pointerup', onUp);
                              if (!moved && Math.hypot(ue.clientX - sx, ue.clientY - sy) <= 5) {
                                handleAppClick(appId);
                              }
                            };

                            window.addEventListener('pointermove', onMove);
                            window.addEventListener('pointerup', onUp);
                          }}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--nm-bg)',
                            border: '1px solid rgba(255, 255, 255, 0.55)',
                            boxShadow: isBeingDragged
                              ? 'inset 4px 4px 10px rgba(150, 170, 195, 0.8), inset -4px -4px 10px rgba(255, 255, 255, 0.98)'
                              : '5px 5px 12px rgba(160, 175, 195, 0.52), -5px -5px 12px rgba(255, 255, 255, 0.96)',
                            color: isBeingDragged ? '#5096C6' : '#475971',
                            opacity: isBeingDragged ? 0.35 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            transform: isBeingDragged ? 'scale(0.92)' : 'scale(1)',
                            transition: 'transform 0.15s ease, opacity 0.15s ease',
                            touchAction: 'none',
                          }}
                        >
                          {getAppIcon(appId, 24)}
                          {hasBadge && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '3px',
                                right: '3px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--nm-accent-red)',
                                boxShadow: '0 0 6px var(--nm-accent-red)',
                              }}
                            />
                          )}
                        </div>

                        <span
                          style={{
                            marginTop: '4px',
                            fontSize: '11px',
                            color: 'var(--nm-text-sub)',
                            textAlign: 'center',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                          }}
                        >
                          {title}
                        </span>
                      </div>
                    );
                  })}

                  {/* 页面尾部吸附槽位 */}
                  {hoverTarget?.zone === zoneName &&
                    hoverTarget.index >= pageApps.length &&
                    pageApps.length < APPS_PER_PAGE && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '74px',
                        }}
                      >
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            border: '2px dashed #5096C6',
                            backgroundColor: 'rgba(80, 150, 198, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#5096C6',
                            fontSize: '16px',
                          }}
                        >
                          +
                        </div>
                        <span style={{ marginTop: '4px', fontSize: '11px', color: '#5096C6' }}>
                          放置此处
                        </span>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 桌面分页指示器 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 0 4px',
        }}
      >
        {/* 负一屏指示器 (小组件卡片) */}
        <button
          type="button"
          onClick={() => setCurrentPage(0)}
          style={{
            height: '6px',
            width: currentPage === 0 ? '16px' : '6px',
            borderRadius: '3px',
            backgroundColor:
              currentPage === 0 ? 'var(--nm-primary)' : 'rgba(166, 180, 200, 0.45)',
            boxShadow:
              currentPage === 0 ? '0 0 6px rgba(80, 150, 198, 0.5)' : 'none',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          title="负一屏小组件"
        />

        {/* 各主屏应用页面指示器 */}
        {layout.pages.map((_, pIdx) => {
          const slideIdx = pIdx + 1;
          const isActive = currentPage === slideIdx;
          return (
            <button
              key={`dot_${pIdx}`}
              type="button"
              onClick={() => setCurrentPage(slideIdx)}
              style={{
                width: isActive ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor:
                  isActive ? 'var(--nm-primary)' : 'rgba(166, 180, 200, 0.45)',
                boxShadow:
                  isActive ? '0 0 6px rgba(80, 150, 198, 0.5)' : 'none',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              title={`主屏幕第 ${pIdx + 1} 页`}
            />
          );
        })}
      </div>

      {/* ================= 底部核心 Dock 栏：支持直接将图标拖入/拖出 ================= */}
      <div
        ref={dockRef}
        className="nm-card-sm"
        style={{
          padding: '7px 10px',
          borderRadius: '32px',
          backgroundColor:
            hoverTarget?.zone === 'dock'
              ? 'rgba(225, 236, 248, 0.96)'
              : 'rgba(233, 238, 245, 0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow:
            hoverTarget?.zone === 'dock'
              ? '0 0 16px rgba(80, 150, 198, 0.55), 6px 6px 16px rgba(160, 175, 195, 0.48), -5px -5px 14px rgba(255, 255, 255, 0.95)'
              : '6px 6px 16px rgba(160, 175, 195, 0.48), -5px -5px 14px rgba(255, 255, 255, 0.95), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
          border:
            hoverTarget?.zone === 'dock'
              ? '1.5px solid #5096C6'
              : '1px solid rgba(255, 255, 255, 0.55)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          minHeight: '62px',
        }}
      >
        {layout.dock.map((appId, index) => {
          const isBeingDragged = dragSession?.appId === appId;
          const isDropSlot =
            hoverTarget?.zone === 'dock' &&
            hoverTarget.index === index &&
            !isBeingDragged;
          const hasBadge = getAppHasBadge(appId);
          const iconSize = layout.dock.length >= 5 ? 46 : 52;

          return (
            <React.Fragment key={appId}>
              {/* Dock 插槽吸附指示 */}
              {isDropSlot && (
                <div
                  style={{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    borderRadius: '50%',
                    border: '2px dashed #5096C6',
                    backgroundColor: 'rgba(80, 150, 198, 0.16)',
                    boxShadow:
                      'inset 2px 2px 6px rgba(160, 175, 195, 0.5), inset -2px -2px 6px rgba(255, 255, 255, 0.9)',
                  }}
                />
              )}

              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  let moved = false;
                  const sx = e.clientX;
                  const sy = e.clientY;

                  const lpTimer = setTimeout(() => {
                    if (!moved) setManagingAppId(appId);
                  }, 420);

                  const onMove = (me: PointerEvent) => {
                    if (Math.hypot(me.clientX - sx, me.clientY - sy) > 5) {
                      moved = true;
                      clearTimeout(lpTimer);
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                      handleStartDrag(appId, 'dock', index, e);
                    }
                  };

                  const onUp = (ue: PointerEvent) => {
                    clearTimeout(lpTimer);
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                    if (!moved && Math.hypot(ue.clientX - sx, ue.clientY - sy) <= 5) {
                      handleAppClick(appId);
                    }
                  };

                  window.addEventListener('pointermove', onMove);
                  window.addEventListener('pointerup', onUp);
                }}
                style={{
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                  borderRadius: '50%',
                  backgroundColor: 'var(--nm-bg)',
                  border: '1px solid rgba(255, 255, 255, 0.55)',
                  boxShadow: isBeingDragged
                    ? 'inset 4px 4px 10px rgba(150, 170, 195, 0.8), inset -4px -4px 10px rgba(255, 255, 255, 0.98)'
                    : '5px 5px 12px rgba(160, 175, 195, 0.52), -5px -5px 12px rgba(255, 255, 255, 0.96)',
                  color: isBeingDragged ? '#5096C6' : '#475971',
                  opacity: isBeingDragged ? 0.35 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transform: isBeingDragged ? 'scale(0.92)' : 'scale(1)',
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                  touchAction: 'none',
                }}
              >
                {getAppIcon(appId, iconSize >= 50 ? 24 : 20)}
                {hasBadge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      right: '3px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--nm-accent-red)',
                      boxShadow: '0 0 6px var(--nm-accent-red)',
                    }}
                  />
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* 若悬停在 Dock 尾部 */}
        {hoverTarget?.zone === 'dock' &&
          hoverTarget.index >= layout.dock.length && (
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: '2px dashed #5096C6',
                backgroundColor: 'rgba(80, 150, 198, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5096C6',
                fontSize: '15px',
              }}
            >
              +
            </div>
          )}
      </div>

      {/* ================= 全局顶层悬浮拖拽虚影 (Portal Overlay) ================= */}
      {dragSession && (
        <div
          style={{
            position: 'fixed',
            left: `${dragSession.currentX - 27}px`,
            top: `${dragSession.currentY - 27}px`,
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'var(--nm-bg)',
            boxShadow:
              '12px 16px 32px rgba(150, 170, 195, 0.75), -8px -10px 24px rgba(255, 255, 255, 0.98)',
            border: '2px solid #5096C6',
            transform: 'scale(1.16) rotate(3deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5096C6',
            pointerEvents: 'none',
            zIndex: 999999,
          }}
        >
          {getAppIcon(dragSession.appId, 26)}
        </div>
      )}

      {/* ================= 长按呼出：拟物应用快捷调度面板 ================= */}
      {managingAppId && (
        <div
          onClick={() => setManagingAppId(null)}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 25, 38, 0.45)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="nm-card"
            style={{
              width: '100%',
              borderRadius: '24px',
              padding: '20px 18px 16px',
              backgroundColor: 'var(--nm-bg)',
              boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              animation: 'slideUp 0.24s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {/* 头部：应用信息 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--nm-bg)',
                  boxShadow:
                    '5px 5px 12px rgba(160, 175, 195, 0.5), -5px -5px 12px rgba(255, 255, 255, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5096C6',
                  flexShrink: 0,
                }}
              >
                {getAppIcon(managingAppId, 26)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nm-text)' }}>
                  {getAppTitle(managingAppId)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--nm-text-sub)', marginTop: '2px' }}>
                  当前位于：
                  {managingAppZone === 'dock'
                    ? '底部Dock栏'
                    : `主屏幕第 ${parseInt(managingAppZone?.replace('page_', '') || '0', 10) + 1} 页`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManagingAppId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: 'var(--nm-text-sub)',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 调度操作按钮组 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* 各主屏页面调度选项 */}
              {layout.pages.map((_, pIdx) => {
                const targetZone = `page_${pIdx}`;
                if (managingAppZone === targetZone) return null;
                return (
                  <button
                    key={`move_to_p_${pIdx}`}
                    type="button"
                    onClick={() => handleMoveToZone(targetZone)}
                    className="nm-btn"
                    style={{
                      padding: '11px 14px',
                      borderRadius: '16px',
                      fontSize: '13px',
                      color: 'var(--nm-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      justifyContent: 'flex-start',
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowRight size={16} color="#5096C6" />
                    <span>移动至主屏幕第 {pIdx + 1} 页</span>
                  </button>
                );
              })}

              {/* 如果所有现有主屏页面均已满 16 个，提供新建下一页按钮 */}
              {layout.pages.every((p) => p.length >= APPS_PER_PAGE) && (
                <button
                  type="button"
                  onClick={() => handleMoveToZone(`page_${layout.pages.length}`)}
                  className="nm-btn"
                  style={{
                    padding: '11px 14px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: 'var(--nm-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowRight size={16} color="#5096C6" />
                  <span>创建并移动至新第 {layout.pages.length + 1} 页</span>
                </button>
              )}

              {managingAppZone !== 'dock' && (
                <button
                  type="button"
                  onClick={() => handleMoveToZone('dock')}
                  className="nm-btn"
                  style={{
                    padding: '11px 14px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: 'var(--nm-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                  }}
                >
                  <Anchor size={16} color="#5096C6" />
                  <span>移入底部常驻 Dock 栏</span>
                </button>
              )}

              {managingAppZone === 'dock' && (
                <button
                  type="button"
                  onClick={() =>
                    handleMoveToZone(currentPage === 0 ? 'page_0' : `page_${currentPage - 1}`)
                  }
                  className="nm-btn"
                  style={{
                    padding: '11px 14px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: 'var(--nm-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} color="#5096C6" />
                  <span>移出 Dock 到当前页面</span>
                </button>
              )}

              {!isManagingSystemApp && (
                <button
                  type="button"
                  onClick={() => handleUninstallApp(managingAppId)}
                  className="nm-btn"
                  style={{
                    padding: '11px 14px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: '#E0564C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(235, 87, 87, 0.08)',
                    border: '1px solid rgba(235, 87, 87, 0.25)',
                  }}
                >
                  <Trash2 size={16} color="#E0564C" />
                  <span>回收到应用商店 (卸载)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 今日星轨运势弹窗 */}
      {activeHoroscopeData && (
        <HoroscopeModal
          data={activeHoroscopeData}
          onClose={() => setActiveHoroscopeData(null)}
        />
      )}
    </div>
  );
};
