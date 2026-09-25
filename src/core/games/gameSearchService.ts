import { GameSearchResult, GamePlatform } from './gameTypes';

/**
 * 经典高匹配游戏离线/保底字典
 * 涵盖国内外现象级端游、独立神作及主流大热手游（含如鸢、恋与深空、原神等）
 * 无论处于弱网、离线还是 API 限制环境，均可秒级响应精准匹配
 */
const POPULAR_OFFLINE_GAMES: GameSearchResult[] = [
  // 现象级端游 / 3A / 独立神作
  {
    id: 'steam_2358720',
    title: '黑神话：悟空',
    originalTitle: 'Black Myth: Wukong',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg',
    platform: 'steam',
    source: 'steam',
    releaseYear: 2024,
    developer: '游戏科学 (Game Science)',
    genre: '动作RPG / 西游神话',
  },
  {
    id: 'steam_413150',
    title: '星露谷物语',
    originalTitle: 'Stardew Valley',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg',
    platform: 'steam',
    source: 'steam',
    releaseYear: 2016,
    developer: 'ConcernedApe',
    genre: '农场模拟 / 像素治愈',
  },
  {
    id: 'steam_1245620',
    title: '艾尔登法环',
    originalTitle: 'ELDEN RING',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    platform: 'steam',
    source: 'steam',
    releaseYear: 2022,
    developer: 'FromSoftware Inc.',
    genre: '开放世界 / 动作RPG',
  },
  {
    id: 'steam_1145360',
    title: '哈迪斯',
    originalTitle: 'Hades',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg',
    platform: 'steam',
    source: 'steam',
    releaseYear: 2020,
    developer: 'Supergiant Games',
    genre: 'Rogue-like / 动作割草',
  },
  {
    id: 'steam_1145350',
    title: '哈迪斯 2',
    originalTitle: 'Hades II',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg',
    platform: 'steam',
    source: 'steam',
    releaseYear: 2024,
    developer: 'Supergiant Games',
    genre: 'Rogue-like / 巫术神话',
  },
  {
    id: 'steam_1086940',
    title: '博德之门3',
    originalTitle: "Baldur's Gate 3",
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
    platform: 'steam',
    source: 'steam',
    releaseYear: 2023,
    developer: 'Larian Studios',
    genre: 'CRPG / 奇幻博弈',
  },
  {
    id: 'steam_1091500',
    title: '赛博朋克 2077',
    originalTitle: 'Cyberpunk 2077',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    platform: 'steam',
    source: 'steam',
    releaseYear: 2020,
    developer: 'CD PROJEKT RED',
    genre: '科幻未来 / 开放世界',
  },
  {
    id: 'steam_367520',
    title: '空洞骑士',
    originalTitle: 'Hollow Knight',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg',
    platform: 'steam',
    source: 'steam',
    releaseYear: 2017,
    developer: 'Team Cherry',
    genre: '银河恶魔城 / 2D横版',
  },
  {
    id: 'steam_814380',
    title: '只狼：影逝二度',
    originalTitle: 'Sekiro: Shadows Die Twice',
    coverUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900_2x.jpg',
    bannerUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg',
    platform: 'steam',
    source: 'steam',
    releaseYear: 2019,
    developer: 'FromSoftware Inc.',
    genre: '动作 / 拼刀忍者',
  },

  // 大热主流手游（覆盖二次元、国风、沉浸恋爱与竞技）
  {
    id: 'itunes_6451457891',
    title: '如鸢',
    originalTitle: '代号鸢 / Ashfall',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/4e/be/9a/4ebe9abf-b98a-a430-891a-7b2ef47881c1/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2024,
    developer: '灵犀互娱 (Lingxi Games)',
    genre: '沉浸式剧情卡牌 / 汉末谋略',
  },
  {
    id: 'itunes_1529124401',
    title: '原神',
    originalTitle: 'Genshin Impact',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/bf/f4/70/bff47055-6b3a-590f-0402-23c89650b73c/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2020,
    developer: 'miHoYo 米哈游',
    genre: '开放世界冒险 / 二次元',
  },
  {
    id: 'itunes_1588363847',
    title: '崩坏：星穹铁道',
    originalTitle: 'Honkai: Star Rail',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/91/92/ff/9192ffcf-bf5c-a111-9a74-b1527ef94754/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2023,
    developer: 'miHoYo 米哈游',
    genre: '银河回合制RPG',
  },
  {
    id: 'itunes_1606356401',
    title: '绝区零',
    originalTitle: 'Zenless Zone Zero',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/31/5e/ca/315eca86-27a3-57c5-55ff-1f5169a840e6/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2024,
    developer: 'miHoYo 米哈游',
    genre: '潮酷都市动作',
  },
  {
    id: 'itunes_1594957648',
    title: '恋与深空',
    originalTitle: 'Love and Deepspace',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/96/63/cf/9663cfbe-fb68-8097-bfbb-41fe33ebce25/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2024,
    developer: 'Infold Games 叠纸游戏',
    genre: '3D沉浸恋爱互动',
  },
  {
    id: 'itunes_1454659191',
    title: '明日方舟',
    originalTitle: 'Arknights',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/05/cf/43/05cf431e-450f-21e3-2e21-026857185012/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2019,
    developer: 'Hypergryph 鹰角网络',
    genre: '二次元战术策略塔防',
  },
  {
    id: 'itunes_989673964',
    title: '王者荣耀',
    originalTitle: 'Honor of Kings',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/21/df/b2/21dfb2c8-fb62-c847-97d8-3a9d7bb3d940/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2015,
    developer: '腾讯天美工作室群',
    genre: 'MOBA 团队竞技',
  },
  {
    id: 'itunes_1435447099',
    title: '和平精英',
    originalTitle: 'Game for Peace',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/7e/e7/8a/7ee78a57-0a4a-736f-e3c3-61a7a40b9389/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2019,
    developer: '腾讯光子工作室群',
    genre: '反恐射击军事竞赛',
  },
  {
    id: 'itunes_1564755146',
    title: '金铲铲之战',
    originalTitle: 'TFT Mobile CN',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bf/18/8f/bf188fb8-8120-d383-79d8-8c59f2ff2ad2/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2021,
    developer: 'Riot Games / 腾讯游戏',
    genre: '自动走棋策略对决',
  },
  {
    id: 'itunes_1669280459',
    title: '鸣潮',
    originalTitle: 'Wuthering Waves',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/71/39/c1/7139c18f-3665-24b5-fb27-6f81c9676766/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2024,
    developer: 'Kuro Games 库洛游戏',
    genre: '开放世界动作RPG',
  },
  {
    id: 'itunes_1640523282',
    title: '重返未来：1999',
    originalTitle: 'Reverse: 1999',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/44/7f/0d/447f0da0-73f4-3d96-c116-24e5d8b84bc5/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
    platform: 'mobile',
    source: 'itunes',
    releaseYear: 2023,
    developer: 'Bluepoch 深蓝互动',
    genre: '复古神秘学策略RPG',
  },
];

/**
 * 检索 Steam 商店游戏 (通过本地 Vite proxy 优先代理，免 CORS 限制)
 */
async function searchSteamStore(query: string): Promise<GameSearchResult[]> {
  try {
    const rawTarget = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=schinese&cc=CN`;
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(rawTarget)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    let res: Response;
    try {
      res = await fetch(proxyUrl, { signal: controller.signal });
    } catch {
      // 代理失败时退回直接尝试
      res = await fetch(rawTarget, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!res || !res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.items)) return [];

    return data.items.slice(0, 6).map((item: any) => ({
      id: `steam_${item.id}`,
      title: item.name,
      coverUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/library_600x900_2x.jpg`,
      bannerUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`,
      platform: 'steam' as GamePlatform,
      source: 'steam' as const,
      genre: 'Steam 游戏',
    }));
  } catch {
    // 捕获所有异常静默兜底，不中断整个检索流程
    return [];
  }
}

/**
 * 浏览器端通用 JSONP 请求器 (免 CORS 拦截)
 */
function fetchJsonp<T>(url: string, callbackParam = 'callback', timeoutMs = 2500): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      return reject(new Error('Document not available'));
    }

    const callbackName = `__jsonp_itunes_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement('script');
    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}${callbackParam}=${callbackName}`;
    script.async = true;

    let timer: any = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete (window as any)[callbackName];
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout'));
    }, timeoutMs);

    (window as any)[callbackName] = (data: T) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP script error'));
    };

    document.head.appendChild(script);
  });
}

/**
 * 检索 Apple iTunes 移动端手游
 * 采用 JSONP 首选以规避浏览器跨域限制，配以极短超时的静默降级
 */
async function searchItunesMobile(query: string): Promise<GameSearchResult[]> {
  try {
    const rawUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&country=cn&limit=6`;
    
    // 首选 JSONP 方式在浏览器端运行
    const data: any = await fetchJsonp(rawUrl, 'callback', 2500);
    if (!data || !Array.isArray(data.results)) return [];

    return data.results.map((item: any) => {
      const artwork = (item.artworkUrl512 || item.artworkUrl100 || '').replace('100x100bb', '512x512bb');
      const screenshot = Array.isArray(item.screenshotUrls) && item.screenshotUrls.length > 0
        ? item.screenshotUrls[0]
        : undefined;

      return {
        id: `itunes_${item.trackId}`,
        title: item.trackName,
        coverUrl: artwork,
        bannerUrl: screenshot,
        platform: 'mobile' as GamePlatform,
        source: 'itunes' as const,
        developer: item.sellerName,
        genre: item.primaryGenreName || '移动游戏',
      };
    });
  } catch {
    // 捕获所有异常静默兜底，不中断整个检索流程
    return [];
  }
}

/**
 * 核心对外双引擎检索服务接口
 * 保证 100% 优雅兜底，永远返回可用卡带结果
 */
export async function searchGames(
  query: string,
  engine: 'all' | 'steam' | 'mobile' = 'all'
): Promise<GameSearchResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // 并行调用双引擎检索
  const tasks: Promise<GameSearchResult[]>[] = [];
  if (engine === 'all' || engine === 'steam') {
    tasks.push(searchSteamStore(trimmed));
  }
  if (engine === 'all' || engine === 'mobile') {
    tasks.push(searchItunesMobile(trimmed));
  }

  const results = await Promise.allSettled(tasks);
  const combined: GameSearchResult[] = [];

  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      combined.push(...r.value);
    }
  }

  // 融合本地热门高匹配项（若在线接口因网络环境未命中时自动精准命中）
  const localMatched = POPULAR_OFFLINE_GAMES.filter((g) => {
    if (engine !== 'all') {
      if (engine === 'steam' && g.platform !== 'steam') return false;
      if (engine === 'mobile' && g.platform !== 'mobile') return false;
    }
    const t = g.title.toLowerCase();
    const ot = (g.originalTitle || '').toLowerCase();
    const dev = (g.developer || '').toLowerCase();
    return t.includes(trimmed) || ot.includes(trimmed) || dev.includes(trimmed);
  });

  // 去重融合
  const seenTitles = new Set<string>();
  const finalResults: GameSearchResult[] = [];

  for (const item of [...combined, ...localMatched]) {
    const key = item.title.trim().toLowerCase();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      finalResults.push(item);
    }
  }

  // 如果仍未匹配到任何结果，提供一条优雅的“智能即时创建”预置项，避免用户空等或阻塞
  if (finalResults.length === 0) {
    finalResults.push({
      id: `quick_${Date.now()}`,
      title: query.trim(),
      platform: engine === 'mobile' ? 'mobile' : 'steam',
      source: engine === 'mobile' ? 'itunes' : 'steam',
      developer: '待补充开发商',
      genre: engine === 'mobile' ? '移动手游' : 'PC / 端游',
    });
  }

  return finalResults.slice(0, 8);
}
