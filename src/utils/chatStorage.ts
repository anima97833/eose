import { ChatMessageItem } from '../types/chat';

const CHAT_STORAGE_PREFIX = 'neumorphic_phone_chat_';

export function loadChatMessages(characterId: string): ChatMessageItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${characterId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }

  // 默认初始打招呼消息
  return [
    {
      id: `msg_init_${characterId}`,
      characterId,
      sender: 'assistant',
      content: '嗨！今天在忙些什么呢？小手机一直在身边，随时都可以和我说话哦~',
      timestamp: Date.now() - 3600000,
    },
  ];
}

export function saveChatMessages(characterId: string, messages: ChatMessageItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CHAT_STORAGE_PREFIX}${characterId}`, JSON.stringify(messages));
  } catch {
    // fallback
  }
}
