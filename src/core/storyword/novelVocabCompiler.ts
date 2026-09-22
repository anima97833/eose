import { EnglishWord, VocabLevel } from './storyWordTypes';

// 核心多级精选词汇库：高频覆盖网文高燃词汇与四大考试大纲
export const VOCABULARY_DATABASE: EnglishWord[] = [
  // --- CET-4 ---
  {
    word: 'abandon',
    phonetic: "/ə'bændən/",
    translation: '抛弃；舍弃；放弃',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['抛弃', '舍弃', '遗弃'],
    example: 'He will never abandon his family.',
  },
  {
    word: 'crucial',
    phonetic: "/'kruːʃl/",
    translation: '至关重要的；决定性的',
    partOfSpeech: 'adj.',
    level: 'cet4',
    triggers: ['关键', '至关重要', '生死攸关'],
    example: 'This is a crucial moment for our victory.',
  },
  {
    word: 'hesitation',
    phonetic: '/ˌhezɪˈteɪʃn/',
    translation: '犹豫；迟疑',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['犹豫', '迟疑', '踌躇'],
    example: 'Without any hesitation, he accepted the challenge.',
  },
  {
    word: 'bankruptcy',
    phonetic: "/'bæŋkrəptsi/",
    translation: '破产；倒闭',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['破产', '倒闭', '崩盘'],
    example: 'The company filed for bankruptcy yesterday.',
  },
  {
    word: 'sympathy',
    phonetic: "/'sɪmpəθi/",
    translation: '同情；怜悯',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['同情', '怜悯', '怜惜'],
    example: 'He showed no sympathy to his fallen enemies.',
  },
  {
    word: 'revenge',
    phonetic: '/rɪˈvendʒ/',
    translation: '复仇；报复',
    partOfSpeech: 'n./v.',
    level: 'cet4',
    triggers: ['复仇', '报复', '报仇'],
    example: 'His quest for revenge has just begun.',
  },
  {
    word: 'negotiate',
    phonetic: "/nɪ'ɡəʊʃieɪt/",
    translation: '谈判；交涉',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['谈判', '交涉', '协商'],
    example: 'We are ready to negotiate terms with them.',
  },
  {
    word: 'tremble',
    phonetic: "/'trembl/",
    translation: '颤抖；战栗',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['颤抖', '发抖', '打颤'],
    example: 'His hands began to tremble with fear.',
  },
  {
    word: 'despair',
    phonetic: "/dɪ'speə/",
    translation: '绝望',
    partOfSpeech: 'n./v.',
    level: 'cet4',
    triggers: ['绝望', '万念俱灰'],
    example: 'A look of deep despair appeared in their eyes.',
  },
  {
    word: 'arrogant',
    phonetic: "/'ærəɡənt/",
    translation: '傲慢的；自大的',
    partOfSpeech: 'adj.',
    level: 'cet4',
    triggers: ['傲慢', '高傲', '目中无人', '骄横'],
    example: 'His arrogant smile vanished in an instant.',
  },
  {
    word: 'destiny',
    phonetic: "/'destɪni/",
    translation: '命运；宿命',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['命运', '宿命', '天命'],
    example: 'No one can escape their own destiny.',
  },
  {
    word: 'victory',
    phonetic: "/'vɪktəri/",
    translation: '胜利；战胜',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['胜利', '大捷', '胜券'],
    example: 'This was a glorious victory for the young master.',
  },
  {
    word: 'betrayal',
    phonetic: "/bɪ'treɪəl/",
    translation: '背叛；出卖',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['背叛', '出卖', '反水'],
    example: 'He will make them pay dearly for this betrayal.',
  },
  {
    word: 'asset',
    phonetic: "/'æset/",
    translation: '资产；财产',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['资产', '财产', '家底'],
    example: 'All their assets were frozen in one second.',
  },
  {
    word: 'contract',
    phonetic: "/'kɒntrækt/",
    translation: '合同；契约',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['合同', '契约', '协议'],
    example: 'He tore the invalid contract into pieces.',
  },
  {
    word: 'calm',
    phonetic: '/kɑːm/',
    translation: '平静的；从容不迫的',
    partOfSpeech: 'adj.',
    level: 'cet4',
    triggers: ['从容', '平静', '冷静', '沉着'],
    example: 'He remained completely calm under pressure.',
  },
  {
    word: 'graceful',
    phonetic: "/'ɡreɪsfl/",
    translation: '优雅的；得体的',
    partOfSpeech: 'adj.',
    level: 'cet4',
    triggers: ['优雅', '得体', '从容不迫'],
    example: 'She held the wine cup with a graceful gesture.',
  },
  {
    word: 'whisper',
    phonetic: "/'wɪspə/",
    translation: '低语；窃窃私语',
    partOfSpeech: 'v./n.',
    level: 'cet4',
    triggers: ['低语', '小声', '耳语', '私语'],
    example: 'The crowd began to whisper in bewilderment.',
  },
  {
    word: 'crush',
    phonetic: '/krʌʃ/',
    translation: '粉碎；碾碎；击溃',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['碾碎', '粉碎', '击溃', '压碎'],
    example: 'He will crush all opponents with absolute strength.',
  },
  {
    word: 'dominate',
    phonetic: "/'dɒmɪneɪt/",
    translation: '主宰；支配；统治',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['主宰', '支配', '统领', '统御'],
    example: 'He is destined to dominate the entire martial world.',
  },

  // --- CET-6 ---
  {
    word: 'indifference',
    phonetic: "/ɪn'dɪfrəns/",
    translation: '冷漠；漠不关心',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['冷漠', '淡漠', '漠视', '漠不关心'],
    example: 'Her cold indifference broke his heart completely.',
  },
  {
    word: 'vulnerable',
    phonetic: "/'vʌlnərəbl/",
    translation: '脆弱的；易受攻击的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['脆弱', '易受侵害', '不堪一击'],
    example: 'Without support, their defense line is extremely vulnerable.',
  },
  {
    word: 'conspiracy',
    phonetic: "/kən'spɪrəsi/",
    translation: '合谋；阴谋',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['合谋', '阴谋', '密谋'],
    example: 'They hatched a dark conspiracy against the chairman.',
  },
  {
    word: 'contempt',
    phonetic: '/kənˈtempt/',
    translation: '轻蔑；鄙视',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['轻蔑', '鄙夷', '蔑视', '不屑'],
    example: 'He looked at the challenger with pure contempt.',
  },
  {
    word: 'formidable',
    phonetic: "/'fɔːmɪdəbl/",
    translation: '令人敬畏的；强大的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['强大', '可怕', '令人生畏'],
    example: 'He proved to be a formidable adversary.',
  },
  {
    word: 'annihilate',
    phonetic: "/ə'naɪəleɪt/",
    translation: '歼灭；彻底消灭',
    partOfSpeech: 'v.',
    level: 'cet6',
    triggers: ['消灭', '歼灭', '彻底清除', '毁灭'],
    example: 'The shockwave will annihilate everything in its path.',
  },
  {
    word: 'shatter',
    phonetic: "/'ʃætə/",
    translation: '粉碎；破灭',
    partOfSpeech: 'v.',
    level: 'cet6',
    triggers: ['破碎', '破灭', '粉碎', '震碎'],
    example: 'His illusion of power shattered instantly.',
  },
  {
    word: 'insolent',
    phonetic: "/'ɪnsələnt/",
    translation: '傲慢无礼的；嚣张的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['嚣张', '猖狂', '桀骜', '跋扈'],
    example: 'The insolent young master finally received his punishment.',
  },
  {
    word: 'retaliation',
    phonetic: '/rɪˌtæliˈeɪʃn/',
    translation: '反击；报复',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['反击', '回击', '迎头痛击'],
    example: 'His fierce retaliation took everyone by surprise.',
  },
  {
    word: 'manipulate',
    phonetic: "/mə'nɪpjuleɪt/",
    translation: '操纵；掌控',
    partOfSpeech: 'v.',
    level: 'cet6',
    triggers: ['操纵', '掌控', '摆布'],
    example: 'He skillfully manipulated the stock market from behind the scenes.',
  },
  {
    word: 'inevitable',
    phonetic: "/ɪn'evɪtəbl/",
    translation: '不可避免的；必然的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['必然', '不可避免', '注定'],
    example: 'The collapse of their empire was inevitable.',
  },
  {
    word: 'ruthless',
    phonetic: "/'ruːθləs/",
    translation: '冷酷无情的；狠辣的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['冷酷', '狠辣', '无情', '手下不留情'],
    example: 'His ruthless efficiency frightened the board members.',
  },
  {
    word: 'prodigy',
    phonetic: "/'prɒdədʒi/",
    translation: '天骄；奇才；神童',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['天骄', '奇才', '绝世神童'],
    example: 'He was hailed as the greatest cultivation prodigy of the sect.',
  },
  {
    word: 'surpass',
    phonetic: "/sə'pɑːs/",
    translation: '超越；胜过',
    partOfSpeech: 'v.',
    level: 'cet6',
    triggers: ['超越', '胜过', '凌驾于'],
    example: 'His cultivation level will soon surpass his master.',
  },

  // --- 考研 (Kaoyan) ---
  {
    word: 'subjugate',
    phonetic: "/'sʌbdʒuɡeɪt/",
    translation: '征服；降伏；使屈服',
    partOfSpeech: 'v.',
    level: 'kaoyan',
    triggers: ['征服', '降伏', '屈服', '镇压'],
    example: 'He managed to subjugate the wild beast with sheer willpower.',
  },
  {
    word: 'transcend',
    phonetic: '/trænˈsend/',
    translation: '超越；超脱',
    partOfSpeech: 'v.',
    level: 'kaoyan',
    triggers: ['超脱', '超越凡俗', '超然'],
    example: 'His martial comprehension has transcended the mortal realm.',
  },
  {
    word: 'unprecedented',
    phonetic: '/ʌnˈpresɪdentɪd/',
    translation: '史无前例的；空前的',
    partOfSpeech: 'adj.',
    level: 'kaoyan',
    triggers: ['史无前例', '空前', '前所未有'],
    example: 'The market witnessed an unprecedented sell-off.',
  },
  {
    word: 'epiphany',
    phonetic: "/ɪ'pɪfəni/",
    translation: '顿悟；灵光乍现',
    partOfSpeech: 'n.',
    level: 'kaoyan',
    triggers: ['顿悟', '顿开茅塞', '心领神会'],
    example: 'In a sudden moment of epiphany, he broke through the bottleneck.',
  },
  {
    word: 'obliterate',
    phonetic: "/ə'blɪtəreɪt/",
    translation: '彻底抹去；毁灭',
    partOfSpeech: 'v.',
    level: 'kaoyan',
    triggers: ['抹杀', '轰杀', '荡平', '抹去'],
    example: 'The supreme divine sword will obliterate all enemies.',
  },
  {
    word: 'invincible',
    phonetic: "/ɪn'vɪnsəbl/",
    translation: '不可战胜的；无敌的',
    partOfSpeech: 'adj.',
    level: 'kaoyan',
    triggers: ['无敌', '战无不胜', '不可战胜'],
    example: 'His golden physique made him practically invincible.',
  },
  {
    word: 'treacherous',
    phonetic: "/'tretʃərəs/",
    translation: '奸诈的；背信弃义的',
    partOfSpeech: 'adj.',
    level: 'kaoyan',
    triggers: ['奸诈', '背信弃义', '阴险'],
    example: 'Beware of treacherous allies plotting in the shadows.',
  },
  {
    word: 'omnipotent',
    phonetic: "/ɒm'nɪpətənt/",
    translation: '全能的；无所不能的',
    partOfSpeech: 'adj.',
    level: 'kaoyan',
    triggers: ['全能', '无所不能', '至高'],
    example: 'The ancient god was worshipped as an omnipotent entity.',
  },
  {
    word: 'reverence',
    phonetic: "/'revərəns/",
    translation: '敬畏；崇敬',
    partOfSpeech: 'n.',
    level: 'kaoyan',
    triggers: ['敬畏', '尊崇', '膜拜'],
    example: 'The disciples bowed with deepest reverence.',
  },
  {
    word: 'metamorphosis',
    phonetic: '/ˌmetəˈmɔːfəsɪs/',
    translation: '蜕变；质变',
    partOfSpeech: 'n.',
    level: 'kaoyan',
    triggers: ['蜕变', '化茧成蝶', '质变'],
    example: 'The boy underwent a miraculous metamorphosis.',
  },

  // --- 雅思 (IELTS) ---
  {
    word: 'catastrophic',
    phonetic: '/ˌkætəˈstrɒfɪk/',
    translation: '灾难性的；毁灭性的',
    partOfSpeech: 'adj.',
    level: 'ielts',
    triggers: ['灾难性', '崩塌性', '万劫不复', '沉痛打击'],
    example: 'The collapse caused catastrophic consequences across industries.',
  },
  {
    word: 'fluctuation',
    phonetic: '/ˌflʌktʃuˈeɪʃn/',
    translation: '波动；震荡',
    partOfSpeech: 'n.',
    level: 'ielts',
    triggers: ['波动', '剧烈震荡', '大起大落'],
    example: 'Severe market fluctuation panicked retail investors.',
  },
  {
    word: 'monopolize',
    phonetic: "/mə'nɒpəlaɪz/",
    translation: '垄断；独占',
    partOfSpeech: 'v.',
    level: 'ielts',
    triggers: ['垄断', '独占', '包揽'],
    example: 'The consortium sought to monopolize the spiritual stone mines.',
  },
  {
    word: 'paramount',
    phonetic: "/'pærəmaʊnt/",
    translation: '至高无上的；头等重要的',
    partOfSpeech: 'adj.',
    level: 'ielts',
    triggers: ['至高无上', '头等', '首要'],
    example: 'Preserving core sect secrets is of paramount importance.',
  },
  {
    word: 'exponential',
    phonetic: '/ˌekspəˈnenʃl/',
    translation: '指数级的；成倍增长的',
    partOfSpeech: 'adj.',
    level: 'ielts',
    triggers: ['指数级', '暴增', '爆发式'],
    example: 'His energy levels displayed exponential growth.',
  },
  {
    word: 'stagnation',
    phonetic: '/stæɡˈneɪʃn/',
    translation: '停滞；停滞不前',
    partOfSpeech: 'n.',
    level: 'ielts',
    triggers: ['停滞', '裹足不前', '迟缓'],
    example: 'After years of stagnation, his realm finally broke through.',
  },
  {
    word: 'adversity',
    phonetic: "/əd'vɜːsəti/",
    translation: '逆境；不幸',
    partOfSpeech: 'n.',
    level: 'ielts',
    triggers: ['逆境', '困顿', '磨难'],
    example: 'True heroes show their fortitude in the face of adversity.',
  },
  {
    word: 'lucrative',
    phonetic: "/'luːkrətɪv/",
    translation: '获利丰厚的；暴利的',
    partOfSpeech: 'adj.',
    level: 'ielts',
    triggers: ['暴利', '利益丰厚', '赚得盆满钵满'],
    example: 'This was the most lucrative deal in the history of the corporation.',
  },
];

/**
 * 单词与文本编译 Token
 */
export type StoryToken =
  | { type: 'text'; content: string }
  | { type: 'word'; word: EnglishWord; originalTrigger: string };

export interface CompiledParagraph {
  tokens: StoryToken[];
}

/**
 * 获取对应级别（包含基础级）的词汇库
 */
export function getVocabularyForLevel(targetLevel: VocabLevel): EnglishWord[] {
  const levelOrder: Record<VocabLevel, number> = {
    cet4: 1,
    cet6: 2,
    kaoyan: 3,
    ielts: 4,
  };
  const targetRank = levelOrder[targetLevel] || 1;
  return VOCABULARY_DATABASE.filter(w => levelOrder[w.level] <= targetRank);
}

/**
 * 将小说原文章节智能编译为带有英文融合的 Token 树
 * 实现了网文混英（例如：“顾总轻轻抿了一小口，嘴角扬起一抹 cold [indifference] 的弧度”）
 * @param originalText 章节中文原文
 * @param level 目标等级
 * @param density 插入替换密度 (0.1 ~ 0.4)
 */
export function compileNovelText(
  originalText: string,
  level: VocabLevel,
  density: number = 0.2
): CompiledParagraph[] {
  const vocabList = getVocabularyForLevel(level);

  // 整理触发词哈希与排序 (长词优先，避免子串先被截断)
  const triggerMap: { trigger: string; word: EnglishWord }[] = [];
  vocabList.forEach(w => {
    w.triggers.forEach(t => {
      triggerMap.push({ trigger: t, word: w });
    });
  });
  triggerMap.sort((a, b) => b.trigger.length - a.trigger.length);

  const paragraphs = originalText
    .split(/\r?\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const compiledParagraphs: CompiledParagraph[] = [];

  paragraphs.forEach(para => {
    const tokens: StoryToken[] = [];
    let cursor = 0;

    while (cursor < para.length) {
      let matched = false;

      // 检查当前游标位置是否命中触发词
      for (const item of triggerMap) {
        if (para.startsWith(item.trigger, cursor)) {
          // 根据密度概率决定是否替换（但保证命中时有合理的随机或确定替换）
          // 这里使用确定性伪随机以避免同一段落重复闪烁
          const pseudoSeed = (cursor * 37 + para.length * 13) % 100;
          const shouldInsert = pseudoSeed < density * 100 || density >= 0.35;

          if (shouldInsert) {
            tokens.push({
              type: 'word',
              word: item.word,
              originalTrigger: item.trigger,
            });
            cursor += item.trigger.length;
            matched = true;
            break;
          }
        }
      }

      if (!matched) {
        // 如果前面已有 text token，合并以减少 fragment
        const nextChar = para[cursor];
        const lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === 'text') {
          lastToken.content += nextChar;
        } else {
          tokens.push({ type: 'text', content: nextChar });
        }
        cursor += 1;
      }
    }

    compiledParagraphs.push({ tokens });
  });

  return compiledParagraphs;
}

/**
 * 随机获取同级别干扰选项
 */
export function getRandomDistractors(
  correctWord: EnglishWord,
  count: number = 3
): EnglishWord[] {
  const candidates = VOCABULARY_DATABASE.filter(w => w.word !== correctWord.word);
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
