import { CharacterProfile } from '../../types/character';
import { ChatMessageItem } from '../../types/chat';
import { DualRouteSettings } from '../../types/settings';

export interface ExportBackupData {
  version: string;
  exportedAt: number;
  characters: CharacterProfile[];
  messages: ChatMessageItem[];
  settings: DualRouteSettings;
}

export interface IStorageAdapter {
  // 角色操作
  getCharacters(): Promise<CharacterProfile[]>;
  getCharacterById(id: string): Promise<CharacterProfile | undefined>;
  saveCharacter(char: CharacterProfile): Promise<void>;
  deleteCharacter(id: string): Promise<void>;

  // 会话消息操作
  getMessages(characterId: string): Promise<ChatMessageItem[]>;
  saveMessage(msg: ChatMessageItem): Promise<void>;
  clearMessages(characterId: string): Promise<void>;

  // 设置操作
  getSettings(): Promise<DualRouteSettings>;
  saveSettings(settings: DualRouteSettings): Promise<void>;

  // 备份与迁移
  exportBackup(): Promise<string>;
  importBackup(jsonStr: string): Promise<boolean>;
}
