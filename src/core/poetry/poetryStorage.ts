import { db } from '../storage/db';
import { SavedPoemRecord, PoetryStats } from './poetryTypes';
import { calculateKejuRank } from './clozeEngine';

const PRESET_POEMS: SavedPoemRecord[] = [
  {
    id: 'p_jingyesi',
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    type: '五言绝句',
    content: [
      '床前明月光，',
      '疑是地上霜。',
      '举头望山月，',
      '低头思故乡。'
    ],
    status: 'learning',
    isFavorite: true,
    quizPassCount: 0,
    userNotes: '李白传世绝唱，客中对月思归之情跃然纸上。',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_shuidiaogetou',
    title: '水调歌头·明月几时有',
    author: '苏轼',
    dynasty: '宋',
    type: '宋词',
    content: [
      '明月几时有？把酒问青天。',
      '不知天上宫阙，今夕是何年。',
      '我欲乘风归去，又恐琼楼玉宇，高处不胜寒。',
      '起舞弄清影，何似在人间。',
      '转朱阁，低绮户，照无眠。',
      '不应有恨，何事长向别时圆？',
      '人有悲欢离合，月有阴晴圆缺，此事古难全。',
      '但愿人长久，千里共婵娟。'
    ],
    status: 'learning',
    isFavorite: true,
    quizPassCount: 0,
    userNotes: '千古中秋绝调，豁达脱俗的哲思与温情。',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_chunxiao',
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    type: '五言绝句',
    content: [
      '春眠不觉晓，',
      '处处闻啼鸟。',
      '夜来风雨声，',
      '花落知多少。'
    ],
    status: 'mastered',
    isFavorite: false,
    quizPassCount: 1,
    masteredAt: new Date().toISOString(),
    userNotes: '春意融融，平易浅近而韵味醇厚。',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p_zaofabaidicheng',
    title: '早发白帝城',
    author: '李白',
    dynasty: '唐',
    type: '七言绝句',
    content: [
      '朝辞白帝彩云间，',
      '千里江陵一日还。',
      '两岸猿声啼不住，',
      '轻舟已过万重山。'
    ],
    status: 'learning',
    isFavorite: false,
    quizPassCount: 0,
    userNotes: '快舟下峡，豪气干云，历经险阻重见天地之感。',
    createdAt: new Date().toISOString(),
  }
];

/**
 * 加载所有收录在本地的诗词，首次为空时自动注入经典预置诗
 */
export async function loadAllSavedPoems(): Promise<SavedPoemRecord[]> {
  try {
    const list = await db.poems.toArray();
    if (list.length === 0) {
      await db.poems.bulkAdd(PRESET_POEMS);
      return PRESET_POEMS;
    }
    // 按创建时间倒序
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (err) {
    console.error('[PoetryStorage] 加载诗库失败:', err);
    return PRESET_POEMS;
  }
}

/**
 * 新增或更新诗词
 */
export async function savePoemRecord(poem: SavedPoemRecord): Promise<void> {
  await db.poems.put(poem);
}

/**
 * 删除诗词
 */
export async function deletePoemRecord(id: string): Promise<void> {
  await db.poems.delete(id);
}

/**
 * 切换心仪收藏状态
 */
export async function togglePoemFavorite(id: string): Promise<boolean> {
  const poem = await db.poems.get(id);
  if (!poem) return false;
  const newFav = !poem.isFavorite;
  await db.poems.update(id, { isFavorite: newFav });
  return newFav;
}

/**
 * 考核成功通关：增加通关次数，标记为已熟背
 */
export async function markPoemPassed(id: string): Promise<void> {
  const poem = await db.poems.get(id);
  if (!poem) return;

  const newCount = (poem.quizPassCount || 0) + 1;
  const now = new Date().toISOString();
  await db.poems.update(id, {
    status: 'mastered',
    quizPassCount: newCount,
    masteredAt: poem.masteredAt || now,
    lastReviewedAt: now,
  });
}

/**
 * 将诗词重新置为在背/温习状态
 */
export async function markPoemLearning(id: string): Promise<void> {
  await db.poems.update(id, {
    status: 'learning',
    lastReviewedAt: new Date().toISOString(),
  });
}

/**
 * 更新用户赏析笔记
 */
export async function updatePoemNotes(id: string, notes: string): Promise<void> {
  await db.poems.update(id, {
    userNotes: notes.trim(),
  });
}

/**
 * 计算诗阁整体统计数据
 */
export function calculatePoetryStats(poems: SavedPoemRecord[]): PoetryStats {
  const totalCount = poems.length;
  let learningCount = 0;
  let masteredCount = 0;
  let favoriteCount = 0;
  let totalPasses = 0;

  for (const p of poems) {
    if (p.status === 'mastered') {
      masteredCount++;
    } else {
      learningCount++;
    }
    if (p.isFavorite) {
      favoriteCount++;
    }
    totalPasses += p.quizPassCount || 0;
  }

  const currentRank = calculateKejuRank(totalPasses);

  return {
    totalCount,
    learningCount,
    masteredCount,
    favoriteCount,
    totalPasses,
    currentRank,
  };
}
