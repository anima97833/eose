import { MemoryBookMessage } from '../../../core/storage/db';

export interface ParseResult {
  title: string;
  characterName: string;
  messages: MemoryBookMessage[];
  messageCount: number;
  totalWords: number;
}

export function parseChatJson(rawText: string, fileName: string = '未命名回忆录'): ParseResult {
  const cleanFileName = fileName.replace(/\.[^/.]+$/, '');
  let parsed: any;

  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    // 尝试容错：如果是连续的 JSONLines
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const lineObjects: any[] = [];
    for (const line of lines) {
      try {
        lineObjects.push(JSON.parse(line));
      } catch {
        // ignore
      }
    }
    if (lineObjects.length > 0) {
      parsed = lineObjects;
    } else {
      throw new Error('无法解析 JSON 文件，请检查文件格式是否正确。');
    }
  }

  let rawList: any[] = [];
  let detectedTitle = cleanFileName;
  let detectedCharacter = 'AI 伴侣';

  // 1. 如果顶层是数组
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (typeof parsed === 'object' && parsed !== null) {
    // 2. 如果顶层是对象，查找可能的对白数组字段
    if (parsed.title && typeof parsed.title === 'string') {
      detectedTitle = parsed.title;
    }
    if (parsed.character && typeof parsed.character === 'string') {
      detectedCharacter = parsed.character;
    } else if (parsed.character_name && typeof parsed.character_name === 'string') {
      detectedCharacter = parsed.character_name;
    } else if (parsed.bot_name && typeof parsed.bot_name === 'string') {
      detectedCharacter = parsed.bot_name;
    }

    if (Array.isArray(parsed.messages)) {
      rawList = parsed.messages;
    } else if (Array.isArray(parsed.chat)) {
      rawList = parsed.chat;
    } else if (Array.isArray(parsed.history)) {
      rawList = parsed.history;
    } else if (Array.isArray(parsed.data)) {
      rawList = parsed.data;
    } else if (parsed.mapping && typeof parsed.mapping === 'object') {
      // ChatGPT 官方导出的 mapping 树状节点
      const nodes = Object.values(parsed.mapping);
      for (const node of nodes as any[]) {
        if (node?.message?.content?.parts) {
          const role = node.message.author?.role;
          const text = node.message.content.parts.join('\n').trim();
          if (text) {
            rawList.push({
              role,
              content: text,
              create_time: node.message.create_time,
            });
          }
        }
      }
      rawList.sort((a, b) => (a.create_time || 0) - (b.create_time || 0));
    }
  }

  if (!rawList || rawList.length === 0) {
    throw new Error('未在 JSON 中找到有效的聊天对白记录。');
  }

  // 标准化清洗每一条消息
  const messages: MemoryBookMessage[] = [];
  let charNameCandidate = detectedCharacter;

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    if (!item) continue;

    // 提取文本内容
    let content = '';
    if (typeof item.content === 'string') {
      content = item.content;
    } else if (typeof item.text === 'string') {
      content = item.text;
    } else if (typeof item.mes === 'string') {
      content = item.mes; // SillyTavern
    } else if (typeof item.message === 'string') {
      content = item.message;
    } else if (Array.isArray(item.parts)) {
      content = item.parts.join('\n');
    } else if (item.content && typeof item.content === 'object' && Array.isArray(item.content.parts)) {
      content = item.content.parts.join('\n');
    }

    content = content.trim();
    if (!content) continue;

    // 判定发送者
    let sender: 'user' | 'assistant' | 'system' = 'assistant';
    const role = (item.role || item.sender || item.author || '').toString().toLowerCase();
    const isUserBool = item.is_user;

    if (
      isUserBool === true ||
      role === 'user' ||
      role === 'human' ||
      role === 'me' ||
      role === 'player' ||
      role === '你'
    ) {
      sender = 'user';
    } else if (role === 'system' || role === 'narrator') {
      sender = 'system';
    } else {
      sender = 'assistant';
      if (item.name && typeof item.name === 'string' && item.name.length <= 12) {
        charNameCandidate = item.name;
      }
    }

    // 提取时间戳
    let timestamp = Date.now() - (rawList.length - i) * 60000;
    if (typeof item.timestamp === 'number') {
      timestamp = item.timestamp > 1e12 ? item.timestamp : item.timestamp * 1000;
    } else if (typeof item.create_time === 'number') {
      timestamp = item.create_time > 1e12 ? item.create_time : item.create_time * 1000;
    } else if (typeof item.time === 'string') {
      const parsedTime = Date.parse(item.time);
      if (!isNaN(parsedTime)) timestamp = parsedTime;
    }

    messages.push({
      id: item.id ? String(item.id) : `msg_${i}_${Date.now()}`,
      sender,
      name: sender === 'user' ? '你' : charNameCandidate,
      content,
      timestamp,
    });
  }

  if (messages.length === 0) {
    throw new Error('未提取到任何可阅读的文本内容。');
  }

  // 统计字数
  const totalWords = messages.reduce((acc, cur) => acc + cur.content.length, 0);

  return {
    title: detectedTitle,
    characterName: charNameCandidate,
    messages,
    messageCount: messages.length,
    totalWords,
  };
}
