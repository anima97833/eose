import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit3 } from 'lucide-react';
import { MemoChapter, MemoCategory } from '../../../../core/memo/memoTypes';

interface MemoStationeryPadProps {
  category: MemoCategory | null;
  chapter: MemoChapter | null;
  onUpdateChapter: (updated: MemoChapter) => void;
  onOpenEditTitles: () => void;
  onDeleteCurrentChapter?: () => void;
}

export const MemoStationeryPad: React.FC<MemoStationeryPadProps> = ({
  category,
  chapter,
  onUpdateChapter,
  onOpenEditTitles,
  onDeleteCurrentChapter,
}) => {
  if (!category || !chapter) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FEF3C7',
          padding: '20px',
        }}
      >
        <div
          style={{
            padding: '20px',
            background: '#FFFFFF',
            border: '2.5px solid #502428',
            borderRadius: '16px',
            boxShadow: '0 4px 0 #502428',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📝</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#502428' }}>
            当前分类暂无篇章
          </span>
          <span style={{ fontSize: '11px', color: '#78350F', display: 'block', marginTop: '4px' }}>
            点击下方深黄色栏目创建新篇章开始记录吧
          </span>
        </div>
      </div>
    );
  }

  const pages = chapter.pages && chapter.pages.length > 0 ? chapter.pages : [''];
  const currentPageIdx = Math.min(chapter.currentPageIndex || 0, pages.length - 1);
  const currentContent = pages[currentPageIdx] || '';

  // 翻页处理
  const handlePrevPage = () => {
    if (currentPageIdx > 0) {
      onUpdateChapter({
        ...chapter,
        currentPageIndex: currentPageIdx - 1,
        updatedAt: Date.now(),
      });
    }
  };

  const handleNextPage = () => {
    if (currentPageIdx < pages.length - 1) {
      onUpdateChapter({
        ...chapter,
        currentPageIndex: currentPageIdx + 1,
        updatedAt: Date.now(),
      });
    }
  };

  // 加新纸张
  const handleAddPage = () => {
    const nextPages = [...pages, ''];
    onUpdateChapter({
      ...chapter,
      pages: nextPages,
      currentPageIndex: nextPages.length - 1,
      updatedAt: Date.now(),
    });
  };

  // 删除当前纸张
  const handleDeletePage = () => {
    if (pages.length <= 1) {
      // 仅剩一页时清空文本
      const nextPages = [''];
      onUpdateChapter({
        ...chapter,
        pages: nextPages,
        currentPageIndex: 0,
        updatedAt: Date.now(),
      });
      return;
    }
    const nextPages = pages.filter((_, idx) => idx !== currentPageIdx);
    const nextIdx = Math.min(currentPageIdx, nextPages.length - 1);
    onUpdateChapter({
      ...chapter,
      pages: nextPages,
      currentPageIndex: nextIdx,
      updatedAt: Date.now(),
    });
  };

  // 文本内容修改
  const handleContentChange = (newText: string) => {
    const nextPages = [...pages];
    nextPages[currentPageIdx] = newText;
    onUpdateChapter({
      ...chapter,
      pages: nextPages,
      updatedAt: Date.now(),
    });
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#FEF3C7', // 暖黄书页衬底
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '10px 10px 6px 10px',
      }}
    >
      {/* 1. 活页纸顶端：一级标题与二级标题（点击可编辑） */}
      <div
        style={{
          background: '#FFFBEB',
          border: '2.5px solid #502428',
          borderRadius: '14px 14px 0 0',
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px dashed #D97706',
          boxShadow: '0 2px 0 rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
          {/* 一级标题 */}
          <div
            onClick={onOpenEditTitles}
            title="点击修改标题"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: 900,
                color: '#502428',
                fontFamily: '"ZCOOL KuaiLe", sans-serif',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {chapter.titleLevel1 || '未命名一级标题'}
            </span>
            <Edit3 size={11} color="#B45309" />
          </div>

          {/* 二级标题 */}
          <span
            onClick={onOpenEditTitles}
            title="点击修改标题"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#92400E',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            § {chapter.titleLevel2 || '未命名二级标题'}
          </span>
        </div>

        {/* 所属分类胶囊角标 */}
        <div
          style={{
            padding: '2px 8px',
            borderRadius: '12px',
            background: category.color,
            border: '1.5px solid #502428',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 900,
            boxShadow: '0 1px 0 #502428',
            flexShrink: 0,
            marginLeft: '6px',
          }}
        >
          {category.name}
        </div>
      </div>

      {/* 2. 手账纸张正文区（真实横线手写纸设计） */}
      <div
        style={{
          flex: 1,
          background: '#FFFDF9',
          border: '2.5px solid #502428',
          borderTop: 'none',
          borderBottom: 'none',
          padding: '8px 12px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #E8DFD5 28px)',
          backgroundAttachment: 'local',
          overflow: 'hidden',
        }}
      >
        <textarea
          value={currentContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={`在此书写【${category.name}】内容...\n• 可以记录每一笔收支明细\n• 可以随笔写下生活灵感\n• 纸张不够可在下方点击【加新纸】`}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '13.5px',
            lineHeight: '28px',
            color: '#292524',
            fontFamily: '"ZCOOL KuaiLe", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            boxSizing: 'border-box',
            padding: 0,
            margin: 0,
          }}
        />
      </div>

      {/* 3. 活页纸底部：页码指示、翻页与加新纸按钮 */}
      <div
        style={{
          background: '#FFFBEB',
          border: '2.5px solid #502428',
          borderRadius: '0 0 14px 14px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 3px 0 #502428',
        }}
      >
        {/* 左侧页码指示 */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#78350F',
            fontFamily: '"ZCOOL KuaiLe", sans-serif',
          }}
        >
          📄 第 {currentPageIdx + 1} / {pages.length} 页
        </span>

        {/* 中间翻页按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={handlePrevPage}
            disabled={currentPageIdx === 0}
            title="上一页"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: currentPageIdx > 0 ? '#FDE68A' : '#F3F4F6',
              border: '1.5px solid #502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPageIdx > 0 ? 'pointer' : 'not-allowed',
              opacity: currentPageIdx > 0 ? 1 : 0.4,
              padding: 0,
            }}
          >
            <ChevronLeft size={14} color="#502428" strokeWidth={3} />
          </button>

          <button
            onClick={handleNextPage}
            disabled={currentPageIdx >= pages.length - 1}
            title="下一页"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: currentPageIdx < pages.length - 1 ? '#FDE68A' : '#F3F4F6',
              border: '1.5px solid #502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPageIdx < pages.length - 1 ? 'pointer' : 'not-allowed',
              opacity: currentPageIdx < pages.length - 1 ? 1 : 0.4,
              padding: 0,
            }}
          >
            <ChevronRight size={14} color="#502428" strokeWidth={3} />
          </button>
        </div>

        {/* 右侧：加新纸与删页 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {pages.length > 1 && (
            <button
              onClick={handleDeletePage}
              title="删除此页"
              style={{
                height: '24px',
                padding: '0 6px',
                borderRadius: '8px',
                background: '#FEE2E2',
                border: '1.5px solid #502428',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 800,
                color: '#DC2626',
              }}
            >
              <Trash2 size={11} />
              删页
            </button>
          )}

          <button
            onClick={handleAddPage}
            title="追加新纸张"
            style={{
              height: '24px',
              padding: '0 8px',
              borderRadius: '8px',
              background: 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)',
              border: '1.5px solid #502428',
              boxShadow: '0 1.5px 0 #502428',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 900,
              color: '#FFFFFF',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            <Plus size={12} strokeWidth={3.5} />
            加新纸
          </button>
        </div>
      </div>
    </div>
  );
};
