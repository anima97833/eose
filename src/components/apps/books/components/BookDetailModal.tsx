import React, { useState } from 'react';
import { X, MapPin, Star, Trash2, Check, BookOpen, Clock, Plus, Pencil, CheckCircle } from 'lucide-react';
import { PhysicalBookRecord, ReadingStatus } from '../../../../core/books/bookTypes';
import {
  getSavedPhysicalLocations,
  savePhysicalLocation,
  updatePhysicalLocation,
  deletePhysicalLocation,
} from '../../../../core/books/bookStorage';
import { NM } from '../bookNeumorphism';
import { generateFallbackBookCover } from '../../../../core/books/bookApi';
import { LocationManagerModal } from './LocationManagerModal';
import { Settings } from 'lucide-react';

interface BookDetailModalProps {
  book: PhysicalBookRecord;
  onClose: () => void;
  onSave: (updated: PhysicalBookRecord) => void;
  onDelete: (id: string) => void;
  onOpenLocationManager?: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onSave,
  onDelete,
}) => {
  // 可编辑基本信息
  const [title, setTitle] = useState<string>(book.title || '');
  const [author, setAuthor] = useState<string>(book.author || '');
  const [publisher, setPublisher] = useState<string>(book.publisher || '');
  const [price, setPrice] = useState<string>(book.price || '¥39.00');
  const [category, setCategory] = useState<string>(book.category || '藏书');
  const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(book.currentPage || 0);
  const [pageCount, setPageCount] = useState<number>(book.pageCount && book.pageCount > 0 ? book.pageCount : 200);
  const [status, setStatus] = useState<ReadingStatus>(book.status || 'unread');
  const [rating, setRating] = useState<number>(book.rating || 5);
  const [physicalLocation, setPhysicalLocation] = useState<string>(book.physicalLocation || '客厅书柜A1');
  const [notes, setNotes] = useState<string>(book.notes || '');

  // 物理书架快捷选项
  const [availableLocations, setAvailableLocations] = useState<string[]>(getSavedPhysicalLocations());
  const [isEditingCustomLoc, setIsEditingCustomLoc] = useState<boolean>(false);
  const [customLocInput, setCustomLocInput] = useState<string>('');
  const [isLocManagerOpen, setIsLocManagerOpen] = useState<boolean>(false);

  const handleLocAdd = (name: string) => {
    savePhysicalLocation(name);
    setAvailableLocations(getSavedPhysicalLocations());
  };

  const handleLocUpdate = async (oldName: string, newName: string) => {
    await updatePhysicalLocation(oldName, newName);
    setAvailableLocations(getSavedPhysicalLocations());
    if (physicalLocation === oldName) setPhysicalLocation(newName);
  };

  const handleLocDelete = async (name: string) => {
    await deletePhysicalLocation(name);
    setAvailableLocations(getSavedPhysicalLocations());
    if (physicalLocation === name) setPhysicalLocation('未归位');
  };

  const percent = pageCount > 0 ? Math.min(100, Math.round((currentPage / pageCount) * 100)) : 0;

  const handlePageChange = (val: number) => {
    const clamped = Math.max(0, Math.min(pageCount, val));
    setCurrentPage(clamped);
    if (clamped >= pageCount && pageCount > 0) {
      setStatus('read');
    } else if (clamped > 0 && status === 'unread') {
      setStatus('reading');
    }
  };

  const handleAddCustomLocation = () => {
    const clean = customLocInput.trim();
    if (clean) {
      savePhysicalLocation(clean);
      setAvailableLocations(getSavedPhysicalLocations());
      setPhysicalLocation(clean);
      setCustomLocInput('');
      setIsEditingCustomLoc(false);
    }
  };

  const handleSaveAll = () => {
    const cleanPrice = price.trim()
      ? price.trim().startsWith('¥')
        ? price.trim()
        : `¥${price.trim()}`
      : book.price || '¥39.00';

    const updated: PhysicalBookRecord = {
      ...book,
      title: title.trim() || book.title,
      author: author.trim() || book.author,
      publisher: publisher.trim() || book.publisher,
      price: cleanPrice,
      category: category.trim() || book.category,
      currentPage,
      pageCount,
      status,
      rating,
      physicalLocation,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 24, 16, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: NM.bg,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          maxHeight: '92%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(180, 160, 130, 0.45)',
          borderTop: NM.borderLight,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题与轻拟物按键 */}
        <div
          style={{
            padding: '16px 20px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: NM.borderSoft,
            backgroundColor: NM.bg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: NM.primaryDark,
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexXs,
                border: NM.borderLight,
                padding: '3px 10px',
                borderRadius: 12,
              }}
            >
              {book.category || '藏书'}
            </span>
            <span style={{ fontSize: '0.8rem', color: NM.textSub }}>
              ISBN: {book.isbn}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* 删除按键 */}
            <button
              type="button"
              onClick={() => onDelete(book.id)}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: NM.borderLight,
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
              title="移出书藏"
            >
              <Trash2 size={16} />
            </button>

            {/* 关闭按键 */}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: NM.borderLight,
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                color: NM.textSub,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
              title="关闭"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 主体轻拟物卡片流 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* 书籍头图与基本信息轻拟物外凸卡片 */}
          <div
            style={{
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexSm,
              border: NM.borderLight,
              borderRadius: 20,
              padding: '14px',
              display: 'flex',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 80,
                height: 116,
                borderRadius: 10,
                backgroundColor: NM.bgInset,
                flexShrink: 0,
                overflow: 'hidden',
                boxShadow: '3px 4px 10px rgba(180, 160, 130, 0.35), inset -2px 0 3px rgba(0,0,0,0.12)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: 6,
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.22) 0%, rgba(255,255,255,0.35) 45%, rgba(0,0,0,0.1) 100%)',
                  zIndex: 2,
                }}
              />
              <img
                src={book.coverUrl || generateFallbackBookCover(title || book.title, author || book.author)}
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  const fallback = generateFallbackBookCover(title || book.title, author || book.author);
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {!isEditingInfo ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '1.16rem',
                        fontWeight: 800,
                        color: NM.textMain,
                        lineHeight: 1.3,
                        wordBreak: 'break-word',
                      }}
                    >
                      {title || book.title}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: '3px 7px',
                        borderRadius: 8,
                        border: NM.borderLight,
                        backgroundColor: NM.cardBg,
                        boxShadow: NM.convexXs,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: NM.primary,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      title="修改书名、作者与定价"
                    >
                      <Pencil size={10} />
                      <span>改名/改价</span>
                    </button>
                  </div>

                  {book.subtitle && (
                    <div style={{ fontSize: '0.78rem', color: NM.textSub, marginTop: 2 }}>
                      {book.subtitle}
                    </div>
                  )}

                  <div style={{ fontSize: '0.84rem', color: NM.textSub, marginTop: 6, fontWeight: 600 }}>
                    {author || book.author} 著
                  </div>

                  <div style={{ fontSize: '0.78rem', color: NM.textMuted, marginTop: 2 }}>
                    {publisher || book.publisher} {book.pubDate ? `· ${book.pubDate}` : ''}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.84rem', color: NM.primaryDark, fontWeight: 700 }}>
                      定价：{price || book.price || '¥39.00'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: NM.textMuted }}>·</span>
                    <span style={{ fontSize: '0.82rem', color: NM.textSub, fontWeight: 700 }}>
                      全书共 {pageCount} 页
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: NM.textSub, marginBottom: 2 }}>
                      书名
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="修改书名"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '5px 8px',
                        borderRadius: 8,
                        border: NM.borderSoft,
                        backgroundColor: NM.bgInset,
                        boxShadow: NM.insetXs,
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: NM.textMain,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: NM.textSub, marginBottom: 2 }}>
                        作者
                      </label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="作者"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '5px 8px',
                          borderRadius: 8,
                          border: NM.borderSoft,
                          backgroundColor: NM.bgInset,
                          boxShadow: NM.insetXs,
                          fontSize: '0.78rem',
                          color: NM.textMain,
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: NM.textSub, marginBottom: 2 }}>
                        出版社
                      </label>
                      <input
                        type="text"
                        value={publisher}
                        onChange={(e) => setPublisher(e.target.value)}
                        placeholder="出版社"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '5px 8px',
                          borderRadius: 8,
                          border: NM.borderSoft,
                          backgroundColor: NM.bgInset,
                          boxShadow: NM.insetXs,
                          fontSize: '0.78rem',
                          color: NM.textMain,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* 价格与总页数编辑 (支持自定义) */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: NM.textSub, marginBottom: 2 }}>
                        定价 / 估值
                      </label>
                      <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="如 ¥45.00"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '5px 8px',
                          borderRadius: 8,
                          border: NM.borderSoft,
                          backgroundColor: NM.bgInset,
                          boxShadow: NM.insetXs,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: NM.primaryDark,
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: NM.textSub, marginBottom: 2 }}>
                        书籍总页数 (自定义)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={9999}
                        value={pageCount}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setPageCount(val);
                          if (currentPage > val) {
                            setCurrentPage(val);
                          }
                        }}
                        placeholder="如 320"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '5px 8px',
                          borderRadius: 8,
                          border: NM.borderSoft,
                          backgroundColor: NM.bgInset,
                          boxShadow: NM.insetXs,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: NM.textMain,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        backgroundColor: NM.primary,
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Check size={11} />
                      <span>完成编辑</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 1. 阅读状态选择器（轻拟物内凹底座 + 凸起胶囊按钮） */}
          <div
            style={{
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexSm,
              border: NM.borderLight,
              borderRadius: 20,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: NM.textMain }}>
              阅读状态
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                backgroundColor: NM.bgInset,
                boxShadow: NM.insetXs,
                borderRadius: 14,
                padding: 4,
              }}
            >
              <button
                type="button"
                onClick={() => setStatus('unread')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: status === 'unread' ? NM.cardBg : 'transparent',
                  boxShadow: status === 'unread' ? NM.convexXs : 'none',
                  color: status === 'unread' ? NM.textMain : NM.textSub,
                  fontSize: '0.82rem',
                  fontWeight: status === 'unread' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <Clock size={14} />
                <span>想读</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('reading')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: status === 'reading' ? NM.cardBg : 'transparent',
                  boxShadow: status === 'reading' ? NM.convexXs : 'none',
                  color: status === 'reading' ? NM.primaryDark : NM.textSub,
                  fontSize: '0.82rem',
                  fontWeight: status === 'reading' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <BookOpen size={14} />
                <span>在读中</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('read');
                  setCurrentPage(pageCount);
                }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: status === 'read' ? NM.cardBg : 'transparent',
                  boxShadow: status === 'read' ? NM.convexXs : 'none',
                  color: status === 'read' ? NM.emerald : NM.textSub,
                  fontSize: '0.82rem',
                  fontWeight: status === 'read' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <Check size={14} />
                <span>已读完</span>
              </button>
            </div>
          </div>

          {/* 2. 阅读进度调节器（如果书目为“想读”，则不出现阅读进度；如果在读或已读，才出现阅读进度） */}
          {status === 'unread' ? (
            <div
              style={{
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                border: NM.borderLight,
                borderRadius: 20,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetXs,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: NM.primaryDark,
                    flexShrink: 0,
                  }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: NM.textMain }}>
                    当前处于「想读」心愿单
                  </div>
                  <div style={{ fontSize: '0.72rem', color: NM.textSub, marginTop: 2 }}>
                    暂无阅读进度 · 切换为在读后将开启页码记录
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatus('reading');
                  if (currentPage === 0) setCurrentPage(1);
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: '#FFFFFF',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  flexShrink: 0,
                }}
              >
                <BookOpen size={13} />
                <span>开启在读</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                border: NM.borderLight,
                borderRadius: 20,
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: NM.textMain }}>
                  阅读进度
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: NM.primaryDark }}>
                    {currentPage}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: NM.textSub, fontWeight: 700 }}>/</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={pageCount}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setPageCount(val);
                        if (currentPage > val) {
                          setCurrentPage(val);
                        }
                      }}
                      title="点击直接自定义修改全书总页数"
                      style={{
                        width: 52,
                        padding: '2px 4px',
                        borderRadius: 6,
                        border: NM.borderSoft,
                        backgroundColor: NM.bgInset,
                        boxShadow: NM.insetXs,
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: NM.primaryDark,
                        textAlign: 'center',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.78rem', color: NM.textSub, fontWeight: 600 }}>页</span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: NM.textMuted, fontWeight: 600 }}>
                    ({percent}%)
                  </span>
                </div>
              </div>

              {/* 滑动调节尺 */}
              <input
                type="range"
                min={0}
                max={pageCount}
                value={currentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: NM.primary,
                  cursor: 'pointer',
                }}
              />

              {/* 步进触觉按键 */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 10)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 10,
                    border: NM.borderLight,
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexXs,
                    color: NM.textSub,
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  -10页
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 10)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 10,
                    border: NM.borderLight,
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexXs,
                    color: NM.textSub,
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  +10页
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 50)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 10,
                    border: NM.borderLight,
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexXs,
                    color: NM.textSub,
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  +50页
                </button>
              </div>
            </div>
          )}

          {/* 3. 物理存放书架位置标记 */}
          <div
            style={{
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexSm,
              border: NM.borderLight,
              borderRadius: 20,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: NM.textMain, display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={15} color={NM.primary} />
                物理存放位置
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsLocManagerOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: NM.primaryDark,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  title="管理书架位置"
                >
                  <Settings size={13} />
                  <span>管理</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingCustomLoc(!isEditingCustomLoc)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: NM.primaryDark,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Plus size={13} />
                  <span>新位置</span>
                </button>
              </div>
            </div>

            {/* 快速选择已有书架 */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {availableLocations.map((loc) => {
                const isSelected = physicalLocation === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setPhysicalLocation(loc)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 10,
                      border: NM.borderLight,
                      backgroundColor: isSelected ? '#FFFBEB' : NM.cardBg,
                      boxShadow: isSelected ? NM.insetXs : NM.convexXs,
                      color: isSelected ? NM.primaryDark : NM.textSub,
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>

            {/* 自定义位置输入插槽 */}
            {isEditingCustomLoc && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 6,
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                <input
                  type="text"
                  value={customLocInput}
                  onChange={(e) => setCustomLocInput(e.target.value)}
                  placeholder="如: 书房转角格、主卧二层…"
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    color: NM.textMain,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomLocation}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)',
                  }}
                >
                  添加
                </button>
              </div>
            )}
          </div>

          {/* 4. 个人评分与随笔笔记 */}
          <div
            style={{
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexSm,
              border: NM.borderLight,
              borderRadius: 20,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: NM.textMain }}>
                个人评分
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 2,
                      cursor: 'pointer',
                      transform: star <= rating ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <Star
                      size={20}
                      color={star <= rating ? '#F59E0B' : '#C7BBA5'}
                      fill={star <= rating ? '#F59E0B' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: NM.textMain, marginTop: 4 }}>
              读书笔记 / 随笔摘要
            </div>

            {/* 轻拟物内凹输入槽 */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="随手记下这本书的金句、读后感或待查要点…"
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid rgba(255, 255, 255, 0.65)',
                borderRadius: 14,
                padding: '10px 12px',
                fontSize: '0.84rem',
                color: NM.textMain,
                backgroundColor: NM.bgInset,
                boxShadow: NM.insetSm,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* 底部轻拟物保存操作栏 */}
        <div
          style={{
            padding: '12px 20px 20px',
            borderTop: NM.borderSoft,
            backgroundColor: NM.bg,
            display: 'flex',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: 16,
              border: NM.borderLight,
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexSm,
              color: NM.textSub,
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            style={{
              flex: 1.5,
              padding: '12px 0',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.65)',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '3px 4px 10px rgba(217, 119, 6, 0.35), -2px -2px 6px rgba(255, 255, 255, 0.8)',
            }}
          >
            保存修改
          </button>
        </div>

        {/* 物理书架编辑/删除管理模态框 */}
        {isLocManagerOpen && (
          <LocationManagerModal
            locations={availableLocations}
            locationCounts={{ [physicalLocation]: 1 }}
            onClose={() => setIsLocManagerOpen(false)}
            onAddLocation={handleLocAdd}
            onUpdateLocation={handleLocUpdate}
            onDeleteLocation={handleLocDelete}
          />
        )}
      </div>
    </div>
  );
};
