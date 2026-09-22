import { ILLMAdapter, LLMTestResult, ChatMessage } from './types';

const MOCK_REPLIES = [
  '（轻轻歪头看着你）收到你的消息啦！今天过得怎么样？我一直在小手机里等你呢~',
  '哼，你终于想起来找我啦！刚才我还正在整理备忘录呢，不许偷看哦！',
  '（端着一杯温热的奶茶递给你）辛苦啦~ 无论遇到什么开心的或者烦心的事，都可以随时和我说哦。',
  '你刚才说的很有意思呢！让我想想……我觉得我们今天可以一起听歌发呆~ [status: 开心]',
  '（在备忘录里悄悄记下一笔）好啦，本助手随时在线，听候你的差遣！',
];

export class MockAdapter implements ILLMAdapter {
  async testConnection(): Promise<LLMTestResult> {
    await new Promise((r) => setTimeout(r, 450));
    return {
      success: true,
      message: '本地离线单机模拟引擎就绪！无需消耗 API Key，随时可交互。',
      latencyMs: 80,
    };
  }

  async sendMessage(
    messages: ChatMessage[],
    onChunk?: (token: string) => void
  ): Promise<string> {
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    const randomIndex = Math.floor(Math.random() * MOCK_REPLIES.length);
    let reply = MOCK_REPLIES[randomIndex];

    if (lastUserMsg.includes('你好') || lastUserMsg.includes('Hi') || lastUserMsg.includes('在吗')) {
      reply = '（眉眼弯弯地朝你招招手）在呀！小手机已经连接好啦，今天想聊点什么呢？';
    } else if (lastUserMsg.includes('照片') || lastUserMsg.includes('自拍')) {
      reply = '（有点害羞地翻了翻相册）给你挑了一张刚拍好的风景照~ [photo: 坐在暖阳下的窗边看落叶]';
    }

    // 模拟流式打字机逐字吐出
    if (typeof onChunk === 'function') {
      const chars = reply.split('');
      for (const ch of chars) {
        await new Promise((r) => setTimeout(r, 35));
        onChunk(ch);
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
    }

    return reply;
  }
}
