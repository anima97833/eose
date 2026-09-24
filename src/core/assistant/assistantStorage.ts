import { db } from '../storage/db';
import { StarryMessage, StarryAssistantSettings } from './assistantTypes';

const MESSAGES_KEY = 'starry_assistant_messages_v1';
const SETTINGS_KEY = 'starry_assistant_settings_v1';
const CUSTOM_AVATAR_KEY = 'starry_assistant_custom_avatar_v1';

export async function loadAssistantMessages(): Promise<StarryMessage[]> {
  try {
    if (!db.isOpen()) await db.open();
    const item = await db.settings.get(MESSAGES_KEY);
    if (item && Array.isArray(item.data)) {
      return item.data as StarryMessage[];
    }
  } catch (err) {
    console.warn('[AssistantStorage] 读取对话历史失败:', err);
  }
  return [];
}

export async function saveAssistantMessages(messages: StarryMessage[]): Promise<void> {
  try {
    if (!db.isOpen()) await db.open();
    // 最多持久化保留最近 60 条对话记录
    const trimmed = messages.slice(-60);
    await db.settings.put({
      key: MESSAGES_KEY,
      data: trimmed,
    });
  } catch (err) {
    console.warn('[AssistantStorage] 保存对话历史失败:', err);
  }
}

export async function clearAssistantMessages(): Promise<void> {
  try {
    if (!db.isOpen()) await db.open();
    await db.settings.delete(MESSAGES_KEY);
  } catch (err) {
    console.warn('[AssistantStorage] 清空对话历史失败:', err);
  }
}

export async function loadAssistantSettings(): Promise<StarryAssistantSettings> {
  const defaultSettings: StarryAssistantSettings = {
    selectedCharacterId: null,
    customAvatarUrl: null,
    activeStarIds: ['course_kanban', 'diary', 'storyword'], // 默认点亮3颗日常星
  };

  try {
    if (!db.isOpen()) await db.open();
    const item = await db.settings.get(SETTINGS_KEY);
    if (item && item.data) {
      return { ...defaultSettings, ...(item.data as StarryAssistantSettings) };
    }
  } catch (err) {
    console.warn('[AssistantStorage] 读取小助手设置失败:', err);
  }
  return defaultSettings;
}

export async function saveAssistantSettings(settings: Partial<StarryAssistantSettings>): Promise<void> {
  try {
    if (!db.isOpen()) await db.open();
    const current = await loadAssistantSettings();
    await db.settings.put({
      key: SETTINGS_KEY,
      data: { ...current, ...settings },
    });
  } catch (err) {
    console.warn('[AssistantStorage] 保存小助手设置失败:', err);
  }
}

export async function loadCustomAvatar(): Promise<string | null> {
  try {
    if (!db.isOpen()) await db.open();
    const item = await db.settings.get(CUSTOM_AVATAR_KEY);
    if (item && typeof item.data === 'string') {
      return item.data;
    }
  } catch (err) {
    console.warn('[AssistantStorage] 读取自定义头像失败:', err);
  }
  return null;
}

export async function saveCustomAvatar(dataUrl: string | null): Promise<void> {
  try {
    if (!db.isOpen()) await db.open();
    if (dataUrl) {
      await db.settings.put({
        key: CUSTOM_AVATAR_KEY,
        data: dataUrl,
      });
    } else {
      await db.settings.delete(CUSTOM_AVATAR_KEY);
    }
  } catch (err) {
    console.warn('[AssistantStorage] 保存自定义头像失败:', err);
  }
}
