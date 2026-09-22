/**
 * 【爽文背词】核心数据类型定义
 */

export type VocabLevel = 'cet4' | 'cet6' | 'kaoyan' | 'ielts';

export interface EnglishWord {
  word: string;
  phonetic: string;
  translation: string;
  partOfSpeech: string;
  level: VocabLevel;
  triggers: string[]; // 触发替换的中文词汇，如 ["冷漠", "冷淡", "漠视"]
  example?: string;
}

export interface BookSourceRule {
  id: string;
  name: string;
  host: string;
  searchUrlPattern?: string; // 搜索接口如 https://.../search?key=%s
  contentSelector: string;   // 正文提取选择器如 "#content" 或 ".read-content"
  titleSelector?: string;    // 标题选择器
  catalogSelector?: string;  // 目录选择器
  chapterUrlSelector?: string;
  isEnabled: boolean;
  isBuiltin?: boolean;
}

export interface StoryChapter {
  id: string;
  index: number;
  title: string;
  originalText: string;
  sourceUrl?: string;
}

export interface StoryNovel {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  intro?: string;
  sourceId: string;
  sourceName: string;
  currentChapterIndex: number;
  totalChapters: number;
  chapters: StoryChapter[];
  targetLevel: VocabLevel;
  insertDensity: number; // 0.1 ~ 0.35
  createdAt: number;
  updatedAt: number;
}

export interface ClozeOption {
  word: string;
  translation: string;
  phonetic: string;
  isCorrect: boolean;
}

export interface StoryClozeChallenge {
  id: string;
  sentenceBefore: string;
  targetWord: EnglishWord;
  sentenceAfter: string;
  options: ClozeOption[];
  isAnswered: boolean;
  selectedWord?: string;
  isCorrect?: boolean;
  explanation: string;
}

export interface StoryWordMistake {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  level: VocabLevel;
  wrongCount: number;
  mastered: boolean;
  novelContextSnippet: string;
  lastTestedAt: number;
  createdAt: number;
}

export interface StoryWordUserSettings {
  targetLevel: VocabLevel;
  density: number; // 0.15 默认
  fontSize: number; // 15 默认
  autoPronounce: boolean;
  soundVolume: number;
}
