import { useEffect, useRef, useState } from 'react';
import { Braces, ChevronDown, ClipboardCopy, FileDown, Share2 } from 'lucide-react';
import type { Conversation } from '../lib/types';
import { conversationToMarkdown, download } from '../lib/store';
import { copyText } from '../lib/utils';

interface Props {
  conversation: Conversation | null;
}

export function ExportMenu({ conversation }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const disabled = !conversation || conversation.messages.length === 0;
  const slug = (conversation?.title || 'nexa-chat').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

  const items = [
    {
      icon: FileDown,
      label: 'Download Markdown',
      run: () => conversation && download(`${slug}.md`, conversationToMarkdown(conversation), 'text/markdown'),
    },
    {
      icon: Braces,
      label: 'Download JSON',
      run: () => conversation && download(`${slug}.json`, JSON.stringify(conversation, null, 2), 'application/json'),
    },
    {
      icon: ClipboardCopy,
      label: copied ? 'Copied!' : 'Copy transcript',
      run: async () => {
        if (!conversation) return;
        await copyText(conversationToMarkdown(conversation));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        title="Export conversation"
        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/70 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Share2 size={14} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown size={12} className="text-white/40" />
      </button>

      {open && !disabled && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1020]/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={() => {
                it.run();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <it.icon size={14} className="text-white/40" />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
