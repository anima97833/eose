/**
 * 便签手账 - 待办清单与符号序号引擎
 * 支持左侧专属打钩切换、多种序号排列格式切换（[√]打钩、1.2.3数字、①②③圆圈数字、•手账圆点、★星号）
 */

export type TodoPrefixStyle = 'checkbox' | 'number' | 'circle_number' | 'bullet' | 'star';

export interface TodoItem {
  id: string;
  rawText: string;
  cleanText: string;
  isDone: boolean;
  prefixStyle: TodoPrefixStyle;
  prefixDisplay: string;
}

// 常见圆圈数字映射
const CIRCLE_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'];

/**
 * 识别单行文本的前缀类型与完成状态
 */
export function parseTodoLine(line: string, index: number): TodoItem {
  const trimmed = line.trim();
  // 保持稳定 ID，避免输入字符时因 key 变化导致 DOM 重建与光标丢失
  const id = `todo_item_${index}`;

  // 1. 方框打钩匹配: [√], [x], [X], [✓], [ ]
  const checkboxMatch = trimmed.match(/^\[([√xX✓\s]*)\]\s*(.*)$/);
  if (checkboxMatch) {
    const mark = checkboxMatch[1].trim();
    const isDone = mark === '√' || mark === 'x' || mark === 'X' || mark === '✓';
    return {
      id,
      rawText: line,
      cleanText: checkboxMatch[2],
      isDone,
      prefixStyle: 'checkbox',
      prefixDisplay: isDone ? '[√]' : '[ ]',
    };
  }

  // 2. 星星清单匹配: ★ (已完成/重点), ☆ (未完成)
  const starMatch = trimmed.match(/^([★☆])\s*(.*)$/);
  if (starMatch) {
    const isDone = starMatch[1] === '★';
    return {
      id,
      rawText: line,
      cleanText: starMatch[2],
      isDone,
      prefixStyle: 'star',
      prefixDisplay: isDone ? '★' : '☆',
    };
  }

  // 3. 数字编号匹配: 1. 2. 3. 或 1、 2、
  const numberMatch = trimmed.match(/^(\d+)[\.、\s]\s*(.*)$/);
  if (numberMatch) {
    return {
      id,
      rawText: line,
      cleanText: numberMatch[2],
      isDone: false,
      prefixStyle: 'number',
      prefixDisplay: `${index + 1}.`,
    };
  }

  // 4. 圆圈数字匹配: ① ② ③
  const circleMatch = trimmed.match(/^([①-⑳])\s*(.*)$/);
  if (circleMatch) {
    return {
      id,
      rawText: line,
      cleanText: circleMatch[2],
      isDone: false,
      prefixStyle: 'circle_number',
      prefixDisplay: CIRCLE_NUMBERS[index] || `${index + 1}.`,
    };
  }

  // 5. 经典圆点匹配: • 或 - 或 *
  const bulletMatch = trimmed.match(/^[•\-\*·]\s*(.*)$/);
  if (bulletMatch) {
    return {
      id,
      rawText: line,
      cleanText: bulletMatch[1],
      isDone: false,
      prefixStyle: 'bullet',
      prefixDisplay: '•',
    };
  }

  // 6. 普通文本行（默认视为待办内容）
  return {
    id,
    rawText: line,
    cleanText: trimmed,
    isDone: false,
    prefixStyle: 'checkbox',
    prefixDisplay: '[ ]',
  };
}

/**
 * 解析整篇手账正文为待办列表
 */
export function parseTodoList(content: string): TodoItem[] {
  if (!content || !content.trim()) return [];
  const lines = content.split('\n');
  return lines
    .filter((l) => l.trim().length > 0)
    .map((line, idx) => parseTodoLine(line, idx));
}

/**
 * 将 TodoItem 转换为特定前缀样式的单行文本
 */
export function formatTodoItem(item: TodoItem, targetStyle: TodoPrefixStyle, index: number): string {
  const text = item.cleanText.trim();
  switch (targetStyle) {
    case 'checkbox':
      return item.isDone ? `[√] ${text}` : `[ ] ${text}`;
    case 'number':
      return `${index + 1}. ${text}`;
    case 'circle_number': {
      const circ = CIRCLE_NUMBERS[index] || `${index + 1}.`;
      return `${circ} ${text}`;
    }
    case 'bullet':
      return `• ${text}`;
    case 'star':
      return item.isDone ? `★ ${text}` : `☆ ${text}`;
    default:
      return item.isDone ? `[√] ${text}` : `[ ] ${text}`;
  }
}

/**
 * 将整篇待办一键批量转换为指定排列样式
 */
export function convertTodoListStyle(content: string, targetStyle: TodoPrefixStyle): string {
  const items = parseTodoList(content);
  if (items.length === 0) {
    // 若为空，给一个初始空行
    return targetStyle === 'number'
      ? '1. '
      : targetStyle === 'circle_number'
      ? '① '
      : targetStyle === 'bullet'
      ? '• '
      : targetStyle === 'star'
      ? '☆ '
      : '[ ] ';
  }
  return items.map((item, idx) => formatTodoItem(item, targetStyle, idx)).join('\n');
}

/**
 * 切换某一项的勾选/完成状态
 */
export function toggleTodoItemDone(
  content: string,
  targetIndex: number,
  currentStyle: TodoPrefixStyle = 'checkbox'
): string {
  const items = parseTodoList(content);
  if (targetIndex < 0 || targetIndex >= items.length) return content;

  items[targetIndex].isDone = !items[targetIndex].isDone;
  return items.map((item, idx) => formatTodoItem(item, currentStyle, idx)).join('\n');
}

/**
 * 获取当前文本主导的前缀风格
 */
export function detectDominantStyle(content: string): TodoPrefixStyle {
  const items = parseTodoList(content);
  if (items.length === 0) return 'checkbox';

  const counts: Record<TodoPrefixStyle, number> = {
    checkbox: 0,
    number: 0,
    circle_number: 0,
    bullet: 0,
    star: 0,
  };

  for (const item of items) {
    counts[item.prefixStyle] = (counts[item.prefixStyle] || 0) + 1;
  }

  let dominant: TodoPrefixStyle = 'checkbox';
  let maxCount = -1;
  for (const [style, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = style as TodoPrefixStyle;
    }
  }

  return dominant;
}
