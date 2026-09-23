import { getBeijingDateString } from '../rpg/rpgStorage';

export interface DroppedTask {
  id: string;
  title: string;
  category: 'crazy' | 'heal' | 'adventure' | 'health';
  categoryLabel: string;
  icon: string;
  source: 'template' | 'seed' | 'ai';
  completedAt?: number;
}

// 1. 精选现成任务种子池（字数严格控制在 10~15 字，确保一眼看清全貌）
const SEED_TASKS: Omit<DroppedTask, 'id' | 'source'>[] = [
  {
    title: '喝一杯温水，深情说声辛苦了',
    category: 'heal',
    categoryLabel: '#生活治愈',
    icon: '🥤',
  },
  {
    title: '给好友发一句‘其实我是外星人’',
    category: 'crazy',
    categoryLabel: '#抽象发疯',
    icon: '👽',
  },
  {
    title: '站起来伸个大懒腰并深呼吸',
    category: 'health',
    categoryLabel: '#赛博养生',
    icon: '🦖',
  },
  {
    title: '找出两只颜色完全不同的袜子穿上',
    category: 'crazy',
    categoryLabel: '#抽象发疯',
    icon: '🧦',
  },
  {
    title: '走到窗边，对着云彩发呆半分钟',
    category: 'heal',
    categoryLabel: '#生活治愈',
    icon: '⛅',
  },
  {
    title: '闭眼深呼吸，把烦恼丢进垃圾桶',
    category: 'heal',
    categoryLabel: '#赛博养生',
    icon: '🧘',
  },
  {
    title: '用非惯用手拿起水杯喝口水',
    category: 'adventure',
    categoryLabel: '#微型冒险',
    icon: '✋',
  },
  {
    title: '给常聊的群发个无厘头猫猫图',
    category: 'crazy',
    categoryLabel: '#抽象发疯',
    icon: '🐱',
  },
  {
    title: '对镜子里的自己做个帅气鬼脸',
    category: 'crazy',
    categoryLabel: '#抽象发疯',
    icon: '🪞',
  },
  {
    title: '在空气中轻轻画一颗爱心送自己',
    category: 'heal',
    categoryLabel: '#生活治愈',
    icon: '💖',
  },
  {
    title: '假装王牌特工，警惕环视四周',
    category: 'adventure',
    categoryLabel: '#微型冒险',
    icon: '🕶️',
  },
  {
    title: '给身边的鼠标起个威武的名字',
    category: 'crazy',
    categoryLabel: '#抽象发疯',
    icon: '🏷️',
  },
  {
    title: '把手机反扣在桌上，放空半分钟',
    category: 'health',
    categoryLabel: '#赛博养生',
    icon: '⏳',
  },
  {
    title: '拍拍自己的肩膀，夸夸自己很棒',
    category: 'heal',
    categoryLabel: '#生活治愈',
    icon: '👏',
  },
  {
    title: '单脚站立 10 秒默念不倒翁',
    category: 'adventure',
    categoryLabel: '#微型冒险',
    icon: '🦩',
  },
  {
    title: '对空气打一记无影拳消消怨气',
    category: 'crazy',
    categoryLabel: '#抽象发疯',
    icon: '🥊',
  },
  {
    title: '摸摸自己的头顶，确认头发还在',
    category: 'crazy',
    categoryLabel: '#抽象发疯',
    icon: '💆',
  },
  {
    title: '在便签纸上随手画一只小猪',
    category: 'heal',
    categoryLabel: '#生活治愈',
    icon: '📝',
  },
];

// 2. 词模程序化组合生成库（严格短句，总字数不超过 15 字）
const TEMPLATE_ACTIONS = [
  { action: '喝一杯', icon: '🥤', cat: 'health' as const, label: '#赛博养生' },
  { action: '轻敲三下', icon: '🐾', cat: 'heal' as const, label: '#生活治愈' },
  { action: '给好友发', icon: '📱', cat: 'crazy' as const, label: '#抽象发疯' },
  { action: '对着窗外', icon: '⛅', cat: 'heal' as const, label: '#生活治愈' },
  { action: '模仿小狗', icon: '🐶', cat: 'crazy' as const, label: '#抽象发疯' },
  { action: '用左手拿起', icon: '✋', cat: 'adventure' as const, label: '#微型冒险' },
  { action: '对着空气说', icon: '🤫', cat: 'crazy' as const, label: '#抽象发疯' },
  { action: '极目远眺', icon: '👀', cat: 'health' as const, label: '#赛博养生' },
];

const TEMPLATE_TARGETS = [
  '温热的白开水',
  '桌面深呼吸',
  '‘其实我是小海獭’',
  '天上的云彩',
  '摇三下尾巴',
  '手边的笔或水杯',
  '‘代号007收到’',
  '窗外最远的大树',
  '‘今天世界保护我’',
];

const STORAGE_KEY = 'cloudfly_task_drop_current_v1';

/**
 * 随机生成一个短小精炼的词模任务（确保 ≤ 15 字）
 */
function generateProceduralTask(): DroppedTask {
  const a = TEMPLATE_ACTIONS[Math.floor(Math.random() * TEMPLATE_ACTIONS.length)];
  const t = TEMPLATE_TARGETS[Math.floor(Math.random() * TEMPLATE_TARGETS.length)];

  let title = `${a.action}${t}`;
  if (title.length > 15) {
    title = title.slice(0, 15);
  }

  return {
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    category: a.cat,
    categoryLabel: a.label,
    icon: a.icon,
    source: 'template',
  };
}

/**
 * 随机抽取一个精选题库任务
 */
function pickSeedTask(): DroppedTask {
  const seed = SEED_TASKS[Math.floor(Math.random() * SEED_TASKS.length)];
  return {
    id: `seed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...seed,
    source: 'seed',
  };
}

/**
 * 获取或生成新任务（方案 A：50% 概率抽精选题，50% 概率程序化拼装）
 */
export function getRandomTaskDrop(): DroppedTask {
  if (Math.random() > 0.5) {
    return pickSeedTask();
  }
  return generateProceduralTask();
}

export interface TaskDropState {
  currentTask: DroppedTask;
  lastCompletedDate: string | null; // 格式: 'YYYY-MM-DD'
}

const STORAGE_STATE_KEY = 'cloudfly_task_drop_state_v2';

/**
 * 读取完整的掉落状态
 */
export function getTaskDropState(): TaskDropState {
  const today = getBeijingDateString();
  try {
    const raw = localStorage.getItem(STORAGE_STATE_KEY);
    if (raw) {
      const parsed: TaskDropState = JSON.parse(raw);
      if (parsed && parsed.currentTask && parsed.currentTask.title) {
        // 如果今天已经点过“完成”，锁定在完成状态
        if (parsed.lastCompletedDate === today) {
          return parsed;
        }
        // 如果跨日了（今天未完成），若上一日曾完成，自动生成新的一天的任务
        if (parsed.lastCompletedDate && parsed.lastCompletedDate !== today) {
          const fresh = getRandomTaskDrop();
          const nextState: TaskDropState = {
            currentTask: fresh,
            lastCompletedDate: null,
          };
          saveTaskDropState(nextState);
          return nextState;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse task drop state', err);
  }

  const fresh = getRandomTaskDrop();
  const newState: TaskDropState = {
    currentTask: fresh,
    lastCompletedDate: null,
  };
  saveTaskDropState(newState);
  return newState;
}

/**
 * 保存状态
 */
export function saveTaskDropState(state: TaskDropState): void {
  try {
    localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save task drop state', err);
  }
}

/**
 * 当日是否已点完成（若完成，不再更新新任务，直到第二日）
 */
export function isTodayTaskCompleted(): boolean {
  const state = getTaskDropState();
  return state.lastCompletedDate === getBeijingDateString();
}

/**
 * 标记今日任务已完成
 */
export function completeTodayTask(): void {
  const state = getTaskDropState();
  state.lastCompletedDate = getBeijingDateString();
  saveTaskDropState(state);
}

/**
 * 获取当前任务对象
 */
export function getCurrentTaskDrop(): DroppedTask {
  return getTaskDropState().currentTask;
}

/**
 * 仅在当日未完成时：跳过当前任务换下一个
 */
export function skipToNextTask(): DroppedTask {
  const next = getRandomTaskDrop();
  const state = getTaskDropState();
  state.currentTask = next;
  saveTaskDropState(state);
  return next;
}

/**
 * 保留的 AI 生成选项：当用户点击卡片上的「AI 脑洞」时触发
 */
export async function generateAITaskDrop(): Promise<DroppedTask> {
  await new Promise((res) => setTimeout(res, 500));

  const aiPrompts: { title: string; category: 'crazy' | 'heal' | 'adventure' | 'health'; categoryLabel: string; icon: string }[] = [
    { title: '向天花板敬礼：长官好！', category: 'crazy', categoryLabel: '#AI脑洞', icon: '🫡' },
    { title: '对空气打一拳消灭烦恼', category: 'crazy', categoryLabel: '#AI脑洞', icon: '🥊' },
    { title: '闭眼三秒想象自己在云端', category: 'heal', categoryLabel: '#AI脑洞', icon: '☁️' },
    { title: '找身边最圆的东西摸一摸', category: 'heal', categoryLabel: '#AI脑洞', icon: '🔮' },
    { title: '给虚空中的观众鞠个躬', category: 'crazy', categoryLabel: '#AI脑洞', icon: '🎭' },
  ];

  const picked = aiPrompts[Math.floor(Math.random() * aiPrompts.length)];
  const aiTask: DroppedTask = {
    id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...picked,
    source: 'ai',
  };

  const state = getTaskDropState();
  state.currentTask = aiTask;
  saveTaskDropState(state);
  return aiTask;
}
