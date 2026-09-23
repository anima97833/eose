import React, { useState } from 'react';
import { X, BookPlus, MapPin, Check, Plus } from 'lucide-react';
import { PhysicalBookRecord, ReadingStatus } from '../../../../core/books/bookTypes';
import { getSavedPhysicalLocations, savePhysicalLocation } from '../../../../core/books/bookStorage';
import { NM } from '../bookNeumorphism';

interface ManualBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (book: PhysicalBookRecord) => void;
}

const DEFAULT_CATEGORIES = ['文学', '社科', '历史', '科技', '艺术', '经管', '哲学', '生活', '其它'];

export const ManualBookModal: React.FC<ManualBookModalProps> = ({
  isOpen,
  onClose,
  onBookAdded,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [price, setPrice] = useState('39.00');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('文学');
  const [pageCount, setPageCount] = useState(280);
  const [status, setStatus] = useState<ReadingStatus>('unread');
  
  // 书架位置管理
  const [savedLocations, setSavedLocations] = useState<string[]>(getSavedPhysicalLocations());
  const [location, setLocation] = useState<string>(savedLocations[0] || '客厅书柜A1');
  const [isAddingLoc, setIsAddingLoc] = useState(false);
  const [newLocInput, setNewLocInput] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddNewLoc = () => {
    const clean = newLocInput.trim();
    if (clean) {
      savePhysicalLocation(clean);
      const updated = getSavedPhysicalLocations();
      setSavedLocations(updated);
      setLocation(clean);
      setNewLocInput('');
      setIsAddingLoc(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('请输入书名');
      return;
    }

    const cleanIsbn = isbn.trim() || `MANUAL-${Date.now().toString().slice(-8)}`;
    const cleanPrice = price.trim()
      ? price.trim().startsWith('¥')
        ? price.trim()
        : `¥${price.trim()}`
      : '¥39.00';

    const newBook: PhysicalBookRecord = {
      id: `b_manual_${Date.now()}`,
      isbn: cleanIsbn,
      title: title.trim(),
      author: author.trim() || '佚名',
      publisher: publisher.trim() || '待补充出版社',
      category: category || '藏书',
      pageCount: Number(pageCount) || 280,
      currentPage: status === 'read' ? (Number(pageCount) || 280) : 0,
      status,
      physicalLocation: location || '未归位',
      price: cleanPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onBookAdded(newBook);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 24, 16, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '88vh',
          backgroundColor: NM.bg,
          borderRadius: 24,
          boxShadow: NM.convexLg,
          border: NM.borderLight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: NM.borderSoft,
            backgroundColor: NM.bg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
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
              <BookPlus size={16} strokeWidth={2.4} />
            </div>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: NM.textMain }}>
                手动录入书籍
              </span>
              <div style={{ fontSize: '0.68rem', color: NM.textMuted }}>
                支持无码老书、自制本、特殊藏书建档
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
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
          >
            <X size={16} />
          </button>
        </div>

        {/* 表单内容区 */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {errorMsg && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* 书名 (必填) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: NM.textSub, marginBottom: 5 }}>
              书名 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="例如：《百年孤独》"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: 12,
                border: NM.borderSoft,
                backgroundColor: NM.bgInset,
                boxShadow: NM.insetSm,
                color: NM.textMain,
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
              }}
              autoFocus
            />
          </div>

          {/* 作者与出版社 */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: NM.textSub, marginBottom: 5 }}>
                作者 / 译者
              </label>
              <input
                type="text"
                placeholder="例如：马尔克斯"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: 12,
                  border: NM.borderSoft,
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  color: NM.textMain,
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: NM.textSub, marginBottom: 5 }}>
                出版社
              </label>
              <input
                type="text"
                placeholder="例如：南海出版公司"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: 12,
                  border: NM.borderSoft,
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  color: NM.textMain,
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* 物理书架位置 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: NM.textSub }}>
                物理书架位置
              </label>
              <button
                type="button"
                onClick={() => setIsAddingLoc(!isAddingLoc)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: NM.primary,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Plus size={12} />
                <span>新建位置</span>
              </button>
            </div>

            {isAddingLoc && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="如：书房B3层、床头柜"
                  value={newLocInput}
                  onChange={(e) => setNewLocInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: 10,
                    border: NM.borderSoft,
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetXs,
                    fontSize: '0.8rem',
                    color: NM.textMain,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddNewLoc}
                  style={{
                    padding: '0 12px',
                    borderRadius: 10,
                    backgroundColor: NM.primary,
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  添加
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {savedLocations.map((loc) => {
                const isSelected = location === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 10,
                      border: NM.borderLight,
                      backgroundColor: isSelected ? NM.primary : NM.cardBg,
                      color: isSelected ? '#FFFFFF' : NM.textSub,
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      boxShadow: isSelected ? NM.convexXs : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <MapPin size={11} />
                    <span>{loc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 藏书分类、总页数与定价 */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: NM.textSub, marginBottom: 5 }}>
                图书分类
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 10px',
                  borderRadius: 12,
                  border: NM.borderSoft,
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  color: NM.textMain,
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: 85 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: NM.textSub, marginBottom: 5 }}>
                总页数
              </label>
              <input
                type="number"
                min={1}
                max={9999}
                value={pageCount}
                onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 8px',
                  borderRadius: 12,
                  border: NM.borderSoft,
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  color: NM.textMain,
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ width: 95 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: NM.textSub, marginBottom: 5 }}>
                定价 (元)
              </label>
              <input
                type="text"
                placeholder="如 39.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 8px',
                  borderRadius: 12,
                  border: NM.borderSoft,
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  color: NM.primaryDark,
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* 阅读初始状态 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: NM.textSub, marginBottom: 5 }}>
              阅读状态
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'unread', label: '想读 / 未读' },
                { id: 'reading', label: '在读中' },
                { id: 'read', label: '已读完' },
              ].map((s) => {
                const isSelected = status === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id as ReadingStatus)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 10,
                      border: NM.borderLight,
                      backgroundColor: isSelected ? NM.bgInset : NM.cardBg,
                      boxShadow: isSelected ? NM.insetXs : NM.convexXs,
                      color: isSelected ? NM.primaryDark : NM.textSub,
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 800 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 选填 ISBN */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: NM.textMuted, marginBottom: 4 }}>
              ISBN 编号 (选填，留空将自动生成专有编号)
            </label>
            <input
              type="text"
              placeholder="如无条形码可留空"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '7px 10px',
                borderRadius: 10,
                border: NM.borderSoft,
                backgroundColor: NM.bgInset,
                boxShadow: NM.insetXs,
                color: NM.textSub,
                fontSize: '0.78rem',
                outline: 'none',
              }}
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            style={{
              marginTop: 6,
              padding: '12px 0',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.65)',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '3px 4px 10px rgba(217, 119, 6, 0.35), -2px -2px 6px rgba(255, 255, 255, 0.8)',
            }}
          >
            确认收入书藏
          </button>
        </form>
      </div>
    </div>
  );
};
