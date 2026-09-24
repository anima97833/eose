import { db } from './db';

/**
 * LocalStorage -> IndexedDB 自动平滑迁移器
 * 解决浏览器 LocalStorage 5MB 配额溢出问题
 * 将大体积、高频追加、历史记录型数据自动迁移至 IndexedDB (Dexie)
 */
export async function runLocalStorageMigration(): Promise<{
  migratedKeys: string[];
  freedBytesEstimate: number;
}> {
  if (typeof window === 'undefined') {
    return { migratedKeys: [], freedBytesEstimate: 0 };
  }

  const migratedKeys: string[] = [];
  let freedBytesEstimate = 0;

  try {
    if (!db.isOpen()) {
      await db.open();
    }

    // 1. 朋友圈 / 碎碎念自定义话题标签: cloudfly_moments_custom_themes_v1
    const rawMomentsThemes = localStorage.getItem('cloudfly_moments_custom_themes_v1');
    if (rawMomentsThemes) {
      try {
        const parsed = JSON.parse(rawMomentsThemes);
        const existing = await db.settings.get('cloudfly_moments_custom_themes_v1');
        if (!existing) {
          await db.settings.put({ key: 'cloudfly_moments_custom_themes_v1', data: parsed });
        }
        freedBytesEstimate += rawMomentsThemes.length * 2;
        localStorage.removeItem('cloudfly_moments_custom_themes_v1');
        migratedKeys.push('cloudfly_moments_custom_themes_v1');
      } catch (err) {
        console.warn('[Migration] 朋友圈话题迁移失败:', err);
      }
    }

    // 2. 心愿扭蛋机小纸条列表: gachapon_wishes_v1 / cloudfly_gachapon_wishes_v1
    const rawWishes = localStorage.getItem('gachapon_wishes_v1') || localStorage.getItem('cloudfly_gachapon_wishes_v1');
    if (rawWishes) {
      try {
        const parsed = JSON.parse(rawWishes);
        const existing = await db.settings.get('gachapon_wishes_v1');
        if (!existing && Array.isArray(parsed) && parsed.length > 0) {
          await db.settings.put({ key: 'gachapon_wishes_v1', data: parsed });
        }
        freedBytesEstimate += rawWishes.length * 2;
        localStorage.removeItem('gachapon_wishes_v1');
        localStorage.removeItem('cloudfly_gachapon_wishes_v1');
        migratedKeys.push('gachapon_wishes_v1');
      } catch (err) {
        console.warn('[Migration] 扭蛋机纸条迁移失败:', err);
      }
    }

    // 3. 答案之书手账翻牌历史: neumorphic_answers_book_history_v1
    const rawAnswers = localStorage.getItem('neumorphic_answers_book_history_v1');
    if (rawAnswers) {
      try {
        const parsed = JSON.parse(rawAnswers);
        const existing = await db.settings.get('neumorphic_answers_book_history_v1');
        if (!existing && Array.isArray(parsed) && parsed.length > 0) {
          await db.settings.put({ key: 'neumorphic_answers_book_history_v1', data: parsed });
        }
        freedBytesEstimate += rawAnswers.length * 2;
        localStorage.removeItem('neumorphic_answers_book_history_v1');
        migratedKeys.push('neumorphic_answers_book_history_v1');
      } catch (err) {
        console.warn('[Migration] 答案之书历史迁移失败:', err);
      }
    }

    // 4. 课程看板与任务流转: neumorphic_course_kanban_v1
    const rawKanban = localStorage.getItem('neumorphic_course_kanban_v1');
    if (rawKanban) {
      try {
        const parsed = JSON.parse(rawKanban);
        const existing = await db.settings.get('neumorphic_course_kanban_v1');
        if (!existing && Array.isArray(parsed) && parsed.length > 0) {
          await db.settings.put({ key: 'neumorphic_course_kanban_v1', data: parsed });
        }
        freedBytesEstimate += rawKanban.length * 2;
        localStorage.removeItem('neumorphic_course_kanban_v1');
        migratedKeys.push('neumorphic_course_kanban_v1');
      } catch (err) {
        console.warn('[Migration] 课程看板迁移失败:', err);
      }
    }

    // 5. 看板每日心得与反思笔记: neumorphic_course_custom_reflections_v1
    const rawReflections = localStorage.getItem('neumorphic_course_custom_reflections_v1');
    if (rawReflections) {
      try {
        const parsed = JSON.parse(rawReflections);
        const existing = await db.settings.get('neumorphic_course_custom_reflections_v1');
        if (!existing && Array.isArray(parsed) && parsed.length > 0) {
          await db.settings.put({ key: 'neumorphic_course_custom_reflections_v1', data: parsed });
        }
        freedBytesEstimate += rawReflections.length * 2;
        localStorage.removeItem('neumorphic_course_custom_reflections_v1');
        migratedKeys.push('neumorphic_course_custom_reflections_v1');
      } catch (err) {
        console.warn('[Migration] 看板反思笔记迁移失败:', err);
      }
    }

    // 6. 聊天记录迁移 (针对历史在 localStorage 中的角色对话)
    const allKeys = Object.keys(localStorage);
    for (const k of allKeys) {
      if (k.startsWith('neumorphic_phone_chat_')) {
        const rawChat = localStorage.getItem(k);
        if (rawChat) {
          try {
            const parsed = JSON.parse(rawChat);
            const existing = await db.settings.get(k);
            if (!existing && Array.isArray(parsed) && parsed.length > 0) {
              await db.settings.put({ key: k, data: parsed });
            }
            freedBytesEstimate += rawChat.length * 2;
            localStorage.removeItem(k);
            migratedKeys.push(k);
          } catch {
            // ignore
          }
        }
      }
    }

    if (migratedKeys.length > 0) {
      console.log(`[Storage] 成功从 LocalStorage 迁移 ${migratedKeys.length} 个键至 IndexedDB，释放约 ${(freedBytesEstimate / 1024).toFixed(1)} KB`);
    }
  } catch (err) {
    console.error('[Storage] 数据迁移异常:', err);
  }

  return { migratedKeys, freedBytesEstimate };
}
