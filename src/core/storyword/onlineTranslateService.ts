export interface DictEntry {
  pos: string;
  terms: string[];
  reverseTranslations?: string[];
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  phonetic?: string;
  isSingleWord: boolean;
  dictEntries: DictEntry[];
  suggestedEnglishWord?: string;
}

// 内存 LRU 高速缓存，避免重复请求
const translationCache = new Map<string, TranslationResult>();

/**
 * 在线翻译与词典解析服务 (无需 API Key，直连全球高可用翻译通道)
 * 支持中译英、英译中、长难句翻译及词典释义
 */
export async function onlineTranslate(
  text: string,
  targetLanguage?: 'en' | 'zh-CN'
): Promise<TranslationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      originalText: '',
      translatedText: '',
      sourceLang: 'auto',
      targetLang: targetLanguage || 'en',
      isSingleWord: false,
      dictEntries: [],
    };
  }

  // 1. 自动判断源语言与目标语言
  const hasChinese = /[\u4e00-\u9fa5]/.test(trimmed);
  const sourceLang = hasChinese ? 'zh-CN' : 'en';
  const targetLang = targetLanguage || (hasChinese ? 'en' : 'zh-CN');

  const cacheKey = `${sourceLang}->${targetLang}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 2. 调用免 Key 开放翻译/词典 API
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(
    trimmed
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`翻译请求失败：HTTP ${res.status}`);
    }

    const json = await res.json();

    // 拼接整句或整段翻译
    const sentences = json.sentences || [];
    const translatedText = sentences
      .map((s: any) => s.trans || '')
      .join('')
      .trim();

    // 解析词典词条
    const dictEntries: DictEntry[] = [];
    if (Array.isArray(json.dict)) {
      for (const d of json.dict) {
        if (!d || !d.pos) continue;
        dictEntries.push({
          pos: d.pos,
          terms: Array.isArray(d.terms) ? d.terms.slice(0, 8) : [],
          reverseTranslations: Array.isArray(d.entry)
            ? d.entry.slice(0, 5).map((e: any) => e.word)
            : [],
        });
      }
    }

    // 判断是否为单词/短语
    const isSingleWord = trimmed.length <= 15 && !trimmed.includes('\n') && !/[，。！？,.!?]/.test(trimmed);

    // 提取最适合用于替换融入剧情的英文单词
    let suggestedEnglishWord: string | undefined;
    if (hasChinese && isSingleWord) {
      if (dictEntries.length > 0 && dictEntries[0].terms.length > 0) {
        // 取词典第一位高频同义词（优先选用英文字符单短语）
        suggestedEnglishWord = dictEntries[0].terms[0];
      } else {
        suggestedEnglishWord = translatedText.toLowerCase();
      }
    } else if (!hasChinese && isSingleWord) {
      suggestedEnglishWord = trimmed.toLowerCase();
    }

    const result: TranslationResult = {
      originalText: trimmed,
      translatedText,
      sourceLang,
      targetLang,
      isSingleWord,
      dictEntries,
      suggestedEnglishWord,
    };

    // 存入缓存
    if (translationCache.size > 200) {
      const firstKey = translationCache.keys().next().value;
      if (firstKey) translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, result);

    return result;
  } catch (error: any) {
    // 降级兜底：如果外部因网络波动失败，返回友好提示
    console.error('[OnlineTranslate] Error:', error);
    return {
      originalText: trimmed,
      translatedText: '【网络翻译波动，请稍后再试】',
      sourceLang,
      targetLang,
      isSingleWord: false,
      dictEntries: [],
    };
  }
}
