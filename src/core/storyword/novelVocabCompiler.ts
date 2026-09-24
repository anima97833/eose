import { EnglishWord, VocabLevel } from './storyWordTypes';

// 核心多级精选考纲词汇库：深度覆盖网文爽点、动作、情绪、哲思与四大考试大纲
export const VOCABULARY_DATABASE: EnglishWord[] = [
  // ==================== 1. 大学英语四级 (CET-4) 基础核心高频 ====================
  {
    word: 'abandon',
    phonetic: "/ə'bændən/",
    translation: '抛弃；舍弃；放弃',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['抛弃', '舍弃', '遗弃', '放弃'],
    example: 'He will never abandon his family.',
  },
  {
    word: 'crucial',
    phonetic: "/'kruːʃl/",
    translation: '至关重要的；决定性的',
    partOfSpeech: 'adj.',
    level: 'cet4',
    triggers: ['关键', '至关重要', '生死攸关', '要害'],
    example: 'This is a crucial moment for our victory.',
  },
  {
    word: 'hesitation',
    phonetic: '/ˌhezɪˈteɪʃn/',
    translation: '犹豫；迟疑',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['犹豫', '迟疑', '踌躇', '迟疑不决'],
    example: 'Without any hesitation, he accepted the challenge.',
  },
  {
    word: 'bankruptcy',
    phonetic: "/'bæŋkrəptsi/",
    translation: '破产；倒闭',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['破产', '倒闭', '崩盘', '家道中落'],
    example: 'The company filed for bankruptcy yesterday.',
  },
  {
    word: 'sympathy',
    phonetic: "/'sɪmpəθi/",
    translation: '同情；怜悯',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['同情', '怜悯', '怜惜', '恻隐之心'],
    example: 'He showed no sympathy to his fallen enemies.',
  },
  {
    word: 'revenge',
    phonetic: '/rɪˈvendʒ/',
    translation: '复仇；报复',
    partOfSpeech: 'n./v.',
    level: 'cet4',
    triggers: ['复仇', '报复', '报仇', '雪恨'],
    example: 'His quest for revenge has just begun.',
  },
  {
    word: 'negotiate',
    phonetic: "/nɪ'ɡəʊʃieɪt/",
    translation: '谈判；交涉',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['谈判', '交涉', '协商', '议和'],
    example: 'We are ready to negotiate terms with them.',
  },
  {
    word: 'tremble',
    phonetic: "/'trembl/",
    translation: '颤抖；战栗',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['颤抖', '发抖', '打颤', '瑟瑟发抖'],
    example: 'His hands began to tremble with fear.',
  },
  {
    word: 'despair',
    phonetic: "/dɪ'speə/",
    translation: '绝望',
    partOfSpeech: 'n./v.',
    level: 'cet4',
    triggers: ['绝望', '万念俱灰', '心灰意冷'],
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
    triggers: ['命运', '宿命', '天命', '气数'],
    example: 'No one can escape their own destiny.',
  },
  {
    word: 'victory',
    phonetic: "/'vɪktəri/",
    translation: '胜利；战胜',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['胜利', '大捷', '胜券', '战胜'],
    example: 'This was a glorious victory for the young master.',
  },
  {
    word: 'betrayal',
    phonetic: "/bɪ'treɪəl/",
    translation: '背叛；出卖',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['背叛', '出卖', '反水', '叛变'],
    example: 'He will make them pay dearly for this betrayal.',
  },
  {
    word: 'asset',
    phonetic: "/'æset/",
    translation: '资产；财产',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['资产', '财产', '家底', '身家'],
    example: 'All their assets were frozen in one second.',
  },
  {
    word: 'contract',
    phonetic: "/'kɒntrækt/",
    translation: '合同；契约',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['合同', '契约', '协议', '文书'],
    example: 'He tore the invalid contract into pieces.',
  },
  {
    word: 'calm',
    phonetic: '/kɑːm/',
    translation: '平静的；从容不迫的',
    partOfSpeech: 'adj.',
    level: 'cet4',
    triggers: ['从容', '平静', '冷静', '沉着', '波澜不惊'],
    example: 'He remained completely calm under pressure.',
  },
  {
    word: 'graceful',
    phonetic: "/'ɡreɪsfl/",
    translation: '优雅的；得体的',
    partOfSpeech: 'adj.',
    level: 'cet4',
    triggers: ['优雅', '得体', '从容不迫', '优美'],
    example: 'She held the wine cup with a graceful gesture.',
  },
  {
    word: 'whisper',
    phonetic: "/'wɪspə/",
    translation: '低语；窃窃私语',
    partOfSpeech: 'v./n.',
    level: 'cet4',
    triggers: ['低语', '小声', '耳语', '私语', '窃窃私语'],
    example: 'The crowd began to whisper in bewilderment.',
  },
  {
    word: 'crush',
    phonetic: '/krʌʃ/',
    translation: '粉碎；碾碎；击溃',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['碾碎', '粉碎', '击溃', '压碎', '砸碎'],
    example: 'He will crush all opponents with absolute strength.',
  },
  {
    word: 'dominate',
    phonetic: "/'dɒmɪneɪt/",
    translation: '主宰；支配；统治',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['主宰', '支配', '统领', '统御', '称霸'],
    example: 'He is destined to dominate the entire martial world.',
  },
  {
    word: 'survive',
    phonetic: "/sə'vaɪv/",
    translation: '生存；幸存；活下来',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['幸存', '苟活', '存活', '活下来'],
    example: 'Only the strongest can survive in this harsh domain.',
  },
  {
    word: 'protect',
    phonetic: "/prə'tekt/",
    translation: '守护；保护',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['守护', '保护', '庇护', '护卫'],
    example: 'He swore an oath to protect the family.',
  },
  {
    word: 'escape',
    phonetic: "/ɪ'skeɪp/",
    translation: '逃脱；逃窜',
    partOfSpeech: 'v./n.',
    level: 'cet4',
    triggers: ['逃脱', '逃跑', '遁走', '逃窜'],
    example: 'There is no way to escape from this ancient formation.',
  },
  {
    word: 'threat',
    phonetic: '/θret/',
    translation: '威胁；恐吓',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['威胁', '恐吓', '大患', '危及'],
    example: 'You pose no threat whatsoever to my throne.',
  },
  {
    word: 'reveal',
    phonetic: "/rɪ'viːl/",
    translation: '揭露；显露；展现',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['揭露', '显露', '揭示', '显出', '露出'],
    example: 'He slowly revealed his terrifying real cultivation realm.',
  },
  {
    word: 'ignore',
    phonetic: "/ɪɡ'nɔː/",
    translation: '无视；忽视',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['无视', '忽视', '不理会', '视若无睹'],
    example: 'He chose to ignore their mocking remarks entirely.',
  },
  {
    word: 'resist',
    phonetic: "/rɪ'zɪst/",
    translation: '反抗；抵御',
    partOfSpeech: 'v.',
    level: 'cet4',
    triggers: ['反抗', '抵御', '抵挡', '抗衡'],
    example: 'No one present could resist the crushing pressure.',
  },
  {
    word: 'panic',
    phonetic: "/'pænɪk/",
    translation: '恐慌；惊慌',
    partOfSpeech: 'n./v.',
    level: 'cet4',
    triggers: ['恐慌', '惊慌', '慌乱', '大惊失色'],
    example: 'A sudden wave of panic swept through the crowd.',
  },
  {
    word: 'glory',
    phonetic: "/'ɡlɔːri/",
    translation: '荣耀；光辉',
    partOfSpeech: 'n.',
    level: 'cet4',
    triggers: ['荣耀', '辉煌', '光荣', '无上光辉'],
    example: 'The ancient sect will reclaim its lost glory.',
  },
  {
    word: 'furious',
    phonetic: "/'fjʊəriəs/",
    translation: '狂怒的；暴怒的',
    partOfSpeech: 'adj.',
    level: 'cet4',
    triggers: ['狂怒', '暴怒', '大发雷霆', '怒不可遏'],
    example: 'The elder was completely furious at the disrespect.',
  },

  // ==================== 2. 大学英语六级 (CET-6) 深度进阶词 ====================
  {
    word: 'indifference',
    phonetic: "/ɪn'dɪfrəns/",
    translation: '冷漠；漠不关心',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['冷漠', '淡漠', '漠视', '漠不关心', '不以为意'],
    example: 'Her cold indifference broke his heart completely.',
  },
  {
    word: 'vulnerable',
    phonetic: "/'vʌlnərəbl/",
    translation: '脆弱的；易受攻击的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['脆弱', '易受侵害', '不堪一击', '破绽'],
    example: 'Without support, their defense line is extremely vulnerable.',
  },
  {
    word: 'conspiracy',
    phonetic: "/kən'spɪrəsi/",
    translation: '合谋；阴谋',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['合谋', '阴谋', '密谋', '算计'],
    example: 'They hatched a dark conspiracy against the chairman.',
  },
  {
    word: 'contempt',
    phonetic: '/kənˈtempt/',
    translation: '轻蔑；鄙视',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['轻蔑', '鄙夷', '蔑视', '不屑', '讥诮'],
    example: 'He looked at the challenger with pure contempt.',
  },
  {
    word: 'formidable',
    phonetic: "/'fɔːmɪdəbl/",
    translation: '令人敬畏的；强大的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['强大', '可怕', '令人生畏', '强劲'],
    example: 'He proved to be a formidable adversary.',
  },
  {
    word: 'annihilate',
    phonetic: "/ə'naɪəleɪt/",
    translation: '歼灭；彻底消灭',
    partOfSpeech: 'v.',
    level: 'cet6',
    triggers: ['消灭', '歼灭', '彻底清除', '毁灭', '夷平'],
    example: 'The shockwave will annihilate everything in its path.',
  },
  {
    word: 'shatter',
    phonetic: "/'ʃætə/",
    translation: '粉碎；破灭',
    partOfSpeech: 'v.',
    level: 'cet6',
    triggers: ['破碎', '破灭', '粉碎', '震碎', '崩裂'],
    example: 'His illusion of power shattered instantly.',
  },
  {
    word: 'insolent',
    phonetic: "/'ɪnsələnt/",
    translation: '傲慢无礼的；嚣张的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['嚣张', '猖狂', '桀骜', '跋扈', '狂妄自大'],
    example: 'The insolent young master finally received his punishment.',
  },
  {
    word: 'retaliation',
    phonetic: '/rɪˌtæliˈeɪʃn/',
    translation: '反击；报复',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['反击', '回击', '迎头痛击', '反扑'],
    example: 'His fierce retaliation took everyone by surprise.',
  },
  {
    word: 'manipulate',
    phonetic: "/mə'nɪpjuleɪt/",
    translation: '操纵；掌控',
    partOfSpeech: 'v.',
    level: 'cet6',
    triggers: ['操纵', '掌控', '摆布', '玩弄'],
    example: 'He skillfully manipulated the stock market from behind the scenes.',
  },
  {
    word: 'inevitable',
    phonetic: "/ɪn'evɪtəbl/",
    translation: '不可避免的；必然的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['必然', '不可避免', '注定', '在所难免'],
    example: 'The collapse of their empire was inevitable.',
  },
  {
    word: 'ruthless',
    phonetic: "/'ruːθləs/",
    translation: '冷酷无情的；狠辣的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['冷酷', '狠辣', '无情', '手下不留情', '残忍'],
    example: 'His ruthless efficiency frightened the board members.',
  },
  {
    word: 'prodigy',
    phonetic: "/'prɒdədʒi/",
    translation: '天骄；奇才；神童',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['天骄', '奇才', '绝世神童', '绝世天才'],
    example: 'He was hailed as the greatest cultivation prodigy of the sect.',
  },
  {
    word: 'surpass',
    phonetic: "/sə'pɑːs/",
    translation: '超越；胜过',
    partOfSpeech: 'v.',
    level: 'cet6',
    triggers: ['超越', '胜过', '凌驾于', '盖过'],
    example: 'His cultivation level will soon surpass his master.',
  },
  {
    word: 'humiliation',
    phonetic: '/hjuːˌmɪliˈeɪʃn/',
    translation: '耻辱；奇耻大辱',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['耻辱', '奇耻大辱', '蒙羞', '受辱'],
    example: 'He swallowed the bitter humiliation and vowed to return.',
  },
  {
    word: 'reluctant',
    phonetic: "/rɪ'lʌktənt/",
    translation: '勉强的；不情愿的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['勉强', '不情愿', '无可奈何', '迟疑不决'],
    example: 'They were reluctant to hand over the ancestral treasury.',
  },
  {
    word: 'dignity',
    phonetic: "/'dɪɡnəti/",
    translation: '尊严；威严',
    partOfSpeech: 'n.',
    level: 'cet6',
    triggers: ['尊严', '体面', '威严', '颜面'],
    example: 'No amount of money could buy back their family dignity.',
  },
  {
    word: 'devastating',
    phonetic: "/'devəsteɪtɪŋ/",
    translation: '毁灭性的；沉重打击的',
    partOfSpeech: 'adj.',
    level: 'cet6',
    triggers: ['毁灭性', '沉重打击', '摧毁性', '致命'],
    example: 'That single strike dealt a devastating blow to the dragon.',
  },
  {
    word: 'confront',
    phonetic: "/kən'frʌnt/",
    translation: '对质；迎面交锋',
    partOfSpeech: 'v.',
    level: 'cet6',
    triggers: ['交锋', '对质', '正面对峙', '直面'],
    example: 'He stepped forward to confront the sect elders directly.',
  },
  {
    word: 'provoke',
    phonetic: "/prə'vəʊk/",
    translation: '挑衅；激怒',
    partOfSpeech: 'v.',
    level: 'cet6',
    triggers: ['挑衅', '激怒', '惹恼', '招惹'],
    example: 'Never provoke an awakened tiger in its den.',
  },

  // ==================== 3. 考研 (Kaoyan) 深度学术与高燃哲思词 ====================
  {
    word: 'subjugate',
    phonetic: "/'sʌbdʒuɡeɪt/",
    translation: '征服；降伏；使屈服',
    partOfSpeech: 'v.',
    level: 'kaoyan',
    triggers: ['征服', '降伏', '屈服', '镇压', '降服四方'],
    example: 'He managed to subjugate the wild beast with sheer willpower.',
  },
  {
    word: 'transcend',
    phonetic: '/trænˈsend/',
    translation: '超越；超脱',
    partOfSpeech: 'v.',
    level: 'kaoyan',
    triggers: ['超脱', '超越凡俗', '超然', '超凡脱俗'],
    example: 'His martial comprehension has transcended the mortal realm.',
  },
  {
    word: 'unprecedented',
    phonetic: '/ʌnˈpresɪdentɪd/',
    translation: '史无前例的；空前的',
    partOfSpeech: 'adj.',
    level: 'kaoyan',
    triggers: ['史无前例', '空前', '前所未有', '旷古烁今'],
    example: 'The market witnessed an unprecedented sell-off.',
  },
  {
    word: 'epiphany',
    phonetic: "/ɪ'pɪfəni/",
    translation: '顿悟；灵光乍现',
    partOfSpeech: 'n.',
    level: 'kaoyan',
    triggers: ['顿悟', '顿开茅塞', '心领神会', '醍醐灌顶'],
    example: 'In a sudden moment of epiphany, he broke through the bottleneck.',
  },
  {
    word: 'obliterate',
    phonetic: "/ə'blɪtəreɪt/",
    translation: '彻底抹去；毁灭',
    partOfSpeech: 'v.',
    level: 'kaoyan',
    triggers: ['抹杀', '轰杀', '荡平', '抹去', '斩草除根'],
    example: 'The supreme divine sword will obliterate all enemies.',
  },
  {
    word: 'invincible',
    phonetic: "/ɪn'vɪnsəbl/",
    translation: '不可战胜的；无敌的',
    partOfSpeech: 'adj.',
    level: 'kaoyan',
    triggers: ['无敌', '战无不胜', '不可战胜', '所向披靡'],
    example: 'His golden physique made him practically invincible.',
  },
  {
    word: 'treacherous',
    phonetic: "/'tretʃərəs/",
    translation: '奸诈的；背信弃义的',
    partOfSpeech: 'adj.',
    level: 'kaoyan',
    triggers: ['奸诈', '背信弃义', '阴险', '狡黠'],
    example: 'Beware of treacherous allies plotting in the shadows.',
  },
  {
    word: 'omnipotent',
    phonetic: "/ɒm'nɪpətənt/",
    translation: '全能的；无所不能的',
    partOfSpeech: 'adj.',
    level: 'kaoyan',
    triggers: ['全能', '无所不能', '至高', '通天彻地'],
    example: 'The ancient god was worshipped as an omnipotent entity.',
  },
  {
    word: 'reverence',
    phonetic: "/'revərəns/",
    translation: '敬畏；崇敬',
    partOfSpeech: 'n.',
    level: 'kaoyan',
    triggers: ['敬畏', '尊崇', '膜拜', '顶礼膜拜'],
    example: 'The disciples bowed with deepest reverence.',
  },
  {
    word: 'metamorphosis',
    phonetic: '/ˌmetəˈmɔːfəsɪs/',
    translation: '蜕变；质变',
    partOfSpeech: 'n.',
    level: 'kaoyan',
    triggers: ['蜕变', '化茧成蝶', '质变', '脱胎换骨'],
    example: 'The boy underwent a miraculous metamorphosis.',
  },
  {
    word: 'predicament',
    phonetic: "/prɪ'dɪkəmənt/",
    translation: '困境；尴尬境地',
    partOfSpeech: 'n.',
    level: 'kaoyan',
    triggers: ['困境', '进退两难', '死局', '危局'],
    example: 'How will the young lord escape this mortal predicament?',
  },
  {
    word: 'perseverance',
    phonetic: '/ˌpɜːsəˈvɪərəns/',
    translation: '坚韧不拔；毅力',
    partOfSpeech: 'n.',
    level: 'kaoyan',
    triggers: ['毅力', '坚韧不拔', '百折不挠', '持之以恒'],
    example: 'His ultimate weapon was not magic, but iron perseverance.',
  },
  {
    word: 'conspicuous',
    phonetic: "/kən'spɪkjuəs/",
    translation: '显赫的；显眼的',
    partOfSpeech: 'adj.',
    level: 'kaoyan',
    triggers: ['显赫', '引人瞩目', '惹眼', '显眼'],
    example: 'His golden halo made him conspicuous across the battlefield.',
  },
  {
    word: 'retribution',
    phonetic: '/ˌretrɪˈbjuːʃn/',
    translation: '因果报应；天谴惩戒',
    partOfSpeech: 'n.',
    level: 'kaoyan',
    triggers: ['天谴', '报应', '因果报应', '天道惩戒'],
    example: 'None can evade heavenly retribution when their sins run deep.',
  },
  {
    word: 'abyss',
    phonetic: "/ə'bɪs/",
    translation: '深渊；万丈深渊',
    partOfSpeech: 'n.',
    level: 'kaoyan',
    triggers: ['深渊', '万丈深渊', '无底洞', '九幽'],
    example: 'He peered into the dark abyss without blinking an eye.',
  },
  {
    word: 'sovereign',
    phonetic: "/'sɒvrɪn/",
    translation: '君主；主宰者；至高无上的',
    partOfSpeech: 'n./adj.',
    level: 'kaoyan',
    triggers: ['君主', '主宰者', '至尊', '霸主'],
    example: 'He crowned himself sovereign of the nine realms.',
  },
  {
    word: 'dormant',
    phonetic: "/'dɔːmənt/",
    translation: '蛰伏的；休眠的',
    partOfSpeech: 'adj.',
    level: 'kaoyan',
    triggers: ['蛰伏', '休眠', '潜伏', '沉睡'],
    example: 'The dormant dragon soul finally woke within his dantian.',
  },
  {
    word: 'ascend',
    phonetic: "/ə'send/",
    translation: '飞升；登顶；冉冉升起',
    partOfSpeech: 'v.',
    level: 'kaoyan',
    triggers: ['飞升', '登顶', '升腾', '崛起'],
    example: 'Tonight, he shall break the heavenly gate and ascend.',
  },

  // ==================== 4. 雅思 (IELTS) 国际学术与高阶思辨词 ====================
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
    triggers: ['波动', '剧烈震荡', '大起大落', '起伏'],
    example: 'Severe market fluctuation panicked retail investors.',
  },
  {
    word: 'monopolize',
    phonetic: "/mə'nɒpəlaɪz/",
    translation: '垄断；独占',
    partOfSpeech: 'v.',
    level: 'ielts',
    triggers: ['垄断', '独占', '包揽', '把持'],
    example: 'The consortium sought to monopolize the spiritual stone mines.',
  },
  {
    word: 'paramount',
    phonetic: "/'pærəmaʊnt/",
    translation: '至高无上的；头等重要的',
    partOfSpeech: 'adj.',
    level: 'ielts',
    triggers: ['至高无上', '头等', '首要', '重中之重'],
    example: 'Preserving core sect secrets is of paramount importance.',
  },
  {
    word: 'exponential',
    phonetic: '/ˌekspəˈnenʃl/',
    translation: '指数级的；成倍暴增的',
    partOfSpeech: 'adj.',
    level: 'ielts',
    triggers: ['指数级', '暴增', '爆发式', '几何级数'],
    example: 'His energy levels displayed exponential growth.',
  },
  {
    word: 'stagnation',
    phonetic: '/stæɡˈneɪʃn/',
    translation: '停滞；停滞不前',
    partOfSpeech: 'n.',
    level: 'ielts',
    triggers: ['停滞', '裹足不前', '迟缓', '瓶颈期'],
    example: 'After years of stagnation, his realm finally broke through.',
  },
  {
    word: 'adversity',
    phonetic: "/əd'vɜːsəti/",
    translation: '逆境；不幸；磨难',
    partOfSpeech: 'n.',
    level: 'ielts',
    triggers: ['逆境', '困顿', '磨难', '艰难险阻'],
    example: 'True heroes show their fortitude in the face of adversity.',
  },
  {
    word: 'lucrative',
    phonetic: "/'luːkrətɪv/",
    translation: '获利丰厚的；暴利的',
    partOfSpeech: 'adj.',
    level: 'ielts',
    triggers: ['暴利', '利益丰厚', '赚得盆满钵满', '大捞一笔'],
    example: 'This was the most lucrative deal in the history of the corporation.',
  },
  {
    word: 'scrutinize',
    phonetic: "/'skruːtənaɪz/",
    translation: '仔细端详；审视',
    partOfSpeech: 'v.',
    level: 'ielts',
    triggers: ['审视', '端详', '细致打量', '上下打量'],
    example: 'The grandmaster scrutinized the ancient pill for flaws.',
  },
  {
    word: 'culmination',
    phonetic: '/ˌkʌlmɪˈneɪʃn/',
    translation: '顶峰；巅峰；集大成者',
    partOfSpeech: 'n.',
    level: 'ielts',
    triggers: ['巅峰', '顶峰', '集大成', '极峰'],
    example: 'This supreme sword technique is the culmination of his life work.',
  },
  {
    word: 'hierarchy',
    phonetic: "/'haɪərɑːki/",
    translation: '等级制度；层级结构',
    partOfSpeech: 'n.',
    level: 'ielts',
    triggers: ['等级', '森严等级', '层级', '尊卑有序'],
    example: 'Strict hierarchy dictated where each disciple could sit.',
  },
  {
    word: 'ambivalence',
    phonetic: "/æm'bɪvələns/",
    translation: '矛盾心理；纠结',
    partOfSpeech: 'n.',
    level: 'ielts',
    triggers: ['矛盾', '内心挣扎', '纠结', '悲喜交加'],
    example: 'He looked at his fallen brother with deep ambivalence.',
  },
  {
    word: 'deterioration',
    phonetic: '/dɪˌtɪəriəˈreɪʃn/',
    translation: '恶化；退化；衰败',
    partOfSpeech: 'n.',
    level: 'ielts',
    triggers: ['恶化', '衰败', '每况愈下', '退化'],
    example: 'The rapid deterioration of the barrier sent shockwaves.',
  },
  {
    word: 'profound',
    phonetic: "/prə'faʊnd/",
    translation: '深奥的；博大精深的；深沉的',
    partOfSpeech: 'adj.',
    level: 'ielts',
    triggers: ['深奥', '博大精深', '深沉', '玄妙'],
    example: 'His eyes held a profound depth that no youngster could possess.',
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
 * 获取对应级别词汇库
 * @param targetLevel 目标考试级别
 * @param strictOnly 是否只返回该级别专有词（不包含更低阶词汇）
 */
export function getVocabularyForLevel(
  targetLevel: VocabLevel,
  strictOnly: boolean = false
): EnglishWord[] {
  if (strictOnly) {
    return VOCABULARY_DATABASE.filter(w => w.level === targetLevel);
  }
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
 * @param level 目标等级 (cet4 | cet6 | kaoyan | ielts)
 * @param density 插入替换密度 (0.1 ~ 1.0, 1.0 为遇到必抠 100% 替换)
 * @param customWords 用户在线技术划词抠入的专属生词库 (享有 100% 最高置换权)
 * @param strictOnly 是否仅使用目标等级词库（不包含低级基础词）
 */
export function compileNovelText(
  originalText: string,
  level: VocabLevel,
  density: number = 0.35,
  customWords: EnglishWord[] = [],
  strictOnly: boolean = false,
  lexiconWords?: EnglishWord[]
): CompiledParagraph[] {
  // 整理触发词哈希与排序 (长词优先，且用户自定义抠入词具备绝对优先级)
  const triggerMap: { trigger: string; word: EnglishWord; isCustom?: boolean }[] = [];

  // 1. 用户在线单次抠入生词 (最高优先级)
  customWords.forEach(w => {
    w.triggers.forEach(t => {
      triggerMap.push({ trigger: t, word: w, isCustom: true });
    });
  });

  // 2. 如果指定了私人词库，则使用私人专属词库生词
  if (lexiconWords && lexiconWords.length > 0) {
    lexiconWords.forEach(w => {
      w.triggers.forEach(t => {
        triggerMap.push({ trigger: t, word: w, isCustom: false });
      });
    });
  } else {
    // 3. 否则使用四六级/考研/雅思官方考纲词库
    getVocabularyForLevel(level, strictOnly).forEach(w => {
      w.triggers.forEach(t => {
        triggerMap.push({ trigger: t, word: w, isCustom: false });
      });
    });
  }

  // 长触发词优先，确保复合词最先命中（如“至关重要”优先于“关键”）
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
          // 自定义抠词 100% 替换；
          // 大纲词根据密度概率决定是否替换；当 density >= 0.98 时视为 100% 全书遇到必抠
          const pseudoSeed = (cursor * 37 + para.length * 13) % 100;
          const shouldInsert =
            item.isCustom || pseudoSeed < density * 100 || density >= 0.98;

          if (shouldInsert) {
            tokens.push({
              type: 'word',
              word: { ...item.word, word: item.word.word.trim() },
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
