import React, { useState, useEffect } from 'react';
import { StoryNovel, VocabLevel } from '../../../core/storyword/storyWordTypes';
import {
  getAllStoryNovels,
  saveStoryNovel,
  deleteStoryNovel,
  resetPresetNovels,
  getUserSettings,
  saveUserSettings,
} from '../../../core/storyword/storyWordStorage';
import { loadRPGProfile } from '../../../core/rpg/rpgStorage';
import { StoryWordReader } from './components/StoryWordReader';
import { BookSourceModal } from './components/BookSourceModal';
import { MistakeVaultModal } from './components/MistakeVaultModal';
import { NM } from './storyWordNeumorphism';
import {
  searchFromImportedSources,
  addSearchedNovelToShelf,
  SearchNovelResult,
} from '../../../core/storyword/novelSearchEngine';
import { CustomLexiconModal } from './components/CustomLexiconModal';
import {
  BookOpen,
  Globe,
  Bookmark,
  Sparkles,
  Flame,
  Plus,
  Trash2,
  Trophy,
  Zap,
  ArrowLeft,
  Search,
  X,
  Loader2,
  FolderPlus,
} from 'lucide-react';

interface StoryWordAppProps {
  onBack?: () => void;
}

export const StoryWordApp: React.FC<StoryWordAppProps> = ({ onBack }) => {
  const [novels, setNovels] = useState<StoryNovel[]>([]);
  const [activeNovel, setActiveNovel] = useState<StoryNovel | null>(null);
  const [targetLevel, setTargetLevel] = useState<VocabLevel>('cet4');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isMistakeModalOpen, setIsMistakeModalOpen] = useState(false);
  const [isLexiconModalOpen, setIsLexiconModalOpen] = useState(false);
  const [rpgProfile, setRpgProfile] = useState<any>(null);

  // 纯书源实时搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchNovelResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    try {
      const res = await searchFromImportedSources(searchQuery.trim());
      if (res.error) {
        setSearchError(res.error);
        setSearchResults([]);
      } else {
        setSearchResults(res.results);
      }
    } catch (err: any) {
      setSearchError(err.message || '搜索失败');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setSearchError(null);
  };

  const handleAddSearchedBook = async (item: SearchNovelResult) => {
    setAddingId(item.id);
    try {
      const newNovel = await addSearchedNovelToShelf(item, targetLevel);
      await loadNovels();
      showToast('已加入书架');
      handleClearSearch();
      setActiveNovel(newNovel);
    } catch (err: any) {
      showToast(err.message || '添加失败');
    } finally {
      setAddingId(null);
    }
  };

  const loadNovels = async () => {
    const list = await getAllStoryNovels();
    setNovels(list);
  };

  const loadProfile = () => {
    try {
      const p = loadRPGProfile();
      setRpgProfile(p);
    } catch (err) {
      console.warn('Failed to load RPG profile in StoryWordApp', err);
    }
  };

  useEffect(() => {
    loadNovels();
    loadProfile();
    const settings = getUserSettings();
    if (settings && settings.targetLevel) {
      setTargetLevel(settings.targetLevel);
    }

    // 检查是否有来自灵动岛错词突袭的唤醒指令
    const checkMistakeOpen = () => {
      if (sessionStorage.getItem('cloudfly_storyword_open_mistakes') === 'true') {
        sessionStorage.removeItem('cloudfly_storyword_open_mistakes');
        setIsMistakeModalOpen(true);
      }
    };
    checkMistakeOpen();
    window.addEventListener('cloudfly_open_storyword_mistakes', checkMistakeOpen);
    return () => {
      window.removeEventListener('cloudfly_open_storyword_mistakes', checkMistakeOpen);
    };
  }, []);

  const handleSelectLevel = (lvl: VocabLevel) => {
    setTargetLevel(lvl);
    saveUserSettings({ targetLevel: lvl });
  };

  const handleUpdateChapter = async (novelId: string, newIndex: number) => {
    const target = novels.find(n => n.id === novelId);
    if (target) {
      target.currentChapterIndex = newIndex;
      target.updatedAt = Date.now();
      await saveStoryNovel(target);
      await loadNovels();
    }
  };

  const handleDeleteNovel = async (e: React.MouseEvent, novel: StoryNovel) => {
    e.stopPropagation();
    if (window.confirm(`确定要从书架删除《${novel.title}》吗？`)) {
      await deleteStoryNovel(novel.id);
      await loadNovels();
      showToast(`已从书架移除《${novel.title}》`);
    }
  };

  // 如果正在阅读小说，全屏显示阅读器
  if (activeNovel) {
    return (
      <StoryWordReader
        novel={activeNovel}
        onBack={() => {
          setActiveNovel(null);
          loadNovels();
          loadProfile();
        }}
        onUpdateChapterIndex={handleUpdateChapter}
      />
    );
  }

  const levelLabels: Record<VocabLevel, string> = {
    cet4: '大学四级',
    cet6: '大学六级',
    kaoyan: '考研必背',
    ielts: '雅思高频',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: NM.bg,
        color: NM.textMain,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部应用栏 */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: NM.cardBg,
          boxShadow: NM.convexSm,
          borderBottom: NM.borderLight,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: NM.textMain,
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                border: NM.borderLight,
                cursor: 'pointer',
                padding: 0,
                marginRight: '4px',
              }}
              title="返回桌面"
            >
              <ArrowLeft size={17} />
            </button>
          )}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexXs,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={20} color={NM.amber} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: NM.textMain }}>
              爽文背词
            </div>
            <div style={{ fontSize: '11px', color: NM.textMuted }}>
              网文剧情 · 互动通关 · 打脸背词
            </div>
          </div>
        </div>

        {/* 顶部快捷操作（纯图标按钮，避免标题栏拥挤） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => setIsLexiconModalOpen(true)}
            title="私人词库"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexXs,
              border: NM.borderLight,
              cursor: 'pointer',
              color: NM.amber,
              padding: 0,
              flexShrink: 0,
            }}
          >
            <FolderPlus size={17} />
          </button>

          <button
            onClick={() => setIsMistakeModalOpen(true)}
            title="错词阁"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexXs,
              border: NM.borderLight,
              cursor: 'pointer',
              color: NM.rose,
              padding: 0,
              flexShrink: 0,
            }}
          >
            <Bookmark size={17} />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* 简单干练的纯书源搜索框（置顶显眼位置） */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div
              style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search
                size={15}
                color={NM.textMuted}
                style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="搜索书名或作者..."
                style={{
                  width: '100%',
                  height: '40px',
                  paddingLeft: '36px',
                  paddingRight: searchQuery ? '32px' : '12px',
                  borderRadius: '12px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.insetSm,
                  border: NM.borderLight,
                  color: NM.textMain,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: NM.textMuted,
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              style={{
                height: '40px',
                padding: '0 16px',
                borderRadius: '12px',
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexXs,
                border: NM.borderLight,
                color: NM.amber,
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              {isSearching ? <Loader2 size={14} className="animate-spin" /> : <span>搜索</span>}
            </button>
          </div>

          {/* 实时书源检索结果面板 */}
          {hasSearched && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: NM.cardBg,
                padding: '12px',
                borderRadius: '12px',
                boxShadow: NM.insetXs,
                border: NM.borderLight,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 800, color: NM.textSub }}>
                  书源搜索结果 ({searchResults.length})
                </span>
                <button
                  onClick={handleClearSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: NM.textMuted,
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: '2px 4px',
                  }}
                >
                  关闭
                </button>
              </div>

              {searchError ? (
                <div style={{ fontSize: '12px', color: NM.rose, padding: '6px 0' }}>
                  {searchError}
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ fontSize: '12px', color: NM.textMuted, padding: '6px 0' }}>
                  未从当前书源中检索到结果
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}
                >
                  {searchResults.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: NM.cardBg,
                        boxShadow: NM.convexXs,
                        border: NM.borderLight,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: NM.textMain,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.title}
                        </div>
                        <div style={{ fontSize: '11px', color: NM.textMuted }}>
                          {item.author} · {item.sourceName}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddSearchedBook(item)}
                        disabled={addingId === item.id}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: NM.amber,
                          color: '#fff',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        {addingId === item.id ? '加入中...' : '+ 书架'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 难度考级选择 Pill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: NM.textSub }}>
            当前目标词库
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
            }}
          >
            {(['cet4', 'cet6', 'kaoyan', 'ielts'] as VocabLevel[]).map(lvl => {
              const isSelected = targetLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => handleSelectLevel(lvl)}
                  style={{
                    padding: '8px 0',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? NM.amber : NM.cardBg,
                    color: isSelected ? '#fff' : NM.textSub,
                    boxShadow: isSelected ? NM.insetXs : NM.convexXs,
                    border: isSelected ? 'none' : NM.borderLight,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {levelLabels[lvl]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 书架列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} color={NM.amber} />
              <span style={{ fontSize: '14px', fontWeight: 800, color: NM.textMain }}>
                书架 ({novels.length})
              </span>
            </div>

            <button
              onClick={() => setIsSourceModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexXs,
                border: NM.borderLight,
                fontSize: '11px',
                fontWeight: 700,
                color: NM.gold,
                cursor: 'pointer',
              }}
            >
              <Globe size={12} color={NM.gold} />
              <span>导入书源</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {novels.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: NM.cardBg,
                  borderRadius: '16px',
                  boxShadow: NM.insetSm,
                  border: NM.borderSoft,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <BookOpen size={36} color={NM.textMuted} />
                <div style={{ fontSize: '13px', color: NM.textSub, fontWeight: 700 }}>
                  书架当前暂无书籍
                </div>
                <div style={{ fontSize: '11px', color: NM.textMuted, maxWidth: '280px', lineHeight: 1.5 }}>
                  您可以在上方「导入书源」录入 EPUB / MOBI / TXT 电子书，或一键恢复内置爽文小说
                </div>
                <button
                  onClick={async () => {
                    const restored = await resetPresetNovels();
                    setNovels(restored);
                    showToast('已恢复预设精选爽文小说');
                  }}
                  style={{
                    marginTop: '6px',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexSm,
                    border: NM.borderLight,
                    color: NM.amber,
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  恢复预设精选爽文
                </button>
              </div>
            ) : (
              novels.map(n => (
                <div
                  key={n.id}
                  onClick={() => setActiveNovel(n)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexSm,
                    border: NM.borderLight,
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '12px',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {/* 拟物小说书脊 */}
                  <div
                    style={{
                      width: '42px',
                      height: '58px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #E6D5B8, #C9B28F)',
                      boxShadow: NM.convexXs,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      borderLeft: '3px solid #8B6E4E',
                    }}
                  >
                    <BookOpen size={18} color="#5D4528" />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 800, color: NM.textMain }}>
                        {n.title}
                      </span>
                      <button
                        onClick={e => handleDeleteNovel(e, n)}
                        title={`从书架删除《${n.title}》`}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: NM.textMuted,
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.15s, background-color 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.color = NM.rose;
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.color = NM.textMuted;
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  <div
                    style={{
                      fontSize: '11px',
                      color: NM.textSub,
                      marginTop: '4px',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {n.intro || n.chapters[0]?.originalText.slice(0, 50)}...
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '6px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: NM.textMuted }}>
                      作者: {n.author} · {n.chapters.length} 章节
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: NM.amber,
                        backgroundColor: NM.bgInset,
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      读至第 {(n.currentChapterIndex || 0) + 1} 章
                    </span>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>

      {/* 弹窗 */}
      <BookSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        targetLevel={targetLevel}
        onNovelAdded={newNovel => {
          loadNovels();
          setActiveNovel(newNovel);
        }}
      />

      <MistakeVaultModal
        isOpen={isMistakeModalOpen}
        onClose={() => setIsMistakeModalOpen(false)}
      />

      <CustomLexiconModal
        isOpen={isLexiconModalOpen}
        onClose={() => setIsLexiconModalOpen(false)}
        onSelectLexicon={lex => {
          showToast(lex ? `已启用私人词库《${lex.name}》` : '已切回官方考纲词库');
        }}
      />

      {/* 简易轻量 Toast 提示 */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(30, 34, 45, 0.92)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 9999,
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
