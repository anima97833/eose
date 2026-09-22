// 关卡进阶任务存储与 AI 接口服务
import { QuestMilestone, QuestAIPromptContext } from './questTypes';

const STORAGE_KEY = 'rpg_milestone_quests_v1';

// 默认关卡进阶序列（现实生活微犒赏体系：喝饮料、玩游戏、吃甜品、听歌小憩）
export const DEFAULT_MILESTONES: QuestMilestone[] = [
  {
    id: 'stage_5',
    stageNumber: 5,
    targetTitle: '解锁条件',
    targetDesc: '升级1项六维属性至8点',
    targetIcon: '🥣',
    rightCardBg: 'yellow', // 图2同款明黄温润卡片
    reward: {
      type: 'custom',
      name: '喝罐饮料',
      label: '1瓶',
      icon: '🥤',
      badgeText: '解解渴!',
    },
    status: 'claimable', // 初始阶段5可领取，对齐图2的绿胶囊按键与红点
  },
  {
    id: 'stage_6',
    stageNumber: 6,
    targetTitle: '解锁条件',
    targetDesc: '完成1次25分钟心流专注',
    targetIcon: '🍵',
    rightCardBg: 'purple', // 图2同款香芋浅紫卡片
    reward: {
      type: 'custom',
      name: '玩十分钟',
      label: '10分',
      icon: '🎮',
      badgeText: '去摸鱼!',
    },
    status: 'in_progress',
  },
  {
    id: 'stage_7',
    stageNumber: 7,
    targetTitle: '解锁条件',
    targetDesc: '在亲缘图谱中新增1位挚友',
    targetIcon: '🍲',
    rightCardBg: 'purple',
    reward: {
      type: 'custom',
      name: '吃块甜点',
      label: '1份',
      icon: '🍰',
    },
    status: 'locked',
  },
  {
    id: 'stage_8',
    stageNumber: 8,
    targetTitle: '解锁条件',
    targetDesc: '设定心仪职业的期望薪资',
    targetIcon: '🍱',
    rightCardBg: 'purple',
    reward: {
      type: 'custom',
      name: '听首好歌',
      label: '1首',
      icon: '🎧',
    },
    status: 'locked',
  },
  {
    id: 'stage_9',
    stageNumber: 9,
    targetTitle: '突破条件',
    targetDesc: '在背包中穿戴整齐现实装备',
    targetIcon: '✨',
    rightCardBg: 'yellow',
    reward: {
      type: 'custom',
      name: '心愿大餐',
      label: '大餐',
      icon: '🍱',
      badgeText: '终极大赏!',
    },
    status: 'locked',
  },
];

// 加载任务进度
export const loadMilestoneQuests = (): QuestMilestone[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MILESTONES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MILESTONES;
  } catch (err) {
    console.error('加载关卡进阶任务失败，使用默认值:', err);
    return DEFAULT_MILESTONES;
  }
};

// 保存任务进度
export const saveMilestoneQuests = (quests: QuestMilestone[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
  } catch (err) {
    console.error('保存关卡进阶任务失败:', err);
  }
};

// 重置任务为初始
export const resetMilestoneQuests = (): QuestMilestone[] => {
  saveMilestoneQuests(DEFAULT_MILESTONES);
  return DEFAULT_MILESTONES;
};

import { loadStoredSettings } from '../../types/settings';
import { createLLMAdapter } from '../llm';

// AI 任务生成：拆解为 5-8 步循序渐进的可执行计划（优先使用用户设置的 API，离线时智能兜底）
export const generateMilestonesWithAI = async (
  context: QuestAIPromptContext
): Promise<QuestMilestone[]> => {
  const job = context.currentJob || '探索者';
  const goal = context.userGoal?.trim() || '全面提升人生能力';

  const settings = loadStoredSettings();
  // 优先选取当前处于激活标签的线路，若未配置 key 则智能回退到另一条有 key 的线路
  const preferred = settings.activeTab === 'branch' ? settings.branch : settings.primary;
  const alternate = settings.activeTab === 'branch' ? settings.primary : settings.branch;
  const route = preferred.apiKey?.trim() ? preferred : (alternate.apiKey?.trim() ? alternate : preferred);

  // 如果用户已经在设置中配置好了 API Key 与 Base URL，直接调用用户大模型进行 5-8 步目标拆解
  if (route.baseUrl?.trim() && route.apiKey?.trim() && route.model?.trim()) {
    try {
      const adapter = createLLMAdapter({
        baseUrl: route.baseUrl.trim(),
        apiKey: route.apiKey.trim(),
        model: route.model.trim(),
        temperature: 0.7,
      });

      const prompt = `你是一个二次元治愈系人生RPG导师。用户当前职业是【${job}】，用户输入了一个现实生活/学习目标：【${goal}】。
请将该现实目标拆解为 5 到 8 个由浅入深、切实可落地的执行关卡计划（Stage 1 至 Stage 5~8）。

【最核心要求：关卡奖励必须是现实生活中很小、触手可及、做完就能立刻享受的治愈系微犒赏！】
严禁给虚幻庞大的奖励（如金币、魔法秘宝、虚构卷轴）。
必须是现实中能马上给自己的具体小确幸，例如：
- 喝一瓶饮料/奶茶（🥤 喝罐饮料，规格 "1瓶"）
- 玩10分钟游戏（🎮 玩十分钟，规格 "10分"）
- 吃个小蛋糕/甜点/零食（🍰 吃块甜点，规格 "1份"）
- 听一首喜欢的音乐（🎧 听首好歌，规格 "1首"）
- 闭目小憩15分钟（🛌 小憩片刻，规格 "15分"）
- 去阳台或室外散步10分钟（🚶 散步吹风，规格 "10分"）
- 看一集动画或短视频（🎬 看集动画，规格 "1集"）
- 最终关卡奖励：心愿大餐或买一件心仪小物件（🍱 心愿大餐，规格 "大餐"）

重要规范：
1. 关卡阶段编号 stageNumber 必须从 1 开始递增（1, 2, 3, 4, 5... 到 8）！
2. 所有标题 targetTitle、奖励名 reward.name 和徽章文字 badgeText 必须严格不超过5个汉字！
3. reward.icon 必须是生活常用 Emoji（如 🥤, 🎮, 🍰, 🎧, 🛌, 🚶, 🎬, 🍱, 🎁）！
4. reward.label 填现实规格（如 "1瓶", "10分", "1份", "1首", "15分", "1集", "大餐"）！
5. 卡片背景 rightCardBg 轮流从 "yellow", "purple", "rose" 中选择。
6. 必须严格以纯 JSON 数组直接输出，禁止包含\`\`\`json或任何多余文字：
[
  {
    "stageNumber": 1,
    "targetTitle": "<=5字，如破冰启动/理清思路>",
    "targetDesc": "<=15字具体微行动任务>",
    "targetIcon": "🎯",
    "rightCardBg": "yellow",
    "reward": {
      "type": "custom",
      "name": "喝罐饮料",
      "label": "1瓶",
      "icon": "🥤",
      "badgeText": "第一步!"
    }
  },
  ...
]`;

      const reply = await adapter.sendMessage([
        { role: 'system', content: 'You are an AI life coach that breaks real goals into 5-8 steps with realistic micro-rewards (drink a soda, play 10min game, eat a snack), returning pure JSON array without markdown wrappers.' },
        { role: 'user', content: prompt },
      ]);

      // 提取 JSON 内容
      let jsonStr = reply.trim();
      const jsonStart = jsonStr.indexOf('[');
      const jsonEnd = jsonStr.lastIndexOf(']');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        const bgColors: ('yellow' | 'purple' | 'rose')[] = ['yellow', 'purple', 'purple', 'yellow', 'purple', 'rose', 'yellow', 'rose'];
        return parsed.slice(0, 8).map((item, idx) => ({
          id: `ai_${Date.now()}_${idx + 1}`,
          stageNumber: idx + 1,
          targetTitle: (item.targetTitle || `第${idx + 1}阶段`).slice(0, 5),
          targetDesc: item.targetDesc || `迈出[${goal}]第${idx + 1}步`,
          targetIcon: item.targetIcon || (idx === 0 ? '🎯' : idx === parsed.length - 1 ? '🌟' : '⚡'),
          rightCardBg: (item.rightCardBg === 'purple' || item.rightCardBg === 'rose') ? item.rightCardBg : (bgColors[idx] || 'yellow'),
          reward: {
            type: 'custom',
            name: (item.reward?.name || '小犒赏').slice(0, 5),
            label: item.reward?.label || (idx === 0 ? '1瓶' : idx === 1 ? '10分' : '1次'),
            icon: item.reward?.icon || (idx === 0 ? '🥤' : idx === 1 ? '🎮' : '🍰'),
            badgeText: item.reward?.badgeText ? item.reward.badgeText.slice(0, 5) : (idx === 0 ? '第一步!' : idx === parsed.length - 1 ? '终极赏!' : undefined),
          },
          status: idx === 0 ? 'claimable' : 'locked', // 第一步直接可激活领奖，其余阶段锁定依次推进
        }));
      }
    } catch (apiErr) {
      console.warn('调用设置中配置的 API 大模型失败，平滑降级为本地智能拆解算法:', apiErr);
    }
  }

  // 兜底智能拆解算法（6 步生活微犒赏黄金计划，离线无缝运行）
  await new Promise((resolve) => setTimeout(resolve, 600));

  return [
    {
      id: `ai_${Date.now()}_1`,
      stageNumber: 1,
      targetTitle: '破冰启动',
      targetDesc: `针对[${goal}]梳理计划`,
      targetIcon: '🎯',
      rightCardBg: 'yellow',
      reward: {
        type: 'custom',
        name: '喝罐饮料',
        label: '1瓶',
        icon: '🥤',
        badgeText: '第一步!',
      },
      status: 'claimable',
    },
    {
      id: `ai_${Date.now()}_2`,
      stageNumber: 2,
      targetTitle: '基础打底',
      targetDesc: `准备核心资料与素材`,
      targetIcon: '📖',
      rightCardBg: 'purple',
      reward: {
        type: 'custom',
        name: '听首好歌',
        label: '1首',
        icon: '🎧',
      },
      status: 'locked',
    },
    {
      id: `ai_${Date.now()}_3`,
      stageNumber: 3,
      targetTitle: '心流试炼',
      targetDesc: `完成25分钟专注执行`,
      targetIcon: '⏱️',
      rightCardBg: 'purple',
      reward: {
        type: 'custom',
        name: '玩十分钟',
        label: '10分',
        icon: '🎮',
        badgeText: '去摸鱼!',
      },
      status: 'locked',
    },
    {
      id: `ai_${Date.now()}_4`,
      stageNumber: 4,
      targetTitle: '难点攻坚',
      targetDesc: `突破核心重点关卡`,
      targetIcon: '⚡',
      rightCardBg: 'yellow',
      reward: {
        type: 'custom',
        name: '吃块甜品',
        label: '1份',
        icon: '🍰',
      },
      status: 'locked',
    },
    {
      id: `ai_${Date.now()}_5`,
      stageNumber: 5,
      targetTitle: '深度突破',
      targetDesc: `完成实战演练与复盘`,
      targetIcon: '🏋️',
      rightCardBg: 'purple',
      reward: {
        type: 'custom',
        name: '小憩片刻',
        label: '15分',
        icon: '🛌',
      },
      status: 'locked',
    },
    {
      id: `ai_${Date.now()}_6`,
      stageNumber: 6,
      targetTitle: '成果验收',
      targetDesc: `阶段性大成果验收`,
      targetIcon: '🌟',
      rightCardBg: 'rose',
      reward: {
        type: 'custom',
        name: '心愿大餐',
        label: '大餐',
        icon: '🍱',
        badgeText: '终极赏!',
      },
      status: 'locked',
    },
  ];
};
