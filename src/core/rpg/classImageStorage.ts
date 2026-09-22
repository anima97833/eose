import { db } from '../storage/db';

/**
 * 从 IndexedDB 获取职业的自定义立绘/图标 Base64
 */
export async function getClassImage(id: string): Promise<string | null> {
  try {
    const rec = await db.rpg_class_images.get(id);
    return rec?.dataUrl || null;
  } catch (err) {
    console.error('Failed to get class image from IndexedDB:', err);
    return null;
  }
}

/**
 * 获取所有职业自定义立绘映射表 { [classId]: dataUrl }
 */
export async function getAllClassImages(): Promise<Record<string, string>> {
  try {
    const list = await db.rpg_class_images.toArray();
    const map: Record<string, string> = {};
    for (const item of list) {
      map[item.id] = item.dataUrl;
    }
    return map;
  } catch (err) {
    console.error('Failed to load class images from IndexedDB:', err);
    return {};
  }
}

/**
 * 保存职业自定义立绘到 IndexedDB
 */
export async function saveClassImage(id: string, dataUrl: string): Promise<void> {
  try {
    await db.rpg_class_images.put({
      id,
      dataUrl,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save class image to IndexedDB:', err);
  }
}

/**
 * 从 IndexedDB 删除职业自定义立绘
 */
export async function deleteClassImage(id: string): Promise<void> {
  try {
    await db.rpg_class_images.delete(id);
  } catch (err) {
    console.error('Failed to delete class image from IndexedDB:', err);
  }
}
