import { RPGProfile, RPGClass } from './types';

const STORAGE_KEY = 'cloudfly_user_rpg_profile_v1';

export const RPG_CLASSES: RPGClass[] = [
  {
    id: 'mage',
    title: '法师',
    job: '全栈架构师',
    mainAttr: 'INT',
    desc: '以智力与代码重构世界。',
    salary: '28K - 40K',
    location: '上海 · 徐汇',
    icon: '🎃',
  },
  {
    id: 'warrior',
    title: '战士',
    job: '体能教练',
    mainAttr: 'STR',
    desc: '以力量与意志突破肉体极限。',
    salary: '16K - 24K',
    location: '深圳 · 南山',
    icon: '⚔️',
  },
  {
    id: 'ranger',
    title: '游侠',
    job: '独立开发者',
    mainAttr: 'DEX',
    desc: '敏锐穿梭于世界机遇之间。',
    salary: '30K - 50K',
    location: '远程 · 居家',
    icon: '🏹',
  },
  {
    id: 'scholar',
    title: '学者',
    job: '算法研究员',
    mainAttr: 'SPI',
    desc: '专注内省并保持深度探寻。',
    salary: '35K - 65K',
    location: '北京 · 海淀',
    icon: '📖',
  },
];

export const DEFAULT_RPG_PROFILE: RPGProfile = {
  name: '旅行者',
  title: '初醒之人',
  level: 1,
  currentExp: 0,
  maxExp: 100,
  hp: 100,
  maxHp: 100,
  mp: 100,
  maxMp: 100,
  gold: 500,
  crystals: 50,
  mood: 16,
  zodiac: '双鱼座',
  mbti: 'INFP',
  gender: '保密',
  storyPages: [
    {
      id: 'story_1',
      pageIndex: 0,
      date: '2026.09.22',
      content: '初次翻开这本手账。我想在这里记录真实的自我、心境与成长轨迹。',
      updatedAt: Date.now(),
    },
  ],
  albumPhotos: [],
  currentClassId: 'mage',
  customAvatarUrl: null, // 无预设立绘，支持用户上传/URL
  dossierPhotoUrl: null, // 个人档案专属相片，与主界面全身立绘解耦
  customBgUrl: null,
  attributes: {
    STR: {
      key: 'STR',
      name: '力量',
      shortName: 'STR',
      value: 62,
      maxValue: 100,
      focus: '体能爆发',
      level: 6,
    },
    DEX: {
      key: 'DEX',
      name: '敏捷',
      shortName: 'DEX',
      value: 78,
      maxValue: 100,
      focus: '协调反应',
      level: 7,
    },
    INT: {
      key: 'INT',
      name: '智力',
      shortName: 'INT',
      value: 88,
      maxValue: 100,
      focus: '逻辑思维',
      level: 9,
    },
    SPI: {
      key: 'SPI',
      name: '精神',
      shortName: 'SPI',
      value: 70,
      maxValue: 100,
      focus: '专注定力',
      level: 7,
    },
    CON: {
      key: 'CON',
      name: '体质',
      shortName: 'CON',
      value: 58,
      maxValue: 100,
      focus: '健康免疫',
      level: 5,
    },
    CHA: {
      key: 'CHA',
      name: '魅力',
      shortName: 'CHA',
      value: 65,
      maxValue: 100,
      focus: '沟通表达',
      level: 6,
    },
  },
  classes: RPG_CLASSES,
  skills: [
    {
      id: 's_int_1',
      name: '初识代码',
      branch: 'INT',
      level: 1,
      unlocked: true,
      desc: '掌握 Hello World 基础语法',
      effect: '敏捷+1',
    },
    {
      id: 's_int_2',
      name: '首个项目',
      branch: 'INT',
      level: 5,
      unlocked: true,
      desc: '独立交付可用小程序模块',
      effect: '智力+3',
    },
    {
      id: 's_int_3',
      name: '全栈入门',
      branch: 'INT',
      level: 10,
      unlocked: true,
      desc: '打通前后端与数据库链路',
      effect: '获得专属称号',
    },
    {
      id: 's_str_1',
      name: '核心激活',
      branch: 'STR',
      level: 2,
      unlocked: true,
      desc: '连续两周核心力训',
      effect: '力量+2',
    },
    {
      id: 's_spi_1',
      name: '心流聚焦',
      branch: 'SPI',
      level: 4,
      unlocked: false,
      desc: '保持单次 90 分钟深度专注',
      effect: '精神+5',
    },
    {
      id: 's_con_1',
      name: '晨起唤醒',
      branch: 'CON',
      level: 3,
      unlocked: false,
      desc: '连续 7 天早睡早起',
      effect: '体力上限+5',
    },
  ],
  debuffs: [
    {
      id: 'deb_cold',
      name: '轻微感冒',
      type: 'debuff',
      effectText: '全属性 -10%',
      active: false,
    },
    {
      id: 'deb_procrast',
      name: '拖延状态',
      type: 'debuff',
      effectText: '经验效率 -20%',
      active: true,
    },
    {
      id: 'deb_insomnia',
      name: '轻度失眠',
      type: 'debuff',
      effectText: '体力上限 -15',
      active: false,
    },
  ],
  items: [
    {
      id: 'item_headphone',
      name: '降噪耳机',
      type: 'gear',
      slot: 'head',
      icon: '🎧',
      effect: '精神 +5',
      equipped: true,
    },
    {
      id: 'item_chair',
      name: '工学转椅',
      type: 'gear',
      slot: 'body',
      icon: '🪑',
      effect: '体质 +5',
      equipped: true,
    },
    {
      id: 'item_watch',
      name: '运动腕表',
      type: 'gear',
      slot: 'wrist',
      icon: '⌚',
      effect: '敏捷 +5',
      equipped: false,
    },
    {
      id: 'item_coffee',
      name: '手冲咖啡',
      type: 'consumable',
      icon: '☕',
      effect: '恢复 25 体力',
      count: 3,
    },
    {
      id: 'item_book',
      name: '技术专著',
      type: 'consumable',
      icon: '📖',
      effect: '智力经验 +100',
      count: 1,
    },
    {
      id: 'item_mint',
      name: '清凉薄荷',
      type: 'consumable',
      icon: '🍬',
      effect: '恢复 15 精力',
      count: 5,
    },
  ],
};

// 根据等级动态推算六维属性上限（初始100，每升5级上限+10）
export function computeAttributeMax(level: number): number {
  return 100 + Math.floor(Math.max(1, level) / 5) * 10;
}

function randRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function loadRPGProfile(): RPGProfile {
  const todayStr = new Date().toDateString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged: RPGProfile = {
        ...DEFAULT_RPG_PROFILE,
        ...parsed,
        mood: typeof parsed.mood === 'number' ? parsed.mood : 16,
        zodiac: parsed.zodiac || DEFAULT_RPG_PROFILE.zodiac,
        mbti: parsed.mbti || DEFAULT_RPG_PROFILE.mbti,
        gender: parsed.gender || DEFAULT_RPG_PROFILE.gender,
        dossierPhotoUrl: parsed.dossierPhotoUrl || null,
        storyPages: parsed.storyPages && parsed.storyPages.length > 0 ? parsed.storyPages : DEFAULT_RPG_PROFILE.storyPages,
        albumPhotos: parsed.albumPhotos || [],
        classes: parsed.classes && parsed.classes.length > 0 ? parsed.classes : RPG_CLASSES,
      };

      // 修正历史遗留假数据，确保初始等级严格为 1
      if (!merged.level || merged.level === 35 || merged.level === 12 || (merged.level > 1 && (!merged.currentExp || merged.currentExp === 0))) {
        merged.level = 1;
        merged.currentExp = 0;
        merged.maxExp = 100;
      }

      // 每日 100 初始机制：跨日重置体力与精力
      if (merged.lastActiveDate !== todayStr) {
        merged.hp = 100;
        merged.mp = 100;
        merged.lastActiveDate = todayStr;
      }

      // 动态同步六维上限
      const attrMax = computeAttributeMax(merged.level);
      for (const k of Object.keys(merged.attributes) as (keyof typeof merged.attributes)[]) {
        merged.attributes[k].maxValue = attrMax;
        if (merged.attributes[k].value > attrMax) {
          merged.attributes[k].value = attrMax;
        }
      }

      return merged;
    }
  } catch (err) {
    console.warn('Failed to load RPG profile, using default', err);
  }

  const initial = { ...DEFAULT_RPG_PROFILE, lastActiveDate: todayStr, hp: 100, mp: 100 };
  return initial;
}

export function saveRPGProfile(profile: RPGProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save RPG profile', err);
  }
}

// 难易度区间随机结算模型
export interface PomodoroSettleResult {
  hpCost: number;
  mpCost: number;
  attrKey: 'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA';
  attrGain: number;
  expGain: number;
  goldGain: number;
  leveledUp: boolean;
  newLevel: number;
  clearedDebuff: boolean;
}

export function settlePomodoroFocus(
  difficulty: 'easy' | 'normal' | 'hard' | 'expert' = 'normal',
  targetAttr?: 'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA'
): PomodoroSettleResult {
  const profile = loadRPGProfile();

  // 1. 各难易度区间配置（均为区间内随机获取）
  let hpMin = 8, hpMax = 12;
  let mpMin = 13, mpMax = 18;
  let attrMin = 2, attrMax = 4;
  let expMin = 45, expMax = 60;
  let goldMin = 80, goldMax = 120;

  if (difficulty === 'easy') {
    hpMin = 4; hpMax = 6;
    mpMin = 7; mpMax = 10;
    attrMin = 1; attrMax = 2;
    expMin = 25; expMax = 35;
    goldMin = 40; goldMax = 60;
  } else if (difficulty === 'hard') {
    hpMin = 15; hpMax = 22;
    mpMin = 22; mpMax = 28;
    attrMin = 4; attrMax = 6;
    expMin = 70; expMax = 95;
    goldMin = 150; goldMax = 210;
  } else if (difficulty === 'expert') {
    hpMin = 25; hpMax = 32;
    mpMin = 34; mpMax = 42;
    attrMin = 7; attrMax = 10;
    expMin = 110; expMax = 140;
    goldMin = 260; goldMax = 350;
  }

  const hpCost = randRange(hpMin, hpMax);
  const mpCost = randRange(mpMin, mpMax);
  const attrGain = randRange(attrMin, attrMax);
  const expGain = randRange(expMin, expMax);
  const goldGain = randRange(goldMin, goldMax);

  // 2. 扣减体力与精力 (下限 0)
  profile.hp = Math.max(0, profile.hp - hpCost);
  profile.mp = Math.max(0, profile.mp - mpCost);

  // 3. 增加金币
  profile.gold += goldGain;

  // 4. 经验与升级判定
  let leveledUp = false;
  profile.currentExp += expGain;
  while (profile.currentExp >= profile.maxExp) {
    profile.currentExp -= profile.maxExp;
    profile.level += 1;
    profile.maxExp = Math.round(profile.maxExp * 1.2);
    leveledUp = true;
  }

  // 5. 动态属性上限随等级提高
  const currentAttrCap = computeAttributeMax(profile.level);
  for (const k of Object.keys(profile.attributes) as (keyof typeof profile.attributes)[]) {
    profile.attributes[k].maxValue = currentAttrCap;
  }

  // 6. 确定目标六维并加点
  const actualAttrKey = targetAttr || (profile.attributes.INT ? 'INT' : 'STR');
  if (profile.attributes[actualAttrKey]) {
    profile.attributes[actualAttrKey].value = Math.min(
      currentAttrCap,
      profile.attributes[actualAttrKey].value + attrGain
    );
  }

  // 7. 净化“拖延状态”Debuff
  let clearedDebuff = false;
  profile.debuffs = profile.debuffs.map((d) => {
    if (d.id === 'deb_procrast' && d.active) {
      clearedDebuff = true;
      return { ...d, active: false };
    }
    return d;
  });

  saveRPGProfile(profile);

  return {
    hpCost,
    mpCost,
    attrKey: actualAttrKey,
    attrGain,
    expGain,
    goldGain,
    leveledUp,
    newLevel: profile.level,
    clearedDebuff,
  };
}

// 休息阶段区间随机恢复
export function settlePomodoroBreak(isLong: boolean): { hpRecover: number; mpRecover: number } {
  const profile = loadRPGProfile();

  const hpRecover = isLong ? randRange(22, 28) : randRange(8, 12);
  const mpRecover = isLong ? randRange(30, 40) : randRange(12, 18);

  profile.hp = Math.min(profile.maxHp, profile.hp + hpRecover);
  profile.mp = Math.min(profile.maxMp, profile.mp + mpRecover);

  saveRPGProfile(profile);
  return { hpRecover, mpRecover };
}

// 亲缘关系图谱存储键
const RELATIONSHIP_STORAGE_KEY = 'cloudfly_user_relationship_data_v1';
import { RelationshipData, DEFAULT_RELATIONSHIP_DATA } from './relationshipTypes';

export function loadRelationshipData(): RelationshipData {
  try {
    const raw = localStorage.getItem(RELATIONSHIP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.nodes && parsed.nodes.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load relationship data, using default', err);
  }
  return DEFAULT_RELATIONSHIP_DATA;
}

export function saveRelationshipData(data: RelationshipData): void {
  try {
    // 过滤掉 d3 注入的内部循环引用属性后保存
    const cleanNodes = data.nodes.map((n) => ({
      id: n.id,
      name: n.name,
      relation: n.relation,
      category: n.category,
      avatarEmoji: n.avatarEmoji,
      avatarUrl: n.avatarUrl,
      desc: n.desc,
      isCenter: n.isCenter,
    }));
    const cleanLinks = data.links.map((l) => ({
      id: l.id,
      source: typeof l.source === 'object' ? (l.source as any).id : l.source,
      target: typeof l.target === 'object' ? (l.target as any).id : l.target,
      label: l.label,
    }));
    localStorage.setItem(RELATIONSHIP_STORAGE_KEY, JSON.stringify({ nodes: cleanNodes, links: cleanLinks }));
  } catch (err) {
    console.warn('Failed to save relationship data', err);
  }
}
