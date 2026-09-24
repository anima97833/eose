import { listDesktopInstalledApps } from './appStoreCatalog';

export type DesktopZone = 'page1' | 'page2' | 'dock';

export interface DesktopLayout {
  page1: string[];
  page2: string[];
  dock: string[];
}

const LAYOUT_STORAGE_KEY = 'neumorphic_phone_desktop_layout_v2';
const ARCADE_INIT_PAGE2_KEY = 'neumorphic_arcade_initial_page2_v1';

export const DEFAULT_PAGE1_APPS = ['phone', 'assistant', 'diary', 'profile', 'gachapon', 'memories'];
export const DEFAULT_DOCK_APPS = ['chat', 'moments', 'checkphone', 'settings'];

export function loadDesktopLayout(): DesktopLayout {
  const installedStoreApps = listDesktopInstalledApps();
  const installedStoreAppIds = installedStoreApps.map((a) => a.id);

  // 默认第二页应用：除去在第一页和 dock 的所有已安装应用（默认初始包含 games 电玩）
  const initialPage2 = installedStoreAppIds.filter(
    (id) => !DEFAULT_PAGE1_APPS.includes(id) && !DEFAULT_DOCK_APPS.includes(id)
  );

  if (typeof window === 'undefined') {
    return {
      page1: [...DEFAULT_PAGE1_APPS],
      page2: initialPage2,
      dock: [...DEFAULT_DOCK_APPS],
    };
  }

  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) {
      const parsed: DesktopLayout = JSON.parse(raw);
      if (Array.isArray(parsed.page1) && Array.isArray(parsed.page2) && Array.isArray(parsed.dock)) {
        const allPresent = new Set([...parsed.page1, ...parsed.page2, ...parsed.dock]);
        const missingFromStore = installedStoreAppIds.filter((id) => !allPresent.has(id));
        
        // 核心准则：除应用商店 (appstore) 之外，所有应用必须在已安装列表中才有效，否则一律从桌面移除！
        const isAppValid = (id: string) => id === 'appstore' || installedStoreAppIds.includes(id);

        let page1 = parsed.page1.filter(isAppValid);
        let page2 = [...parsed.page2.filter(isAppValid), ...missingFromStore];
        let dock = parsed.dock.filter(isAppValid);

        let hasDiff =
          page1.length !== parsed.page1.length ||
          page2.length !== parsed.page2.length ||
          dock.length !== parsed.dock.length ||
          missingFromStore.length > 0;

        // 初始规约：电玩应用默认初始放置于第二页；
        // 若之前由于旧逻辑被强制推到了第一页，仅在初次迁移时纠正至第二页；
        // 后续无论用户拖拽至第1页、第2页、还是Dock，均尊重用户改动并永久保持！
        const hasMigrated = localStorage.getItem(ARCADE_INIT_PAGE2_KEY);
        if (!hasMigrated) {
          if (page1.includes('games')) {
            page1 = page1.filter((id) => id !== 'games');
            if (!page2.includes('games') && !dock.includes('games')) {
              page2.push('games');
            }
            hasDiff = true;
          }
          localStorage.setItem(ARCADE_INIT_PAGE2_KEY, 'true');
        }

        const cleanLayout: DesktopLayout = {
          page1,
          page2,
          dock,
        };

        if (hasDiff) {
          saveDesktopLayout(cleanLayout);
        }

        return cleanLayout;
      }
    }
  } catch {
    // ignore
  }

  const defaultLayout: DesktopLayout = {
    page1: [...DEFAULT_PAGE1_APPS],
    page2: initialPage2,
    dock: [...DEFAULT_DOCK_APPS],
  };
  saveDesktopLayout(defaultLayout);
  return defaultLayout;
}

export function saveDesktopLayout(layout: DesktopLayout): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    window.dispatchEvent(new CustomEvent('aiphone_layout_updated'));
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

  if (fromZone === toZone) {
    // 同区域内调序
    const list = [...layout[fromZone]];
    const fromIndex = list.indexOf(appId);
    if (fromIndex !== -1) {
      list.splice(fromIndex, 1);
      const insertAt =
        typeof toIndex === 'number'
          ? Math.max(0, Math.min(list.length, toIndex))
          : list.length;
      list.splice(insertAt, 0, appId);
      layout[fromZone] = list;
    }
  } else {
    // 跨区域移动（例如 Page 2 -> Page 1 或 Page 2 -> Dock 等）
    layout[fromZone] = layout[fromZone].filter((id) => id !== appId);
    const targetList = [...layout[toZone]];
    const insertAt =
      typeof toIndex === 'number'
        ? Math.max(0, Math.min(targetList.length, toIndex))
        : targetList.length;
    targetList.splice(insertAt, 0, appId);
    layout[toZone] = targetList;
  }

  saveDesktopLayout(layout);
  return layout;
}

export function removeAppFromDesktopLayout(appId: string): void {
  if (appId === 'appstore') return;
  const layout = loadDesktopLayout();
  layout.page1 = layout.page1.filter((id) => id !== appId);
  layout.page2 = layout.page2.filter((id) => id !== appId);
  layout.dock = layout.dock.filter((id) => id !== appId);
  saveDesktopLayout(layout);
}

export function addAppToDesktopLayout(appId: string): void {
  const layout = loadDesktopLayout();
  const all = new Set([...layout.page1, ...layout.page2, ...layout.dock]);
  if (!all.has(appId)) {
    layout.page2.push(appId);
    saveDesktopLayout(layout);
  }
}

