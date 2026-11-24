export interface EngineWidget {
  type: 'palette' | 'stats';
  colors?: string[];
  items?: { label: string; value: string }[];
}

export interface EngineResult {
  reply: string;
  suggestions: string[];
  widget: EngineWidget | null;
  intent: string;
  servedBy?: string;
}

export interface EngineInput {
  message: string;
  persona?: string;
  history?: { role: string; content: string }[];
}

export declare function generateReply(input: EngineInput): EngineResult;
export declare function evalMath(expr: string): number;
export declare const COMMANDS: { cmd: string; usage: string; desc: string }[];
export declare const PERSONAS: { id: string; name: string; icon: string; tagline: string }[];
