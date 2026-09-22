import { SavedPoemRecord, BlankQuestion, PoetryExamQuestion, KejuRank } from './poetryTypes';

// 常用诗词汉字备选池（用于干扰项生成）
const CLASSICAL_CHARACTERS = [
  '月', '春', '花', '山', '水', '风', '云', '夜', '江', '天',
  '人', '舟', '寒', '客', '归', '愁', '影', '香', '声', '霜',
  '雪', '酒', '松', '竹', '梅', '柳', '梦', '心', '情', '思',
  '飞', '落', '照', '寻', '听', '望', '见', '知', '逢', '别'
];

const PUNCTUATION_REGEX = /[，。？！；、：“”‘’《》（）\s]/;

/**
 * 依据诗词正文自动生成科举挖词考核题目
 */
export function generateExamQuestion(poem: SavedPoemRecord): PoetryExamQuestion {
  const blanks: BlankQuestion[] = [];
  const allPoemChars: string[] = [];

  // 收集全诗所有的有效汉字
  for (const line of poem.content) {
    for (const ch of line) {
      if (!PUNCTUATION_REGEX.test(ch)) {
        allPoemChars.push(ch);
      }
    }
  }

  poem.content.forEach((line, lineIndex) => {
    // 找出本行所有可挖空的汉字索引
    const candidateIndices: number[] = [];
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (!PUNCTUATION_REGEX.test(ch)) {
        candidateIndices.push(i);
      }
    }

    if (candidateIndices.length === 0) return;

    // 智能选取挖空位置：五言选第 2、4 或 5 字；七言选第 3、5 或 7 字；词则自适应随机挑选 1 个关键字
    let chosenIndex = candidateIndices[candidateIndices.length - 1];
    if (candidateIndices.length === 5) {
      // 五言绝句：优先挖第 3 或第 5 字（韵脚或诗眼）
      chosenIndex = lineIndex % 2 === 0 ? candidateIndices[2] : candidateIndices[4];
    } else if (candidateIndices.length === 7) {
      // 七言绝句：优先挖第 4 或第 7 字
      chosenIndex = lineIndex % 2 === 0 ? candidateIndices[3] : candidateIndices[6];
    } else {
      // 随机选一个非首字的汉字
      const inner = candidateIndices.slice(1);
      chosenIndex = inner.length > 0 ? inner[Math.floor(Math.random() * inner.length)] : candidateIndices[0];
    }

    const correctChar = line[chosenIndex];

    // 生成 3 个不重复的干扰项
    const distractors = new Set<string>();
    
    // 优先从全诗其他字抽取
    const shuffledPoemChars = [...allPoemChars].sort(() => 0.5 - Math.random());
    for (const ch of shuffledPoemChars) {
      if (ch !== correctChar && !distractors.has(ch)) {
        distractors.add(ch);
      }
      if (distractors.size >= 3) break;
    }

    // 若不够，从经典诗词备选池填充
    if (distractors.size < 3) {
      const shuffledClassical = [...CLASSICAL_CHARACTERS].sort(() => 0.5 - Math.random());
      for (const ch of shuffledClassical) {
        if (ch !== correctChar && !distractors.has(ch)) {
          distractors.add(ch);
        }
        if (distractors.size >= 3) break;
      }
    }

    // 组合正确答案与干扰项并乱序
    const options = [correctChar, ...Array.from(distractors).slice(0, 3)].sort(
      () => 0.5 - Math.random()
    );

    blanks.push({
      lineIndex,
      charIndex: chosenIndex,
      correctChar,
      options,
    });
  });

  return {
    poem,
    blanks,
    totalBlanks: blanks.length,
  };
}

/**
 * 根据总通关背诵数计算科举功名头衔
 */
export function calculateKejuRank(totalPasses: number): KejuRank {
  if (totalPasses >= 20) return '状元';
  if (totalPasses >= 15) return '榜眼';
  if (totalPasses >= 10) return '探花';
  if (totalPasses >= 6) return '贡士';
  if (totalPasses >= 3) return '举人';
  if (totalPasses >= 1) return '秀才';
  return '童生';
}

/**
 * 科举头衔对应的官服朱批徽章颜色与称号说明
 */
export function getRankBadgeInfo(rank: KejuRank): { label: string; color: string; bg: string; border: string } {
  switch (rank) {
    case '状元':
      return { label: '金榜状元', color: '#b91c1c', bg: '#fef2f2', border: '#f87171' };
    case '榜眼':
      return { label: '御赐榜眼', color: '#c2410c', bg: '#fff7ed', border: '#fb923c' };
    case '探花':
      return { label: '琼林探花', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' };
    case '贡士':
      return { label: '天子门生', color: '#047857', bg: '#ecfdf5', border: '#6ee7b7' };
    case '举人':
      return { label: '乡试解元', color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' };
    case '秀才':
      return { label: '泮池诸生', color: '#6b21a8', bg: '#faf5ff', border: '#c084fc' };
    case '童生':
    default:
      return { label: '书院学童', color: '#78350f', bg: '#fef3c7', border: '#fde68a' };
  }
}
