/**
 * 便签手账 - 智能预算计算器引擎
 * 支持从手账自然语言/手写记录中智能解析提取支出明细，并从可用预算中自动扣除计算结余
 */

export interface ExpenseItem {
  amount: number;
  label: string;
  rawLine: string;
}

export interface ExpenseParseResult {
  items: ExpenseItem[];
  totalExpense: number;
  budgetTotal: number;
  remainingBalance: number;
  usageRatio: number; // 0 ~ 1 (支出占预算比例)
  isOverBudget: boolean;
}

// 排除包含汇总词汇的整行（防止将文末总计重复累计）
const SUMMARY_LINE_REGEX = /(?:总计|合计|总额|结余|剩余|可用|预算|支出汇总|支出小计)/i;

/**
 * 从单行文本中智能提取开销金额
 */
function extractAmountFromLine(line: string): number | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // 1. 如果行内包含总计字眼，直接排除
  if (SUMMARY_LINE_REGEX.test(trimmed)) {
    return null;
  }

  // 2. 匹配规则 A：带货币符号 ￥ / ¥ (如 "￥18.00", "¥ 25", "￥32")
  const currencyMatch = trimmed.match(/[￥¥]\s*([0-9]+(?:\.[0-9]{1,2})?)/);
  if (currencyMatch && currencyMatch[1]) {
    const val = parseFloat(currencyMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  // 3. 匹配规则 B：带汉字货币单位 "元" 或 "块" (如 "18元", "25.5块")
  // 必须确保前面不是日期或序数，例如不能是 "9月22日"
  const unitMatch = trimmed.match(/(?:^|[^\d月年号\.\-])([0-9]+(?:\.[0-9]{1,2})?)\s*(?:元|块|rmb|RMB)/i);
  if (unitMatch && unitMatch[1]) {
    const val = parseFloat(unitMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  // 4. 匹配规则 C：明确的开销动词前缀 (如 "支出 18", "买咖啡 18", "花费 35.5")
  const verbMatch = trimmed.match(/(?:支出|消费|花费|开销|买|购入|扣款)\s*[:：\-]?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
  if (verbMatch && verbMatch[1]) {
    const val = parseFloat(verbMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  // 5. 匹配规则 D：行末单纯数字格式（例如 "• 9月22日 暖阳拿铁 18.00"），但前面不能是日期
  const endNumberMatch = trimmed.match(/(?:^|[^\d月年号\.\-\/])([0-9]+(?:\.[0-9]{1,2}))\s*$/);
  if (endNumberMatch && endNumberMatch[1]) {
    const val = parseFloat(endNumberMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  return null;
}

/**
 * 清理行文本，提取用于展示的品名标签
 */
function extractLabelFromLine(line: string, amount: number): string {
  let label = line.trim();
  // 去除行首的无序列表标记
  label = label.replace(/^[•\-\*\+·\d+\.\s]+/, '');
  // 去除日期标记 (如 "9月22日", "2026-09-22")
  label = label.replace(/\d{1,4}[-/.年]\d{1,2}(?:[-/.月]\d{1,2}[日号]?)?/, '');
  // 去除金额部分
  label = label.replace(new RegExp(`[￥¥]?\\s*${amount}(?:\\.[0-9]{1,2})?\\s*(?:元|块|RMB)?`, 'gi'), '');
  label = label.trim();
  return label || '日常支出';
}

/**
 * 解析手账正文，提取所有支出并与可用金额进行扣减计算
 */
export function parseExpensesFromContent(
  content: string,
  budgetTotal: number = 500
): ExpenseParseResult {
  const lines = (content || '').split('\n');
  const items: ExpenseItem[] = [];
  let totalExpense = 0;

  for (const line of lines) {
    const amount = extractAmountFromLine(line);
    if (amount !== null) {
      items.push({
        amount,
        label: extractLabelFromLine(line, amount),
        rawLine: line,
      });
      totalExpense += amount;
    }
  }

  // 保证两位小数精度处理
  totalExpense = Math.round(totalExpense * 100) / 100;
  const remainingBalance = Math.round((budgetTotal - totalExpense) * 100) / 100;
  const usageRatio = budgetTotal > 0 ? Math.min(totalExpense / budgetTotal, 1) : 0;
  const isOverBudget = remainingBalance < 0;

  return {
    items,
    totalExpense,
    budgetTotal,
    remainingBalance,
    usageRatio,
    isOverBudget,
  };
}

/**
 * 生成或更新末尾的标准手账总计结余行
 */
export function appendOrUpdateSummaryLine(
  content: string,
  totalExpense: number,
  remainingBalance: number
): string {
  const lines = (content || '').split('\n');
  const summaryText = `今日总计：￥${totalExpense.toFixed(2)}  (可用结余：￥${remainingBalance.toFixed(2)}) ✨`;

  // 查找是否已经有总计/结余行
  let summaryIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (SUMMARY_LINE_REGEX.test(lines[i])) {
      summaryIdx = i;
      break;
    }
  }

  if (summaryIdx !== -1) {
    lines[summaryIdx] = summaryText;
  } else {
    // 末尾追加空行和总计
    if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
      lines.push('');
    }
    lines.push(summaryText);
  }

  return lines.join('\n');
}
