import { db, RPGLifeStoryRecord } from '../storage/db';

export function determineLifeStage(age: number): 'childhood' | 'youth' | 'adult' | 'later' {
  if (age <= 12) return 'childhood';
  if (age <= 18) return 'youth';
  if (age <= 25) return 'adult';
  return 'later';
}

export const DEFAULT_LIFE_STORIES: RPGLifeStoryRecord[] = [
  {
    id: 'life_story_1',
    title: '7岁 - 外婆家后院',
    age: 7,
    year: '2011年春',
    location: '后院老槐树下',
    content: '偷偷把西瓜子埋进花盆，每天眼巴巴浇水盼它快快结出大西瓜。',
    tag: '童真趣事',
    moodTag: '纯真',
    badgeKey: 'cat',
    ticketColor: 'yellow',
    stage: 'childhood',
    createdAt: Date.now() - 3600000 * 48,
    updatedAt: Date.now() - 3600000 * 48,
  },
  {
    id: 'life_story_2',
    title: '11岁 - 蓝天学校',
    age: 11,
    year: '2015年夏',
    location: '学校大操场升旗台旁',
    content: '自习课传纸条被抓，被罚站一天，大太阳底下中暑晕倒，被老师背去医务室喝了藿香正气水。',
    tag: '罚站中暑',
    moodTag: '尴尬',
    badgeKey: 'school',
    ticketColor: 'pink',
    stage: 'childhood',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'life_story_3',
    title: '16岁 - 沿海公路',
    age: 16,
    year: '2020年夏',
    location: '环海绿道',
    content: '和朋友热血环岛骑行五十公里，一起看落日余晖，结果半路车链子断了，一路推车说说笑笑到天黑。',
    tag: '热血骑行',
    moodTag: '高光',
    badgeKey: 'bicycle',
    ticketColor: 'yellow',
    stage: 'youth',
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'life_story_4',
    title: '21岁 - 大学礼堂',
    age: 21,
    year: '2025年秋',
    location: '主校区音乐厅',
    content: '第一次登台做全院创客项目路演，手心里全是汗，但当掌声响起那一刻，感觉一切熬夜都有了意义。',
    tag: '破茧成长',
    moodTag: '自豪',
    badgeKey: 'medal',
    ticketColor: 'pink',
    stage: 'adult',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * 获取所有人生手账条目（从 IndexedDB 异步读取）
 * 若首次为空，自动灌入默认趣味故事
 */
export async function getAllLifeStories(): Promise<RPGLifeStoryRecord[]> {
  try {
    const list = await db.rpg_life_stories.toArray();
    if (!list || list.length === 0) {
      await db.rpg_life_stories.bulkPut(DEFAULT_LIFE_STORIES);
      return DEFAULT_LIFE_STORIES;
    }
    return list;
  } catch (err) {
    console.error('Failed to load life stories from IndexedDB:', err);
    return DEFAULT_LIFE_STORIES;
  }
}

/**
 * 保存单个回忆条目（新增或覆盖）
 */
export async function saveLifeStory(story: RPGLifeStoryRecord): Promise<void> {
  try {
    await db.rpg_life_stories.put({
      ...story,
      stage: determineLifeStage(story.age),
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save life story to IndexedDB:', err);
  }
}

/**
 * 删除单个回忆条目
 */
export async function deleteLifeStory(id: string): Promise<void> {
  try {
    await db.rpg_life_stories.delete(id);
  } catch (err) {
    console.error('Failed to delete life story from IndexedDB:', err);
  }
}

/**
 * 恢复为默认初始回忆
 */
export async function resetLifeStories(): Promise<RPGLifeStoryRecord[]> {
  try {
    await db.rpg_life_stories.clear();
    await db.rpg_life_stories.bulkPut(DEFAULT_LIFE_STORIES);
    return DEFAULT_LIFE_STORIES;
  } catch (err) {
    console.error('Failed to reset life stories in IndexedDB:', err);
    return DEFAULT_LIFE_STORIES;
  }
}
