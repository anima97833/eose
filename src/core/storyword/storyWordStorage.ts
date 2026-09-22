import { db } from '../storage/db';
import {
  StoryNovel,
  BookSourceRule,
  StoryWordMistake,
  StoryWordUserSettings,
  VocabLevel,
} from './storyWordTypes';

// 预设高品质开箱即读爽文（覆盖霸总商战、修仙逆袭、赛博无限流）
export const PRESET_NOVELS: StoryNovel[] = [
  {
    id: 'novel_ceo_revenge',
    title: '豪门真少爷：冷血总裁的千亿反击',
    author: '夜幕狂飙',
    coverUrl: '',
    intro: '被家族抛弃三年后，他携百亿资本回归。面对未婚妻的背叛与豪门的嘲弄，他轻轻抿了口咖啡……',
    sourceId: 'builtin_source_1',
    sourceName: '内嵌精选源',
    currentChapterIndex: 0,
    totalChapters: 3,
    targetLevel: 'cet4',
    insertDensity: 0.18,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
    chapters: [
      {
        id: 'ch_ceo_1',
        index: 0,
        title: '第1章 归来！暴雨夜的冷漠与抉择',
        originalText: `那是一个暴雨倾盆的深夜。顾辰站在江城最高耸的摩天大厦顶层，落地窗外电闪雷鸣。
曾经不可一世的商业巨头们，此刻正站在他身后，额头上渗出密密麻麻的冷汗。他们的眼神里满是恐惧与不安。
三年前，正是这些人暗中合谋，用伪造的合同让顾氏集团陷入了万劫不复的深渊。当时的顾辰一无所有，被迫离开这座繁华的都市。
“顾总，求您高抬贵手！”李董事长声音颤抖，终于低下了高傲的头颅，“只要您放过我们公司，我们愿意交出所有的股份和资产！”
顾辰缓缓转过身，深邃的眼眸中没有丝毫同情。他优雅地端起桌上的黑咖啡，轻轻抿了一小口，嘴角扬起一抹冰冷的弧度。
“放过你们？”顾辰的声音低沉而充满压迫感，“三年前，当我跪在大雨里求你们借医药费救我母亲时，你们可曾有过半分犹豫？”
全场一片死寂，只有窗外暴雨无情地敲打着玻璃。复仇的烈火，在今夜彻底被点燃了。`,
      },
      {
        id: 'ch_ceo_2',
        index: 1,
        title: '第2章 惊天收购！商业帝国的彻底破产',
        originalText: `次日清晨九点整，江城证券交易所刚刚开盘，刺耳的警报声就响彻了整个金融交易大厅。
所有屏幕上，代表着四大家族核心上市公司的股票代码，瞬间全部变成了断崖式跌停的刺眼红线。
“发生了什么？为什么会有上百亿资金在不计成本地疯狂抛售？！”交易员们惊慌失措地大喊大叫。
在交易所对面的顶层包厢内，顾辰一身笔挺的黑色定制西服，静静注视着大盘瀑布般的暴跌。
特助快步走进来，恭敬地递上一份厚厚的金色文件：“顾总，收购协议已经全部签署完毕，对方资金链彻底断裂，申请正式破产。”
顾辰满意地合上文件夹。这不仅仅是一场商业吞并，更是一场精心策划了整整一千个日夜的完美复仇。`,
      },
      {
        id: 'ch_ceo_3',
        index: 2,
        title: '第3章 宴会交锋！未婚妻悔恨的泪水',
        originalText: `当晚的江城慈善名流晚宴上，名媛淑女与财阀富商云集。
当顾辰携带着轰动全城的神秘财团主席身份踏入宴会大厅时，所有聚光灯与目光瞬间聚焦在他一人身上。
曾经单方面撕毁婚约的前未婚妻苏晴，此刻端着香槟酒杯，脸色苍白得毫无血色。
她颤抖着走上前：“顾辰……原来那个横扫华尔街的神秘投资人，真的是你？我们之间……真的没有任何回旋的余地了吗？”
顾辰停下脚步，目光平静如止水，甚至没有在她脸上停留超过一秒钟。
“苏小姐，”顾辰淡漠地开口，“有些错误一旦犯下，就注定要付出代价。祝你在未来的岁月里，能找到属于你自己的答案。”
说完，他挽着女伴的从容离去，只留下苏晴在身后瘫坐在地，流下了悔恨莫及的泪水。`,
      },
    ],
  },
  {
    id: 'novel_xianxia_reborn',
    title: '万界神尊：我在修仙界卷成主宰',
    author: '天元道人',
    coverUrl: '',
    intro: '穿越成为外门废柴弟子，身怀词汇道韵金手指。当所有天骄还在闭关苦修，他一声道号引发天地共鸣！',
    sourceId: 'builtin_source_1',
    sourceName: '内嵌精选源',
    currentChapterIndex: 0,
    totalChapters: 2,
    targetLevel: 'kaoyan',
    insertDensity: 0.2,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
    chapters: [
      {
        id: 'ch_xx_1',
        index: 0,
        title: '第1章 废丹房的觉醒！神秘天书现世',
        originalText: `青云宗，后山废丹房内，尘土飞扬。
林凡擦去嘴角的血迹，眼神却清澈如星辰。方才内门执法弟子以莫须有的罪名，强行夺走了他辛辛苦苦积攒三个月的淬体灵液。
“在这个弱肉强食的修仙世界，弱小就是原罪。”林凡紧握双拳，心中泛起强烈的执念。
就在这时，悬浮在他识海深处的金色古卷忽然发出刺目耀眼的光芒。古卷缓缓展开，显现出无数蕴含着玄奥天地规则的神秘字符。
一股庞大无匹的天地元气瞬间倒灌而入，洗刷着他的奇经八脉，将他原本残破脆弱的经脉淬炼得如精金般坚不可摧！
“这是……至高大道的力量！”林凡大喜过望，他知道，属于自己的逆袭修真之路，在这一刻终于拉开了帷幕。`,
      },
      {
        id: 'ch_xx_2',
        index: 1,
        title: '第2章 宗门大比！一拳震撼外门诸峰',
        originalText: `三月一度的青云宗外门大比擂台周围，人山人海，喧嚣震天。
昔日曾肆意欺辱林凡的首席外门弟子赵莽傲立在白玉擂台中央，神色极其嚣张桀骜：“林凡，识相的就乖乖跪地求饶，省得被我打断全身经脉！”
台下观战的众弟子纷纷发出轻蔑的哄笑，没有人相信一个扫丹房的杂役能有任何胜算。
林凡步伐沉稳，一步步踏上擂台，神情古井无波。
刹那间，赵莽的身影化作一道残影，凶悍无比的奔雷拳夹带着狂暴的破空声狂轰而至！
面对这致命一击，林凡不退反进，右拳之上骤然金光万道，凝聚出惊天动地的毁灭力量，轰然迎上！
伴随着一声震耳欲聋的巨响，不可一世的赵莽如断线风筝般狂喷鲜血倒飞数十丈，重重砸穿了演武场的防护光幕！
整座山峰瞬间鸦雀无声，所有的嘲笑与讥讽在绝对的力量面前彻底化为了极致的震撼。`,
      },
    ],
  },
];

// 预设书源规则库（包含通用小说抓取规则与公共测试源）
export const DEFAULT_BOOK_SOURCES: BookSourceRule[] = [
  {
    id: 'builtin_source_1',
    name: '经典网文精校源 (内嵌)',
    host: 'local',
    contentSelector: 'p, .content, #content',
    isEnabled: true,
    isBuiltin: true,
  },
  {
    id: 'source_biquge_rule',
    name: '全网通用笔趣规则源',
    host: 'https://www.biquge.com',
    searchUrlPattern: 'https://www.biquge.com/search?keyword=%s',
    contentSelector: '#content, #chaptercontent, .content, .read-content',
    titleSelector: 'h1, .title, .read-title',
    catalogSelector: '.listmain a, #list a, .chapter-list a',
    isEnabled: true,
  },
  {
    id: 'source_readability_universal',
    name: '万能网页内容提取源 (智能识别)',
    host: 'universal',
    contentSelector: 'article, #content, .article-content, .entry-content, main',
    isEnabled: true,
  },
];

const DEFAULT_SETTINGS: StoryWordUserSettings = {
  targetLevel: 'cet4',
  density: 0.18,
  fontSize: 15,
  autoPronounce: true,
  soundVolume: 1,
};

const SETTINGS_KEY = 'storyword_app_user_settings_v1';

// 1. 小说数据管理
export async function loadAllStoryNovels(): Promise<StoryNovel[]> {
  try {
    const list = await db.storyword_novels.toArray();
    if (list.length === 0) {
      await db.storyword_novels.bulkAdd(PRESET_NOVELS);
      return PRESET_NOVELS;
    }
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error('[StoryWordStorage] 加载小说失败:', err);
    return PRESET_NOVELS;
  }
}

export async function saveStoryNovel(novel: StoryNovel): Promise<void> {
  novel.updatedAt = Date.now();
  await db.storyword_novels.put(novel);
}

export async function deleteStoryNovel(id: string): Promise<void> {
  await db.storyword_novels.delete(id);
}

export async function updateNovelProgress(novelId: string, chapterIndex: number): Promise<void> {
  const novel = await db.storyword_novels.get(novelId);
  if (novel) {
    novel.currentChapterIndex = chapterIndex;
    novel.updatedAt = Date.now();
    await db.storyword_novels.put(novel);
  }
}

// 2. 书源规则库管理
export async function loadBookSources(): Promise<BookSourceRule[]> {
  try {
    const list = await db.storyword_sources.toArray();
    if (list.length === 0) {
      await db.storyword_sources.bulkAdd(DEFAULT_BOOK_SOURCES);
      return DEFAULT_BOOK_SOURCES;
    }
    return list;
  } catch (err) {
    console.warn('[StoryWordStorage] 加载书源失败:', err);
    return DEFAULT_BOOK_SOURCES;
  }
}

export async function saveBookSource(source: BookSourceRule): Promise<void> {
  await db.storyword_sources.put(source);
}

export async function deleteBookSource(id: string): Promise<void> {
  await db.storyword_sources.delete(id);
}

// 3. 错词阁管理
export async function loadMistakeWords(): Promise<StoryWordMistake[]> {
  try {
    return await db.storyword_mistakes.toArray();
  } catch {
    return [];
  }
}

export async function recordMistakeWord(
  word: string,
  phonetic: string,
  translation: string,
  level: VocabLevel,
  contextSnippet: string
): Promise<void> {
  try {
    const existing = await db.storyword_mistakes.get(word.toLowerCase());
    if (existing) {
      existing.wrongCount += 1;
      existing.mastered = false;
      existing.lastTestedAt = Date.now();
      existing.novelContextSnippet = contextSnippet;
      await db.storyword_mistakes.put(existing);
    } else {
      const newMistake: StoryWordMistake = {
        id: word.toLowerCase(),
        word,
        phonetic,
        translation,
        level,
        wrongCount: 1,
        mastered: false,
        novelContextSnippet: contextSnippet,
        lastTestedAt: Date.now(),
        createdAt: Date.now(),
      };
      await db.storyword_mistakes.put(newMistake);
    }
  } catch (err) {
    console.warn('[StoryWordStorage] 记录错词失败:', err);
  }
}

export async function markWordMastered(wordId: string, mastered: boolean): Promise<void> {
  try {
    const item = await db.storyword_mistakes.get(wordId);
    if (item) {
      item.mastered = mastered;
      await db.storyword_mistakes.put(item);
    }
  } catch (err) {
    console.warn('[StoryWordStorage] 标记掌握失败:', err);
  }
}

// 4. 用户设置
export function loadStoryWordSettings(): StoryWordUserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveStoryWordSettings(settings: StoryWordUserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

// 5. 原生真人英音发声引擎 (Web Speech API)
export function playEnglishVoice(word: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // 停止上一段发音
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.95; // 语速稍缓，清晰自然
    utterance.pitch = 1.0;

    // 优先选择英美专业英语声音
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) && !v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Speech] 发音失败:', err);
  }
}

// 统一便捷导出别名
export const getAllStoryNovels = loadAllStoryNovels;
export const getAllBookSources = loadBookSources;
export const getAllMistakes = loadMistakeWords;
export const markMistakeMastered = markWordMastered;
export const speakWord = playEnglishVoice;
export const getUserSettings = loadStoryWordSettings;

export async function resetDefaultBookSources(): Promise<BookSourceRule[]> {
  try {
    await db.storyword_sources.clear();
    await db.storyword_sources.bulkAdd(DEFAULT_BOOK_SOURCES);
  } catch (e) {
    console.warn('Reset default sources error', e);
  }
  return DEFAULT_BOOK_SOURCES;
}

export async function addMistakeWord(word: { word: string; phonetic: string; translation: string; level: VocabLevel }, snippet: string): Promise<void> {
  await recordMistakeWord(word.word, word.phonetic, word.translation, word.level, snippet);
}

export async function deleteMistakeWord(id: string): Promise<void> {
  await db.storyword_mistakes.delete(id);
}

export function saveUserSettings(settings: Partial<StoryWordUserSettings>): void {
  const curr = loadStoryWordSettings();
  saveStoryWordSettings({ ...curr, ...settings });
}

