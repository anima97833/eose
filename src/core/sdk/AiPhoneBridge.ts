import { AiPhoneRpcRequest, AiPhoneRpcResponse, AiPhoneManifest } from './types';
import { loadCharacters, getCharacterById } from '../../utils/characterStorage';
import { loadStoredSettings } from '../../types/settings';
import { createLLMAdapter, ChatMessage } from '../llm';

export interface BridgeContext {
  appId: string;
  manifest?: AiPhoneManifest;
  onClose?: () => void;
  onToast?: (message: string) => void;
  onBadgeChange?: (appId: string, count: number) => void;
}

export class AiPhoneBridge {
  private context: BridgeContext;
  private isDestroyed = false;

  constructor(context: BridgeContext) {
    this.context = context;
    this.handleWindowMessage = this.handleWindowMessage.bind(this);
    window.addEventListener('message', this.handleWindowMessage);
  }

  public updateContext(newContext: Partial<BridgeContext>) {
    this.context = { ...this.context, ...newContext };
  }

  public destroy() {
    this.isDestroyed = true;
    window.removeEventListener('message', this.handleWindowMessage);
  }

  private async handleWindowMessage(event: MessageEvent) {
    if (this.isDestroyed) return;
    const data = event.data;
    if (!data || data.type !== 'AIPHONE_RPC_REQUEST') return;

    const request = data as AiPhoneRpcRequest;
    const response = await this.dispatchRpc(request);

    // 回传响应至发送请求的 iframe
    if (event.source && typeof (event.source as Window).postMessage === 'function') {
      (event.source as Window).postMessage(response, '*');
    }
  }

  private async dispatchRpc(request: AiPhoneRpcRequest): Promise<AiPhoneRpcResponse> {
    const { id, method, params } = request;

    try {
      let result: unknown = null;

      switch (method) {
        // --- 应用生命周期 ---
        case 'app.getManifest':
          result = this.context.manifest || {
            id: this.context.appId,
            name: '自定义应用',
            version: '1.0',
          };
          break;

        case 'app.close':
          this.context.onClose?.();
          result = { success: true };
          break;

        // --- 拟物 UI 交互 ---
        case 'ui.toast':
          const msg = (params?.message as string) || '';
          this.context.onToast?.(msg);
          result = { success: true };
          break;

        case 'ui.confirm':
          const title = (params?.title as string) || '确认提示';
          const content = (params?.content as string) || '';
          const confirmed = window.confirm(`${title}\n\n${content}`);
          result = { confirmed };
          break;

        // --- 角色人设系统联动 ---
        case 'characters.list':
          const allChars = loadCharacters();
          result = allChars.map((c) => ({
            id: c.id,
            name: c.name,
            avatar: c.avatar,
            title: c.title,
            persona: c.persona,
            tone: c.tone,
            status: c.status,
          }));
          break;

        case 'characters.get':
          const charId = params?.characterId as string;
          const char = getCharacterById(charId);
          result = char || null;
          break;

        // --- 大模型智能生成 ---
        case 'ai.generate':
        case 'ai.chat':
          result = await this.handleAiGenerate(params);
          break;

        // --- 本地私有数据库 ---
        case 'db.create':
          result = this.handleDbCreate(params);
          break;

        case 'db.list':
          result = this.handleDbList(params);
          break;

        case 'db.get':
          result = this.handleDbGet(params);
          break;

        case 'db.update':
          result = this.handleDbUpdate(params);
          break;

        case 'db.delete':
          result = this.handleDbDelete(params);
          break;

        // --- 桌面通知与未读红点 ---
        case 'notifications.setBadge':
          const count = Number(params?.count) || 0;
          this.context.onBadgeChange?.(this.context.appId, count);
          result = { success: true, count };
          break;

        case 'notifications.clearBadge':
          this.context.onBadgeChange?.(this.context.appId, 0);
          result = { success: true, count: 0 };
          break;

        default:
          throw new Error(`未支持的 AiPhone SDK 方法: ${method}`);
      }

      return {
        type: 'AIPHONE_RPC_RESPONSE',
        id,
        result,
      };
    } catch (err) {
      return {
        type: 'AIPHONE_RPC_RESPONSE',
        id,
        error: (err as Error).message || String(err),
      };
    }
  }

  // --- 大模型调度实现 ---
  private async handleAiGenerate(params?: Record<string, unknown>): Promise<{ content: string }> {
    const prompt = (params?.prompt as string) || '';
    const systemPrompt = (params?.systemPrompt as string) || '';
    const characterId = params?.characterId as string | undefined;

    let roleName = '小手机智能助手';
    let roleTone = '';

    if (characterId) {
      const char = getCharacterById(characterId);
      if (char) {
        roleName = char.name;
        roleTone = `你是${char.name}，语气习惯：${char.tone || '温柔体贴'}。核心人设设定：${char.persona}。请用你特有的口吻进行回复。`;
      }
    }

    const messages: ChatMessage[] = [];
    const effectiveSystemPrompt = [systemPrompt, roleTone].filter(Boolean).join('\n');
    if (effectiveSystemPrompt) {
      messages.push({ role: 'system', content: effectiveSystemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const settings = loadStoredSettings();

    // 如果配置了 API Key，直接调用大模型
    if (settings.primary.apiKey.trim()) {
      try {
        const adapter = createLLMAdapter(settings.primary);
        const reply = await adapter.sendMessage(messages);
        return { content: reply };
      } catch (err) {
        console.warn('调用大模型异常，进入自愈生成:', err);
      }
    }

    // 优雅离线仿真降级（无需配置 API Key 即可完整体验）
    const simulatedAnswers = [
      `【${roleName}的悄悄话】✨ 看到你抽到的签啦！“${prompt.slice(0, 20)}...” 不管今天遇到什么，小手机一直在你身边陪着你，一切都会顺遂温暖的哦~`,
      `【${roleName}解签】🌟 哇，这是一支很有灵气的好签！放轻松，按照自己的节奏来就好，随时找我聊天呀。`,
      `【${roleName}为你祈福】💫 愿今天的烦恼都消散，好运都撞个满怀！小手机今天也会守护你的好心情~`,
    ];
    const picked = simulatedAnswers[Math.floor(Math.random() * simulatedAnswers.length)];
    return { content: picked };
  }

  // --- 本地私有数据库辅助方法 ---
  private getDbStorageKey(collection: string): string {
    return `aiphone_db_${this.context.appId}_${collection}`;
  }

  private handleDbCreate(params?: Record<string, unknown>): Record<string, unknown> {
    const collection = (params?.collection as string) || 'default';
    const data = (params?.data as Record<string, unknown>) || {};
    const key = this.getDbStorageKey(collection);

    const existing: Array<Record<string, unknown>> = JSON.parse(localStorage.getItem(key) || '[]');
    const id = 'doc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    const item = { ...data, id, _createdAt: Date.now(), _updatedAt: Date.now() };

    existing.unshift(item);
    localStorage.setItem(key, JSON.stringify(existing));
    return item;
  }

  private handleDbList(params?: Record<string, unknown>): Array<Record<string, unknown>> {
    const collection = (params?.collection as string) || 'default';
    const key = this.getDbStorageKey(collection);
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  private handleDbGet(params?: Record<string, unknown>): Record<string, unknown> | null {
    const collection = (params?.collection as string) || 'default';
    const id = params?.id as string;
    const key = this.getDbStorageKey(collection);
    const list: Array<Record<string, unknown>> = JSON.parse(localStorage.getItem(key) || '[]');
    return list.find((item) => item.id === id) || null;
  }

  private handleDbUpdate(params?: Record<string, unknown>): Record<string, unknown> {
    const collection = (params?.collection as string) || 'default';
    const id = params?.id as string;
    const data = (params?.data as Record<string, unknown>) || {};
    const key = this.getDbStorageKey(collection);

    let list: Array<Record<string, unknown>> = JSON.parse(localStorage.getItem(key) || '[]');
    let updatedItem: Record<string, unknown> | null = null;

    list = list.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...data, _updatedAt: Date.now() };
        return updatedItem;
      }
      return item;
    });

    localStorage.setItem(key, JSON.stringify(list));
    return updatedItem || { id, ...data };
  }

  private handleDbDelete(params?: Record<string, unknown>): { success: boolean } {
    const collection = (params?.collection as string) || 'default';
    const id = params?.id as string;
    const key = this.getDbStorageKey(collection);

    const list: Array<Record<string, unknown>> = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    return { success: true };
  }
}
