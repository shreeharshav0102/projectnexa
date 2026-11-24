import type { EngineWidget } from '../../engine/aiEngine.mjs';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  widget?: EngineWidget | null;
  suggestions?: string[];
  persona?: string;
  ts: number;
  status?: 'thinking' | 'streaming' | 'done' | 'error';
}

export interface Conversation {
  id: string;
  title: string;
  persona: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
