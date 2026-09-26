import { QuestCategory, QuestItem, RPGStatKey } from './questTypes';
import { loadQuestJournal, saveQuestJournal } from './questStorage';
import { RANDOM_QUEST_LIBRARY } from './randomQuestLibrary';

const DROP_HISTORY_KEY = 'cloudfly_random_quest_drop_history_v1';

interface StatRule {
  key: RPGStatKey;
  name: string;
  icon: string;
  keywords: string[];
}

const STAT_RULES: StatRule[] = [
  {
    key: 'SPI',
    name: '精力',
    icon: '⚡',
    keywords: ['呼吸', '温水', '发呆', '轻音乐', '香薰', '睡眠', '闭眼', '放松', '心跳', '冥想', '茶', '安静', '白噪音', '被窝', '深呼吸', '听歌', '清晨', '微风', '窗外'],
  },
  {
    key: 'CHA',
    name: '魅力',
    icon: '✨',
    keywords: ['夸', '谢谢', '微笑', '朋友', '合照', '点赞', '父母', '伴侣', '宠物', '鼓励', '感谢', '倾听', '语音', '创作者', '长评', '昵称', '打招呼', '问候', '接住话', '猫', '聊天'],
  },
  {
    key: 'INT',
    name: '智力',
    icon: '📚',
    keywords: ['记账', '开销', '删除', '备忘', '复盘', '读书', '电影', '学习', '短诗', '涂鸦', '退订', '自动续费', '便签', '写下', '脑海', '草稿', '困惑', '摘抄', '密码', '总结'],
  },
  {
    key: 'CON',
    name: '体质',
    icon: '💪',
    keywords: ['太阳', '拍脸', '刷牙', '指腹', '经络', '冷水', '早起', '腰部', '头皮', '按摩', '乳液', '坐起', '咀嚼', '喝完', '散步', '营养'],
  },
  {
    key: 'DEX',
    name: '敏捷',
    icon: '🏹',
    keywords: ['骑行', '收拾', '收纳', '扶门', '换壁纸', '整理', '擦洗', '推车', '走路', '赤脚', '抽屉', '相册', '油网', '盒子', '搬', '打扫'],
  },
  {
    key: 'STR',
    name: '力量',
    icon: '⚔️',
    keywords: ['端正', '稳', '站立', '坐直', '深层', '坚持', '拒绝', '邀约', '划掉', '烦恼', '克服', '突破'],
  },
];

/**
 * 智能判定最匹配的六维维度（若无强匹配则随机选择）
 */
function determineStatKey(title: string): { key: RPGStatKey; name: string; icon: string } {
  for (const rule of STAT_RULES) {
    if (rule.keywords.some((kw) => title.includes(kw))) {
      return { key: rule.key, name: rule.name, icon: rule.icon };
    }
  }

  // 随机轮换
  const fallback = STAT_RULES[Math.floor(Math.random() * STAT_RULES.length)];
  return { key: fallback.key, name: fallback.name, icon: fallback.icon };
}

/**
 * 获取随机任务图标
 */
function getCategoryIcon(statKey: RPGStatKey, isMain: boolean): string {
  const iconMap: Record<RPGStatKey, string[]> = {
    SPI: ['🍵', '💧', '🕯️', '🌿', '☁️'],
    CHA: ['✨', '💌', '🌸', '💬', '🐱'],
    INT: ['📚', '📖', '📝', '💡', '🔍'],
    CON: ['💪', '☀️', '🥛', '🥗', '🧘'],
    DEX: ['🏹', '🚲', '🧹', '🎒', '🏃'],
    STR: ['⚔️', '🛡️', '⚡', '🥊', '🎯'],
  };
  const list = iconMap[statKey] || (isMain ? ['🍳', '🌱', '☕'] : ['🎒', '🗺️', '✨']);
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * 读取历史已抽出的任务文本
 */
function loadDropHistory(): string[] {
  try {
    const raw = localStorage.getItem(DROP_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[RandomQuestDrop] 读取掉落历史失败:', err);
  }
  return [];
}

/**
 * 保存历史已抽出的任务文本
 */
function saveDropHistory(history: string[]): void {
  try {
    localStorage.setItem(DROP_HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn('[RandomQuestDrop] 保存掉落历史失败:', err);
  }
}

export interface DropResult {
  quest: QuestItem;
  targetCategory: QuestCategory;
  gain: number;
  remainingPoolCount: number;
  isPoolReset: boolean;
}

/**
 * 随机派发一条任务至目标栏目
 * 1. 严格不重复（当前任务不重、历史未重，抽完500条自动开启新轮回）
 * 2. 增加的六维值指数在指定范围内随机（主线 3~6，支线 6~12）
 */
export function dropRandomQuest(requestedCategory: QuestCategory): DropResult {
  // 彩蛋栏目重定向至主线
  const targetCategory: QuestCategory = requestedCategory === 'easter_egg' ? 'main' : requestedCategory;
  const isMain = targetCategory === 'main';

  // 1. 获取当前手账任务并建立标题去重 Set
  const currentQuests = loadQuestJournal();
  const existingTitles = new Set(currentQuests.map((q) => q.title.trim()));

  // 2. 读取掉落历史
  let history = loadDropHistory();
  const historySet = new Set(history);

  // 3. 构建候选池（既不在当前列表中，也不在历史已掉落中）
  let available = RANDOM_QUEST_LIBRARY.filter(
    (t) => !existingTitles.has(t) && !historySet.has(t)
  );

  let isPoolReset = false;

  // 若候选池耗尽，说明 500 条都抽过一遍：重置历史记录，重新在未处于当前列表的条目中轮巡
  if (available.length === 0) {
    history = [];
    isPoolReset = true;
    available = RANDOM_QUEST_LIBRARY.filter((t) => !existingTitles.has(t));

    // 如果连全量 500 条都存在于用户列表中（极端情况）：允许在未完成的条目中随机
    if (available.length === 0) {
      available = [...RANDOM_QUEST_LIBRARY];
    }
  }

  // 4. 随机抽取一条
  const randomIndex = Math.floor(Math.random() * available.length);
  const selectedTitle = available[randomIndex];

  // 5. 记录历史
  history.push(selectedTitle);
  saveDropHistory(history);

  // 6. 六维值指数在指定范围内随机：
  // 主线日常任务：3 ~ 6
  // 支线奇遇任务：6 ~ 12
  const minGain = isMain ? 3 : 6;
  const maxGain = isMain ? 6 : 12;
  const gain = Math.floor(Math.random() * (maxGain - minGain + 1)) + minGain;

  // 7. 匹配属性
  const statInfo = determineStatKey(selectedTitle);
  const icon = getCategoryIcon(statInfo.key, isMain);

  // 8. 创建任务实体
  const newQuest: QuestItem = {
    id: `rnd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    category: targetCategory,
    title: selectedTitle,
    desc: isMain ? '生活日常灵感 · 保持微小而确定的行动' : '奇遇漫步灵感 · 探索世界的温润可能',
    icon,
    tag: `${statInfo.icon} ${statInfo.name} +${gain}`,
    statKey: statInfo.key,
    statGain: {
      fixed: gain,
      min: minGain,
      max: maxGain,
    },
    currentProgress: 0,
    targetProgress: 1,
    status: 'in_progress',
    isDailyRepeatable: isMain,
    isCustom: true,
  };

  // 9. 存入手账并分发事件
  const updatedQuests = [newQuest, ...currentQuests];
  saveQuestJournal(updatedQuests);
  window.dispatchEvent(new CustomEvent('cloudfly_quests_updated', { detail: updatedQuests }));

  return {
    quest: newQuest,
    targetCategory,
    gain,
    remainingPoolCount: Math.max(0, available.length - 1),
    isPoolReset,
  };
}
