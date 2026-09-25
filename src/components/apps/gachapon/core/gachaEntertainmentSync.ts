/**
 * 扭蛋机 · 娱乐消遣池同步引擎
 * 汇聚「书藏」待读/在读书目与「时光放映室」待上映/想看电影
 * 严格与心愿池、待办池隔离，支持娱乐双模自由切与命运大混抽
 */

import { loadAllBooks } from '../../../../core/books/bookStorage';
import { loadAllMovies } from '../../../../core/cinema/cinemaStorage';
import { loadAllGames } from '../../../../core/games/gameStorage';
import { PLATFORM_NAMES } from '../../../../core/games/gameTypes';
import { EntertainmentItem, CapsuleColorKey, EntertainmentSubFilter } from './gachaTypes';

const ENTERTAINMENT_CAPSULE_COLORS: CapsuleColorKey[] = [
  'purple',
  'yellow',
  'pink',
  'blue',
  'green',
  'orange',
];

/**
 * 幽默风趣的地球 Online 娱乐寄语生成器
 */
function getFlavorQuote(item: { type: 'book' | 'movie' | 'game'; isPlaying?: boolean; isReading?: boolean }): string {
  if (item.type === 'book') {
    if (item.isReading) {
      const quotes = [
        '【书灵传讯】书架上的进度条正在悄悄召唤你，今日理智值充沛，宜再翻10页！',
        '【羁绊加深】故事正到关键处，暂停的世界正在等待勇者重新开卷。',
        '【心流探险】静心翻开这一页，给繁忙的现实按下静音键。',
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    } else {
      const quotes = [
        '【开荒预警】新世界的封印尚未揭开，今日机缘已定，不妨翻开序章！',
        '【精神补给】躺在待读书架上的宝藏，正静静等候你的第一次翻阅。',
        '【命运翻牌】既然扭蛋机抽中了这本，说明你今天和它最有缘！',
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    }
  } else if (item.type === 'movie') {
    const quotes = [
      '【爆米花时刻】今晚的银幕机缘已锁定，灯光渐暗，准备好沉浸其中了吗？',
      '【光影穿梭】把想看变成正在看，拉上窗帘，享受属于你的2小时独立宇宙。',
      '【视听奇遇】待看清单里的心动瞬间，是时候在放映室点亮播放键了！',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  } else {
    // 游戏专属寄语
    if (item.isPlaying) {
      const quotes = [
        '【存档唤醒】异世界的存档点已就绪，今日精力充沛，宜再战一局！',
        '【心流对决】按动手柄，把烦恼抛在脑后，开启一段属于你的高燃冒险！',
        '【勇者召唤】正在游玩的史诗篇章，是时候去推进主线任务了！',
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    } else {
      const quotes = [
        '【拔草契机】在私藏卡带架上静候多时，今天正是开启新周目的最佳契机！',
        '【命运翻牌】既然扭蛋机替你选定了这款卡带，不如今天就插卡开荒！',
        '【心动首发】神作在前，何必犹豫？准备好迎接全新世界的震撼吧！',
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    }
  }
}

/**
 * 实时拉取书藏中的待读/在读书目、时光放映室中的想看电影 与 游戏私藏中的在玩/想玩卡带
 */
export async function fetchEntertainmentItems(
  filter: EntertainmentSubFilter = 'all'
): Promise<EntertainmentItem[]> {
  const result: EntertainmentItem[] = [];
  let colorIdx = 0;

  // 1. 同步书藏 (未读 unread + 在读 reading)
  if (filter === 'all' || filter === 'book') {
    try {
      const allBooks = await loadAllBooks();
      const activeBooks = (allBooks || []).filter(
        (b) => b.status === 'reading' || b.status === 'unread'
      );

      activeBooks.forEach((b) => {
        const isReading = b.status === 'reading';
        const progressPct =
          b.pageCount > 0 ? Math.round((b.currentPage / b.pageCount) * 100) : 0;

        result.push({
          id: `book_${b.id}`,
          originalId: b.id,
          type: 'book',
          typeLabel: isReading ? '📖 在读书目' : '📚 待读书目',
          title: b.title,
          subtitle: b.author ? `作者：${b.author}` : b.publisher || '书藏精选',
          coverUrl: b.coverUrl,
          progressLabel: isReading
            ? `在读 ${b.currentPage} / ${b.pageCount} 页 (${progressPct}%)`
            : `全书 ${b.pageCount} 页 · 尚未开卷`,
          flavorQuote: getFlavorQuote({ type: 'book', isReading }),
          colorKey: ENTERTAINMENT_CAPSULE_COLORS[colorIdx++ % ENTERTAINMENT_CAPSULE_COLORS.length],
          icon: isReading ? '📖' : '📚',
          createdAt: b.updatedAt ? new Date(b.updatedAt).getTime() : Date.now(),
        });
      });
    } catch (err) {
      console.warn('[GachaEntertainmentSync] 拉取书藏书目失败:', err);
    }
  }

  // 2. 同步放映室想看电影 (wishlist)
  if (filter === 'all' || filter === 'movie') {
    try {
      const allMovies = await loadAllMovies();
      const wishlistMovies = (allMovies || []).filter((m) => m.status === 'wishlist');

      wishlistMovies.forEach((m) => {
        result.push({
          id: `movie_${m.id}`,
          originalId: m.id,
          type: 'movie',
          typeLabel: '🍿 待看/待映电影',
          title: m.title,
          subtitle: m.year ? `${m.year}年上映 · ${m.originalTitle || ''}` : m.originalTitle || '放映室珍藏',
          coverUrl: m.posterUrl,
          progressLabel: m.runtimeMinutes ? `片长约 ${m.runtimeMinutes} 分钟` : '待上映 / 想看清单',
          flavorQuote: getFlavorQuote({ type: 'movie' }),
          colorKey: ENTERTAINMENT_CAPSULE_COLORS[colorIdx++ % ENTERTAINMENT_CAPSULE_COLORS.length],
          icon: '🎬',
          createdAt: m.createdAt || Date.now(),
        });
      });
    } catch (err) {
      console.warn('[GachaEntertainmentSync] 拉取放映室电影失败:', err);
    }
  }

  // 3. 同步游戏私藏卡带 (在玩 playing + 想玩 wishlist)
  if (filter === 'all' || filter === 'game') {
    try {
      const allGames = await loadAllGames();
      const activeGames = (allGames || []).filter(
        (g) => g.status === 'playing' || g.status === 'wishlist'
      );

      activeGames.forEach((g) => {
        const isPlaying = g.status === 'playing';
        const platformName = PLATFORM_NAMES[g.platform] || g.platform;
        const progressLabel = isPlaying
          ? (g.playtimeHours ? `已游玩 ${g.playtimeHours} 小时 · 正在探索` : '正在探索中')
          : '想玩愿望清单 · 待插卡开荒';

        result.push({
          id: `game_${g.id}`,
          originalId: g.id,
          type: 'game',
          typeLabel: isPlaying ? '🎮 在玩卡带' : '🌟 想玩卡带',
          title: g.title,
          subtitle: `${platformName} ${g.developer ? `· ${g.developer}` : ''}`,
          coverUrl: g.coverUrl,
          progressLabel,
          flavorQuote: getFlavorQuote({ type: 'game', isPlaying }),
          colorKey: ENTERTAINMENT_CAPSULE_COLORS[colorIdx++ % ENTERTAINMENT_CAPSULE_COLORS.length],
          icon: '🎮',
          createdAt: g.updatedAt ? new Date(g.updatedAt).getTime() : Date.now(),
        });
      });
    } catch (err) {
      console.warn('[GachaEntertainmentSync] 拉取游戏私藏卡带失败:', err);
    }
  }

  return result;
}
