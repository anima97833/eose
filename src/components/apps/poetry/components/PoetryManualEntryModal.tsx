import React, { useState } from 'react';
import { X, Feather, Wand2, Check, BookPlus, AlertCircle } from 'lucide-react';
import { SavedPoemRecord } from '../../../../core/poetry/poetryTypes';

interface PoetryManualEntryModalProps {
  onClose: () => void;
  onSavePoem: (poem: SavedPoemRecord) => Promise<void>;
  onToast: (msg: string) => void;
}

const DYNASTY_OPTIONS = ['唐', '宋', '元', '明', '清', '魏晋', '两汉', '先秦', '近代', '自创'];
const TYPE_OPTIONS = [
  '五言绝句',
  '七言绝句',
  '五言律诗',
  '七言律诗',
  '宋词',
  '元曲',
  '乐府',
  '楚辞',
  '古风长调',
  '现代诗',
];

export const PoetryManualEntryModal: React.FC<PoetryManualEntryModalProps> = ({
  onClose,
  onSavePoem,
  onToast,
}) => {
  const [title, setTitle] = useState('');
  const [dynasty, setDynasty] = useState('唐');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState('五言绝句');
  const [rawContent, setRawContent] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 智能格式化分句：将整篇文本根据标点（句号、问号、叹号、换行）清洗拆解为标准的数组
  const handleAutoFormat = () => {
    if (!rawContent.trim()) {
      onToast('请先在下方输入或粘贴诗句内容');
      return;
    }

    // 优先按换行分割，若没有换行则按句末标点分割
    let lines: string[] = [];
    if (rawContent.includes('\n')) {
      lines = rawContent
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    } else {
      // 按 。！？ 分割并保留标点
      const matches = rawContent.match(/[^。！？]+[。！？]?/g);
      if (matches) {
        lines = matches.map((m) => m.trim()).filter((m) => m.length > 0);
      } else {
        lines = [rawContent.trim()];
      }
    }

    setRawContent(lines.join('\n'));
    onToast(`✨ 已智能排版为 ${lines.length} 句诗词`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();

    if (!trimmedTitle) {
      setErrorMsg('请填写诗词标题');
      return;
    }
    if (!trimmedAuthor) {
      setErrorMsg('请填写诗家姓名');
      return;
    }

    const contentLines = rawContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (contentLines.length === 0) {
      setErrorMsg('请录入至少一句诗词正文');
      return;
    }

    const newRecord: SavedPoemRecord = {
      id: `p_manual_${Date.now()}`,
      title: trimmedTitle,
      author: trimmedAuthor,
      dynasty: dynasty.trim() || '唐',
      type: type.trim() || '五言绝句',
      content: contentLines,
      status: 'learning',
      isFavorite: false,
      quizPassCount: 0,
      userNotes: userNotes.trim() || '自录诗卷，随心温习。',
      createdAt: new Date().toISOString(),
    };

    try {
      await onSavePoem(newRecord);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('保存诗词失败，请重试');
    }
  };

  const parsedLineCount = rawContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 16, 12, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* 宣纸古风卷轴卡 */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '90vh',
          backgroundColor: '#FAF5EB',
          borderRadius: 22,
          border: '2px solid #B0894C',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '14px 18px',
            background: 'linear-gradient(180deg, #F3EBD8 0%, #FAEDD9 100%)',
            borderBottom: '1.5px solid #D8C7A5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 5px rgba(185, 28, 28, 0.35)',
              }}
            >
              <Feather size={16} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#451A03',
                  fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", cursive, sans-serif',
                }}
              >
                录入诗篇 · 亲手拾遗
              </div>
              <div style={{ fontSize: '11px', color: '#78350F' }}>
                收录自爱诗文，纳入在背书单温故知新
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#78350F',
              cursor: 'pointer',
              padding: 4,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={19} />
          </button>
        </div>

        {/* 表单内容可滚动区域 */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '16px 18px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {errorMsg && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 诗名 */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: 800,
                color: '#78350F',
                marginBottom: 4,
              }}
            >
              诗词名 / 词牌名 <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：定风波·莫听穿林打叶声"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1.5px solid #D8C7A5',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: '#292524',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 朝代与作者 (两列) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: '#78350F',
                  marginBottom: 4,
                }}
              >
                朝代
              </label>
              <select
                value={dynasty}
                onChange={(e) => setDynasty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1.5px solid #D8C7A5',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: '#292524',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                {DYNASTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: '#78350F',
                  marginBottom: 4,
                }}
              >
                诗家姓名 <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="例：苏轼"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #D8C7A5',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: '#292524',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* 体裁 */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: 800,
                color: '#78350F',
                marginBottom: 4,
              }}
            >
              体裁分类
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 10,
                border: '1.5px solid #D8C7A5',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: '#292524',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 诗句正文 */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <label
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: '#78350F',
                }}
              >
                诗句正文 <span style={{ color: '#DC2626' }}>*</span>
                {parsedLineCount > 0 && (
                  <span style={{ marginLeft: 6, color: '#16A34A', fontWeight: 600 }}>
                    ({parsedLineCount} 句)
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={handleAutoFormat}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid #D8C7A5',
                  backgroundColor: '#F3EBD8',
                  color: '#78350F',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="自动将整段文本分割规范为多行诗句"
              >
                <Wand2 size={12} />
                <span>智能排版分句</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="每行输入一句诗词，或直接粘贴全文点击右上角「智能排版分句」&#10;例：&#10;莫听穿林打叶声，&#10;何妨吟啸且徐行。&#10;竹杖芒鞋轻胜马，&#10;谁怕？一蓑烟雨任平生。"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1.5px solid #D8C7A5',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: '#292524',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.6,
                fontFamily: '"Songti SC", "SimSun", "STSong", serif, sans-serif',
              }}
            />
          </div>

          {/* 赏析随笔 / 口诀 (选填) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: 800,
                color: '#78350F',
                marginBottom: 4,
              }}
            >
              个人赏析随笔 / 记忆口诀 (选填)
            </label>
            <input
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="例：旷达超脱，雨中行吟之从容意境。"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1.5px solid #D8C7A5',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                color: '#292524',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 底部按钮 */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 12,
                border: '1.5px solid #D8C7A5',
                backgroundColor: '#F3EBD8',
                color: '#78350F',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              取消
            </button>

            <button
              type="submit"
              style={{
                flex: 1.8,
                padding: '9px 0',
                borderRadius: 12,
                border: '1.5px solid #991B1B',
                background: 'linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 3px 8px rgba(185, 28, 28, 0.35)',
              }}
            >
              <Check size={16} strokeWidth={2.8} />
              <span>收入诗阁 (入在背)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
