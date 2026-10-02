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
  Languages,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  getKoreanDictMeta,
  importYomitanJsonFiles,
  clearKoreanDictionary,
} from '../../../../core/storyword/yomitanParser';
import { KoreanDictMeta } from '../../../../core/storyword/koreanTermTypes';

interface CustomLexiconModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLexiconId?: string | null;
  onSelectLexicon: (lexicon: CustomLexicon | null) => void;
  initialTab?: 'list' | 'import' | 'korean';
}

export const CustomLexiconModal: React.FC<CustomLexiconModalProps> = ({
  isOpen,
  onClose,
  activeLexiconId,
  onSelectLexicon,
  initialTab = 'list',
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'import' | 'korean'>(initialTab);
  const [lexicons, setLexicons] = useState<CustomLexicon[]>([]);
  const [loading, setLoading] = useState(false);

  // 韩语 Yomitan 词库状态
  const [koreanMeta, setKoreanMeta] = useState<KoreanDictMeta | null>(null);
  const [isImportingKorean, setIsImportingKorean] = useState(false);
  const [koreanProgress, setKoreanProgress] = useState(0);
  const [koreanCurrent, setKoreanCurrent] = useState(0);
  const [koreanTotal, setKoreanTotal] = useState(0);
  const [koreanAppendMode, setKoreanAppendMode] = useState(false);
  const koreanFileInputRef = React.useRef<HTMLInputElement | null>(null);

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

  const loadKoreanMeta = async () => {
    const meta = await getKoreanDictMeta();
    setKoreanMeta(meta);
  };

  useEffect(() => {
    if (isOpen) {
      loadLexicons();
      loadKoreanMeta();
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialTab]);

  // 处理韩语 Yomitan JSON 导入
  const handleKoreanFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    setIsImportingKorean(true);
    setKoreanProgress(0);
    setKoreanCurrent(0);
    setKoreanTotal(0);

    try {
      showToast(files.length === 1 ? `开始解析韩语词典：${files[0].name}` : `开始批量解析 ${files.length} 个韩语词库分卷...`);
      const meta = await importYomitanJsonFiles(
        files,
        (percent, cur, tot) => {
          setKoreanProgress(percent);
          setKoreanCurrent(cur);
          setKoreanTotal(tot);
        },
        { append: koreanAppendMode }
      );
      setKoreanMeta(meta);
      showToast(`🎉 成功入库！本地共收录 ${meta.termCount.toLocaleString()} 词`);
    } catch (err: any) {
      showToast(`导入失败: ${err.message || '格式错误'}`);
    } finally {
      setIsImportingKorean(false);
      e.target.value = '';
    }
  };

  const handleClearKoreanDict = async () => {
    if (window.confirm('确定要清空本地 IndexedDB 中的韩语词库吗？清空后点词查词将需要重新导入。')) {
      await clearKoreanDictionary();
      setKoreanMeta(null);
      showToast('已清空本地韩语词库');
    }
  };

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
            gap: '6px',
            backgroundColor: NM.bgInset,
          }}
        >
          <button
            onClick={() => setActiveTab('list')}
            style={{
              flex: 1,
              padding: '7px 4px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'list' ? NM.cardBg : 'transparent',
              color: activeTab === 'list' ? NM.amber : NM.textSub,
              boxShadow: activeTab === 'list' ? NM.convexXs : 'none',
            }}
          >
            英语词库 ({lexicons.length})
          </button>

          <button
            onClick={() => setActiveTab('import')}
            style={{
              flex: 1,
              padding: '7px 4px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'import' ? NM.cardBg : 'transparent',
              color: activeTab === 'import' ? NM.amber : NM.textSub,
              boxShadow: activeTab === 'import' ? NM.convexXs : 'none',
            }}
          >
            ➕ 导入英语
          </button>

          <button
            onClick={() => setActiveTab('korean')}
            style={{
              flex: 1.2,
              padding: '7px 4px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'korean' ? NM.cardBg : 'transparent',
              color: activeTab === 'korean' ? NM.gold : NM.textSub,
              boxShadow: activeTab === 'korean' ? NM.convexXs : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Languages size={12} />
            <span>韩语 Yomitan</span>
            {koreanMeta && (
              <span
                style={{
                  fontSize: '9px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '1px 4px',
                }}
              >
                已装
              </span>
            )}
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

          {activeTab === 'korean' && (
            /* =================== TAB 3: 韩语 Yomitan 词库 =================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 隐藏的文件上传 input (支持多选) */}
              <input
                ref={koreanFileInputRef}
                type="file"
                multiple
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleKoreanFileUpload}
              />

              {/* 当前词库状态卡片 */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexSm,
                  border: NM.borderLight,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Languages size={18} color={NM.amber} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: NM.textMain }}>
                      本地韩中词典库
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '8px',
                      backgroundColor: koreanMeta ? 'rgba(16, 185, 129, 0.12)' : 'rgba(156, 163, 175, 0.15)',
                      color: koreanMeta ? '#10b981' : NM.textSub,
                    }}
                  >
                    {koreanMeta ? '✓ 已就绪' : '未导入'}
                  </span>
                </div>

                {koreanMeta ? (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: NM.bgInset,
                      boxShadow: NM.insetXs,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: NM.textSub }}>词库名称:</span>
                      <strong style={{ color: NM.textMain }}>{koreanMeta.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: NM.textSub }}>总词条量:</span>
                      <strong style={{ color: NM.amber }}>{koreanMeta.termCount.toLocaleString()} 词</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: NM.textSub }}>更新时间:</span>
                      <span style={{ color: NM.textSub }}>{new Date(koreanMeta.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div style={{ borderTop: NM.borderSoft, paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={handleClearKoreanDict}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        <Trash2 size={12} />
                        <span>清空词库</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: NM.bgInset,
                      boxShadow: NM.insetXs,
                      fontSize: '12px',
                      lineHeight: '1.6',
                      color: NM.textSub,
                    }}
                  >
                    暂无本地韩语词库。导入后支持韩文原著小说<strong>全本点词即查、词干形态素还原、汉字词互查及真人韩语发音</strong>。
                  </div>
                )}
              </div>

              {/* 上传导入区域 */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convexSm,
                  border: NM.borderLight,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: NM.textMain }}>
                    {koreanMeta ? '导入更多分卷 / 覆盖词典文件' : '导入 Yomitan JSON 词典'}
                  </span>

                  {/* 追加模式开关 */}
                  {koreanMeta && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer', color: NM.amber, fontWeight: 700 }}>
                      <input
                        type="checkbox"
                        checked={koreanAppendMode}
                        onChange={e => setKoreanAppendMode(e.target.checked)}
                        style={{ accentColor: NM.amber }}
                      />
                      <span>分卷追加模式（不清除现有分卷）</span>
                    </label>
                  )}
                </div>

                <div
                  onClick={() => !isImportingKorean && koreanFileInputRef.current?.click()}
                  style={{
                    padding: '20px 14px',
                    borderRadius: '12px',
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    border: '1.5px dashed rgba(217, 119, 6, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: isImportingKorean ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Upload size={24} color={NM.amber} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: NM.textMain }}>
                    {isImportingKorean ? '正在流式分批写入 IndexedDB...' : '点击选择 term_bank_*.json 文件（支持按住 Ctrl 多选）'}
                  </span>
                  <span style={{ fontSize: '11px', color: NM.textSub }}>
                    支持标准 Yomitan / TermBank 格式 JSON，可单次同时选取全部词库分卷
                  </span>
                </div>

                {/* 导入进度条 */}
                {isImportingKorean && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: NM.amber, fontWeight: 700 }}>
                      <span>解析入库进度</span>
                      <span>{koreanProgress}% ({koreanCurrent.toLocaleString()} / {koreanTotal.toLocaleString()} 词)</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '7px',
                        borderRadius: '4px',
                        backgroundColor: NM.bgInset,
                        boxShadow: NM.insetXs,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${koreanProgress}%`,
                          height: '100%',
                          backgroundColor: NM.amber,
                          borderRadius: '4px',
                          transition: 'width 0.15s ease',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 核心原则轻拟物说明卡 */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(217, 119, 6, 0.06)',
                  border: '1px solid rgba(217, 119, 6, 0.15)',
                  fontSize: '11px',
                  color: NM.textSub,
                  lineHeight: '1.6',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <Info size={15} color={NM.amber} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>零打包承诺</strong>：间词框架绝不预置或打包任何实体词库，词典完全由您自主导入并保存在您手机/电脑的本地 IndexedDB 中，秒级加载、断网可用。
                </span>
              </div>
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
