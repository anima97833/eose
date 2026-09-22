import { db } from '../storage/db';
import { MemoCategory, MemoChapter } from './memoTypes';

const MEMO_CAT_FALLBACK_KEY = 'cloudfly_memo_categories_v1';
const MEMO_CHAP_FALLBACK_KEY = 'cloudfly_memo_chapters_v1';

// 默认预设分类（用户可自由增删改查）
export const DEFAULT_MEMO_CATEGORIES: MemoCategory[] = [
  {
    id: 'cat_essays',
    name: '随笔',
    icon: 'book',
    color: '#D97706',
    order: 0,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'cat_accounting',
    name: '记账',
    icon: 'wallet',
    color: '#059669',
    order: 1,
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'cat_todo',
    name: '待办',
    icon: 'check',
    color: '#2563EB',
    order: 2,
    createdAt: Date.now() - 600000,
  },
];

// 默认初始篇章（对应各自的标签分类，内容严格隔离）
export const DEFAULT_MEMO_CHAPTERS: MemoChapter[] = [
  {
    id: 'chap_essay_1',
    categoryId: 'cat_essays',
    titleLevel1: '初醒随笔',
    titleLevel2: '在云端手账的午后',
    chapterName: '卷一·午后随想',
    pages: [
      '这是我在手机上写下的第一页活页手账。\n\n左侧的书签条可以自由新建分类，每一个标签下的内容与篇章都是彻底独立隔离的。\n\n如果单页写不下了，轻触下方的【加新纸】，就可以继续翻开全新的一张纸书写！',
      '这是第二页纸张！\n\n翻页与加纸可以无限扩展，再也不用担心长篇随笔或灵感被截断了。',
    ],
    currentPageIndex: 0,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'chap_acc_1',
    categoryId: 'cat_accounting',
    titleLevel1: '9月开销大盘',
    titleLevel2: '日常餐饮与手账好物',
    chapterName: '第1篇·日常账簿',
    pages: [
      '• 9月22日 暖阳拿铁 ￥18.00\n• 9月22日 手账复古贴纸 ￥25.00\n• 9月22日 治愈晚餐便当 ￥32.00\n\n今日总计：￥75.00 ✨',
    ],
    currentPageIndex: 0,
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: 'chap_todo_1',
    categoryId: 'cat_todo',
    titleLevel1: '本周心愿清单',
    titleLevel2: '待完成的小确幸',
    chapterName: '清单·第1周',
    pages: [
      '[√] 给花盆里的多肉植物浇水\n[ ] 去散步吹吹晚风看落日\n[ ] 读完手账本推荐的短篇散文\n[ ] 晚上喝一杯温热的燕麦牛奶',
    ],
    currentPageIndex: 0,
    createdAt: Date.now() - 600000,
    updatedAt: Date.now() - 600000,
  },
];

// ================= 分类管理 =================

export async function loadMemoCategoriesFromDB(): Promise<MemoCategory[]> {
  try {
    const list = await db.memo_categories.toArray();
    if (list && list.length > 0) {
      return list.sort((a, b) => a.order - b.order);
    }
    // 初次启动初始化默认分类
    await db.memo_categories.bulkPut(DEFAULT_MEMO_CATEGORIES);
    return DEFAULT_MEMO_CATEGORIES;
  } catch (err) {
    console.warn('[MemoDB] IndexedDB 加载分类失败，降级 localStorage:', err);
    const raw = localStorage.getItem(MEMO_CAT_FALLBACK_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    localStorage.setItem(MEMO_CAT_FALLBACK_KEY, JSON.stringify(DEFAULT_MEMO_CATEGORIES));
    return DEFAULT_MEMO_CATEGORIES;
  }
}

export async function saveMemoCategoryToDB(cat: MemoCategory): Promise<void> {
  try {
    await db.memo_categories.put(cat);
  } catch (err) {
    console.warn('[MemoDB] 保存分类失败，降级 localStorage:', err);
    const current = await loadMemoCategoriesFromDB();
    const nextList = current.some((c) => c.id === cat.id)
      ? current.map((c) => (c.id === cat.id ? cat : c))
      : [...current, cat];
    localStorage.setItem(MEMO_CAT_FALLBACK_KEY, JSON.stringify(nextList));
  }
}

export async function deleteMemoCategoryFromDB(categoryId: string): Promise<void> {
  try {
    await db.memo_categories.delete(categoryId);
    // 级联删除该分类下的所有篇章
    const chaptersToDelete = await db.memo_chapters.where('categoryId').equals(categoryId).toArray();
    for (const chap of chaptersToDelete) {
      await db.memo_chapters.delete(chap.id);
    }
  } catch (err) {
    console.warn('[MemoDB] 删除分类失败，降级 localStorage:', err);
    const current = await loadMemoCategoriesFromDB();
    const nextList = current.filter((c) => c.id !== categoryId);
    localStorage.setItem(MEMO_CAT_FALLBACK_KEY, JSON.stringify(nextList));
  }
}

// ================= 篇章管理（严格按 categoryId 隔离） =================

export async function loadMemoChaptersFromDB(categoryId: string): Promise<MemoChapter[]> {
  try {
    const list = await db.memo_chapters.where('categoryId').equals(categoryId).toArray();
    if (list && list.length > 0) {
      return list.sort((a, b) => a.createdAt - b.createdAt);
    }
    // 若数据库为空且属于默认分类，初始化默认篇章
    const matchingDefaults = DEFAULT_MEMO_CHAPTERS.filter((c) => c.categoryId === categoryId);
    if (matchingDefaults.length > 0) {
      await db.memo_chapters.bulkPut(matchingDefaults);
      return matchingDefaults;
    }
    return [];
  } catch (err) {
    console.warn('[MemoDB] 加载篇章失败，降级 localStorage:', err);
    const raw = localStorage.getItem(MEMO_CHAP_FALLBACK_KEY);
    if (raw) {
      try {
        const allChapters: MemoChapter[] = JSON.parse(raw);
        return allChapters.filter((c) => c.categoryId === categoryId);
      } catch {
        // ignore
      }
    }
    const matchingDefaults = DEFAULT_MEMO_CHAPTERS.filter((c) => c.categoryId === categoryId);
    localStorage.setItem(MEMO_CHAP_FALLBACK_KEY, JSON.stringify(DEFAULT_MEMO_CHAPTERS));
    return matchingDefaults;
  }
}

export async function saveMemoChapterToDB(chapter: MemoChapter): Promise<void> {
  try {
    await db.memo_chapters.put(chapter);
  } catch (err) {
    console.warn('[MemoDB] 保存篇章失败，降级 localStorage:', err);
    const raw = localStorage.getItem(MEMO_CHAP_FALLBACK_KEY);
    let allChapters: MemoChapter[] = [];
    if (raw) {
      try {
        allChapters = JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    const nextList = allChapters.some((c) => c.id === chapter.id)
      ? allChapters.map((c) => (c.id === chapter.id ? chapter : c))
      : [...allChapters, chapter];
    localStorage.setItem(MEMO_CHAP_FALLBACK_KEY, JSON.stringify(nextList));
  }
}

export async function deleteMemoChapterFromDB(chapterId: string): Promise<void> {
  try {
    await db.memo_chapters.delete(chapterId);
  } catch (err) {
    console.warn('[MemoDB] 删除篇章失败，降级 localStorage:', err);
    const raw = localStorage.getItem(MEMO_CHAP_FALLBACK_KEY);
    if (raw) {
      try {
        const allChapters: MemoChapter[] = JSON.parse(raw);
        const nextList = allChapters.filter((c) => c.id !== chapterId);
        localStorage.setItem(MEMO_CHAP_FALLBACK_KEY, JSON.stringify(nextList));
      } catch {
        // ignore
      }
    }
  }
}
