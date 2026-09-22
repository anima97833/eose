import Dexie, { type Table } from 'dexie';
import { CharacterProfile } from '../../types/character';
import { ChatMessageItem } from '../../types/chat';
import { MomentItem, MomentsConfig } from '../moments/momentsTypes';
import { MemoCategory, MemoChapter } from '../memo/memoTypes';
import { SWFGame } from '../arcade/arcadeTypes';
import { MovieRecord } from '../cinema/cinemaTypes';
import { SavedPoemRecord } from '../poetry/poetryTypes';
import { PhysicalBookRecord } from '../books/bookTypes';
import { StoryNovel, StoryWordMistake, BookSourceRule } from '../storyword/storyWordTypes';

export interface StoredSettingsEntity {
  key: string;
  data: unknown;
}

export interface MemoryBookMessage {
  id?: string;
  sender: 'user' | 'assistant' | 'system';
  name?: string;
  content: string;
  timestamp?: number;
}

export interface MemoryBookRecord {
  id: string;
  title: string;
  characterName: string;
  shelfTier: 1 | 2;
  coverColor: string;
  spineHeight: number;
  spineWidth: number;
  leanAngle: number;
  createdAt: number;
  messageCount: number;
  totalWords: number;
  messages: MemoryBookMessage[];
}

export interface PomodoroSessionRecord {
  id: string;
  taskId?: string;
  taskTitle?: string;
  category: string;
  mode: 'focus' | 'short_break' | 'long_break';
  durationMinutes: number;
  actualSeconds: number;
  isCompleted: boolean;
  completedAt: number;
}

export interface PomodoroTaskRecord {
  id: string;
  title: string;
  category: 'work' | 'study' | 'read' | 'fitness' | 'life';
  categoryLabel: string;
  estimatedPoms: number;
  completedPoms: number;
  isCompleted: boolean;
  createdAt: number;
  targetAttr?: 'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA';
  difficulty?: 'easy' | 'normal' | 'hard' | 'expert';
}

export interface BrowserHistoryRecord {
  id: string;
  url: string;
  title: string;
  visitedAt: number;
}

export interface BrowserBookmarkRecord {
  id: string;
  title: string;
  url: string;
  icon?: string;
  createdAt: number;
}

export interface BrowserShortcutRecord {
  id: string;
  title: string;
  url: string;
  letter: string;
  bgColor: string;
  textColor: string;
  createdAt: number;
}

export interface RPGItemImageRecord {
  id: string;
  dataUrl: string;
  updatedAt: number;
}

export interface RPGSkillImageRecord {
  id: string;
  dataUrl: string;
  updatedAt: number;
}

export interface RPGAttributeImageRecord {
  id: string; // 'STR' | 'DEX' | 'INT' | 'SPI' | 'CON' | 'CHA'
  dataUrl: string;
  updatedAt: number;
}

export interface RPGClassImageRecord {
  id: string; // class id
  dataUrl: string;
  updatedAt: number;
}

export interface RPGMealRecord {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dishName: string; // <=5 chars
  rating: number; // 1 to 3
  review: string; // 一句话评价
  imageData?: string; // 用户上传菜品大图 Base64
  badgeKey?: string; // 对应图2中果子预设类型
  slotIndex?: number; // 0~8
  updatedAt: number;
}

export interface RPGDossierRecord {
  id: string; // 'default'
  name: string;
  title: string;
  zodiac: string;
  mbti: string;
  gender: string;
  photoUrl: string | null; // 个人档案照片 (与正中间立绘完全分离，保存在IndexedDB)
  storyPages: Array<{
    id: string;
    pageIndex: number;
    date: string;
    content: string;
    updatedAt: number;
  }>;
  albumPhotos?: string[];
  updatedAt: number;
}

export class NeumorphicPhoneDatabase extends Dexie {
  characters!: Table<CharacterProfile, string>;
  messages!: Table<ChatMessageItem, string>;
  settings!: Table<StoredSettingsEntity, string>;
  memory_books!: Table<MemoryBookRecord, string>;
  pomodoro_sessions!: Table<PomodoroSessionRecord, string>;
  pomodoro_tasks!: Table<PomodoroTaskRecord, string>;
  browser_history!: Table<BrowserHistoryRecord, string>;
  browser_bookmarks!: Table<BrowserBookmarkRecord, string>;
  browser_shortcuts!: Table<BrowserShortcutRecord, string>;
  rpg_item_images!: Table<RPGItemImageRecord, string>;
  rpg_skill_images!: Table<RPGSkillImageRecord, string>;
  rpg_attribute_images!: Table<RPGAttributeImageRecord, string>;
  rpg_class_images!: Table<RPGClassImageRecord, string>;
  rpg_meal_records!: Table<RPGMealRecord, string>;
  rpg_dossier!: Table<RPGDossierRecord, string>;
  moments_items!: Table<MomentItem, string>;
  moments_config!: Table<MomentsConfig, string>;
  memo_categories!: Table<MemoCategory, string>;
  memo_chapters!: Table<MemoChapter, string>;
  swf_games!: Table<SWFGame, string>;
  movies!: Table<MovieRecord, string>;
  poems!: Table<SavedPoemRecord, string>;
  books!: Table<PhysicalBookRecord, string>;
  storyword_novels!: Table<StoryNovel, string>;
  storyword_mistakes!: Table<StoryWordMistake, string>;
  storyword_sources!: Table<BookSourceRule, string>;

  constructor() {
    super('NeumorphicAIDatabase');
    this.version(1).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
    });
    this.version(2).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
    });
    this.version(3).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
    });
    this.version(4).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
    });
    this.version(5).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
    });
    this.version(6).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
    });
    this.version(7).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
    });
    this.version(8).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
    });
    this.version(9).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
      rpg_class_images: 'id, updatedAt',
    });
    this.version(10).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
      rpg_class_images: 'id, updatedAt',
      rpg_meal_records: 'id, date, mealType, rating, updatedAt',
    });
    this.version(11).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
      rpg_class_images: 'id, updatedAt',
      rpg_meal_records: 'id, date, mealType, rating, updatedAt',
      rpg_dossier: 'id, updatedAt',
    });
    this.version(12).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
      rpg_class_images: 'id, updatedAt',
      rpg_meal_records: 'id, date, mealType, rating, updatedAt',
      rpg_dossier: 'id, updatedAt',
      moments_items: 'id, isStarred, createdAt',
      moments_config: 'key',
    });

    this.version(13).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
      rpg_class_images: 'id, updatedAt',
      rpg_meal_records: 'id, date, mealType, rating, updatedAt',
      rpg_dossier: 'id, updatedAt',
      moments_items: 'id, isStarred, createdAt',
      moments_config: 'key',
      memo_categories: 'id, order, createdAt',
      memo_chapters: 'id, categoryId, updatedAt',
    });

    this.version(14).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
      rpg_class_images: 'id, updatedAt',
      rpg_meal_records: 'id, date, mealType, rating, updatedAt',
      rpg_dossier: 'id, updatedAt',
      moments_items: 'id, isStarred, createdAt',
      moments_config: 'key',
      memo_categories: 'id, order, createdAt',
      memo_chapters: 'id, categoryId, updatedAt',
      swf_games: 'id, title, createdAt, lastPlayedAt',
    });

    this.version(15).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
      rpg_class_images: 'id, updatedAt',
      rpg_meal_records: 'id, date, mealType, rating, updatedAt',
      rpg_dossier: 'id, updatedAt',
      moments_items: 'id, isStarred, createdAt',
      moments_config: 'key',
      memo_categories: 'id, order, createdAt',
      memo_chapters: 'id, categoryId, updatedAt',
      swf_games: 'id, title, createdAt, lastPlayedAt',
      movies: 'id, title, status, year, rating, watchedDate, createdAt',
    });

    this.version(16).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
      rpg_class_images: 'id, updatedAt',
      rpg_meal_records: 'id, date, mealType, rating, updatedAt',
      rpg_dossier: 'id, updatedAt',
      moments_items: 'id, isStarred, createdAt',
      moments_config: 'key',
      memo_categories: 'id, order, createdAt',
      memo_chapters: 'id, categoryId, updatedAt',
      swf_games: 'id, title, createdAt, lastPlayedAt',
      movies: 'id, title, status, year, rating, watchedDate, createdAt',
      poems: 'id, title, author, dynasty, status, isFavorite, quizPassCount, createdAt',
    });

    this.version(17).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
      rpg_class_images: 'id, updatedAt',
      rpg_meal_records: 'id, date, mealType, rating, updatedAt',
      rpg_dossier: 'id, updatedAt',
      moments_items: 'id, isStarred, createdAt',
      moments_config: 'key',
      memo_categories: 'id, order, createdAt',
      memo_chapters: 'id, categoryId, updatedAt',
      swf_games: 'id, title, createdAt, lastPlayedAt',
      movies: 'id, title, status, year, rating, watchedDate, createdAt',
      poems: 'id, title, author, dynasty, status, isFavorite, quizPassCount, createdAt',
      books: 'id, isbn, title, author, status, physicalLocation, category, createdAt',
    });

    this.version(18).stores({
      characters: 'id, name, status',
      messages: 'id, characterId, timestamp',
      settings: 'key',
      memory_books: 'id, title, characterName, createdAt, shelfTier',
      pomodoro_sessions: 'id, taskId, category, mode, isCompleted, completedAt',
      pomodoro_tasks: 'id, category, isCompleted, createdAt',
      browser_history: 'id, url, visitedAt',
      browser_bookmarks: 'id, title, url, createdAt',
      browser_shortcuts: 'id, title, url, createdAt',
      rpg_item_images: 'id, updatedAt',
      rpg_skill_images: 'id, updatedAt',
      rpg_attribute_images: 'id, updatedAt',
      rpg_class_images: 'id, updatedAt',
      rpg_meal_records: 'id, date, mealType, rating, updatedAt',
      rpg_dossier: 'id, updatedAt',
      moments_items: 'id, isStarred, createdAt',
      moments_config: 'key',
      memo_categories: 'id, order, createdAt',
      memo_chapters: 'id, categoryId, updatedAt',
      swf_games: 'id, title, createdAt, lastPlayedAt',
      movies: 'id, title, status, year, rating, watchedDate, createdAt',
      poems: 'id, title, author, dynasty, status, isFavorite, quizPassCount, createdAt',
      books: 'id, isbn, title, author, status, physicalLocation, category, createdAt',
      storyword_novels: 'id, title, author, sourceId, currentChapterIndex, updatedAt',
      storyword_mistakes: 'id, word, level, wrongCount, mastered, lastTestedAt',
      storyword_sources: 'id, name, isEnabled, isBuiltin',
    });
  }
}

export const db = new NeumorphicPhoneDatabase();
