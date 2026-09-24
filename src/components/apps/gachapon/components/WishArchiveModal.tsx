import React, { useState } from 'react';
import { WishItem, GachaPalette, CAPSULE_COLORS } from '../core/gachaTypes';
import { X, Trash2, RotateCcw, CheckCircle2 } from 'lucide-react';

interface WishArchiveModalProps {
  wishes: WishItem[];
  palette: GachaPalette;
  onClose: () => void;
  onReturnToMachine: (id: string) => void;
  onDeleteWish: (id: string) => void;
}

export const WishArchiveModal: React.FC<WishArchiveModalProps> = ({
  wishes,
  palette,
  onClose,
  onReturnToMachine,
  onDeleteWish,
}) => {
  const [tab, setTab] = useState<'in_machine' | 'completed'>('completed');

  const filtered = wishes.filter((w) =>
    tab === 'completed' ? w.status === 'completed' : w.status !== 'completed'
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(26, 20, 22, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          maxHeight: '80%',
          background: '#FFFDF7',
          border: `3px solid ${palette.secondary}`,
          borderRadius: 22,
          padding: 20,
          boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 顶部标题栏与关闭 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 900, color: '#3A2E2B' }}>
            心愿手帐
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8C7D73',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 极简切换 Tab */}
        <div
          style={{
            display: 'flex',
            background: '#F0EAE1',
            borderRadius: 12,
            padding: 3,
            marginBottom: 14,
            border: `1.5px solid ${palette.secondary}`,
          }}
        >
          <button
            type="button"
            onClick={() => setTab('completed')}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: 9,
              border: 'none',
              background: tab === 'completed' ? '#FFFFFF' : 'transparent',
              color: tab === 'completed' ? palette.secondary : '#8C7D73',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: tab === 'completed' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            已实现 ({wishes.filter((w) => w.status === 'completed').length})
          </button>
          <button
            type="button"
            onClick={() => setTab('in_machine')}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: 9,
              border: 'none',
              background: tab === 'in_machine' ? '#FFFFFF' : 'transparent',
              color: tab === 'in_machine' ? palette.secondary : '#8C7D73',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: tab === 'in_machine' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            扭蛋机中 ({wishes.filter((w) => w.status !== 'completed').length})
          </button>
        </div>

        {/* 心愿卡片滚动列表 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingRight: 4,
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '36px 0',
                textAlign: 'center',
                color: '#A8998C',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {tab === 'completed' ? '暂无已实现的心愿' : '机器里还没有纸条哦'}
            </div>
          ) : (
            filtered.map((w) => {
              const cCol = CAPSULE_COLORS[w.colorKey] || CAPSULE_COLORS.pink;
              const completedDate = w.completedAt
                ? new Date(w.completedAt).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                  })
                : null;

              return (
                <div
                  key={w.id}
                  style={{
                    background: '#FFFFFF',
                    border: `2px solid ${palette.secondary}`,
                    borderRadius: 14,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.04)',
                    gap: 10,
                  }}
                >
                  {/* 左侧颜色圆标与文字 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        background: `linear-gradient(135deg, ${cCol.top} 50%, #FFFFFF 50%)`,
                        border: `1.5px solid ${palette.secondary}`,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                      }}
                    >
                      {w.icon || '✨'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#332724',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {w.content}
                      </div>
                      {completedDate && (
                        <div style={{ fontSize: 11, color: '#8AC926', fontWeight: 700, marginTop: 2 }}>
                          ✓ {completedDate} 实现
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 右侧动作 */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {tab === 'completed' && (
                      <button
                        title="放回扭蛋机"
                        onClick={() => onReturnToMachine(w.id)}
                        style={{
                          background: '#F0EAE1',
                          border: `1.5px solid ${palette.secondary}`,
                          borderRadius: 8,
                          padding: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          color: palette.secondary,
                        }}
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <button
                      title="删除"
                      onClick={() => onDeleteWish(w.id)}
                      style={{
                        background: '#FFF0F0',
                        border: '1.5px solid #FF8080',
                        borderRadius: 8,
                        padding: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        color: '#E04040',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
