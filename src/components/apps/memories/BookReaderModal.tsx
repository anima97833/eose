import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MemoryBookRecord } from '../../../core/storage/db';
import {
  ArrowLeft,
  Search,
  Download,
  Trash2,
  BookOpen,
  MessageSquareText,
  FileText,
  Calendar,
  Layers,
  Check,
} from 'lucide-react';

interface BookReaderModalProps {
  book: MemoryBookRecord;
  onClose: () => void;
  onDeleteBook: (id: string) => void;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({
  book,
  onClose,
  onDeleteBook,
}) => {
  const [viewMode, setViewMode] = useState<'chat' | 'story'>('chat');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // 过滤消息
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return book.messages;
    const q = searchQuery.toLowerCase();
    return book.messages.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        (m.name && m.name.toLowerCase().includes(q))
    );
  }, [book.messages, searchQuery]);

  // 导出为 TXT 纯文本
  const handleExportTxt = () => {
    const lines = [
      `========================================`,
      `书名：《${book.title}》`,
      `对谈角色：${book.characterName}`,
      `收录日期：${new Date(book.createdAt).toLocaleString('zh-CN')}`,
      `总对白数：${book.messageCount} 条 | 总字数：约 ${book.totalWords} 字`,
      `========================================\n`,
    ];

    book.messages.forEach((m) => {
      const timeStr = m.timestamp
        ? new Date(m.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
      const speaker = m.sender === 'user' ? '你' : m.name || book.characterName;
      lines.push(`[${timeStr}] ${speaker}：\n${m.content}\n`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title}_回忆手记.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已成功导出 TXT 文本！');
  };

  // 导出为 JSON 备份
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(book, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title}_聊天备份.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已成功导出 JSON 备份！');
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--nm-bg)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.22s ease-out',
      }}
    >
      {/* 顶部轻拟物控制栏 */}
      <div
        className="nm-card-sm"
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: 0,
          backgroundColor: 'rgba(235, 240, 248, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="nm-btn nm-btn-circle"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--nm-text)',
              border: 'none',
              cursor: 'pointer',
            }}
            title="返回书架"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--nm-text)',
                maxWidth: '150px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {book.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--nm-text-sub)' }}>
              与 {book.characterName} · {book.messageCount} 条记录
            </div>
          </div>
        </div>

        {/* 右侧操作功能 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* 模式切换 (对白流 / 手记体) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(215, 225, 238, 0.75)',
              borderRadius: '16px',
              padding: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('chat')}
              style={{
                border: 'none',
                background: viewMode === 'chat' ? 'var(--nm-bg)' : 'transparent',
                boxShadow:
                  viewMode === 'chat'
                    ? '2px 2px 6px rgba(160, 175, 195, 0.5), -2px -2px 6px rgba(255, 255, 255, 0.9)'
                    : 'none',
                color: viewMode === 'chat' ? '#5096C6' : 'var(--nm-text-sub)',
                borderRadius: '14px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
              title="仿真对话流"
            >
              <MessageSquareText size={13} />
              <span>对白</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('story')}
              style={{
                border: 'none',
                background: viewMode === 'story' ? 'var(--nm-bg)' : 'transparent',
                boxShadow:
                  viewMode === 'story'
                    ? '2px 2px 6px rgba(160, 175, 195, 0.5), -2px -2px 6px rgba(255, 255, 255, 0.9)'
                    : 'none',
                color: viewMode === 'story' ? '#5096C6' : 'var(--nm-text-sub)',
                borderRadius: '14px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
              title="文学手记流"
            >
              <BookOpen size={13} />
              <span>手记</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="nm-btn nm-btn-circle"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showSearch ? '#5096C6' : 'var(--nm-text-sub)',
              border: 'none',
              cursor: 'pointer',
            }}
            title="搜索对话"
          >
            <Search size={15} />
          </button>

          <button
            type="button"
            onClick={handleExportTxt}
            className="nm-btn nm-btn-circle"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--nm-text-sub)',
              border: 'none',
              cursor: 'pointer',
            }}
            title="导出文本"
          >
            <Download size={15} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`确定要从书架上移出《${book.title}》吗？`)) {
                onDeleteBook(book.id);
                onClose();
              }
            }}
            className="nm-btn nm-btn-circle"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--nm-accent-red)',
              border: 'none',
              cursor: 'pointer',
            }}
            title="放回仓库/删除"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* 搜索过滤栏 */}
      {showSearch && (
        <div
          style={{
            padding: '8px 14px',
            backgroundColor: 'rgba(230, 236, 245, 0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Search size={14} color="var(--nm-text-sub)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索回忆中的句子或关键词..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '12px',
              color: 'var(--nm-text)',
            }}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                border: 'none',
                background: 'none',
                fontSize: '11px',
                color: 'var(--nm-text-sub)',
                cursor: 'pointer',
              }}
            >
              清空
            </button>
          )}
        </div>
      )}

      {/* 提示 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '64px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(50, 65, 85, 0.92)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 99999,
          }}
        >
          <Check size={14} color="#52c41a" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 核心阅读区 */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 14px 20px',
          backgroundColor: viewMode === 'story' ? '#FDFBF7' : 'transparent',
          boxSizing: 'border-box',
          transition: 'background-color 0.25s ease',
        }}
      >
        {/* 书本前言/卷首语名牌 */}
        <div
          style={{
            marginBottom: '20px',
            padding: '14px 16px',
            borderRadius: '16px',
            backgroundColor:
              viewMode === 'story'
                ? 'rgba(240, 235, 225, 0.65)'
                : 'rgba(235, 240, 248, 0.75)',
            border:
              viewMode === 'story'
                ? '1px dashed #D4C9B8'
                : '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow:
              viewMode === 'story'
                ? 'none'
                : 'inset 2px 2px 5px rgba(160, 175, 195, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.8)',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: viewMode === 'story' ? '#4A3B32' : 'var(--nm-text)',
              fontFamily: viewMode === 'story' ? 'serif' : 'inherit',
            }}
          >
            《{book.title}》
          </div>
          <div
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: viewMode === 'story' ? '#8C7A6B' : 'var(--nm-text-sub)',
              lineHeight: 1.6,
            }}
          >
            此卷收录了与「{book.characterName}」的往来对白共 {book.messageCount}{' '}
            条，全篇约 {book.totalWords} 字。落款于{' '}
            {new Date(book.createdAt).toLocaleDateString('zh-CN')}。
          </div>
        </div>

        {/* 模式 1：仿真聊天气泡流 */}
        {viewMode === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredMessages.map((m, idx) => {
              const isUser = m.sender === 'user';
              const timeStr = m.timestamp
                ? new Date(m.timestamp).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={m.id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--nm-text-sub)',
                      marginBottom: '3px',
                      padding: '0 4px',
                    }}
                  >
                    {isUser ? '你' : m.name || book.characterName} · {timeStr}
                  </div>

                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '10px 14px',
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      backgroundColor: isUser ? '#5096C6' : 'var(--nm-bg)',
                      color: isUser ? '#FFFFFF' : 'var(--nm-text)',
                      boxShadow: isUser
                        ? '3px 4px 10px rgba(80, 150, 198, 0.4)'
                        : '4px 4px 10px rgba(160, 175, 195, 0.45), -3px -3px 8px rgba(255, 255, 255, 0.9)',
                      fontSize: '13px',
                      lineHeight: 1.55,
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 模式 2：文学回忆录手记流 */}
        {viewMode === 'story' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              fontFamily: '"Noto Serif SC", "Source Han Serif SC", Georgia, serif',
            }}
          >
            {filteredMessages.map((m, idx) => {
              const isUser = m.sender === 'user';
              const speaker = isUser ? '你' : m.name || book.characterName;

              return (
                <div
                  key={m.id || idx}
                  style={{
                    lineHeight: 1.8,
                    fontSize: '14px',
                    color: '#2C2523',
                    borderLeft: isUser
                      ? '3px solid #C49772'
                      : '3px solid #7E96A6',
                    paddingLeft: '12px',
                    margin: '4px 0',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: isUser ? '#8B5A2B' : '#3E5C76',
                      marginRight: '6px',
                    }}
                  >
                    「{speaker}」
                  </span>
                  <span>{m.content}</span>
                </div>
              );
            })}
          </div>
        )}

        {filteredMessages.length === 0 && (
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
              color: 'var(--nm-text-sub)',
              fontSize: '13px',
            }}
          >
            未检索到匹配的对白内容~
          </div>
        )}
      </div>

      {/* 底部小工具条：备份与字数 */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.4)',
          backgroundColor: 'rgba(235, 240, 248, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--nm-text-sub)',
          flexShrink: 0,
        }}
      >
        <span>
          共 {filteredMessages.length} 条记录 / 约 {book.totalWords} 字
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleExportJson}
            style={{
              background: 'none',
              border: 'none',
              color: '#5096C6',
              fontSize: '11px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            备份JSON
          </button>
          <button
            type="button"
            onClick={handleExportTxt}
            style={{
              background: 'none',
              border: 'none',
              color: '#5096C6',
              fontSize: '11px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            下载TXT
          </button>
        </div>
      </div>
    </div>
  );
};
