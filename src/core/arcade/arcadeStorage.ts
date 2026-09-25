import { db } from '../storage/db';
import { SWFGame } from './arcadeTypes';

const CARTRIDGE_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
const CARTRIDGE_EMOJIS = ['🎮', '👾', '🕹️', '⚔️', '🚀', '🐱', '⭐', '💎', '🔥', '🏆'];

// 内存运行时卡带库（免持久化写入 IndexedDB，避免动辄几十 MB 的二进制大文件撑爆本地磁盘与全量备份）
let inMemorySWFGames: SWFGame[] = [];

/**
 * 清理旧版可能遗留在 IndexedDB 中的超大 SWF 二进制数据，主动释放本地磁盘空间
 */
export async function cleanupLegacySWFStorage(): Promise<void> {
  try {
    if (db.isOpen() || (await db.open())) {
      const count = await db.swf_games.count();
      if (count > 0) {
        await db.swf_games.clear();
        console.log(`[Arcade] 已成功清理 IndexedDB 中残留的 ${count} 个 SWF 二进制缓存，彻底释放本地空间。`);
      }
    }
  } catch (err) {
    // 忽略异常
  }
}

export async function loadAllSWFGames(): Promise<SWFGame[]> {
  // 启动时触发一次静默旧数据释放
  cleanupLegacySWFStorage().catch(() => {});
  return [...inMemorySWFGames].sort(
    (a, b) => (b.lastPlayedAt || b.createdAt) - (a.lastPlayedAt || a.createdAt)
  );
}

export async function saveSWFGame(game: SWFGame): Promise<void> {
  const index = inMemorySWFGames.findIndex((g) => g.id === game.id);
  if (index >= 0) {
    inMemorySWFGames[index] = game;
  } else {
    inMemorySWFGames.push(game);
  }
}

export async function deleteSWFGame(id: string): Promise<void> {
  inMemorySWFGames = inMemorySWFGames.filter((g) => g.id !== id);
}

export async function updateGameLastPlayed(id: string): Promise<void> {
  const game = inMemorySWFGames.find((g) => g.id === id);
  if (game) {
    game.lastPlayedAt = Date.now();
  }
}

export async function importSWFFile(file: File): Promise<SWFGame> {
  const buffer = await file.arrayBuffer();
  const cleanTitle = file.name.replace(/\.swf$/i, '').trim() || '未命名Flash游戏';
  const randomColor = CARTRIDGE_COLORS[Math.floor(Math.random() * CARTRIDGE_COLORS.length)];
  const randomEmoji = CARTRIDGE_EMOJIS[Math.floor(Math.random() * CARTRIDGE_EMOJIS.length)];

  const newGame: SWFGame = {
    id: `swf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    fileSize: file.size,
    data: buffer,
    coverEmoji: randomEmoji,
    color: randomColor,
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
  };

  await saveSWFGame(newGame);
  return newGame;
}
