import { db } from '../storage/db';
import { GameRecord, GameStats } from './gameTypes';

const PRESET_GAMES: GameRecord[] = [
  {
    id: 'g_steam_2358720',
    title: '黑神话：悟空',
    originalTitle: 'Black Myth: Wukong',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg',
    platform: 'steam',
    status: 'playing',
    playtimeHours: 42.5,
    rating: 5,
    tags: ['动作RPG', '西游神话', '国风神作'],
    comment: '踏过大圣走过的路，重走西游！棍势与变身手感极佳。',
    source: 'steam',
    externalId: '2358720',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'g_steam_413150',
    title: '星露谷物语',
    originalTitle: 'Stardew Valley',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg',
    platform: 'steam',
    status: 'cleared',
    playtimeHours: 128,
    rating: 5,
    clearedDate: '2026.05.20',
    tags: ['农场模拟', '治愈像素', '种田'],
    comment: '爷爷的农场终于迎来了四支蜡烛点亮的神迹！治愈了一整年的疲惫。',
    source: 'steam',
    externalId: '413150',
    createdAt: Date.now() - 86400000 * 120,
    updatedAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'g_steam_1245620',
    title: '艾尔登法环',
    originalTitle: 'ELDEN RING',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    platform: 'steam',
    status: 'wishlist',
    playtimeHours: 0,
    tags: ['魂系', '开放世界', '年度最佳'],
    comment: '愿望单已就位，等长假来临开启交界地探索！',
    source: 'steam',
    externalId: '1245620',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'g_itunes_1529124401',
    title: '原神',
    originalTitle: 'Genshin Impact',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/bf/f4/70/bff47055-6b3a-590f-0402-23c89650b73c/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg',
    platform: 'mobile',
    status: 'playing',
    playtimeHours: 230,
    rating: 5,
    tags: ['开放世界', '冒险', '二次元'],
    comment: '提瓦特大陆的星空与日落永远看不够。',
    source: 'itunes',
    externalId: '1529124401',
    createdAt: Date.now() - 86400000 * 200,
    updatedAt: Date.now() - 86400000 * 2,
  },
];

/**
 * 加载所有游戏私藏卡带记录
 */
export async function loadAllGames(): Promise<GameRecord[]> {
  try {
    const list = await db.games.toArray();
    if (list.length === 0) {
      await db.games.bulkAdd(PRESET_GAMES);
      return PRESET_GAMES;
    }
    // 按最后更新时间倒序排序
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error('[GameStorage] 加载游戏记录失败:', err);
    return [];
  }
}

/**
 * 保存或新增游戏记录
 */
export async function saveGame(game: GameRecord): Promise<void> {
  try {
    const payload: GameRecord = {
      ...game,
      updatedAt: Date.now(),
    };
    await db.games.put(payload);
    // 派发全系统更新广播
    window.dispatchEvent(new CustomEvent('cloudfly_games_updated'));
  } catch (err) {
    console.error('[GameStorage] 保存游戏卡带失败:', err);
    throw err;
  }
}

/**
 * 删除游戏记录
 */
export async function deleteGame(id: string): Promise<void> {
  try {
    await db.games.delete(id);
    window.dispatchEvent(new CustomEvent('cloudfly_games_updated'));
  } catch (err) {
    console.error('[GameStorage] 删除游戏卡带失败:', err);
    throw err;
  }
}

/**
 * 依据 ID 读取单张游戏卡带
 */
export async function getGameById(id: string): Promise<GameRecord | undefined> {
  try {
    return await db.games.get(id);
  } catch (err) {
    console.error('[GameStorage] 获取游戏详情失败:', err);
    return undefined;
  }
}

/**
 * 统计全库游戏概览数据
 */
export function calculateGameStats(games: GameRecord[]): GameStats {
  return {
    totalCount: games.length,
    playingCount: games.filter((g) => g.status === 'playing').length,
    clearedCount: games.filter((g) => g.status === 'cleared').length,
    wishlistCount: games.filter((g) => g.status === 'wishlist').length,
    droppedCount: games.filter((g) => g.status === 'dropped').length,
    totalPlaytimeHours: Math.round(
      games.reduce((acc, curr) => acc + (curr.playtimeHours || 0), 0) * 10
    ) / 10,
  };
}
