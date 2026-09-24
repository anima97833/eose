import { EnglishWord } from './storyWordTypes';
import { onlineTranslate } from './onlineTranslateService';

export type LexiconFormatType =
  | 'tsv'
  | 'csv'
  | 'inline'
  | 'pure_english'
  | 'json'
  | 'empty';

export interface ParsedLexiconPreview {
  format: LexiconFormatType;
  formatLabel: string;
  readyWords: EnglishWord[];
  pendingPureEnglish: string[];
  totalCount: number;
}

/**
 * 清洗英文单词
 */
function cleanWord(str: string): string {
  return str
    .replace(/^["'`“‘]+|["'`”’]+$/g, '') // 去除外层引号
    .replace(/^\d+[\.、\)\s]+/, '')      // 去除开头的行序号如 "1. " "2、" "(1) "
    .trim();
}

/**
 * 从中文释义中智能提炼高频网文触发词 (Triggers)
 * 例如 "抛弃；舍弃；放弃" -> ["抛弃", "舍弃", "放弃"]
 * 例如 "n. 阴谋，合谋" -> ["阴谋", "合谋"]
 * 智能提取词干（如 "一致的" 额外兼顾 "一致"）以大幅提升网文替换命中率
 */
export function extractTriggersFromTranslation(rawTrans: string): string[] {
  let cleaned = rawTrans
    // 去除常见的词性前缀如 n. v. adj. adv. vt. vi. prep.
    .replace(/^(n|v|adj|adv|vt|vi|prep|conj|pron|art|num|int)\.?\s*/gi, '')
    // 去除中括号或括号内的说明文字
    .replace(/[\(\（\[【].*?[\)\）\]】]/g, '')
    .trim();

  // 按常见中英文分隔符切分
  const parts = cleaned
    .split(/[\s,，;；、\/\|\t\n]+/)
    .map(p => p.trim())
    .filter(p => p.length >= 1 && p.length <= 12 && !/^[a-zA-Z0-9_\-]+$/.test(p));

  // 去重且保留顺序
  const uniqueTriggers = new Set<string>();
  parts.forEach(p => {
    uniqueTriggers.add(p);
    // 词干提取：如 "一致的" -> "一致", "稳定地" -> "稳定"
    if (p.endsWith('的') && p.length > 2) {
      uniqueTriggers.add(p.slice(0, -1));
    }
    if (p.endsWith('地') && p.length > 2) {
      uniqueTriggers.add(p.slice(0, -1));
    }
  });

  const res = Array.from(uniqueTriggers);
  if (res.length === 0 && cleaned) {
    return [cleaned.slice(0, 8)];
  }
  return res.slice(0, 8);
}

/**
 * 递归/全景解析单个词典 JSON 项
 * 支持：
 * 1. 扇贝 / 有道 / 百词斩 / ECDICT 考级乱序词库规范 (如 CET6luan_1.json):
 *    item.headWord, item.content.word.content.trans, item.content.word.content.syno, item.content.word.content.sentence
 * 2. 通用词汇 JSON:
 *    item.word, item.translation / item.trans, item.phonetic, item.example
 */
export function parseDictionaryJsonObject(item: any): EnglishWord | null {
  if (!item || typeof item !== 'object') return null;

  // 1. 提取单词
  const rawWord =
    item.headWord ||
    item.word ||
    item.vocab ||
    item.en ||
    item.content?.word?.wordHead ||
    item.content?.wordHead ||
    item.content?.headWord ||
    '';
  const word = cleanWord(String(rawWord || ''));
  if (!word || !/^[a-zA-Z\s\-']+$/.test(word)) return null;

  // 2. 深入解析 content 结构
  const wordContent =
    item.content?.word?.content ||
    item.content?.word ||
    item.content ||
    {};

  // 音标
  let phonetic =
    item.phonetic ||
    wordContent.ukphone ||
    wordContent.usphone ||
    wordContent.phone ||
    '';
  if (phonetic && !phonetic.startsWith('/')) {
    phonetic = `/${phonetic}/`;
  }

  // 词性与释义
  let translation = '';
  let partOfSpeech = item.pos || item.partOfSpeech || '';

  if (Array.isArray(wordContent.trans)) {
    const list = wordContent.trans
      .map((t: any) => {
        const p = t.pos ? `${t.pos}. ` : '';
        const c = t.tranCn || t.trans || t.meaning || '';
        if (!partOfSpeech && t.pos) partOfSpeech = t.pos;
        return `${p}${c}`.trim();
      })
      .filter(Boolean);
    translation = list.join('；');
  } else if (typeof wordContent.trans === 'string') {
    translation = wordContent.trans;
  } else if (item.translation || item.trans || item.zh || item.meaning) {
    translation = item.translation || item.trans || item.zh || item.meaning;
  }

  // 例句 (sentences)
  let example = item.example || '';
  if (
    !example &&
    Array.isArray(wordContent.sentence?.sentences) &&
    wordContent.sentence.sentences.length > 0
  ) {
    const s = wordContent.sentence.sentences[0];
    if (s.sContent) {
      example = s.sCn ? `${s.sContent} (${s.sCn})` : s.sContent;
    }
  }

  // 触发词 (Triggers)：结合常规释义与 syno (同近义词)
  const triggerSources: string[] = [translation];
  if (Array.isArray(wordContent.syno?.synos)) {
    wordContent.syno.synos.forEach((sy: any) => {
      if (sy.tran) triggerSources.push(sy.tran);
    });
  }
  const combinedTransForTriggers = triggerSources.join('；');
  const triggers = extractTriggersFromTranslation(combinedTransForTriggers || translation || word);

  // 词库级别识别
  let level: any = 'cet4';
  const bookIdStr = String(item.bookId || item.level || '').toLowerCase();
  if (bookIdStr.includes('cet6')) level = 'cet6';
  else if (bookIdStr.includes('kaoyan') || bookIdStr.includes('ky')) level = 'kaoyan';
  else if (bookIdStr.includes('ielts') || bookIdStr.includes('ya_si')) level = 'ielts';
  else if (bookIdStr.includes('cet4')) level = 'cet4';

  return {
    word,
    phonetic,
    translation: translation || word,
    partOfSpeech: partOfSpeech || 'word',
    level,
    triggers,
    example,
  };
}

/**
 * 智能嗅探解析用户粘贴或导入的词库文本
 * 支持：
 * 1. 词典/考级 JSONL / NDJSON 格式 (如扇贝/有道/百词斩 CET6luan_1.json)
 * 2. 标准 JSON 数组或对象映射
 * 3. Anki / 欧路词典 Tab 分隔 (TSV)
 * 4. 墨墨 / 扇贝 / 百词斩 CSV 逗号分隔
 * 5. 常见中英混排行 (空格、破折号、冒号)
 * 6. 纯英文单列换行列表 (自动调用技术翻译补齐 triggers)
 */
export function sniffAndParseLexiconText(rawText: string): ParsedLexiconPreview {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      format: 'empty',
      formatLabel: '空内容',
      readyWords: [],
      pendingPureEnglish: [],
      totalCount: 0,
    };
  }

  // 1. 优先尝试标准 JSON 数组格式
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr) && arr.length > 0) {
        const readyWords: EnglishWord[] = [];
        arr.forEach(item => {
          const parsed = parseDictionaryJsonObject(item);
          if (parsed) readyWords.push(parsed);
        });
        if (readyWords.length > 0) {
          return {
            format: 'json',
            formatLabel: 'JSON 结构化词库',
            readyWords,
            pendingPureEnglish: [],
            totalCount: readyWords.length,
          };
        }
      }
    } catch {
      // 继续向下尝试其他格式
    }
  }

  // 2. 尝试单个 JSON 对象 (可能包含 words / list 数组，或键值对映射)
  if (trimmed.startsWith('{') && trimmed.endsWith('}') && !trimmed.includes('\n{"')) {
    try {
      const obj = JSON.parse(trimmed);
      if (obj && typeof obj === 'object') {
        const list = Array.isArray(obj.words)
          ? obj.words
          : Array.isArray(obj.list)
          ? obj.list
          : null;
        if (list) {
          const readyWords: EnglishWord[] = [];
          list.forEach((item: any) => {
            const parsed = parseDictionaryJsonObject(item);
            if (parsed) readyWords.push(parsed);
          });
          if (readyWords.length > 0) {
            return {
              format: 'json',
              formatLabel: 'JSON 列表词库',
              readyWords,
              pendingPureEnglish: [],
              totalCount: readyWords.length,
            };
          }
        } else if (!obj.headWord && !obj.word) {
          // 键值对映射如 {"apple": "苹果", "banana": "香蕉"}
          const entries = Object.entries(obj);
          if (entries.length > 0 && typeof entries[0][1] === 'string') {
            const readyWords: EnglishWord[] = [];
            entries.forEach(([k, v]) => {
              const w = cleanWord(k);
              if (w && /^[a-zA-Z\s\-']+$/.test(w)) {
                readyWords.push({
                  word: w,
                  phonetic: '',
                  translation: String(v),
                  partOfSpeech: 'word',
                  level: 'cet4',
                  triggers: extractTriggersFromTranslation(String(v)),
                });
              }
            });
            if (readyWords.length > 0) {
              return {
                format: 'json',
                formatLabel: 'JSON 键值对词库',
                readyWords,
                pendingPureEnglish: [],
                totalCount: readyWords.length,
              };
            }
          }
        }
      }
    } catch {
      // 继续向下解析
    }
  }

  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) {
    return {
      format: 'empty',
      formatLabel: '空内容',
      readyWords: [],
      pendingPureEnglish: [],
      totalCount: 0,
    };
  }

  // 3. 优先嗅探 JSON Lines (NDJSON) 格式 (如 CET6luan_1.json，每行一个完整词汇 JSON 对象)
  if (lines[0].startsWith('{') && lines[0].endsWith('}')) {
    let isJsonLines = false;
    try {
      const testItem = JSON.parse(lines[0]);
      if (testItem && typeof testItem === 'object') {
        isJsonLines = true;
      }
    } catch {
      isJsonLines = false;
    }

    if (isJsonLines) {
      const readyWords: EnglishWord[] = [];
      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          const parsed = parseDictionaryJsonObject(item);
          if (parsed) {
            readyWords.push(parsed);
          }
        } catch {
          // 容错跳过个别畸变行
        }
      }
      if (readyWords.length > 0) {
        return {
          format: 'json',
          formatLabel: '考级标准词典格式 (扇贝/有道/百词斩 JSONL)',
          readyWords,
          pendingPureEnglish: [],
          totalCount: readyWords.length,
        };
      }
    }
  }

  // 统计分隔符特征 (统计前 20 行)
  const sampleLines = lines.slice(0, Math.min(20, lines.length));
  let tabCount = 0;
  let commaCount = 0;
  let pureEnglishCount = 0;
  let spaceMixedCount = 0;

  sampleLines.forEach(line => {
    if (line.includes('\t')) {
      tabCount += 1;
    } else if (line.includes(',') || line.includes('，')) {
      commaCount += 1;
    } else if (/^[a-zA-Z\s\-']+$/.test(cleanWord(line))) {
      pureEnglishCount += 1;
    } else if (/^[a-zA-Z\s\-']+\s+[\u4e00-\u9fa5]/.test(cleanWord(line))) {
      spaceMixedCount += 1;
    }
  });

  const readyWords: EnglishWord[] = [];
  const pendingPureEnglish: string[] = [];

  // 判断主要格式
  let detectedFormat: LexiconFormatType = 'inline';
  let formatLabel = '中英混排列表 (空格/破折号)';

  if (tabCount >= sampleLines.length * 0.4) {
    detectedFormat = 'tsv';
    formatLabel = 'Anki / 欧路制表符 (TSV)';
  } else if (commaCount >= sampleLines.length * 0.4) {
    detectedFormat = 'csv';
    formatLabel = 'CSV 逗号分隔格式';
  } else if (pureEnglishCount >= sampleLines.length * 0.6) {
    detectedFormat = 'pure_english';
    formatLabel = '纯英文列表 (将自动调用技术翻译补齐释义)';
  }

  // 开始按行解析
  lines.forEach(line => {
    const cleanedLine = line.replace(/^\d+[\.、\)\s]+/, '').trim();
    if (!cleanedLine) return;

    if (detectedFormat === 'tsv') {
      const parts = cleanedLine.split('\t').map(p => p.trim());
      const w = cleanWord(parts[0]);
      if (w && /^[a-zA-Z\s\-']+$/.test(w)) {
        let phonetic = '';
        let trans = parts[1] || '';
        let pos = 'word';

        // 如果有 3 列以上 (如 word \t phonetic \t translation)
        if (parts.length >= 3) {
          if (parts[1].startsWith('/') || parts[1].startsWith('[')) {
            phonetic = parts[1];
            trans = parts[2];
          } else {
            pos = parts[1];
            trans = parts[2];
          }
        }

        readyWords.push({
          word: w,
          phonetic,
          translation: trans || w,
          partOfSpeech: pos,
          level: 'cet4',
          triggers: extractTriggersFromTranslation(trans || w),
        });
      }
    } else if (detectedFormat === 'csv') {
      const parts = cleanedLine.split(/[,，]/).map(p => cleanWord(p));
      const w = parts[0];
      if (w && /^[a-zA-Z\s\-']+$/.test(w)) {
        const trans = parts.slice(1).join('，');
        readyWords.push({
          word: w,
          phonetic: '',
          translation: trans || w,
          partOfSpeech: 'word',
          level: 'cet4',
          triggers: extractTriggersFromTranslation(trans || w),
        });
      }
    } else if (detectedFormat === 'pure_english') {
      const w = cleanWord(cleanedLine);
      if (w && /^[a-zA-Z\s\-']+$/.test(w)) {
        pendingPureEnglish.push(w);
      }
    } else {
      // 中英混排行：通过正则提取英文字符与中文字符
      // 常见：word /phonetic/ [pos] translation 或者 word - translation
      const match = cleanedLine.match(/^([a-zA-Z\s\-']+?)([\s:\-–—]+)(.*)$/);
      if (match) {
        const w = cleanWord(match[1]);
        const rest = match[3].trim();
        if (w && /^[a-zA-Z\s\-']+$/.test(w)) {
          // 尝试从 rest 中提取音标
          let phonetic = '';
          let trans = rest;
          const phoneMatch = rest.match(/(?:[\/\[])([^\/\]]+)(?:[\/\]])/);
          if (phoneMatch) {
            phonetic = `/${phoneMatch[1]}/`;
            trans = rest.replace(phoneMatch[0], '').trim();
          }

          readyWords.push({
            word: w,
            phonetic,
            translation: trans || w,
            partOfSpeech: 'word',
            level: 'cet4',
            triggers: extractTriggersFromTranslation(trans || w),
          });
        }
      } else {
        // 如果无法匹配分割，但自身是英文，进入 pending 队列
        const singleW = cleanWord(cleanedLine);
        if (singleW && /^[a-zA-Z\s\-']+$/.test(singleW)) {
          pendingPureEnglish.push(singleW);
        }
      }
    }
  });

  return {
    format: detectedFormat,
    formatLabel,
    readyWords,
    pendingPureEnglish,
    totalCount: readyWords.length + pendingPureEnglish.length,
  };
}

/**
 * 并发技术翻译补齐纯英文生词
 * 采用 4 路并发并汇报进度
 */
export async function enrichPendingWordsWithTranslation(
  words: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<EnglishWord[]> {
  const results: EnglishWord[] = [];
  const total = words.length;
  let completed = 0;

  const concurrency = 4;
  for (let i = 0; i < words.length; i += concurrency) {
    const batch = words.slice(i, i + concurrency);
    const batchPromises = batch.map(async w => {
      try {
        const res = await onlineTranslate(w, 'zh-CN');
        const trans = res.translatedText || w;
        const triggers = extractTriggersFromTranslation(trans);

        return {
          word: w,
          phonetic: res.phonetic || '',
          translation: trans,
          partOfSpeech: res.dictEntries[0]?.pos || 'word',
          level: 'cet4' as const,
          triggers: triggers.length > 0 ? triggers : [trans.slice(0, 6)],
        };
      } catch {
        return {
          word: w,
          phonetic: '',
          translation: w,
          partOfSpeech: 'word',
          level: 'cet4' as const,
          triggers: [w],
        };
      } finally {
        completed += 1;
        if (onProgress) {
          onProgress(completed, total);
        }
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
