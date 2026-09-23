/**
 * 隐藏彩蛋触发引擎 (Easter Egg Engine)
 * 监听全屏偶然交互并自动激活彩蛋任务
 */

import { triggerEasterEgg } from './questStorage';

let clockTapCount = 0;
let lastClockTapTime = 0;
let momentLikeCount = 0;
let idleTimer: number | null = null;

/**
 * 检查当前时间是否为深夜 (23:00 ~ 05:00)
 */
export function checkLateNightActivity(): void {
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 5) {
    triggerEasterEgg('NIGHT_RAIN');
  }
}

/**
 * 记录时钟轻触（5次触发时空裂缝）
 */
export function recordClockTap(): void {
  const now = Date.now();
  if (now - lastClockTapTime > 2500) {
    clockTapCount = 1;
  } else {
    clockTapCount += 1;
  }
  lastClockTapTime = now;

  if (clockTapCount >= 5) {
    triggerEasterEgg('CLOCK_RIFT');
    clockTapCount = 0;
  }
}

/**
 * 记录朋友圈点赞（累计 3 次点赞触发街角流浪猫）
 */
export function recordMomentLike(): void {
  momentLikeCount += 1;
  if (momentLikeCount >= 3) {
    triggerEasterEgg('STREET_CAT');
  }
}

/**
 * 记录罗盘完整旋转（360度触发微风去向）
 */
export function recordCompassFullTurn(): void {
  triggerEasterEgg('WIND_DIRECTION');
}

/**
 * 初始化主屏静止沉思发呆侦听
 */
export function initIdleMasterDetector(): () => void {
  const resetTimer = () => {
    if (idleTimer) window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      triggerEasterEgg('IDLE_MASTER');
    }, 15000); // 15秒无触控触发
  };

  window.addEventListener('pointerdown', resetTimer);
  window.addEventListener('keydown', resetTimer);
  resetTimer();

  return () => {
    if (idleTimer) window.clearTimeout(idleTimer);
    window.removeEventListener('pointerdown', resetTimer);
    window.removeEventListener('keydown', resetTimer);
  };
}
