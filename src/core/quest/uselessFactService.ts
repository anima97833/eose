/**
 * 冷知识“真的假的？”脑洞小测验服务 (Fact Quiz Service)
 * 接入国内开放中文接口 (Hitokoto 科普/趣味) + 精选真伪辩真题库秒开兜底
 */

export interface FactQuizItem {
  id: string;
  statement: string; // 题目陈述
  isTrue: boolean;   // 正确答案：true 真的 / false 假的
  explanation: string; // 趣味真相解析
  category: string;  // 分类，如 动物趣闻、日常科学、谣言粉碎
  source?: string;
}

/**
 * 精选“真的假的？”冷知识脑洞题库（真假交织，极大激发探索欲与情绪价值）
 */
export const PRESET_FACT_QUIZZES: FactQuizItem[] = [
  {
    id: 'fq_1',
    statement: '海獭在水面上睡觉的时候，会互相紧紧牵着小爪子。',
    isTrue: true,
    explanation: '是真的！海獭睡觉时不仅会裹着海藻，还会两两牵手，防止睡着后被洋流冲散走失，超级有爱。',
    category: '动物趣闻',
    source: '海洋生物观察',
  },
  {
    id: 'fq_2',
    statement: '金鱼的记忆力真的只有短暂的 7 秒钟。',
    isTrue: false,
    explanation: '大谣言！多国动物行为学家实验证明，金鱼的记忆周期至少可达数月之久，还能学会根据特定信号觅食。',
    category: '谣言粉碎',
    source: '动物认知科学',
  },
  {
    id: 'fq_3',
    statement: '牛在无遮挡的旷野吃草或休息时，身体总会下意识对齐地球的磁场南北极。',
    isTrue: true,
    explanation: '是真的！德国科学家通过卫星图分析了全球成千上万头牛，发现它们身体普遍朝向磁场南北方向。',
    category: '自然奥秘',
    source: '德国杜伊斯堡大学研究',
  },
  {
    id: 'fq_4',
    statement: '如果不小心吞下了口香糖，它会在人类的肠胃里黏附停留整整 7 年。',
    isTrue: false,
    explanation: '假的！虽然口香糖胶基人体无法消化，但胃肠蠕动会在几天内将其作为普通食物残渣安全排出体外。',
    category: '谣言粉碎',
    source: '消化医学常识',
  },
  {
    id: 'fq_5',
    statement: '考拉的指纹与人类指纹极其相似，即便用电子显微镜法医都很难一眼分辨。',
    isTrue: true,
    explanation: '是真的！考拉是指纹纹路与人类最接近的动物之一，甚至曾经在澳大利亚的犯罪现场给警方造成过误导。',
    category: '动物奇趣',
    source: '法医生物学研究',
  },
  {
    id: 'fq_6',
    statement: '闪电绝不会在同一个地点击中两次。',
    isTrue: false,
    explanation: '假的！闪电倾向于击中容易放电的最高点，纽约帝国大厦平均每年要被闪电精准劈中 20 多次。',
    category: '谣言粉碎',
    source: '国家气象局',
  },
  {
    id: 'fq_7',
    statement: '草莓表面的一颗颗小芝麻，其实每一颗在植物学上才是一枚真正的独立果实。',
    isTrue: true,
    explanation: '是真的！草莓红色的肉质部分其实是膨大的花托，表面那些像芝麻粒的才是真正的果实（瘦果）。',
    category: '植物趣味',
    source: '植物分类学',
  },
  {
    id: 'fq_8',
    statement: '在土星和木星的高层大气内部，天空中下的其实是货真价实的“钻石雨”。',
    isTrue: true,
    explanation: '是真的！强烈的闪电将甲烷转化为碳粉，碳在极端高温高压下凝固成石墨并进一步被压结晶为固体钻石雨。',
    category: '天体物理',
    source: 'NASA 深空研究',
  },
  {
    id: 'fq_9',
    statement: '人体每晚睡觉时，体温会比白天轻微上升 1 到 2 摄氏度。',
    isTrue: false,
    explanation: '假的！为了降低代谢与促进身体休眠修复，人类在深层睡眠阶段体温反而会下降约 0.5 到 1 摄氏度。',
    category: '生理医学',
    source: '睡眠生理学',
  },
  {
    id: 'fq_10',
    statement: '袋熊排出的便便是规整的正方体，这是大自然为了防止粪便从斜坡滚落演化而来的。',
    isTrue: true,
    explanation: '是真的！袋熊通过有弹性的特殊肠道末端将便便压成方块，用来堆叠在石头上标记领地而不会滚走。',
    category: '动物奇趣',
    source: '生物物理学趣味研究',
  },
  {
    id: 'fq_11',
    statement: '蜂蜜是世界上唯一一种永远不会自然腐坏变质的天然食品。',
    isTrue: true,
    explanation: '是真的！由于极低的水分含量和高糖高酸度，细菌无法存活。埃及金字塔里挖出的 3000 年前蜂蜜仍能吃。',
    category: '日常科学',
    source: '食品科学档案',
  },
  {
    id: 'fq_12',
    statement: '猫咪天生最爱吃甜食，经常会被蛋糕或冰淇淋的甜味吸引。',
    isTrue: false,
    explanation: '假的！猫咪在基因进化中丢失了感受甜味的受体（Tas1r2），它们完全尝不出甜味，吸引它们的是脂肪香气。',
    category: '宠物科普',
    source: '猫科动物行为学',
  },
];

/**
 * 尝试从国内开放接口 (Hitokoto 科普/趣味分类) 获取随机知识
 */
export async function fetchHitokotoFact(): Promise<{ text: string; source: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    // c=d(文学/自然) c=i(诗词/科普/萌趣)
    const res = await fetch('https://v1.hitokoto.cn/?c=d&c=i&encode=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.hitokoto) {
        return {
          text: data.hitokoto,
          source: data.from || 'Hitokoto 一言',
        };
      }
    }
  } catch {
    // 超时或离线
  }
  return null;
}

/**
 * 获取一条随机冷知识脑洞小测验 (秒开兜底保证)
 */
export function getRandomFactQuiz(): FactQuizItem {
  const index = Math.floor(Math.random() * PRESET_FACT_QUIZZES.length);
  return PRESET_FACT_QUIZZES[index];
}
