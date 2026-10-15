import React, { useRef } from 'react';
import { Check, X, Star } from 'lucide-react';
import { TodoItem, TodoPrefixStyle, formatTodoItem } from '../../../../core/memo/todoEngine';

interface MemoTodoListInteractiveProps {
  items: TodoItem[];
  currentStyle: TodoPrefixStyle;
  onUpdateItems: (newItems: TodoItem[]) => void;
  onAddNewAt: (index: number) => void;
}

export const MemoTodoListInteractive: React.FC<MemoTodoListInteractiveProps> = ({
  items,
  currentStyle,
  onUpdateItems,
  onAddNewAt,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. 切换某一条目的勾选完成状态
  const handleToggleItem = (index: number) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      isDone: !next[index].isDone,
    };
    onUpdateItems(next);
  };

  // 2. 文字输入修改（带光标位置精确锁定）
  const handleTextChange = (index: number, newText: string, cursor: number | null) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      cleanText: newText,
    };
    onUpdateItems(next);
    if (cursor !== null) {
      requestAnimationFrame(() => {
        const input = inputRefs.current[index];
        if (input) {
          input.setSelectionRange(cursor, cursor);
        }
      });
    }
  };

  // 3. 键盘按键逻辑（回车新增，退格删空行）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddNewAt(index + 1);
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
      }, 50);
    } else if (e.key === 'Backspace' && items[index].cleanText === '' && items.length > 1) {
      e.preventDefault();
      handleDeleteItem(index);
      setTimeout(() => {
        const prevIdx = Math.max(0, index - 1);
        if (inputRefs.current[prevIdx]) {
          inputRefs.current[prevIdx]?.focus();
        }
      }, 50);
    }
  };

  // 4. 删除某一项
  const handleDeleteItem = (index: number) => {
    const next = items.filter((_, idx) => idx !== index);
    if (next.length === 0) {
      // 保持至少一项
      next.push({
        id: `todo_${Date.now()}`,
        rawText: '',
        cleanText: '',
        isDone: false,
        prefixStyle: currentStyle,
        prefixDisplay: '',
      });
    }
    onUpdateItems(next);
  };

  // 渲染左侧打钩/符号按钮
  const renderPrefixButton = (item: TodoItem, index: number) => {
    const { isDone } = item;

    if (currentStyle === 'checkbox') {
      return (
        <button
          onClick={() => handleToggleItem(index)}
          title={isDone ? '标记为未完成' : '打钩标记完成'}
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '5px',
            background: isDone ? '#10B981' : '#FFFFFF',
            border: `1.8px solid ${isDone ? '#047857' : '#502428'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            boxShadow: isDone ? 'none' : '0 1.5px 0 #502428',
            transition: 'all 0.12s ease',
            flexShrink: 0,
          }}
        >
          {isDone && <Check size={13} color="#FFFFFF" strokeWidth={3.5} />}
        </button>
      );
    }

    if (currentStyle === 'number') {
      return (
        <button
          onClick={() => handleToggleItem(index)}
          title="点击可打钩切换完成"
          style={{
            minWidth: '22px',
            height: '18px',
            padding: '0 4px',
            borderRadius: '6px',
            background: isDone ? '#D1FAE5' : '#FEF3C7',
            border: `1.5px solid ${isDone ? '#10B981' : '#D97706'}`,
            color: isDone ? '#059669' : '#78350F',
            fontSize: '11px',
            fontWeight: 900,
            fontFamily: '"ZCOOL KuaiLe", sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {isDone ? '√' : `${index + 1}.`}
        </button>
      );
    }

    if (currentStyle === 'circle_number') {
      const circ = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'][index] || `${index + 1}.`;
      return (
        <button
          onClick={() => handleToggleItem(index)}
          title="点击可打钩切换完成"
          style={{
            width: '20px',
            height: '18px',
            borderRadius: '50%',
            background: isDone ? '#D1FAE5' : '#FFFFFF',
            border: `1.5px solid ${isDone ? '#10B981' : '#502428'}`,
            color: isDone ? '#059669' : '#502428',
            fontSize: '11px',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          {isDone ? '√' : circ}
        </button>
      );
    }

    if (currentStyle === 'star') {
      return (
        <button
          onClick={() => handleToggleItem(index)}
          title={isDone ? '标记为未完成' : '点亮星标完成'}
          style={{
            width: '18px',
            height: '18px',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <Star
            size={16}
            color={isDone ? '#F59E0B' : '#9CA3AF'}
            fill={isDone ? '#F59E0B' : 'transparent'}
            strokeWidth={2.5}
          />
        </button>
      );
    }

    // 默认 bullet 圆点
    return (
      <button
        onClick={() => handleToggleItem(index)}
        title="点击可打钩切换完成"
        style={{
          width: '18px',
          height: '18px',
          background: 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: isDone ? '#10B981' : '#502428',
            display: 'inline-block',
          }}
        />
      </button>
    );
  };

  return (
    <div
      style={{
        flex: 1,
        background: '#FFFDF9',
        border: '2.5px solid #502428',
        borderTop: 'none',
        borderBottom: 'none',
        padding: '6px 10px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #E8DFD5 28px)',
        backgroundAttachment: 'local',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, index) => {
          const { isDone } = item;
          return (
            <div
              key={item.id || index}
              style={{
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
              }}
            >
              {/* 专门的左侧打钩/符号位置 */}
              {renderPrefixButton(item, index)}

              {/* 中间内联文字编辑 */}
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                value={item.cleanText}
                onChange={(e) => {
                  const cursor = e.target.selectionStart;
                  handleTextChange(index, e.target.value, cursor);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="写下待办事项 (回车自动下一行)..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13.5px',
                  lineHeight: '28px',
                  color: isDone ? '#9CA3AF' : '#292524',
                  textDecoration: isDone ? 'line-through' : 'none',
                  fontFamily:
                    '"ZCOOL KuaiLe", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  padding: 0,
                  margin: 0,
                }}
              />

              {/* 右侧微型删除行按钮 */}
              <button
                onClick={() => handleDeleteItem(index)}
                title="删除此行"
                tabIndex={-1}
                style={{
                  width: '16px',
                  height: '16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.3,
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.3')}
              >
                <X size={12} color="#DC2626" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
