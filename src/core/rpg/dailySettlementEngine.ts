import { RPGProfile, DailySettlementSnapshot, RPGAttribute } from './types';
import { computeAttributeMax } from './rpgStorage';

export const ATTR_KEYS: (keyof RPGProfile['attributes'])[] = ['STR', 'DEX', 'INT', 'SPI', 'CON', 'CHA'];

export const ATTR_CHINESE_NAMES: Record<keyof RPGProfile['attributes'], string> = {
  STR: '力量',
  DEX: '敏捷',
  INT: '智力',
  SPI: '精神',
  CON: '体质',
  CHA: '魅力',
};

/**
 * 专业 RPG 分段多项式增长经验模型：
 * MaxExp(L) = 100 + 45 * (L - 1)^1.25
 * 兼具前期爽快过渡与长线稳健升级节奏，消除硬核指数爆炸问题
 */
export function getMaxExpForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.round(100 + 45 * Math.pow(safeLevel - 1, 1.25));
}

/**
 * 根据昨日六维表现，计算昨日修行业报快照
 */
export function calculateDailySettlement(
  rawAttributes: Record<string, number | RPGAttribute>,
  currentProfile: RPGProfile,
  settlementDateStr: string
): DailySettlementSnapshot {
  const extractedAttrs: Record<'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA', number> = {
    STR: 0,
    DEX: 0,
    INT: 0,
    SPI: 0,
    CON: 0,
    CHA: 0,
  };

  let totalAttr = 0;
  let highestKey: 'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA' = 'STR';
  let highestVal = 0;
  let balancedCount = 0; // 达到 30 点的维度数

  for (const k of ATTR_KEYS) {
    const raw = rawAttributes[k];
    const val = typeof raw === 'number' ? raw : (raw?.value || 0);
    extractedAttrs[k] = val;
    totalAttr += val;

    if (val > highestVal) {
      highestVal = val;
      highestKey = k;
    }

    if (val >= 30) {
      balancedCount += 1;
    }
  }

  // 1. 基础经验 (1:1 转换)
  const baseExp = totalAttr;

  // 2. 单项突破加成 (High-Water Mark Bonus)
  let breakthroughBonusRate = 0;
  if (highestVal >= 80) {
    breakthroughBonusRate = 0.30; // 触碰大师线 +30%
  } else if (highestVal >= 50) {
    breakthroughBonusRate = 0.15; // 触碰卓越线 +15%
  }

  // 3. 均衡共鸣加成 (Hexagonal Balance Bonus)
  let harmonyBonusRate = 0;
  if (balancedCount >= 5) {
    harmonyBonusRate = 0.40; // 全维共振 +40%
  } else if (balancedCount >= 3) {
    harmonyBonusRate = 0.20; // 三维均衡 +20%
  }

  // 4. 计算总 EXP
  const totalMultiplier = 1 + breakthroughBonusRate + harmonyBonusRate;
  const totalExpEarned = Math.round(baseExp * totalMultiplier);

  // 5. 评级评定与额外物资奖励
  let rating: 'S' | 'A' | 'B' | 'C' = 'C';
  let ratingTitle = '休养生息';
  let diamondReward = 0;
  let shardReward = 0;

  if (totalAttr >= 150) {
    rating = 'S';
    ratingTitle = '气冲霄汉';
    diamondReward = 1;
    shardReward = 0;
  } else if (totalAttr >= 90) {
    rating = 'A';
    ratingTitle = '精进不休';
    shardReward = 5;
  } else if (totalAttr >= 40) {
    rating = 'B';
    ratingTitle = '步履不停';
    shardReward = 2;
  } else {
    rating = 'C';
    ratingTitle = '休养生息';
    shardReward = 0;
  }

  // 6. 模拟推演等级提升与跨级
  const oldLevel = currentProfile.level || 1;
  const oldExp = currentProfile.currentExp || 0;

  let simLevel = oldLevel;
  let simExp = oldExp + totalExpEarned;
  let simMaxExp = getMaxExpForLevel(simLevel);
  let leveledUp = false;
  let levelUpCount = 0;

  while (simExp >= simMaxExp) {
    simExp -= simMaxExp;
    simLevel += 1;
    levelUpCount += 1;
    leveledUp = true;
    simMaxExp = getMaxExpForLevel(simLevel);
  }

  return {
    dateStr: settlementDateStr,
    attributes: extractedAttrs,
    totalAttr,
    highestAttrKey: highestKey,
    highestAttrVal: highestVal,
    baseExp,
    breakthroughBonusRate,
    harmonyBonusRate,
    totalExpEarned,
    rating,
    ratingTitle,
    diamondReward,
    shardReward,
    oldLevel,
    oldExp,
    newLevel: simLevel,
    newExp: simExp,
    maxExp: simMaxExp,
    leveledUp,
    levelUpCount,
  };
}

/**
 * 将已结算的修行业报正式应用到角色存档中
 */
export function applyDailySettlement(
  profile: RPGProfile,
  snapshot: DailySettlementSnapshot
): RPGProfile {
  // 1. 等级与经验推进
  const updatedProfile: RPGProfile = {
    ...profile,
    level: snapshot.newLevel,
    currentExp: snapshot.newExp,
    maxExp: snapshot.maxExp,
    pendingDailySettlement: null, // 清空待展示标记
  };

  // 2. 同步六维属性上限（随新等级提升）
  const newCap = computeAttributeMax(snapshot.newLevel);
  const updatedAttrs = { ...updatedProfile.attributes };
  for (const k of ATTR_KEYS) {
    if (updatedAttrs[k]) {
      updatedAttrs[k] = {
        ...updatedAttrs[k],
        maxValue: newCap,
      };
    }
  }
  updatedProfile.attributes = updatedAttrs;

  // 3. 结算额外钻石与碎片奖励
  let curShards = updatedProfile.signInState?.diamondShards || 0;
  const totalShards = curShards + (snapshot.shardReward || 0);
  const convertedDiamonds = Math.floor(totalShards / 20);
  const remainingShards = totalShards % 20;

  const totalNewDiamonds = (snapshot.diamondReward || 0) + convertedDiamonds;
  updatedProfile.crystals = (updatedProfile.crystals || 0) + totalNewDiamonds;

  if (updatedProfile.signInState) {
    updatedProfile.signInState = {
      ...updatedProfile.signInState,
      diamondShards: remainingShards,
    };
  }

  return updatedProfile;
}
