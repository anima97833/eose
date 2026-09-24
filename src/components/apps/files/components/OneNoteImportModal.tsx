import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FolderUp,
  FileArchive,
  FileText,
  ClipboardPaste,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  Globe,
} from 'lucide-react';
import { OneNoteImportProgress, OneNoteImportResult } from '../../../../core/files/fileTypes';
import {
  importFromFolderFiles,
  importFromZipFile,
  importFromDroppedEntries,
  importFromPastedNote,
} from '../../../../core/files/oneNoteImporter';

interface OneNoteImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetParentId: string | null;
  onSuccess: () => void;
}

export const OneNoteImportModal: React.FC<OneNoteImportModalProps> = ({
  isOpen,
  onClose,
  targetParentId,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'guide'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<OneNoteImportProgress | null>(null);
  const [result, setResult] = useState<OneNoteImportResult | null>(null);

  // 快捷粘贴输入状态
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [pasteSaving, setPasteSaving] = useState(false);

  // 文件 Input 引用
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mhtInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. 处理文件夹选择上传
  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setResult(null);
    const res = await importFromFolderFiles(files, targetParentId, setProgress);
    setResult(res);
    if (res.success) {
      onSuccess();
    }
  };

  // 2. 处理 Zip 压缩包选择
  const handleZipSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    const res = await importFromZipFile(file, targetParentId, setProgress);
    setResult(res);
    if (res.success) {
      onSuccess();
    }
  };

  // 3. 处理单/多文件选择
  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setResult(null);
    const res = await importFromFolderFiles(files, targetParentId, setProgress);
    setResult(res);
    if (res.success) {
      onSuccess();
    }
  };

  // 4. 处理拖拽放置
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!e.dataTransfer.items || e.dataTransfer.items.length === 0) return;

    setResult(null);
    const res = await importFromDroppedEntries(e.dataTransfer.items, targetParentId, setProgress);
    setResult(res);
    if (res.success) {
      onSuccess();
    }
  };

  // 5. 处理快速粘贴保存
  const handleSavePastedNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) return;

    setPasteSaving(true);
    try {
      await importFromPastedNote(pasteTitle || 'OneNote 剪贴板笔记', pasteContent, targetParentId);
      setPasteTitle('');
      setPasteContent('');
      setResult({ success: true, importedFilesCount: 1, importedFoldersCount: 0 });
      onSuccess();
    } catch (err: any) {
      setResult({ success: false, importedFilesCount: 0, importedFoldersCount: 0, error: err.message });
    } finally {
      setPasteSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'rgba(20, 30, 45, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '90vh',
          background: 'var(--nm-bg)',
          boxShadow: 'var(--nm-convex-lg)',
          borderRadius: '26px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.75)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部 Header */}
        <div
          style={{
            padding: '18px 20px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(166, 180, 200, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7753A6 0%, #20BF6B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(119, 83, 166, 0.35)',
              }}
            >
              <UploadCloud size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--nm-text-main)' }}>导入外部笔记 / 小说</h3>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    background: 'rgba(56, 211, 159, 0.15)',
                    color: '#20BF6B',
                    fontWeight: 700,
                  }}
                >
                  离线沙盒
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--nm-text-sub)' }}>支持 OneNote · 纯纯写作 · 多级分卷树</p>
            </div>
          </div>
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

        {/* 顶部选项卡 */}
        <div style={{ padding: '12px 18px 0', display: 'flex', gap: '8px' }}>
          {[
            { id: 'upload', label: '文件/压缩包', icon: FolderUp },
            { id: 'paste', label: '快速粘贴', icon: ClipboardPaste },
            { id: 'guide', label: '导出与提取指南', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'var(--nm-bg)' : 'transparent',
                  boxShadow: isActive ? 'var(--nm-convex-xs)' : 'none',
                  color: isActive ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 内容主体 */}
        <div style={{ padding: '16px 18px 20px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: 文件 / 文件夹 / 压缩包导入 */}
          {activeTab === 'upload' && (
            <div>
              {/* 隐藏的 File Inputs */}
              <input
                type="file"
                ref={folderInputRef}
                style={{ display: 'none' }}
                // @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderSelect}
              />
              <input
                type="file"
                ref={mhtInputRef}
                style={{ display: 'none' }}
                accept=".mht,.mhtml"
                multiple
                onChange={handleFilesSelect}
              />
              <input
                type="file"
                ref={zipInputRef}
                style={{ display: 'none' }}
                accept=".zip"
                onChange={handleZipSelect}
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".mht,.mhtml,.md,.txt,.markdown"
                multiple
                onChange={handleFilesSelect}
              />

              {/* 拖拽上传区域 */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '2px dashed var(--nm-primary)' : '2px dashed rgba(119, 83, 166, 0.45)',
                  background: isDragging ? 'rgba(80, 150, 198, 0.08)' : 'var(--nm-bg)',
                  boxShadow: isDragging ? 'var(--nm-inset-xs)' : 'var(--nm-convex-xs)',
                  borderRadius: '20px',
                  padding: '20px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '14px',
                }}
                onClick={() => zipInputRef.current?.click()}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '16px',
                    background: 'var(--nm-bg)',
                    boxShadow: 'var(--nm-convex-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    color: isDragging ? 'var(--nm-primary)' : '#7753A6',
                  }}
                >
                  <Globe size={24} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--nm-text-main)', marginBottom: '4px' }}>
                  拖拽 OneNote 网页 (.mht) 或 压缩包 (.zip) 到这里
                </div>
                <div style={{ fontSize: '11px', color: 'var(--nm-text-sub)' }}>
                  支持纯纯写作导出包 / OneNote 网页 / 书籍多级分卷文件夹
                </div>
              </div>

              {/* 快捷上传方式按钮网格 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {/* 选纯纯写作 / Markdown 压缩包 (.zip) */}
                <button
                  type="button"
                  onClick={() => zipInputRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '16px',
                    border: '1px solid rgba(32, 191, 107, 0.3)',
                    background: 'linear-gradient(135deg, rgba(32, 191, 107, 0.12) 0%, rgba(80, 150, 198, 0.08) 100%)',
                    boxShadow: 'var(--nm-convex-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: 'var(--nm-text-main)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '10px',
                        background: '#20BF6B',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 3px 8px rgba(32, 191, 107, 0.35)',
                      }}
                    >
                      <FileArchive size={16} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#20BF6B' }}>
                        选择 纯纯写作 / Markdown 压缩包 (*.zip)
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--nm-text-sub)' }}>
                        保留「书名 / 分卷 / 章节」三级树状结构，极速入库
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: 'rgba(32, 191, 107, 0.15)',
                      color: '#20BF6B',
                      fontWeight: 700,
                    }}
                  >
                    小说推荐
                  </span>
                </button>

                {/* 选 MHT 单文件网页 (OneNote 专属) */}
                <button
                  type="button"
                  onClick={() => mhtInputRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '16px',
                    border: '1px solid rgba(119, 83, 166, 0.3)',
                    background: 'linear-gradient(135deg, rgba(119, 83, 166, 0.12) 0%, rgba(80, 150, 198, 0.08) 100%)',
                    boxShadow: 'var(--nm-convex-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: 'var(--nm-text-main)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '10px',
                        background: '#7753A6',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 3px 8px rgba(119, 83, 166, 0.35)',
                      }}
                    >
                      <Globe size={16} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#7753A6' }}>
                        选择 OneNote 网页 (*.mht)
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--nm-text-sub)' }}>
                        对应 OneNote 导出选项第 4 项「单文件网页」
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: 'rgba(119, 83, 166, 0.15)',
                      color: '#7753A6',
                      fontWeight: 700,
                    }}
                  >
                    笔记推荐
                  </span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    style={{
                      padding: '10px 10px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      background: 'var(--nm-bg)',
                      boxShadow: 'var(--nm-convex-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: 'var(--nm-text-main)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        background: 'rgba(80, 150, 198, 0.15)',
                        color: 'var(--nm-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FolderUp size={15} />
                    </div>
                    <span>选整层书籍文件夹</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '10px 10px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      background: 'var(--nm-bg)',
                      boxShadow: 'var(--nm-convex-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: 'var(--nm-text-main)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        background: 'rgba(255, 159, 67, 0.15)',
                        color: '#FF9F43',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText size={15} />
                    </div>
                    <span>选单/多篇 Markdown</span>
                  </button>
                </div>
              </div>

              {/* 实时进度条 */}
              {progress && progress.stage !== 'done' && progress.stage !== 'error' && (
                <div
                  style={{
                    background: 'var(--nm-bg)',
                    boxShadow: 'var(--nm-inset-sm)',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--nm-primary)', fontWeight: 600 }}>
                      <Loader2 size={13} className="animate-spin" />
                      <span>{progress.message}</span>
                    </div>
                    {progress.total > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--nm-text-sub)' }}>
                        {progress.current}/{progress.total}
                      </span>
                    )}
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: 'rgba(166, 180, 200, 0.25)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '4px',
                        background: 'var(--nm-primary)',
                        width: progress.total > 0 ? `${Math.min(100, Math.round((progress.current / progress.total) * 100))}%` : '50%',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 导入结果状态通知 */}
              {result && (
                <div
                  style={{
                    borderRadius: '16px',
                    padding: '12px 14px',
                    background: result.success ? 'rgba(56, 211, 159, 0.1)' : 'rgba(255, 94, 126, 0.1)',
                    border: `1px solid ${result.success ? 'rgba(56, 211, 159, 0.3)' : 'rgba(255, 94, 126, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {result.success ? (
                    <CheckCircle2 size={18} style={{ color: '#38D39F', flexShrink: 0 }} />
                  ) : (
                    <AlertCircle size={18} style={{ color: '#FF5E7E', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, fontSize: '12px', color: 'var(--nm-text-main)' }}>
                    {result.success ? (
                      <div>
                        <strong>导入成功！</strong> 共导入 <strong>{result.importedFilesCount}</strong> 篇笔记/章节
                        {result.importedFoldersCount > 0 ? `，生成 ${result.importedFoldersCount} 个分卷文件夹` : ''}。
                      </div>
                    ) : (
                      <div>
                        <strong>导入中断：</strong> {result.error || '解析文件异常'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 剪贴板快速粘贴 */}
          {activeTab === 'paste' && (
            <form onSubmit={handleSavePastedNote}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nm-text-sub)', marginBottom: '6px', display: 'block' }}>
                  笔记 / 章节标题
                </label>
                <div
                  style={{
                    background: 'var(--nm-bg)',
                    boxShadow: 'var(--nm-inset-sm)',
                    borderRadius: '14px',
                    padding: '10px 14px',
                  }}
                >
                  <input
                    type="text"
                    placeholder="输入或粘贴标题 (如: 第一卷 烟雨长安)"
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '13px',
                      color: 'var(--nm-text-main)',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nm-text-sub)', marginBottom: '6px', display: 'block' }}>
                  正文内容
                </label>
                <div
                  style={{
                    background: 'var(--nm-bg)',
                    boxShadow: 'var(--nm-inset-sm)',
                    borderRadius: '14px',
                    padding: '10px 14px',
                  }}
                >
                  <textarea
                    placeholder="在此粘贴任何来自 OneNote、纯纯写作或浏览器的正文内容... 支持 Markdown 语法与纯文本！"
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    rows={7}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '12px',
                      color: 'var(--nm-text-main)',
                      lineHeight: '1.5',
                      resize: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!pasteContent.trim() || pasteSaving}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: '16px',
                  border: 'none',
                  background: pasteContent.trim() ? 'var(--nm-primary)' : 'var(--nm-bg-darker)',
                  color: pasteContent.trim() ? '#fff' : 'var(--nm-text-muted)',
                  boxShadow: pasteContent.trim() ? '0 4px 12px rgba(80, 150, 198, 0.4)' : 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: pasteContent.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <Sparkles size={15} />
                {pasteSaving ? '正在存入本地沙盒...' : '立即存入文件库'}
              </button>
            </form>
          )}

          {/* TAB 3: 导出与提取指南 */}
          {activeTab === 'guide' && (
            <div style={{ fontSize: '12px', color: 'var(--nm-text-main)', lineHeight: '1.6' }}>
              {/* 纯纯写作专区 */}
              <div
                style={{
                  background: 'rgba(32, 191, 107, 0.08)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                  border: '1px solid rgba(32, 191, 107, 0.2)',
                }}
              >
                <strong style={{ color: '#20BF6B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Sparkles size={14} />
                  纯纯写作 (Pure Writer) 小说导出指南
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--nm-text-sub)' }}>
                  <div>
                    <strong style={{ color: 'var(--nm-text-main)' }}>方法 1 (手机端直接导出 · 最丝滑)：</strong>
                    <div style={{ marginTop: '2px' }}>
                      打开手机纯纯写作 ➔ 点击左上角抽屉菜单 ➔「备份与导出」➔ 选择<strong>「导出为 Markdown 压缩包 (.zip)」</strong>或「导出书籍为 Markdown 文件夹」。将生成的 <code>.zip</code> 发送至电脑后直接拖入本窗口，系统会自动还原所有书架、分卷与章节！
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--nm-text-main)' }}>方法 2 (电脑端通用脚本 · 解析 .pwb 备份)：</strong>
                    <div style={{ marginTop: '2px' }}>
                      若只有 <code>.pwb</code> 格式的全量备份，本项目开源内置了通用离线导出脚本。在终端中运行：
                      <div
                        style={{
                          background: 'rgba(0,0,0,0.06)',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          marginTop: '4px',
                          color: 'var(--nm-text-main)',
                        }}
                      >
                        python scripts/extract_pure_writer.py &lt;你的备份文件.pwb&gt;
                      </div>
                      即可瞬间解包并生成包含各分卷章节的 Markdown 文件夹与 <code>.zip</code> 压缩包。
                    </div>
                  </div>
                </div>
              </div>

              {/* OneNote 专区 */}
              <div
                style={{
                  background: 'rgba(119, 83, 166, 0.08)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                  border: '1px solid rgba(119, 83, 166, 0.2)',
                }}
              >
                <strong style={{ color: '#7753A6', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Globe size={14} />
                  OneNote 笔记本导出指南
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--nm-text-sub)' }}>
                  <div>
                    <strong style={{ color: 'var(--nm-text-main)' }}>首选推荐：第 4 项「单文件网页 (*.mht)」</strong>
                    <div style={{ marginTop: '2px' }}>
                      在 OneNote 客户端中点击「文件」➔「导出」➔ 选中页面或分区 ➔ 勾选第 4 项 <code>单文件网页 (*.mht)</code>。保存后直接拖入本应用，系统已内置 MIME 与 Quoted-Printable 智能解码器，文字、标题、加粗与待办清单无损还原为 Markdown！
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--nm-text-main)' }}>极速免存：直接复制粘贴</strong>
                    <div style={{ marginTop: '2px' }}>
                      在 OneNote 中按 <code>Ctrl+A</code> 全选 ➔ <code>Ctrl+C</code> 复制，切换到本弹窗的「快速粘贴」标签页，点击即可 1 秒入库！
                    </div>
                  </div>
                </div>
              </div>

              {/* 隐私承诺 */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(80, 150, 198, 0.08)',
                  border: '1px solid rgba(80, 150, 198, 0.2)',
                  fontSize: '11px',
                  color: 'var(--nm-text-sub)',
                }}
              >
                🔒 <strong>隐私与数据安全说明：</strong>
                所有文件与小说的解析存取 100% 在您本地浏览器 IndexedDB 离线进行，绝不上云、不经第三方服务器。您的私人备份文件（.pwb / .mht）无需保存在项目仓库中，使用完毕后可随时移走或删除，已被 <code>.gitignore</code> 全局安全排除，绝不会同步至 GitHub。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
