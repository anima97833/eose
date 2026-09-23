import { RPGProfile, ExtremeChallengeType, ExtremeChallengeRecord, ExtremeProjectProgress } from './types';

export const DEFAULT_PROJECT_PROGRESS: ExtremeProjectProgress = {
  currentDayIndex: 1,
  lastCheckInDate: null,
  claimedDays: [],
  isCompleted: false,
};

export function getProjectProgress(
  extremeChallenge?: ExtremeChallengeRecord,
  challengeType: ExtremeChallengeType = 'early_bird'
): ExtremeProjectProgress {
  if (!extremeChallenge || !extremeChallenge.projects) {
    return { ...DEFAULT_PROJECT_PROGRESS };
  }
  return extremeChallenge.projects[challengeType] || { ...DEFAULT_PROJECT_PROGRESS };
}

export interface ChallengeProjectConfig {
  type: ExtremeChallengeType;
  title: string;
  shortTitle: string;
  icon: string;
  desc: string;
  timeWindowText: string;
  dailyRewardText: string;
  finalRewardText: string;
  accentColor: string;
}

export const CHALLENGE_PROJECTS: ChallengeProjectConfig[] = [
  {
    type: 'early_bird',
    title: '早起挑战',
    shortTitle: '早起',
    icon: '🌅',
    desc: '7:00 起床，07:00:00 - 07:30:00 间准时打卡',
    timeWindowText: '07:00:00 - 07:30:00',
    dailyRewardText: '精神 +2 · 钻石碎片 +2',
    finalRewardText: '精神 +10 · 完整钻石 +1 · 许愿券 +1 · 称号「晨光破晓者」',
    accentColor: '#FF6B4A',
  },
  {
    type: 'early_sleep',
    title: '早睡挑战',
    shortTitle: '早睡',
    icon: '🌙',
    desc: '22:00 睡眠，21:30:00 - 22:00:00 间准时打卡',
    timeWindowText: '21:30:00 - 22:00:00',
    dailyRewardText: '体魄 +2 · 体力回满 · 钻石碎片 +2',
    finalRewardText: '体魄 +10 · 完整钻石 +1 · 许愿券 +1 · 称号「夜巡安眠者」',
    accentColor: '#6366F1',
  },
  {
    type: 'workout',
    title: '运动挑战',
    shortTitle: '运动',
    icon: '🏃',
    desc: '每天专注运动 15 分钟以上并打卡',
    timeWindowText: '全天可打卡 (需运动≥15分钟)',
    dailyRewardText: '力量 +1 · 敏捷 +1 · 钻石碎片 +2',
    finalRewardText: '力量 +5 · 敏捷 +5 · 完整钻石 +1 · 许愿券 +1 · 称号「暴风行者」',
    accentColor: '#10B981',
  },
  {
    type: 'fruits',
    title: '瓜果挑战',
    shortTitle: '瓜果',
    icon: '🍎',
    desc: '每天摄入新鲜水果或蔬菜并打卡',
    timeWindowText: '全天可打卡',
    dailyRewardText: '体魄 +1 · 心情 +5 · 钻石碎片 +2',
    finalRewardText: '体魄 +5 · 心情 +15 · 完整钻石 +1 · 许愿券 +1 · 称号「自然之子」',
    accentColor: '#F59E0B',
  },
];

/**
 * 获取当前准确的北京时间 (UTC+8) 及当天秒数
 */
export function getBeijingTimeInfo() {
  const now = new Date();
  const beijingMs = now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 3600000;
  const bj = new Date(beijingMs);
  const h = bj.getHours();
  const m = bj.getMinutes();
  const s = bj.getSeconds();
  const totalSeconds = h * 3600 + m * 60 + s;
  const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const dateStr = `${bj.getFullYear()}-${String(bj.getMonth() + 1).padStart(2, '0')}-${String(bj.getDate()).padStart(2, '0')}`;
  return { h, m, s, totalSeconds, timeStr, dateStr };
}

/**
 * 校验当前是否处于方案 B（铁律硬核模式）所规定的打卡时段内
 */
export function checkChallengeTimeWindow(type: ExtremeChallengeType): {
  valid: boolean;
  message: string;
  timeStr: string;
  dateStr: string;
} {
  const { totalSeconds, timeStr, dateStr } = getBeijingTimeInfo();

  if (type === 'early_bird') {
    // 07:00:00 (25200s) ~ 07:30:00 (27000s)
    const start = 7 * 3600;
    const end = 7 * 3600 + 30 * 60;
    const valid = totalSeconds >= start && totalSeconds <= end;
    return {
      valid,
      message: valid ? '早起打卡时段生效中！' : '打卡时间为 07:00:00 - 07:30:00，当前未在时段内',
      timeStr,
      dateStr,
    };
  }

  if (type === 'early_sleep') {
    // 21:30:00 (77400s) ~ 22:00:00 (79200s)
    const start = 21 * 3600 + 30 * 60;
    const end = 22 * 3600;
    const valid = totalSeconds >= start && totalSeconds <= end;
    return {
      valid,
      message: valid ? '早睡打卡时段生效中！' : '打卡时间为 21:30:00 - 22:00:00，当前未在时段内',
      timeStr,
      dateStr,
    };
  }

  // 运动与瓜果全天皆可打卡
  return {
    valid: true,
    message: '全天可打卡',
    timeStr,
    dateStr,
  };
}

/**
 * 执行极限挑战每日打卡与结算奖励
 */
export function executeExtremeCheckIn(
  profile: RPGProfile,
  challengeType: ExtremeChallengeType
): {
  success: boolean;
  message: string;
  updatedProfile: RPGProfile;
} {
  const timeCheck = checkChallengeTimeWindow(challengeType);
  const existingProjects: Record<ExtremeChallengeType, ExtremeProjectProgress> = {
    early_bird: { ...DEFAULT_PROJECT_PROGRESS },
    early_sleep: { ...DEFAULT_PROJECT_PROGRESS },
    workout: { ...DEFAULT_PROJECT_PROGRESS },
    fruits: { ...DEFAULT_PROJECT_PROGRESS },
    ...(profile.extremeChallenge?.projects || {}),
  };

  const projectState = existingProjects[challengeType] || { ...DEFAULT_PROJECT_PROGRESS };

  // 检查今日是否已打卡
  if (projectState.lastCheckInDate === timeCheck.dateStr) {
    return {
      success: false,
      message: '今日该挑战已完成打卡，请明天再来哦~',
      updatedProfile: profile,
    };
  }

  // 检查是否在打卡时段
  if (!timeCheck.valid) {
    return {
      success: false,
      message: `未在规定打卡时段内（当前北京时间: ${timeCheck.timeStr}）`,
      updatedProfile: profile,
    };
  }

  const dayIndex = projectState.currentDayIndex || 1; // 1 ~ 7
  const isFinalDay = dayIndex === 7;

  // 复制属性
  const updatedAttrs = { ...profile.attributes };
  let updatedMood = profile.mood ?? 100;
  let updatedHp = profile.hp;
  let updatedTitle = profile.title;
  let rewardDesc = '';

  // 基础打卡奖励：+2 钻石碎片
  let shardsEarned = 2;
  let wholeDiamondsEarned = isFinalDay ? 1 : 0;
  let wishVouchersEarned = isFinalDay ? 1 : 0;

  // 根据项目发放属性成长
  if (challengeType === 'early_bird') {
    const spiVal = updatedAttrs.SPI.value + (isFinalDay ? 10 : 2);
    updatedAttrs.SPI = { ...updatedAttrs.SPI, value: Math.min(updatedAttrs.SPI.maxValue || 100, spiVal) };
    if (isFinalDay) {
      updatedTitle = '晨光破晓者';
      rewardDesc = '精神 +10 · 完整钻石 +1 · 许愿券 +1 · 称号「晨光破晓者」';
    } else {
      rewardDesc = '精神 +2 · 钻石碎片 +2';
    }
  } else if (challengeType === 'early_sleep') {
    const conVal = updatedAttrs.CON.value + (isFinalDay ? 10 : 2);
    updatedAttrs.CON = { ...updatedAttrs.CON, value: Math.min(updatedAttrs.CON.maxValue || 100, conVal) };
    updatedHp = profile.maxHp || 100; // 体力回满
    if (isFinalDay) {
      updatedTitle = '夜巡安眠者';
      rewardDesc = '体魄 +10 · 体力已回满 · 完整钻石 +1 · 许愿券 +1 · 称号「夜巡安眠者」';
    } else {
      rewardDesc = '体魄 +2 · 体力已回满 · 钻石碎片 +2';
    }
  } else if (challengeType === 'workout') {
    const strVal = updatedAttrs.STR.value + (isFinalDay ? 5 : 1);
    const dexVal = updatedAttrs.DEX.value + (isFinalDay ? 5 : 1);
    updatedAttrs.STR = { ...updatedAttrs.STR, value: Math.min(updatedAttrs.STR.maxValue || 100, strVal) };
    updatedAttrs.DEX = { ...updatedAttrs.DEX, value: Math.min(updatedAttrs.DEX.maxValue || 100, dexVal) };
    if (isFinalDay) {
      updatedTitle = '暴风行者';
      rewardDesc = '力量 +5 · 敏捷 +5 · 完整钻石 +1 · 许愿券 +1 · 称号「暴风行者」';
    } else {
      rewardDesc = '力量 +1 · 敏捷 +1 · 钻石碎片 +2';
    }
  } else if (challengeType === 'fruits') {
    const conVal = updatedAttrs.CON.value + (isFinalDay ? 5 : 1);
    updatedAttrs.CON = { ...updatedAttrs.CON, value: Math.min(updatedAttrs.CON.maxValue || 100, conVal) };
    updatedMood = Math.min(100, updatedMood + (isFinalDay ? 15 : 5));
    if (isFinalDay) {
      updatedTitle = '自然之子';
      rewardDesc = '体魄 +5 · 心情 +15 · 完整钻石 +1 · 许愿券 +1 · 称号「自然之子」';
    } else {
      rewardDesc = '体魄 +1 · 心情 +5 · 钻石碎片 +2';
    }
  }

  // 钻石碎片累计与自动转化（每20个换1个钻石）
  const curShards = profile.signInState?.diamondShards || 0;
  const totalShards = curShards + shardsEarned;
  const convertedDiamonds = Math.floor(totalShards / 20);
  const remainingShards = totalShards % 20;

  const totalNewCrystals = wholeDiamondsEarned + convertedDiamonds;
  const updatedCrystals = (profile.crystals || 0) + totalNewCrystals;

  // 状态推进
  let nextDayIndex = dayIndex + 1;
  let nextClaimedDays = [...(projectState.claimedDays || []), dayIndex];
  let isCompleted = false;

  if (isFinalDay) {
    isCompleted = true;
    nextDayIndex = 1;
    nextClaimedDays = [];
  }

  const updatedProjects: Record<ExtremeChallengeType, ExtremeProjectProgress> = {
    ...existingProjects,
    [challengeType]: {
      currentDayIndex: nextDayIndex,
      lastCheckInDate: timeCheck.dateStr,
      claimedDays: nextClaimedDays,
      isCompleted,
    },
  };

  const updatedRecord: ExtremeChallengeRecord = {
    activeType: challengeType,
    projects: updatedProjects,
  };

  const updatedProfile: RPGProfile = {
    ...profile,
    attributes: updatedAttrs,
    mood: updatedMood,
    hp: updatedHp,
    title: updatedTitle,
    crystals: updatedCrystals,
    wishVouchers: (profile.wishVouchers || 0) + wishVouchersEarned,
    signInState: profile.signInState
      ? { ...profile.signInState, diamondShards: remainingShards }
      : {
          currentRound: 1,
          currentDayIndex: 1,
          lastSignInDate: null,
          diamondShards: remainingShards,
          claimedDays: [],
        },
    extremeChallenge: updatedRecord,
  };

  const successMsg = isFinalDay
    ? `🏆 恭喜达成第7天！极限挑战通关！获得奖励：${rewardDesc}（新挑战已解锁）`
    : `✨ 第 ${dayIndex} 天挑战打卡成功！获得奖励：${rewardDesc}（持存碎片: ${remainingShards}/20）`;

  return {
    success: true,
    message: successMsg,
    updatedProfile,
  };
}
