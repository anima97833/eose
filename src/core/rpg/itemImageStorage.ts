import { db } from '../storage/db';

/**
 * 从 IndexedDB 获取单个物品的自定义图片 Base64
 */
export async function getItemImage(id: string): Promise<string | null> {
  try {
    const rec = await db.rpg_item_images.get(id);
    return rec?.dataUrl || null;
  } catch (err) {
    console.error('Failed to get item image from IndexedDB:', err);
    return null;
  }
}

/**
 * 一次性获取所有物品的自定义图片映射表 { [itemId]: dataUrl }
 */
export async function getAllItemImages(): Promise<Record<string, string>> {
  try {
    const list = await db.rpg_item_images.toArray();
    const map: Record<string, string> = {};
    for (const item of list) {
      map[item.id] = item.dataUrl;
    }
    return map;
  } catch (err) {
    console.error('Failed to load item images from IndexedDB:', err);
    return {};
  }
}

/**
 * 保存物品自定义图片到 IndexedDB
 */
export async function saveItemImage(id: string, dataUrl: string): Promise<void> {
  try {
    await db.rpg_item_images.put({
      id,
      dataUrl,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save item image to IndexedDB:', err);
  }
}

/**
 * 从 IndexedDB 删除物品自定义图片
 */
export async function deleteItemImage(id: string): Promise<void> {
  try {
    await db.rpg_item_images.delete(id);
  } catch (err) {
    console.error('Failed to delete item image from IndexedDB:', err);
  }
}
