import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Eye,
  Copy,
  Check,
  Trash2,
  Share2,
  Sparkles,
  GitBranch,
  Gift,
  FileText,
  Calendar,
} from 'lucide-react';
import { VirtualFileRecord } from '../../../../core/files/fileTypes';
import { updateFile, deleteItem } from '../../../../core/files/fileStorage';
import { addCustomQuest } from '../../../../core/quest/questStorage';
import { addWish } from '../../gachapon/core/gachaStorage';

interface FileViewerModalProps {
  file: VirtualFileRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  file,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      setName(file.name);
      setContent(file.content || '');
      setIsEditing(false);
      setShowLinkMenu(false);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSave = async () => {
    await updateFile(file.id, {
      name,
      content,
    });
    setIsEditing(false);
    showToast('已保存修改 ✨');
    onUpdated();
  };

  const handleDelete = async () => {
    if (window.confirm(`确定要删除文件「${file.name}」吗？此操作无法撤销。`)) {
      await deleteItem(file.id);
      onClose();
      onUpdated();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      showToast('已复制全文到剪贴板 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('复制失败，请手动选择复制');
    }
  };

  // 跨应用联动 1: 发送到世界线待办
  const handleLinkToQuest = () => {
    try {
      const taskTitle = name.replace(/\.(md|txt)$/i, '');
      addCustomQuest({
        category: 'main',
        title: `[笔记待办] ${taskTitle}`,
        desc: `来自文件笔记「${name}」的行动目标`,
        icon: '📝',
        tag: '⚡ 精力',
        statKey: 'SPI',
        statGain: { fixed: 2 },
        targetProgress: 1,
        isDailyRepeatable: false,
      });
      window.dispatchEvent(new CustomEvent('cloudfly_quests_updated'));
      setShowLinkMenu(false);
      showToast('已成功添加至「世界线待办任务」🎯');
    } catch (err) {
      console.error(err);
      showToast('联动失败');
    }
  };

  // 跨应用联动 2: 发送到心愿扭蛋机
  const handleLinkToGachapon = () => {
    try {
      const wishText = name.replace(/\.(md|txt)$/i, '');
      addWish(`阅读与复盘: ${wishText}`, 'pink', '📖');
      setShowLinkMenu(false);
      showToast('已折成心愿小纸条装入「扭蛋机」🌸');
    } catch (err) {
      console.error(err);
      showToast('联动失败');
    }
  };

  // 简单的轻拟物 Markdown 渲染器
  const renderMarkdown = (text: string) => {
    if (!text.trim()) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--nm-text-muted)', fontSize: '13px' }}>
          此笔记暂无正文内容，点击右上角「编辑」开始书写 ✍️
        </div>
      );
    }

    const lines = text.split('\n');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.7' }}>
        {lines.map((line, idx) => {
          // 一级标题
          if (line.startsWith('# ')) {
            return (
              <h1
                key={idx}
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--nm-text-main)',
                  marginTop: '10px',
                  paddingBottom: '4px',
                  borderBottom: '2px solid rgba(166, 180, 200, 0.25)',
                }}
              >
                {line.substring(2)}
              </h1>
            );
          }
          // 二级标题
          if (line.startsWith('## ')) {
            return (
              <h2
                key={idx}
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--nm-text-main)',
                  marginTop: '8px',
                  paddingLeft: '6px',
                  borderLeft: '3px solid var(--nm-primary)',
                }}
              >
                {line.substring(3)}
              </h2>
            );
          }
          // 三级标题
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} style={{ fontSize: '14px', fontWeight: 700, color: 'var(--nm-primary)' }}>
                {line.substring(4)}
              </h3>
            );
          }
          // 引用块
          if (line.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(80, 150, 198, 0.08)',
                  borderLeft: '4px solid var(--nm-primary)',
                  borderRadius: '0 8px 8px 0',
                  color: 'var(--nm-text-main)',
                  fontSize: '13px',
                  fontStyle: 'italic',
                }}
              >
                {line.substring(2)}
              </blockquote>
            );
          }
          // 分割线
          if (line.trim() === '---' || line.trim() === '***') {
            return (
              <hr
                key={idx}
                style={{
                  border: 'none',
                  height: '1px',
                  background: 'rgba(166, 180, 200, 0.3)',
                  margin: '8px 0',
                }}
              />
            );
          }
          // 复选框 / 待办列表
          if (line.match(/^-\s*\[([ xX])\]/)) {
            const isChecked = line.includes('[x]') || line.includes('[X]');
            const itemText = line.replace(/^-\s*\[([ xX])\]\s*/, '');
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: isChecked ? 'var(--nm-primary)' : 'var(--nm-bg)',
                    boxShadow: isChecked ? 'none' : 'var(--nm-inset-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {isChecked && <Check size={12} />}
                </span>
                <span
                  style={{
                    textDecoration: isChecked ? 'line-through' : 'none',
                    color: isChecked ? 'var(--nm-text-muted)' : 'var(--nm-text-main)',
                  }}
                >
                  {itemText}
                </span>
              </div>
            );
          }
          // 无序列表
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--nm-primary)', fontWeight: 800 }}>•</span>
                <span style={{ color: 'var(--nm-text-main)' }}>{line.substring(2)}</span>
              </div>
            );
          }
          // 空行
          if (!line.trim()) {
            return <div key={idx} style={{ height: '6px' }} />;
          }
          // 普通段落
          return (
            <p key={idx} style={{ fontSize: '13px', color: 'var(--nm-text-main)' }}>
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  const formattedDate = new Date(file.updatedAt).toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'rgba(20, 30, 45, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '84vh',
          maxHeight: '680px',
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-convex-lg)',
          borderRadius: '26px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.75)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast 提示浮层 */}
        {toastMsg && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              background: 'rgba(20, 30, 45, 0.88)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            <Sparkles size={13} style={{ color: '#FFD15C' }} />
            {toastMsg}
          </div>
        )}

        {/* 顶部 Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(166, 180, 200, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--nm-bg)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid var(--nm-primary)',
                  background: 'var(--nm-bg)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--nm-text-main)',
                  outline: 'none',
                }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--nm-text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </h3>
                {file.source === 'onenote' && (
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      background: 'rgba(119, 83, 166, 0.12)',
                      color: '#7753A6',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    OneNote
                  </span>
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--nm-text-sub)', marginTop: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={11} /> {file.wordCount || 0} 字
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={11} /> {formattedDate}
              </span>
            </div>
          </div>

          {/* 右上角按钮组 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {isEditing ? (
              <button
                onClick={handleSave}
                style={{
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--nm-primary)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(80, 150, 198, 0.35)',
                }}
              >
                <Check size={14} /> 保存
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                title="编辑笔记"
                style={{
                  padding: '7px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-convex-xs)',
                  color: 'var(--nm-text-sub)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Edit3 size={15} />
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                padding: '7px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: 'var(--nm-text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 中间正文内容区域 */}
        <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
          {isEditing ? (
            <div
              style={{
                height: '100%',
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-inset-sm)',
                borderRadius: '16px',
                padding: '14px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
              }}
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在此时记录或修改你的灵感与笔记..."
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: 'var(--nm-text-main)',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          ) : (
            <div className="allow-text-selection" style={{ minHeight: '100%' }}>
              {renderMarkdown(content)}
            </div>
          )}
        </div>

        {/* 底部工具栏 */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid rgba(166, 180, 200, 0.2)',
            background: 'var(--nm-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* 左侧复制与删除 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{
                padding: '7px 12px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-convex-xs)',
                color: copied ? '#38D39F' : 'var(--nm-text-main)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? '已复制' : '复制全文'}
            </button>

            <button
              onClick={handleDelete}
              style={{
                padding: '7px 10px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-convex-xs)',
                color: '#FF5E7E',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="删除笔记"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* 右侧跨应用联动 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLinkMenu(!showLinkMenu)}
              style={{
                padding: '7px 14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, rgba(80, 150, 198, 0.15) 0%, rgba(119, 83, 166, 0.15) 100%)',
                boxShadow: 'var(--nm-convex-xs)',
                color: 'var(--nm-primary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Share2 size={13} />
              跨应用联动
            </button>

            {/* 联动弹出气泡菜单 */}
            {showLinkMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  right: 0,
                  width: '180px',
                  background: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-convex-lg)',
                  borderRadius: '16px',
                  padding: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <button
                  onClick={handleLinkToQuest}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--nm-text-main)',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(80, 150, 198, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <GitBranch size={14} style={{ color: '#38BDF8' }} />
                  转为世界线任务
                </button>

                <button
                  onClick={handleLinkToGachapon}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--nm-text-main)',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 94, 126, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Gift size={14} style={{ color: '#FF5E7E' }} />
                  存为心愿扭蛋纸条
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
