import React, { useState } from 'react';
import {
  Mic,
  Camera,
  Sparkles,
  Plus,
  Trash2,
  X,
  Globe,
  Check,
} from 'lucide-react';
import { ShortcutItem } from './browserStorage';

interface ChromeNewTabProps {
  shortcuts: ShortcutItem[];
  onNavigate: (url: string, title?: string) => void;
  onAddShortcut: (newSc: ShortcutItem) => void;
  onDeleteShortcut: (id: string) => void;
}

const PALETTE = [
  '#6B4E7D',
  '#4D7298',
  '#588157',
  '#9E2A2B',
  '#3D5A80',
  '#B56576',
  '#2A9D8F',
  '#E76F51',
];

export const ChromeNewTab: React.FC<ChromeNewTabProps> = ({
  shortcuts,
  onNavigate,
  onAddShortcut,
  onDeleteShortcut,
}) => {
  const [query, setQuery] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.trim();
    if (q.startsWith('http://') || q.startsWith('https://')) {
      onNavigate(q);
    } else {
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(q)}`, `${q} - Anima 探索`);
    }
  };

  const handleCreateShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    const randomColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const item: ShortcutItem = {
      id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: newTitle.trim(),
      url,
      letter: newTitle.trim().slice(0, 2).toUpperCase(),
      bgColor: randomColor,
      textColor: '#FFFFFF',
      createdAt: Date.now(),
    };
    onAddShortcut(item);
    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#FAF9FD',
        backgroundImage: 'radial-gradient(circle at 50% 12%, #F5EFFB 0%, #FAF9FD 75%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* 顶部状态角 */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          fontSize: '11px',
          color: '#655A73',
          marginBottom: '20px',
        }}
      >
        <span
          style={{ cursor: 'pointer', fontWeight: 500 }}
          onClick={() => onNavigate('https://mail.google.com', 'Mail')}
        >
          Mail
        </span>
        <span
          style={{ cursor: 'pointer', fontWeight: 500 }}
          onClick={() => onNavigate('https://images.google.com', 'Images')}
        >
          Images
        </span>
        {/* 头像圆点 */}
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(139, 92, 246, 0.35)',
          }}
        >
          A
        </div>
      </div>

      {/* Anima 艺术大 Logo */}
      <div style={{ marginTop: '10px', marginBottom: '22px', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Outfit', 'Product Sans', 'Inter', -apple-system, sans-serif",
            fontSize: '52px',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            margin: 0,
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #583768 0%, #8B5CF6 55%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1px',
            filter: 'drop-shadow(0 2px 8px rgba(139, 92, 246, 0.15))',
          }}
        >
          <span>A</span>
          <span>n</span>
          <span>i</span>
          <span>m</span>
          <span>a</span>
        </h1>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#8C77A0',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginTop: '3px',
          }}
        >
          AI Explore · 网络探索
        </div>
      </div>

      {/* 核心搜索框胶囊 (Ask Anima or type a URL) */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          width: '100%',
          maxWidth: '380px',
          borderRadius: '26px',
          backgroundColor: '#FFFFFF',
          boxShadow: isAiMode
            ? '0 4px 20px rgba(139, 92, 246, 0.28), 0 0 0 2px #A78BFA'
            : '0 3px 12px rgba(120, 100, 140, 0.12), 0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid rgba(220, 210, 235, 0.8)',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          marginBottom: '26px',
        }}
      >
        <button
          type="button"
          style={{
            border: 'none',
            background: 'none',
            color: isAiMode ? '#8B5CF6' : '#766D82',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Plus size={16} />
        </button>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isAiMode ? '✨ 向 Anima AI 提出任何灵感或问题...' : 'Ask Anima or type a URL'}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: '#2D2833',
            backgroundColor: 'transparent',
          }}
        />

        {/* 语音图标 */}
        <button
          type="button"
          onClick={() => setQuery('今天天气与科技动态')}
          style={{
            border: 'none',
            background: 'none',
            color: '#766D82',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="语音输入"
        >
          <Mic size={16} />
        </button>

        {/* 镜头识图图标 */}
        <button
          type="button"
          onClick={() => setQuery('Anima Lens')}
          style={{
            border: 'none',
            background: 'none',
            color: '#766D82',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Anima 识图"
        >
          <Camera size={16} />
        </button>

        {/* ✨ AI Mode 切换小胶囊 */}
        <button
          type="button"
          onClick={() => setIsAiMode(!isAiMode)}
          style={{
            border: 'none',
            borderRadius: '16px',
            backgroundColor: isAiMode ? '#8B5CF6' : '#F1EDF8',
            color: isAiMode ? '#FFFFFF' : '#6A4D80',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            transition: 'all 0.2s ease',
          }}
        >
          <Sparkles size={12} />
          <span>AI Mode</span>
        </button>
      </form>

      {/* 快捷网站区域：初始固定为空，用户自主添加，支持删除且永久保存在 IndexedDB */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {shortcuts.length > 0 ? (
          <>
            {/* 快捷方式网格 */}
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '14px 6px',
                justifyItems: 'center',
              }}
            >
              {shortcuts.map((sc) => (
                <div
                  key={sc.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    width: '58px',
                    position: 'relative',
                  }}
                >
                  {/* 删除角标按键 (编辑模式下直接常驻，点击立即从 IndexedDB 移除) */}
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteShortcut(sc.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '3px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        border: '1.5px solid #FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                      title={`删除 ${sc.title}`}
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  )}

                  {/* 拟物圆形图标底座 */}
                  <div
                    onClick={() => onNavigate(sc.url, sc.title)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: sc.bgColor || '#6B4E7D',
                      color: sc.textColor || '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: 800,
                      boxShadow:
                        '0 3px 8px rgba(100, 80, 120, 0.12), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 3px rgba(255,255,255,0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.7)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <span>{sc.letter}</span>
                  </div>

                  {/* 快捷方式文本标题 */}
                  <span
                    onClick={() => onNavigate(sc.url, sc.title)}
                    style={{
                      fontSize: '10px',
                      color: '#4B4255',
                      textAlign: 'center',
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 500,
                    }}
                    title={sc.title}
                  >
                    {sc.title}
                  </span>
                </div>
              ))}

              {/* 阵列内快捷添加小圆盘 */}
              <div
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  width: '58px',
                }}
                title="添加新快捷网站"
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(235, 230, 245, 0.7)',
                    color: '#76628A',
                    border: '1px dashed rgba(160, 140, 185, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Plus size={18} />
                </div>
                <span style={{ fontSize: '10px', color: '#76628A', fontWeight: 600 }}>添加网站</span>
              </div>
            </div>

            {/* 编辑/删除模式切换 */}
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                style={{
                  border: 'none',
                  borderRadius: '14px',
                  backgroundColor: isEditMode ? '#EF4444' : 'rgba(235, 230, 245, 0.75)',
                  color: isEditMode ? '#FFFFFF' : '#654C75',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                {isEditMode ? <Check size={12} /> : <Trash2 size={12} />}
                <span>{isEditMode ? '完成' : '删除管理'}</span>
              </button>
            </div>
          </>
        ) : (
          /* 初始状态为空时的极简提示与添加卡片 */
          <div
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '16px 24px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              border: '1px dashed rgba(160, 140, 185, 0.7)',
              boxShadow: '0 2px 8px rgba(120, 100, 140, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: '#654C75',
              transition: 'all 0.15s ease',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#F0EAF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8B5CF6',
              }}
            >
              <Plus size={16} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#3E2F4C' }}>
                添加常用快捷网站
              </div>
              <div style={{ fontSize: '10px', color: '#8C77A0', marginTop: '1px' }}>
                点击添加并永久保存在本地数据库中
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 轻量快捷添加弹窗 */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '300px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#3A2E47' }}>
                添加快捷网站
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8C77A0' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateShortcut} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#665C73', fontWeight: 600 }}>网站名称</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：百度、GitHub、维基百科"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #D5CCE0',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginTop: '4px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#665C73', fontWeight: 600 }}>网址 (URL)</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #D5CCE0',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginTop: '4px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '10px',
                    border: '1px solid #D5CCE0',
                    backgroundColor: '#F5F2F8',
                    color: '#554A63',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#8B5CF6',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 8px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  保存至 IndexedDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
