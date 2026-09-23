// 真声流媒体电台服务
// 聚合 国内官方广播、华语流行电台、SomaFM 高保真流、Radio Browser 全球开源 API

export interface RadioStation {
  id: string;
  name: string;
  frequency: string; // 模拟 FM 频率，如 "FM 97.4"
  freqMhz: number;   // 频率数值，用于在调谐刻度盘上精准定位游标（87.5 ~ 108.0）
  category: 'cpop' | 'cnr' | 'chill' | 'lofi' | 'jazz' | 'classic' | 'online';
  categoryLabel: string;
  streamUrl: string;
  backupStreamUrl?: string;
  description: string;
  coverUrl?: string;
  bitrate?: string;
  isOnlineSearch?: boolean;
}

/**
 * 精选高可靠直链电台池（覆盖国内央广、华语流行、复古蒸汽波与治愈慢调）
 */
export const PRESET_STATIONS: RadioStation[] = [
  // 1. 国内官方与华语精选
  {
    id: 'cnr_voice_china',
    name: 'CNR-1 中国之声 · 国家广播',
    frequency: 'FM 106.1',
    freqMhz: 106.1,
    category: 'cnr',
    categoryLabel: '国家广播',
    streamUrl: 'http://ngcdn001.cnr.cn/live/zgzs/index.m3u8',
    backupStreamUrl: 'https://lhttp.qtfm.cn/live/15318317/64k.mp3',
    description: '中央人民广播电台旗舰频率，全天候权威综合新闻资讯与声音画卷。',
    coverUrl: 'http://pic.qtfm.cn/2017/0413/20170413034613.jpeg',
    bitrate: '128 kbps HLS',
  },
  {
    id: 'big_b_cpop',
    name: 'Big B Radio · 华语流行 C-POP',
    frequency: 'FM 97.4',
    freqMhz: 97.4,
    category: 'cpop',
    categoryLabel: '华语流行',
    streamUrl: 'https://antares.dribbcast.com/proxy/cpop?mp=/s',
    backupStreamUrl: 'https://cn.bigbigmix.com/audio/stream',
    description: '24小时不间断华语流行热歌、经典港台金曲与两岸独立创作精选。',
    coverUrl: 'https://antares.dribbcast.com/cpop.jpg',
    bitrate: '128 kbps AAC',
  },
  {
    id: 'big_big_mix',
    name: 'BIG BIG MIX · 乐享精选歌单',
    frequency: 'FM 101.7',
    freqMhz: 101.7,
    category: 'cpop',
    categoryLabel: '乐享流行',
    streamUrl: 'https://cn.bigbigmix.com/audio/stream',
    backupStreamUrl: 'https://antares.dribbcast.com/proxy/cpop?mp=/s',
    description: '精选城市白领与青年听众热歌单，旋律轻快温暖，全天陪伴。',
    coverUrl: 'https://cn.bigbigmix.com/favicon.ico',
    bitrate: '128 kbps MP3',
  },
  {
    id: 'cnr_economic',
    name: 'CNR-2 经济之声 · 财富生活',
    frequency: 'FM 96.6',
    freqMhz: 96.6,
    category: 'cnr',
    categoryLabel: '经济资讯',
    streamUrl: 'http://ngcdn002.cnr.cn/live/jjzs/index.m3u8',
    backupStreamUrl: 'http://ngcdn001.cnr.cn/live/zgzs/index.m3u8',
    description: '聆听财富声音，品味财经智慧与品质生活慢调。',
    coverUrl: 'http://pic.qtfm.cn/2017/0413/20170413034613.jpeg',
    bitrate: '128 kbps HLS',
  },

  // 2. 蒸汽波与复古调频
  {
    id: 'plaza_one',
    name: 'Nightwave Plaza · 蒸汽波漫游',
    frequency: 'FM 93.3',
    freqMhz: 93.3,
    category: 'lofi',
    categoryLabel: '蒸汽波',
    streamUrl: 'https://radio.plaza.one/mp3',
    backupStreamUrl: 'https://plaza.one/mp3',
    description: '全天候经典 CityPop 与 Vaporwave 怀旧电波，仿佛漫步在 80 年代雨夜街道。',
    coverUrl: 'https://plaza.one/apple-touch-icon.png',
    bitrate: '128 kbps MP3',
  },

  // 3. 治愈慢摇与深空氛围
  {
    id: 'groove_salad',
    name: 'Groove Salad · 慢摇治愈',
    frequency: 'FM 91.5',
    freqMhz: 91.5,
    category: 'chill',
    categoryLabel: '慢摇治愈',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/groovesalad-128-mp3',
    description: '二十年经典极品 Downtempo 与 Chillout 氛围慢摇，抚平深夜浮躁。',
    coverUrl: 'https://api.somafm.com/logos/256/groovesalad256.png',
    bitrate: '128 kbps MP3',
  },
  {
    id: 'lush_vocal',
    name: 'Lush · 空灵女声',
    frequency: 'FM 94.2',
    freqMhz: 94.2,
    category: 'chill',
    categoryLabel: '空灵人声',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/lush-128-mp3',
    description: '空灵唯美的 Dream-pop 与独立女声，如同置身薄雾轻风的晨曦。',
    coverUrl: 'https://api.somafm.com/logos/256/lush256.png',
    bitrate: '128 kbps MP3',
  },
  {
    id: 'deep_space',
    name: 'Deep Space One · 深空冥想',
    frequency: 'FM 88.3',
    freqMhz: 88.3,
    category: 'chill',
    categoryLabel: '深空助眠',
    streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/deepspaceone-128-mp3',
    description: '纯粹环境声学与太空电子音，助眠、冥想与深度专注的灵魂伴侣。',
    coverUrl: 'https://api.somafm.com/logos/256/deepspaceone256.png',
    bitrate: '128 kbps MP3',
  },

  // 4. 复古爵士与公路民谣
  {
    id: 'secret_agent',
    name: 'Secret Agent · 特工爵士',
    frequency: 'FM 98.7',
    freqMhz: 98.7,
    category: 'jazz',
    categoryLabel: '特工爵士',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/secretagent-128-mp3',
    description: '致敬 007 与 60 年代黄金谍战调频，优雅灵动的复古冲浪爵士。',
    coverUrl: 'https://api.somafm.com/logos/256/secretagent256.png',
    bitrate: '128 kbps MP3',
  },
  {
    id: 'boot_liquor',
    name: 'Boot Liquor · 温暖公路民谣',
    frequency: 'FM 89.6',
    freqMhz: 89.6,
    category: 'lofi',
    categoryLabel: '温暖民谣',
    streamUrl: 'https://ice1.somafm.com/bootliquor-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/bootliquor-128-mp3',
    description: '悠扬温暖的木吉他与美式公路民谣，穿透黄昏与旷野的思绪。',
    coverUrl: 'https://api.somafm.com/logos/256/bootliquor256.png',
    bitrate: '128 kbps MP3',
  },
];

/**
 * 获取所有预设电台
 */
export function getAllStations(): RadioStation[] {
  return PRESET_STATIONS;
}

/**
 * 根据频率查找电台（支持误差 ±0.6 MHz 自动捕捉吸附）
 */
export function findStationByFrequency(freqMhz: number, stationList = PRESET_STATIONS): RadioStation | null {
  let closest: RadioStation | null = null;
  let minDiff = 0.6; // 捕捉阈值
  for (const st of stationList) {
    const diff = Math.abs(st.freqMhz - freqMhz);
    if (diff < minDiff) {
      minDiff = diff;
      closest = st;
    }
  }
  return closest;
}

/**
 * Radio Browser API: 在线拉取国内中文电台（按投票热度排行）
 */
export async function fetchRadioBrowserChinaStations(limit = 20): Promise<RadioStation[]> {
  try {
    const res = await fetch(
      `https://de1.api.radio-browser.info/json/stations/bycountry/China?order=votes&reverse=true&limit=${limit}`,
      { headers: { 'User-Agent': 'CloudflyRadioApp/1.0' } }
    );
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data
      .filter((s: any) => s.url_resolved && s.name.trim())
      .map((s: any, idx: number) => {
        const freqMhz = +(88.0 + (idx % 20) * 1.0).toFixed(1);
        return {
          id: `rb_${s.stationuuid || idx}`,
          name: s.name.trim(),
          frequency: `FM ${freqMhz}`,
          freqMhz,
          category: 'online' as const,
          categoryLabel: s.tags?.split(',')[0] || '在线电台',
          streamUrl: s.url_resolved,
          description: s.state ? `来自 ${s.state} · 格式 ${s.codec || 'MP3'}` : `在线广播电台 · ${s.codec || 'MP3'}`,
          coverUrl: s.favicon || undefined,
          bitrate: s.bitrate ? `${s.bitrate} kbps` : undefined,
          isOnlineSearch: true,
        };
      });
  } catch (err) {
    console.warn('Failed to fetch from Radio Browser:', err);
    return [];
  }
}

/**
 * Radio Browser API: 在线搜索全球/国内任意关键词电台
 */
export async function searchRadioBrowser(keyword: string, limit = 15): Promise<RadioStation[]> {
  if (!keyword.trim()) return [];
  try {
    const res = await fetch(
      `https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(keyword)}?limit=${limit}`,
      { headers: { 'User-Agent': 'CloudflyRadioApp/1.0' } }
    );
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return data
      .filter((s: any) => s.url_resolved && s.name.trim())
      .map((s: any, idx: number) => {
        const freqMhz = +(88.5 + (idx % 19) * 1.0).toFixed(1);
        return {
          id: `rb_search_${s.stationuuid || idx}`,
          name: s.name.trim(),
          frequency: `FM ${freqMhz}`,
          freqMhz,
          category: 'online' as const,
          categoryLabel: s.country || '搜索电台',
          streamUrl: s.url_resolved,
          description: `${s.country || '全球'} · ${s.codec || 'MP3'} ${s.bitrate ? s.bitrate + 'k' : ''}`,
          coverUrl: s.favicon || undefined,
          bitrate: s.bitrate ? `${s.bitrate} kbps` : undefined,
          isOnlineSearch: true,
        };
      });
  } catch (err) {
    console.warn('Search Radio Browser error:', err);
    return [];
  }
}
