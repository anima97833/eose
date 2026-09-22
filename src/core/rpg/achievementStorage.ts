import { RPGAchievement, DEFAULT_ACHIEVEMENTS } from './achievementTypes';

const STORAGE_KEY = 'cloudfly_user_achievements_v1';

export function loadAchievements(): RPGAchievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load achievements from storage:', err);
  }
  return DEFAULT_ACHIEVEMENTS;
}

export function saveAchievements(achievements: RPGAchievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  } catch (err) {
    console.error('Failed to save achievements to storage:', err);
  }
}
