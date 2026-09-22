export interface ChatMessageItem {
  id: string;
  characterId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
