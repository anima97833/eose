import React, { useState, useMemo, useEffect } from 'react';
import { StoryNovel, EnglishWord, VocabLevel } from '../../../../core/storyword/storyWordTypes';
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
} from '../../../../core/storyword/storyWordStorage';
import { StoryClozeCard } from './StoryClozeCard';
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
  const [density, setDensity] = useState(novel.insertDensity || 0.2);
  const [targetLevel, setTargetLevel] = useState<VocabLevel>(novel.targetLevel || 'cet4');
  const [selectedWord, setSelectedWord] = useState<EnglishWord | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentChapter = novel.chapters[currentIdx] || novel.chapters[0];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  // 编译中英文混合段落
  const compiledParagraphs: CompiledParagraph[] = useMemo(() => {
    if (!currentChapter) return [];
    return compileNovelText(currentChapter.originalText, targetLevel, density);
  }, [currentChapter, targetLevel, density]);

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
          {/* 难度级别切换 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: NM.textSub }}>词库难度</span>
            <div style={{ display: 'flex', gap: '6px' }}>
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
                  onClick={() => setTargetLevel(item.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: targetLevel === item.id ? NM.amber : NM.cardBg,
                    color: targetLevel === item.id ? '#fff' : NM.textSub,
                    boxShadow: targetLevel === item.id ? NM.insetXs : NM.convexXs,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 插入密度调整 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: NM.textSub }}>
              背词密度 ({Math.round(density * 100)}%)
            </span>
            <input
              type="range"
              min="0.1"
              max="0.35"
              step="0.05"
              value={density}
              onChange={e => setDensity(parseFloat(e.target.value))}
              style={{ width: '130px', accentColor: NM.amber }}
            />
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
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
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
              color: NM.amber,
              fontWeight: 600,
            }}
          >
            <Sparkles size={11} />
            <span>网文双语混编 · 爽点通关模式</span>
          </div>
        </div>

        {/* 正文渲染 */}
        {compiledParagraphs.map((para, pIdx) => {
          // 在阅读到中途（如第 2 段与第 5 段），自然嵌入 Direction B 互动通关关卡
          const insertClozeIdx = pIdx === 2 ? 0 : pIdx === 5 ? 1 : -1;
          const cloze = insertClozeIdx !== -1 ? clozeChallenges[insertClozeIdx] : null;

          return (
            <React.Fragment key={pIdx}>
              <p
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.9',
                  margin: '0 0 10px 0',
                  textIndent: '2em',
                  color: NM.textMain,
                }}
              >
                {para.tokens.map((token: StoryToken, tIdx: number) => {
                  if (token.type === 'text') {
                    return <span key={tIdx}>{token.content}</span>;
                  }

                  // 嵌入的高亮可发音单词胶囊
                  return (
                    <span
                      key={tIdx}
                      onClick={() => handleWordClick(token.word)}
                      style={{
                        display: 'inline-block',
                        margin: '0 3px',
                        padding: '1px 7px',
                        borderRadius: '6px',
                        backgroundColor: NM.cardBgActive,
                        boxShadow: NM.convexXs,
                        border: `1px solid rgba(217, 119, 6, 0.35)`,
                        color: NM.gold,
                        fontWeight: 700,
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'transform 0.1s ease',
                      }}
                      title={`${token.word.word} (${token.originalTrigger})`}
                    >
                      {token.word.word}
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
    </div>
  );
};
