import { RPGProfile, RPGClass, LifeStatus } from './types';
import { calculateDailySettlement, getMaxExpForLevel } from './dailySettlementEngine';
import { saveCustomAvatar } from './avatarImageStorage';
import { saveCustomBackground } from './backgroundImageStorage';
import { saveDossierToDB } from './dossierStorage';

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

export const DEFAULT_LIFE_STATUSES: LifeStatus[] = [
  {
    id: 'status_food_coma',
    name: '碳水昏迷',
    icon: '🍔',
    type: 'debuff',
    effectText: '血液涌向胃部，脑力挂机',
    systemAdvice: '宜浅睡20分钟或躺平休息',
    active: false,
  },
  {
    id: 'status_caffeine_boost',
    name: '咖啡因高能',
    icon: '☕',
    type: 'buff',
    effectText: '心流涌动，注意力暴击',
    systemAdvice: '宜借势推进核心要务，适度补水',
    active: false,
  },
  {
    id: 'status_bed_gravity',
    name: '阴雨被窝重力场',
    icon: '🌧️',
    type: 'debuff',
    effectText: '床垫强力吸附，行动力受阻',
    systemAdvice: '宜听雨声看闲书，顺应节奏',
    active: false,
  },
  {
    id: 'status_energy_zero',
    name: '精力见底·摆烂结界',
    icon: '🔋',
    type: 'protect',
    effectText: '合法防护盾，屏蔽催促与内耗',
    systemAdvice: '主线自动降级为“活着并呼吸”',
    active: false,
  },
  {
    id: 'status_digital_overload',
    name: '数字信息过载',
    icon: '📱',
    type: 'debuff',
    effectText: '信息拥堵脑雾，思维缓存满载',
    systemAdvice: '宜远眺 5 分钟或出门放空',
    active: false,
  },
  {
    id: 'status_fluffy_healing',
    name: '毛绒生物治愈',
    icon: '🐈',
    type: 'buff',
    effectText: '萌宠互动，精神治愈力拉满',
    systemAdvice: '享受当下温存，汲取安宁能量',
    active: false,
  },
];

export const DEFAULT_RPG_PROFILE: RPGProfile = {
  name: '旅行者',
  title: '初醒之人',
  level: 1,
  currentExp: 0,
  maxExp: getMaxExpForLevel(1),
  hp: 100,
  maxHp: 100,
  mp: 100,
  maxMp: 100,
  gold: 500,
  crystals: 50,
  mood: 100,
  pendingDailySettlement: null,
  dailyCost: 100,
  savingGoalDays: 365,
  savingGoalNote: '自由生活目标: 365天 🏖️',
  isPrivacyHidden: false,
  bgmEnabled: true,
  sfxEnabled: true,
  wishVouchers: 0,
  userId: '417914',
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
  signInState: {
    currentRound: 1,
    currentDayIndex: 1,
    lastSignInDate: null,
    diamondShards: 0,
    claimedDays: [],
  },
  extremeChallenge: {
    activeType: 'early_bird', // 默认选中早起挑战
    projects: {
      early_bird: { currentDayIndex: 1, lastCheckInDate: null, claimedDays: [], isCompleted: false },
      early_sleep: { currentDayIndex: 1, lastCheckInDate: null, claimedDays: [], isCompleted: false },
      workout: { currentDayIndex: 1, lastCheckInDate: null, claimedDays: [], isCompleted: false },
      fruits: { currentDayIndex: 1, lastCheckInDate: null, claimedDays: [], isCompleted: false },
    },
  },
  attributes: {
    STR: {
      key: 'STR',
      name: '力量',
      shortName: 'STR',
      value: 0,
      maxValue: 100,
      focus: '体能爆发',
      level: 1,
    },
    DEX: {
      key: 'DEX',
      name: '敏捷',
      shortName: 'DEX',
      value: 0,
      maxValue: 100,
      focus: '协调反应',
      level: 1,
    },
    INT: {
      key: 'INT',
      name: '智力',
      shortName: 'INT',
      value: 0,
      maxValue: 100,
      focus: '逻辑思维',
      level: 1,
    },
    SPI: {
      key: 'SPI',
      name: '精神',
      shortName: 'SPI',
      value: 0,
      maxValue: 100,
      focus: '专注定力',
      level: 1,
    },
    CON: {
      key: 'CON',
      name: '体质',
      shortName: 'CON',
      value: 0,
      maxValue: 100,
      focus: '健康免疫',
      level: 1,
    },
    CHA: {
      key: 'CHA',
      name: '魅力',
      shortName: 'CHA',
      value: 0,
      maxValue: 100,
      focus: '沟通表达',
      level: 1,
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
  lifeStatuses: DEFAULT_LIFE_STATUSES,
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
    {
      id: 'wish_sony_xm5',
      name: '降噪大耳机',
      type: 'wish',
      icon: '🎧',
      effect: '现实心愿 · 沉浸心流工作站',
      wishVouchersCost: 15,
      lockedUntil: Date.now() + 5 * 24 * 3600 * 1000,
      wishNote: '等上线完新版本就奖励自己，戴上它全世界都安静了。',
      isAchieved: false,
    },
    {
      id: 'wish_afternoon_tea',
      name: '法式双人下午茶',
      type: 'wish',
      icon: '🍰',
      effect: '现实心愿 · 悠闲日光浴小憩',
      wishVouchersCost: 5,
      lockedUntil: Date.now() - 1000, // 冷静期已满
      wishNote: '连续达成两周打卡后，周六下午去梧桐树下坐坐。',
      isAchieved: false,
    },
    {
      id: 'wish_lego_gt3',
      name: '乐高机械超跑',
      type: 'wish',
      icon: '🏎️',
      effect: '现实心愿 · 桌面终极男/女人的浪漫',
      wishVouchersCost: 28,
      lockedUntil: Date.now() + 6 * 24 * 3600 * 1000,
      wishNote: '拼装需要整整一个周末，升到 10 级时再兑换！',
      isAchieved: false,
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

/**
 * 获取以北京时间 (Asia/Shanghai, UTC+8) 计算的当天日期字符串 (格式: YYYY-MM-DD)
 */
export function getBeijingDateString(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // 忽略异常，降级到手动时间戳换算
  }
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const bj = new Date(utc + 8 * 3600000);
  const y = bj.getFullYear();
  const m = String(bj.getMonth() + 1).padStart(2, '0');
  const d = String(bj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function loadRPGProfile(): RPGProfile {
  const bjToday = getBeijingDateString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // 检查历史遗留：若曾在 localStorage 中保存过立绘或背景，自动迁移至 IndexedDB 并从 localStorage 移除
      if (parsed.customAvatarUrl) {
        saveCustomAvatar(parsed.customAvatarUrl).catch((err) => {
          console.error('[IndexedDB] 自动迁移历史立绘失败:', err);
        });
        parsed.customAvatarUrl = null;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
      if (parsed.customBgUrl) {
        saveCustomBackground(parsed.customBgUrl).catch((err) => {
          console.error('[IndexedDB] 自动迁移历史背景失败:', err);
        });
        parsed.customBgUrl = null;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
      if (parsed.dossierPhotoUrl) {
        saveDossierToDB({ photoUrl: parsed.dossierPhotoUrl }).catch((err) => {
          console.error('[IndexedDB] 自动迁移历史档案照片失败:', err);
        });
        parsed.dossierPhotoUrl = null;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }

      const merged: RPGProfile = {
        ...DEFAULT_RPG_PROFILE,
        ...parsed,
        customAvatarUrl: null, // 绝对不存入 localStorage，由 IndexedDB 异步独占管理
        customBgUrl: null,     // 舞台背景图同样由 IndexedDB 异步独占管理
        dossierPhotoUrl: null, // 档案相片由 IndexedDB (rpg_dossier) 异步独占管理
        albumPhotos: [],       // 相册同样由 IndexedDB (rpg_dossier) 独占管理
        mood: (typeof parsed.mood === 'number' && parsed.mood !== 16) ? parsed.mood : 100,
        zodiac: parsed.zodiac || DEFAULT_RPG_PROFILE.zodiac,
        mbti: parsed.mbti || DEFAULT_RPG_PROFILE.mbti,
        gender: parsed.gender || DEFAULT_RPG_PROFILE.gender,
        storyPages: parsed.storyPages && parsed.storyPages.length > 0 ? parsed.storyPages : DEFAULT_RPG_PROFILE.storyPages,
        classes: parsed.classes && parsed.classes.length > 0 ? parsed.classes : RPG_CLASSES,
        lifeStatuses: Array.isArray(parsed.lifeStatuses) && parsed.lifeStatuses.length > 0
          ? parsed.lifeStatuses
          : (DEFAULT_RPG_PROFILE.lifeStatuses || []),
      };

      merged.maxExp = getMaxExpForLevel(merged.level || 1);
      let needsSave = false;

      // 确保心愿券初始为 0
      if (typeof merged.wishVouchers !== 'number' || merged.wishVouchers === 18) {
        merged.wishVouchers = 0;
        needsSave = true;
      }
      if (!merged.items || !merged.items.some((i) => i.type === 'wish')) {
        const defaultWishes = DEFAULT_RPG_PROFILE.items.filter((i) => i.type === 'wish');
        merged.items = [...(merged.items || []), ...defaultWishes];
        needsSave = true;
      }

      // 修正历史遗留假数据与溢出超标经验：当等级异常或经验超过上限时，彻底重置为正规初始状态 (Lv.1, 0/100)
      if (
        !merged.level ||
        merged.level === 35 ||
        merged.level === 12 ||
        merged.currentExp >= merged.maxExp ||
        typeof merged.currentExp !== 'number' ||
        merged.currentExp < 0
      ) {
        merged.level = 1;
        merged.currentExp = 0;
        merged.maxExp = getMaxExpForLevel(1);
        needsSave = true;
      }

      // 每日重置机制（北京时间）：跨日重置体力、专注度、心情为100，六维属性重置为0，由昨日修行业报隔天结算驱动等级升级
      let hasDailyReset = false;
      if (merged.lastActiveDate !== bjToday) {
        // 安全快照评估：优先使用前一日的高水位快照，若无则使用当前 attributes 中的数值
        const sourceAttrs = (merged.dailyHighWaterMark && merged.dailyHighWaterMark.dateStr === merged.lastActiveDate)
          ? merged.dailyHighWaterMark.attributes
          : merged.attributes;

        let totalPreviousAttrs = 0;
        const attrKeys: (keyof typeof merged.attributes)[] = ['STR', 'DEX', 'INT', 'SPI', 'CON', 'CHA'];
        for (const k of attrKeys) {
          const raw = sourceAttrs ? (sourceAttrs as any)[k] : 0;
          const val = typeof raw === 'number' ? raw : (raw?.value || 0);
          totalPreviousAttrs += val;
        }

        // 如果昨日/上次活跃有积攒六维，且目前没有尚未展示领取的修行业报，则生成修行业报
        if (totalPreviousAttrs > 0 && !merged.pendingDailySettlement) {
          merged.pendingDailySettlement = calculateDailySettlement(
            sourceAttrs,
            merged,
            merged.lastActiveDate || '昨日'
          );
        }

        merged.hp = 100;
        merged.mp = 100;
        merged.mood = 100;

        // 六维各项属性重置为 0
        for (const k of attrKeys) {
          if (merged.attributes && merged.attributes[k]) {
            merged.attributes[k].value = 0;
          }
        }

        // 初始化今日高水位安全快照
        merged.dailyHighWaterMark = {
          dateStr: bjToday,
          attributes: { STR: 0, DEX: 0, INT: 0, SPI: 0, CON: 0, CHA: 0 },
        };

        merged.lastActiveDate = bjToday;
        merged.lastMoodResetDate = bjToday;
        hasDailyReset = true;
      } else if (merged.lastMoodResetDate !== bjToday) {
        // 今日尚未执行过心情初始化（旧数据迁移），立即重置为 100
        merged.mood = 100;
        merged.lastMoodResetDate = bjToday;
        hasDailyReset = true;
      }

      // 动态同步六维上限（等级部分不用管，正常计算上限）
      const attrMax = computeAttributeMax(merged.level);
      for (const k of Object.keys(merged.attributes) as (keyof typeof merged.attributes)[]) {
        merged.attributes[k].maxValue = attrMax;
        if (merged.attributes[k].value > attrMax) {
          merged.attributes[k].value = attrMax;
        }
      }

      // 若发生跨日重置或异常数据修复，立刻持久化到存储中
      if (hasDailyReset || needsSave) {
        saveRPGProfile(merged);
      }

      return merged;
    }
  } catch (err) {
    console.warn('Failed to load RPG profile, using default', err);
  }

  const initial = { ...DEFAULT_RPG_PROFILE, lastActiveDate: bjToday, hp: 100, mp: 100, mood: 100 };
  const attrKeys: (keyof typeof initial.attributes)[] = ['STR', 'DEX', 'INT', 'SPI', 'CON', 'CHA'];
  for (const k of attrKeys) {
    if (initial.attributes && initial.attributes[k]) {
      initial.attributes[k].value = 0;
    }
  }
  saveRPGProfile(initial);
  return initial;
}

export function recordDailyHighWaterMark(
  profile: RPGProfile,
  dateStr: string = getBeijingDateString()
): void {
  if (!profile.dailyHighWaterMark || profile.dailyHighWaterMark.dateStr !== dateStr) {
    profile.dailyHighWaterMark = {
      dateStr,
      attributes: { STR: 0, DEX: 0, INT: 0, SPI: 0, CON: 0, CHA: 0 },
    };
  }
  for (const k of ['STR', 'DEX', 'INT', 'SPI', 'CON', 'CHA'] as const) {
    const curVal = profile.attributes?.[k]?.value || 0;
    profile.dailyHighWaterMark.attributes[k] = Math.max(
      profile.dailyHighWaterMark.attributes[k] || 0,
      curVal
    );
  }
}

export function saveRPGProfile(profile: RPGProfile): void {
  try {
    recordDailyHighWaterMark(profile);
    // 强制剥离立绘、背景、档案相片与相册图片，确保绝对不存入 localStorage，彻底消除移动端 5MB 配额溢出风险
    const { customAvatarUrl, customBgUrl, dossierPhotoUrl, albumPhotos, ...toSave } = profile;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...toSave,
        customAvatarUrl: null,
        customBgUrl: null,
        dossierPhotoUrl: null,
        albumPhotos: [],
      })
    );
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
  const expGain = 0; // 白天专注不再当场获得角色升级经验与跨级（100% 由次日清晨六维结算驱动）
  const goldGain = randRange(goldMin, goldMax);

  // 2. 扣减体力与精力 (下限 0)
  profile.hp = Math.max(0, profile.hp - hpCost);
  profile.mp = Math.max(0, profile.mp - mpCost);

  // 3. 经验与升级判定保持为 false
  const leveledUp = false;

  // 4. 确定目标六维并加点
  const currentAttrCap = computeAttributeMax(profile.level);
  const actualAttrKey = targetAttr || (profile.attributes.INT ? 'INT' : 'STR');
  if (profile.attributes[actualAttrKey]) {
    profile.attributes[actualAttrKey].value = Math.min(
      currentAttrCap,
      profile.attributes[actualAttrKey].value + attrGain
    );
  }

  // 5. 净化“拖延状态”Debuff
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

/**
 * 户外地图打卡消耗体力 (方案 A: 极简纯随机 6 ~ 12 点)
 * 体力见底时不阻断打卡，提示温馨疲劳提醒
 */
export function consumeStaminaOnCheckIn(): {
  consumed: number;
  currentHp: number;
  maxHp: number;
  isExhausted: boolean;
} {
  const profile = loadRPGProfile();
  const maxHp = profile.maxHp || 100;
  const currentHp = profile.hp ?? maxHp;

  if (currentHp <= 0) {
    return {
      consumed: 0,
      currentHp: 0,
      maxHp,
      isExhausted: true,
    };
  }

  // 纯随机扣除 6 ~ 12 点体力
  const cost = randRange(6, 12);
  const newHp = Math.max(0, currentHp - cost);
  profile.hp = newHp;
  saveRPGProfile(profile);
  window.dispatchEvent(new CustomEvent('cloudfly_rpg_updated'));

  return {
    consumed: cost,
    currentHp: newHp,
    maxHp,
    isExhausted: newHp === 0,
  };
}

/**
 * 增加或减少 RPG 六维属性（如精神 SPI +5）
 */
export function addRPGAttribute(
  key: 'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA',
  delta: number
): {
  oldValue: number;
  newValue: number;
  maxValue: number;
} {
  const profile = loadRPGProfile();
  const maxVal = computeAttributeMax(profile.level || 1);
  if (!profile.attributes) {
    profile.attributes = { ...DEFAULT_RPG_PROFILE.attributes };
  }
  if (!profile.attributes[key]) {
    profile.attributes[key] = { ...DEFAULT_RPG_PROFILE.attributes[key], maxValue: maxVal };
  }
  const currentAttr = profile.attributes[key];
  const oldVal = currentAttr?.value || 0;
  const newVal = Math.min(maxVal, Math.max(0, oldVal + delta));

  profile.attributes[key].value = newVal;
  profile.attributes[key].maxValue = maxVal;

  // 若为精力 (SPI)，同步增加即时精力池
  if (key === 'SPI' && typeof profile.mp === 'number') {
    const maxMp = profile.maxMp || 100;
    profile.mp = Math.min(maxMp, profile.mp + delta);
  }

  saveRPGProfile(profile);
  window.dispatchEvent(new CustomEvent('cloudfly_rpg_updated'));
  window.dispatchEvent(new CustomEvent('cloudfly_profile_updated', { detail: profile }));
  return { oldValue: oldVal, newValue: newVal, maxValue: maxVal };
}


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
