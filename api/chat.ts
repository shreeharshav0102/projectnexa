/**
 * Vercel Serverless Function — POST /api/chat
 * This is the production backend. It shares the exact same AI engine
 * that the browser uses as a fallback, so behavior is identical
 * whether the request is served by the edge or computed locally.
 */
import { generateReply } from '../engine/aiEngine.mjs';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST with { message, persona, history }.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { message, persona, history } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Body must include a non-empty "message" string.' });
    }

    const reply = generateReply({
      message: message.slice(0, 8000),
      persona: typeof persona === 'string' ? persona : 'nexa',
      history: Array.isArray(history) ? history.slice(-12) : [],
    });

    return res.status(200).json({ ...reply, servedBy: 'vercel-serverless' });
  } catch (err) {
    return res.status(500).json({ error: 'Engine failure', detail: String(err) });
  }
}
