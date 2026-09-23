import { MOOD_FORTUNE_APP_HTML } from './presetApps/moodFortuneApp';
import { CALCULATOR_APP_HTML, POMODORO_APP_HTML } from './presetApps/builtinApps';
import { CustomAppMeta } from './types';
import { saveInstalledCustomApps, listInstalledCustomApps } from './customAppRegistry';

export interface AppStoreItem {
  id: string;
  name: string;
  version: string;
  category: 'life' | 'tools' | 'ai' | 'media';
  categoryLabel: string;
  iconName: string; // 'Scroll' | 'Calculator' | 'Clock' | 'Camera' | 'Radio' | etc.
  description: string;
  features: string[];
  isInstalled: boolean;
  isSystem?: boolean;
  htmlContent?: string;
}

const STORE_STORAGE_KEY = 'neumorphic_phone_app_store_catalog';

export const DEFAULT_STORE_CATALOG: AppStoreItem[] = [
  {
    id: 'appstore',
    name: '应用商店',
    version: '1.0.0',
    category: 'tools',
    categoryLabel: '系统',
    iconName: 'ShoppingBag',
    description: '小手机应用中心：探索、安装新微应用与管理回收桌面图标。',
    features: ['应用市场', '一键安装', '桌面卸载回收', '自定义导入'],
    isInstalled: true,
    isSystem: true, // 全局唯一不可卸载的核心应用
  },
  {
    id: 'chat',
    name: '微聊',
    version: '1.0.0',
    category: 'life',
    categoryLabel: '通讯',
    iconName: 'MessageSquareText',
    description: '与 AI 伴侣的仿真即时私聊窗口，支持情绪感知与实时互动。',
    features: ['仿真聊天', '角色作息', '未读红点'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'phone',
    name: '电话',
    version: '1.0.0',
    category: 'tools',
    categoryLabel: '通讯',
    iconName: 'Phone',
    description: '轻拟物按键仿真即时通话与语音热线。',
    features: ['拟物键盘', '快速拨号', '伴侣连线'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'assistant',
    name: '小助手',
    version: '1.0.0',
    category: 'ai',
    categoryLabel: '陪伴',
    iconName: 'Sparkles',
    description: '智能伴侣贴心助手，随时为你提供灵感与关切。',
    features: ['伴侣问答', '灵感启发', '即时助手'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'diary',
    name: '日记',
    version: '1.0.0',
    category: 'life',
    categoryLabel: '手账',
    iconName: 'BookOpen',
    description: '日常生活与虚拟冒险任务手账，三栏主线、支线与隐藏奇遇。',
    features: ['日常主线', '探索支线', '偶遇彩蛋', 'RPG奖励'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'profile',
    name: '我的',
    version: '1.0.0',
    category: 'tools',
    categoryLabel: '个人',
    iconName: 'UserRound',
    description: '小手机个人中心、角色羁绊与身份名片。',
    features: ['角色名片', '个人资料', '伴侣状态'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'moments',
    name: '动态',
    version: '1.0.0',
    category: 'life',
    categoryLabel: '社交',
    iconName: 'Image',
    description: '伴侣与好友的朋友圈生活动态与照片。',
    features: ['朋友圈动态', '生活瞬间', '点赞评论'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'checkphone',
    name: '查手机',
    version: '1.0.0',
    category: 'tools',
    categoryLabel: '探索',
    iconName: 'Search',
    description: '伴侣手机镜像探秘：带锁备忘录、草稿箱与隐藏相册。',
    features: ['带锁备忘录', '未发送草稿', '搜索足迹'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'settings',
    name: '设置',
    version: '1.0.0',
    category: 'tools',
    categoryLabel: '系统',
    iconName: 'Settings',
    description: '小手机系统全局设置、模型API与外观配置。',
    features: ['API设置', '桌面外观', '系统配置'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'memories',
    name: '过往',
    version: '1.0.0',
    category: 'life',
    categoryLabel: '回忆',
    iconName: 'Hourglass',
    description: '时光书屋：双层温润拟物书架，导入与珍藏与 AI 的外部聊天回忆录。',
    features: ['双层温润木质书架', '多格式 JSON 智能解析', 'IndexedDB 永久海量存储', '对白流/小说双模阅读'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'mood_fortune',
    name: '心事抽签',
    version: '1.0.0',
    category: 'ai',
    categoryLabel: '陪伴',
    iconName: 'Scroll',
    description: '轻拟物摇签盲盒，联动 AI 伴侣独家解签寄语与历史纪录。',
    features: ['3D 拟物摇签', 'AI 角色个性化解签', '私有记录数据库', '桌面红点联动'],
    isInstalled: true,
    isSystem: false,
    htmlContent: MOOD_FORTUNE_APP_HTML,
  },
  {
    id: 'calculator',
    name: '经典计算器',
    version: '1.1.0',
    category: 'tools',
    categoryLabel: '效率',
    iconName: 'Calculator',
    description: '复古纯正轻拟物按键计算器，深凹陷触感与音效反馈。',
    features: ['拟物立体凹陷屏幕', '触觉按键反馈', '快速清零与运算', '完全离线免联网'],
    isInstalled: true,
    isSystem: false,
    htmlContent: CALCULATOR_APP_HTML,
  },
  {
    id: 'pomodoro',
    name: '番茄钟',
    version: '2.0.0',
    category: 'life',
    categoryLabel: '效率',
    iconName: 'Clock',
    description: '极简轻拟物专注计时、任务清单、白噪音与IndexedDB历史自动复盘。',
    features: ['灵活自定义节奏 (50/10)', '任务清单与番茄数预计', 'WebAudio白噪音与风铃音', 'IndexedDB历史自动归档复盘', '底部Tab便捷切换'],
    isInstalled: true,
    isSystem: false,
    htmlContent: POMODORO_APP_HTML,
  },
  {
    id: 'camera',
    name: '时光相册',
    version: '1.0.0',
    category: 'media',
    categoryLabel: '多媒体',
    iconName: 'Camera',
    description: '伴侣时光拍立得胶卷相册与美化摄影。',
    features: ['拍立得复古相框', 'AI 绘图留影', '私密相册加密'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'radio',
    name: '声音电台',
    version: '1.0.0',
    category: 'media',
    categoryLabel: '多媒体',
    iconName: 'Radio',
    description: '雨声、白噪音、调频广播与深夜伴侣助眠电台。',
    features: ['高保真轻柔自然音', 'Lo-fi 舒缓和弦', '定时助眠关闭'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'games',
    name: '掌机电玩',
    version: '1.0.0',
    category: 'life',
    categoryLabel: '电玩',
    iconName: 'Gamepad2',
    description: '复古拟物掌机，支持运行任意 .swf 经典 Flash 游戏与卡带收藏。',
    features: ['Ruffle WASM 引擎', '经典掌机拟物外观', '全键盘与虚拟手柄支持'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'cinema',
    name: '时光放映室',
    version: '1.0.0',
    category: 'media',
    categoryLabel: '影音',
    iconName: 'Clapperboard',
    description: '轻拟物打孔电影票根、个人观影时长统计、自由滑动评分与影评手账。',
    features: ['复古电影票根', '在线片库检索', '滑动评分打分', '观影时空罗盘', '本地离线存储'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'poetry',
    name: '诗阁',
    version: '1.0.0',
    category: 'life',
    categoryLabel: '文化',
    iconName: 'Scroll',
    description: '宣纸墨印雅致诗阁，37万首古诗词检索、熟背进度管理与科举挖词考核通关。',
    features: ['宣纸墨印古韵', '37万海量诗库', '科举挖词考核', '熟背进度金榜', 'IndexedDB 离线'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'books',
    name: '书藏',
    version: '1.0.0',
    category: 'life',
    categoryLabel: '藏书',
    iconName: 'BookMarked',
    description: '浅黄色治愈轻拟物书藏，连续扫码ISBN秒入库、物理书架空间标记与阅读进度追踪。',
    features: ['连续扫码秒录入', '物理书架位置标记', '阅读进度多维追踪', '藏书估值大盘统计', '本地私有存储'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'storyword',
    name: '爽文背词',
    version: '1.0.0',
    category: 'life',
    categoryLabel: '背词',
    iconName: 'BookOpen',
    description: '轻拟物网文互动背词器，万能书源爬虫、中英混编剧情沉浸阅读与高潮爽点填空挑战。',
    features: ['万能书源跨域爬虫', 'Legado规则导入', '剧情爽点打脸关卡', '词库难度动态切换', '复仇错词阁沉淀'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'course_kanban',
    name: '学习看板',
    version: '1.0.0',
    category: 'tools',
    categoryLabel: '学习',
    iconName: 'GraduationCap',
    description: '战胜课程囤积症，将B站与网盘大课结构化为低阻力学习看板，遵循WIP专注准则。',
    features: ['B站视频解析', '网盘目录清洗', 'WIP专注在学限制', '逐讲通关打卡', '心理降维时长折算'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'files',
    name: '文件管理',
    version: '1.0.0',
    category: 'tools',
    categoryLabel: '系统',
    iconName: 'Folder',
    description: '管理小手机本地 IndexedDB 存储文件与备份导出。',
    features: ['沙盒数据查看', '一键导出备份', '存储空间清理'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'compass',
    name: '时空指南',
    version: '1.2.0',
    category: 'tools',
    categoryLabel: '探险',
    iconName: 'Compass',
    description: '拟真机械微拟物罗盘，集成高德中文免Key探索底图、真实户外打卡、战争迷雾驱散与秘密据点。',
    features: ['高德免Key极速瓦片', '宝可梦式街区迷雾', '户外真实打卡与据点升级', 'RPG与朋友圈联动'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'security',
    name: '隐私与安全',
    version: '1.0.0',
    category: 'tools',
    categoryLabel: '安全',
    iconName: 'ShieldCheck',
    description: '全量数据库一键导出导入备份、本地离线沙盒与隐私安全保障。',
    features: ['全量数据库一键导出', '全量数据覆盖还原', '28张数据表本地沙盒审计'],
    isInstalled: true,
    isSystem: false,
  },
  {
    id: 'memo',
    name: '备忘便签',
    version: '1.0.0',
    category: 'life',
    categoryLabel: '便签',
    iconName: 'FileText',
    description: '随手灵感速记与彩色微拟物便签纸。',
    features: ['拟物便签纸质感', '图钉置顶提醒', '本地加密存储'],
    isInstalled: false,
    isSystem: false,
  },
  {
    id: 'browser',
    name: '网络探索',
    version: '1.0.0',
    category: 'tools',
    categoryLabel: '网络',
    iconName: 'Globe',
    description: '虚拟小手机内置纯净浏览器与灵感冲浪窗口。',
    features: ['极速网页加载', '无痕安全浏览', '常用书签抽屉'],
    isInstalled: false,
    isSystem: false,
  },
  {
    id: 'character_studio',
    name: '角色工坊',
    version: '1.0.0',
    category: 'ai',
    categoryLabel: '创作',
    iconName: 'Sparkles',
    description: 'SillyTavern 风格角色工坊：编辑与创建角色卡、正则表达式替换流水线、HTML 排版美化与实时沙盒。',
    features: ['角色卡自由创建', 'SillyTavern 正则表达式流水线', '富文本 HTML 美化', '真机沙盒实时演练', '酒馆卡 JSON 导入导出'],
    isInstalled: true,
    isSystem: false,
  },
];

export function listStoreCatalog(): AppStoreItem[] {
  if (typeof window === 'undefined') return DEFAULT_STORE_CATALOG;
  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY);
    if (raw) {
      const parsed: AppStoreItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 自动合并系统新上架的默认应用
        const existingIds = new Set(parsed.map((item) => item.id));
        let hasNew = false;
        for (const defaultItem of DEFAULT_STORE_CATALOG) {
          if (!existingIds.has(defaultItem.id)) {
            parsed.push(defaultItem);
            hasNew = true;
          }
        }
        // 确保除 appstore 以外的所有应用的 isSystem 为 false
        for (const item of parsed) {
          if (item.id !== 'appstore' && item.isSystem) {
            item.isSystem = false;
            hasNew = true;
          }
        }
        // 确保电玩掌机应用 (games) 与 放映室应用 (cinema) 始终默认安装在桌面
        const gameItem = parsed.find((item) => item.id === 'games');
        if (gameItem && !gameItem.isInstalled) {
          gameItem.isInstalled = true;
          hasNew = true;
        }
        const cinemaItem = parsed.find((item) => item.id === 'cinema');
        if (cinemaItem && !cinemaItem.isInstalled) {
          cinemaItem.isInstalled = true;
          hasNew = true;
        }
        const poetryItem = parsed.find((item) => item.id === 'poetry');
        if (poetryItem && !poetryItem.isInstalled) {
          poetryItem.isInstalled = true;
          hasNew = true;
        }
        const bookItem = parsed.find((item) => item.id === 'books');
        if (bookItem && !bookItem.isInstalled) {
          bookItem.isInstalled = true;
          hasNew = true;
        }
        const storywordItem = parsed.find((item) => item.id === 'storyword');
        if (storywordItem && !storywordItem.isInstalled) {
          storywordItem.isInstalled = true;
          hasNew = true;
        }
        const kanbanItem = parsed.find((item) => item.id === 'course_kanban');
        if (kanbanItem && !kanbanItem.isInstalled) {
          kanbanItem.isInstalled = true;
          hasNew = true;
        }
        const securityItem = parsed.find((item) => item.id === 'security');
        if (securityItem) {
          if (securityItem.name !== '隐私与安全') {
            securityItem.name = '隐私与安全';
            hasNew = true;
          }
          if (!securityItem.isInstalled) {
            securityItem.isInstalled = true;
            hasNew = true;
          }
        }
        if (hasNew) {
          saveStoreCatalog(parsed);
        }
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  saveStoreCatalog(DEFAULT_STORE_CATALOG);
  return DEFAULT_STORE_CATALOG;
}

export function saveStoreCatalog(items: AppStoreItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(items));
    // 触发全局自定义事件，让桌面实时响应更新
    window.dispatchEvent(new CustomEvent('aiphone_store_updated'));
  } catch {
    // ignore
  }
}

// 获取当前安装在桌面上的所有应用
export function listDesktopInstalledApps(): AppStoreItem[] {
  const all = listStoreCatalog();
  return all.filter((app) => app.isInstalled);
}

// 安装应用到桌面
export function installAppToDesktop(appId: string): void {
  const all = listStoreCatalog();
  const target = all.find((item) => item.id === appId);
  if (!target) return;

  target.isInstalled = true;
  saveStoreCatalog(all);

  // 同步添加至桌面第2页布局
  if (typeof window !== 'undefined') {
    const LAYOUT_KEY = 'neumorphic_phone_desktop_layout_v2';
    try {
      const raw = localStorage.getItem(LAYOUT_KEY);
      if (raw) {
        const layout = JSON.parse(raw);
        const present = new Set([...(layout.page1 || []), ...(layout.page2 || []), ...(layout.dock || [])]);
        if (!present.has(appId)) {
          layout.page2 = layout.page2 || [];
          layout.page2.push(appId);
          localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
          window.dispatchEvent(new CustomEvent('aiphone_layout_updated'));
        }
      }
    } catch {
      // ignore
    }
  }

  // 如果具备 htmlContent，同步写入自定义应用注册表
  if (target.htmlContent) {
    const customApps = listInstalledCustomApps();
    if (!customApps.some((c) => c.id === appId)) {
      customApps.push({
        id: target.id,
        name: target.name,
        version: target.version,
        description: target.description,
        icon: target.iconName,
        htmlContent: target.htmlContent,
        badgeCount: 0,
        installedAt: Date.now(),
      });
      saveInstalledCustomApps(customApps);
    }
  }
}

// 卸载/回收到应用商店
export function uninstallAppFromDesktop(appId: string): void {
  // 只有应用商店本身不能卸载
  if (appId === 'appstore') return;

  const all = listStoreCatalog();
  const target = all.find((item) => item.id === appId);
  if (target) {
    target.isInstalled = false;
    saveStoreCatalog(all);
  }

  // 从桌面布局的所有区域彻底移除
  if (typeof window !== 'undefined') {
    const LAYOUT_KEY = 'neumorphic_phone_desktop_layout_v2';
    try {
      const raw = localStorage.getItem(LAYOUT_KEY);
      if (raw) {
        const layout = JSON.parse(raw);
        layout.page1 = (layout.page1 || []).filter((id: string) => id !== appId);
        layout.page2 = (layout.page2 || []).filter((id: string) => id !== appId);
        layout.dock = (layout.dock || []).filter((id: string) => id !== appId);
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
        window.dispatchEvent(new CustomEvent('aiphone_layout_updated'));
      }
    } catch {
      // ignore
    }
  }

  // 同步从自定义运行注册表中移除
  const customApps = listInstalledCustomApps().filter((c) => c.id !== appId);
  saveInstalledCustomApps(customApps);
}

// 创建并一键安装全新自定义应用
export function createAndInstallCustomApp(newApp: {
  name: string;
  iconName: string;
  description: string;
  htmlContent: string;
}): AppStoreItem {
  const all = listStoreCatalog();
  const id = 'custom_' + Date.now().toString(36);

  const storeItem: AppStoreItem = {
    id,
    name: newApp.name,
    version: '1.0.0',
    category: 'tools',
    categoryLabel: '自定义',
    iconName: newApp.iconName || 'Sparkles',
    description: newApp.description || '用户自定义 HTML 沙盒微应用',
    features: ['独立沙盒', 'window.AiPhone SDK', '离线秒开'],
    isInstalled: true,
    htmlContent: newApp.htmlContent,
  };

  all.unshift(storeItem);
  saveStoreCatalog(all);

  // 注册进 customAppRegistry
  const customApps = listInstalledCustomApps();
  const meta: CustomAppMeta = {
    id,
    name: storeItem.name,
    version: storeItem.version,
    description: storeItem.description,
    icon: storeItem.iconName,
    htmlContent: storeItem.htmlContent!,
    badgeCount: 0,
    installedAt: Date.now(),
  };
  customApps.unshift(meta);
  saveInstalledCustomApps(customApps);

  return storeItem;
}
