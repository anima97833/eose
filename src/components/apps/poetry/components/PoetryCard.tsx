import React from 'react';
import { Heart, BookOpen, Award, Trash2 } from 'lucide-react';
import { SavedPoemRecord } from '../../../../core/poetry/poetryTypes';

interface PoetryCardProps {
  poem: SavedPoemRecord;
  onOpenDetail: (poem: SavedPoemRecord) => void;
  onStartExam: (poem: SavedPoemRecord) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PoetryCard: React.FC<PoetryCardProps> = ({
  poem,
  onOpenDetail,
  onStartExam,
  onToggleFavorite,
  onDelete,
}) => {
  const isMastered = poem.status === 'mastered';

  return (
    <div
      onClick={() => onOpenDetail(poem)}
      style={{
        position: 'relative',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #fdfbf7 0%, #f7f2e7 100%)',
        border: '1px solid #e7dcce',
        borderRadius: 16,
        padding: '16px 16px 14px',
        boxShadow:
          '0 4px 12px rgba(120, 95, 65, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      {/* 顶部古典宣纸纹理衬条与装订线孔暗纹 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: isMastered
            ? 'linear-gradient(90deg, #b91c1c, #dc2626, #b91c1c)'
            : 'linear-gradient(90deg, #b0894c, #d4a359, #b0894c)',
        }}
      />

      {/* 标题栏与朝代/体裁标签 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#2a221a',
                letterSpacing: '0.04em',
                fontFamily: '"Songti SC", "SimSun", serif',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '180px',
              }}
              title={poem.title}
            >
              {poem.title}
            </h3>

            {/* 朝代胶囊 */}
            <span
              style={{
                fontSize: '0.72rem',
                padding: '1px 6px',
                borderRadius: 4,
                backgroundColor: '#efe5d4',
                color: '#7a5a32',
                fontWeight: 600,
                border: '1px solid #dfd1bd',
              }}
            >
              {poem.dynasty || '唐'}
            </span>

            {/* 体裁 */}
            {poem.type && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  borderRadius: 4,
                  backgroundColor: '#f3eee4',
                  color: '#8c775e',
                  border: '1px solid #e3d9c8',
                }}
              >
                {poem.type}
              </span>
            )}
          </div>

          {/* 作者名号 */}
          <div
            style={{
              fontSize: '0.8rem',
              color: '#6e5f4e',
              marginTop: 3,
              fontWeight: 500,
            }}
          >
            【{poem.author || '佚名'}】
          </div>
        </div>

        {/* 右侧朱红印章（方向A经典印章质感） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isMastered ? (
            <div
              style={{
                padding: '2px 6px',
                border: '1.5px solid #b91c1c',
                borderRadius: 4,
                color: '#b91c1c',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                background: '#fef2f2',
                transform: 'rotate(-4deg)',
                boxShadow: '0 1px 3px rgba(185, 28, 28, 0.15)',
                userSelect: 'none',
              }}
              title="御批熟背"
            >
              熟背·御批
            </div>
          ) : (
            <div
              style={{
                padding: '2px 6px',
                border: '1.5px dashed #b0894c',
                borderRadius: 4,
                color: '#8c6b32',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: '#faf6ee',
                userSelect: 'none',
              }}
              title="在背温故"
            >
              在背·温故
            </div>
          )}

          {/* 心仪收藏按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(poem.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              color: poem.isFavorite ? '#dc2626' : '#b8aa98',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
            }}
            title={poem.isFavorite ? '取消心仪' : '心仪收藏'}
          >
            <Heart
              size={18}
              fill={poem.isFavorite ? '#dc2626' : 'none'}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* 诗句预览区（墨香排版） */}
      <div
        onClick={() => onOpenDetail(poem)}
        style={{
          background: '#fcfaf5',
          borderRadius: 10,
          border: '1px solid #eae1d3',
          padding: '10px 12px',
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: '"Songti SC", "SimSun", serif',
            fontSize: '0.88rem',
            lineHeight: 1.7,
            color: '#382f25',
            letterSpacing: '0.05em',
          }}
        >
          {poem.content.slice(0, 4).map((line, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              {line}
            </div>
          ))}
          {poem.content.length > 4 && (
            <div
              style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#a39482',
                marginTop: 2,
              }}
            >
              …… 全篇共 {poem.content.length} 行 ……
            </div>
          )}
        </div>
      </div>

      {/* 底部操作行（科举考核、详情诵读、删除） */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingTop: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* 科举挖词考核按钮（核心考核入口） */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartExam(poem);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 12px',
              borderRadius: 8,
              border: '1px solid #b91c1c',
              background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(185, 28, 28, 0.25)',
            }}
          >
            <Award size={14} strokeWidth={2.2} />
            <span>考核</span>
          </button>

          {/* 诵读精读按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(poem);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 11px',
              borderRadius: 8,
              border: '1px solid #dcd1be',
              background: '#fcf9f2',
              color: '#5e4e3b',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <BookOpen size={14} strokeWidth={2} />
            <span>诵读</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {poem.quizPassCount > 0 && (
            <span
              style={{
                fontSize: '0.72rem',
                color: '#87693d',
                fontWeight: 600,
              }}
            >
              通关 {poem.quizPassCount} 次
            </span>
          )}

          {/* 删除按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(poem.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: '#b0a291',
              borderRadius: 6,
            }}
            title="移除诗篇"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
