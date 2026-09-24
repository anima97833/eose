import { WishItem, GachaPalette, DEFAULT_GACHA_PALETTE, CapsuleColorKey } from './gachaTypes';
import { loadRPGProfile, saveRPGProfile } from '../../../../core/rpg/rpgStorage';

const WISHES_STORAGE_KEY = 'gachapon_wishes_v1';
const PALETTE_STORAGE_KEY = 'gachapon_palette_v1';

export function loadWishes(): WishItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load gachapon wishes:', err);
  }
  return [];
}

export function saveWishes(wishes: WishItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(wishes));
  } catch (err) {
    console.warn('Failed to save gachapon wishes:', err);
  }
}

export function addWish(content: string, colorKey: CapsuleColorKey, icon?: string): WishItem {
  const wishes = loadWishes();
  const newWish: WishItem = {
    id: 'wish_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    content: content.trim(),
    colorKey,
    icon: icon || '✨',
    createdAt: Date.now(),
    status: 'in_machine',
  };
  wishes.unshift(newWish);
  saveWishes(wishes);
  return newWish;
}

export function returnWishToMachine(id: string): void {
  const wishes = loadWishes();
  const target = wishes.find((w) => w.id === id);
  if (target) {
    target.status = 'in_machine';
    saveWishes(wishes);
  }
}

/**
 * 标记完成心愿纸条：仅提升角色心情值 (Mood)，不增加任何其他属性
 */
export function markWishCompleted(id: string): { newMood: number } {
  const wishes = loadWishes();
  const target = wishes.find((w) => w.id === id);
  if (target) {
    target.status = 'completed';
    target.completedAt = Date.now();
    saveWishes(wishes);
  }

  // 严格遵守规约：仅更新角色心情值 (mood)，不增加智力/经验等任何属性
  let newMood = 100;
  try {
    const profile = loadRPGProfile();
    const currentMood = typeof profile.mood === 'number' ? profile.mood : 100;
    // 心情值提升 10 点，上限 100（若已满可保持或微溢出至 100）
    newMood = Math.min(100, currentMood + 10);
    profile.mood = newMood;
    saveRPGProfile(profile);
    window.dispatchEvent(new CustomEvent('cloudfly_rpg_updated'));
  } catch (err) {
    console.warn('Failed to update character mood:', err);
  }

  return { newMood };
}

export function deleteWish(id: string): void {
  const wishes = loadWishes().filter((w) => w.id !== id);
  saveWishes(wishes);
}

export function loadGachaPalette(): GachaPalette {
  if (typeof window === 'undefined') return DEFAULT_GACHA_PALETTE;
  try {
    const raw = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.primary) {
        return {
          ...DEFAULT_GACHA_PALETTE,
          ...parsed,
          buttonBg: parsed.buttonBg || DEFAULT_GACHA_PALETTE.buttonBg,
          buttonBorder: parsed.buttonBorder || parsed.secondary || DEFAULT_GACHA_PALETTE.buttonBorder,
          buttonText: parsed.buttonText || parsed.secondary || DEFAULT_GACHA_PALETTE.buttonText,
          titleColor: parsed.titleColor || parsed.secondary || DEFAULT_GACHA_PALETTE.titleColor,
          badgeBg: parsed.badgeBg || parsed.secondary || DEFAULT_GACHA_PALETTE.badgeBg,
          badgeText: parsed.badgeText || DEFAULT_GACHA_PALETTE.badgeText,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to load gacha palette:', err);
  }
  return DEFAULT_GACHA_PALETTE;
}

export function saveGachaPalette(palette: GachaPalette): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(palette));
  } catch (err) {
    console.warn('Failed to save gacha palette:', err);
  }
}
