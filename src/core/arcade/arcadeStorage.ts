import { db } from '../storage/db';
import { SWFGame } from './arcadeTypes';

const CARTRIDGE_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
const CARTRIDGE_EMOJIS = ['🎮', '👾', '🕹️', '⚔️', '🚀', '🐱', '⭐', '💎', '🔥', '🏆'];

export async function loadAllSWFGames(): Promise<SWFGame[]> {
  try {
    const list = await db.swf_games.toArray();
    return list.sort((a, b) => (b.lastPlayedAt || b.createdAt) - (a.lastPlayedAt || a.createdAt));
  } catch (err) {
    console.warn('[ArcadeDB] 读取游戏列表失败:', err);
    return [];
  }
}

export async function saveSWFGame(game: SWFGame): Promise<void> {
  try {
    await db.swf_games.put(game);
  } catch (err) {
    console.warn('[ArcadeDB] 保存游戏失败:', err);
  }
}

export async function deleteSWFGame(id: string): Promise<void> {
  try {
    await db.swf_games.delete(id);
  } catch (err) {
    console.warn('[ArcadeDB] 删除游戏失败:', err);
  }
}

export async function updateGameLastPlayed(id: string): Promise<void> {
  try {
    const game = await db.swf_games.get(id);
    if (game) {
      game.lastPlayedAt = Date.now();
      await db.swf_games.put(game);
    }
  } catch (err) {
    console.warn('[ArcadeDB] 更新游玩时间失败:', err);
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
