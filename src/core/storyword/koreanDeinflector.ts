/**
 * 韩语轻量词形还原器 (Korean Deinflector & Particle Stripper)
 * 专为韩文小说原著查词打造：
 * 1. 清洗中韩标点符号；
 * 2. 剥离名词复合格助词与添意助词（조사）；
 * 3. 逆向还原用言（动词、形容词）定语冠形词尾、时态过去式及连词语尾至基本形（원형 -다 / -하다）；
 * 4. 兼容 ㅂ 不规则形容词（如 아름다운 -> 아름답다, 어두운 -> 어둡다）。
 */

export interface DeinflectCandidate {
  candidate: string;
  sourceType: 'exact' | 'particle_stripped' | 'verb_base';
  removedPart?: string;
}

// 常见助词表 (从长到短排列，确保长复合助词优先剥离)
const KOREAN_PARTICLES: string[] = [
  // 3 音节复合助词
  '에서는', '에서도', '에게서', '한테서', '에게는', '에게도', '보다는', '처럼은',
  '마저도', '조차도', '부터는', '까지는', '으로서', '으로써', '이라고', '이라며', '이라는',
  // 2 音节常见助词
  '에서', '에게', '한테', '으로', '부터', '까지', '처럼', '보다', '마저', '조차',
  '이라', '이다', '이나', '이란', '이며', '하고', '이랑',
  // 1 音节单助词
  '은', '는', '이', '가', '을', '를', '의', '에', '로', '와', '과', '도', '만', '랑'
];

// 用言 -하다 派生变形后缀表 (如 친근한 -> 친근하다, 친근해서 -> 친근하다)
const HADA_ENDINGS: Array<{ ending: string; replacement: string }> = [
  { ending: '했습니다', replacement: '하다' },
  { ending: '했었다', replacement: '하다' },
  { ending: '했다', replacement: '하다' },
  { ending: '했을', replacement: '하다' },
  { ending: '했던', replacement: '하다' },
  { ending: '해서', replacement: '하다' },
  { ending: '하면', replacement: '하다' },
  { ending: '하니', replacement: '하다' },
  { ending: '하자', replacement: '하다' },
  { ending: '하지', replacement: '하다' },
  { ending: '하고', replacement: '하다' },
  { ending: '하며', replacement: '하다' },
  { ending: '하게', replacement: '하다' },
  { ending: '한다', replacement: '하다' },
  { ending: '한다면', replacement: '하다' },
  { ending: '한', replacement: '하다' }, // 冠形词定语形
  { ending: '할', replacement: '하다' }, // 将来定语形
  { ending: '해', replacement: '하다' },
  { ending: '해요', replacement: '하다' },
  { ending: '합니다', replacement: '하다' },
];

/**
 * 清洗韩文字词（剔除首尾标点、引号、括号等）
 */
export function cleanKoreanWord(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^[^a-zA-Z0-9\uAC00-\uD7A3\u4E00-\u9FA5]+/, '')
    .replace(/[^a-zA-Z0-9\uAC00-\uD7A3\u4E00-\u9FA5]+$/, '')
    .trim();
}

/**
 * 判断文本是否包含可读韩文字符 (Hangul Syllables)
 */
export function hasHangul(text: string): boolean {
  return /[\uAC00-\uD7A3]/.test(text);
}

/**
 * 为输入的韩文原词生成候选检索词列表
 * 按优先级排序：
 * 1. 原词精确匹配 (exact)
 * 2. 剥离助词候选 (particle_stripped)
 * 3. 用言基本形还原候选 (verb_base)
 */
export function generateKoreanCandidates(rawInput: string): DeinflectCandidate[] {
  const cleaned = cleanKoreanWord(rawInput);
  if (!cleaned) return [];

  const candidates: DeinflectCandidate[] = [];
  const seen = new Set<string>();

  const add = (candidate: string, sourceType: DeinflectCandidate['sourceType'], removedPart?: string) => {
    const trimmed = candidate.trim();
    if (trimmed && trimmed.length >= 1 && !seen.has(trimmed)) {
      seen.add(trimmed);
      candidates.push({ candidate: trimmed, sourceType, removedPart });
    }
  };

  // 1. 原词完全匹配
  add(cleaned, 'exact');

  // 2. 用言 -하다 规则变化逆向还原
  for (const { ending, replacement } of HADA_ENDINGS) {
    if (cleaned.length > ending.length && cleaned.endsWith(ending)) {
      const stem = cleaned.slice(0, -ending.length);
      add(stem + replacement, 'verb_base', ending);
    }
  }

  // 3. 常见一般动词/形容词基本形还原 (-았/었다, -아서/어서, -습니다, -ㄴ다)
  if (cleaned.endsWith('습니다') && cleaned.length >= 3) {
    add(cleaned.slice(0, -3) + '다', 'verb_base', '습니다');
  } else if (cleaned.endsWith('ㅂ니다') && cleaned.length >= 3) {
    add(cleaned.slice(0, -3) + '다', 'verb_base', 'ㅂ니다');
  } else if (cleaned.endsWith('었다') && cleaned.length >= 3) {
    add(cleaned.slice(0, -2) + '다', 'verb_base', '었다');
  } else if (cleaned.endsWith('았다') && cleaned.length >= 3) {
    add(cleaned.slice(0, -2) + '다', 'verb_base', '았다');
  } else if (cleaned.endsWith('어서') && cleaned.length >= 3) {
    add(cleaned.slice(0, -2) + '다', 'verb_base', '어서');
  } else if (cleaned.endsWith('아서') && cleaned.length >= 3) {
    add(cleaned.slice(0, -2) + '다', 'verb_base', '아서');
  } else if (cleaned.endsWith('는다') && cleaned.length >= 3) {
    add(cleaned.slice(0, -2) + '다', 'verb_base', '는다');
  } else if (cleaned.endsWith('은') && cleaned.length >= 2) {
    add(cleaned.slice(0, -1) + '다', 'verb_base', '은');
  } else if (cleaned.endsWith('는') && cleaned.length >= 2) {
    add(cleaned.slice(0, -1) + '다', 'verb_base', '는');
  } else if (cleaned.endsWith('을') && cleaned.length >= 2) {
    add(cleaned.slice(0, -1) + '다', 'verb_base', '을');
  }

  // 4. ㅂ 不规则形容词还原 (如 어두운 -> 어둡다, 차가운 -> 차갑다, 아름다운 -> 아름답다)
  if (cleaned.endsWith('운') && cleaned.length >= 2) {
    add(cleaned.slice(0, -1) + 'ㅂ다', 'verb_base', '운');
  }

  // 5. 助词剥离候选 (Particle Stripping)
  for (const particle of KOREAN_PARTICLES) {
    // 保证剥离后剩余词干至少 1 个字符
    if (cleaned.length > particle.length && cleaned.endsWith(particle)) {
      const stem = cleaned.slice(0, -particle.length);
      add(stem, 'particle_stripped', particle);

      // 对剥离助词后的词干再尝试二次探测 -하다 (例如 친근하기에 -> 친근하 + 기에 -> 친근하다)
      if (stem.endsWith('하기')) {
        add(stem.slice(0, -2) + '하다', 'verb_base');
      }
    }
  }

  return candidates;
}
