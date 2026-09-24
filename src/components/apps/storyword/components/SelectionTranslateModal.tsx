import React, { useState, useEffect } from 'react';
import { NM } from '../storyWordNeumorphism';
import {
  onlineTranslate,
  TranslationResult,
} from '../../../../core/storyword/onlineTranslateService';
import { EnglishWord } from '../../../../core/storyword/storyWordTypes';
import { speakWord } from '../../../../core/storyword/storyWordStorage';
import {
  Languages,
  Volume2,
  BookmarkPlus,
  Sparkles,
  Loader2,
  X,
  Check,
  Search,
} from 'lucide-react';

interface SelectionTranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onEmbedWordIntoStory?: (chineseTrigger: string, englishWord: string, translation: string) => void;
  onAddToMistakes?: (word: EnglishWord) => void;
}

export const SelectionTranslateModal: React.FC<SelectionTranslateModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  onEmbedWordIntoStory,
  onAddToMistakes,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TranslationResult | null>(null);
  const [customWordInput, setCustomWordInput] = useState('');
  const [isEmbedded, setIsEmbedded] = useState(false);

  const doTranslate = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsEmbedded(false);
    setLoading(true);
    onlineTranslate(trimmed)
      .then(res => {
        setData(res);
        if (res.suggestedEnglishWord) {
          setCustomWordInput(res.suggestedEnglishWord);
        } else {
          setCustomWordInput(res.translatedText);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      const initial = selectedText.trim();
      setQueryInput(initial);
      if (initial) {
        doTranslate(initial);
      } else {
        setData(null);
        setCustomWordInput('');
      }
    }
  }, [isOpen, selectedText]);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    speakWord(text);
  };

  const handleEmbed = () => {
    if (!customWordInput.trim() || !onEmbedWordIntoStory || !queryInput.trim()) return;
    onEmbedWordIntoStory(
      queryInput.trim(),
      customWordInput.trim(),
      data?.translatedText || customWordInput.trim()
    );
    setIsEmbedded(true);
  };

  const handleAddMistake = () => {
    if (!onAddToMistakes || !customWordInput.trim()) return;
    const wordObj: EnglishWord = {
      word: customWordInput.trim(),
      phonetic: data?.phonetic || '',
      translation: data?.translatedText || queryInput.trim(),
      partOfSpeech: data?.dictEntries[0]?.pos || 'word',
      level: 'cet4',
      triggers: [queryInput.trim()],
    };
    onAddToMistakes(wordObj);
  };

  const isZhToEn = data?.sourceLang === 'zh-CN';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(54, 46, 34, 0.4)',
        backdropFilter: 'blur(3px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: NM.cardBg,
          borderRadius: '20px',
          boxShadow: NM.convexLg,
          border: NM.borderLight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '18px',
          gap: '14px',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Languages size={17} color={NM.amber} />
            <span style={{ fontSize: '14px', fontWeight: 800, color: NM.textMain }}>
              在线翻译与抠词
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '6px',
                backgroundColor: NM.bgInset,
                color: NM.textSub,
                fontWeight: 700,
              }}
            >
              {isZhToEn ? '中 ➔ 英' : '英 ➔ 中'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: NM.textMuted,
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 原文输入与编辑卡片 */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '12px',
            backgroundColor: NM.bgInset,
            boxShadow: NM.insetXs,
            border: NM.borderSoft,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: NM.textMuted, fontWeight: 600 }}>
              划选 / 查词原文：
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {queryInput && (
                <button
                  onClick={() => handleSpeak(queryInput)}
                  title="朗读"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: NM.amber,
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  <Volume2 size={15} />
                </button>
              )}
              <button
                onClick={() => doTranslate(queryInput)}
                title="重新翻译"
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexXs,
                  border: 'none',
                  color: NM.textMain,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Search size={11} />
                <span>翻译</span>
              </button>
            </div>
          </div>
          <textarea
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                doTranslate(queryInput);
              }
            }}
            placeholder="输入或划选要翻译的单词/句子..."
            rows={2}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: NM.textMain,
              lineHeight: '1.6',
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* 译文与词典内容 */}
        <div
          style={{
            padding: '12px',
            borderRadius: '14px',
            backgroundColor: NM.cardBg,
            boxShadow: NM.convexXs,
            border: NM.borderLight,
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '24px 0',
                color: NM.textMuted,
                fontSize: '13px',
              }}
            >
              <Loader2 size={18} color={NM.amber} className="animate-spin" />
              <span>智能翻译中...</span>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: NM.gold,
                    lineHeight: '1.6',
                  }}
                >
                  {data?.translatedText || '暂无译文'}
                </div>
                {data?.translatedText && (
                  <button
                    onClick={() => handleSpeak(data.translatedText)}
                    title="朗读译文"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: NM.amber,
                      cursor: 'pointer',
                      padding: '2px',
                      flexShrink: 0,
                    }}
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>

              {/* 多词性释义标签 (如有) */}
              {data && data.dictEntries.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {data.dictEntries.map((d, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '11px',
                        color: NM.textSub,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          color: NM.amber,
                          padding: '1px 4px',
                          borderRadius: '4px',
                          backgroundColor: NM.bgInset,
                        }}
                      >
                        {d.pos}
                      </span>
                      <span>{d.terms.join(' · ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 动作区：抠词融入剧情 & 错词收藏 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isZhToEn && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                value={customWordInput}
                onChange={e => setCustomWordInput(e.target.value)}
                placeholder="抠入正文的对应英文单词..."
                style={{
                  flex: 1,
                  height: '34px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetXs,
                  border: NM.borderSoft,
                  fontSize: '12px',
                  color: NM.textMain,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleEmbed}
                disabled={isEmbedded || !customWordInput.trim()}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  backgroundColor: isEmbedded ? NM.bgInset : NM.cardBg,
                  boxShadow: isEmbedded ? 'none' : NM.convexXs,
                  border: isEmbedded ? 'none' : NM.borderLight,
                  color: isEmbedded ? NM.textMuted : NM.amber,
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: isEmbedded ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                }}
              >
                {isEmbedded ? <Check size={14} /> : <Sparkles size={14} />}
                <span>{isEmbedded ? '已抠入' : '抠词融入'}</span>
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAddMistake}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '10px',
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexXs,
                border: NM.borderLight,
                color: NM.rose,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <BookmarkPlus size={14} />
              <span>入错词阁</span>
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '10px',
                backgroundColor: NM.bgInset,
                boxShadow: NM.convexXs,
                border: 'none',
                color: NM.textSub,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              继续阅读
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
