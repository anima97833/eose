import React, { useState } from 'react';
import { BookOpen, Plus, ChevronUp, ChevronDown, Check, Trash2, Edit3 } from 'lucide-react';
import { MemoChapter, MemoCategory } from '../../../../core/memo/memoTypes';

interface BottomChapterDockProps {
  category: MemoCategory | null;
  chapters: MemoChapter[];
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onOpenCreateChapter: () => void;
  onOpenEditChapter: (chapter: MemoChapter) => void;
  onDeleteChapter: (chapterId: string) => void;
}

export const BottomChapterDock: React.FC<BottomChapterDockProps> = ({
  category,
  chapters,
  activeChapterId,
  onSelectChapter,
  onOpenCreateChapter,
  onOpenEditChapter,
  onDeleteChapter,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 30,
      }}
    >
      {/* 展开的篇章切换抽屉 */}
      {showDrawer && (
        <div
          onClick={() => setShowDrawer(false)}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '12px',
            right: '12px',
            marginBottom: '6px',
            background: '#FFFBEB',
            border: '2.5px solid #502428',
            borderRadius: '16px',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.25)',
            maxHeight: '180px',
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 35,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px 4px 6px 4px',
              borderBottom: '1.5px dashed #D97706',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#78350F',
                fontFamily: '"ZCOOL KuaiLe", sans-serif',
              }}
            >
              【{category?.name || '当前分类'}】篇章列表（共 {chapters.length} 篇）
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDrawer(false);
                onOpenCreateChapter();
              }}
              style={{
                padding: '2px 8px',
                borderRadius: '8px',
                background: '#10B981',
                border: '1.5px solid #502428',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <Plus size={10} strokeWidth={3} />
              新篇章
            </button>
          </div>

          {chapters.map((chap) => {
            const isSelected = chap.id === activeChapterId;
            return (
              <div
                key={chap.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectChapter(chap.id);
                  setShowDrawer(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: '10px',
                  background: isSelected ? '#FEF08A' : '#FFFFFF',
                  border: isSelected ? '2px solid #502428' : '1px solid #E5E7EB',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}>
                  {isSelected && <Check size={14} color="#059669" strokeWidth={3} />}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: isSelected ? 900 : 700,
                      color: '#502428',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {chap.chapterName || '未命名篇章'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#92400E' }}>
                    ({chap.pages?.length || 1}页)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditChapter(chap);
                    }}
                    title="改名"
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      border: '1px solid #502428',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Edit3 size={11} color="#502428" />
                  </button>

                  {chapters.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChapter(chap.id);
                      }}
                      title="删除篇章"
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        background: '#FEE2E2',
                        border: '1px solid #502428',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <Trash2 size={11} color="#DC2626" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 底部深黄色托盘主栏目（深度对齐原画底部深黄区域） */}
      <div
        style={{
          height: '46px',
          background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
          borderTop: '3px solid #502428',
          boxShadow: '0 -2px 0 rgba(255,255,255,0.3)',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* 左侧：篇章选择胶囊（点击可上拉抽屉切换） */}
        <button
          onClick={() => setShowDrawer(!showDrawer)}
          title="点击切换篇章"
          style={{
            height: '32px',
            padding: '0 10px',
            borderRadius: '16px',
            background: '#FFFBEB',
            border: '2px solid #502428',
            boxShadow: '0 2px 0 #502428',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            maxWidth: '190px',
          }}
        >
          <BookOpen size={14} color="#B45309" strokeWidth={2.5} />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 900,
              color: '#502428',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeChapter?.chapterName || '选择篇章'}
          </span>
          {showDrawer ? (
            <ChevronDown size={14} color="#502428" strokeWidth={3} />
          ) : (
            <ChevronUp size={14} color="#502428" strokeWidth={3} />
          )}
        </button>

        {/* 右侧：[+ 新篇章] 萌系胶囊键 */}
        <button
          onClick={onOpenCreateChapter}
          title="创建新篇章"
          style={{
            height: '32px',
            padding: '0 12px',
            borderRadius: '16px',
            background: 'linear-gradient(180deg, #FEF08A 0%, #FBBF24 100%)',
            border: '2px solid #502428',
            boxShadow: '0 2px 0 #502428',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
          }}
        >
          <Plus size={13} color="#502428" strokeWidth={3.5} />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 900,
              color: '#502428',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            新篇章
          </span>
        </button>
      </div>
    </div>
  );
};
