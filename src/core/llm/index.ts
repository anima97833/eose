import { ILLMAdapter, LLMConfig } from './types';
import { DirectBrowserAdapter } from './DirectBrowserAdapter';
import { ProxyServerAdapter } from './ProxyServerAdapter';

export * from './types';
export * from './DirectBrowserAdapter';
export * from './ProxyServerAdapter';

export function createLLMAdapter(config: LLMConfig): ILLMAdapter {
  if (config.useProxy) {
    return new ProxyServerAdapter(config);
  }
  return new DirectBrowserAdapter(config);
}
