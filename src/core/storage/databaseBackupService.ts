import { db } from './db';

export interface DatabaseTableStat {
  name: string;
  count: number;
  label?: string;
}

export interface DatabaseStats {
  totalRecords: number;
  tableCount: number;
  tables: DatabaseTableStat[];
  lastBackupDate?: string | null;
}

export interface FullBackupPayload {
  version: number;
  app: string;
  exportedAt: string;
  timestamp: number;
  tables: Record<string, any[]>;
  localStorage: Record<string, string>;
}

// 核心 LocalStorage 业务状态持久化键清单
export const BACKUP_LOCALSTORAGE_KEYS = [
  'cloudfly_user_rpg_profile_v1',
  'neumorphic_phone_dual_route_settings',
  'neumorphic_course_kanban_v1',
  'rpg_vault_transactions',
  'cloudfly_user_achievements_v1',
  'rpg_milestone_quests_v1',
  'cloudfly_user_relationship_data_v1',
  'neumorphic_phone_desktop_layout_v2',
  'neumorphic_phone_app_store_catalog',
  'neumorphic_phone_installed_custom_apps',
  'cloudfly_moments_custom_themes_v1',
  'cloudfly_rpg_dossier_data_v1',
  'cloudfly_moments_fallback_v1',
  'neumorphic_book_physical_locations_v1',
];

// 数据表人性化中文对照
export const TABLE_FRIENDLY_NAMES: Record<string, string> = {
  characters: '聊天人设卡',
  messages: '对话聊天记录',
  settings: '系统路由配置',
  memory_books: '过往手账记忆',
  pomodoro_sessions: '专注番茄时钟',
  pomodoro_tasks: '番茄修行任务',
  browser_history: '浏览器历史',
  browser_bookmarks: '网络收藏书签',
  browser_shortcuts: '桌面快捷方式',
  rpg_item_images: '物品图鉴大图',
  rpg_skill_images: '技能树奥义图',
  rpg_attribute_images: '六维雷达图标',
  rpg_class_images: '全职业卡大图',
  rpg_meal_records: '美食手账相册',
  rpg_dossier: '个人档案手账',
  moments_items: '碎碎念动态相册',
  moments_config: '朋友圈封面配置',
  memo_categories: '备忘分类簿',
  memo_chapters: '备忘便签小册',
  swf_games: '电玩小游戏藏库',
  movies: '放映室电影海报',
  poems: '诗阁熟背藏卷',
  books: '藏书阁实体书册',
  storyword_novels: '背词爽文小说',
  storyword_mistakes: '背词错题生词',
  storyword_sources: '爽文书源规则',
  rpg_life_stories: '岁月胶囊旅程卡',
  rpg_background_images: '主界面立绘与舞台背景',
  rpg_activity_banners: '活动看板背板',
  virtual_files: '离线笔记与虚拟文件',
};

const LAST_BACKUP_TIME_KEY = 'cloudfly_last_database_backup_time';

/**
 * 实时获取全量数据库统计信息
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  if (!db.isOpen()) {
    await db.open();
  }

  let totalRecords = 0;
  const tables: DatabaseTableStat[] = [];

  for (const table of db.tables) {
    try {
      const count = await table.count();
      totalRecords += count;
      tables.push({
        name: table.name,
        count,
        label: TABLE_FRIENDLY_NAMES[table.name] || table.name,
      });
    } catch (err) {
      console.warn(`[Stats] 读取表 ${table.name} 统计异常:`, err);
      tables.push({
        name: table.name,
        count: 0,
        label: TABLE_FRIENDLY_NAMES[table.name] || table.name,
      });
    }
  }

  // 按记录数由多到少排列
  tables.sort((a, b) => b.count - a.count);

  let lastBackupDate: string | null = null;
  try {
    const rawTime = localStorage.getItem(LAST_BACKUP_TIME_KEY);
    if (rawTime) {
      lastBackupDate = new Date(Number(rawTime)).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch {
    // ignore
  }

  return {
    totalRecords,
    tableCount: db.tables.length,
    tables,
    lastBackupDate,
  };
}

/**
 * 全量数据库导出：打包全部 IndexedDB 表与 LocalStorage
 */
export async function exportFullDatabase(): Promise<{
  filename: string;
  blob: Blob;
  totalRecords: number;
  tableCount: number;
}> {
  if (!db.isOpen()) {
    await db.open();
  }

  const tablesData: Record<string, any[]> = {};
  let totalRecords = 0;

  for (const table of db.tables) {
    try {
      const records = await table.toArray();
      tablesData[table.name] = records;
      totalRecords += records.length;
    } catch (err) {
      console.error(`[Export] 导出表 ${table.name} 失败:`, err);
      tablesData[table.name] = [];
    }
  }

  // 抓取关键 localStorage 配置
  const localStorageData: Record<string, string> = {};
  for (const key of BACKUP_LOCALSTORAGE_KEYS) {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) {
        localStorageData[key] = val;
      }
    } catch {
      // ignore
    }
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const payload: FullBackupPayload = {
    version: 1,
    app: 'CloudflyNeumorphicPhone',
    exportedAt: now.toISOString(),
    timestamp: now.getTime(),
    tables: tablesData,
    localStorage: localStorageData,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const filename = `cloudfly_phone_backup_${dateStr}.json`;

  try {
    localStorage.setItem(LAST_BACKUP_TIME_KEY, String(now.getTime()));
  } catch {
    // ignore
  }

  return {
    filename,
    blob,
    totalRecords,
    tableCount: db.tables.length,
  };
}

/**
 * 触发文件下载浏览器行为
 */
export function downloadBackupBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 解析并校验备份文件结构
 */
export function parseAndValidateBackup(rawJson: string): {
  valid: boolean;
  payload?: FullBackupPayload;
  error?: string;
  summary?: {
    tableCount: number;
    recordCount: number;
    exportedAt: string;
  };
} {
  try {
    const data = JSON.parse(rawJson);
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '文件不是有效的 JSON 数据' };
    }

    if (!data.tables || typeof data.tables !== 'object') {
      return { valid: false, error: '备份文件中未找到数据库表结构' };
    }

    let recordCount = 0;
    const tableKeys = Object.keys(data.tables);
    for (const key of tableKeys) {
      if (Array.isArray(data.tables[key])) {
        recordCount += data.tables[key].length;
      }
    }

    return {
      valid: true,
      payload: data as FullBackupPayload,
      summary: {
        tableCount: tableKeys.length,
        recordCount,
        exportedAt: data.exportedAt
          ? new Date(data.exportedAt).toLocaleString('zh-CN')
          : '未知时间',
      },
    };
  } catch (err: any) {
    return { valid: false, error: `解析 JSON 异常: ${err?.message || err}` };
  }
}

/**
 * 全量数据库导入：原子清空与回填所有表，恢复 LocalStorage
 */
export async function importFullDatabase(payload: FullBackupPayload): Promise<{
  success: boolean;
  restoredTables: number;
  restoredRecords: number;
}> {
  if (!db.isOpen()) {
    await db.open();
  }

  let restoredTables = 0;
  let restoredRecords = 0;

  // 1. 恢复 IndexedDB 各数据表
  for (const table of db.tables) {
    const rows = payload.tables?.[table.name];
    if (Array.isArray(rows)) {
      try {
        await table.clear();
        if (rows.length > 0) {
          await table.bulkPut(rows);
        }
        restoredTables++;
        restoredRecords += rows.length;
      } catch (err) {
        console.error(`[Import] 回填表 ${table.name} 异常:`, err);
      }
    }
  }

  // 2. 恢复 LocalStorage 状态
  if (payload.localStorage && typeof payload.localStorage === 'object') {
    for (const [key, val] of Object.entries(payload.localStorage)) {
      if (typeof val === 'string') {
        try {
          localStorage.setItem(key, val);
        } catch (e) {
          console.warn(`[Import] 恢复 localStorage ${key} 失败:`, e);
        }
      }
    }
  }

  return {
    success: true,
    restoredTables,
    restoredRecords,
  };
}
