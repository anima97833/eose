import { db } from '../storage/db';
import { PosterRecord, PosterCategory, PosterStampType } from './posterTypes';
import { POSTER_TEMPLATES } from './posterTemplates';

const DAILY_DISMISSED_KEY = 'cloudfly_poster_daily_dismissed_date';

/**
 * 格式化 Date 为 'YYYY-MM-DD'
 */
export function formatDateYMD(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 计算剩余或逾期天数
 */
export function getDaysDiff(targetDateStr: string, fromDateStr: string = formatDateYMD()): number {
  try {
    const target = new Date(targetDateStr.replace(/-/g, '/')).getTime();
    const from = new Date(fromDateStr.replace(/-/g, '/')).getTime();
    const diff = Math.ceil((target - from) / (1000 * 60 * 60 * 24));
    return diff;
  } catch {
    return 0;
  }
}

/**
 * 格式化周循环星期显示文本
 * e.g. [1, 2, 3, 4, 5] -> "每周一至周五"
 * e.g. [3, 4, 5] -> "每周三至周五"
 * e.g. [6, 0] -> "每周末 (六、日)"
 * e.g. [1, 3, 5] -> "每周一、周三、周五"
 */
export function formatWeekdaysText(days: number[]): string {
  if (!days || days.length === 0) return '未设置';
  if (days.length === 7) return '每周每天';

  const order = [1, 2, 3, 4, 5, 6, 0];
  const sorted = [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b));

  const dayNames: Record<number, string> = {
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    0: '周日',
  };

  // 常用区间检测
  const isWorkdays = sorted.length === 5 && [1, 2, 3, 4, 5].every((d) => sorted.includes(d));
  if (isWorkdays) return '每周一至周五';

  const isWeekend = sorted.length === 2 && sorted.includes(6) && sorted.includes(0);
  if (isWeekend) return '每周末 (六、日)';

  // 是否连续 (基于周一到周日顺序)
  const indices = sorted.map((d) => order.indexOf(d));
  const isConsecutive = indices.every((idx, i) => i === 0 || idx === indices[i - 1] + 1);
  if (isConsecutive && sorted.length >= 2) {
    return `每周${dayNames[sorted[0]]}至${dayNames[sorted[sorted.length - 1]]}`;
  }

  return '每周' + sorted.map((d) => dayNames[d]).join('、');
}

/**
 * 根据起始日期与截止日期计算跨越的星期几列表 (0=周日, 1=周一, ..., 6=周六)
 */
export function getDaysOfWeekBetween(startDateStr: string, endDateStr: string): number[] {
  if (!startDateStr || !endDateStr) return [1, 2, 3, 4, 5];
  const s = new Date(startDateStr.replace(/-/g, '/'));
  const e = new Date(endDateStr.replace(/-/g, '/'));
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return [1, 2, 3, 4, 5];

  const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays >= 6) {
    return [1, 2, 3, 4, 5, 6, 0];
  }

  const set = new Set<number>();
  const curr = new Date(s);
  while (curr <= e) {
    set.add(curr.getDay());
    curr.setDate(curr.getDate() + 1);
  }
  return Array.from(set);
}

/**
 * 判断指定海报是否在某天处于“生效展映期”
 */
export function isPosterActiveOnDate(poster: PosterRecord, dateStr: string = formatDateYMD()): boolean {
  if (poster.isArchived) return false;

  const targetDate = new Date(dateStr.replace(/-/g, '/'));
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1;
  const targetDay = targetDate.getDate();

  const start = new Date(poster.startDate.replace(/-/g, '/'));
  const end = new Date(poster.endDate.replace(/-/g, '/'));

  if (poster.repeatMode === 'none') {
    return poster.startDate <= dateStr && dateStr <= poster.endDate;
  }

  if (poster.repeatMode === 'weekly') {
    // 若当前日期早于起始日期，则尚未进入生效周期
    if (poster.startDate && dateStr < poster.startDate) {
      return false;
    }
    const targetDayOfWeek = targetDate.getDay();
    if (poster.repeatDaysOfWeek && poster.repeatDaysOfWeek.length > 0) {
      return poster.repeatDaysOfWeek.includes(targetDayOfWeek);
    }
    const activeWeekdays = getDaysOfWeekBetween(poster.startDate, poster.endDate);
    return activeWeekdays.includes(targetDayOfWeek);
  }

  if (poster.repeatMode === 'yearly') {
    // 每年重复：只比对月日区间
    const startM = start.getMonth() + 1;
    const startD = start.getDate();
    const endM = end.getMonth() + 1;
    const endD = end.getDate();

    const currMd = targetMonth * 100 + targetDay;
    const startMd = startM * 100 + startD;
    const endMd = endM * 100 + endD;

    if (startMd <= endMd) {
      return currMd >= startMd && currMd <= endMd;
    } else {
      // 跨年情况（例如 12.25 - 01.05）
      return currMd >= startMd || currMd <= endMd;
    }
  }

  if (poster.repeatMode === 'monthly') {
    // 每月重复：只比对日区间
    const startD = start.getDate();
    const endD = end.getDate();
    if (startD <= endD) {
      return targetDay >= startD && targetDay <= endD;
    } else {
      return targetDay >= startD || targetDay <= endD;
    }
  }

  return false;
}

/**
 * 种子初始演示海报（首次启动自动注入）
 */
export async function seedDemoPostersIfNeeded(): Promise<void> {
  try {
    if (!db.isOpen()) await db.open();
    const count = await db.poster_records.count();
    if (count > 0) return;

    const today = new Date();
    const todayStr = formatDateYMD(today);
    
    // 3 天后的日期
    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);
    const in3DaysStr = formatDateYMD(in3Days);

    // 昨天
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDateYMD(yesterday);

    // 7 天后
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);
    const in7DaysStr = formatDateYMD(in7Days);

    const demoPosters: PosterRecord[] = [
      {
        id: 'poster_demo_romance_1',
        title: '和宝贝的相恋一周年 💍',
        category: 'romance',
        subtitle: '从相遇到相知，感谢这一年的每一天陪伴',
        templateId: 'polaroid_love',
        templateTheme: 'warm_cherry',
        tagText: '❤️ 365 DAYS',
        startDate: yesterdayStr,
        endDate: in3DaysStr,
        repeatMode: 'yearly',
        backNote: '纪念日去预订最初相识时的餐厅，准备定制心愿礼盒，拍立得一定要装满新相纸！',
        backItems: [
          { id: '1', text: '提前预订法餐厅晚餐靠窗景观位', completed: true },
          { id: '2', text: '挑选纪念日拍立得相框与刻字小礼物', completed: true },
          { id: '3', text: '准备一束香槟玫瑰与手写信', completed: false },
          { id: '4', text: '江边散步夜景合影留念', completed: false },
        ],
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'poster_demo_sale_1',
        title: '山姆生鲜超市周三大促 🥩',
        category: 'event',
        subtitle: '澳洲谷饲牛排买一送一 · 智利车厘子直降',
        templateId: 'supermarket_sale',
        templateTheme: 'super_yellow',
        tagText: '⚡️ 50% OFF',
        startDate: todayStr,
        endDate: in7DaysStr,
        repeatMode: 'none',
        backNote: '周三上午新鲜生鲜上架，记得带上车载大容量保温箱，避免下午断货！',
        backItems: [
          { id: 'b1', text: '抢购谷饲安格斯眼肉牛排 x2 盒', completed: false },
          { id: 'b2', text: '智利车厘子 5KG 装礼盒', completed: false },
          { id: 'b3', text: '大盒伯爵红茶瑞士卷', completed: false },
          { id: 'b4', text: '全脂巴氏鲜牛奶 2L', completed: false },
        ],
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
      {
        id: 'poster_demo_ticket_1',
        title: '初秋户外星空音乐节 🎸',
        category: 'event',
        subtitle: 'Live 现场草坪狂欢 · 浪漫夏末返场',
        templateId: 'vintage_ticket',
        templateTheme: 'kraft_paper',
        tagText: '🎟 电子门票入场',
        startDate: todayStr,
        endDate: in7DaysStr,
        repeatMode: 'none',
        backNote: '检票时间 15:30，场地在滨海生态公园东门，备好草地野餐垫与防蚊喷雾。',
        backItems: [
          { id: 't1', text: '出示大麦电子门票二维码', completed: false },
          { id: 't2', text: '带上草地野餐垫与便携小风扇', completed: false },
          { id: 't3', text: '随身充沛电量充电宝', completed: false },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    await db.poster_records.bulkPut(demoPosters);
  } catch (err) {
    console.error('[PosterStorage] 注入初始演示海报失败:', err);
  }
}

/**
 * 获取所有海报记录（按更新时间降序）
 */
export async function getAllPosters(): Promise<PosterRecord[]> {
  try {
    if (!db.isOpen()) await db.open();
    await seedDemoPostersIfNeeded();
    const list = await db.poster_records.toArray();
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error('[PosterStorage] 读取海报列表失败:', err);
    return [];
  }
}

/**
 * 保存或更新海报
 */
export async function savePoster(poster: PosterRecord): Promise<void> {
  try {
    if (!db.isOpen()) await db.open();
    const updated = {
      ...poster,
      updatedAt: Date.now(),
    };
    await db.poster_records.put(updated);
  } catch (err) {
    console.error('[PosterStorage] 保存海报失败:', err);
    throw err;
  }
}

/**
 * 删除海报
 */
export async function deletePoster(id: string): Promise<void> {
  try {
    if (!db.isOpen()) await db.open();
    await db.poster_records.delete(id);
  } catch (err) {
    console.error('[PosterStorage] 删除海报失败:', err);
    throw err;
  }
}

/**
 * 归档海报并盖上纪念印章
 */
export async function archivePoster(id: string, stamp: PosterStampType = 'achieved'): Promise<void> {
  try {
    if (!db.isOpen()) await db.open();
    const poster = await db.poster_records.get(id);
    if (poster) {
      poster.isArchived = true;
      poster.archivedAt = Date.now();
      poster.stamp = stamp;
      poster.updatedAt = Date.now();
      await db.poster_records.put(poster);
    }
  } catch (err) {
    console.error('[PosterStorage] 归档海报失败:', err);
  }
}

/**
 * 取消归档
 */
export async function unarchivePoster(id: string): Promise<void> {
  try {
    if (!db.isOpen()) await db.open();
    const poster = await db.poster_records.get(id);
    if (poster) {
      poster.isArchived = false;
      poster.stamp = null;
      poster.updatedAt = Date.now();
      await db.poster_records.put(poster);
    }
  } catch (err) {
    console.error('[PosterStorage] 取消归档失败:', err);
  }
}

/**
 * 获取今日生效的所有海报（未归档）
 */
export async function getTodayActivePosters(todayStr: string = formatDateYMD()): Promise<PosterRecord[]> {
  try {
    const all = await getAllPosters();
    return all.filter((p) => isPosterActiveOnDate(p, todayStr));
  } catch (err) {
    console.error('[PosterStorage] 获取今日生效海报失败:', err);
    return [];
  }
}

/**
 * 今日是否已被用户手动叉掉/已阅（存入 LocalStorage，只影响开屏自动弹窗）
 */
export function isTodayDismissed(todayStr: string = formatDateYMD()): boolean {
  try {
    const val = localStorage.getItem(DAILY_DISMISSED_KEY);
    return val === todayStr;
  } catch {
    return false;
  }
}

/**
 * 标记今日已阅
 */
export function markTodayDismissed(todayStr: string = formatDateYMD()): void {
  try {
    localStorage.setItem(DAILY_DISMISSED_KEY, todayStr);
  } catch (err) {
    console.warn('[PosterStorage] 标记今日已阅失败:', err);
  }
}

/**
 * 重置今日已阅状态（用于测试或重新查看）
 */
export function resetTodayDismissed(): void {
  try {
    localStorage.removeItem(DAILY_DISMISSED_KEY);
  } catch (err) {
    console.warn('[PosterStorage] 重置今日已阅失败:', err);
  }
}
