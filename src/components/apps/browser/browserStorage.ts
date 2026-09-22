import { db, BrowserHistoryRecord, BrowserShortcutRecord } from '../../../core/storage/db';

export type ShortcutItem = BrowserShortcutRecord;

// 初始快捷网站固定为空，完全由用户自主添加
export const DEFAULT_SHORTCUTS: ShortcutItem[] = [];

// 从本地 IndexedDB 中加载所有快捷网站
export async function loadShortcuts(): Promise<ShortcutItem[]> {
  try {
    const list = await db.browser_shortcuts.orderBy('createdAt').toArray();
    return list || [];
  } catch (err) {
    console.error('Failed to load shortcuts from IndexedDB', err);
    return [];
  }
}

// 添加新快捷网站到 IndexedDB
export async function saveShortcut(item: ShortcutItem): Promise<void> {
  try {
    await db.browser_shortcuts.put(item);
  } catch (err) {
    console.error('Failed to save shortcut to IndexedDB', err);
  }
}

// 从 IndexedDB 中删除指定的快捷网站（永久删除，刷新后绝不再出现）
export async function deleteShortcut(id: string): Promise<void> {
  try {
    await db.browser_shortcuts.delete(id);
  } catch (err) {
    console.error('Failed to delete shortcut from IndexedDB', err);
  }
}

// 记录历史网页
export async function addHistory(url: string, title?: string): Promise<void> {
  try {
    const record: BrowserHistoryRecord = {
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      url,
      title: title || url,
      visitedAt: Date.now(),
    };
    await db.browser_history.put(record);
  } catch (err) {
    console.warn('Failed to add history', err);
  }
}

export async function getRecentHistory(limit = 10): Promise<BrowserHistoryRecord[]> {
  try {
    return await db.browser_history.reverse().limit(limit).toArray();
  } catch {
    return [];
  }
}
