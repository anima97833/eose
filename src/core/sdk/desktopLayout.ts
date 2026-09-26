import { listDesktopInstalledApps } from './appStoreCatalog';

export const APPS_PER_PAGE = 16; // 每页最多 16 个应用 (横 4 竖 4)
export const GRID_COLS = 4;      // 横四个
export const GRID_ROWS = 4;      // 竖四个

export type DesktopZone = string; // 'page_0' | 'page_1' | 'page_2' | 'dock' | legacy 'page1' | 'page2'

export interface DesktopLayout {
  pages: string[][]; // 每个元素为一个页面的应用 ID 数组，严格每页 <= 16
  dock: string[];    // 底部常驻应用 (通常 4 个)
  // 保持兼容字段，方便遗留代码访问
  page1: string[];
  page2: string[];
}

const LAYOUT_STORAGE_KEY = 'neumorphic_phone_desktop_layout_v2';
const ARCADE_INIT_PAGE2_KEY = 'neumorphic_arcade_initial_page2_v1';

// 立即彻底清理桌面布局缓存中残留的 pomodoro 图标
if (typeof window !== 'undefined') {
  try {
    const rawLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (rawLayout && rawLayout.includes('pomodoro')) {
      const parsed = JSON.parse(rawLayout);
      if (Array.isArray(parsed.pages)) {
        parsed.pages = parsed.pages.map((p: any) =>
          Array.isArray(p) ? p.filter((id: string) => id && id !== 'pomodoro') : []
        );
      }
      if (Array.isArray(parsed.page1)) {
        parsed.page1 = parsed.page1.filter((id: string) => id && id !== 'pomodoro');
      }
      if (Array.isArray(parsed.page2)) {
        parsed.page2 = parsed.page2.filter((id: string) => id && id !== 'pomodoro');
      }
      if (Array.isArray(parsed.dock)) {
        parsed.dock = parsed.dock.filter((id: string) => id && id !== 'pomodoro');
      }
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
}

// 默认首屏应用：精心排布的 16 个核心高频轻拟物应用 (4x4 铺满)
export const DEFAULT_PAGE1_APPS = [
  'phone', 'assistant', 'diary', 'profile',
  'gachapon', 'memories', 'radio', 'storyword',
  'books', 'poetry', 'calculator', 'camera',
  'cinema', 'games', 'memo', 'files'
];

export const DEFAULT_DOCK_APPS = ['chat', 'moments', 'checkphone', 'settings'];

/**
 * 重新平衡页面：确保每一页应用数量严格 <= 16
 * 多出来的自动滚入下一页，移除尾部空页 (至少保留 1 页)
 */
export function rebalancePages(rawPages: string[][]): string[][] {
  const allApps: string[] = [];
  const seen = new Set<string>();

  for (const page of rawPages) {
    if (Array.isArray(page)) {
      for (const appId of page) {
        if (appId && appId !== 'pomodoro' && !seen.has(appId)) {
          seen.add(appId);
          allApps.push(appId);
        }
      }
    }
  }

  const packedPages: string[][] = [];
  for (let i = 0; i < allApps.length; i += APPS_PER_PAGE) {
    packedPages.push(allApps.slice(i, i + APPS_PER_PAGE));
  }

  if (packedPages.length === 0) {
    packedPages.push([]);
  }

  return packedPages;
}

export function parseZone(zone: DesktopZone): { type: 'dock' } | { type: 'page'; pageIndex: number } {
  if (zone === 'dock') return { type: 'dock' };
  if (zone === 'page1' || zone === 'page_0') return { type: 'page', pageIndex: 0 };
  if (zone === 'page2' || zone === 'page_1') return { type: 'page', pageIndex: 1 };
  if (zone.startsWith('page_')) {
    const idx = parseInt(zone.replace('page_', ''), 10);
    return { type: 'page', pageIndex: isNaN(idx) ? 0 : idx };
  }
  return { type: 'page', pageIndex: 0 };
}

export function loadDesktopLayout(): DesktopLayout {
  const installedStoreApps = listDesktopInstalledApps().filter((a) => a.id !== 'pomodoro');
  const installedStoreAppIds = installedStoreApps.map((a) => a.id);
  const isAppValid = (id: string) => id !== 'pomodoro' && (id === 'appstore' || installedStoreAppIds.includes(id));

  // 默认第二页应用：除去在第一页和 dock 的所有已安装应用
  const initialPage2 = installedStoreAppIds.filter(
    (id) => !DEFAULT_PAGE1_APPS.includes(id) && !DEFAULT_DOCK_APPS.includes(id) && id !== 'pomodoro'
  );

  const buildDefault = (): DesktopLayout => {
    const defaultPages = rebalancePages([[...DEFAULT_PAGE1_APPS], initialPage2]);
    return {
      pages: defaultPages,
      dock: [...DEFAULT_DOCK_APPS],
      page1: defaultPages[0] || [],
      page2: defaultPages[1] || [],
    };
  };

  if (typeof window === 'undefined') {
    return buildDefault();
  }

  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      let rawPages: string[][] = [];

      if (Array.isArray(parsed.pages)) {
        rawPages = parsed.pages.map((p: any) => (Array.isArray(p) ? p.filter((id: string) => isAppValid(id) && id !== 'pomodoro') : []));
      } else if (Array.isArray(parsed.page1) || Array.isArray(parsed.page2)) {
        const p1 = (parsed.page1 || []).filter((id: string) => isAppValid(id) && id !== 'pomodoro');
        const p2 = (parsed.page2 || []).filter((id: string) => isAppValid(id) && id !== 'pomodoro');
        rawPages = [p1, p2];
      }

      const dock = Array.isArray(parsed.dock) ? parsed.dock.filter((id: string) => isAppValid(id) && id !== 'pomodoro') : [...DEFAULT_DOCK_APPS];

      // 检查是否有新安装但尚未编入桌面的应用
      const allPresent = new Set<string>();
      for (const p of rawPages) {
        for (const id of p) allPresent.add(id);
      }
      for (const id of dock) allPresent.add(id);

      const missingFromStore = installedStoreAppIds.filter((id) => id !== 'pomodoro' && !allPresent.has(id));
      if (missingFromStore.length > 0) {
        if (rawPages.length === 0) rawPages.push([]);
        rawPages[rawPages.length - 1].push(...missingFromStore);
      }

      // 严格重新平衡：每页最多 16 个，多出的顺移至下一页
      const pages = rebalancePages(rawPages);

      const cleanLayout: DesktopLayout = {
        pages,
        dock,
        page1: pages[0] || [],
        page2: pages[1] || [],
      };

      const newJson = JSON.stringify(cleanLayout);
      if (newJson !== raw) {
        saveDesktopLayout(cleanLayout, false);
      }
      return cleanLayout;
    }
  } catch (err) {
    console.warn('[DesktopLayout] 加载布局异常，重置默认:', err);
  }

  const defaultLayout = buildDefault();
  saveDesktopLayout(defaultLayout, false);
  return defaultLayout;
}

export function saveDesktopLayout(layout: DesktopLayout, notify: boolean = true): void {
  if (typeof window === 'undefined') return;
  try {
    layout.page1 = layout.pages[0] || [];
    layout.page2 = layout.pages[1] || [];
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    if (notify) {
      window.dispatchEvent(new CustomEvent('aiphone_layout_updated'));
    }
  } catch {
    // ignore
  }
}

export function moveDesktopApp(
  appId: string,
  fromZone: DesktopZone,
  toZone: DesktopZone,
  toIndex?: number
): DesktopLayout {
  const layout = loadDesktopLayout();
  const pages = layout.pages.map((p) => [...p]);
  let dock = [...layout.dock];

  // 1. 从源位置移除
  const from = parseZone(fromZone);
  if (from.type === 'dock') {
    dock = dock.filter((id) => id !== appId);
  } else {
    if (pages[from.pageIndex]) {
      pages[from.pageIndex] = pages[from.pageIndex].filter((id) => id !== appId);
    }
  }
  for (let i = 0; i < pages.length; i++) {
    pages[i] = pages[i].filter((id) => id !== appId);
  }
  dock = dock.filter((id) => id !== appId);

  // 2. 插入到目标位置
  const to = parseZone(toZone);
  if (to.type === 'dock') {
    const insertAt = typeof toIndex === 'number' ? Math.max(0, Math.min(dock.length, toIndex)) : dock.length;
    dock.splice(insertAt, 0, appId);
  } else {
    while (pages.length <= to.pageIndex) {
      pages.push([]);
    }
    const targetPage = pages[to.pageIndex];
    const insertAt = typeof toIndex === 'number' ? Math.max(0, Math.min(targetPage.length, toIndex)) : targetPage.length;
    targetPage.splice(insertAt, 0, appId);

    // 级联溢出检测：如果当前页超过 16 个，第 17 个自动滚入下一页
    for (let p = to.pageIndex; p < pages.length; p++) {
      if (pages[p].length > APPS_PER_PAGE) {
        const overflow = pages[p].splice(APPS_PER_PAGE);
        if (p + 1 < pages.length) {
          pages[p + 1].unshift(...overflow);
        } else {
          pages.push([...overflow]);
        }
      }
    }
  }

  // 3. 整理页面结构 (剔除尾部空页，至少保留 1 页)
  while (pages.length > 1 && pages[pages.length - 1].length === 0) {
    pages.pop();
  }

  const newLayout: DesktopLayout = {
    pages,
    dock,
    page1: pages[0] || [],
    page2: pages[1] || [],
  };

  saveDesktopLayout(newLayout);
  return newLayout;
}

export function removeAppFromDesktopLayout(appId: string): void {
  if (appId === 'appstore') return;
  const layout = loadDesktopLayout();
  layout.dock = layout.dock.filter((id) => id !== appId);
  layout.pages = layout.pages.map((p) => p.filter((id) => id !== appId));
  while (layout.pages.length > 1 && layout.pages[layout.pages.length - 1].length === 0) {
    layout.pages.pop();
  }
  saveDesktopLayout(layout);
}

export function addAppToDesktopLayout(appId: string): void {
  const layout = loadDesktopLayout();
  const allPresent = new Set([...layout.pages.flat(), ...layout.dock]);
  if (allPresent.has(appId)) return;

  // 优先存入首个未满 16 个应用的页面
  let added = false;
  for (const page of layout.pages) {
    if (page.length < APPS_PER_PAGE) {
      page.push(appId);
      added = true;
      break;
    }
  }
  if (!added) {
    layout.pages.push([appId]);
  }
  saveDesktopLayout(layout);
}
