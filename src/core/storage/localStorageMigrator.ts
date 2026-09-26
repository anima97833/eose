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

export interface SlimmingResult {
  migratedCount: number;
  freedBytes: number;
  freedFormatted: string;
  beforeBytes: number;
  afterBytes: number;
  migratedKeys: string[];
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getLocalStorageTotalBytes(): number {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const val = localStorage.getItem(key) || '';
    total += (key.length + val.length) * 2;
  }
  return total;
}

/**
 * 一键瘦身核心执行器
 * 功效：当 LocalStorage 空间占用偏高或爆满时，
 * 安全地将历史记录、富文本备忘、多媒体缓存等大体积数据无损迁移至 IndexedDB (Dexie)，
 * 释放 LocalStorage 5MB 配额空间，消除 QuotaExceededError 隐患。
 */
export async function runLocalStorageSlimming(): Promise<SlimmingResult> {
  if (typeof window === 'undefined') {
    return {
      migratedCount: 0,
      freedBytes: 0,
      freedFormatted: '0 B',
      beforeBytes: 0,
      afterBytes: 0,
      migratedKeys: [],
    };
  }

  if (!db.isOpen()) {
    await db.open();
  }

  const beforeBytes = getLocalStorageTotalBytes();
  const migratedKeys: string[] = [];

  // 1. 先跑一遍基础版本迁移（朋友圈话题、扭蛋、答案之书、看板等）
  await runLocalStorageMigration();

  // 核心白名单：不予从 LocalStorage 清理的极轻量系统基础配置（通常几字节到几十字节）
  const PRESERVED_KEYS = new Set([
    'cloudfly_theme_mode',
    'theme',
    'sound_enabled',
    'haptics_enabled',
    'desktop_wallpapers_selected',
    'active_app_id',
    'dock_app_ids',
  ]);

  const allKeys = Object.keys(localStorage);

  for (const key of allKeys) {
    if (PRESERVED_KEYS.has(key)) continue;

    const raw = localStorage.getItem(key);
    if (!raw) continue;

    const rawLen = raw.length;

    // A. 聊天记录: neumorphic_phone_chat_*
    if (key.startsWith('neumorphic_phone_chat_')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 完整数据存档至 IndexedDB
          await db.settings.put({ key: key, data: parsed });
          // LocalStorage 仅保留最新 3 条极简缓冲，或清空
          if (parsed.length > 3) {
            localStorage.setItem(key, JSON.stringify(parsed.slice(-3)));
          } else {
            localStorage.removeItem(key);
          }
          migratedKeys.push(key);
        }
      } catch {
        // 非 JSON 则直接转入 IndexedDB
        await db.settings.put({ key: key, data: raw });
        localStorage.removeItem(key);
        migratedKeys.push(key);
      }
      continue;
    }

    // B. AI 助手对话历史: starry_assistant_messages_*
    if (key.startsWith('starry_assistant_messages_') || key === 'starry_assistant_messages_v1') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await db.settings.put({ key: key, data: parsed });
          if (parsed.length > 3) {
            localStorage.setItem(key, JSON.stringify(parsed.slice(-3)));
          } else {
            localStorage.removeItem(key);
          }
          migratedKeys.push(key);
        }
      } catch {
        await db.settings.put({ key: key, data: raw });
        localStorage.removeItem(key);
        migratedKeys.push(key);
      }
      continue;
    }

    // C. 朋友圈、备忘手账、角色立绘、游戏档案等结构化数据
    const isTargetDataKey =
      key.includes('moments_items') ||
      key.includes('memo_chapters') ||
      key.includes('rpg_dossier') ||
      key.includes('dossier_history') ||
      key.includes('answers_book') ||
      key.includes('gachapon_wishes') ||
      key.includes('course_kanban') ||
      key.includes('course_custom') ||
      key.includes('storyword_progress') ||
      key.includes('photo_album_cache');

    if (isTargetDataKey) {
      try {
        const parsed = JSON.parse(raw);
        await db.settings.put({ key: key, data: parsed });
      } catch {
        await db.settings.put({ key: key, data: raw });
      }
      localStorage.removeItem(key);
      migratedKeys.push(key);
      continue;
    }

    // D. 任意大体积键 (字符长度超过 1000 即约 >= 2KB)
    if (rawLen > 1000) {
      try {
        const parsed = JSON.parse(raw);
        await db.settings.put({ key: key, data: parsed });
      } catch {
        await db.settings.put({ key: key, data: raw });
      }
      localStorage.removeItem(key);
      migratedKeys.push(key);
      continue;
    }

    // E. 历史/缓存/草稿前缀
    if (
      key.startsWith('cache_') ||
      key.startsWith('history_') ||
      key.startsWith('draft_') ||
      key.startsWith('temp_') ||
      key.startsWith('logs_')
    ) {
      try {
        const parsed = JSON.parse(raw);
        await db.settings.put({ key: key, data: parsed });
      } catch {
        await db.settings.put({ key: key, data: raw });
      }
      localStorage.removeItem(key);
      migratedKeys.push(key);
    }
  }

  const afterBytes = getLocalStorageTotalBytes();
  const freedBytes = Math.max(0, beforeBytes - afterBytes);

  return {
    migratedCount: migratedKeys.length,
    freedBytes,
    freedFormatted: formatBytes(freedBytes),
    beforeBytes,
    afterBytes,
    migratedKeys,
  };
}

