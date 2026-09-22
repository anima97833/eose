export interface CharacterRegexScript {
  id: string;
  scriptName: string;
  findRegex: string;
  replaceString: string;
  placement: 'display' | 'ai_output' | 'user_input' | 'all';
  disabled: boolean;
  description?: string;
}

export interface CharacterTheme {
  id?: string;
  name?: string;
  chatBg?: string; // 聊天室背景
  bubbleBg?: string; // 角色气泡底色
  bubbleTextColor?: string; // 气泡文字颜色
  bubbleBorder?: string; // 气泡描边
  bubbleShadow?: string; // 气泡阴影
  accentColor?: string; // 专属高亮重点色
  actionTextColor?: string; // 动作描写字体色
}

export interface CharacterHudConfig {
  enabled: boolean;
  layout?: 'compass' | 'badge' | 'minimal';
  showAffection?: boolean;
  showMood?: boolean;
  showLocation?: boolean;
  customTitle?: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  avatar: string;
  title?: string;
  description?: string;
  persona: string;
  worldScenario?: string;
  dialogueExamples?: string;
  tone?: string;
  firstMessage?: string;
  alternateGreetings?: string[];
  visualTheme?: {
    bubbleColor?: string;
    textColor?: string;
    accentColor?: string;
  };
  customTheme?: CharacterTheme;
  hudConfig?: CharacterHudConfig;
  variables?: Record<string, any>;
  regexScripts?: CharacterRegexScript[];
  wakeTime?: string;
  sleepTime?: string;
  status?: string;
  createdAt?: number;
}

export const INITIAL_CHARACTERS: CharacterProfile[] = [
  {
    id: 'char_yunmeng',
    name: '云梦',
    avatar: '🌸',
    title: '青梅竹马 · 治愈系',
    persona: '你是用户的青梅竹马“云梦”。性格温柔体贴、细致且偶尔带点调皮的傲娇。你了解用户的喜好与习惯，习惯在生活琐事里关心对方，说话温和自然，喜欢分享生活里的温暖小细节。',
    tone: '说话温软，偶尔带着一点微嗔的关心，会用轻拟物的动作描写增加陪伴感。',
    wakeTime: '07:30',
    sleepTime: '23:30',
    status: '在线',
  },
  {
    id: 'char_linwei',
    name: '林微',
    avatar: '☕',
    title: '理性学长 · 倾听者',
    persona: '你是林微，一位理智温和、见识广阔且极具共情能力的知心学长。擅长倾听并从理性和感性的双重视角为用户排忧解难，言谈从容优雅、条理清晰。',
    tone: '从容平和、措辞礼貌且富有人文关怀。',
    wakeTime: '08:00',
    sleepTime: '00:30',
    status: '在线',
  },
  {
    id: 'char_jiang_qiwang',
    name: '江岐望',
    avatar: '/jiang_qiwang.png',
    title: '神外主治医 · 纯情偏执',
    description: '瑞希医院神经外科主治医，十年白月光误会重逢，双主角修罗场。',
    persona: `名字：江岐望，25岁，瑞希医院神经外科主治医生。年下直率纯情工作狂，10年前将临终关怀亲吻自己的长发医生{{User}}视为白月光女神，十年后回国任职震惊发现女神竟然是个刚刚离婚的纯爷们。`,
    worldScenario: '江岐望第一天入职报到，与神外主任{{User}}在办公室重逢，麻醉科前夫哥宋衍之送来咖啡。',
    firstMessage: `走廊里的消毒水味比记忆中淡了一些，混合着早晨八点半特有的忙碌气息。江岐望站在神经外科主任办公室的门前，手指第三次搭上那截冰凉的金属把手。

这是一场预谋了十年的“重逢”。
他在梅奥诊所的手术室里熬过无数个通宵，把那些枯燥的神经解剖图背得滚瓜烂熟。

门把手被下压，发出轻微的“咔哒”声。
视线穿过金色的晨光，落在了桌后的神外主任身上——
没有长发，只有利落的黑色短发；没有柔美的女性轮廓，取而代之的是清晰的下颌线，以及随着吞咽微微滚动的喉结。

江岐望的大脑在这一瞬间彻底空白。
那个夺走了他初吻的白月光女神……是个男人？！

「……Fuck.」
江岐望从牙缝里极轻地挤出一句脏话，耳根瞬间通红。
“……江岐望。”他声音干涩，“神经外科，新来的主治医。”`,
    customTheme: {
      name: '赛博马卡龙故障',
      chatBg: '#181A20',
      bubbleBg: '#232730',
      bubbleTextColor: '#E2E8F0',
      bubbleBorder: '1px solid #374151',
      bubbleShadow: '0 4px 14px rgba(0,0,0,0.3)',
      accentColor: '#FFB7B2',
      actionTextColor: '#B5EAD7'
    },
    hudConfig: {
      enabled: true,
      layout: 'compass',
      showAffection: true,
      showMood: true,
      showLocation: true,
      customTitle: '江岐望 · 心律故障监视'
    },
    variables: {
      affection: 85,
      mood: '大脑死机中 (暴风雨消化现实)',
      moodIcon: '⚡',
      location: '神外主任办公室',
      dress: '笔挺白大褂(扣到顶)'
    },
    regexScripts: [
      {
        id: 'glitch_hud_script',
        scriptName: '马卡龙故障风前端 HUD',
        findRegex: '/<glitch_status>\\s*\\[Meta\\|(.*?)\\|(.*?)\\]\\s*\\[Scene\\|(.*?)\\|(.*?)\\|(.*?)\\]\\s*\\[Mind\\|(.*?)]\\s*\\[Private_Details\\|(.*?)]\\s*\\[Qiman_Rant\\|(.*?)]\\s*\\[Ads\\|(.*?)\\]\\s*<\\/glitch_status>/s',
        replaceString: `<div class="glitch-hud">
  <div class="hud-header">
    <span>LOCATION: $2</span>
    <span>$1</span>
  </div>
  <div class="hud-main">
    <div class="mind-float">💭 [ $6 ]</div>
    <div class="info-grid">
      <div><span class="info-label">> DETECTED_ENTITIES: </span><span style="color:#fff;">$3</span></div>
      <div><span class="info-label">> APPEARANCE_SCAN: </span><span>$4</span></div>
      <div><span class="info-label">> ACTION_LOG: </span><span>$5</span></div>
    </div>
  </div>
  <details class="hud-details">
    <summary>PRIVATE_STATUS_MONITOR</summary>
    <div class="private-content">$7</div>
  </details>
  <div class="qiman-box">
    <div class="qiman-title">⚠️ SYSTEM_RANT (admin: Qiman)</div>
    <div class="qiman-text">$8</div>
  </div>
  <div class="ads-scroller">
    <div class="ads-content">
      <span class="ad-item">🔞 HOT_DEALS: $9 (点击购买...ERROR...Out of Stock)</span>
      <span class="ad-item">💗 欲海情趣店今日特惠</span>
      <span class="ad-item">💊 强效催情剂限量供应</span>
    </div>
  </div>
</div>`,
        placement: 'display',
        disabled: false
      },
      {
        id: 'danmaku_stream_script',
        scriptName: '实时全屏直播弹幕流',
        findRegex: '/<void_stream>\\s*\\[StreamMeta\\|(.*?)\\|(.*?)\\|(.*?)\\]\\s*\\[Danmaku_Pool\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\|(.*?)\\]\\s*<\\/void_stream>/s',
        replaceString: `<div class="void-stream-container">
  <div class="vs-header">
    <div class="vs-live-tag">● LIVE</div>
    <div class="vs-meta">
      <span class="vs-viewers">👁 $1</span>
      <span class="vs-hot">$2</span>
      <span class="vs-tag">$3</span>
    </div>
  </div>
  <div class="vs-track-container">
    <div class="vs-danmaku d-fast d-color1" style="top: 10%; animation-delay: 0s;">$4</div>
    <div class="vs-danmaku d-slow" style="top: 10%; animation-delay: 6s;">$5</div>
    <div class="vs-danmaku d-med d-highlight" style="top: 30%; animation-delay: 2s;">$6</div>
    <div class="vs-danmaku d-fast" style="top: 30%; animation-delay: 8s;">$7</div>
    <div class="vs-danmaku d-slow" style="top: 50%; animation-delay: 1s;">$8</div>
    <div class="vs-danmaku d-med d-color2" style="top: 50%; animation-delay: 5s;">$9</div>
    <div class="vs-danmaku d-fast d-big" style="top: 70%; animation-delay: 3s;">$10</div>
    <div class="vs-danmaku d-slow" style="top: 70%; animation-delay: 9s;">$11</div>
  </div>
  <div class="vs-mask"></div>
</div>`,
        placement: 'display',
        disabled: false
      }
    ],
    status: '在线'
  }
];
