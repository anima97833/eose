import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, BookOpen, MapPin, Scan, CheckCircle2 } from 'lucide-react';
import { PhysicalBookRecord, ReadingStatus, BookShelfStats } from '../../../core/books/bookTypes';
import {
  loadAllBooks,
  saveBook,
  deleteBook,
  calculateBookShelfStats,
  getSavedPhysicalLocations,
  savePhysicalLocation,
  updatePhysicalLocation,
  deletePhysicalLocation,
} from '../../../core/books/bookStorage';
import { NM } from './bookNeumorphism';
import { BookShelfCard } from './components/BookShelfCard';
import { ContinuousScannerModal } from './components/ContinuousScannerModal';
import { BookDetailModal } from './components/BookDetailModal';
import { LocationManagerModal } from './components/LocationManagerModal';
import { Settings } from 'lucide-react';

interface BookVaultAppProps {
  onBack: () => void;
}

type ViewMode = 'status' | 'location';

export const BookVaultApp: React.FC<BookVaultAppProps> = ({ onBack }) => {
  const [books, setBooks] = useState<PhysicalBookRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 视角模式：按阅读状态分 或 按物理书架分
  const [viewMode, setViewMode] = useState<ViewMode>('status');
  const [statusFilter, setStatusFilter] = useState<'all' | ReadingStatus>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // 模态框控制
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isLocationManagerOpen, setIsLocationManagerOpen] = useState<boolean>(false);
  const [locationsVersion, setLocationsVersion] = useState<number>(0);
  const [selectedBook, setSelectedBook] = useState<PhysicalBookRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  const reloadBooksAndLocations = async () => {
    const data = await loadAllBooks();
    setBooks(data);
    setLocationsVersion((v) => v + 1);
  };

  const handleAddLocation = (name: string) => {
    savePhysicalLocation(name);
    setLocationsVersion((v) => v + 1);
    showToast('已添加书架');
  };

  const handleUpdateLocation = async (oldName: string, newName: string) => {
    await updatePhysicalLocation(oldName, newName);
    await reloadBooksAndLocations();
    if (locationFilter === oldName) setLocationFilter(newName);
    showToast('已重命名书架');
  };

  const handleDeleteLocation = async (name: string) => {
    await deletePhysicalLocation(name);
    await reloadBooksAndLocations();
    if (locationFilter === name) setLocationFilter('all');
    showToast('已删除书架');
  };

  useEffect(() => {
    loadAllBooks().then((data) => {
      setBooks(data);
    });
  }, []);

  const stats: BookShelfStats = useMemo(() => calculateBookShelfStats(books), [books]);
  const allLocations = useMemo(() => {
    const fromStats = Object.keys(stats.locationCounts);
    const fromSaved = getSavedPhysicalLocations();
    return Array.from(new Set([...fromStats, ...fromSaved]));
  }, [stats, locationsVersion]);

  // 过滤后的图书列表
  const filteredBooks = useMemo(() => {
    let list = books;

    // 关键词搜索
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.publisher.toLowerCase().includes(q) ||
          b.physicalLocation.toLowerCase().includes(q) ||
          b.isbn.includes(q)
      );
    }

    // 视角筛选
    if (viewMode === 'status') {
      if (statusFilter !== 'all') {
        list = list.filter((b) => b.status === statusFilter);
      }
    } else {
      if (locationFilter !== 'all') {
        list = list.filter((b) => b.physicalLocation === locationFilter);
      }
    }

    return list;
  }, [books, searchQuery, viewMode, statusFilter, locationFilter]);

  // 扫码新增一本书
  const handleBookScanned = async (newBook: PhysicalBookRecord) => {
    await saveBook(newBook);
    setBooks((prev) => [newBook, ...prev.filter((b) => b.id !== newBook.id)]);
    showToast('已录入书藏');
  };

  // 保存书籍变更
  const handleSaveBook = async (updated: PhysicalBookRecord) => {
    await saveBook(updated);
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    showToast('已保存修改');
  };

  // 删除图书
  const handleDeleteBook = async (id: string) => {
    await deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBook?.id === id) setSelectedBook(null);
    showToast('已移出书藏');
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: NM.bg,
        color: NM.textMain,
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans SC", sans-serif',
      }}
    >
      {/* 顶部轻拟物导航栏（对标番茄钟） */}
      <div
        style={{
          padding: '10px 16px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: NM.borderSoft,
          backgroundColor: NM.bg,
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* 圆形轻拟物返回按键 */}
          <button
            type="button"
            onClick={onBack}
            className="nm-btn nm-btn-circle"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: NM.textMain,
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexSm,
              border: NM.borderLight,
              cursor: 'pointer',
              padding: 0,
            }}
            title="返回桌面"
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* 拟物呼吸状态灯 */}
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: NM.primary,
                display: 'inline-block',
                boxShadow: '0 0 6px rgba(217, 119, 6, 0.6)',
              }}
            />
            <span style={{ fontSize: '1.12rem', fontWeight: 800, color: NM.textMain, letterSpacing: '0.4px' }}>
              书藏
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: NM.primaryDark,
                backgroundColor: NM.bgInset,
                boxShadow: NM.insetXs,
                padding: '2px 7px',
                borderRadius: 10,
              }}
            >
              轻拟物藏书
            </span>
          </div>
        </div>

        {/* 顶部连续扫码入口按键（温润琥珀轻拟物凸键） */}
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '7px 14px',
            borderRadius: 14,
            border: '1px solid rgba(255, 255, 255, 0.65)',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#FFFFFF',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '3px 4px 10px rgba(217, 119, 6, 0.35), -2px -2px 6px rgba(255, 255, 255, 0.8)',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <Scan size={15} strokeWidth={2.4} />
          <span>扫码录书</span>
        </button>
      </div>

      {/* 顶部藏书与估值总览卡片（轻拟物外凸大面板） */}
      <div style={{ padding: '8px 16px 6px' }}>
        <div
          style={{
            backgroundColor: NM.cardBg,
            border: NM.borderLight,
            borderRadius: 20,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            boxShadow: NM.convexSm,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: NM.primaryDark }}>
              {stats.totalBooks}
            </div>
            <div style={{ fontSize: '0.7rem', color: NM.textSub, marginTop: 2, fontWeight: 500 }}>
              藏书总数
            </div>
          </div>

          <div style={{ width: 1, height: 26, backgroundColor: 'rgba(198, 186, 162, 0.4)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: NM.primary }}>
              {stats.readingCount}
            </div>
            <div style={{ fontSize: '0.7rem', color: NM.textSub, marginTop: 2, fontWeight: 500 }}>
              在读研习
            </div>
          </div>

          <div style={{ width: 1, height: 26, backgroundColor: 'rgba(198, 186, 162, 0.4)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: NM.emerald }}>
              {stats.readCount}
            </div>
            <div style={{ fontSize: '0.7rem', color: NM.textSub, marginTop: 2, fontWeight: 500 }}>
              已读通览
            </div>
          </div>

          <div style={{ width: 1, height: 26, backgroundColor: 'rgba(198, 186, 162, 0.4)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: NM.blue }}>
              ¥{stats.totalEstimatedPrice}
            </div>
            <div style={{ fontSize: '0.7rem', color: NM.textSub, marginTop: 2, fontWeight: 500 }}>
              藏书估值
            </div>
          </div>
        </div>
      </div>

      {/* 搜索与多重视角分类切换（轻拟物内凹雕刻槽） */}
      <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* 快速搜索框（轻拟物内凹插槽） */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: NM.bgInset,
            boxShadow: NM.insetSm,
            border: '1px solid rgba(255, 255, 255, 0.65)',
            borderRadius: 14,
            padding: '7px 12px',
            gap: 8,
          }}
        >
          <Search size={15} color={NM.textMuted} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜书名 / 作者 / 物理位置 / ISBN…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.84rem',
              color: NM.textMain,
            }}
          />
        </div>

        {/* 视角切换主开关（对标番茄钟 Tab 胶囊切换槽） */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {/* 模式选择底槽 */}
          <div
            style={{
              display: 'flex',
              backgroundColor: NM.bgInset,
              boxShadow: NM.insetXs,
              borderRadius: 12,
              padding: 3,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('status')}
              style={{
                padding: '4px 10px',
                borderRadius: 9,
                border: 'none',
                backgroundColor: viewMode === 'status' ? NM.cardBg : 'transparent',
                boxShadow: viewMode === 'status' ? NM.convexXs : 'none',
                color: viewMode === 'status' ? NM.primaryDark : NM.textSub,
                fontWeight: viewMode === 'status' ? 700 : 500,
                fontSize: '0.74rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              阅读状态
            </button>
            <button
              type="button"
              onClick={() => setViewMode('location')}
              style={{
                padding: '4px 10px',
                borderRadius: 9,
                border: 'none',
                backgroundColor: viewMode === 'location' ? NM.cardBg : 'transparent',
                boxShadow: viewMode === 'location' ? NM.convexXs : 'none',
                color: viewMode === 'location' ? NM.primaryDark : NM.textSub,
                fontWeight: viewMode === 'location' ? 700 : 500,
                fontSize: '0.74rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              物理书架
            </button>
          </div>

          {/* 子分类活页轻拟物胶囊 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              padding: '2px 0',
            }}
          >
            {viewMode === 'status' ? (
              <>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 9px',
                    borderRadius: 10,
                    border: NM.borderLight,
                    backgroundColor: statusFilter === 'all' ? '#FFFBEB' : NM.cardBg,
                    boxShadow: statusFilter === 'all' ? NM.insetXs : NM.convexXs,
                    color: statusFilter === 'all' ? NM.primaryDark : NM.textSub,
                    fontSize: '0.72rem',
                    fontWeight: statusFilter === 'all' ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  全部 ({stats.totalBooks})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('reading')}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 9px',
                    borderRadius: 10,
                    border: NM.borderLight,
                    backgroundColor: statusFilter === 'reading' ? '#FFFBEB' : NM.cardBg,
                    boxShadow: statusFilter === 'reading' ? NM.insetXs : NM.convexXs,
                    color: statusFilter === 'reading' ? NM.primaryDark : NM.textSub,
                    fontSize: '0.72rem',
                    fontWeight: statusFilter === 'reading' ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  在读 ({stats.readingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('read')}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 9px',
                    borderRadius: 10,
                    border: NM.borderLight,
                    backgroundColor: statusFilter === 'read' ? '#ECFDF5' : NM.cardBg,
                    boxShadow: statusFilter === 'read' ? NM.insetXs : NM.convexXs,
                    color: statusFilter === 'read' ? '#047857' : NM.textSub,
                    fontSize: '0.72rem',
                    fontWeight: statusFilter === 'read' ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  已读 ({stats.readCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('unread')}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 9px',
                    borderRadius: 10,
                    border: NM.borderLight,
                    backgroundColor: statusFilter === 'unread' ? NM.bgInset : NM.cardBg,
                    boxShadow: statusFilter === 'unread' ? NM.insetXs : NM.convexXs,
                    color: statusFilter === 'unread' ? NM.textMain : NM.textSub,
                    fontSize: '0.72rem',
                    fontWeight: statusFilter === 'unread' ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  想读 ({stats.unreadCount})
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setLocationFilter('all')}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 9px',
                    borderRadius: 10,
                    border: NM.borderLight,
                    backgroundColor: locationFilter === 'all' ? '#FFFBEB' : NM.cardBg,
                    boxShadow: locationFilter === 'all' ? NM.insetXs : NM.convexXs,
                    color: locationFilter === 'all' ? NM.primaryDark : NM.textSub,
                    fontSize: '0.72rem',
                    fontWeight: locationFilter === 'all' ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  所有书架
                </button>
                {allLocations.map((loc) => {
                  const count = stats.locationCounts[loc] || 0;
                  const isActive = locationFilter === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocationFilter(loc)}
                      style={{
                        whiteSpace: 'nowrap',
                        padding: '4px 9px',
                        borderRadius: 10,
                        border: NM.borderLight,
                        backgroundColor: isActive ? '#FFFBEB' : NM.cardBg,
                        boxShadow: isActive ? NM.insetXs : NM.convexXs,
                        color: isActive ? NM.primaryDark : NM.textSub,
                        fontSize: '0.72rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {loc} ({count})
                    </button>
                  );
                })}

                {/* 管理书架快捷操作按键 */}
                <button
                  type="button"
                  onClick={() => setIsLocationManagerOpen(true)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 10px',
                    borderRadius: 10,
                    border: '1px solid rgba(217, 119, 6, 0.35)',
                    backgroundColor: '#FFFBEB',
                    boxShadow: NM.convexXs,
                    color: NM.primaryDark,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    flexShrink: 0,
                  }}
                  title="管理物理书架位置"
                >
                  <Settings size={12} />
                  <span>管理书架</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 图书卡片列表区（浅黄轻拟物卡片流） */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '4px 16px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {filteredBooks.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              color: NM.textSub,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                border: NM.borderLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: NM.primary,
              }}
            >
              <BookOpen size={28} strokeWidth={1.8} />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {searchQuery
                ? '未寻得匹配藏书，换个词试试'
                : '当前分类暂无藏书，快去扫码录入吧！'}
            </div>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '8px 18px',
                borderRadius: 14,
                border: '1px solid rgba(255, 255, 255, 0.65)',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '3px 4px 10px rgba(217, 119, 6, 0.35)',
                marginTop: 4,
              }}
            >
              <Scan size={15} />
              <span>扫码录书</span>
            </button>
          </div>
        ) : (
          filteredBooks.map((b) => (
            <BookShelfCard
              key={b.id}
              book={b}
              onClick={() => setSelectedBook(b)}
              onUpdateProgress={(book, delta) => {
                const next = Math.max(0, Math.min(book.pageCount, book.currentPage + delta));
                handleSaveBook({ ...book, currentPage: next });
              }}
            />
          ))
        )}
      </div>

      {/* 连续条码扫描器模态框 */}
      {isScannerOpen && (
        <ContinuousScannerModal
          onClose={() => setIsScannerOpen(false)}
          onBookScanned={handleBookScanned}
        />
      )}

      {/* 图书详情与进度调节模态框 */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onSave={handleSaveBook}
          onDelete={handleDeleteBook}
          onOpenLocationManager={() => setIsLocationManagerOpen(true)}
        />
      )}

      {/* 物理书架位置增删改模态框 */}
      {isLocationManagerOpen && (
        <LocationManagerModal
          locations={allLocations}
          locationCounts={stats.locationCounts}
          onClose={() => setIsLocationManagerOpen(false)}
          onAddLocation={handleAddLocation}
          onUpdateLocation={handleUpdateLocation}
          onDeleteLocation={handleDeleteLocation}
        />
      )}

      {/* 浮动 Toast 提示（<=5字轻拟物气泡） */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: NM.cardBg,
            color: NM.primaryDark,
            padding: '8px 18px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 700,
            zIndex: 2000,
            boxShadow: NM.convex,
            border: NM.borderLight,
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
