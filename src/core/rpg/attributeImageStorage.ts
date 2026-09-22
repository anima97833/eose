import { db } from '../storage/db';

/**
 * 从 IndexedDB 获取单个六维属性的自定义图标 Base64
 */
export async function getAttributeImage(key: string): Promise<string | null> {
  try {
    const rec = await db.rpg_attribute_images.get(key);
    return rec?.dataUrl || null;
  } catch (err) {
    console.error('Failed to get attribute image from IndexedDB:', err);
    return null;
  }
}

/**
 * 一次性获取所有六维属性的自定义图标映射表 { [attrKey]: dataUrl }
 */
export async function getAllAttributeImages(): Promise<Record<string, string>> {
  try {
    const list = await db.rpg_attribute_images.toArray();
    const map: Record<string, string> = {};
    for (const item of list) {
      map[item.id] = item.dataUrl;
    }
    return map;
  } catch (err) {
    console.error('Failed to load attribute images from IndexedDB:', err);
    return {};
  }
}

/**
 * 保存六维属性自定义图标到 IndexedDB
 */
export async function saveAttributeImage(key: string, dataUrl: string): Promise<void> {
  try {
    await db.rpg_attribute_images.put({
      id: key,
      dataUrl,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save attribute image to IndexedDB:', err);
  }
}

/**
 * 从 IndexedDB 删除六维属性自定义图标
 */
export async function deleteAttributeImage(key: string): Promise<void> {
  try {
    await db.rpg_attribute_images.delete(key);
  } catch (err) {
    console.error('Failed to delete attribute image from IndexedDB:', err);
  }
}
