import type { EngineResult } from '../../engine/aiEngine.mjs';

interface SendParams {
  message: string;
  persona: string;
  history: { role: string; content: string }[];
}

let apiDown = false;

/**
 * Sends a message to the backend (/api/chat).
 * In local `vite dev` (no serverless runtime) or any network failure,
 * it seamlessly falls back to running the same engine in the browser.
 */
export async function sendToAI(params: SendParams): Promise<EngineResult> {
  if (!apiDown) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.includes('application/json')) {
        throw new Error('API unavailable');
      }
      const data = (await res.json()) as EngineResult;
      return { ...data, servedBy: data.servedBy || 'api' };
    } catch {
      apiDown = true; // don't keep hammering a dead endpoint this session
    }
  }
  const { generateReply } = await import('../../engine/aiEngine.mjs');
  const out = generateReply(params);
  return { ...out, servedBy: 'browser' };
}
