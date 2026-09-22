import React, { useState, useEffect } from 'react';
import { BookSourceRule, StoryNovel } from '../../../../core/storyword/storyWordTypes';
import {
  getAllBookSources,
  saveBookSource,
  deleteBookSource,
  resetDefaultBookSources,
  saveStoryNovel,
} from '../../../../core/storyword/storyWordStorage';
import {
  crawlNovelChapterFromUrl,
  createNovelFromTxt,
  importLegadoBookSources,
  fetchRemoteBookSources,
} from '../../../../core/storyword/bookSourceEngine';
import { NM } from '../storyWordNeumorphism';
import {
  Globe,
  FileText,
  BookMarked,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';

interface BookSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNovelAdded: (novel: StoryNovel) => void;
}

export const BookSourceModal: React.FC<BookSourceModalProps> = ({
  isOpen,
  onClose,
  onNovelAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'txt' | 'rules'>('url');
  const [sources, setSources] = useState<BookSourceRule[]>([]);

  // URL 抓取表单
  const [targetUrl, setTargetUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);

  // TXT 导入表单
  const [txtTitle, setTxtTitle] = useState('');
  const [txtAuthor, setTxtAuthor] = useState('');
  const [txtContent, setTxtContent] = useState('');

  // 规则导入表单
  const [remoteUrlInput, setRemoteUrlInput] = useState('');
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const [jsonRulesInput, setJsonRulesInput] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  const loadSources = async () => {
    const list = await getAllBookSources();
    setSources(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadSources();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 执行 URL 爬取小说
  const handleCrawlUrl = async () => {
    if (!targetUrl.trim()) {
      showToast('请输入网址');
      return;
    }
    setIsCrawling(true);
    try {
      const chapter = await crawlNovelChapterFromUrl(targetUrl.trim());
      const novelTitle = urlTitle.trim() || chapter.title.split(/第.*章/)[0].trim() || '网络爬取爽文';

      const novel: StoryNovel = {
        id: `crawled_${Date.now()}`,
        title: novelTitle,
        author: '网络抓取',
        sourceId: 'web_crawler',
        sourceName: '网络即时爬取',
        currentChapterIndex: 0,
        totalChapters: 1,
        targetLevel: 'cet4',
        insertDensity: 0.2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        chapters: [chapter],
      };

      await saveStoryNovel(novel);
      onNovelAdded(novel);
      showToast('抓取成功');
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('抓取失败');
    } finally {
      setIsCrawling(false);
    }
  };

  // 执行 TXT 文本导入
  const handleImportTxt = async () => {
    if (!txtContent.trim()) {
      showToast('内容不能为空');
      return;
    }
    const novel = createNovelFromTxt(
      txtTitle.trim() || '未命名爽文',
      txtAuthor.trim() || '佚名',
      txtContent
    );
    await saveStoryNovel(novel);
    onNovelAdded(novel);
    showToast('导入成功');
    onClose();
  };

  // 导入 Legado 书源规则 JSON
  const handleImportRulesJson = async () => {
    if (!jsonRulesInput.trim()) {
      showToast('规则为空');
      return;
    }
    try {
      const parsed = importLegadoBookSources(jsonRulesInput);
      for (const rule of parsed) {
        await saveBookSource(rule);
      }
      await loadSources();
      setJsonRulesInput('');
      showToast(`已导入${parsed.length}条`);
    } catch (err) {
      showToast('解析失败');
    }
  };

  // 远端网络拉取书源合集 (支持 ghproxy / github raw / gitee 等)
  const handleFetchRemoteRules = async () => {
    if (!remoteUrlInput.trim()) {
      showToast('请输入网址');
      return;
    }
    setIsFetchingRemote(true);
    try {
      const rules = await fetchRemoteBookSources(remoteUrlInput.trim());
      for (const rule of rules) {
        await saveBookSource(rule);
      }
      await loadSources();
      showToast(`已导入${rules.length}条`);
      setRemoteUrlInput('');
    } catch (err: any) {
      console.error(err);
      showToast('拉取失败');
    } finally {
      setIsFetchingRemote(false);
    }
  };

  // 重置内嵌默认规则
  const handleResetRules = async () => {
    await resetDefaultBookSources();
    await loadSources();
    showToast('已重置');
  };

  // 删除规则
  const handleDeleteRule = async (id: string) => {
    await deleteBookSource(id);
    await loadSources();
    showToast('已删除');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(54, 46, 34, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '85vh',
          backgroundColor: NM.cardBg,
          borderRadius: '20px',
          boxShadow: NM.convexLg,
          border: NM.borderLight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 顶部标题 */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: NM.borderSoft,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color={NM.amber} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: NM.textMain }}>
              书源与抓取中心
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: NM.textMuted,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* 选项卡导航 */}
        <div
          style={{
            display: 'flex',
            padding: '10px 16px',
            gap: '8px',
            backgroundColor: NM.bgInset,
            borderBottom: NM.borderSoft,
          }}
        >
          {[
            { id: 'url', label: '网页爬取', icon: Globe },
            { id: 'txt', label: '导入文本', icon: FileText },
            { id: 'rules', label: '规则库', icon: BookMarked },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '8px 0',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? NM.cardBg : 'transparent',
                  color: isActive ? NM.gold : NM.textSub,
                  boxShadow: isActive ? NM.convexXs : 'none',
                }}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 选项卡内容 */}
        <div style={{ padding: '18px 20px', flex: 1, overflowY: 'auto' }}>

          {/* TAB 1: 网页爬取 */}
          {activeTab === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: NM.bgLighter,
                  fontSize: '12px',
                  color: NM.textSub,
                  lineHeight: '1.6',
                  boxShadow: NM.insetXs,
                }}
              >
                💡 <b>万能爬虫</b>：可粘贴任意小说网站章节 URL（如笔趣阁、69书吧等）。系统将自动经由安全跨域通道拉取正文并清洗广告。
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: NM.textSub,
                    marginBottom: '6px',
                  }}
                >
                  小说章节网址 (URL)
                </label>
                <input
                  type="text"
                  placeholder="https://www.biquge.com/.../1.html"
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    border: NM.borderSoft,
                    fontSize: '13px',
                    color: NM.textMain,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: NM.textSub,
                    marginBottom: '6px',
                  }}
                >
                  自定义书名 (可选)
                </label>
                <input
                  type="text"
                  placeholder="留空自动从网页标题提取"
                  value={urlTitle}
                  onChange={e => setUrlTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    border: NM.borderSoft,
                    fontSize: '13px',
                    color: NM.textMain,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                onClick={handleCrawlUrl}
                disabled={isCrawling}
                style={{
                  marginTop: '8px',
                  padding: '12px 0',
                  borderRadius: '12px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convex,
                  border: NM.borderLight,
                  color: NM.gold,
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: isCrawling ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={16} color={NM.amber} />
                <span>{isCrawling ? '爬取中' : '开始爬取'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: 文本导入 */}
          {activeTab === 'txt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: NM.textSub,
                      marginBottom: '4px',
                    }}
                  >
                    小说书名
                  </label>
                  <input
                    type="text"
                    placeholder="如：重生之商海巨擘"
                    value={txtTitle}
                    onChange={e => setTxtTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: NM.bgInset,
                      boxShadow: NM.insetSm,
                      border: NM.borderSoft,
                      fontSize: '12px',
                      color: NM.textMain,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: NM.textSub,
                      marginBottom: '4px',
                    }}
                  >
                    作者名字
                  </label>
                  <input
                    type="text"
                    placeholder="如：天蚕土豆"
                    value={txtAuthor}
                    onChange={e => setTxtAuthor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: NM.bgInset,
                      boxShadow: NM.insetSm,
                      border: NM.borderSoft,
                      fontSize: '12px',
                      color: NM.textMain,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: NM.textSub,
                    marginBottom: '4px',
                  }}
                >
                  小说文本或章节内容
                </label>
                <textarea
                  rows={8}
                  placeholder="在此粘贴小说正文（支持根据“第X章”自动分卷分章节）..."
                  value={txtContent}
                  onChange={e => setTxtContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    border: NM.borderSoft,
                    fontSize: '12px',
                    color: NM.textMain,
                    lineHeight: '1.6',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                onClick={handleImportTxt}
                style={{
                  padding: '12px 0',
                  borderRadius: '12px',
                  backgroundColor: NM.cardBg,
                  boxShadow: NM.convex,
                  border: NM.borderLight,
                  color: NM.gold,
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={16} />
                <span>立即导入</span>
              </button>
            </div>
          )}

          {/* TAB 3: 书院规则库 */}
          {activeTab === 'rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 1. 订阅网络书源合集 (URL) */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  backgroundColor: NM.bgInset,
                  boxShadow: NM.insetSm,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: NM.textMain }}>
                    网络书源合集订阅 (URL)
                  </span>
                  <button
                    onClick={() =>
                      setRemoteUrlInput(
                        'https://ghproxy.com/https://raw.githubusercontent.com/kevinmattew/crossfire/master/2023Aug/Mustbe/namofree%E4%B9%A6%E6%BA%90%E5%90%88%E9%9B%86.json'
                      )
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      color: NM.gold,
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    填入示例源
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="粘贴 GitHub / Gitee / ghproxy 书源 .json 链接"
                  value={remoteUrlInput}
                  onChange={e => setRemoteUrlInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.insetXs,
                    border: NM.borderSoft,
                    fontSize: '11px',
                    color: NM.textMain,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />

                <button
                  onClick={handleFetchRemoteRules}
                  disabled={isFetchingRemote}
                  style={{
                    padding: '8px 0',
                    borderRadius: '10px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexXs,
                    border: NM.borderLight,
                    fontSize: '12px',
                    fontWeight: 700,
                    color: NM.gold,
                    cursor: isFetchingRemote ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={13} color={NM.amber} />
                  <span>{isFetchingRemote ? '拉取中' : '一键导入'}</span>
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: NM.textSub }}>
                  已装载规则 ({sources.length} 个)
                </span>
                <button
                  onClick={handleResetRules}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexXs,
                    border: NM.borderLight,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: NM.textSub,
                  }}
                >
                  <RotateCcw size={12} />
                  <span>重置规则</span>
                </button>
              </div>

              {/* 规则列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sources.map(s => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: NM.bgInset,
                      boxShadow: NM.insetXs,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: NM.textMain }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '11px', color: NM.textMuted, marginTop: '2px' }}>
                        域名: {s.host} · 提取器: {s.contentSelector}
                      </div>
                    </div>

                    {!s.isBuiltin && (
                      <button
                        onClick={() => handleDeleteRule(s.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: NM.rose,
                          padding: '4px',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 规则 JSON 批量导入 */}
              <div style={{ marginTop: '10px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: NM.textSub,
                    marginBottom: '4px',
                  }}
                >
                  导入书源规则 (JSON / 阅读3.0格式)
                </label>
                <textarea
                  rows={4}
                  placeholder='[{"bookSourceName":"XX中文","bookSourceUrl":"https://...", "ruleContent":{"content":"#content"}}]'
                  value={jsonRulesInput}
                  onChange={e => setJsonRulesInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetSm,
                    border: NM.borderSoft,
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: NM.textMain,
                    boxSizing: 'border-box',
                    resize: 'none',
                  }}
                />
                <button
                  onClick={handleImportRulesJson}
                  style={{
                    marginTop: '6px',
                    width: '100%',
                    padding: '8px 0',
                    borderRadius: '10px',
                    backgroundColor: NM.cardBg,
                    boxShadow: NM.convexXs,
                    border: NM.borderLight,
                    fontSize: '12px',
                    fontWeight: 700,
                    color: NM.gold,
                    cursor: 'pointer',
                  }}
                >
                  解析并导入规则
                </button>
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
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: 'rgba(54, 46, 34, 0.95)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            zIndex: 120,
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};
