import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
  X,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';
import {
  StoryInsightHistoryItem,
  getInsightHistoryList,
  deleteInsightHistoryItem,
  clearAllInsightHistory,
} from '../../../../../core/files/insightHistoryService';
import { StoryInsightData } from '../../../../../core/files/fileTypes';

interface MindMapHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInsight: (data: StoryInsightData) => void;
}

export const MindMapHistoryModal: React.FC<MindMapHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectInsight,
}) => {
  const [historyList, setHistoryList] = useState<StoryInsightHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    const list = await getInsightHistoryList();
    setHistoryList(list);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要从 IndexedDB 中删除此份导图记录吗？')) return;
    setDeletingId(id);
    await deleteInsightHistoryItem(id);
    await loadHistory();
    setDeletingId(null);
  };

  const handleClearAll = async () => {
    if (!window.confirm('确定要清空全部 IndexedDB 历史思维导图记录吗？')) return;
    await clearAllInsightHistory();
    await loadHistory();
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} 分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '80vh',
          maxHeight: '680px',
          background: 'var(--nm-bg)',
          borderRadius: '24px',
          boxShadow: 'var(--nm-convex-lg)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(166, 180, 200, 0.2)',
            background: 'var(--nm-bg-lighter)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #7753A6 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 10px rgba(119, 83, 166, 0.3)',
              }}
            >
              <History size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--nm-text-main)' }}>
                  历史思维导图
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    background: 'rgba(119, 83, 166, 0.12)',
                    color: '#7753A6',
                    fontWeight: 700,
                  }}
                >
                  {historyList.length} 份存档
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--nm-text-sub)' }}>
                自动持久化保存于 IndexedDB · 点击可即刻载入查阅
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  padding: '6px 10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-convex-xs)',
                  color: '#DC2626',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="清空全部历史导图"
              >
                <Trash2 size={13} />
                <span>清空</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-convex-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--nm-text-sub)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 历史卡片列表 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--nm-text-sub)', fontSize: '13px' }}>
              正在打捞 IndexedDB 历史导图...
            </div>
          ) : historyList.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                color: 'var(--nm-text-sub)',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '20px',
                  background: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-inset-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--nm-text-sub)',
                }}
              >
                <Sparkles size={24} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>暂无历史导图记录</p>
              <p style={{ fontSize: '11px', color: 'var(--nm-text-sub)', textAlign: 'center', maxWidth: '280px' }}>
                每次使用 AI 洞察分析后，系统都会自动为您完整归档至 IndexedDB 本地数据库中。
              </p>
            </div>
          ) : (
            historyList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectInsight(item.data);
                  onClose();
                }}
                style={{
                  borderRadius: '16px',
                  background: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-convex-sm)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: 'pointer',
                  border: '1px solid rgba(166, 180, 200, 0.25)',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = 'var(--nm-convex-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--nm-convex-sm)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <BookOpen size={16} color="#7753A6" style={{ flexShrink: 0 }} />
                    <h4
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--nm-text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
                        color: 'var(--nm-text-sub)',
                      }}
                    >
                      <Clock size={11} />
                      {formatRelativeTime(item.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deletingId === item.id}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--nm-text-sub)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="删除此条记录"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* 胶囊统计栏 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: 'rgba(37, 99, 235, 0.08)',
                      color: '#2563EB',
                      fontWeight: 600,
                    }}
                  >
                    {item.scopeName}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: 'rgba(119, 83, 166, 0.08)',
                      color: '#7753A6',
                      fontWeight: 600,
                    }}
                  >
                    {item.totalChapters} 篇章节 · 约 {item.totalWords.toLocaleString()} 字
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: 'rgba(5, 150, 105, 0.08)',
                      color: '#059669',
                      fontWeight: 600,
                    }}
                  >
                    🕸️ {item.graphNodeCount} 关系实体
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: 'rgba(217, 119, 6, 0.08)',
                      color: '#D97706',
                      fontWeight: 600,
                    }}
                  >
                    📋 {item.treeNodeCount} 大纲节点
                  </span>
                </div>

                {/* 概述简短摘要 */}
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--nm-text-sub)',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.executiveSummary}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginTop: '2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--nm-primary)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    载入双模导图 <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
