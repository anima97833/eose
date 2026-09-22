import React, { useState, useEffect } from 'react';
import { StoryWordMistake } from '../../../../core/storyword/storyWordTypes';
import {
  getAllMistakes,
  markMistakeMastered,
  deleteMistakeWord,
  speakWord,
} from '../../../../core/storyword/storyWordStorage';
import { NM } from '../storyWordNeumorphism';
import {
  Bookmark,
  Volume2,
  CheckCircle,
  Trash2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface MistakeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MistakeVaultModal: React.FC<MistakeVaultModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [mistakes, setMistakes] = useState<StoryWordMistake[]>([]);
  const [filter, setFilter] = useState<'all' | 'unmastered'>('unmastered');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  const loadMistakes = async () => {
    const list = await getAllMistakes();
    setMistakes(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadMistakes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMaster = async (item: StoryWordMistake) => {
    const nextVal = !item.mastered;
    await markMistakeMastered(item.id, nextVal);
    await loadMistakes();
    showToast(nextVal ? '已掌握' : '重入错阁');
  };

  const handleDelete = async (id: string) => {
    await deleteMistakeWord(id);
    await loadMistakes();
    showToast('已斩杀');
  };

  const filteredList = mistakes.filter(m => (filter === 'unmastered' ? !m.mastered : true));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(54, 46, 34, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '85vh',
          backgroundColor: NM.cardBg,
          borderRadius: '20px',
          boxShadow: NM.convexLg,
          border: NM.borderLight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: NM.borderSoft,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bookmark size={18} color={NM.amber} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: NM.textMain }}>
              复仇错词阁
            </h3>
            <span
              style={{
                fontSize: '11px',
                color: NM.gold,
                backgroundColor: NM.bgInset,
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              共 {mistakes.length} 词
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: NM.textMuted,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* 过滤按钮组 */}
        <div
          style={{
            display: 'flex',
            padding: '10px 16px',
            gap: '10px',
            backgroundColor: NM.bgInset,
            borderBottom: NM.borderSoft,
          }}
        >
          <button
            onClick={() => setFilter('unmastered')}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'unmastered' ? NM.cardBg : 'transparent',
              color: filter === 'unmastered' ? NM.gold : NM.textSub,
              boxShadow: filter === 'unmastered' ? NM.convexXs : 'none',
            }}
          >
            待复仇 ({mistakes.filter(m => !m.mastered).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'all' ? NM.cardBg : 'transparent',
              color: filter === 'all' ? NM.gold : NM.textSub,
              boxShadow: filter === 'all' ? NM.convexXs : 'none',
            }}
          >
            全部词册 ({mistakes.length})
          </button>
        </div>

        {/* 词卡列表 */}
        <div
          style={{
            padding: '16px 20px',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {filteredList.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: NM.textMuted,
                fontSize: '13px',
              }}
            >
              <Sparkles size={28} color={NM.amberLight} style={{ marginBottom: '8px' }} />
              <div>错词阁中空空如也，战无不胜！</div>
            </div>
          ) : (
            filteredList.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: item.mastered ? NM.bgLighter : NM.cardBg,
                  boxShadow: NM.convexSm,
                  border: NM.borderLight,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  opacity: item.mastered ? 0.75 : 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: NM.gold }}>
                      {item.word}
                    </span>
                    <span style={{ fontSize: '11px', color: NM.textMuted }}>{item.phonetic}</span>
                    <button
                      onClick={() => speakWord(item.word)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: NM.amber,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleToggleMaster(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: item.mastered ? '#E6F4EA' : NM.cardBg,
                        color: item.mastered ? NM.emerald : NM.textSub,
                        boxShadow: NM.convexXs,
                        border: NM.borderLight,
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <CheckCircle size={12} />
                      <span>{item.mastered ? '已掌握' : '打卡掌握'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: NM.textMuted,
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: NM.textMain, fontWeight: 600 }}>
                  {item.translation}
                </div>

                {item.novelContextSnippet && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: NM.textSub,
                      backgroundColor: NM.bgInset,
                      padding: '6px 8px',
                      borderRadius: '6px',
                      lineHeight: '1.5',
                      boxShadow: NM.insetXs,
                    }}
                  >
                    “{item.novelContextSnippet}”
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 轻提示 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: 'rgba(54, 46, 34, 0.95)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            zIndex: 120,
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
