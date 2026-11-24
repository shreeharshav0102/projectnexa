import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Mic, MicOff, Square, Terminal } from 'lucide-react';
import { COMMANDS } from '../../engine/aiEngine.mjs';
import { approxTokens, cn } from '../lib/utils';
import { createRecognizer, speechSupported } from '../lib/speech';

interface Props {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function Composer({ busy, onSend, onStop }: Props) {
  const [value, setValue] = useState('');
  const [listening, setListening] = useState(false);
  const [slashIdx, setSlashIdx] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const baseRef = useRef('');
  const recRef = useRef<ReturnType<typeof createRecognizer>>(null);

  const canVoice = speechSupported();

  const slashQuery = value.startsWith('/') ? value.split(/\s/)[0].toLowerCase() : null;
  const slashMatches = slashQuery
    ? COMMANDS.filter((c) => c.cmd.startsWith(slashQuery)).slice(0, 6)
    : [];
  const showSlash = Boolean(slashQuery && slashMatches.length && !value.includes(' '));

  useEffect(() => {
    const el = taRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 180) + 'px';
    }
  }, [value]);

  useEffect(() => setSlashIdx(0), [slashQuery]);

  const send = () => {
    const text = value.trim();
    if (!text || busy) return;
    stopVoice();
    onSend(text);
    setValue('');
    requestAnimationFrame(() => {
      if (taRef.current) taRef.current.style.height = 'auto';
    });
  };

  const stopVoice = () => {
    recRef.current?.stop();
    setListening(false);
  };

  const toggleVoice = () => {
    if (listening) {
      stopVoice();
      return;
    }
    baseRef.current = value ? value + ' ' : '';
    const rec = createRecognizer(
      (text) => setValue((baseRef.current + text).slice(0, 4000)),
      () => setListening(false)
    );
    if (!rec) return;
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (showSlash) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIdx((i) => (i + 1) % slashMatches.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIdx((i) => (i - 1 + slashMatches.length) % slashMatches.length);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && slashMatches[slashIdx] && !value.includes(' '))) {
        e.preventDefault();
        setValue(slashMatches[slashIdx].usage);
        return;
      }
      if (e.key === 'Escape') {
        setValue('');
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="relative">
      {/* slash command palette */}
      {showSlash && (
        <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1020]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2 text-[11px] uppercase tracking-wider text-white/40">
            <Terminal size={12} />
            Toolbox commands
          </div>
          {slashMatches.map((c, i) => (
            <button
              key={c.cmd}
              type="button"
              onClick={() => {
                setValue(c.usage);
                taRef.current?.focus();
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                i === slashIdx ? 'bg-violet-500/15' : 'hover:bg-white/5'
              )}
            >
              <code className="rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                {c.cmd}
              </code>
              <span className="flex-1 truncate text-[13px] text-white/60">{c.desc}</span>
              <span className="hidden font-mono text-[11px] text-white/25 sm:block">{c.usage}</span>
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border bg-[#0d1020]/90 p-2 shadow-xl shadow-black/30 backdrop-blur-xl transition-colors',
          listening ? 'border-red-400/40' : 'border-white/10 focus-within:border-violet-400/50'
        )}
      >
        {canVoice && (
          <button
            type="button"
            onClick={toggleVoice}
            title={listening ? 'Stop listening' : 'Voice input'}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
              listening
                ? 'bg-red-500/20 text-red-300 voice-pulse'
                : 'text-white/40 hover:bg-white/8 hover:text-white/80'
            )}
          >
            {listening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
        )}

        <textarea
          ref={taRef}
          id="nexa-composer"
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={listening ? 'Listening — speak now...' : 'Message Nexa, or type / for tools...'}
          className="max-h-[180px] min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2.5 text-[14px] text-white/90 placeholder-white/30 focus:outline-none"
        />

        {busy ? (
          <button
            type="button"
            onClick={onStop}
            title="Stop generating"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/15"
          >
            <Square size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={send}
            disabled={!value.trim()}
            title="Send"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all',
              value.trim()
                ? 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-900/50 hover:brightness-110'
                : 'cursor-not-allowed bg-white/5 text-white/25'
            )}
          >
            <ArrowUp size={17} />
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-white/30">
        <span className="hidden sm:block">
          Enter to send · Shift+Enter for a new line · <span className="text-white/45">/</span> opens the toolbox
        </span>
        <span className="sm:hidden">/ opens the toolbox</span>
        <span>{value.length > 0 ? `~${approxTokens(value)} tokens` : 'nexa-1 · local engine'}</span>
      </div>
    </div>
  );
}
