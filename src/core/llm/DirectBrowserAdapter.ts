import { ILLMAdapter, LLMConfig, LLMTestResult, ChatMessage } from './types';

export async function fetchEndpointModels(baseUrl: string, apiKey: string): Promise<string[]> {
  let base = baseUrl.trim();
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  const url = `${base}/models`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`拉取模型列表失败 HTTP ${res.status}: ${errText}`);
  }

  const json = await res.json();
  let modelIds: string[] = [];

  if (Array.isArray(json.data)) {
    modelIds = json.data.map((item: { id?: string }) => item.id || '').filter(Boolean);
  } else if (Array.isArray(json.models)) {
    modelIds = json.models.map((item: { id?: string; name?: string }) => item.id || item.name || '').filter(Boolean);
  } else if (Array.isArray(json)) {
    modelIds = json.map((item: { id?: string } | string) => (typeof item === 'string' ? item : item.id || '')).filter(Boolean);
  }

  // 按字母排序并去重
  return Array.from(new Set(modelIds)).sort();
}

export class DirectBrowserAdapter implements ILLMAdapter {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  private getNormalizedUrl(path: string): string {
    let base = this.config.baseUrl.trim();
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return base + path;
  }

  async testConnection(): Promise<LLMTestResult> {
    const startTime = Date.now();
    try {
      if (!this.config.baseUrl.trim()) {
        return { success: false, message: '请先填写接口 Base URL' };
      }
      if (!this.config.apiKey.trim()) {
        return { success: false, message: '请先填写 API Key' };
      }
      if (!this.config.model.trim()) {
        return { success: false, message: '请先选择或拉取模型' };
      }

      const url = this.getNormalizedUrl('/chat/completions');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: this.config.model.trim(),
          messages: [{ role: 'user', content: 'Ping! 请只回复四个字：连接正常。' }],
          max_tokens: 20,
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errorText = await res.text();
        let detail = res.statusText;
        try {
          const json = JSON.parse(errorText);
          detail = json.error?.message || json.message || detail;
        } catch {
          // ignore
        }
        return {
          success: false,
          message: `连接失败 HTTP ${res.status}: ${detail}`,
          latencyMs,
        };
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || '连接成功';

      return {
        success: true,
        message: `测试成功 (${latencyMs}ms): ${reply.trim()}`,
        latencyMs,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: errorMsg.includes('Failed to fetch')
          ? '网络连接失败或触发跨域限制(CORS)，请检查 Base URL 是否正确或网络是否畅通'
          : `请求异常: ${errorMsg}`,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async sendMessage(
    messages: ChatMessage[],
    onChunk?: (token: string) => void
  ): Promise<string> {
    const url = this.getNormalizedUrl('/chat/completions');
    const isStream = typeof onChunk === 'function';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: this.config.model.trim(),
        messages,
        temperature: this.config.temperature ?? 0.7,
        stream: isStream,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API 错误 (${res.status}): ${errorText}`);
    }

    if (!isStream || !res.body) {
      const json = await res.json();
      return json.choices?.[0]?.message?.content || '';
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
        } catch {
          // ignore partial json
        }
      }
    }

    return fullText;
  }
}
