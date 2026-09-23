import { db, RPGDossierRecord } from '../storage/db';

const FALLBACK_KEY = 'cloudfly_rpg_dossier_data_v1';

export const DEFAULT_DOSSIER: RPGDossierRecord = {
  id: 'default',
  name: '旅行者',
  title: '初醒之人',
  zodiac: '双鱼座',
  mbti: 'INFP',
  gender: '保密',
  photoUrl: null, // 档案专属相片，存储在 IndexedDB 中，与主界面的用户自身立绘完全分离
  storyPages: [
    {
      id: 'story_init_1',
      pageIndex: 0,
      date: '2026.09.22',
      content: '初次翻开这本手账。我想在这里记录真实的自我、心境与成长轨迹。',
      updatedAt: Date.now(),
    },
  ],
  albumPhotos: [],
  updatedAt: Date.now(),
};

/**
 * 从 IndexedDB 读取所有个人档案数据（支持本地缓存双重降级）
 */
export async function loadDossierFromDB(): Promise<RPGDossierRecord> {
  // 1. 尝试从 IndexedDB 读取
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const record = await db.rpg_dossier.get('default');
    if (record) {
      return {
        ...DEFAULT_DOSSIER,
        ...record,
        storyPages:
          record.storyPages && record.storyPages.length > 0
            ? record.storyPages
            : DEFAULT_DOSSIER.storyPages,
      };
    }
  } catch (err) {
    console.warn('[IndexedDB] 读取个人档案失败，尝试降级缓存:', err);
  }

  // 2. 降级从 localStorage 读取
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_DOSSIER,
        ...parsed,
        storyPages:
          parsed.storyPages && parsed.storyPages.length > 0
            ? parsed.storyPages
            : DEFAULT_DOSSIER.storyPages,
      };
    }
  } catch (e) {
    console.warn('[Storage] 读取降级缓存失败:', e);
  }

  return DEFAULT_DOSSIER;
}

/**
 * 保存或更新个人档案数据（双写保障：IndexedDB + 降级缓存）
 */
export async function saveDossierToDB(
  partial: Partial<RPGDossierRecord>
): Promise<RPGDossierRecord> {
  let current: RPGDossierRecord;
  try {
    current = await loadDossierFromDB();
  } catch {
    current = DEFAULT_DOSSIER;
  }

  const updated: RPGDossierRecord = {
    ...current,
    ...partial,
    updatedAt: Date.now(),
  };

  // 1. 本地降级缓存（确保同步响应与容灾，剥离超大 Base64 避免溢出）
  try {
    const { photoUrl, albumPhotos, ...safeFallback } = updated;
    localStorage.setItem(
      FALLBACK_KEY,
      JSON.stringify({
        ...safeFallback,
        photoUrl: photoUrl && !photoUrl.startsWith('data:') ? photoUrl : null,
        albumPhotos: (albumPhotos || []).filter((p) => !p.startsWith('data:')),
      })
    );
  } catch (e) {
    console.warn('[Storage] 写入降级缓存失败:', e);
  }

  // 2. 异步持久化写入 IndexedDB
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    await db.rpg_dossier.put(updated);
  } catch (err) {
    console.warn('[IndexedDB] 保存个人档案至数据库异常，已由降级缓存接管:', err);
  }

  return updated;
}
