// 真声流媒体电台服务
// 聚合 SomaFM 高保真纯音乐流、优质在线广播电台与 Radio Browser API

export interface RadioStation {
  id: string;
  name: string;
  frequency: string; // 模拟 FM 频率，如 "FM 97.4"
  freqMhz: number;   // 频率数值，用于在调谐刻度盘上精准定位游标（87.5 ~ 108.0）
  category: 'pop' | 'chill' | 'lofi' | 'jazz' | 'classic';
  categoryLabel: string;
  streamUrl: string;
  backupStreamUrl?: string;
  description: string;
  coverUrl?: string;
  bitrate?: string;
}

/**
 * 精选高可靠 100% 稳定直链电台池（HTTPS、免 Key、24小时稳定开播、无需任何跨域代理）
 */
export const PRESET_STATIONS: RadioStation[] = [
  // 1. 经典蒸汽波与复古调频 (Nightwave Plaza 直连，国内访问极佳)
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

  // 2. 治愈慢摇与氛围（SomaFM 官方超清直链，免 Referer 保护）
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

  // 2. 爵士调频与复古情调
  {
    id: 'secret_agent',
    name: 'Secret Agent · 复古特工爵士',
    frequency: 'FM 98.7',
    freqMhz: 98.7,
    category: 'jazz',
    categoryLabel: '复古爵士',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/secretagent-128-mp3',
    description: '致敬 007 与 60 年代黄金谍战调频，优雅灵动的复古冲浪爵士。',
    coverUrl: 'https://api.somafm.com/logos/256/secretagent256.png',
    bitrate: '128 kbps MP3',
  },
  {
    id: 'illinois_street',
    name: 'Illinois Lounge · 经典午后沙龙',
    frequency: 'FM 100.5',
    freqMhz: 100.5,
    category: 'jazz',
    categoryLabel: '沙龙慢调',
    streamUrl: 'https://ice1.somafm.com/illstreet-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/illstreet-128-mp3',
    description: '经典微醺 Lounge 与鸡尾酒沙龙爵士，重温 1950 年代留声唱片。',
    coverUrl: 'https://api.somafm.com/logos/256/illstreet256.png',
    bitrate: '128 kbps MP3',
  },

  // 3. 流行微风与都市电台
  {
    id: 'indie_pop_rocks',
    name: 'Indie Pop Rocks · 独立流行小调',
    frequency: 'FM 103.2',
    freqMhz: 103.2,
    category: 'pop',
    categoryLabel: '流行微风',
    streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/indiepop-128-mp3',
    description: '新鲜明亮的经典独立流行小品，洋溢着青春微风与吉他扫弦。',
    coverUrl: 'https://api.somafm.com/logos/256/indiepop256.png',
    bitrate: '128 kbps MP3',
  },
  {
    id: 'pop_tron',
    name: 'PopTron · 电幻流行脉搏',
    frequency: 'FM 106.8',
    freqMhz: 106.8,
    category: 'pop',
    categoryLabel: '电幻流行',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/poptron-128-mp3',
    description: '节奏分明、充满未来感的轻快电幻流行律动。',
    coverUrl: 'https://api.somafm.com/logos/256/poptron256.png',
    bitrate: '128 kbps MP3',
  },

  // 4. Lo-Fi 温暖和弦与蒸汽波
  {
    id: 'boot_liquor',
    name: 'Boot Liquor · 温暖民谣公路',
    frequency: 'FM 96.1',
    freqMhz: 96.1,
    category: 'lofi',
    categoryLabel: '温暖公路',
    streamUrl: 'https://ice1.somafm.com/bootliquor-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/bootliquor-128-mp3',
    description: '悠扬温暖的木吉他与美式公路民谣，穿透黄昏与旷野的思绪。',
    coverUrl: 'https://api.somafm.com/logos/256/bootliquor256.png',
    bitrate: '128 kbps MP3',
  },
  {
    id: 'drone_zone',
    name: 'Drone Zone · 迷幻低鸣空间',
    frequency: 'FM 89.9',
    freqMhz: 89.9,
    category: 'lofi',
    categoryLabel: '太空和弦',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/dronezone-128-mp3',
    description: '持续低缓的声景和弦，极度适合编写代码与安静阅读。',
    coverUrl: 'https://api.somafm.com/logos/256/dronezone256.png',
    bitrate: '128 kbps MP3',
  },

  // 5. 古典流声与电影原声
  {
    id: 'sf_soundtracks',
    name: 'Cinemart · 经典电影原声',
    frequency: 'FM 105.4',
    freqMhz: 105.4,
    category: 'classic',
    categoryLabel: '光影交响',
    streamUrl: 'https://ice1.somafm.com/sf1033-128-mp3',
    backupStreamUrl: 'https://ice2.somafm.com/sf1033-128-mp3',
    description: '好莱坞与经典艺术电影配乐大师杰作，大气磅礴的光影盛宴。',
    coverUrl: 'https://api.somafm.com/logos/256/sf1033256.png',
    bitrate: '128 kbps MP3',
  },
];

/**
 * 获取所有电台
 */
export function getAllStations(): RadioStation[] {
  return PRESET_STATIONS;
}

/**
 * 根据频率查找电台（支持误差 ±0.6 MHz 自动捕捉吸附）
 */
export function findStationByFrequency(freqMhz: number): RadioStation | null {
  let closest: RadioStation | null = null;
  let minDiff = 0.6; // 捕捉阈值
  for (const st of PRESET_STATIONS) {
    const diff = Math.abs(st.freqMhz - freqMhz);
    if (diff < minDiff) {
      minDiff = diff;
      closest = st;
    }
  }
  return closest;
}
