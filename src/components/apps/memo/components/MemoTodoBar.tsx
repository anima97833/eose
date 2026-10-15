import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  ListOrdered,
  CircleDot,
  Star,
  Plus,
  PenTool,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { TodoPrefixStyle } from '../../../../core/memo/todoEngine';

interface MemoTodoBarProps {
  totalCount: number;
  doneCount: number;
  currentStyle: TodoPrefixStyle;
  isInteractiveMode: boolean;
  onChangeStyle: (newStyle: TodoPrefixStyle) => void;
  onToggleInteractiveMode: () => void;
  onAddTodo: () => void;
}

const STYLE_DEFINITIONS: {
  style: TodoPrefixStyle;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}[] = [
  {
    style: 'checkbox',
    label: '打钩方框',
    icon: (active) => <CheckSquare size={13} color={active ? '#059669' : '#502428'} />,
  },
  {
    style: 'number',
    label: '1, 2, 3 数字',
    icon: (active) => <ListOrdered size={13} color={active ? '#059669' : '#502428'} />,
  },
  {
    style: 'circle_number',
    label: '① ② ③ 序号',
    icon: (active) => (
      <span
        style={{
          fontSize: '12px',
          fontWeight: 900,
          color: active ? '#059669' : '#502428',
          lineHeight: 1,
        }}
      >
        ①
      </span>
    ),
  },
  {
    style: 'bullet',
    label: '• 手账圆点',
    icon: (active) => <CircleDot size={13} color={active ? '#059669' : '#502428'} />,
  },
  {
    style: 'star',
    label: '★ 星标优先',
    icon: (active) => (
      <Star
        size={13}
        color={active ? '#D97706' : '#502428'}
        fill={active ? '#FBBF24' : 'transparent'}
      />
    ),
  },
];

export const MemoTodoBar: React.FC<MemoTodoBarProps> = ({
  totalCount,
  doneCount,
  currentStyle,
  isInteractiveMode,
  onChangeStyle,
  onToggleInteractiveMode,
  onAddTodo,
}) => {
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const isAllDone = percent === 100 && totalCount > 0;

  // 点击外部自动收起下拉
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowStyleMenu(false);
      }
    };
    if (showStyleMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showStyleMenu]);

  // 当前激活的样式对象
  const activeStyleDef =
    STYLE_DEFINITIONS.find((d) => d.style === currentStyle) || STYLE_DEFINITIONS[0];

  return (
    <div
      style={{
        position: 'relative',
        background: '#FFFBEB',
        borderLeft: '2.5px solid #502428',
        borderRight: '2.5px solid #502428',
        borderBottom: '2px dashed #E5D5C5',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        height: '32px',
        boxSizing: 'border-box',
        boxShadow: 'inset 0 -1px 3px rgba(80, 36, 40, 0.04)',
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      {/* 1. 左侧：极简进度胶囊 + 细进度条 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
        <div
          title={`待办进度：${doneCount}/${totalCount} (${percent}%)`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            background: isAllDone ? '#ECFDF5' : '#EFF6FF',
            border: `1.5px solid ${isAllDone ? '#10B981' : '#3B82F6'}`,
            borderRadius: '12px',
            padding: '1px 6px',
            height: '20px',
            boxSizing: 'border-box',
          }}
        >
          <CheckCircle2 size={11} color={isAllDone ? '#059669' : '#2563EB'} />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 900,
              color: isAllDone ? '#047857' : '#1D4ED8',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            {doneCount}/{totalCount}
          </span>
        </div>

        {/* 极简纤细血条 */}
        <div
          style={{
            width: '36px',
            height: '5px',
            background: '#E5E7EB',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid #D1D5DB',
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              background: isAllDone ? '#10B981' : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
              transition: 'width 0.25s ease',
            }}
          />
        </div>
      </div>

      {/* 2. 右侧操作区：排列下拉按钮 + 极简➕加项 + 纯文本/交互切换 */}
      <div
        ref={menuRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* 排列格式折叠按钮（点击展开菜单） */}
        <button
          onClick={() => setShowStyleMenu(!showStyleMenu)}
          title="点击更换待办符号排列 (1,2,3 / ①②③ / 打钩 / 圆点 / 星标)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            padding: '2px 6px',
            height: '22px',
            borderRadius: '8px',
            background: showStyleMenu ? '#FEF3C7' : '#FFFFFF',
            border: '1.5px solid #502428',
            boxShadow: '0 1px 0 #502428',
            cursor: 'pointer',
            transition: 'all 0.12s ease',
          }}
        >
          {activeStyleDef.icon(true)}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 900,
              color: '#502428',
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            排列
          </span>
          <ChevronDown
            size={11}
            color="#502428"
            style={{
              transform: showStyleMenu ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          />
        </button>

        {/* 快捷加一项（极简干练） */}
        {isInteractiveMode && (
          <button
            onClick={onAddTodo}
            title="添加一项待办"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              height: '22px',
              padding: '0 6px',
              borderRadius: '8px',
              background: '#2563EB',
              border: '1.5px solid #502428',
              boxShadow: '0 1px 0 #502428',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 900,
              fontFamily: '"ZCOOL KuaiLe", sans-serif',
            }}
          >
            <Plus size={12} strokeWidth={3} />
            <span>加项</span>
          </button>
        )}

        {/* 模式切换：打钩清单 vs 纯文本 */}
        <button
          onClick={onToggleInteractiveMode}
          title={isInteractiveMode ? '切换为纯手写文本' : '切换为左侧打钩清单'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '8px',
            background: isInteractiveMode ? '#F3F4F6' : '#FEF3C7',
            border: '1.5px solid #502428',
            boxShadow: '0 1px 0 #502428',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {isInteractiveMode ? (
            <PenTool size={11} color="#4B5563" />
          ) : (
            <CheckSquare size={12} color="#2563EB" />
          )}
        </button>

        {/* 弹出式排列格式选择气泡 (Popover) */}
        {showStyleMenu && (
          <div
            style={{
              position: 'absolute',
              top: '28px',
              right: '28px',
              background: '#FFFDF9',
              border: '2px solid #502428',
              borderRadius: '12px',
              boxShadow: '0 6px 16px rgba(80, 36, 40, 0.18)',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              minWidth: '125px',
              zIndex: 60,
            }}
          >
            {STYLE_DEFINITIONS.map((def) => {
              const isSelected = currentStyle === def.style;
              return (
                <button
                  key={def.style}
                  onClick={() => {
                    onChangeStyle(def.style);
                    setShowStyleMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '7px',
                    background: isSelected ? '#FEF3C7' : 'transparent',
                    border: isSelected ? '1px solid #D97706' : '1px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {def.icon(isSelected)}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: isSelected ? 900 : 700,
                      color: isSelected ? '#92400E' : '#374151',
                      fontFamily: '"ZCOOL KuaiLe", sans-serif',
                    }}
                  >
                    {def.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
