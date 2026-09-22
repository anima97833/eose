import { IStorageAdapter, ExportBackupData } from './types';
import { db } from './db';
import { CharacterProfile, INITIAL_CHARACTERS } from '../../types/character';
import { ChatMessageItem } from '../../types/chat';
import { DualRouteSettings, DEFAULT_SETTINGS, loadStoredSettings, saveStoredSettings } from '../../types/settings';

export class IndexedDBAdapter implements IStorageAdapter {
  private isInitialized = false;

  private async ensureInit(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const charCount = await db.characters.count();
      if (charCount === 0) {
        // 尝试从 LocalStorage 迁移角色或填充初始预设
        let seedChars = INITIAL_CHARACTERS;
        try {
          const raw = localStorage.getItem('neumorphic_phone_characters');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              seedChars = parsed;
            }
          }
        } catch {
          // ignore
        }
        await db.characters.bulkPut(seedChars);

        // 初始化默认打招呼消息
        const initMessages: ChatMessageItem[] = seedChars.map((char) => ({
          id: `msg_init_${char.id}`,
          characterId: char.id,
          sender: 'assistant',
          content: '嗨！今天在忙些什么呢？小手机一直在身边，随时都可以和我说话哦~',
          timestamp: Date.now() - 3600000,
        }));
        await db.messages.bulkPut(initMessages);
      }
      this.isInitialized = true;
    } catch {
      // 降级兜底
      this.isInitialized = true;
    }
  }

  async getCharacters(): Promise<CharacterProfile[]> {
    await this.ensureInit();
    try {
      const chars = await db.characters.toArray();
      if (chars && chars.length > 0) return chars;
    } catch {
      // ignore
    }
    return INITIAL_CHARACTERS;
  }

  async getCharacterById(id: string): Promise<CharacterProfile | undefined> {
    await this.ensureInit();
    return db.characters.get(id);
  }

  async saveCharacter(char: CharacterProfile): Promise<void> {
    await this.ensureInit();
    await db.characters.put(char);
    // 同步镜像一份到 LocalStorage 保证双保险
    try {
      const all = await db.characters.toArray();
      localStorage.setItem('neumorphic_phone_characters', JSON.stringify(all));
    } catch {
      // ignore
    }
  }

  async deleteCharacter(id: string): Promise<void> {
    await this.ensureInit();
    await db.characters.delete(id);
    await db.messages.where('characterId').equals(id).delete();
    try {
      const all = await db.characters.toArray();
      localStorage.setItem('neumorphic_phone_characters', JSON.stringify(all));
    } catch {
      // ignore
    }
  }

  async getMessages(characterId: string): Promise<ChatMessageItem[]> {
    await this.ensureInit();
    try {
      const msgs = await db.messages.where('characterId').equals(characterId).sortBy('timestamp');
      if (msgs.length > 0) return msgs;
    } catch {
      // ignore
    }
    return [];
  }

  async saveMessage(msg: ChatMessageItem): Promise<void> {
    await this.ensureInit();
    await db.messages.put(msg);
  }

  async clearMessages(characterId: string): Promise<void> {
    await this.ensureInit();
    await db.messages.where('characterId').equals(characterId).delete();
  }

  async getSettings(): Promise<DualRouteSettings> {
    await this.ensureInit();
    try {
      const item = await db.settings.get('dual_route_settings');
      if (item?.data) {
        return item.data as DualRouteSettings;
      }
    } catch {
      // ignore
    }
    return loadStoredSettings();
  }

  async saveSettings(settings: DualRouteSettings): Promise<void> {
    await this.ensureInit();
    await db.settings.put({ key: 'dual_route_settings', data: settings });
    saveStoredSettings(settings);
  }

  async exportBackup(): Promise<string> {
    await this.ensureInit();
    const characters = await db.characters.toArray();
    const messages = await db.messages.toArray();
    const settings = await this.getSettings();

    const data: ExportBackupData = {
      version: '1.0.0',
      exportedAt: Date.now(),
      characters,
      messages,
      settings,
    };

    return JSON.stringify(data, null, 2);
  }

  async importBackup(jsonStr: string): Promise<boolean> {
    await this.ensureInit();
    try {
      const data: ExportBackupData = JSON.parse(jsonStr);
      if (!data.characters || !data.messages) return false;

      await db.characters.clear();
      await db.messages.clear();

      await db.characters.bulkPut(data.characters);
      await db.messages.bulkPut(data.messages);
      if (data.settings) {
        await this.saveSettings(data.settings);
      }

      return true;
    } catch {
      return false;
    }
  }
}
