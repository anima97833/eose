import { db } from '../storage/db';

/**
 * 从 IndexedDB 获取单个技能的自定义大图 Base64
 */
export async function getSkillImage(id: string): Promise<string | null> {
  try {
    const rec = await db.rpg_skill_images.get(id);
    return rec?.dataUrl || null;
  } catch (err) {
    console.error('Failed to get skill image from IndexedDB:', err);
    return null;
  }
}

/**
 * 一次性获取所有技能的自定义图片映射表 { [skillId]: dataUrl }
 */
export async function getAllSkillImages(): Promise<Record<string, string>> {
  try {
    const list = await db.rpg_skill_images.toArray();
    const map: Record<string, string> = {};
    for (const item of list) {
      map[item.id] = item.dataUrl;
    }
    return map;
  } catch (err) {
    console.error('Failed to load skill images from IndexedDB:', err);
    return {};
  }
}

/**
 * 保存技能自定义大图到 IndexedDB
 */
export async function saveSkillImage(id: string, dataUrl: string): Promise<void> {
  try {
    await db.rpg_skill_images.put({
      id,
      dataUrl,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save skill image to IndexedDB:', err);
  }
}

/**
 * 从 IndexedDB 删除技能自定义大图
 */
export async function deleteSkillImage(id: string): Promise<void> {
  try {
    await db.rpg_skill_images.delete(id);
  } catch (err) {
    console.error('Failed to delete skill image from IndexedDB:', err);
  }
}
