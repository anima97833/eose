/**
 * 古诗词纯粹默写与限时语音背诵核心引擎
 */

export const PUNCTUATION_CLEAN_REGEX = /[，。？！；、：“”‘’《》（）——…·\s\r\n\t]/g;

/**
 * 清除所有中英文标点符号与空白字符，仅保留纯汉字/字母数字
 */
export function cleanClassicalText(text: string): string {
  if (!text) return '';
  return text.replace(PUNCTUATION_CLEAN_REGEX, '').trim();
}

/**
 * 计算诗词正文的纯汉字字数并推算智能推荐背诵秒数（按每字约 1.2 秒）
 */
export function calculateRecommendedRecitationSeconds(content: string[]): {
  charCount: number;
  recommendedSeconds: number;
} {
  const fullRaw = content.join('');
  const clean = cleanClassicalText(fullRaw);
  const charCount = clean.length;
  // 基础时间：字数 * 1.2 秒 + 5秒余量，范围限制在 10 ~ 180 秒
  const recommendedSeconds = Math.max(10, Math.min(180, Math.round(charCount * 1.2 + 5)));
  return {
    charCount,
    recommendedSeconds,
  };
}

/**
 * 最长公共子序列 (LCS) 动态规划算法，用于比对背诵文本与原诗的字符匹配
 */
export function computeLCS(s1: string, s2: string): string {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 回溯还原匹配字符
  let i = m;
  let j = n;
  const lcsChars: string[] = [];
  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) {
      lcsChars.push(s1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcsChars.reverse().join('');
}

export interface PoetryDiffItem {
  char: string;
  isPunctuation: boolean;
  matched: boolean;
}

export interface RecitationEvaluationResult {
  similarity: number; // 0 ~ 100
  passed: boolean; // 是否达到熟背通过线 (>= 85%)
  targetTotalChars: number;
  matchedCharCount: number;
  lineDiffs: PoetryDiffItem[][]; // 逐行对照高亮
  errorCount: number;
}

/**
 * 比对用户输入/背诵内容与目标古诗，生成打分与逐字高亮
 */
export function evaluatePoetryRecitation(
  userInput: string,
  targetContent: string[]
): RecitationEvaluationResult {
  const cleanInput = cleanClassicalText(userInput);
  const fullTargetRaw = targetContent.join('');
  const cleanTarget = cleanClassicalText(fullTargetRaw);

  if (cleanTarget.length === 0) {
    return {
      similarity: 100,
      passed: true,
      targetTotalChars: 0,
      matchedCharCount: 0,
      lineDiffs: [],
      errorCount: 0,
    };
  }

  // 计算公共子序列
  const lcs = computeLCS(cleanInput, cleanTarget);
  const matchedCharCount = lcs.length;
  const similarity = Math.min(100, Math.round((matchedCharCount / cleanTarget.length) * 100));
  const passed = similarity >= 85;

  // 构建逐行字符对照表（供界面标红标绿）
  // 采用贪心游标比对 LCS
  let lcsCursor = 0;
  const lineDiffs: PoetryDiffItem[][] = [];
  let errorCount = 0;

  for (const line of targetContent) {
    const currentLineDiff: PoetryDiffItem[] = [];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      const isPunct = PUNCTUATION_CLEAN_REGEX.test(ch);

      if (isPunct) {
        currentLineDiff.push({
          char: ch,
          isPunctuation: true,
          matched: true,
        });
      } else {
        if (lcsCursor < lcs.length && ch === lcs[lcsCursor]) {
          currentLineDiff.push({
            char: ch,
            isPunctuation: false,
            matched: true,
          });
          lcsCursor++;
        } else {
          currentLineDiff.push({
            char: ch,
            isPunctuation: false,
            matched: false,
          });
          errorCount++;
        }
      }
    }
    lineDiffs.push(currentLineDiff);
  }

  return {
    similarity,
    passed,
    targetTotalChars: cleanTarget.length,
    matchedCharCount,
    lineDiffs,
    errorCount,
  };
}

/**
 * 检查当前浏览器环境是否原生支持 Web Speech API (语音识别)
 */
export function isWebSpeechSupported(): boolean {
  return typeof window !== 'undefined' && Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

/**
 * 创建语音识别实例包装器
 */
export function createSpeechRecognizer(
  onTranscriptUpdate: (text: string, isFinal: boolean) => void,
  onError: (errMsg: string) => void,
  onEnd: () => void
): { start: () => void; stop: () => void; isSupported: boolean } {
  const SpeechRec = typeof window !== 'undefined'
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;

  if (!SpeechRec) {
    return {
      start: () => onError('当前浏览器环境不支持语音识别，请使用最新 Chrome / Edge 或使用打字默写模式'),
      stop: () => {},
      isSupported: false,
    };
  }

  let recognition: any = null;
  let isStoppedManually = false;

  try {
    recognition = new SpeechRec();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let accumulatedText = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          accumulatedText += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }
      onTranscriptUpdate(accumulatedText + interim, false);
    };

    recognition.onerror = (event: any) => {
      console.warn('[SpeechRecognizer] error:', event.error);
      if (event.error === 'not-allowed') {
        onError('麦克风权限已被拒绝，请在浏览器地址栏允许麦克风权限');
      } else if (event.error === 'network') {
        onError('网络波动导致语音识别中断，请重试');
      } else {
        onError(`语音识别提示: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (!isStoppedManually) {
        // 部分浏览器会在暂停说话时自动触发 onend，如果未手动停止可尝试保持
        onEnd();
      } else {
        onEnd();
      }
    };
  } catch (err: any) {
    console.warn('[SpeechRecognizer] init error:', err);
  }

  return {
    start: () => {
      isStoppedManually = false;
      try {
        recognition?.start();
      } catch (e) {
        console.warn('Recognition start error or already started', e);
      }
    },
    stop: () => {
      isStoppedManually = true;
      try {
        recognition?.stop();
      } catch (e) {
        console.warn('Recognition stop error', e);
      }
    },
    isSupported: true,
  };
}
