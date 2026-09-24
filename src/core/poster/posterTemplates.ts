import { PosterTemplateId } from './posterTypes';

export interface PosterTemplateDefinition {
  id: PosterTemplateId;
  name: string;
  category: 'romance' | 'event' | 'schedule' | 'custom';
  description: string;
  defaultTag: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultNote: string;
  defaultItems: string[];
  themes: {
    id: string;
    name: string;
    bgGradient: string;
    accentColor: string;
    textColor: string;
    cardBorder: string;
    badgeBg: string;
  }[];
}

export const POSTER_TEMPLATES: Record<PosterTemplateId, PosterTemplateDefinition> = {
  polaroid_love: {
    id: 'polaroid_love',
    name: '浪漫拍立得',
    category: 'romance',
    description: '温润拍立得相框、手写体寄语，适合恋爱纪念日、生日与专属时光。',
    defaultTag: '❤️ 365 DAYS',
    defaultTitle: '相恋一周年纪念日',
    defaultSubtitle: '世界很大，有你很甜',
    defaultNote: '去预订初见时的那家日料店，给对方准备手作心愿卡，记得带上拍立得相机！',
    defaultItems: ['预订约会餐厅靠窗位', '带上拍立得与相纸', '准备惊喜小礼物', '一起看海边日落'],
    themes: [
      {
        id: 'warm_cherry',
        name: '落樱绯红',
        bgGradient: 'linear-gradient(135deg, #fff0f3 0%, #ffe3e8 100%)',
        accentColor: '#e63946',
        textColor: '#592c35',
        cardBorder: 'rgba(230, 57, 70, 0.15)',
        badgeBg: '#ffe5ec',
      },
      {
        id: 'vintage_sepia',
        name: '复古暖咖',
        bgGradient: 'linear-gradient(135deg, #fdfbf7 0%, #f4ede4 100%)',
        accentColor: '#b07d62',
        textColor: '#4a3b32',
        cardBorder: 'rgba(176, 125, 98, 0.2)',
        badgeBg: '#ede0d4',
      },
      {
        id: 'midnight_rose',
        name: '暗夜微光',
        bgGradient: 'linear-gradient(135deg, #2b2d42 0%, #1d1e2c 100%)',
        accentColor: '#ff758f',
        textColor: '#f8edeb',
        cardBorder: 'rgba(255, 117, 143, 0.3)',
        badgeBg: 'rgba(255, 117, 143, 0.18)',
      },
    ],
  },
  supermarket_sale: {
    id: 'supermarket_sale',
    name: '超市特惠海报',
    category: 'event',
    description: '醒目剪角打折券、生鲜黄黑大促风，适合超市大减价、会员日与扫货清单。',
    defaultTag: '⚡️ 全场 5 折起',
    defaultTitle: '山姆 / 盒马生鲜狂欢日',
    defaultSubtitle: '牛排车厘子特价 · 抢完即止',
    defaultNote: '本周三会员积分翻倍！记得自带大号保温袋，早点去抢刚上架的新鲜烘焙。',
    defaultItems: ['生鲜安格斯眼肉牛排 x2', '智利车厘子礼盒', '全脂有机鲜牛奶', '瑞士卷 / 提拉米苏', '领券满 299 减 50'],
    themes: [
      {
        id: 'super_yellow',
        name: '大促活力黄',
        bgGradient: 'linear-gradient(135deg, #fff9db 0%, #ffec99 100%)',
        accentColor: '#f08c00',
        textColor: '#493a10',
        cardBorder: 'rgba(240, 140, 0, 0.25)',
        badgeBg: '#ffd43b',
      },
      {
        id: 'fresh_green',
        name: '清爽生鲜绿',
        bgGradient: 'linear-gradient(135deg, #ebfbee 0%, #d3f9d8 100%)',
        accentColor: '#2b8a3e',
        textColor: '#1a4325',
        cardBorder: 'rgba(43, 138, 62, 0.25)',
        badgeBg: '#b2f2bb',
      },
      {
        id: 'hot_sale_red',
        name: '狂欢爆燃红',
        bgGradient: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)',
        accentColor: '#c92a2a',
        textColor: '#531717',
        cardBorder: 'rgba(201, 42, 42, 0.25)',
        badgeBg: '#ffc9c9',
      },
    ],
  },
  vintage_ticket: {
    id: 'vintage_ticket',
    name: '复古入场票根',
    category: 'event',
    description: '锯齿边缘、条形码与印章质感，适合音乐节、电影放映、漫展与演出。',
    defaultTag: '🎟 ADMIT ONE',
    defaultTitle: '草莓音乐节 / 展映盛会',
    defaultSubtitle: 'Live 现场 · 摇滚夏夜',
    defaultNote: '下午 14:00 入场检票，携带身份证与充电宝，注意夜间返程班车末班车时间。',
    defaultItems: ['电子票二维码截图备用', '随身充电宝与数据线', '湿纸巾与折叠小雨伞', '防噪耳塞'],
    themes: [
      {
        id: 'kraft_paper',
        name: '牛皮纸复古',
        bgGradient: 'linear-gradient(135deg, #f7f1e5 0%, #e8dec8 100%)',
        accentColor: '#8c6d46',
        textColor: '#3d3020',
        cardBorder: 'rgba(140, 109, 70, 0.25)',
        badgeBg: '#ded1ba',
      },
      {
        id: 'indie_violet',
        name: '落日迷幻紫',
        bgGradient: 'linear-gradient(135deg, #f3f0ff 0%, #e5dbff 100%)',
        accentColor: '#6741d9',
        textColor: '#2e1c66',
        cardBorder: 'rgba(103, 65, 217, 0.25)',
        badgeBg: '#d0bfff',
      },
    ],
  },
  minimal_memo: {
    id: 'minimal_memo',
    name: '轻拟物便签板',
    category: 'schedule',
    description: '金属夹子、格纹纸与图钉细节，适合考研冲刺、重要考证、打卡日程。',
    defaultTag: '🎯 DDL COUNTDOWN',
    defaultTitle: '专业技能证书冲刺周',
    defaultSubtitle: '一鼓作气 · 稳扎稳打',
    defaultNote: '每天早上 8:30 开始真题模拟考，做完后复盘错题，晚上睡前过一遍核心知识图谱。',
    defaultItems: ['历年真题模拟卷 2 套', '背诵核心考点思维导图', '整理近三年错题本', '打印准考证并核对考场'],
    themes: [
      {
        id: 'cool_slate',
        name: '静谧青灰',
        bgGradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        accentColor: '#495057',
        textColor: '#212529',
        cardBorder: 'rgba(73, 80, 87, 0.2)',
        badgeBg: '#dee2e6',
      },
      {
        id: 'azure_blue',
        name: '澄澈天蓝',
        bgGradient: 'linear-gradient(135deg, #e7f5ff 0%, #d0ebff 100%)',
        accentColor: '#1c7ed6',
        textColor: '#113a63',
        cardBorder: 'rgba(28, 126, 214, 0.22)',
        badgeBg: '#a5d8ff',
      },
    ],
  },
};
