export interface AiPhoneManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  icon?: string;
  author?: string;
  sdkVersion?: string;
  permissions?: string[];
}

export interface AiPhoneRpcRequest {
  type: 'AIPHONE_RPC_REQUEST';
  id: string;
  appId: string;
  method: string;
  params?: Record<string, unknown>;
}

export interface AiPhoneRpcResponse {
  type: 'AIPHONE_RPC_RESPONSE';
  id: string;
  result?: unknown;
  error?: string;
}

export interface CustomAppMeta {
  id: string;
  name: string;
  version: string;
  description?: string;
  icon?: string;
  htmlContent: string;
  manifest?: AiPhoneManifest;
  badgeCount?: number;
  installedAt: number;
}
