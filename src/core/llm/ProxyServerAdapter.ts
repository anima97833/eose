import { ILLMAdapter, LLMConfig, LLMTestResult, ChatMessage } from './types';

/**
 * [预留选项 B: 服务端中转网关代理适配器]
 * 当用户或企业希望将 API Key 保存在私有后端、解决某些受限网络 CORS 跨域问题时启用。
 */
export class ProxyServerAdapter implements ILLMAdapter {
  private config: LLMConfig;
  private proxyEndpoint: string;

  constructor(config: LLMConfig, proxyEndpoint: string = '/api/llm/chat') {
    this.config = config;
    this.proxyEndpoint = proxyEndpoint;
  }

  async testConnection(): Promise<LLMTestResult> {
    const startTime = Date.now();
    try {
      const res = await fetch(`${this.proxyEndpoint}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: this.config.baseUrl,
          model: this.config.model,
        }),
      });

      const latencyMs = Date.now() - startTime;
      if (!res.ok) {
        return {
          success: false,
          message: `后端代理连通性测试未响应 HTTP ${res.status}`,
          latencyMs,
        };
      }

      return {
        success: true,
        message: `后端中转网关通讯正常 (${latencyMs}ms)`,
        latencyMs,
      };
    } catch {
      return {
        success: false,
        message: '未检测到正在运行的后端代理服务，建议使用浏览器直连模式',
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async sendMessage(
    messages: ChatMessage[],
    onChunk?: (token: string) => void
  ): Promise<string> {
    const isStream = typeof onChunk === 'function';
    const res = await fetch(this.proxyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseUrl: this.config.baseUrl,
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        stream: isStream,
      }),
    });

    if (!res.ok) {
      throw new Error(`中转网关响应错误: ${res.statusText}`);
    }

    if (!isStream || !res.body) {
      const data = await res.json();
      return data.reply || '';
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      full += text;
      onChunk(text);
    }

    return full;
  }
}
