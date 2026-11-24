import type { Conversation } from './types';

const KEY = 'nexa.conversations.v1';

export function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Conversation[];
    return Array.isArray(list) ? list.filter((c) => c && c.id && Array.isArray(c.messages)) : [];
  } catch {
    return [];
  }
}

export function saveConversations(list: Conversation[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 60)));
  } catch {
    /* storage full — ignore */
  }
}

export function makeTitle(message: string): string {
  const clean = message.replace(/\s+/g, ' ').trim();
  return clean.length > 42 ? clean.slice(0, 42).trimEnd() + '…' : clean;
}

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function conversationToMarkdown(c: Conversation): string {
  const lines = [
    `# ${c.title}`,
    '',
    `_Exported from Nexa AI on ${new Date(c.updatedAt).toLocaleString()}_`,
    '',
  ];
  for (const m of c.messages) {
    lines.push(m.role === 'user' ? `### You` : `### Nexa`);
    lines.push('');
    lines.push(m.content);
    lines.push('');
  }
  return lines.join('\n');
}

export function groupByDate(list: Conversation[]): { label: string; items: Conversation[] }[] {
  const day = 86400000;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const groups: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    'Previous 7 days': [],
    Older: [],
  };
  for (const c of list) {
    if (c.updatedAt >= startOfToday) groups['Today'].push(c);
    else if (c.updatedAt >= startOfToday - day) groups['Yesterday'].push(c);
    else if (c.updatedAt >= startOfToday - 7 * day) groups['Previous 7 days'].push(c);
    else groups['Older'].push(c);
  }
  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}
