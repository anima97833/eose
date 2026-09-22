import { IStorageAdapter } from './types';
import { CharacterProfile } from '../../types/character';
import { ChatMessageItem } from '../../types/chat';
import { DualRouteSettings, DEFAULT_SETTINGS } from '../../types/settings';

/**
 * [预留选项 B: 云端远程存储适配器]
 * 为后续对接 Supabase、远端云同步或多设备账号登录体系预留的实现桩。
 */
export class RemoteCloudStorageAdapter implements IStorageAdapter {
  private endpoint: string;
  private authToken: string;

  constructor(endpoint: string = '/api/storage', authToken: string = '') {
    this.endpoint = endpoint;
    this.authToken = authToken;
  }

  async getCharacters(): Promise<CharacterProfile[]> {
    const res = await fetch(`${this.endpoint}/characters`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
    if (!res.ok) return [];
    return res.json();
  }

  async getCharacterById(id: string): Promise<CharacterProfile | undefined> {
    const res = await fetch(`${this.endpoint}/characters/${id}`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
    if (!res.ok) return undefined;
    return res.json();
  }

  async saveCharacter(char: CharacterProfile): Promise<void> {
    await fetch(`${this.endpoint}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(char),
    });
  }

  async deleteCharacter(id: string): Promise<void> {
    await fetch(`${this.endpoint}/characters/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
  }

  async getMessages(characterId: string): Promise<ChatMessageItem[]> {
    const res = await fetch(`${this.endpoint}/messages?characterId=${characterId}`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
    if (!res.ok) return [];
    return res.json();
  }

  async saveMessage(msg: ChatMessageItem): Promise<void> {
    await fetch(`${this.endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(msg),
    });
  }

  async clearMessages(characterId: string): Promise<void> {
    await fetch(`${this.endpoint}/messages?characterId=${characterId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
  }

  async getSettings(): Promise<DualRouteSettings> {
    const res = await fetch(`${this.endpoint}/settings`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
    if (!res.ok) return DEFAULT_SETTINGS;
    return res.json();
  }

  async saveSettings(settings: DualRouteSettings): Promise<void> {
    await fetch(`${this.endpoint}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(settings),
    });
  }

  async exportBackup(): Promise<string> {
    const characters = await this.getCharacters();
    const settings = await this.getSettings();
    return JSON.stringify({ characters, settings }, null, 2);
  }

  async importBackup(): Promise<boolean> {
    return true;
  }
}
