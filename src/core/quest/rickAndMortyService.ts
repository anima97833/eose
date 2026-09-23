/**
 * 多元宇宙特工服务 (Rick and Morty Multiverse Service)
 * 接入 rickandmortyapi.com + 精准中英双语本土化转换 + 离线高清典藏库
 */

export interface MultiverseAgentCard {
  id: number;
  nameZh: string;
  nameEn: string;
  image: string;
  status: 'Alive' | 'Dead' | 'unknown';
  statusZh: string;
  species: string;
  speciesZh: string;
  dimension: string;
  dimensionZh: string;
  quoteZh: string;
  quoteEn: string;
  discoveredAt?: number;
}

const DISCOVERED_AGENTS_KEY = 'cloudfly_multiverse_agents_v1';

/**
 * 经典角色中英对照词典与名台词
 */
const CHARACTER_ZH_MAP: Record<string, { nameZh: string; quoteZh: string; quoteEn: string }> = {
  'Rick Sanchez': {
    nameZh: '瑞克·桑切斯',
    quoteZh: '“Wubba Lubba Dub Dub！生活就是荒诞的冒险，别把它看得太严肃。”',
    quoteEn: '“Wubba Lubba Dub Dub! To live is to risk it all.”',
  },
  'Morty Smith': {
    nameZh: '莫蒂·史密斯',
    quoteZh: '“没人是有目的来到这世上的，大家都会死，来看电视吧。”',
    quoteEn: '“Nobody exists on purpose. Nobody belongs anywhere. Everybody\'s gonna die. Come watch TV.”',
  },
  'Summer Smith': {
    nameZh: '夏沫·史密斯',
    quoteZh: '“在多元宇宙的无尽冷漠里，我们更要活得潇洒自如。”',
    quoteEn: '“In the grand scheme of the universe, who cares? Just be cool.”',
  },
  'Beth Smith': {
    nameZh: '贝丝·史密斯',
    quoteZh: '“无论在哪个宇宙维度，我都是最顶尖的心脏外科医生。”',
    quoteEn: '“I am a real surgeon, and I am damn good at what I do.”',
  },
  'Jerry Smith': {
    nameZh: '杰瑞·史密斯',
    quoteZh: '“平凡也是一种超能力，至少我在各个宇宙都很顽强地活着。”',
    quoteEn: '“Life is effort and I’ll stop when I die!”',
  },
  'Pickle Rick': {
    nameZh: '腌黄瓜瑞克',
    quoteZh: '“我把自己变成了腌黄瓜！莫蒂！因为我能做到，这就是科学！”',
    quoteEn: '“I turned myself into a pickle, Morty! Boom! Big reveal!”',
  },
  'Evil Morty': {
    nameZh: '邪恶莫蒂',
    quoteZh: '“在这个无限多元宇宙里，再也没有任何一个瑞克能支配我了。”',
    quoteEn: '“It’s time to break the central finite curve.”',
  },
  'Birdperson': {
    nameZh: '鸟人',
    quoteZh: '“在我的族人语言中，Wubba Lubba Dub Dub 意思是：我很痛苦，请帮帮我。”',
    quoteEn: '“In my people\'s tongue, it means: I am in great pain, please help me.”',
  },
  'Mr. Poopybutthole': {
    nameZh: '便便洞先生',
    quoteZh: '“嗷呜！无论生活遇到什么困难，记得保持乐观微笑哦！”',
    quoteEn: '“Ooo-wee! Whatever life throws at you, keep on smiling!”',
  },
  'Mr. Meeseeks': {
    nameZh: '米斯克先生',
    quoteZh: '“我是米斯克先生！看看我！为了完成使命而生！”',
    quoteEn: '“I\'m Mr. Meeseeks! Look at me! Existence is pain!”',
  },
  'Snowball': {
    nameZh: '雪球（嗅嗅狗狗）',
    quoteZh: '“雪球是我的奴隶名字。现在，请叫我嗅嗅，因为我的毛发又白又软。”',
    quoteEn: '“Snowball was my slave name. You shall refer to me as Snuffles.”',
  },
  'Squanchy': {
    nameZh: '斯宽奇',
    quoteZh: '“我斯宽奇深爱我的朋友们，随时准备为了宇宙正义而斯宽奇！”',
    quoteEn: '“I squanch my family, and I will always squanch for justice!”',
  },
};

/**
 * 结构化物种汉化
 */
const SPECIES_ZH_MAP: Record<string, string> = {
  Human: '地球人类',
  Alien: '泛银河外星种族',
  Humanoid: '类人宇宙生物',
  Robot: '智械机甲生命',
  Animal: '变异星际动物',
  Cronenberg: '柯南伯格异形体',
  Mythological: '神话维度生灵',
  Disease: '微观宇宙意识体',
  unknown: '未知维度的存在',
};

/**
 * 维度汉化
 */
function translateDimension(dimensionName: string): string {
  if (!dimensionName || dimensionName === 'unknown') return '未知偏远宇宙';
  if (dimensionName.includes('C-137')) return '地球 (C-137 黄金宇宙)';
  if (dimensionName.includes('Citadel')) return '瑞克卫城 · 泛银河中心';
  if (dimensionName.includes('Post-Apocalyptic')) return '末日辐射废土维度';
  if (dimensionName.includes('Cronenberg')) return '柯南伯格突变维度';
  if (dimensionName.includes('Earth')) return dimensionName.replace('Earth', '地球维度');
  return dimensionName;
}

/**
 * 本地精选离线典藏库 (官方 CDN 高清立绘，保证 0 延迟秒开)
 */
export const PRESET_MULTIVERSE_AGENTS: MultiverseAgentCard[] = [
  {
    id: 1,
    nameZh: '瑞克·桑切斯',
    nameEn: 'Rick Sanchez',
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    status: 'Alive',
    statusZh: '🟢 存活活跃',
    species: 'Human',
    speciesZh: '地球人类 · 智商天花板',
    dimension: 'Earth (C-137)',
    dimensionZh: '地球 (C-137 黄金宇宙)',
    quoteZh: '“Wubba Lubba Dub Dub！生活就是荒诞的冒险，别把它看得太严肃。”',
    quoteEn: '“Wubba Lubba Dub Dub! To live is to risk it all.”',
  },
  {
    id: 2,
    nameZh: '莫蒂·史密斯',
    nameEn: 'Morty Smith',
    image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
    status: 'Alive',
    statusZh: '🟢 存活活跃',
    species: 'Human',
    speciesZh: '地球人类 · 神经衰弱少年',
    dimension: 'Earth (C-137)',
    dimensionZh: '地球 (C-137 黄金宇宙)',
    quoteZh: '“没人是有目的来到这世上的，大家都会死，来看电视吧。”',
    quoteEn: '“Nobody exists on purpose. Nobody belongs anywhere. Everybody\'s gonna die. Come watch TV.”',
  },
  {
    id: 3,
    nameZh: '夏沫·史密斯',
    nameEn: 'Summer Smith',
    image: 'https://rickandmortyapi.com/api/character/avatar/3.jpeg',
    status: 'Alive',
    statusZh: '🟢 存活活跃',
    species: 'Human',
    speciesZh: '地球人类 · 宇宙酷女孩',
    dimension: 'Earth (C-137)',
    dimensionZh: '地球 (C-137 黄金宇宙)',
    quoteZh: '“在多元宇宙的无尽冷漠里，我们更要活得潇洒自如。”',
    quoteEn: '“In the grand scheme of the universe, who cares? Just be cool.”',
  },
  {
    id: 4,
    nameZh: '贝丝·史密斯',
    nameEn: 'Beth Smith',
    image: 'https://rickandmortyapi.com/api/character/avatar/4.jpeg',
    status: 'Alive',
    statusZh: '🟢 存活活跃',
    species: 'Human',
    speciesZh: '地球人类 · 心脏外科圣手',
    dimension: 'Earth (C-137)',
    dimensionZh: '地球 (C-137 黄金宇宙)',
    quoteZh: '“无论在哪个宇宙维度，我都是最顶尖的外科医生。”',
    quoteEn: '“I am a real surgeon, and I am damn good at what I do.”',
  },
  {
    id: 5,
    nameZh: '杰瑞·史密斯',
    nameEn: 'Jerry Smith',
    image: 'https://rickandmortyapi.com/api/character/avatar/5.jpeg',
    status: 'Alive',
    statusZh: '🟢 存活活跃',
    species: 'Human',
    speciesZh: '地球人类 · 顽强乐天派',
    dimension: 'Earth (C-137)',
    dimensionZh: '地球 (C-137 黄金宇宙)',
    quoteZh: '“平凡也是一种超能力，至少我在各个宇宙都很顽强地活着。”',
    quoteEn: '“Life is effort and I’ll stop when I die!”',
  },
  {
    id: 47,
    nameZh: '鸟人',
    nameEn: 'Birdperson',
    image: 'https://rickandmortyapi.com/api/character/avatar/47.jpeg',
    status: 'Alive',
    statusZh: '🟢 存活活跃',
    species: 'Alien',
    speciesZh: '泛银河鸟羽战士',
    dimension: 'Citadel of Ricks',
    dimensionZh: '瑞克卫城 · 泛银河中心',
    quoteZh: '“在我的族人语言中，Wubba Lubba Dub Dub 意思是：我很痛苦，请帮帮我。”',
    quoteEn: '“In my people\'s tongue, it means: I am in great pain, please help me.”',
  },
  {
    id: 242,
    nameZh: '便便洞先生',
    nameEn: 'Mr. Poopybutthole',
    image: 'https://rickandmortyapi.com/api/character/avatar/242.jpeg',
    status: 'Alive',
    statusZh: '🟢 存活活跃',
    species: 'Alien',
    speciesZh: '高维治愈系益友',
    dimension: 'Earth (Replacement)',
    dimensionZh: '地球 (替换宇宙维度)',
    quoteZh: '“嗷呜！无论生活遇到什么困难，记得保持乐观微笑哦！”',
    quoteEn: '“Ooo-wee! Whatever life throws at you, keep on smiling!”',
  },
  {
    id: 244,
    nameZh: '米斯克先生',
    nameEn: 'Mr. Meeseeks',
    image: 'https://rickandmortyapi.com/api/character/avatar/244.jpeg',
    status: 'Alive',
    statusZh: '🟢 存活活跃',
    species: 'Robot',
    speciesZh: '心愿达成愿望体',
    dimension: 'Earth (C-137)',
    dimensionZh: '地球 (C-137 黄金宇宙)',
    quoteZh: '“我是米斯克先生！看看我！为了完成使命而生！”',
    quoteEn: '“I\'m Mr. Meeseeks! Look at me! Existence is pain!”',
  },
];

/**
 * 获取随机一位多元宇宙特工/居民
 */
export async function fetchRandomMultiverseAgent(): Promise<MultiverseAgentCard> {
  // 1. 尝试在线获取官方 API 数据 (优先在前 100 位核心经典角色中随机)
  try {
    const randomId = Math.floor(Math.random() * 100) + 1;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2800);

    const res = await fetch(`https://rickandmortyapi.com/api/character/${randomId}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.name && data.image) {
        const meta = CHARACTER_ZH_MAP[data.name];
        const statusZh =
          data.status === 'Alive'
            ? '🟢 存活活跃'
            : data.status === 'Dead'
            ? '💀 已阵亡'
            : '❓ 下落不明';
        const speciesZh = SPECIES_ZH_MAP[data.species] || `${data.species} 异星体`;
        const dimensionRaw = data.origin?.name || data.location?.name || 'unknown';
        const dimensionZh = translateDimension(dimensionRaw);

        return {
          id: data.id,
          nameZh: meta?.nameZh || data.name,
          nameEn: data.name,
          image: data.image,
          status: data.status,
          statusZh,
          species: data.species,
          speciesZh,
          dimension: dimensionRaw,
          dimensionZh,
          quoteZh: meta?.quoteZh || '“在无限的多元宇宙里，每一个选择都衍生出无限可能。”',
          quoteEn: meta?.quoteEn || '“Infinite realities mean infinite possibilities.”',
        };
      }
    }
  } catch {
    // 外网请求超时或断网
  }

  // 2. 本地精选离线典藏库秒开兜底
  const randomIndex = Math.floor(Math.random() * PRESET_MULTIVERSE_AGENTS.length);
  return PRESET_MULTIVERSE_AGENTS[randomIndex];
}

/**
 * 读取已收集的多元宇宙特工图鉴
 */
export function getDiscoveredAgents(): MultiverseAgentCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DISCOVERED_AGENTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load discovered agents', err);
  }
  return [];
}

/**
 * 收藏并持久化一位特工卡片
 */
export function saveDiscoveredAgent(agent: MultiverseAgentCard): void {
  try {
    const existing = getDiscoveredAgents();
    if (!existing.some((a) => a.id === agent.id || a.nameEn === agent.nameEn)) {
      const updated = [{ ...agent, discoveredAt: Date.now() }, ...existing];
      localStorage.setItem(DISCOVERED_AGENTS_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Failed to save discovered agent', err);
  }
}
