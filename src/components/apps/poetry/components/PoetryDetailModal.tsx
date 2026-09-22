import React, { useState } from 'react';
import { X, Heart, Award, Edit3, Save, Check } from 'lucide-react';
import { SavedPoemRecord } from '../../../../core/poetry/poetryTypes';

interface PoetryDetailModalProps {
  poem: SavedPoemRecord;
  onClose: () => void;
  onStartExam: (poem: SavedPoemRecord) => void;
  onToggleFavorite: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
}

export const PoetryDetailModal: React.FC<PoetryDetailModalProps> = ({
  poem,
  onClose,
  onStartExam,
  onToggleFavorite,
  onToggleStatus,
  onSaveNotes,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(poem.userNotes || '');
  const [hasSavedToast, setHasSavedToast] = useState(false);

  const isMastered = poem.status === 'mastered';

  const handleSaveNotes = () => {
    onSaveNotes(poem.id, notes);
    setIsEditingNotes(false);
    setHasSavedToast(true);
    setTimeout(() => setHasSavedToast(false), 1500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(25, 20, 15, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 1050,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#faf6ef',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '90%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.35)',
          borderTop: '2px solid #b0894c',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题与操作栏 */}
        <div
          style={{
            padding: '16px 20px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #ebdfcd',
            background: 'linear-gradient(180deg, #f7f0e3 0%, #faf6ef 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: '#eee2d0',
                color: '#775730',
                border: '1px solid #dfd0bc',
              }}
            >
              {poem.dynasty || '唐'}
            </span>

            <span
              style={{
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#282017',
                fontFamily: '"Songti SC", "SimSun", serif',
              }}
            >
              {poem.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* 心仪收藏 */}
            <button
              type="button"
              onClick={() => onToggleFavorite(poem.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: 6,
                cursor: 'pointer',
                color: poem.isFavorite ? '#dc2626' : '#b0a08e',
              }}
              title={poem.isFavorite ? '取消心仪' : '心仪收藏'}
            >
              <Heart
                size={20}
                fill={poem.isFavorite ? '#dc2626' : 'none'}
                strokeWidth={2}
              />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: 6,
                cursor: 'pointer',
                color: '#8b7a67',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 诗篇正文阅读区（宣纸墨印风格） */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* 诗名与作者 */}
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <h2
              style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#241b12',
                letterSpacing: '0.08em',
                fontFamily: '"Songti SC", "SimSun", serif',
              }}
            >
              {poem.title}
            </h2>
            <div
              style={{
                fontSize: '0.85rem',
                color: '#71604e',
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              〔{poem.dynasty || '唐'}〕{poem.author || '佚名'}
            </div>
          </div>

          {/* 诗文段落 */}
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              backgroundColor: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e7dcce',
              padding: '18px 20px',
              boxShadow: '0 4px 15px rgba(120, 95, 65, 0.06)',
            }}
          >
            <div
              style={{
                fontFamily: '"Songti SC", "SimSun", serif',
                fontSize: '1.08rem',
                lineHeight: 2.0,
                color: '#2a221a',
                letterSpacing: '0.08em',
                textAlign: 'center',
              }}
            >
              {poem.content.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>

          {/* 个人赏析随笔 / 记忆备忘 */}
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              backgroundColor: '#f6efe2',
              borderRadius: 12,
              border: '1px solid #e3d6c2',
              padding: '12px 14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#6e5a44',
                }}
              >
                随笔感悟 / 记忆口诀
              </span>

              {!isEditingNotes ? (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8b6f48',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontWeight: 600,
                  }}
                >
                  <Edit3 size={13} />
                  <span>编辑</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#047857',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontWeight: 700,
                  }}
                >
                  <Save size={13} />
                  <span>保存</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录这首诗的名句赏析、背诵提示或心情感悟…"
                rows={3}
                style={{
                  width: '100%',
                  border: '1px solid #d4c5af',
                  borderRadius: 8,
                  padding: '6px 8px',
                  fontSize: '0.84rem',
                  color: '#2d2218',
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: '"Songti SC", "SimSun", serif',
                }}
              />
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.82rem',
                  color: poem.userNotes ? '#493e32' : '#9b8b79',
                  lineHeight: 1.5,
                  fontStyle: poem.userNotes ? 'normal' : 'italic',
                }}
              >
                {poem.userNotes || '暂无随笔，点击上方「编辑」随手记下诗句心得…'}
              </p>
            )}

            {hasSavedToast && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#047857',
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                已保存随笔
              </div>
            )}
          </div>
        </div>

        {/* 底部动作工具栏 */}
        <div
          style={{
            padding: '12px 20px 20px',
            borderTop: '1px solid #ebdfcd',
            background: 'linear-gradient(180deg, #f7efe0 0%, #f4e7d4 100%)',
            display: 'flex',
            gap: 10,
          }}
        >
          {/* 切换背诵状态 */}
          <button
            type="button"
            onClick={() => onToggleStatus(poem.id)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 10,
              border: isMastered ? '1px solid #b0894c' : '1px solid #059669',
              background: isMastered ? '#faf5ec' : '#ecfdf5',
              color: isMastered ? '#826532' : '#047857',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Check size={16} />
            <span>{isMastered ? '标为在背' : '设为熟背'}</span>
          </button>

          {/* 开启科举挖词考核 */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartExam(poem);
            }}
            style={{
              flex: 1.2,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #b91c1c',
              background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 3px 8px rgba(185, 28, 28, 0.28)',
            }}
          >
            <Award size={16} />
            <span>挖词考核</span>
          </button>
        </div>
      </div>
    </div>
  );
};
