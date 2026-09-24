export interface StarAppMeta {
  id: string;
  name: string;
  iconName: string;
  themeColor: string; // 光晕主色
  glowColor: string;  // 星光辐射色
  x: number;          // 夜空中的百分比坐标 X (10% ~ 90%)
  y: number;          // 夜空中的百分比坐标 Y (12% ~ 58%)
}

export interface FactItem {
  sourceAppId: string;
  sourceAppName: string;
  category: string;
  title: string;
  detail: string;
  timestamp?: number | string;
}

export interface StarryMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  selectedStarIds?: string[];
  characterId?: string;
  characterName?: string;
}

export interface StarryAssistantSettings {
  selectedCharacterId: string | null;
  customAvatarUrl: string | null; // 用户自定义上传的草地形象
  activeStarIds: string[];        // 当前勾选的星星
}
