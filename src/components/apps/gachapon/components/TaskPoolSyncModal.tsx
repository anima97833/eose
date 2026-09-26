import React from 'react';
import { DecisionTaskItem, GachaPalette } from '../core/gachaTypes';
import { X, RefreshCw, CheckCircle, Clock, BookOpen, Sparkles } from 'lucide-react';

interface TaskPoolSyncModalProps {
  tasks: DecisionTaskItem[];
  palette: GachaPalette;
  onClose: () => void;
  onRefresh: () => void;
  onOpenApp?: (appId: string) => void;
}

export const TaskPoolSyncModal: React.FC<TaskPoolSyncModalProps> = ({
  tasks,
  palette,
  onClose,
  onRefresh,
  onOpenApp,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(26, 20, 22, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          maxHeight: '82%',
          background: '#FFFDF9',
          borderRadius: 24,
          border: `2.5px solid ${palette.buttonBorder}`,
          boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '16px 18px 12px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🎯</span>
              <span>待办决断扭蛋池</span>
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, fontWeight: 600 }}>
              仅同步世界线与番茄钟未打钩的任务 ({tasks.length} 项)
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: `1.5px solid ${palette.buttonBorder}`,
              background: palette.buttonBg,
              color: palette.buttonText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 中间任务滚动列表 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {tasks.length === 0 ? (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 36 }}>🎉</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#374151' }}>
                太棒了！所有待办均已打钩完成
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', maxWidth: 220, lineHeight: 1.5 }}>
                当前番茄钟与世界线手账中暂无未完成任务。您可在对应应用添加新任务后点击下方刷新。
              </div>
            </div>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 24 }}>{t.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#1F2937',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {t.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 6,
                        background: '#E0F2FE',
                        color: '#0369A1',
                      }}
                    >
                      🌌 世界线
                    </span>
                    {t.desc && (
                      <span
                        style={{
                          fontSize: 11,
                          color: '#6B7280',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {t.desc}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部按钮栏 */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            onClick={onRefresh}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: `1.5px solid ${palette.buttonBorder}`,
              background: palette.buttonBg,
              color: palette.buttonText,
              fontWeight: 800,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: `0 2px 0 ${palette.buttonBorder}26`,
            }}
          >
            <RefreshCw size={14} />
            <span>刷新待办</span>
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1.2,
              padding: '10px 14px',
              borderRadius: 12,
              border: `1.5px solid ${palette.buttonBorder}`,
              background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: `0 2px 0 ${palette.buttonBorder}`,
            }}
          >
            <CheckCircle size={15} />
            <span>进入决断</span>
          </button>
        </div>
      </div>
    </div>
  );
};
