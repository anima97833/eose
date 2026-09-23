import { db } from '../storage/db';

export const DEFAULT_AVATAR_ID = 'character_avatar';

/**
 * 从 IndexedDB 获取主界面角色自定义立绘 (Base64 或 Blob Data)
 * 绝对不经过 localStorage，彻底消除移动端 5MB 配额溢出限制
 */
export async function getCustomAvatar(id: string = DEFAULT_AVATAR_ID): Promise<string | null> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const rec = await db.rpg_background_images.get(id);
    return rec?.dataUrl || null;
  } catch (err) {
    console.error('[IndexedDB] 获取角色立绘失败:', err);
    return null;
  }
}

/**
 * 保存主界面角色自定义立绘到 IndexedDB
 */
export async function saveCustomAvatar(dataUrl: string, id: string = DEFAULT_AVATAR_ID): Promise<void> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    await db.rpg_background_images.put({
      id,
      dataUrl,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('[IndexedDB] 保存角色立绘失败:', err);
    throw err;
  }
}

/**
 * 从 IndexedDB 删除主界面角色自定义立绘（恢复预设状态）
 */
export async function deleteCustomAvatar(id: string = DEFAULT_AVATAR_ID): Promise<void> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    await db.rpg_background_images.delete(id);
  } catch (err) {
    console.error('[IndexedDB] 删除角色立绘失败:', err);
    throw err;
  }
}
