import { CustomAppMeta } from './types';
import { MOOD_FORTUNE_APP_HTML } from './presetApps/moodFortuneApp';

import { CALCULATOR_APP_HTML, POMODORO_APP_HTML } from './presetApps/builtinApps';

const STORAGE_KEY = 'neumorphic_phone_installed_custom_apps';

export const PRESET_CUSTOM_APPS: CustomAppMeta[] = [
  {
    id: 'mood_fortune',
    name: '答案之书',
    version: '1.2.0',
    description: '在心中默念困惑或抉择，翻开指引之页，获得属于你的心灵答案。',
    icon: 'BookOpen',
    htmlContent: MOOD_FORTUNE_APP_HTML,
    manifest: {
      id: 'mood_fortune',
      name: '答案之书',
      version: '1.2.0',
      description: '轻拟物经典答案之书，翻开属于你的心灵解答与哲思启示',
      sdkVersion: '1.0',
      permissions: [
        'characters.read',
        'ai.generate',
        'app.data.write',
        'app.data.read',
        'ui.toast',
        'notifications.write',
      ],
    },
    badgeCount: 0,
    installedAt: 1710000000000,
  },
  {
    id: 'calculator',
    name: '全能计算器',
    version: '2.0.0',
    description: '青轴/打字机/钢琴音阶声学盲盒，生活直算面板与算术反应堆RPG。',
    icon: 'Calculator',
    htmlContent: CALCULATOR_APP_HTML,
    manifest: {
      id: 'calculator',
      name: '全能计算器',
      version: '2.0.0',
      sdkVersion: '1.0',
      permissions: ['ui.toast'],
    },
    badgeCount: 0,
    installedAt: 1710000001000,
  },
  {
    id: 'pomodoro',
    name: '番茄钟',
    version: '2.0.0',
    description: '极简轻拟物专注计时、任务清单、白噪音与IndexedDB历史自动复盘。',
    icon: 'Clock',
    htmlContent: POMODORO_APP_HTML,
    manifest: {
      id: 'pomodoro',
      name: '番茄钟',
      version: '2.0.0',
      sdkVersion: '1.0',
      permissions: ['ui.toast', 'notifications.write'],
    },
    badgeCount: 0,
    installedAt: 1710000002000,
  },
];

export function listInstalledCustomApps(): CustomAppMeta[] {
  if (typeof window === 'undefined') return PRESET_CUSTOM_APPS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: CustomAppMeta[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 自动同步官方预置微应用最新元数据与 HTML
        let hasChanges = false;
        for (const preset of PRESET_CUSTOM_APPS) {
          const item = parsed.find(a => a.id === preset.id);
          if (item) {
            if (item.htmlContent !== preset.htmlContent || item.name !== preset.name || item.icon !== preset.icon) {
              item.htmlContent = preset.htmlContent;
              item.name = preset.name;
              item.icon = preset.icon;
              item.description = preset.description;
              hasChanges = true;
            }
          }
        }
        if (hasChanges) {
          saveInstalledCustomApps(parsed);
        }
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // 默认安装官方预置微应用
  saveInstalledCustomApps(PRESET_CUSTOM_APPS);
  return PRESET_CUSTOM_APPS;
}

export function saveInstalledCustomApps(apps: CustomAppMeta[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // ignore
  }
}

export function getCustomAppById(id: string): CustomAppMeta | undefined {
  const all = listInstalledCustomApps();
  return all.find((app) => app.id === id);
}

export function updateCustomAppBadge(appId: string, count: number): void {
  const all = listInstalledCustomApps();
  const updated = all.map((app) => {
    if (app.id === appId) {
      return { ...app, badgeCount: count };
    }
    return app;
  });
  saveInstalledCustomApps(updated);
}
