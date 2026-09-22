import React, { useState } from 'react';
import { X, MapPin, Edit2, Trash2, Check, Plus, AlertTriangle } from 'lucide-react';
import { NM } from '../bookNeumorphism';

interface LocationManagerModalProps {
  locations: string[];
  locationCounts: Record<string, number>;
  onClose: () => void;
  onAddLocation: (name: string) => void;
  onUpdateLocation: (oldName: string, newName: string) => Promise<void>;
  onDeleteLocation: (name: string) => Promise<void>;
}

export const LocationManagerModal: React.FC<LocationManagerModalProps> = ({
  locations,
  locationCounts,
  onClose,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
}) => {
  const [newLocName, setNewLocName] = useState<string>('');
  const [editingLoc, setEditingLoc] = useState<string | null>(null);
  const [editInput, setEditInput] = useState<string>('');
  const [locToDelete, setLocToDelete] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newLocName.trim();
    if (!clean) return;
    onAddLocation(clean);
    setNewLocName('');
  };

  const startEdit = (loc: string) => {
    setEditingLoc(loc);
    setEditInput(loc);
  };

  const handleSaveEdit = async () => {
    if (!editingLoc) return;
    const clean = editInput.trim();
    if (clean && clean !== editingLoc) {
      await onUpdateLocation(editingLoc, clean);
    }
    setEditingLoc(null);
    setEditInput('');
  };

  const confirmDelete = async () => {
    if (!locToDelete) return;
    await onDeleteLocation(locToDelete);
    setLocToDelete(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 24, 16, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1300,
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
          maxHeight: '88%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(180, 160, 130, 0.45)',
          borderTop: NM.borderLight,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题与关闭 */}
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
              <MapPin size={16} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: NM.textMain }}>
                书架管理
              </h3>
              <span style={{ fontSize: '0.72rem', color: NM.textSub }}>
                可重命名、增删各处物理存放位置
              </span>
            </div>
          </div>

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

        {/* 快速新建书架插槽 */}
        <form
          onSubmit={handleAdd}
          style={{
            padding: '12px 20px',
            backgroundColor: NM.bgInset,
            boxShadow: NM.insetXs,
            borderBottom: NM.borderSoft,
            display: 'flex',
            gap: 8,
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: NM.cardBg,
              boxShadow: NM.insetSm,
              borderRadius: 12,
              padding: '6px 12px',
            }}
          >
            <input
              type="text"
              value={newLocName}
              onChange={(e) => setNewLocName(e.target.value)}
              placeholder="新增书架位置 (如: 客厅东侧A2)…"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.82rem',
                color: NM.textMain,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '7px 16px',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.65)',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '2px 3px 8px rgba(217, 119, 6, 0.35)',
              flexShrink: 0,
            }}
          >
            <Plus size={14} />
            <span>添加</span>
          </button>
        </form>

        {/* 书架列表区 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {locations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: NM.textMuted, fontSize: '0.82rem' }}>
              暂未设立书架位置，在上方快速添加吧
            </div>
          ) : (
            locations.map((loc) => {
              const count = locationCounts[loc] || 0;
              const isEditing = editingLoc === loc;

              return (
                <div
                  key={loc}
                  style={{
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexSm,
                    border: NM.borderLight,
                    borderRadius: 16,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    transition: 'all 0.18s ease',
                  }}
                >
                  {isEditing ? (
                    /* 编辑态输入框 */
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          flex: 1,
                          backgroundColor: NM.bgInset,
                          boxShadow: NM.insetSm,
                          borderRadius: 10,
                          padding: '5px 10px',
                        }}
                      >
                        <input
                          type="text"
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          autoFocus
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            fontSize: '0.84rem',
                            color: NM.textMain,
                            fontWeight: 600,
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            else if (e.key === 'Escape') setEditingLoc(null);
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          border: 'none',
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)',
                        }}
                        title="保存修改"
                      >
                        <Check size={16} strokeWidth={2.4} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingLoc(null)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          border: NM.borderLight,
                          backgroundColor: NM.cardBg,
                          boxShadow: NM.convexXs,
                          color: NM.textSub,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title="取消编辑"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    /* 正常态展示 */
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                        <MapPin size={15} color={NM.primary} style={{ flexShrink: 0 }} />
                        <span
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: NM.textMain,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {loc}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: count > 0 ? NM.primaryDark : NM.textMuted,
                            backgroundColor: count > 0 ? '#FFFBEB' : NM.bgInset,
                            boxShadow: NM.insetXs,
                            padding: '1px 7px',
                            borderRadius: 10,
                            flexShrink: 0,
                          }}
                        >
                          {count}本
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {/* 编辑按键 */}
                        <button
                          type="button"
                          onClick={() => startEdit(loc)}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 10,
                            border: NM.borderLight,
                            backgroundColor: NM.cardBg,
                            boxShadow: NM.convexXs,
                            color: NM.primaryDark,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title="编辑位置"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* 删除按键 */}
                        <button
                          type="button"
                          onClick={() => setLocToDelete(loc)}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 10,
                            border: NM.borderLight,
                            backgroundColor: NM.cardBg,
                            boxShadow: NM.convexXs,
                            color: '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title="删除位置"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 删除二次确认弹窗 */}
        {locToDelete && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(20, 16, 10, 0.65)',
              zIndex: 1400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setLocToDelete(null)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 320,
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexLg,
                border: NM.borderLight,
                borderRadius: 22,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: NM.convexXs,
                }}
              >
                <AlertTriangle size={22} />
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: NM.textMain }}>
                  确认删除书架？
                </h4>
                <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: NM.textSub, lineHeight: 1.4 }}>
                  书架 <b style={{ color: NM.primaryDark }}>{locToDelete}</b> 内现有{' '}
                  <b style={{ color: '#DC2626' }}>{locationCounts[locToDelete] || 0}</b> 本藏书。
                  删除后，这些书籍将自动移至“未归位”。
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setLocToDelete(null)}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 12,
                    border: NM.borderLight,
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexXs,
                    color: NM.textSub,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 12,
                    border: 'none',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
                  }}
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
