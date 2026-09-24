import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Folder,
  FileText,
  Save,
  Copy,
  Check,
  ChevronRight,
  BookOpen,
  History,
} from 'lucide-react';
import {
  VirtualFileRecord,
  StoryInsightData,
} from '../../../../core/files/fileTypes';
import {
  prepareInsightCorpus,
  generateStoryInsight,
  saveInsightAsMindMapFile,
  convertInsightToMarkdown,
} from '../../../../core/files/storyInsightEngine';
import { autoSaveInsightToHistory } from '../../../../core/files/insightHistoryService';
import { MindMapCanvas } from './mindmap/MindMapCanvas';
import { MindMapHistoryModal } from './mindmap/MindMapHistoryModal';

interface FileInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId: string | null;
  currentFolderName?: string;
  itemsInCurrentFolder: VirtualFileRecord[];
  initialInsightData?: StoryInsightData | null;
  onSuccessSave?: () => void;
}

export const FileInsightModal: React.FC<FileInsightModalProps> = ({
  isOpen,
  onClose,
  currentFolderId,
  currentFolderName,
  itemsInCurrentFolder,
  initialInsightData,
  onSuccessSave,
}) => {
  // 阶段: 'select' (选择范围) | 'thinking' (AI 思考中) | 'result' (导图展示)
  const [stage, setStage] = useState<'select' | 'thinking' | 'result'>('select');

  // 选中的条目 ID 列表 (默认为当前目录所有非 mindmap 项)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 进度与错误提示
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 最终的洞察思维导图数据
  const [insightData, setInsightData] = useState<StoryInsightData | null>(null);

  // 历史导图弹窗
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // 复制与保存按钮状态
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 初始化选择项或直接加载既有导图
  useEffect(() => {
    if (!isOpen) return;

    if (initialInsightData) {
      setInsightData(initialInsightData);
      setStage('result');
      return;
    }

    // 默认勾选当前文件夹下的所有可分析文件与子目录
    const validItems = itemsInCurrentFolder.filter((i) => i.ext !== 'mindmap');
    setSelectedIds(validItems.map((i) => i.id));
    setStage('select');
    setErrorMsg(null);
    setSaveSuccess(false);
  }, [isOpen, initialInsightData, itemsInCurrentFolder]);

  if (!isOpen) return null;

  // 切换勾选项
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 全选 / 取消全选
  const handleToggleSelectAll = () => {
    const validItems = itemsInCurrentFolder.filter((i) => i.ext !== 'mindmap');
    if (selectedIds.length === validItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(validItems.map((i) => i.id));
    }
  };

  // 从历史记录加载导图
  const handleSelectHistoryInsight = (data: StoryInsightData) => {
    setInsightData(data);
    setStage('result');
    setShowHistoryModal(false);
  };

  // 触发 AI 洞察分析
  const handleStartInsight = async () => {
    setErrorMsg(null);
    setStage('thinking');
    setProgressMsg('正在打捞所选范围内的章节正文...');

    try {
      const corpus = await prepareInsightCorpus(
        currentFolderId,
        selectedIds.length > 0 ? selectedIds : undefined
      );

      if (corpus.items.length === 0) {
        throw new Error('所选范围内没有包含正文的 Markdown 或文本章节，请勾选包含章节的文件夹。');
      }

      const result = await generateStoryInsight(corpus, (msg) => {
        setProgressMsg(msg);
      });

      // 自动归档至 IndexedDB 历史数据库，确保永不丢失
      try {
        await autoSaveInsightToHistory(result, currentFolderId);
      } catch (historyErr) {
        console.warn('[FileInsightModal] autoSave to history error:', historyErr);
      }

      setInsightData(result);
      setStage('result');
    } catch (err: any) {
      console.error('[FileInsightModal] error:', err);
      setErrorMsg(err.message || '生成故事洞察失败');
      setStage('select');
    }
  };

  // 存为独立虚拟文件
  const handleSaveAsFile = async () => {
    if (!insightData || isSaving) return;
    setIsSaving(true);
    try {
      await saveInsightAsMindMapFile(currentFolderId, insightData);
      setSaveSuccess(true);
      onSuccessSave?.();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(`保存导图文件失败: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 复制 Markdown 大纲
  const handleCopyMarkdown = () => {
    if (!insightData) return;
    const md = convertInsightToMarkdown(insightData);
    navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(20, 30, 45, 0.55)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: stage === 'result' ? '760px' : '460px',
          height: stage === 'result' ? '92vh' : 'auto',
          maxHeight: '94vh',
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-convex-lg)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.75)',
          transition: 'max-width 0.25s ease, height 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部 Header */}
        <div
          style={{
            padding: '12px 18px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(166, 180, 200, 0.2)',
            background: 'var(--nm-bg-lighter)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7753A6 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 3px 8px rgba(119, 83, 166, 0.3)',
              }}
            >
              <BrainCircuit size={17} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--nm-text-main)', margin: 0 }}>
              {stage === 'result' && insightData ? insightData.title : '故事导图'}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 历史导图按钮 */}
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              style={{
                padding: '6px 10px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-convex-xs)',
                color: '#7753A6',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
              title="查看 IndexedDB 历史思维导图存档"
            >
              <History size={13} />
              <span>历史</span>
            </button>

            {/* 结果阶段的保存与复制快捷操作 */}
            {stage === 'result' && insightData && (
              <>
                <button
                  type="button"
                  onClick={handleSaveAsFile}
                  disabled={isSaving}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: saveSuccess ? '#38D39F' : 'var(--nm-bg)',
                    boxShadow: 'var(--nm-convex-xs)',
                    color: saveSuccess ? '#fff' : 'var(--nm-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  title="保存到当前目录"
                >
                  {saveSuccess ? <Check size={13} /> : <Save size={13} />}
                  <span>{saveSuccess ? '已保存' : '保存'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--nm-bg)',
                    boxShadow: 'var(--nm-convex-xs)',
                    color: isCopied ? '#38D39F' : 'var(--nm-text-sub)',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                  title="复制"
                >
                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{isCopied ? '已复制' : '复制'}</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--nm-text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 阶段 1: 范围选择器 */}
        {stage === 'select' && (
          <div style={{ padding: '20px', overflowY: 'auto' }}>
            {errorMsg && (
              <div
                style={{
                  borderRadius: '14px',
                  padding: '10px 14px',
                  background: 'rgba(255, 94, 126, 0.1)',
                  border: '1px solid rgba(255, 94, 126, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px',
                  fontSize: '12px',
                  color: '#FF5E7E',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div
              style={{
                background: 'rgba(119, 83, 166, 0.08)',
                borderRadius: '14px',
                padding: '10px 14px',
                marginBottom: '14px',
                border: '1px solid rgba(119, 83, 166, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#7753A6',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <Folder size={16} />
              <span>当前目录：{currentFolderName || '根目录'}</span>
            </div>

            {/* 条目勾选列表 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nm-text-sub)' }}>
                  请选择要纳入分析的书籍、分卷或章节：
                </span>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '11px',
                    color: 'var(--nm-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {selectedIds.length === itemsInCurrentFolder.filter((i) => i.ext !== 'mindmap').length
                    ? '取消全选'
                    : '全选'}
                </button>
              </div>

              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  background: 'var(--nm-bg)',
                  boxShadow: 'var(--nm-inset-xs)',
                  borderRadius: '16px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {itemsInCurrentFolder
                  .filter((i) => i.ext !== 'mindmap')
                  .map((item) => {
                    const isChecked = selectedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelect(item.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isChecked ? 'rgba(80, 150, 198, 0.1)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ accentColor: 'var(--nm-primary)' }}
                          />
                          {item.type === 'folder' ? (
                            <Folder size={15} style={{ color: 'var(--nm-primary)', flexShrink: 0 }} />
                          ) : (
                            <FileText size={15} style={{ color: '#7753A6', flexShrink: 0 }} />
                          )}
                          <span
                            style={{
                              fontSize: '12px',
                              color: 'var(--nm-text-main)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--nm-text-muted)', flexShrink: 0 }}>
                          {item.type === 'folder' ? '目录' : `${item.wordCount || 0} 字`}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 提交触发按钮 */}
            <button
              type="button"
              onClick={handleStartInsight}
              disabled={selectedIds.length === 0}
              style={{
                width: '100%',
                padding: '13px 0',
                borderRadius: '16px',
                border: 'none',
                background:
                  selectedIds.length > 0
                    ? 'linear-gradient(135deg, #7753A6 0%, #2563EB 100%)'
                    : 'var(--nm-bg-darker)',
                color: selectedIds.length > 0 ? '#fff' : 'var(--nm-text-muted)',
                boxShadow:
                  selectedIds.length > 0 ? '0 4px 14px rgba(119, 83, 166, 0.4)' : 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <Sparkles size={16} />
              <span>开始洞察</span>
            </button>

            {/* 历史存档入口 */}
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: '14px',
                border: 'none',
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-convex-xs)',
                color: '#7753A6',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '10px',
                transition: 'all 0.15s ease',
              }}
            >
              <History size={14} />
              <span>历史存档</span>
            </button>
          </div>
        )}

        {/* 阶段 2: 正在思考中 */}
        {stage === 'thinking' && (
          <div
            style={{
              padding: '60px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            {/* 轻拟物呼吸发光球 */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--nm-bg)',
                boxShadow: 'var(--nm-convex-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7753A6',
                marginBottom: '20px',
                position: 'relative',
              }}
            >
              <BrainCircuit size={36} className="animate-pulse" />
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  borderRadius: '50%',
                  border: '2px solid rgba(119, 83, 166, 0.35)',
                  animation: 'spin 3s linear infinite',
                }}
              />
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--nm-text-main)', marginBottom: '8px' }}>
              AI 故事架构师正在思考中...
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--nm-primary)', maxWidth: '320px', lineHeight: '1.5' }}>
              {progressMsg || '正在梳理人物羁绊、情节暗线与世界观...'}
            </p>
          </div>
        )}

        {/* 阶段 3: 双模导图画布展示 */}
        {stage === 'result' && insightData && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <MindMapCanvas data={insightData} />
          </div>
        )}
      </div>

      {/* 历史思维导图归档抽屉/模态框 */}
      <MindMapHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSelectInsight={handleSelectHistoryInsight}
      />
    </div>
  );
};
