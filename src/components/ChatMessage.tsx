import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, RefreshCw, Sparkles, User, Volume2 } from 'lucide-react';
import type { ChatMessage as Msg } from '../lib/types';
import { cn, copyText, formatTime } from '../lib/utils';
import { speak } from '../lib/speech';
import { Markdown } from './Markdown';
import { Widget } from './Widgets';

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-violet-400 typing-dot"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
      <span className="ml-2 text-xs text-white/40">Nexa is thinking</span>
    </span>
  );
}

interface Props {
  message: Msg;
  isLastAssistant: boolean;
  onRegenerate: () => void;
}

export function ChatMessage({ message, isLastAssistant, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const onCopy = async () => {
    await copyText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('group flex gap-3 px-4 sm:px-6', isUser ? 'flex-row-reverse' : '')}
    >
      {/* avatar */}
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border',
          isUser
            ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300'
            : 'border-violet-400/30 bg-gradient-to-br from-violet-600/40 to-cyan-500/30 text-violet-200'
        )}
      >
        {isUser ? <User size={15} /> : <Sparkles size={15} />}
      </div>

      {/* body */}
      <div className={cn('min-w-0 max-w-[85%] sm:max-w-[78%]', isUser ? 'text-right' : '')}>
        <div className={cn('mb-1 flex items-baseline gap-2 text-[11px] text-white/35', isUser ? 'flex-row-reverse' : '')}>
          <span className="font-medium text-white/50">{isUser ? 'You' : 'Nexa'}</span>
          <span>{formatTime(message.ts)}</span>
        </div>

        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-[14px] leading-relaxed',
            isUser
              ? 'ml-auto inline-block rounded-tr-sm bg-gradient-to-br from-violet-600/80 to-violet-700/70 text-left text-white shadow-lg shadow-violet-950/40'
              : 'rounded-tl-sm border border-white/8 bg-white/[0.035] text-white/85'
          )}
        >
          {message.status === 'thinking' ? (
            <TypingDots />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <>
              <Markdown text={message.content} />
              {message.status === 'streaming' && <span className="stream-caret" />}
              <Widget widget={message.status === 'done' ? message.widget : null} />
            </>
          )}
        </div>

        {/* actions */}
        {!isUser && message.status === 'done' && (
          <div className="mt-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={onCopy} className="msg-action" title="Copy" type="button">
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
            <button onClick={() => speak(message.content)} className="msg-action" title="Read aloud" type="button">
              <Volume2 size={13} />
            </button>
            {isLastAssistant && (
              <button onClick={onRegenerate} className="msg-action" title="Regenerate" type="button">
                <RefreshCw size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
