// 关卡里程碑任务与奖励类型定义

export type QuestStatus = 'locked' | 'in_progress' | 'claimable' | 'claimed';

export type RewardType = 'gold' | 'exp' | 'item' | 'title' | 'custom';

export interface QuestReward {
  type: RewardType;
  amount?: number;
  label: string; // 如 "X40000" 或 "X3"
  name: string;  // 如 "金币"、"配方书"、"餐车"
  icon: string;  // Emoji 或 特殊标记
  badgeText?: string; // 如 "新外观!" (<=5字)
}

export interface QuestMilestone {
  id: string;
  stageNumber: number; // 5, 6, 7, 8...
  targetTitle: string; // 左侧标题: "解锁条件"、"体质训练" (<=5字)
  targetDesc: string;  // 简要描述
  targetIcon: string;  // 目标图标，如 🥣, 🏋️, 💻, 🥗
  rightCardBg: 'yellow' | 'purple' | 'cyan' | 'rose'; // 深度还原图2：黄色/淡紫等
  reward: QuestReward;
  status: QuestStatus;
}

// AI 任务生成上下文与接口
export interface QuestAIPromptContext {
  userLevel: number;
  currentJob: string;
  attributes: Record<string, number>;
  userGoal?: string; // 用户输入的自定目标，如 "想要下周减脂3斤"
}

export interface QuestAIService {
  generateQuests: (context: QuestAIPromptContext) => Promise<QuestMilestone[]>;
}
