// 迪士尼童话星愿签 · 治愈寄语服务
// 精选全系列经典童话角色、官方经典台词（地道优美中文 + 英文原声）、高清官方立绘

export interface DisneyWishCard {
  id: string;
  character: string;
  characterEn: string;
  movie: string;
  quoteCn: string;
  quoteEn: string;
  avatarUrl: string;
  themeColor: string;
  gradient: string;
  healingTag: string;
}

export const DISNEY_WISH_CARDS: DisneyWishCard[] = [
  {
    id: 'simba_lionking',
    character: '辛巴',
    characterEn: 'Simba',
    movie: '《狮子王》The Lion King',
    quoteCn: '过去或许让人痛心，但你可以选择逃避，或者选择从中学习。',
    quoteEn: 'The past can hurt. But the way I see it, you can either run from it, or learn from it.',
    avatarUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=700&q=80',
    themeColor: '#D97706',
    gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    healingTag: '勇往直前',
  },
  {
    id: 'elsa_frozen',
    character: '艾莎',
    characterEn: 'Elsa',
    movie: '《冰雪奇缘》Frozen',
    quoteCn: '抛开过去的顾虑，迎风迎雪展翅，风雪再大也动摇不了我。',
    quoteEn: 'Let it go, let it go. And I\'ll rise like the break of dawn.',
    avatarUrl: 'https://images.unsplash.com/photo-1517865288-978fcb780652?auto=format&fit=crop&w=700&q=80',
    themeColor: '#0284C7',
    gradient: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
    healingTag: '拥抱真实',
  },
  {
    id: 'woody_toystory',
    character: '胡迪',
    characterEn: 'Woody',
    movie: '《玩具总动员》Toy Story',
    quoteCn: '因为有你的陪伴，即使面对风雨，这趟旅程也变得无比闪耀。',
    quoteEn: 'You\'ve got a friend in me. When the road looks rough ahead, you just remember what your old pal said.',
    avatarUrl: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=700&q=80',
    themeColor: '#B45309',
    gradient: 'linear-gradient(135deg, #FEF9C3 0%, #FDE047 100%)',
    healingTag: '温暖陪伴',
  },
  {
    id: 'baymax_bighero6',
    character: '大白',
    characterEn: 'Baymax',
    movie: '《超能陆战队》Big Hero 6',
    quoteCn: '你哭泣也没关系，感到疲惫也是人之常情。我永远在这里守护你。',
    quoteEn: 'It is okay to cry. Crying is a natural response to pain. I will always be here for you.',
    avatarUrl: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=700&q=80',
    themeColor: '#E11D48',
    gradient: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)',
    healingTag: '终极疗愈',
  },
  {
    id: 'rapunzel_tangled',
    character: '乐佩',
    characterEn: 'Rapunzel',
    movie: '《魔发奇缘》Tangled',
    quoteCn: '走出舒适区，去探索未知的世界，真正的奇迹才刚要开始。',
    quoteEn: 'Venture outside your comfort zone. The rewards are worth it.',
    avatarUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
    themeColor: '#9333EA',
    gradient: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
    healingTag: '探索未知',
  },
  {
    id: 'judy_zootopia',
    character: '朱迪',
    characterEn: 'Judy Hopps',
    movie: '《疯狂动物城》Zootopia',
    quoteCn: '生活总会有点凌乱，我们都会犯错。但无论发生什么，都要努力尝试让世界变好一点点。',
    quoteEn: 'Change starts with you, it starts with me, it starts with all of us. Try everything.',
    avatarUrl: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=700&q=80',
    themeColor: '#2563EB',
    gradient: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
    healingTag: '永不放弃',
  },
  {
    id: 'pooh_winnie',
    character: '小熊维尼',
    characterEn: 'Winnie the Pooh',
    movie: '《小熊维尼》Winnie the Pooh',
    quoteCn: '你比你自己想象的要勇敢，比外表看起来更坚强，也比你所知道的更聪明。',
    quoteEn: 'You are braver than you believe, stronger than you seem, and smarter than you think.',
    avatarUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=700&q=80',
    themeColor: '#EA580C',
    gradient: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
    healingTag: '笃定信念',
  },
  {
    id: 'miguel_coco',
    character: '米格',
    characterEn: 'Miguel',
    movie: '《寻梦环游记》Coco',
    quoteCn: '在爱的记忆消失以前，请记得每一个深深爱着你的人。',
    quoteEn: 'Remember me, though I have to say goodbye. Remember me, don\'t let it make you cry.',
    avatarUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=700&q=80',
    themeColor: '#F97316',
    gradient: 'linear-gradient(135deg, #FFEDD5 0%, #FDBA74 100%)',
    healingTag: '温情守候',
  },
  {
    id: 'dumbo_dumbo',
    character: '小飞象',
    characterEn: 'Dumbo',
    movie: '《小飞象》Dumbo',
    quoteCn: '那些让你感到与众不同、甚至让你跌倒的事情，终将成为托举你飞翔的翅膀。',
    quoteEn: 'The very things that held you down are gonna carry you up, and up, and up!',
    avatarUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=700&q=80',
    themeColor: '#6366F1',
    gradient: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
    healingTag: '独特光芒',
  },
  {
    id: 'mulan_mulan',
    character: '花木兰',
    characterEn: 'Mulan',
    movie: '《花木兰》Mulan',
    quoteCn: '在严寒与逆境中绽放的花朵，往往是世间最珍贵、最美丽的。',
    quoteEn: 'The flower that blooms in adversity is the most rare and beautiful of all.',
    avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80',
    themeColor: '#DC2626',
    gradient: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
    healingTag: '坚韧不拔',
  },
  {
    id: 'walle_walle',
    character: '瓦力 & 伊娃',
    characterEn: 'WALL-E',
    movie: '《机器人总动员》WALL-E',
    quoteCn: '我不想只是单纯地生存，我想真正地活着，去感受每一颗星辰的温度。',
    quoteEn: 'I don\'t want to survive. I want to live.',
    avatarUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=80',
    themeColor: '#0D9488',
    gradient: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
    healingTag: '生命温度',
  },
  {
    id: 'aladdin_genie',
    character: '精灵',
    characterEn: 'Genie',
    movie: '《阿拉丁》Aladdin',
    quoteCn: '真正的宝藏从不在皇宫金库里，而在你愿意为他人真诚付出的真心深处。',
    quoteEn: 'Like so many things, it is not what is outside, but what is inside that counts.',
    avatarUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
    themeColor: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #E0F2FE 0%, #7DD3FC 100%)',
    healingTag: '真挚纯粹',
  },
];

// 随机获取一张童话星愿卡
export function getRandomDisneyWish(excludeId?: string): DisneyWishCard {
  const pool = excludeId
    ? DISNEY_WISH_CARDS.filter((c) => c.id !== excludeId)
    : DISNEY_WISH_CARDS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] || DISNEY_WISH_CARDS[0];
}
