import { db } from '../storage/db';
import { PhysicalBookRecord, BookShelfStats } from './bookTypes';

const DEFAULT_PRESET_BOOKS: PhysicalBookRecord[] = [
  {
    id: 'b_9787536692930',
    isbn: '9787536692930',
    title: '三体',
    subtitle: '地球往事三部曲之一',
    author: '刘慈欣',
    publisher: '重庆出版社',
    pubDate: '2008-01',
    price: '¥23.00',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9787536692930-M.jpg',
    pageCount: 302,
    currentPage: 156,
    status: 'reading',
    rating: 5,
    physicalLocation: '客厅书柜A1',
    category: '科幻',
    notes: '重读依然震撼！宏大的宇宙社会学图景。',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b_9787508647357',
    isbn: '9787508647357',
    title: '人类简史',
    subtitle: '从动物到上帝',
    author: '尤瓦尔·赫拉利',
    publisher: '中信出版社',
    pubDate: '2014-11',
    price: '¥68.00',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9787508647357-M.jpg',
    pageCount: 440,
    currentPage: 440,
    status: 'read',
    rating: 5,
    physicalLocation: '书房主架第2层',
    category: '社科',
    notes: '虚构故事与认知革命彻底颠覆了对历史的认知。',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b_9787506365437',
    isbn: '9787506365437',
    title: '活着',
    author: '余华',
    publisher: '作家出版社',
    pubDate: '2012-08',
    price: '¥20.00',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9787506365437-M.jpg',
    pageCount: 191,
    currentPage: 191,
    status: 'read',
    rating: 5,
    physicalLocation: '卧室床头柜',
    category: '文学',
    notes: '人是为了活着本身而活着的，朴实而千钧之力。',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b_9787544276184',
    isbn: '9787544276184',
    title: '月亮与六便士',
    author: '毛姆',
    publisher: '南海出版公司',
    pubDate: '2015-01',
    price: '¥39.80',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9787544276184-M.jpg',
    pageCount: 312,
    currentPage: 0,
    status: 'unread',
    physicalLocation: '客厅书柜A1',
    category: '文学',
    notes: '满地都是六便士，他却抬头看见了月亮。',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_LOCATIONS = [
  '客厅书柜A1',
  '客厅书柜B2',
  '书房主架第1层',
  '书房主架第2层',
  '卧室床头柜',
  '储物箱B',
];

const LOCATIONS_STORAGE_KEY = 'neumorphic_book_physical_locations_v1';

/**
 * 获取所有已记忆的物理书架位置
 */
export function getSavedPhysicalLocations(): string[] {
  if (typeof window === 'undefined') return DEFAULT_LOCATIONS;
  try {
    const raw = localStorage.getItem(LOCATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCATIONS;
}

/**
 * 记忆新增的物理书架位置
 */
export function savePhysicalLocation(newLoc: string): void {
  const clean = newLoc.trim();
  if (!clean) return;
  const current = getSavedPhysicalLocations();
  if (!current.includes(clean)) {
    const updated = [clean, ...current];
    try {
      localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

/**
 * 重命名/编辑物理书架位置，并同步更新该书架下的所有图书
 */
export async function updatePhysicalLocation(oldLoc: string, newLoc: string): Promise<void> {
  const cleanNew = newLoc.trim();
  if (!cleanNew || cleanNew === oldLoc) return;

  // 1. 更新存储的位置列表
  const current = getSavedPhysicalLocations();
  const updatedList = current.map((loc) => (loc === oldLoc ? cleanNew : loc));
  if (!updatedList.includes(cleanNew)) {
    updatedList.push(cleanNew);
  }
  try {
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(Array.from(new Set(updatedList))));
  } catch {
    // ignore
  }

  // 2. 同步更新 IndexedDB 中属于此位置的所有图书
  try {
    const booksToUpdate = await db.books.filter((b) => b.physicalLocation === oldLoc).toArray();
    for (const b of booksToUpdate) {
      await db.books.update(b.id, {
        physicalLocation: cleanNew,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[BookStorage] 同步图书物理位置失败:', err);
  }
}

/**
 * 删除物理书架位置，并将该位置的书籍自动移至 fallback 位置（默认“未归位”）
 */
export async function deletePhysicalLocation(locToDelete: string, fallbackLoc = '未归位'): Promise<void> {
  // 1. 从列表中移除
  const current = getSavedPhysicalLocations();
  const updatedList = current.filter((loc) => loc !== locToDelete);
  try {
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(updatedList));
  } catch {
    // ignore
  }

  // 2. 将属于此位置的图书移至 fallbackLoc
  try {
    const booksToUpdate = await db.books.filter((b) => b.physicalLocation === locToDelete).toArray();
    for (const b of booksToUpdate) {
      await db.books.update(b.id, {
        physicalLocation: fallbackLoc,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[BookStorage] 移除图书物理位置失败:', err);
  }
}

/**
 * 加载所有藏书，若首次为空则注入经典书籍
 */
export async function loadAllBooks(): Promise<PhysicalBookRecord[]> {
  try {
    const list = await db.books.toArray();
    if (list.length === 0) {
      await db.books.bulkAdd(DEFAULT_PRESET_BOOKS);
      return DEFAULT_PRESET_BOOKS;
    }
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (err) {
    console.error('[BookStorage] 加载藏书失败:', err);
    return DEFAULT_PRESET_BOOKS;
  }
}

/**
 * 保存或更新藏书
 */
export async function saveBook(book: PhysicalBookRecord): Promise<void> {
  await db.books.put(book);
  if (book.physicalLocation) {
    savePhysicalLocation(book.physicalLocation);
  }
}

/**
 * 删除藏书
 */
export async function deleteBook(id: string): Promise<void> {
  await db.books.delete(id);
}

/**
 * 更新阅读进度
 */
export async function updateBookProgress(
  id: string,
  currentPage: number,
  status: 'unread' | 'reading' | 'read'
): Promise<void> {
  await db.books.update(id, {
    currentPage,
    status,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * 统计全屋藏书大盘数据
 */
export function calculateBookShelfStats(books: PhysicalBookRecord[]): BookShelfStats {
  let readingCount = 0;
  let readCount = 0;
  let unreadCount = 0;
  let totalEstimatedPrice = 0;
  const locationCounts: Record<string, number> = {};

  for (const b of books) {
    if (b.status === 'reading') readingCount++;
    else if (b.status === 'read') readCount++;
    else unreadCount++;

    // 提取价格数字如 "¥45.00" -> 45
    const priceNum = parseFloat(b.price?.replace(/[^\d.]/g, '') || '0');
    if (!isNaN(priceNum) && priceNum > 0) {
      totalEstimatedPrice += priceNum;
    }

    const loc = b.physicalLocation || '未归位';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  }

  return {
    totalBooks: books.length,
    readingCount,
    readCount,
    unreadCount,
    totalEstimatedPrice: Math.round(totalEstimatedPrice),
    locationCounts,
  };
}
