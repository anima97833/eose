/**
 * 韩语 Yomitan 词库与原著查词核心数据类型
 */

export interface KoreanTermRecord {
  id: string; // 唯一主键
  term: string; // 检索词头（如 "친근하다", "친목", "친구", "親舊"）
  reading: string; // 读音/发音注音
  pos: string; // 词性与星级（如 "形容词 ⭐", "名词 ⭐⭐⭐"）
  rules: string; // 屈折规则标记（如 "adj", "v"）
  score: number; // 词频分数/权重
  summary: string; // 清洗提炼后的纯文本多义项释义
  hanja?: string; // 对应的汉字词（如 "親近하다"、"親家"）
  rawAst?: any; // Yomitan 原始 structured-content 语法树（供富文本展示）
  createdAt: number;
}

export interface KoreanDictMeta {
  name: string;
  termCount: number;
  updatedAt: number;
}

export interface KoreanLookupResult {
  matchedTerm: KoreanTermRecord;
  searchedText: string;
  matchType: 'exact' | 'particle_stripped' | 'verb_base' | 'hanja';
  baseForm?: string;
  removedParticle?: string;
  isOnlineFallback?: boolean;
}
