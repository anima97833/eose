import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Star,
  ExternalLink,
  ShieldCheck,
  Search,
  X,
  Globe,
  Folder,
  Compass,
} from 'lucide-react';
import { ChromeNewTab } from './ChromeNewTab';
import {
  loadShortcuts,
  saveShortcut,
  deleteShortcut,
  ShortcutItem,
  addHistory,
} from './browserStorage';

interface BrowserAppProps {
  onBack?: () => void;
}

const PRESET_BOOKMARKS = [
  { title: '维基百科', url: 'https://zh.wikipedia.org' },
  { title: '百度搜索', url: 'https://www.baidu.com' },
  { title: 'Bing必应', url: 'https://cn.bing.com' },
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'Bilibili', url: 'https://www.bilibili.com' },
];

export const BrowserApp: React.FC<BrowserAppProps> = ({ onBack }) => {
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>([]);
  const [isNewTab, setIsNewTab] = useState<boolean>(true);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>('新标签页');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // 初始化从 IndexedDB 加载快捷网站（初始固定为空，用户自主添加）
  useEffect(() => {
    const fetchShortcuts = async () => {
      const items = await loadShortcuts();
      setShortcuts(items);
    };
    fetchShortcuts();
  }, []);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // 导航至指定 URL 或搜索词
  const handleNavigate = (target: string, title?: string) => {
    let finalUrl = target.trim();
    if (!finalUrl) return;

    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = `https://${finalUrl}`;
      } else {
        // 搜索模式：默认 Google，支持 Bing / 百度
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
      }
    }

    setIsLoading(true);
    setIsNewTab(false);
    setCurrentUrl(finalUrl);
    setInputUrl(finalUrl);
    setPageTitle(title || finalUrl);

    // 维护前进后退历史
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(finalUrl);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);

    // 记录到本地 IndexedDB
    addHistory(finalUrl, title);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigate(inputUrl);
  };

  const handleGoHome = () => {
    setIsNewTab(true);
    setCurrentUrl('');
    setInputUrl('');
    setPageTitle('新标签页');
    setIsLoading(false);
  };

  const handleBackNav = () => {
    if (historyIndex > 0) {
      const prevUrl = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(prevUrl);
      setInputUrl(prevUrl);
      setIsNewTab(false);
      setIsLoading(true);
    } else {
      handleGoHome();
    }
  };

  const handleForwardNav = () => {
    if (historyIndex < history.length - 1) {
      const nextUrl = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(nextUrl);
      setInputUrl(nextUrl);
      setIsNewTab(false);
      setIsLoading(true);
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const handleAddShortcut = async (item: ShortcutItem) => {
    await saveShortcut(item);
    const updated = await loadShortcuts();
    setShortcuts(updated);
  };

  const handleDeleteShortcut = async (id: string) => {
    await deleteShortcut(id);
    const updated = await loadShortcuts();
    setShortcuts(updated);
  };

  const handleOpenExternal = () => {
    const target = currentUrl || 'https://www.google.com';
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FAF9FD',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* 1. Chrome 极简浅紫主题顶栏 (Chrome Header) */}
      <div
        style={{
          backgroundColor: '#F3EEF8',
          borderBottom: '1px solid rgba(220, 210, 235, 0.8)',
          padding: '8px 10px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: '0 2px 6px rgba(100, 80, 120, 0.05)',
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        {/* 地址栏与主控制按键排 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* 返回小手机桌面按键 */}
          <button
            type="button"
            onClick={onBack}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(235, 230, 245, 0.9)',
              color: '#524366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="退出网络探索返回桌面"
          >
            <ArrowLeft size={16} />
          </button>

          {/* 前进后退与主页 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleBackNav}
              disabled={isNewTab && historyIndex <= 0}
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                background: 'none',
                color: isNewTab && historyIndex <= 0 ? '#C4BDD0' : '#4B3F5C',
                cursor: isNewTab && historyIndex <= 0 ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
              title="后退"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleForwardNav}
              disabled={historyIndex >= history.length - 1}
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                background: 'none',
                color: historyIndex >= history.length - 1 ? '#C4BDD0' : '#4B3F5C',
                cursor: historyIndex >= history.length - 1 ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
              title="前进"
            >
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={handleReload}
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                background: 'none',
                color: '#4B3F5C',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
              title="刷新页面"
            >
              <RotateCcw size={13} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={handleGoHome}
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                background: 'none',
                color: isNewTab ? '#8B5CF6' : '#4B3F5C',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
              title="返回 Anima 首页"
            >
              <Home size={14} />
            </button>
          </div>

          {/* Anima 风格 Omnibox 胶囊地址栏 */}
          <form
            onSubmit={handleInputSubmit}
            style={{
              flex: 1,
              height: '32px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(215, 205, 230, 0.9)',
              boxShadow: 'inset 0 1px 2px rgba(100, 80, 120, 0.08)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              gap: '6px',
            }}
          >
            {/* Anima 'A' 彩色标志或小锁安全标志 */}
            {isNewTab ? (
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '13px',
                  color: '#8B5CF6',
                  fontFamily: "'Outfit', 'Product Sans', sans-serif",
                }}
              >
                A
              </span>
            ) : (
              <ShieldCheck size={14} color="#10B981" />
            )}

            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Ask Anima or type a URL"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                color: '#2B2338',
                backgroundColor: 'transparent',
                width: '100%',
              }}
            />

            {inputUrl && (
              <button
                type="button"
                onClick={() => setInputUrl('')}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#A29AA8',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              style={{
                border: 'none',
                background: 'none',
                color: isBookmarked ? '#F59E0B' : '#A29AA8',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
              }}
              title="收藏此网页"
            >
              <Star size={14} fill={isBookmarked ? '#F59E0B' : 'none'} />
            </button>
          </form>

          {/* 真实新窗口弹出独立冲浪按钮 */}
          <button
            type="button"
            onClick={handleOpenExternal}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(235, 230, 245, 0.9)',
              color: '#524366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="在真实浏览器新窗口中打开此网页"
          >
            <ExternalLink size={14} />
          </button>
        </div>

        {/* 书签快捷栏 (Bookmarks Bar) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
            fontSize: '11px',
            color: '#4B3F5C',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '6px',
              backgroundColor: 'rgba(235, 230, 245, 0.6)',
              cursor: 'pointer',
              flexShrink: 0,
              fontWeight: 600,
            }}
          >
            <Folder size={12} color="#7E689B" />
            <span>All Bookmarks</span>
          </div>

          {PRESET_BOOKMARKS.map((bm) => (
            <div
              key={bm.url}
              onClick={() => handleNavigate(bm.url, bm.title)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(220, 210, 235, 0.6)',
                cursor: 'pointer',
                flexShrink: 0,
                fontSize: '10.5px',
              }}
            >
              <Globe size={11} color="#8E78A8" />
              <span>{bm.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chrome 顶部加载进度线 */}
      {isLoading && (
        <div
          style={{
            height: '2.5px',
            width: '100%',
            backgroundColor: '#E6DCF5',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '65%',
              backgroundColor: '#8B5CF6',
              animation: 'pulse 1s infinite',
            }}
          />
        </div>
      )}

      {/* 2. 主视窗内容区 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {isNewTab ? (
          <ChromeNewTab
            shortcuts={shortcuts}
            onNavigate={handleNavigate}
            onAddShortcut={handleAddShortcut}
            onDeleteShortcut={handleDeleteShortcut}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 防同源策略保护提示横幅 */}
            <div
              style={{
                backgroundColor: '#FAF5FF',
                borderBottom: '1px solid #E9D8FD',
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#6B46C1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <Compass size={13} className="shrink-0" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  已载入: {currentUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenExternal}
                style={{
                  border: 'none',
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  flexShrink: 0,
                  marginLeft: '8px',
                }}
              >
                <span>新窗口全尺寸打开</span>
                <ExternalLink size={10} />
              </button>
            </div>

            {/* 真实网页 Iframe 视口 */}
            <iframe
              ref={iframeRef}
              src={currentUrl}
              title={pageTitle}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              style={{
                width: '100%',
                flex: 1,
                border: 'none',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
