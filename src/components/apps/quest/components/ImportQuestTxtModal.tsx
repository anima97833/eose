import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Trash2, Sparkles, Plus } from 'lucide-react';
import { QuestCategory, QuestItem } from '../../../../core/quest/questTypes';
import { batchAddCustomQuests } from '../../../../core/quest/questStorage';

interface ImportQuestTxtModalProps {
  initialCategory?: QuestCategory;
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number, category: QuestCategory) => void;
}

interface ParsedTask {
  title: string;
  desc: string;
}

export const ImportQuestTxtModal: React.FC<ImportQuestTxtModalProps> = ({
  initialCategory = 'main',
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [targetCategory, setTargetCategory] = useState<'main' | 'side'>(
    initialCategory === 'side' ? 'side' : 'main'
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 智能清洗并解析行文本为任务条目
  const parseLinesToTasks = (text: string): ParsedTask[] => {
    if (!text.trim()) return [];

    const lines = text.split(/\r?\n/);
    const tasks: ParsedTask[] = [];

    for (const rawLine of lines) {
      let line = rawLine.trim();
      if (!line) continue;

      // 1. 去除常见的 Markdown 列表前缀与勾选框
      line = line.replace(/^[-*+]\s*\[[\sxX]\]\s*/, ''); // - [ ] or - [x]
      line = line.replace(/^\[[\sxX]\]\s*/, '');         // [ ] or [x]
      line = line.replace(/^\d+[\.\、\)\s]\s*/, '');     // 1. or 1、 or 1)
      line = line.replace(/^[-*+•·]\s*/, '');            // - or * or bullet

      line = line.trim();
      if (!line) continue;

      // 2. 检查是否有分隔符作为标题与描述 (支持 |、——、:: 或冒号)
      let title = line;
      let desc = targetCategory === 'main' ? '生活日常习惯待办' : '世界线奇遇探索';

      if (line.includes('|')) {
        const parts = line.split('|');
        title = parts[0].trim();
        desc = parts.slice(1).join('|').trim() || desc;
      } else if (line.includes('——')) {
        const parts = line.split('——');
        title = parts[0].trim();
        desc = parts.slice(1).join('——').trim() || desc;
      } else if (line.includes('::')) {
        const parts = line.split('::');
        title = parts[0].trim();
        desc = parts.slice(1).join('::').trim() || desc;
      }

      if (title) {
        tasks.push({ title, desc });
      }
    }

    return tasks;
  };

  // 处理文件读取
  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      setRawText(content);
      const tasks = parseLinesToTasks(content);
      setParsedTasks(tasks);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // 用户直接在输入框修改内容时实时同步解析
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawText(text);
    setParsedTasks(parseLinesToTasks(text));
  };

  // 从预览清单中删除单项
  const handleRemoveTask = (index: number) => {
    const next = [...parsedTasks];
    next.splice(index, 1);
    setParsedTasks(next);
  };

  // 确认导入
  const handleConfirmImport = () => {
    if (parsedTasks.length === 0) return;

    const questsToInsert: Omit<QuestItem, 'id' | 'currentProgress' | 'status' | 'isCustom'>[] =
      parsedTasks.map((t, idx) => {
        // 根据类别设定奖励与默认图标
        const isMain = targetCategory === 'main';
        const defaultIcons = isMain ? ['🍳', '🪥', '🍱', '🏃', '📖', '🍵'] : ['⚔️', '🏹', '🎒', '💬', '✨', '💻'];
        const icon = defaultIcons[idx % defaultIcons.length];

        return {
          category: targetCategory,
          title: t.title,
          desc: t.desc,
          icon,
          tag: '⚡ 精力',
          statKey: 'SPI',
          statGain: isMain ? { fixed: 2 } : { fixed: 10 },
          targetProgress: 1,
          isDailyRepeatable: isMain,
        };
      });

    batchAddCustomQuests(questsToInsert);
    window.dispatchEvent(new CustomEvent('cloudfly_quests_updated'));
    onImportSuccess(parsedTasks.length, targetCategory);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 120,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'backdropFadeIn 0.2s ease-out',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '350px',
          maxHeight: '90%',
          background: 'var(--nm-bg, #E9EEF5)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popInSpring 0.28s cubic-bezier(0.18, 0.9, 0.32, 1.2)',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--nm-bg-lighter, #F2F6FB)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '10px',
                background: 'rgba(80, 150, 198, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--nm-primary, #5096C6)',
              }}
            >
              <Upload size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: 'var(--nm-text-main, #334257)' }}>
                批量导入任务
              </h3>
              <p style={{ margin: 0, fontSize: '10px', color: 'var(--nm-text-sub, #7D8CA3)', fontWeight: 600 }}>
                支持上传 .txt 文件或文本粘贴
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="nm-rebound-btn nm-btn-circle"
            style={{ width: '30px', height: '30px' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '16px 18px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* 1. 目标归属分类选择（主线 vs 支线） */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--nm-text-sub, #7D8CA3)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              1. 导入目标线（必选）
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '4px',
                background: 'rgba(166, 180, 200, 0.15)',
                borderRadius: '14px',
              }}
            >
              <button
                type="button"
                onClick={() => setTargetCategory('main')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '11px',
                  border: 'none',
                  background: targetCategory === 'main' ? '#FFFFFF' : 'transparent',
                  color: targetCategory === 'main' ? '#059669' : 'var(--nm-text-sub)',
                  fontWeight: 800,
                  fontSize: '12px',
                  boxShadow: targetCategory === 'main' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                <span>🌱 主线任务</span>
                {targetCategory === 'main' && <CheckCircle2 size={13} />}
              </button>

              <button
                type="button"
                onClick={() => setTargetCategory('side')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '11px',
                  border: 'none',
                  background: targetCategory === 'side' ? '#FFFFFF' : 'transparent',
                  color: targetCategory === 'side' ? '#2563EB' : 'var(--nm-text-sub)',
                  fontWeight: 800,
                  fontSize: '12px',
                  boxShadow: targetCategory === 'side' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                <span>⚔️ 支线任务</span>
                {targetCategory === 'side' && <CheckCircle2 size={13} />}
              </button>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--nm-text-sub)', marginTop: '5px', paddingLeft: '4px' }}>
              {targetCategory === 'main'
                ? '提示：主线为生活习惯，次日自动重置并支持每日打卡'
                : '提示：支线为里程碑探索，完成打卡后永久达成'}
            </div>
          </div>

          {/* 2. 上传 TXT 文件区 */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--nm-text-sub, #7D8CA3)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              2. 上传文件或直接输入
            </label>

            {/* 隐藏的 File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".txt,text/plain"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* 拖拽/点击上传卡片 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                padding: '14px',
                borderRadius: '16px',
                border: `2px dashed ${isDragging ? 'var(--nm-primary, #5096C6)' : 'rgba(166, 180, 200, 0.45)'}`,
                background: isDragging ? 'rgba(80, 150, 198, 0.08)' : 'rgba(255, 255, 255, 0.55)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileText size={24} style={{ color: 'var(--nm-primary, #5096C6)' }} />
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--nm-text-main, #334257)' }}>
                {fileName ? `已选文件：${fileName}` : '点击选择或将 .txt 文件拖至此处'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--nm-text-sub, #7D8CA3)' }}>
                格式要求：每行一个待办（支持 `- [ ]`、数字序号或 `标题 | 备注`）
              </div>
            </div>

            {/* 文本实时编辑/预览区 */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
                  文本内容（可直接在此粘贴编辑）:
                </span>
                {rawText && (
                  <button
                    type="button"
                    onClick={() => {
                      setRawText('');
                      setParsedTasks([]);
                      setFileName(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <Trash2 size={11} /> 清空
                  </button>
                )}
              </div>
              <textarea
                value={rawText}
                onChange={handleTextChange}
                placeholder="例如：&#10;早起喝一杯温水&#10;背诵30个GRE单词 | 坚持打卡&#10;- [ ] 慢跑 3 公里"
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  border: '1px solid rgba(166, 180, 200, 0.35)',
                  background: '#FFFFFF',
                  fontSize: '11.5px',
                  color: 'var(--nm-text-main, #334257)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* 3. 解析结果预览清单 */}
          {parsedTasks.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--nm-text-main, #334257)' }}>
                  ✨ 解析就绪 ({parsedTasks.length} 项)
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: targetCategory === 'main' ? '#ECFDF5' : '#EFF6FF',
                    color: targetCategory === 'main' ? '#059669' : '#2563EB',
                  }}
                >
                  即将存入: {targetCategory === 'main' ? '主线' : '支线'}
                </span>
              </div>

              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  paddingRight: '2px',
                }}
              >
                {parsedTasks.map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '11px', color: 'var(--nm-text-sub)' }}>{idx + 1}.</span>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: 'var(--nm-text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '220px',
                        }}
                      >
                        {t.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="移除此项"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid rgba(166, 180, 200, 0.25)',
            display: 'flex',
            gap: '10px',
            background: 'var(--nm-bg-lighter, #F2F6FB)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="nm-rebound-btn"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '14px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: 'var(--nm-text-sub, #7D8CA3)',
              background: 'var(--nm-bg)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            取消
          </button>

          <button
            type="button"
            disabled={parsedTasks.length === 0}
            onClick={handleConfirmImport}
            className="nm-rebound-btn nm-btn-primary"
            style={{
              flex: 2,
              padding: '10px 14px',
              borderRadius: '14px',
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#FFFFFF',
              background: parsedTasks.length === 0 ? '#9CA3AF' : 'var(--nm-primary, #5096C6)',
              border: 'none',
              cursor: parsedTasks.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: parsedTasks.length === 0 ? 'none' : '0 4px 12px rgba(80, 150, 198, 0.35)',
            }}
          >
            <Sparkles size={14} />
            <span>确认导入 ({parsedTasks.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
