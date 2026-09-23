import { getBeijingDateString, loadRPGProfile } from '../rpg/rpgStorage';

export interface HoroscopeData {
  title: string;          // 例如 "双鱼座"
  signSymbol: string;     // 例如 "♓"
  time: string;           // 日期说明
  shortComment: string;   // 一句话短评 (如 "保持情绪稳定")
  fortuneStar: number;    // 综合星级 1~5
  index: {
    all: string;          // "67%"
    work: string;         // "85%"
    love: string;         // "69%"
    money: string;        // "33%"
    health: string;       // "52%"
  };
  todo: {
    yi: string;           // "宜整理衣柜"
    ji: string;           // "忌暴躁焦虑"
  };
  luckyColor: string;     // "橘黄"
  luckyNumber: string;    // "27"
  luckyConstellation: string; // "金牛座"
  fortuneText: {
    all: string;
    work: string;
    love: string;
    money: string;
    health: string;
  };
  source: 'api' | 'fallback';
}

// 12 星座配置映射表
export const ZODIAC_META: Record<
  string,
  { en: string; symbol: string; element: string; dateRange: string }
> = {
  白羊座: { en: 'aries', symbol: '♈', element: '火象', dateRange: '3.21-4.19' },
  金牛座: { en: 'taurus', symbol: '♉', element: '土象', dateRange: '4.20-5.20' },
  双子座: { en: 'gemini', symbol: '♊', element: '风象', dateRange: '5.21-6.21' },
  巨蟹座: { en: 'cancer', symbol: '♋', element: '水象', dateRange: '6.22-7.22' },
  狮子座: { en: 'leo', symbol: '♌', element: '火象', dateRange: '7.23-8.22' },
  处女座: { en: 'virgo', symbol: '♍', element: '土象', dateRange: '8.23-9.22' },
  天秤座: { en: 'libra', symbol: '♎', element: '风象', dateRange: '9.23-10.23' },
  天蝎座: { en: 'scorpio', symbol: '♏', element: '水象', dateRange: '10.24-11.22' },
  射手座: { en: 'sagittarius', symbol: '♐', element: '火象', dateRange: '11.23-12.21' },
  摩羯座: { en: 'capricorn', symbol: '♑', element: '土象', dateRange: '12.22-1.19' },
  水瓶座: { en: 'aquarius', symbol: '♒', element: '风象', dateRange: '1.20-2.18' },
  双鱼座: { en: 'pisces', symbol: '♓', element: '水象', dateRange: '2.19-3.20' },
};

const CACHE_KEY_PREFIX = 'cloudfly_horoscope_cache_';

/**
 * 获取当前用户的星座名称（默认从 RPGProfile 读取，默认双鱼座）
 */
export function getUserZodiacName(): string {
  try {
    const profile = loadRPGProfile();
    if (profile && profile.zodiac && ZODIAC_META[profile.zodiac]) {
      return profile.zodiac;
    }
  } catch (err) {
    console.warn('Failed to load user zodiac', err);
  }
  return '双鱼座';
}

/**
 * 字符串简单哈希（用于确定性离线算法）
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 本地确定性占星算法（有网调API，无网/弱网 100% 优雅兜底）
 */
function generateDeterministicHoroscope(zodiacName: string, dateStr: string): HoroscopeData {
  const meta = ZODIAC_META[zodiacName] || ZODIAC_META['双鱼座'];
  const seed = hashString(`${dateStr}_${zodiacName}`);

  const comments = [
    '灵感如泉涌，适合专注创作',
    '保持情绪平稳，顺其自然即可',
    '宜放慢步调，小确幸正在路上',
    '人际磁场和谐，容易获得认可',
    '思路清晰明朗，行动力破表',
    '保持好奇心，将邂逅意外惊喜',
    '静心沉淀自我，能量正在积蓄',
    '沟通顺畅无阻，适合推进计划',
  ];

  const yiList = ['整理桌面', '喝杯温茶', '早睡早起', '向外远眺', '记录灵感', '散步放松', '给花浇水'];
  const jiList = ['过度焦虑', '盲目跟风', '熬夜刷屏', '情绪内耗', '仓促决断', '暴饮暴食', '自我否定'];
  const colors = ['晨光黄', '天青蓝', '抹茶绿', '落日橙', '薄荷青', '雾霾蓝', '樱花粉'];
  const zodiacKeys = Object.keys(ZODIAC_META);

  const star = 3 + (seed % 3); // 3 ~ 5 星
  const allPercent = 65 + (seed % 30);
  const workPercent = 60 + ((seed >> 2) % 35);
  const lovePercent = 60 + ((seed >> 3) % 35);
  const moneyPercent = 55 + ((seed >> 4) % 40);
  const healthPercent = 70 + ((seed >> 5) % 25);

  const comment = comments[seed % comments.length];
  const yi = yiList[(seed >> 1) % yiList.length];
  const ji = jiList[(seed >> 2) % jiList.length];
  const color = colors[(seed >> 3) % colors.length];
  const luckyNum = ((seed % 88) + 1).toString();
  const luckyZodiac = zodiacKeys[(seed >> 4) % zodiacKeys.length];

  return {
    title: zodiacName,
    signSymbol: meta.symbol,
    time: dateStr,
    shortComment: comment,
    fortuneStar: star,
    index: {
      all: `${allPercent}%`,
      work: `${workPercent}%`,
      love: `${lovePercent}%`,
      money: `${moneyPercent}%`,
      health: `${healthPercent}%`,
    },
    todo: {
      yi: `宜 · ${yi}`,
      ji: `忌 · ${ji}`,
    },
    luckyColor: color,
    luckyNumber: luckyNum,
    luckyConstellation: luckyZodiac,
    fortuneText: {
      all: `今日整体运势平稳顺畅，节奏舒缓而充实。你在日常互动中展现出温暖且包容的气场，容易收获善意的回馈。适合踏实行事，无需过多顾虑。`,
      work: `思维活跃，处理琐事轻车熟路。适合将复杂任务拆解为小目标逐一击破，能维持极佳的工作心流。`,
      love: `情绪细腻温和，与身边人相处融洽自得。一句微小的问候或一句走心的夸赞，便能点亮彼此一天的好心情。`,
      money: `收支处于健康平衡期，适宜制定理性消费规划，避免冲动购置多余闲置物品。`,
      health: `精神状态良好，建议定时起身伸展四肢、补充充足水分，让身心随时保持充沛活力。`,
    },
    source: 'fallback',
  };
}

/**
 * 获取今日运势（双轨制：优先读取当日缓存 / 尝试调用免Key真实API / 失败自动算法兜底）
 */
export async function getTodayHoroscope(zodiacName?: string): Promise<HoroscopeData> {
  const currentZodiac = zodiacName || getUserZodiacName();
  const today = getBeijingDateString();
  const cacheKey = `${CACHE_KEY_PREFIX}${today}_${currentZodiac}`;

  // 1. 优先读取今日缓存
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed: HoroscopeData = JSON.parse(cached);
      if (parsed && parsed.title === currentZodiac) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read horoscope cache', err);
  }

  const meta = ZODIAC_META[currentZodiac] || ZODIAC_META['双鱼座'];

  // 2. 尝试调用真实免费开放 API (带 2.5 秒超时保护)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://v2.xxapi.cn/api/horoscope?type=${meta.en}&time=today`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const res = await response.json();
      if (res && res.code === 200 && res.data) {
        const d = res.data;
        const apiData: HoroscopeData = {
          title: currentZodiac,
          signSymbol: meta.symbol,
          time: d.time || today,
          shortComment: d.shortcomment || '保持情绪稳定',
          fortuneStar: Math.min(5, Math.max(1, d.fortune?.all || 4)),
          index: {
            all: d.index?.all || '70%',
            work: d.index?.work || '75%',
            love: d.index?.love || '65%',
            money: d.index?.money || '60%',
            health: d.index?.health || '80%',
          },
          todo: {
            yi: d.todo?.yi ? `宜 · ${d.todo.yi.replace(/^宜/, '')}` : '宜 · 专注当下',
            ji: d.todo?.ji ? `忌 · ${d.todo.ji.replace(/^忌/, '')}` : '忌 · 情绪内耗',
          },
          luckyColor: d.luckycolor || '暖橙色',
          luckyNumber: d.luckynumber ? String(d.luckynumber) : '7',
          luckyConstellation: d.luckyconstellation || '金牛座',
          fortuneText: {
            all: d.fortunetext?.all || '今日整体运势平稳顺畅，保持平和心境即可收获圆满。',
            work: d.fortunetext?.work || '行动力与条理性俱佳，按部就班便能高效达成既定目标。',
            love: d.fortunetext?.love || '人际互动真挚自然，温和的态度能让相处倍感舒适惬意。',
            money: d.fortunetext?.money || '财运稳健有序，宜理性打理日常开销，避免冲动盲从。',
            health: d.fortunetext?.health || '体力与元气充沛，适度舒展肩颈、保持规律补水。',
          },
          source: 'api',
        };

        // 缓存当日结果
        try {
          localStorage.setItem(cacheKey, JSON.stringify(apiData));
        } catch {
          // ignore
        }

        return apiData;
      }
    }
  } catch (err) {
    console.info('[Horoscope] API 暂时不可达，启动本地确定性占星算法无缝兜底:', err);
  }

  // 3. 自动降级为本地确定性占星算法
  const fallbackData = generateDeterministicHoroscope(currentZodiac, today);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(fallbackData));
  } catch {
    // ignore
  }

  return fallbackData;
}
