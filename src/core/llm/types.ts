export type LLMProvider = 'openai' | 'custom';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  useProxy?: boolean;
}

export interface LLMTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export interface ILLMAdapter {
  sendMessage(
    messages: ChatMessage[],
    onChunk?: (token: string) => void
  ): Promise<string>;

  testConnection(): Promise<LLMTestResult>;
}
