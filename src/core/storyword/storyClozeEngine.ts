import { StoryClozeChallenge, ClozeOption, VocabLevel } from './storyWordTypes';
import {
  getVocabularyForLevel,
  getRandomDistractors,
} from './novelVocabCompiler';
import { loadRPGProfile, saveRPGProfile } from '../rpg/rpgStorage';
import { addMistakeWord } from './storyWordStorage';

/**
 * 针对网文小说，分析高潮/爽点/对决/打脸语句，生成互动通关填空挑战
 * （Direction B: 【轻拟物·网文互动通关背词器】）
 */
export function generateClozeChallengesForChapter(
  chapterText: string,
  level: VocabLevel,
  maxChallenges: number = 3
): StoryClozeChallenge[] {
  const vocabList = getVocabularyForLevel(level);

  // 整理所有可用的触发词映射
  const triggerMap: { trigger: string; word: (typeof vocabList)[0] }[] = [];
  vocabList.forEach(w => {
    w.triggers.forEach(t => {
      triggerMap.push({ trigger: t, word: w });
    });
  });

  // 按句号、感叹号、问号切分句子
  const rawSentences = chapterText
    .split(/([。！？\n]+)/)
    .map(s => s.trim())
    .filter(s => s.length >= 8 && s.length <= 120);

  const challenges: StoryClozeChallenge[] = [];
  const usedWords = new Set<string>();

  for (const sentence of rawSentences) {
    if (challenges.length >= maxChallenges) break;

    // 寻找该句子中是否包含词汇触发词
    for (const item of triggerMap) {
      if (usedWords.has(item.word.word)) continue;

      const matchIdx = sentence.indexOf(item.trigger);
      if (matchIdx !== -1) {
        // 找到了关键句！
        const sentenceBefore = sentence.slice(0, matchIdx);
        const sentenceAfter = sentence.slice(matchIdx + item.trigger.length);

        const distractors = getRandomDistractors(item.word, 3);
        const options: ClozeOption[] = [
          {
            word: item.word.word,
            translation: item.word.translation,
            phonetic: item.word.phonetic,
            isCorrect: true,
          },
          ...distractors.map(d => ({
            word: d.word,
            translation: d.translation,
            phonetic: d.phonetic,
            isCorrect: false,
          })),
        ];

        // 打乱选项顺序
        const shuffledOptions = [...options].sort(() => Math.random() - 0.5);

        challenges.push({
          id: `cloze_${Date.now()}_${challenges.length}_${Math.random().toString(36).slice(2, 6)}`,
          sentenceBefore,
          targetWord: item.word,
          sentenceAfter,
          options: shuffledOptions,
          isAnswered: false,
          explanation: `${item.word.word} ${item.word.phonetic} [${item.word.partOfSpeech}]：${item.word.translation}（原文此处意为“${item.trigger}”）`,
        });

        usedWords.add(item.word.word);
        break; // 该句已用，进入下一句
      }
    }
  }

  return challenges;
}

export interface ClozeAnswerResult {
  isCorrect: boolean;
  reward?: {
    attrKey: string;
    attrGain: number;
    attrName: string;
  };
}

/**
 * 结算互动挑战选项，打通 RPG 属性增长与错词本沉淀
 */
export async function submitClozeAnswer(
  challenge: StoryClozeChallenge,
  selectedWord: string
): Promise<ClozeAnswerResult> {
  const isCorrect = selectedWord.toLowerCase() === challenge.targetWord.word.toLowerCase();
  challenge.isAnswered = true;
  challenge.selectedWord = selectedWord;
  challenge.isCorrect = isCorrect;

  if (isCorrect) {
    // 正确：严格遵循规则仅加 +2 智力/精神属性，不加经验/金币，等级提升完全依靠六维属性换算
    try {
      const profile = loadRPGProfile();
      const attrGain = 2;
      const isIntel = profile.currentClassId === 'scholar' || profile.currentClassId === 'mage';
      const attrKey: 'INT' | 'SPI' = isIntel ? 'INT' : 'SPI';
      const attrName = isIntel ? '智力' : '精神';

      if (profile.attributes && profile.attributes[attrKey]) {
        profile.attributes[attrKey].value = Math.min(
          profile.attributes[attrKey].maxValue,
          profile.attributes[attrKey].value + attrGain
        );
      }

      saveRPGProfile(profile);

      return {
        isCorrect: true,
        reward: {
          attrKey,
          attrGain,
          attrName,
        },
      };
    } catch (err) {
      console.warn('RPG profile reward update failed', err);
      return { isCorrect: true };
    }
  } else {
    // 错误：沉淀至“复仇错词阁”
    try {
      const contextSnippet = `${challenge.sentenceBefore}【${challenge.targetWord.word}】${challenge.sentenceAfter}`;
      await addMistakeWord(challenge.targetWord, contextSnippet);
    } catch (err) {
      console.warn('Failed to record mistake word', err);
    }

    return { isCorrect: false };
  }
}
