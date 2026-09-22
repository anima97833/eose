import { CharacterRegexScript } from '../../types/character';

// 编译缓存：同一 findRegex 字符串复用编译结果，避免反复 new RegExp 掉帧
const regexCache = new Map<string, RegExp | null>();

/**
 * 解析形如 `/pattern/flags` 或纯文本的正则表达式
 */
export function regexFromString(input: string): RegExp | null {
  if (!input || typeof input !== 'string') return null;
  if (regexCache.has(input)) return regexCache.get(input)!;

  let compiled: RegExp | null = null;
  try {
    const trimmed = input.trim();
    // 匹配 /pattern/flags 结构
    const slashMatch = trimmed.match(/^\/(.*)\/([a-z]*)$/i);
    if (slashMatch) {
      const pattern = slashMatch[1];
      const flags = slashMatch[2] || '';
      compiled = new RegExp(pattern, flags);
    } else {
      // 默认全局不区分大小写
      compiled = new RegExp(trimmed, 'gi');
    }
  } catch (err) {
    compiled = null;
  }

  regexCache.set(input, compiled);
  return compiled;
}

/**
 * 校验正则表达式合法性
 */
export function validateRegex(input: string): { isValid: boolean; error?: string } {
  if (!input || !input.trim()) {
    return { isValid: false, error: '正则表达式不能为空' };
  }
  try {
    const trimmed = input.trim();
    const slashMatch = trimmed.match(/^\/(.*)\/([a-z]*)$/i);
    if (slashMatch) {
      new RegExp(slashMatch[1], slashMatch[2]);
    } else {
      new RegExp(trimmed, 'gi');
    }
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err?.message || '正则表达式语法无效' };
  }
}

/**
 * 5大官方预置酒馆神仙美化模板
 */
export const PRESET_REGEX_SCRIPTS: CharacterRegexScript[] = [
  {
    id: 'preset_think_fold',
    scriptName: '🧠 思维链拟物折叠框',
    findRegex: '/<think>([\\s\\S]*?)<\\/think>/gi',
    replaceString:
      '<details class="nm-think-box"><summary class="nm-think-summary">🧠 思考过程 (点击折叠/展开)</summary><div class="nm-think-content">$1</div></details>',
    placement: 'display',
    disabled: false,
    description: '将模型内部思考链标签 <think> 转换为轻拟物可折叠手风琴框',
  },
  {
    id: 'preset_thought_whisper',
    scriptName: '💭 括号心声偷听气泡',
    findRegex: '/[（(]([^）)]+)[）)]/g',
    replaceString: '<span class="nm-thought-whisper">💭 $1</span>',
    placement: 'display',
    disabled: false,
    description: '将括号内的心理独白美化为轻拟物半透明偷听心声气泡',
  },
  {
    id: 'preset_action_tag',
    scriptName: '🎭 动作星号斜体美化',
    findRegex: '/\\*([^*]+)\\*/g',
    replaceString: '<span class="nm-action-tag">*$1*</span>',
    placement: 'display',
    disabled: false,
    description: '将星号包裹的动作描写转换为优雅倾斜的微小拟物标签',
  },
  {
    id: 'preset_dialogue_highlight',
    scriptName: '💬 对白台词高亮与染色',
    findRegex: '/[“"「]([^”"」]+)[”"」]/g',
    replaceString: '<span class="nm-dialogue-highlight">“$1”</span>',
    placement: 'display',
    disabled: false,
    description: '将台词加深并赋予角色专属重点对白高光',
  },
  {
    id: 'preset_strip_cliche',
    scriptName: '🧹 自动过滤AI机械废话',
    findRegex: '/(?:好的|当然可以|作为一个AI助手|作为您的助手)[，,。!！\\s]*/gi',
    replaceString: '',
    placement: 'display',
    disabled: true,
    description: '自动清洗大模型机械重复的确认客套话',
  },
];

/**
 * 运行正则流水线处理文本
 */
export function applyRegexScripts(
  text: string,
  scripts: CharacterRegexScript[] = [],
  context: {
    charName?: string;
    userName?: string;
    placement?: 'display' | 'ai_output' | 'user_input';
  } = {}
): string {
  if (!text) return '';
  const currentPlacement = context.placement || 'display';

  let result = text;

  for (const script of scripts) {
    if (script.disabled) continue;
    if (script.placement !== 'all' && script.placement !== currentPlacement) {
      continue;
    }

    const reg = regexFromString(script.findRegex);
    if (!reg) continue;

    // 替换宏变量：{{char}} -> 角色名, {{user}} -> 用户名, {{match}} -> $0
    let replaceTpl = script.replaceString || '';
    if (context.charName) {
      replaceTpl = replaceTpl.replace(/\{\{char\}\}/gi, context.charName);
    }
    if (context.userName) {
      replaceTpl = replaceTpl.replace(/\{\{user\}\}/gi, context.userName);
    }
    replaceTpl = replaceTpl.replace(/\{\{match\}\}/gi, '$0');

    try {
      // 重置 sticky/global 正则的 lastIndex
      if (reg.global || reg.sticky) {
        reg.lastIndex = 0;
      }
      result = result.replace(reg, replaceTpl);
    } catch (err) {
      console.warn('Regex replacement error:', err, script);
    }
  }

  return result;
}
