import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookMarked } from 'lucide-react';
import { MemoCategory, MemoChapter } from '../../../core/memo/memoTypes';
import {
  loadMemoCategoriesFromDB,
  saveMemoCategoryToDB,
  deleteMemoCategoryFromDB,
  loadMemoChaptersFromDB,
  saveMemoChapterToDB,
  deleteMemoChapterFromDB,
} from '../../../core/memo/memoStorage';
import { LeftBookmarkRail } from './components/LeftBookmarkRail';
import { MemoStationeryPad } from './components/MemoStationeryPad';
import { BottomChapterDock } from './components/BottomChapterDock';
import { CreateCategoryModal } from './components/CreateCategoryModal';
import { ChapterNamingModal } from './components/ChapterNamingModal';

interface MemoAppProps {
  onBack: () => void;
}

export const MemoApp: React.FC<MemoAppProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<MemoCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [chapters, setChapters] = useState<MemoChapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 弹窗状态
  const [showCreateCatModal, setShowCreateCatModal] = useState(false);
  const [chapterModalState, setChapterModalState] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    editingChapter?: MemoChapter;
  }>({
    isOpen: false,
    isEdit: false,
  });

  // 吐司提示
  const [toastText, setToastText] = useState<string | null>(null);
  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 2000);
  };

  // 挂载时间戳，防止从桌面打开时的幽灵穿透点击
  const mountedAtRef = useRef<number>(Date.now());

  // 1. 首次加载所有分类
  useEffect(() => {
    let isMounted = true;
    loadMemoCategoriesFromDB().then((cats) => {
      if (!isMounted) return;
      setCategories(cats);
      if (cats.length > 0) {
        setActiveCategoryId(cats[0].id);
      } else {
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. 当分类切换时，加载该分类下的专属篇章（严格数据物理隔离）
  useEffect(() => {
    if (!activeCategoryId) return;
    let isMounted = true;
    loadMemoChaptersFromDB(activeCategoryId).then((chaps) => {
      if (!isMounted) return;
      setChapters(chaps);
      if (chaps.length > 0) {
        setActiveChapterId(chaps[0].id);
      } else {
        setActiveChapterId('');
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [activeCategoryId]);

  // 当前激活的分类和篇章对象
  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0] || null;
  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0] || null;

  // ================= 分类增删 =================

  const handleSaveCategory = async (newCat: MemoCategory) => {
    await saveMemoCategoryToDB(newCat);
    setCategories((prev) => [...prev, newCat]);
    setActiveCategoryId(newCat.id);
    showToast('分类已新增');

    // 自动为新分类初始化一篇初始笔记
    const initialChapter: MemoChapter = {
      id: `chap_${Date.now()}`,
      categoryId: newCat.id,
      titleLevel1: `${newCat.name}记录`,
      titleLevel2: '新建手账小节',
      chapterName: '第1篇',
      pages: [''],
      currentPageIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveMemoChapterToDB(initialChapter);
    setChapters([initialChapter]);
    setActiveChapterId(initialChapter.id);
  };

  const handleDeleteCategory = async (catId: string) => {
    if (categories.length <= 1) {
      showToast('至少保留一个分类');
      return;
    }
    await deleteMemoCategoryFromDB(catId);
    const remain = categories.filter((c) => c.id !== catId);
    setCategories(remain);
    if (remain.length > 0) {
      setActiveCategoryId(remain[0].id);
    }
    showToast('分类已删除');
  };

  // ================= 篇章更新与增删 =================

  const handleUpdateChapter = async (updated: MemoChapter) => {
    await saveMemoChapterToDB(updated);
    setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleCreateOrEditChapterSave = async (
    chapterName: string,
    titleLevel1: string,
    titleLevel2: string
  ) => {
    if (chapterModalState.isEdit && chapterModalState.editingChapter) {
      // 编辑已有篇章
      const updated: MemoChapter = {
        ...chapterModalState.editingChapter,
        chapterName,
        titleLevel1,
        titleLevel2,
        updatedAt: Date.now(),
      };
      await handleUpdateChapter(updated);
      showToast('篇章已保存');
    } else {
      // 新增篇章（严格绑定当前分类）
      const newChapter: MemoChapter = {
        id: `chap_${Date.now()}`,
        categoryId: activeCategoryId,
        chapterName,
        titleLevel1,
        titleLevel2,
        pages: [''],
        currentPageIndex: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveMemoChapterToDB(newChapter);
      setChapters((prev) => [...prev, newChapter]);
      setActiveChapterId(newChapter.id);
      showToast('新篇章已创建');
    }
  };

  const handleDeleteChapter = async (chapId: string) => {
    if (chapters.length <= 1) {
      showToast('至少保留一个篇章');
      return;
    }
    await deleteMemoChapterFromDB(chapId);
    const remain = chapters.filter((c) => c.id !== chapId);
    setChapters(remain);
    if (remain.length > 0) {
      setActiveChapterId(remain[0].id);
    }
    showToast('篇章已删除');
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#854D0E', // 活页手账深色木纹衬底
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* 吐司提示 */}
      {toastText && (
        <div
          style={{
            position: 'absolute',
            top: '52px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 150,
            background: 'rgba(80, 36, 40, 0.95)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 800,
            padding: '5px 14px',
            borderRadius: '20px',
            border: '1.5px solid #FBBF24',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            fontFamily: '"ZCOOL KuaiLe", sans-serif',
          }}
        >
          {toastText}
        </div>
      )}

      {/* 1. 顶部操作栏（萌系蓝色返回键 + 备忘手账标题） */}
      <div
        style={{
          height: '44px',
          background: 'linear-gradient(180deg, #A16207 0%, #854D0E 100%)',
          borderBottom: '3px solid #502428',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* 左上角蓝色圆形返回键 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #38BDF8 0%, #0284C7 100%)',
            border: '2px solid #502428',
            boxShadow: '0 2px 0 #502428, 0 4px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
          }}
          title="返回"
        >
          <ArrowLeft size={16} color="#FFFFFF" strokeWidth={3.5} />
        </button>

        {/* 居中标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookMarked size={16} color="#FDE047" strokeWidth={2.5} />
          <span
            style={{
              fontSize: '15px',
              fontWeight: 900,
              color: '#FFFFFF',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              textShadow: '1.5px 1.5px 0 #502428, -1.5px -1.5px 0 #502428, 1.5px -1.5px 0 #502428, -1.5px 1.5px 0 #502428',
              letterSpacing: '0.5px',
            }}
          >
            备忘便签
          </span>
        </div>

        {/* 右侧空位保居中 */}
        <div style={{ width: '32px' }} />
      </div>

      {/* 2. 主体工作区：左侧活页书签列 + 中间多页手账纸板 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 左侧垂直书签轨 */}
        <LeftBookmarkRail
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={(id) => setActiveCategoryId(id)}
          onOpenCreateCategory={() => setShowCreateCatModal(true)}
          onDeleteCategory={handleDeleteCategory}
        />

        {/* 中间多页活页手账纸板 */}
        <MemoStationeryPad
          category={activeCategory}
          chapter={activeChapter}
          onUpdateChapter={handleUpdateChapter}
          onOpenEditTitles={() => {
            if (!activeChapter) return;
            setChapterModalState({
              isOpen: true,
              isEdit: true,
              editingChapter: activeChapter,
            });
          }}
          onDeleteCurrentChapter={() => {
            if (activeChapter) handleDeleteChapter(activeChapter.id);
          }}
        />
      </div>

      {/* 3. 底部深黄色篇章切换托盘 */}
      <BottomChapterDock
        category={activeCategory}
        chapters={chapters}
        activeChapterId={activeChapterId}
        onSelectChapter={(id) => setActiveChapterId(id)}
        onOpenCreateChapter={() => {
          setChapterModalState({
            isOpen: true,
            isEdit: false,
          });
        }}
        onOpenEditChapter={(chap) => {
          setChapterModalState({
            isOpen: true,
            isEdit: true,
            editingChapter: chap,
          });
        }}
        onDeleteChapter={handleDeleteChapter}
      />

      {/* 新增分类弹窗 */}
      {showCreateCatModal && (
        <CreateCategoryModal
          existingCount={categories.length}
          onSave={handleSaveCategory}
          onClose={() => setShowCreateCatModal(false)}
        />
      )}

      {/* 篇章创建与标题编辑弹窗 */}
      {chapterModalState.isOpen && (
        <ChapterNamingModal
          isEditMode={chapterModalState.isEdit}
          initialChapterName={chapterModalState.editingChapter?.chapterName || ''}
          initialLevel1={chapterModalState.editingChapter?.titleLevel1 || ''}
          initialLevel2={chapterModalState.editingChapter?.titleLevel2 || ''}
          onSave={handleCreateOrEditChapterSave}
          onClose={() =>
            setChapterModalState({
              isOpen: false,
              isEdit: false,
            })
          }
        />
      )}
    </div>
  );
};
