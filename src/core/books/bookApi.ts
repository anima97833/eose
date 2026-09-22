import { PhysicalBookRecord } from './bookTypes';
import { normalizeISBN } from './scannerEngine';

// 常用经典畅销中文书籍快速缓存，保障离线与演示即刻秒出
const WELL_KNOWN_BOOKS: Record<string, Partial<PhysicalBookRecord>> = {
  '9787536692930': {
    title: '三体',
    subtitle: '地球往事三部曲之一',
    author: '刘慈欣',
    publisher: '重庆出版社',
    pubDate: '2008-01',
    price: '¥23.00',
    pageCount: 302,
    category: '科幻',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9787536692930-M.jpg',
  },
  '9787544270878': {
    title: '解忧杂货店',
    author: '东野圭吾',
    publisher: '南海出版公司',
    pubDate: '2014-05',
    price: '¥39.50',
    pageCount: 291,
    category: '文学',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9787544270878-M.jpg',
  },
  '9787506365437': {
    title: '活着',
    author: '余华',
    publisher: '作家出版社',
    pubDate: '2012-08',
    price: '¥20.00',
    pageCount: 191,
    category: '小说',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9787506365437-M.jpg',
  },
  '9787544253994': {
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    publisher: '南海出版公司',
    pubDate: '2011-06',
    price: '¥39.50',
    pageCount: 360,
    category: '世界文学',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9787544253994-M.jpg',
  },
  '9787508647357': {
    title: '人类简史',
    subtitle: '从动物到上帝',
    author: '尤瓦尔·赫拉利',
    publisher: '中信出版社',
    pubDate: '2014-11',
    price: '¥68.00',
    pageCount: 440,
    category: '历史社科',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9787508647357-M.jpg',
  },
  '9787544276184': {
    title: '月亮与六便士',
    author: '毛姆',
    publisher: '南海出版公司',
    pubDate: '2015-01',
    price: '¥39.80',
    pageCount: 312,
    category: '外国文学',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9787544276184-M.jpg',
  },
};

/**
 * 根据 13 位 ISBN 码从 Open Library 或知名书籍库检索图书信息
 */
export async function fetchBookByISBN(rawIsbn: string): Promise<Partial<PhysicalBookRecord>> {
  const cleanIsbn = normalizeISBN(rawIsbn);
  if (!cleanIsbn) {
    throw new Error('ISBN 格式有误');
  }

  // 1. 命中内置高频库
  if (WELL_KNOWN_BOOKS[cleanIsbn]) {
    return {
      isbn: cleanIsbn,
      ...WELL_KNOWN_BOOKS[cleanIsbn],
    };
  }

  // 2. 联网请求 Open Library API
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  try {
    const url = `https://openlibrary.org/isbn/${cleanIsbn}.json`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const title = data.title || `图书 ${cleanIsbn}`;
      const subtitle = data.subtitle;
      const publishers = Array.isArray(data.publishers) ? data.publishers.join(' / ') : '';
      const pubDate = data.publish_date || '';
      const pageCount = Number(data.number_of_pages) || 280;

      // 异步尝试解析作者名
      let authorName = '佚名';
      if (Array.isArray(data.authors) && data.authors.length > 0 && data.authors[0].key) {
        try {
          const authRes = await fetch(`https://openlibrary.org${data.authors[0].key}.json`);
          if (authRes.ok) {
            const authData = await authRes.json();
            if (authData.name) authorName = authData.name;
          }
        } catch {
          // ignore
        }
      }

      const coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`;

      return {
        isbn: cleanIsbn,
        title,
        subtitle,
        author: authorName,
        publisher: publishers || '待补充出版社',
        pubDate,
        pageCount,
        price: '¥39.00',
        coverUrl,
        category: '藏书',
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[BookApi] 联网检索异常或超时:', err?.message);
  }

  // 3. 优雅智能兜底模板
  return {
    isbn: cleanIsbn,
    title: `新藏书 (ISBN: ${cleanIsbn.slice(-4)})`,
    author: '待录入作者',
    publisher: '待补充出版社',
    pageCount: 260,
    price: '¥38.00',
    coverUrl: `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`,
    category: '其他',
  };
}
