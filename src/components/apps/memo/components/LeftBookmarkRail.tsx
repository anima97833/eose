import React from 'react';
import { Plus, Book, Wallet, CheckSquare, Heart, Star, Folder, Trash2 } from 'lucide-react';
import { MemoCategory } from '../../../../core/memo/memoTypes';

interface LeftBookmarkRailProps {
  categories: MemoCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  onOpenCreateCategory: () => void;
  onDeleteCategory: (id: string) => void;
}

const renderIcon = (iconName: string, size = 16) => {
  switch (iconName) {
    case 'book':
      return <Book size={size} strokeWidth={2.5} />;
    case 'wallet':
      return <Wallet size={size} strokeWidth={2.5} />;
    case 'check':
      return <CheckSquare size={size} strokeWidth={2.5} />;
    case 'heart':
      return <Heart size={size} strokeWidth={2.5} />;
    case 'star':
      return <Star size={size} strokeWidth={2.5} />;
    default:
      return <Folder size={size} strokeWidth={2.5} />;
  }
};

export const LeftBookmarkRail: React.FC<LeftBookmarkRailProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  onOpenCreateCategory,
  onDeleteCategory,
}) => {
  return (
    <div
      style={{
        width: '52px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 0',
        background: '#854D0E', // 复古手账深棕木质外侧书脊边框
        borderRight: '3px solid #502428',
        boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.3)',
        flexShrink: 0,
        gap: '8px',
        zIndex: 10,
        overflowY: 'auto',
      }}
    >
      {/* 活页书签列表 */}
      {categories.map((cat) => {
        const isActive = cat.id === activeCategoryId;
        return (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            title={cat.name}
            style={{
              width: '42px',
              minHeight: '48px',
              borderRadius: '12px 6px 6px 12px',
              background: isActive
                ? cat.color
                : `linear-gradient(135deg, ${cat.color}99, ${cat.color}66)`,
              border: '2.5px solid #502428',
              borderRight: isActive ? 'none' : '2.5px solid #502428',
              marginRight: isActive ? '-5px' : '0px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isActive
                ? '0 3px 0 #502428, inset 0 1px 0 rgba(255,255,255,0.6)'
                : '0 2px 0 #502428',
              transform: isActive ? 'scale(1.05)' : 'scale(0.96)',
              transition: 'all 0.15s ease',
              position: 'relative',
              zIndex: isActive ? 12 : 2,
              padding: '4px 2px',
              boxSizing: 'border-box',
            }}
          >
            {/* 图标 */}
            <div style={{ color: '#FFFFFF', filter: 'drop-shadow(0 1px 0 #502428)' }}>
              {renderIcon(cat.icon, 16)}
            </div>
            {/* 分类缩写名称 (最多2个字符) */}
            <span
              style={{
                fontSize: '10px',
                fontWeight: 900,
                color: '#FFFFFF',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                letterSpacing: '0.5px',
                textShadow: '1px 1px 0 #502428, -1px -1px 0 #502428',
                marginTop: '1px',
                lineHeight: 1.1,
                textAlign: 'center',
              }}
            >
              {cat.name.slice(0, 2)}
            </span>

            {/* 选中时的金色小箭头指示 */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  right: '-1px',
                  width: '3px',
                  height: '16px',
                  background: '#FDE047',
                  borderRadius: '2px 0 0 2px',
                }}
              />
            )}
          </div>
        );
      })}

      {/* 新增分类书签按钮 */}
      <button
        onClick={onOpenCreateCategory}
        title="新增分类标签"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(180deg, #FEF08A 0%, #FBBF24 100%)',
          border: '2.5px solid #502428',
          boxShadow: '0 2.5px 0 #502428',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          marginTop: '6px',
        }}
      >
        <Plus size={18} color="#502428" strokeWidth={3.5} />
      </button>
    </div>
  );
};
