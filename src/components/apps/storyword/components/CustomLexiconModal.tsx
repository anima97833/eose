import React, { useState, useEffect } from 'react';
import { NM } from '../storyWordNeumorphism';
import { CustomLexicon, EnglishWord } from '../../../../core/storyword/storyWordTypes';
import {
  loadAllCustomLexicons,
  saveCustomLexicon,
  deleteCustomLexicon,
} from '../../../../core/storyword/storyWordStorage';
import {
  sniffAndParseLexiconText,
  enrichPendingWordsWithTranslation,
  ParsedLexiconPreview,
} from '../../../../core/storyword/customLexiconEngine';
import {
  FolderPlus,
  FileText,
  Clipboard,
  Upload,
  Trash2,
  Check,
  Sparkles,
  Loader2,
  X,
  BookOpen,
  Info,
} from 'lucide-react';

interface CustomLexiconModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLexiconId?: string | null;
  onSelectLexicon: (lexicon: CustomLexicon | null) => void;
}

export const CustomLexiconModal: React.FC<CustomLexiconModalProps> = ({
  isOpen,
  onClose,
  activeLexiconId,
  onSelectLexicon,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'import'>('list');
  const [lexicons, setLexicons] = useState<CustomLexicon[]>([]);
  const [loading, setLoading] = useState(false);

  // 导入状态
  const [lexiconName, setLexiconName] = useState('');
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedLexiconPreview | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState({ current: 0, total: 0 });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  const loadLexicons = async () => {
    setLoading(true);
    try {
      const list = await loadAllCustomLexicons();
      setLexicons(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLexicons();
    }
  }, [isOpen]);

  // 实时嗅探解析输入文本
  useEffect(() => {
    if (!rawText.trim()) {
      setParsedPreview(null);
      return;
    }
    const timer = setTimeout(() => {
      const res = sniffAndParseLexiconText(rawText);
      setParsedPreview(res);
    }, 150);
    return () => clearTimeout(timer);
  }, [rawText]);

  if (!isOpen) return null;

  // 处理文件上传 (.txt, .csv, .tsv, .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!lexiconName.trim()) {
      setLexiconName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        showToast(`已载入文件：${file.name}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 确认导入并创建词库
  const handleConfirmImport = async () => {
    if (!rawText.trim()) {
      showToast('请先输入或上传词库内容');
      return;
    }
    if (!parsedPreview || parsedPreview.totalCount === 0) {
      showToast('未识别到有效的单词内容，请检查格式');
      return;
    }

    const finalName = lexiconName.trim() || `私人词库_${new Date().toLocaleDateString()}`;
    let finalWords: EnglishWord[] = [...parsedPreview.readyWords];

    // 如果包含纯英文单词，调用技术翻译补齐释义与 triggers
    if (parsedPreview.pendingPureEnglish.length > 0) {
      setIsTranslating(true);
      setTranslateProgress({ current: 0, total: parsedPreview.pendingPureEnglish.length });
      try {
        const enriched = await enrichPendingWordsWithTranslation(
          parsedPreview.pendingPureEnglish,
          (completed, total) => {
            setTranslateProgress({ current: completed, total });
          }
        );
        finalWords = [...finalWords, ...enriched];
      } catch (err) {
        console.error('翻译补齐出错', err);
        showToast('部分单词翻译稍有延迟，已尽量提取');
      } finally {
        setIsTranslating(false);
      }
    }

    if (finalWords.length === 0) {
      showToast('生成有效生词数量为 0');
      return;
    }

    const newLexicon: CustomLexicon = {
      id: `lex_${Date.now()}`,
      name: finalName,
      wordCount: finalWords.length,
      words: finalWords,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sourceFormat: parsedPreview.formatLabel,
    };

    await saveCustomLexicon(newLexicon);
    showToast(`成功创建词库《${finalName}》（${finalWords.length}词）`);
    setRawText('');
    setLexiconName('');
    setParsedPreview(null);
    await loadLexicons();
    setActiveTab('list');
    onSelectLexicon(newLexicon);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`确定要删除私人词库《${name}》吗？`)) {
      await deleteCustomLexicon(id);
      if (activeLexiconId === id) {
        onSelectLexicon(null);
      }
      await loadLexicons();
      showToast('词库已删除');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(54, 46, 34, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 210,
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
          maxWidth: '430px',
          maxHeight: '88vh',
          backgroundColor: NM.cardBg,
          borderRadius: '22px',
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
            padding: '16px 18px',
            borderBottom: NM.borderSoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: NM.cardBg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={18} color={NM.amber} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: NM.textMain }}>
              私人自定义词库
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: NM.textMuted,
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 选项卡切换 */}
        <div
          style={{
            display: 'flex',
            padding: '8px 16px',
            gap: '8px',
            backgroundColor: NM.bgInset,
          }}
        >
          <button
            onClick={() => setActiveTab('list')}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: '10px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'list' ? NM.cardBg : 'transparent',
              color: activeTab === 'list' ? NM.amber : NM.textSub,
              boxShadow: activeTab === 'list' ? NM.convexXs : 'none',
            }}
          >
            我的词库 ({lexicons.length})
          </button>

          <button
            onClick={() => setActiveTab('import')}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: '10px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'import' ? NM.cardBg : 'transparent',
              color: activeTab === 'import' ? NM.amber : NM.textSub,
              boxShadow: activeTab === 'import' ? NM.convexXs : 'none',
            }}
          >
            ➕ 导入 / 粘贴新词库
          </button>
        </div>

        {/* 主体内容滚动区 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {activeTab === 'list' ? (
            /* =================== TAB 1: 词库列表 =================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 官方考纲选项卡片 */}
              <div
                onClick={() => onSelectLexicon(null)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: !activeLexiconId ? NM.cardBgActive : NM.cardBg,
                  boxShadow: !activeLexiconId ? NM.insetSm : NM.convexSm,
                  border: !activeLexiconId ? `1.5px solid ${NM.amber}` : NM.borderLight,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={15} color={NM.amber} />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: NM.textMain }}>
                      官方四大考纲词库
                    </span>
                    {!activeLexiconId && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#fff',
                          backgroundColor: NM.amber,
                          padding: '1px 6px',
                          borderRadius: '8px',
                          fontWeight: 700,
                        }}
                      >
                        当前生效
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: NM.textMuted, marginTop: '3px' }}>
                    四级 / 六级 / 考研 / 雅思 多级精选词汇
                  </div>
                </div>

                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${!activeLexiconId ? NM.amber : NM.textMuted}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: !activeLexiconId ? NM.amber : 'transparent',
                    color: '#fff',
                  }}
                >
                  {!activeLexiconId && <Check size={13} strokeWidth={3} />}
                </div>
              </div>

              {/* 私人词库列表 */}
              {lexicons.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '30px 10px',
                    color: NM.textMuted,
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <FileText size={32} opacity={0.4} />
                  <span>暂无私人词库，可点击上方「导入 / 粘贴新词库」一键建立！</span>
                  <button
                    onClick={() => setActiveTab('import')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      backgroundColor: NM.cardBg,
                      boxShadow: NM.convexXs,
                      border: NM.borderLight,
                      color: NM.amber,
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    立即导入第一个词库
                  </button>
                </div>
              ) : (
                lexicons.map(lex => {
                  const isCurrent = activeLexiconId === lex.id;
                  return (
                    <div
                      key={lex.id}
                      onClick={() => onSelectLexicon(lex)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        backgroundColor: isCurrent ? NM.cardBgActive : NM.cardBg,
                        boxShadow: isCurrent ? NM.insetSm : NM.convexSm,
                        border: isCurrent ? `1.5px solid ${NM.amber}` : NM.borderLight,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: NM.textMain }}>
                            {lex.name}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '6px',
                              backgroundColor: NM.bgInset,
                              color: NM.amber,
                              fontWeight: 700,
                            }}
                          >
                            {lex.wordCount} 词
                          </span>
                          {isCurrent && (
                            <span
                              style={{
                                fontSize: '10px',
                                color: '#fff',
                                backgroundColor: NM.amber,
                                padding: '1px 6px',
                                borderRadius: '8px',
                                fontWeight: 700,
                              }}
                            >
                              当前使用中
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(lex.id, lex.name);
                            }}
                            title="删除词库"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: NM.textMuted,
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* 词库前几个词简略预览 */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                          marginTop: '2px',
                        }}
                      >
                        {lex.words.slice(0, 5).map((w, wIdx) => (
                          <span
                            key={wIdx}
                            style={{
                              fontSize: '11px',
                              color: NM.textSub,
                              backgroundColor: NM.bgInset,
                              padding: '1px 6px',
                              borderRadius: '5px',
                            }}
                          >
                            {w.word}
                          </span>
                        ))}
                        {lex.words.length > 5 && (
                          <span style={{ fontSize: '10px', color: NM.textMuted }}>
                            +{lex.words.length - 5}...
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '10px', color: NM.textMuted, marginTop: '2px' }}>
                        来源：{lex.sourceFormat || '自定义导入'} ·{' '}
                        {new Date(lex.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* =================== TAB 2: 导入 / 粘贴新词库 =================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 词库名称输入 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: NM.textSub }}>
                  词库名称
                </span>
                <input
                  type="text"
                  value={lexiconName}
                  onChange={e => setLexiconName(e.target.value)}
                  placeholder="例如：考研阅读真题高频词 / 雅思大作文重点词"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetXs,
                    border: NM.borderSoft,
                    fontSize: '13px',
                    color: NM.textMain,
                    outline: 'none',
                  }}
                />
              </div>

              {/* 文件上传或粘贴快捷工具栏 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: NM.textSub }}>
                  单词内容录入
                </span>

                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexXs,
                    border: NM.borderLight,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: NM.amber,
                  }}
                >
                  <Upload size={13} />
                  <span>上传 TXT / CSV / JSON 词库</span>
                  <input
                    type="file"
                    accept=".txt,.csv,.tsv,.json,.jsonl"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* 文本输入框 */}
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={`支持自动嗅探以下主流格式：\n1. 词典/考级 JSON/JSONL (如扇贝、有道、百词斩公开词库)\n2. Anki / 欧路制表符 (TSV): word[TAB]translation\n3. 逗号分隔 CSV: word,translation\n4. 常见中英混排: abandon 抛弃，舍弃\n5. 纯英文单列换行: 自动调用在线技术翻译补齐释义与网文触发词！`}
                rows={7}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  border: NM.borderSoft,
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: NM.textMain,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'Consolas, monospace',
                  boxSizing: 'border-box',
                }}
              />

              {/* 实时嗅探分析提示条 */}
              {parsedPreview && parsedPreview.totalCount > 0 && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexXs,
                    border: `1px solid ${NM.amber}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color={NM.amber} />
                    <span style={{ fontWeight: 700, color: NM.textMain }}>
                      格式嗅探：{parsedPreview.formatLabel}
                    </span>
                  </div>

                  <div style={{ color: NM.textSub }}>
                    已成功识别 <strong>{parsedPreview.totalCount}</strong> 个单词（其中准备就绪{' '}
                    {parsedPreview.readyWords.length} 词
                    {parsedPreview.pendingPureEnglish.length > 0 &&
                      `，待技术翻译补全 ${parsedPreview.pendingPureEnglish.length} 词`}
                    ）
                  </div>
                </div>
              )}

              {/* 正在技术翻译补齐进度提示 */}
              {isTranslating && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: NM.amber,
                    fontWeight: 700,
                  }}
                >
                  <Loader2 size={16} className="animate-spin" />
                  <span>
                    正在调用技术翻译引擎补齐中文触发词：{translateProgress.current} /{' '}
                    {translateProgress.total} 词...
                  </span>
                </div>
              )}

              {/* 确认创建按钮 */}
              <button
                onClick={handleConfirmImport}
                disabled={isTranslating || !rawText.trim()}
                style={{
                  marginTop: '6px',
                  padding: '11px 0',
                  borderRadius: '12px',
                  backgroundColor: NM.amber,
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: isTranslating || !rawText.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: NM.convexSm,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: isTranslating || !rawText.trim() ? 0.6 : 1,
                }}
              >
                {isTranslating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>正在智能解析与建库...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>立即生成私人词库并生效</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 轻提示 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
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
            zIndex: 999,
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
