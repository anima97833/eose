import React, { useState, useMemo, useEffect } from 'react';
import { StoryNovel, EnglishWord, VocabLevel, CustomLexicon } from '../../../../core/storyword/storyWordTypes';
import {
  compileNovelText,
  StoryToken,
  CompiledParagraph,
} from '../../../../core/storyword/novelVocabCompiler';
import {
  generateClozeChallengesForChapter,
} from '../../../../core/storyword/storyClozeEngine';
import {
  speakWord,
  addMistakeWord,
  saveStoryNovel,
  getCustomLexiconById,
} from '../../../../core/storyword/storyWordStorage';
import { StoryClozeCard } from './StoryClozeCard';
import { SelectionTranslateModal } from './SelectionTranslateModal';
import { CustomLexiconModal } from './CustomLexiconModal';
import { NM } from '../storyWordNeumorphism';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Volume2,
  BookmarkPlus,
  Settings,
  Sparkles,
  BookOpen,
  Languages,
  FolderPlus,
} from 'lucide-react';

interface StoryWordReaderProps {
  novel: StoryNovel;
  onBack: () => void;
  onUpdateChapterIndex: (novelId: string, newIndex: number) => void;
}

export const StoryWordReader: React.FC<StoryWordReaderProps> = ({
  novel,
  onBack,
  onUpdateChapterIndex,
}) => {
  const [currentIdx, setCurrentIdx] = useState(novel.currentChapterIndex || 0);
  const [fontSize, setFontSize] = useState(16);
  const [density, setDensity] = useState(novel.insertDensity || 0.35);
  const [targetLevel, setTargetLevel] = useState<VocabLevel>(novel.targetLevel || 'cet4');
  const [strictOnly, setStrictOnly] = useState(false);
  const [selectedWord, setSelectedWord] = useState<EnglishWord | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [activeLexiconId, setActiveLexiconId] = useState<string | null>(novel.activeLexiconId || null);
  const [activeLexicon, setActiveLexicon] = useState<CustomLexicon | null>(null);
  const [isCustomLexiconModalOpen, setIsCustomLexiconModalOpen] = useState(false);

  // 纯中文原著模式 vs 爽文双语背词模式
  const [isOriginalMode, setIsOriginalMode] = useState<boolean>(false);

  // 用户划词抠词列表
  const [customWords, setCustomWords] = useState<EnglishWord[]>(novel.customWords || []);

  // 划选长按在线翻译状态
  const [selectionText, setSelectionText] = useState('');
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);

  const currentChapter = novel.chapters[currentIdx] || novel.chapters[0];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  useEffect(() => {
    if (activeLexiconId) {
      getCustomLexiconById(activeLexiconId).then(lex => {
        setActiveLexicon(lex);
      });
    } else {
      setActiveLexicon(null);
    }
  }, [activeLexiconId]);

  // 编译中英文混合段落 (融合官方考纲/私人词库 + 用户自定义在线抠入生词)
  const compiledParagraphs: CompiledParagraph[] = useMemo(() => {
    if (!currentChapter) return [];
    if (isOriginalMode) {
      // 纯原文模式：直接分割为普通段落文本，不执行任何词汇替换
      const paras = currentChapter.originalText
        .split(/\r?\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      return paras.map(p => ({
        tokens: [{ type: 'text' as const, content: p }],
      }));
    }
    return compileNovelText(
      currentChapter.originalText,
      targetLevel,
      density,
      customWords,
      strictOnly,
      activeLexicon ? activeLexicon.words : undefined
    );
  }, [currentChapter, targetLevel, density, customWords, strictOnly, activeLexicon, isOriginalMode]);

  // 生成 Direction B 剧情打脸填空关卡 (每个章节 2~3 关)
  const [clozeChallenges, setClozeChallenges] = useState(() => {
    if (!currentChapter) return [];
    return generateClozeChallengesForChapter(currentChapter.originalText, targetLevel, 2);
  });

  useEffect(() => {
    if (currentChapter) {
      setClozeChallenges(
        generateClozeChallengesForChapter(currentChapter.originalText, targetLevel, 2)
      );
    }
  }, [currentIdx, targetLevel]);

  const handleWordClick = (word: EnglishWord) => {
    setSelectedWord(word);
    speakWord(word.word);
  };

  const handleAddToMistakes = async (word: EnglishWord) => {
    await addMistakeWord(word, `来自《${novel.title}》${currentChapter?.title || ''}`);
    showToast('已入错词阁');
    setSelectedWord(null);
  };

  // 划选/长按文本处理
  const updateSelectionFromWindow = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }
    const text = selection.toString().trim();
    if (!text || text.length > 500) {
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        setSelectionText(text);
        setSelectionCoords({
          x: Math.max(12, Math.min(window.innerWidth - 130, rect.left + rect.width / 2 - 55)),
          y: Math.max(50, rect.top - 46),
        });
      }
    } catch (e) {
      console.error('Failed to get selection range', e);
    }
  };

  const handleTextSelection = () => {
    setTimeout(updateSelectionFromWindow, 80);
  };

  // 全局 selectionchange 监听：完美支持移动端长按拖拽句柄及 PC 划词
  useEffect(() => {
    let timer: any = null;
    const handleSelectionChange = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;
        const text = selection.toString().trim();
        if (!text || text.length > 500) return;

        const anchorNode = selection.anchorNode;
        const readerEl = document.querySelector('.story-reader-content');
        if (readerEl && anchorNode && readerEl.contains(anchorNode)) {
          updateSelectionFromWindow();
        }
      }, 100);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      clearTimeout(timer);
    };
  }, []);

  // 点击外部清除浮动划词按钮
  useEffect(() => {
    const handleDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('.selection-translate-pill')) {
        setSelectionCoords(null);
      }
    };
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, []);

  // 将划选的词在线抠入网文剧情中
  const handleEmbedWordIntoStory = async (
    chineseTrigger: string,
    englishWord: string,
    translation: string
  ) => {
    const newWord: EnglishWord = {
      word: englishWord.trim(),
      phonetic: '',
      translation: translation,
      partOfSpeech: 'word',
      level: targetLevel,
      triggers: [chineseTrigger.trim()],
    };

    const nextCustomWords = [
      ...customWords.filter((w: EnglishWord) => w.word.toLowerCase() !== newWord.word.toLowerCase()),
      newWord,
    ];
    setCustomWords(nextCustomWords);

    // 持久化保存到当前小说
    const updatedNovel: StoryNovel = {
      ...novel,
      customWords: nextCustomWords,
    };
    await saveStoryNovel(updatedNovel);
    showToast(`已抠词融入剧情: ${chineseTrigger} ➔ ${englishWord}`);
  };

  const handlePrevChapter = () => {
    if (currentIdx > 0) {
      const nextIdx = currentIdx - 1;
      setCurrentIdx(nextIdx);
      onUpdateChapterIndex(novel.id, nextIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextChapter = () => {
    if (currentIdx < novel.chapters.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      onUpdateChapterIndex(novel.id, nextIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 顶部导航条 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: NM.cardBg,
          boxShadow: NM.convexSm,
          borderBottom: NM.borderLight,
          zIndex: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: NM.textMain,
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={18} />
          <span>书架</span>
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '180px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: NM.textMain,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
              textAlign: 'center',
            }}
          >
            {novel.title}
          </span>
          <span style={{ fontSize: '10px', color: NM.textMuted }}>
            {currentIdx + 1} / {novel.chapters.length} 章节
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 一键切回原文 / 切回双语背词按钮 */}
          <button
            onClick={() => {
              const next = !isOriginalMode;
              setIsOriginalMode(next);
              showToast(next ? '已切回【纯享中文原文】模式' : '已切回【爽文双语背词】模式');
            }}
            title={isOriginalMode ? '当前为纯享原著，点击切回双语背词' : '当前为双语背词，点击一键切回纯享原著'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0 9px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: isOriginalMode ? NM.cardBgActive : NM.cardBg,
              boxShadow: isOriginalMode ? NM.insetXs : NM.convexXs,
              border: isOriginalMode ? `1.5px solid ${NM.amber}` : NM.borderLight,
              cursor: 'pointer',
              color: isOriginalMode ? NM.amber : NM.textSub,
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {isOriginalMode ? <BookOpen size={14} color={NM.amber} /> : <Sparkles size={14} color={NM.amber} />}
            <span>{isOriginalMode ? '切回背词' : '切回原文'}</span>
          </button>

          <button
            onClick={() => {
              const selection = window.getSelection();
              const text = selection ? selection.toString().trim() : '';
              setSelectionText(text);
              setIsTranslateModalOpen(true);
            }}
            title="划词 / 查词翻译"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexXs,
              border: NM.borderLight,
              cursor: 'pointer',
              color: NM.amber,
            }}
          >
            <Languages size={16} />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: NM.cardBg,
              boxShadow: showSettings ? NM.insetSm : NM.convexXs,
              border: NM.borderLight,
              cursor: 'pointer',
              color: NM.textSub,
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* 设置抽屉面板 */}
      {showSettings && (
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: NM.cardBg,
            boxShadow: NM.insetSm,
            borderBottom: NM.borderSoft,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 9,
          }}
        >
          {/* 阅读模式切换：爽文背词 vs 纯享原文 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: NM.textSub }}>阅读模式</span>
              <span style={{ fontSize: '11px', color: isOriginalMode ? NM.gold : NM.amber, fontWeight: 700 }}>
                {isOriginalMode ? '📖 纯享原著 (无插词)' : '✨ 双语融合 (沉浸背词)'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '4px',
                borderRadius: '10px',
                backgroundColor: NM.bgInset,
                boxShadow: NM.insetXs,
              }}
            >
              <button
                onClick={() => {
                  setIsOriginalMode(false);
                  showToast('已开启【爽文双语背词】模式');
                }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: !isOriginalMode ? NM.cardBg : 'transparent',
                  color: !isOriginalMode ? NM.amber : NM.textSub,
                  boxShadow: !isOriginalMode ? NM.convexXs : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sparkles size={13} />
                <span>爽文背词 (双语)</span>
              </button>

              <button
                onClick={() => {
                  setIsOriginalMode(true);
                  showToast('已切回【纯享中文原文】模式');
                }}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isOriginalMode ? NM.cardBg : 'transparent',
                  color: isOriginalMode ? NM.gold : NM.textSub,
                  boxShadow: isOriginalMode ? NM.convexXs : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <BookOpen size={13} />
                <span>切回原文 (纯中文)</span>
              </button>
            </div>
          </div>
          {/* 难度级别切换 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: NM.textSub }}>当前词库</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                {(
                  [
                    { id: 'cet4', label: '四级' },
                    { id: 'cet6', label: '六级' },
                    { id: 'kaoyan', label: '考研' },
                    { id: 'ielts', label: '雅思' },
                  ] as { id: VocabLevel; label: string }[]
                ).map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTargetLevel(item.id);
                      setActiveLexiconId(null);
                      setActiveLexicon(null);
                      const updated: StoryNovel = { ...novel, targetLevel: item.id, activeLexiconId: null };
                      saveStoryNovel(updated);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: !activeLexiconId && targetLevel === item.id ? NM.amber : NM.cardBg,
                      color: !activeLexiconId && targetLevel === item.id ? '#fff' : NM.textSub,
                      boxShadow: !activeLexiconId && targetLevel === item.id ? NM.insetXs : NM.convexXs,
                    }}
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  onClick={() => setIsCustomLexiconModalOpen(true)}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeLexiconId ? NM.amber : NM.cardBg,
                    color: activeLexiconId ? '#fff' : NM.amber,
                    boxShadow: activeLexiconId ? NM.insetXs : NM.convexXs,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <FolderPlus size={12} />
                  <span>{activeLexicon ? activeLexicon.name.slice(0, 4) : '私人'}</span>
                </button>
              </div>
            </div>

            {activeLexicon && (
              <div
                style={{
                  fontSize: '11px',
                  color: NM.amber,
                  backgroundColor: NM.bgInset,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>已启用私人词库：《{activeLexicon.name}》（{activeLexicon.wordCount}词）</span>
                <span
                  onClick={() => setIsCustomLexiconModalOpen(true)}
                  style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
                >
                  管理/切换
                </span>
              </div>
            )}
          </div>

          {/* 词库范围模式 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: NM.textSub }}>过滤范围</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setStrictOnly(false)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: !strictOnly ? NM.amber : NM.cardBg,
                  color: !strictOnly ? '#fff' : NM.textSub,
                  boxShadow: !strictOnly ? NM.insetXs : NM.convexXs,
                }}
              >
                向下兼容全部
              </button>
              <button
                onClick={() => setStrictOnly(true)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: strictOnly ? NM.amber : NM.cardBg,
                  color: strictOnly ? '#fff' : NM.textSub,
                  boxShadow: strictOnly ? NM.insetXs : NM.convexXs,
                }}
              >
                仅当前考纲专有
              </button>
            </div>
          </div>

          {/* 插入密度调整 (支持 10% ~ 100% 极限制霸) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: NM.textSub }}>
                背词密度 ({Math.round(density * 100)}%)
              </span>
              <span style={{ fontSize: '11px', color: NM.amber, fontWeight: 700 }}>
                {density <= 0.2
                  ? '微量熏陶'
                  : density <= 0.45
                  ? '适度沉浸'
                  : density <= 0.8
                  ? '强化突击'
                  : '全书极限制霸 (100%遇到必抠)'}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={density}
              onChange={e => setDensity(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: NM.amber }}
            />
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
              {[
                { val: 0.15, label: '15% 微量' },
                { val: 0.35, label: '35% 适度' },
                { val: 0.70, label: '70% 强化' },
                { val: 1.00, label: '100% 极限制霸' },
              ].map(preset => (
                <button
                  key={preset.val}
                  onClick={() => setDensity(preset.val)}
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor:
                      Math.abs(density - preset.val) < 0.03 ? NM.amber : NM.bgInset,
                    color: Math.abs(density - preset.val) < 0.03 ? '#fff' : NM.textSub,
                    boxShadow: Math.abs(density - preset.val) < 0.03 ? NM.insetXs : 'none',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 字号大小调整 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: NM.textSub }}>阅读字号</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                style={{
                  padding: '2px 10px',
                  borderRadius: '6px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexXs,
                  border: NM.borderLight,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: NM.textMain,
                }}
              >
                A-
              </button>
              <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                style={{
                  padding: '2px 10px',
                  borderRadius: '6px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexXs,
                  border: NM.borderLight,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: NM.textMain,
                }}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 阅读核心区域 */}
      <div
        className="story-reader-content allow-text-selection"
        data-selectable="true"
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          userSelect: 'text',
          WebkitUserSelect: 'text',
        }}
      >
        {/* 章节标题 */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2
            style={{
              fontSize: `${fontSize + 3}px`,
              fontWeight: 800,
              color: NM.textMain,
              margin: '0 0 6px 0',
            }}
          >
            {currentChapter?.title}
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: NM.bgInset,
              boxShadow: NM.insetXs,
              fontSize: '11px',
              color: isOriginalMode ? NM.gold : NM.amber,
              fontWeight: 600,
            }}
          >
            {isOriginalMode ? <BookOpen size={11} /> : <Sparkles size={11} />}
            <span>{isOriginalMode ? '纯享原著阅读模式 (点击顶部或设置可切回背词)' : '网文双语混编 · 爽点通关模式'}</span>
          </div>
        </div>

        {/* 正文渲染 */}
        {compiledParagraphs.map((para, pIdx) => {
          // 仅在爽词模式下嵌入 Direction B 互动通关关卡（纯原文模式保持沉浸连贯）
          const insertClozeIdx = !isOriginalMode && (pIdx === 2 ? 0 : pIdx === 5 ? 1 : -1);
          const cloze = typeof insertClozeIdx === 'number' && insertClozeIdx !== -1 ? clozeChallenges[insertClozeIdx] : null;

          return (
            <React.Fragment key={pIdx}>
              <p
                className="allow-text-selection"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.9',
                  margin: '0 0 10px 0',
                  textIndent: '2em',
                  color: NM.textMain,
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                }}
              >
                {para.tokens.map((token: StoryToken, tIdx: number) => {
                  if (token.type === 'text') {
                    return (
                      <span
                        key={tIdx}
                        className="story-text-token allow-text-selection"
                        style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                      >
                        {token.content}
                      </span>
                    );
                  }

                  // 嵌入的高亮可发音单词胶囊
                  return (
                    <span
                      key={tIdx}
                      onClick={() => handleWordClick(token.word)}
                      className="allow-text-selection"
                      style={{
                        display: 'inline-block',
                        textIndent: 0, // 关键：重置从父级 <p> 继承的 textIndent: 2em，杜绝单词左侧大面积空白遮挡！
                        margin: '0 2px',
                        padding: '1px 6px',
                        borderRadius: '5px',
                        lineHeight: 1.3,
                        verticalAlign: 'baseline',
                        backgroundColor: NM.cardBgActive,
                        boxShadow: NM.convexXs,
                        border: `1px solid rgba(217, 119, 6, 0.35)`,
                        color: NM.gold,
                        fontWeight: 700,
                        cursor: 'pointer',
                        userSelect: 'text',
                        WebkitUserSelect: 'text',
                        transition: 'transform 0.1s ease',
                      }}
                      title={`${token.word.word.trim()} (${token.originalTrigger})`}
                    >
                      {token.word.word.trim()}
                    </span>
                  );
                })}
              </p>

              {/* Direction B 互动关卡卡片嵌入 */}
              {cloze && (
                <StoryClozeCard
                  key={cloze.id}
                  challenge={cloze}
                  onChallengeComplete={(cId, res) => {
                    showToast(res.isCorrect ? '爽点爆发!' : '已入错阁');
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* 底部翻页控制台 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: NM.borderSoft,
          }}
        >
          <button
            onClick={handlePrevChapter}
            disabled={currentIdx <= 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: currentIdx <= 0 ? NM.bgInset : NM.cardBg,
              color: currentIdx <= 0 ? NM.textMuted : NM.textMain,
              boxShadow: currentIdx <= 0 ? 'none' : NM.convexSm,
              border: NM.borderLight,
              cursor: currentIdx <= 0 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            <ChevronLeft size={16} />
            <span>上一章</span>
          </button>

          <span style={{ fontSize: '12px', color: NM.textMuted, fontWeight: 600 }}>
            第 {currentIdx + 1} 章 / 共 {novel.chapters.length} 章
          </span>

          <button
            onClick={handleNextChapter}
            disabled={currentIdx >= novel.chapters.length - 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor:
                currentIdx >= novel.chapters.length - 1 ? NM.bgInset : NM.cardBg,
              color:
                currentIdx >= novel.chapters.length - 1 ? NM.textMuted : NM.textMain,
              boxShadow:
                currentIdx >= novel.chapters.length - 1 ? 'none' : NM.convexSm,
              border: NM.borderLight,
              cursor:
                currentIdx >= novel.chapters.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            <span>下一章</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 词汇释义浮层弹窗 */}
      {selectedWord && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            backgroundColor: NM.cardBg,
            boxShadow: NM.convexLg,
            border: NM.borderLight,
            borderRadius: '16px',
            padding: '16px',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
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
              <span style={{ fontSize: '18px', fontWeight: 800, color: NM.gold }}>
                {selectedWord.word}
              </span>
              <span style={{ fontSize: '13px', color: NM.textSub }}>
                {selectedWord.phonetic}
              </span>
              <button
                onClick={() => speakWord(selectedWord.word)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexXs,
                  border: 'none',
                  cursor: 'pointer',
                  color: NM.amber,
                }}
              >
                <Volume2 size={14} />
              </button>
            </div>

            <button
              onClick={() => setSelectedWord(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                color: NM.textMuted,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ fontSize: '14px', color: NM.textMain, fontWeight: 600 }}>
            <span style={{ color: NM.amber, marginRight: '6px' }}>
              {selectedWord.partOfSpeech}
            </span>
            <span>{selectedWord.translation}</span>
          </div>

          {selectedWord.example && (
            <div
              style={{
                fontSize: '12px',
                color: NM.textSub,
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: NM.bgInset,
              }}
            >
              例句：{selectedWord.example}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            <button
              onClick={() => handleAddToMistakes(selectedWord)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 14px',
                borderRadius: '10px',
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexXs,
                border: NM.borderLight,
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                color: NM.textMain,
              }}
            >
              <BookmarkPlus size={14} color={NM.amber} />
              <span>入错词阁</span>
            </button>
          </div>
        </div>
      )}

      {/* 轻提示 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: 'rgba(54, 46, 34, 0.92)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 99,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 划选/长按浮动入口胶囊 */}
      {selectionCoords && selectionText && !isTranslateModalOpen && (
        <button
          className="selection-translate-pill"
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchStart={e => {
            e.stopPropagation();
          }}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setIsTranslateModalOpen(true);
            setSelectionCoords(null);
          }}
          style={{
            position: 'fixed',
            left: `${selectionCoords.x}px`,
            top: `${selectionCoords.y}px`,
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '20px',
            backgroundColor: NM.cardBg,
            boxShadow: NM.convex,
            border: `1.5px solid ${NM.amber}`,
            color: NM.amber,
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <Languages size={15} />
          <span>翻译 / 抠词</span>
        </button>
      )}

      {/* 划选/长按在线翻译与剧情抠词融入弹窗 */}
      <SelectionTranslateModal
        isOpen={isTranslateModalOpen}
        onClose={() => {
          setIsTranslateModalOpen(false);
          setSelectionText('');
        }}
        selectedText={selectionText}
        onEmbedWordIntoStory={handleEmbedWordIntoStory}
        onAddToMistakes={handleAddToMistakes}
      />

      {/* 私人自定义词库管理与导入弹窗 */}
      <CustomLexiconModal
        isOpen={isCustomLexiconModalOpen}
        onClose={() => setIsCustomLexiconModalOpen(false)}
        activeLexiconId={activeLexiconId}
        onSelectLexicon={lex => {
          const lexId = lex ? lex.id : null;
          setActiveLexiconId(lexId);
          setActiveLexicon(lex);
          const updated: StoryNovel = { ...novel, activeLexiconId: lexId };
          saveStoryNovel(updated);
          showToast(lex ? `已启用私人词库《${lex.name}》` : '已切回官方考纲词库');
        }}
      />
    </div>
  );
};
