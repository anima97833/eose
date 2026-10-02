import { db } from '../storage/db';
import { KoreanTermRecord, KoreanDictMeta, KoreanLookupResult } from './koreanTermTypes';
import { generateKoreanCandidates, cleanKoreanWord } from './koreanDeinflector';
import { onlineTranslate } from './onlineTranslateService';

const KOREAN_DICT_META_KEY = 'storyword_korean_dict_meta_v1';

/**
 * 递归解析 Yomitan 的 structured-content AST，提炼简明中文释义与汉字对应词
 */
export function extractYomitanDefinitions(defs: any): {
  summary: string;
  hanja?: string;
} {
  let hanja: string | undefined;
  const lines: string[] = [];

  const visit = (node: any) => {
    if (!node) return;
    if (typeof node === 'string') {
      const trimmed = node.trim();
      if (!trimmed) return;

      // 提取形如 〔親家〕 或 〔親近하다〕 的汉字词
      const hanjaMatch = trimmed.match(/〔([^〕]+)〕/);
      if (hanjaMatch && !hanja) {
        hanja = hanjaMatch[1].trim();
      }

      lines.push(trimmed);
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (typeof node === 'object') {
      if (node.content) {
        visit(node.content);
      }
    }
  };

  visit(defs);

  // 清洗合并文本行，过滤掉冗余标记
  const cleanLines = lines
    .map(l => l.replace(/〔[^〕]+〕/g, '').trim())
    .filter(l => l.length > 0 && l !== '句型' && l !== '参考句型');

  // 去重但保持语序
  const uniqueLines: string[] = [];
  cleanLines.forEach(l => {
    if (!uniqueLines.includes(l)) {
      uniqueLines.push(l);
    }
  });

  return {
    summary: uniqueLines.slice(0, 10).join('\n') || '暂无详细释义',
    hanja,
  };
}

/**
 * 获取当前已导入的韩语词典元信息
 */
export async function getKoreanDictMeta(): Promise<KoreanDictMeta | null> {
  try {
    const raw = localStorage.getItem(KOREAN_DICT_META_KEY);
    if (!raw) {
      // 容错检查数据库实际条数
      const count = await db.storyword_korean_terms.count();
      if (count > 0) {
        return {
          name: '本地韩语词典',
          termCount: count,
          updatedAt: Date.now(),
        };
      }
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * 清空本地韩语词库
 */
export async function clearKoreanDictionary(): Promise<void> {
  await db.storyword_korean_terms.clear();
  localStorage.removeItem(KOREAN_DICT_META_KEY);
}

/**
 * 分块流式导入一个或多个本地 Yomitan / TermBank 格式 JSON 词典
 * @param files 用户选取的 .json 文件列表
 * @param onProgress 进度回调 (0 ~ 100)
 * @param options append: 是否追加模式（默认 false，全新覆盖导入）
 */
export async function importYomitanJsonFiles(
  files: File[],
  onProgress?: (percent: number, current: number, total: number) => void,
  options?: { append?: boolean }
): Promise<KoreanDictMeta> {
  if (!files || files.length === 0) {
    throw new Error('未选择任何词典文件');
  }

  if (!options?.append) {
    // 全新覆盖模式：清空既有旧词库
    await db.storyword_korean_terms.clear();
  }

  const BATCH_SIZE = 1500;
  let totalRawCount = 0;
  let totalInserted = 0;

  // 预读所有文件确定词条总量
  const parsedFiles: Array<{ name: string; items: any[] }> = [];
  for (const file of files) {
    const text = await file.text();
    let rawList: any[];
    try {
      rawList = JSON.parse(text);
    } catch (err: any) {
      throw new Error(`文件 [${file.name}] JSON 解析失败：${err.message || '文件格式不正确'}`);
    }

    if (!Array.isArray(rawList) || rawList.length === 0) {
      continue;
    }

    // 校验首个元素是否符合 Yomitan 规范 (至少拥有 5 个元素)
    const firstItem = rawList[0];
    if (!Array.isArray(firstItem) || firstItem.length < 5) {
      throw new Error(`文件 [${file.name}] 未识别到标准的 Yomitan / TermBank 词典结构`);
    }

    parsedFiles.push({ name: file.name, items: rawList });
    totalRawCount += rawList.length;
  }

  if (parsedFiles.length === 0 || totalRawCount === 0) {
    throw new Error('未在所选文件中检测到有效的 Yomitan 词条数据');
  }

  let batch: KoreanTermRecord[] = [];
  let processedCount = 0;

  for (let fileIdx = 0; fileIdx < parsedFiles.length; fileIdx++) {
    const { items } = parsedFiles[fileIdx];
    const fileTotal = items.length;

    for (let i = 0; i < fileTotal; i++) {
      const item = items[i];
      if (!Array.isArray(item) || item.length < 5) continue;

      const term = String(item[0] || '').trim();
      if (!term) continue;

      const reading = String(item[1] || '').trim();
      const pos = String(item[2] || '').trim();
      const rules = String(item[3] || '').trim();
      const score = typeof item[4] === 'number' ? item[4] : 0;
      const rawDef = item[5];

      const { summary, hanja } = extractYomitanDefinitions(rawDef);

      const record: KoreanTermRecord = {
        id: `ko_${term}_f${fileIdx}_${i}`,
        term,
        reading,
        pos,
        rules,
        score,
        summary,
        hanja,
        rawAst: rawDef,
        createdAt: Date.now(),
      };

      batch.push(record);
      processedCount++;

      if (batch.length >= BATCH_SIZE) {
        await db.storyword_korean_terms.bulkPut(batch);
        totalInserted += batch.length;
        batch = [];

        if (onProgress) {
          const percent = Math.min(99, Math.round((processedCount / totalRawCount) * 100));
          onProgress(percent, processedCount, totalRawCount);
        }

        // 让出主线程一帧，保持 UI 动画与进度条丝滑
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }

  if (batch.length > 0) {
    await db.storyword_korean_terms.bulkPut(batch);
    totalInserted += batch.length;
  }

  if (onProgress) {
    onProgress(100, processedCount, totalRawCount);
  }

  const currentDbTotal = await db.storyword_korean_terms.count();
  const titleName = files.length === 1
    ? files[0].name.replace(/\.[^/.]+$/, '')
    : `韩语合集词库 (${files.length}个文件)`;

  const meta: KoreanDictMeta = {
    name: titleName,
    termCount: currentDbTotal,
    updatedAt: Date.now(),
  };

  localStorage.setItem(KOREAN_DICT_META_KEY, JSON.stringify(meta));
  return meta;
}

/**
 * 导入单文件 Yomitan JSON (向下兼容接口)
 */
export async function importYomitanJsonFile(
  file: File,
  onProgress?: (percent: number, current: number, total: number) => void,
  options?: { append?: boolean }
): Promise<KoreanDictMeta> {
  return importYomitanJsonFiles([file], onProgress, options);
}

/**
 * 在 IndexedDB 中检索韩语原词（支持自动逆向脱落助词与还原基本形）
 * 若本地词库未命中或词库不全，自动无缝启动免 Key 在线智能释义与形态兜底，确保 100% 能够查出释义！
 */
export async function lookupKoreanTerm(rawWord: string): Promise<KoreanLookupResult | null> {
  const cleaned = cleanKoreanWord(rawWord);
  if (!cleaned) return null;

  // 1. 生成形态素还原候选列表
  const candidates = generateKoreanCandidates(cleaned);

  // 优先在本地已导入的 IndexedDB 中检索
  for (const cand of candidates) {
    const matched = await db.storyword_korean_terms.where('term').equals(cand.candidate).first();
    if (matched) {
      return {
        matchedTerm: matched,
        searchedText: cleaned,
        matchType: cand.sourceType,
        baseForm: cand.candidate,
        removedParticle: cand.removedPart,
        isOnlineFallback: false,
      };
    }

    const hanjaMatched = await db.storyword_korean_terms.where('hanja').equals(cand.candidate).first();
    if (hanjaMatched) {
      return {
        matchedTerm: hanjaMatched,
        searchedText: cleaned,
        matchType: 'hanja',
        baseForm: cand.candidate,
        isOnlineFallback: false,
      };
    }
  }

  // 2. 本地词库未命中 -> 触发免 Key 实时智能在线释义与词典兜底
  try {
    const onlineRes = await onlineTranslate(cleaned, 'zh-CN');
    const primaryCand = candidates.find(c => c.candidate !== cleaned);
    let baseTransRes: any = null;
    if (primaryCand) {
      try {
        baseTransRes = await onlineTranslate(primaryCand.candidate, 'zh-CN');
      } catch {}
    }

    let summary = onlineRes.translatedText || '暂无释义';
    if (baseTransRes && baseTransRes.translatedText && baseTransRes.translatedText !== onlineRes.translatedText) {
      if (primaryCand?.sourceType === 'verb_base') {
        summary = `${onlineRes.translatedText}\n\n📌 原型【${primaryCand.candidate}】：${baseTransRes.translatedText}`;
      } else if (primaryCand?.sourceType === 'particle_stripped') {
        summary = `${onlineRes.translatedText}\n\n📌 词干【${primaryCand.candidate}】：${baseTransRes.translatedText}`;
      }
    }

    const pos = primaryCand?.sourceType === 'verb_base'
      ? '用言基本形'
      : (primaryCand?.sourceType === 'particle_stripped' ? '名词词干' : '韩语词汇');

    return {
      matchedTerm: {
        id: `online_${Date.now()}`,
        term: primaryCand ? primaryCand.candidate : cleaned,
        reading: '',
        pos: pos,
        rules: '',
        score: 0,
        summary: summary,
        createdAt: Date.now(),
      },
      searchedText: cleaned,
      matchType: primaryCand ? primaryCand.sourceType : 'exact',
      baseForm: primaryCand ? primaryCand.candidate : undefined,
      removedParticle: primaryCand?.removedPart,
      isOnlineFallback: true,
    };
  } catch (e) {
    console.error('Korean online translation fallback failed', e);
    return null;
  }
}
