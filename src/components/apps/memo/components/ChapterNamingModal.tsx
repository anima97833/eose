import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ChapterNamingModalProps {
  initialChapterName?: string;
  initialLevel1?: string;
  initialLevel2?: string;
  isEditMode?: boolean;
  onSave: (chapterName: string, titleLevel1: string, titleLevel2: string) => void;
  onClose: () => void;
}

export const ChapterNamingModal: React.FC<ChapterNamingModalProps> = ({
  initialChapterName = '',
  initialLevel1 = '',
  initialLevel2 = '',
  isEditMode = false,
  onSave,
  onClose,
}) => {
  const [chapterName, setChapterName] = useState(initialChapterName);
  const [level1, setLevel1] = useState(initialLevel1);
  const [level2, setLevel2] = useState(initialLevel2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalChapName = chapterName.trim() || '新篇章';
    const finalL1 = level1.trim() || finalChapName;
    const finalL2 = level2.trim() || '正文草稿';
    onSave(finalChapName, finalL1, finalL2);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 120,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '310px',
          background: '#FFFBEB',
          border: '3px solid #502428',
          borderRadius: '22px',
          boxShadow: '0 8px 0 #502428, 0 16px 28px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 顶部栏 */}
        <div
          style={{
            background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
            borderBottom: '2.5px solid #502428',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 900,
              color: '#502428',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            {isEditMode ? '✏️ 编辑篇章与标题' : '📖 创建新篇章'}
          </span>
          <button
            onClick={onClose}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '2px solid #502428',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={14} color="#502428" strokeWidth={3} />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#502428', marginBottom: '5px' }}>
              篇章标识名称（展示在底部托盘）
            </label>
            <input
              type="text"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder="例如：第1篇·日常账簿 / 卷一·随笔"
              maxLength={12}
              autoFocus
              style={{
                width: '100%',
                height: '36px',
                padding: '0 10px',
                borderRadius: '10px',
                border: '2px solid #502428',
                background: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                color: '#502428',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#502428', marginBottom: '5px' }}>
              一级主标题（展示在手账纸顶端）
            </label>
            <input
              type="text"
              value={level1}
              onChange={(e) => setLevel1(e.target.value)}
              placeholder="例如：9月生活开销大盘"
              maxLength={16}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 10px',
                borderRadius: '10px',
                border: '2px solid #502428',
                background: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                color: '#502428',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#502428', marginBottom: '5px' }}>
              二级副标题（章节副标题）
            </label>
            <input
              type="text"
              value={level2}
              onChange={(e) => setLevel2(e.target.value)}
              placeholder="例如：日常餐饮与手账好物"
              maxLength={18}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 10px',
                borderRadius: '10px',
                border: '2px solid #502428',
                background: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                color: '#502428',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 提交按钮 */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '12px',
                background: '#FFFFFF',
                border: '2px solid #502428',
                fontSize: '13px',
                fontWeight: 800,
                color: '#502428',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '12px',
                background: '#F59E0B',
                border: '2px solid #502428',
                fontSize: '13px',
                fontWeight: 800,
                color: '#FFFFFF',
                boxShadow: '0 2px 0 #B45309',
                cursor: 'pointer',
              }}
            >
              {isEditMode ? '保存修改' : '确认创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
