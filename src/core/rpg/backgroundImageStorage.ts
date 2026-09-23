import { db } from '../storage/db';

export const DEFAULT_STAGE_BG_ID = 'stage_background';

/**
 * 从 IndexedDB 获取舞台自定义背景 Base64 图片
 */
export async function getCustomBackground(id: string = DEFAULT_STAGE_BG_ID): Promise<string | null> {
  try {
    const rec = await db.rpg_background_images.get(id);
    return rec?.dataUrl || null;
  } catch (err) {
    console.error('Failed to get background image from IndexedDB:', err);
    return null;
  }
}

/**
 * 保存舞台自定义背景到 IndexedDB
 */
export async function saveCustomBackground(dataUrl: string, id: string = DEFAULT_STAGE_BG_ID): Promise<void> {
  try {
    await db.rpg_background_images.put({
      id,
      dataUrl,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save background image to IndexedDB:', err);
  }
}

/**
 * 从 IndexedDB 删除舞台自定义背景
 */
export async function deleteCustomBackground(id: string = DEFAULT_STAGE_BG_ID): Promise<void> {
  try {
    await db.rpg_background_images.delete(id);
  } catch (err) {
    console.error('Failed to delete background image from IndexedDB:', err);
  }
}
