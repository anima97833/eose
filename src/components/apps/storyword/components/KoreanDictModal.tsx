import React, { useState } from 'react';
import { KoreanLookupResult } from '../../../../core/storyword/koreanTermTypes';
import { NM } from '../storyWordNeumorphism';
import {
  Volume2,
  BookmarkPlus,
  Check,
  X,
  Languages,
  BookOpen,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface KoreanDictModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: KoreanLookupResult | null;
  rawWord: string;
  hasDictionaryInstalled: boolean;
  isLoading?: boolean;
  onOpenLexiconModal?: () => void;
  onAddToMistakes?: (term: KoreanLookupResult) => void;
}

export const KoreanDictModal: React.FC<KoreanDictModalProps> = ({
  isOpen,
  onClose,
  result,
  rawWord,
  hasDictionaryInstalled,
  isLoading = false,
  onOpenLexiconModal,
  onAddToMistakes,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  if (!isOpen) return null;

  // 韩语 TTS 语音朗读
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      setIsPlayingSound(true);
      utterance.onend = () => setIsPlayingSound(false);
      utterance.onerror = () => setIsPlayingSound(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingSound(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    if (onAddToMistakes) {
      onAddToMistakes(result);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.42)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
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
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: NM.borderSoft,
            backgroundColor: NM.cardBgActive,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexXs,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: NM.amber,
              }}
            >
              <Languages size={16} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: NM.textMain }}>
              韩语原著释义
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: NM.cardBg,
              boxShadow: NM.convexXs,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: NM.textSub,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* 弹窗内容 */}
        <div
          style={{
            padding: '18px 16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {isLoading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: NM.amber,
                }}
              >
                <Loader2 size={24} className="animate-spin" />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: NM.textMain }}>
                正在检索 “{rawWord}”...
              </div>
              <div style={{ fontSize: '12px', color: NM.textSub }}>
                智能解析形态素与词汇语境
              </div>
            </div>
          ) : result ? (
            <>
              {/* 词头与发音 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '22px',
                        fontWeight: 800,
                        color: NM.textMain,
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {result.matchedTerm.term}
                    </h3>

                    {result.matchedTerm.hanja && (
                      <span
                        style={{
                          fontSize: '13px',
                          color: NM.amber,
                          fontWeight: 700,
                          backgroundColor: NM.bgInset,
                          padding: '1px 6px',
                          borderRadius: '6px',
                          boxShadow: NM.insetXs,
                        }}
                      >
                        〔{result.matchedTerm.hanja}〕
                      </span>
                    )}
                  </div>

                  {/* 词性 / 星级标签 与 词典来源标签 */}
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {result.matchedTerm.pos && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: NM.gold,
                          backgroundColor: 'rgba(217, 119, 6, 0.09)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                        }}
                      >
                        {result.matchedTerm.pos}
                      </span>
                    )}

                    {result.isOnlineFallback ? (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#0284c7',
                          backgroundColor: 'rgba(2, 132, 199, 0.1)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Sparkles size={11} />
                        在线智能释义
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <BookOpen size={11} />
                        本地词库
                      </span>
                    )}
                  </div>
                </div>

                {/* 发音按钮 */}
                <button
                  onClick={() => handleSpeak(result.matchedTerm.term)}
                  title="朗读韩语发音"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: isPlayingSound ? NM.amber : NM.cardBg,
                    color: isPlayingSound ? '#fff' : NM.amber,
                    boxShadow: isPlayingSound ? NM.insetSm : NM.convexSm,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Volume2 size={15} />
                  <span>朗读</span>
                </button>
              </div>

              {/* 词形还原溯源提示 */}
              {result.matchType !== 'exact' && (
                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetXs,
                    fontSize: '11px',
                    color: NM.textSub,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={12} color={NM.amber} />
                  <span>
                    原著形态：<strong>{rawWord}</strong>
                    <ArrowRight size={10} style={{ display: 'inline', margin: '0 4px' }} />
                    {result.matchType === 'particle_stripped' && result.removedParticle ? (
                      <>剥离助词 <strong>{result.removedParticle}</strong> 还原</>
                    ) : result.matchType === 'verb_base' ? (
                      <>还原用言基本形 <strong>{result.baseForm}</strong></>
                    ) : (
                      <>汉字对应反查</>
                    )}
                  </span>
                </div>
              )}

              {/* 释义正文 */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: NM.textSub }}>
                  中文释义与语境
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.7',
                    color: NM.textMain,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {result.matchedTerm.summary}
                </div>
              </div>

              {/* 底部操作区 */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: isSaved ? '#10b981' : NM.cardBg,
                    color: isSaved ? '#fff' : NM.amber,
                    boxShadow: isSaved ? NM.insetSm : NM.convexSm,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isSaved ? <Check size={14} /> : <BookmarkPlus size={14} />}
                  <span>{isSaved ? '已收藏至错词本' : '收藏此词'}</span>
                </button>
              </div>
            </>
          ) : (
            /* 未匹配到 / 缺省引导态 */
            <div
              style={{
                textAlign: 'center',
                padding: '20px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: NM.textSub,
                }}
              >
                <BookOpen size={24} />
              </div>

              <div style={{ fontSize: '15px', fontWeight: 800, color: NM.textMain }}>
                {hasDictionaryInstalled ? `未在词库中查到 “${rawWord}”` : '尚未导入韩语词库'}
              </div>

              <div
                style={{
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: NM.textSub,
                  maxWidth: '280px',
                }}
              >
                {hasDictionaryInstalled
                  ? '该词可能为专有名词、复合口语或生僻词，您也可以长按划选在线技术翻译。'
                  : '您可在词库管理中上传您的本地 Yomitan / TermBank 韩语词典（.json），导入后即可享受整书点词即查！'}
              </div>

              {!hasDictionaryInstalled && onOpenLexiconModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLexiconModal();
                  }}
                  style={{
                    marginTop: '6px',
                    padding: '8px 18px',
                    borderRadius: '12px',
                    backgroundColor: NM.amber,
                    color: '#fff',
                    boxShadow: NM.convexSm,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  前往导入韩语词典
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
