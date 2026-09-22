import { CharacterProfile, INITIAL_CHARACTERS } from '../types/character';

const CHARACTERS_STORAGE_KEY = 'neumorphic_phone_characters';

export function loadCharacters(): CharacterProfile[] {
  if (typeof window === 'undefined') return INITIAL_CHARACTERS;
  try {
    const raw = localStorage.getItem(CHARACTERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_CHARACTERS;
}

export function saveCharacters(characters: CharacterProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
  } catch {
    // fallback
  }
}

export function getCharacterById(id: string): CharacterProfile | undefined {
  const all = loadCharacters();
  return all.find((c) => c.id === id);
}
