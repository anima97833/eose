import { RPGProfile, RPGAttribute, RPGSignInState } from './types';
import { getBeijingDateString } from './rpgStorage';

// 第1到第6天获得的正常碎片数（所见即所得，正常数值）
export const DAILY_SHARDS_REWARDS = [3, 5, 5, 7, 7, 9] as const;

export interface AttributeCheckItem {
  key: string;
  name: string;
  value: number;
  passed: boolean;
}

export interface SignInEligibilityResult {
  eligible: boolean;
  qualifiedCount: number;
  neededCount: number;
  details: AttributeCheckItem[];
  alreadySignedToday: boolean;
  todayDateStr: string;
}

export interface SignInExecuteResult {
  success: boolean;
  message: string;
  shardsEarned: number;
  wholeDiamondsEarned: number;
  convertedDiamonds: number;
  currentShards: number;
  updatedProfile: RPGProfile;
}

/**
 * 校验今日是否具备签到资格（六维指数至少3项达到50）
 */
export function checkSignInEligibility(profile: RPGProfile): SignInEligibilityResult {
  const attrs = profile.attributes || {};
  const list: AttributeCheckItem[] = Object.values(attrs).map((attr) => ({
    key: attr.key,
    name: attr.name,
    value: attr.value || 0,
    passed: (attr.value || 0) >= 50,
  }));

  const qualifiedCount = list.filter((item) => item.passed).length;
  const today = getBeijingDateString();
  const alreadySignedToday = profile.signInState?.lastSignInDate === today;

  return {
    eligible: qualifiedCount >= 3 && !alreadySignedToday,
    qualifiedCount,
    neededCount: 3,
    details: list,
    alreadySignedToday,
    todayDateStr: today,
  };
}

/**
 * 执行今日签到并计算碎片与钻石转化
 */
export function executeSignIn(profile: RPGProfile): SignInExecuteResult {
  const eligibility = checkSignInEligibility(profile);

  if (eligibility.alreadySignedToday) {
    return {
      success: false,
      message: '今日已完成签到，请明天再来哦~',
      shardsEarned: 0,
      wholeDiamondsEarned: 0,
      convertedDiamonds: 0,
      currentShards: profile.signInState?.diamondShards || 0,
      updatedProfile: profile,
    };
  }

  if (eligibility.qualifiedCount < 3) {
    return {
      success: false,
      message: `六维指数未达标：需至少 3 项属性达到 50（当前已达成 ${eligibility.qualifiedCount}/3 项）`,
      shardsEarned: 0,
      wholeDiamondsEarned: 0,
      convertedDiamonds: 0,
      currentShards: profile.signInState?.diamondShards || 0,
      updatedProfile: profile,
    };
  }

  const state: RPGSignInState = profile.signInState || {
    currentRound: 1,
    currentDayIndex: 1,
    lastSignInDate: null,
    diamondShards: 0,
    claimedDays: [],
  };

  const dayIndex = state.currentDayIndex; // 1 ~ 7
  let shardsEarned = 0;
  let wholeDiamondsEarned = 0;

  if (dayIndex >= 1 && dayIndex <= 6) {
    shardsEarned = DAILY_SHARDS_REWARDS[dayIndex - 1];
  } else if (dayIndex === 7) {
    wholeDiamondsEarned = 1; // 第七天直接赠送一整颗钻石
  }

  // 碎片自动兑换钻石：每20个钻石碎片兑换一个钻石
  const totalShards = (state.diamondShards || 0) + shardsEarned;
  const convertedDiamonds = Math.floor(totalShards / 20);
  const remainingShards = totalShards % 20;

  const totalNewCrystals = wholeDiamondsEarned + convertedDiamonds;
  const updatedCrystals = (profile.crystals || 0) + totalNewCrystals;

  // 轮次推进逻辑（方向 A：按累计达成天数推进，满7天开启下一轮）
  let nextRound = state.currentRound;
  let nextDayIndex = dayIndex + 1;
  let nextClaimedDays = [...(state.claimedDays || []), dayIndex];

  if (dayIndex === 7) {
    // 完成第七天签到，下一天可开启新一轮
    nextRound += 1;
    nextDayIndex = 1;
    nextClaimedDays = [];
  }

  const updatedSignInState: RPGSignInState = {
    currentRound: nextRound,
    currentDayIndex: nextDayIndex,
    lastSignInDate: eligibility.todayDateStr,
    diamondShards: remainingShards,
    claimedDays: nextClaimedDays,
  };

  const updatedProfile: RPGProfile = {
    ...profile,
    crystals: updatedCrystals,
    signInState: updatedSignInState,
  };

  let msg = '';
  if (dayIndex === 7) {
    msg = '🎉 恭喜达成第七天！荣获【1 颗完整钻石】并已同步加入自由天数！新一轮即将开启！';
  } else if (convertedDiamonds > 0) {
    msg = `✨ 签到成功！获得 ${shardsEarned} 碎片，碎片累计满 20 自动合成了 ${convertedDiamonds} 颗钻石！`;
  } else {
    msg = `✨ 第 ${dayIndex} 天签到成功！获得 ${shardsEarned} 钻石碎片（当前持存: ${remainingShards}/20）`;
  }

  return {
    success: true,
    message: msg,
    shardsEarned,
    wholeDiamondsEarned,
    convertedDiamonds,
    currentShards: remainingShards,
    updatedProfile,
  };
}
