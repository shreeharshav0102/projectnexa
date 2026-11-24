import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, MessageSquare, Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import type { Conversation } from '../lib/types';
import { groupByDate } from '../lib/store';
import { cn } from '../lib/utils';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export function Sidebar({ conversations, activeId, open, onClose, onSelect, onNew, onDelete, onRename }: Props) {
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, query]);

  const groups = groupByDate(filtered);

  const commitRename = (id: string) => {
    const t = editText.trim();
    if (t) onRename(id, t);
    setEditingId(null);
  };

  return (
    <>
      {/* mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/8 bg-[#080a13] transition-transform duration-300 md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* brand */}
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <img src="/favicon.svg" alt="Nexa" className="h-7 w-7" />
            <span className="font-display text-[17px] font-bold tracking-tight text-white">
              Nexa <span className="grad-text">AI</span>
            </span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 hover:bg-white/8 md:hidden" type="button">
            <X size={16} />
          </button>
        </div>

        {/* new chat */}
        <div className="px-3">
          <button
            onClick={() => {
              onNew();
              onClose();
            }}
            type="button"
            className="flex w-full items-center gap-2.5 rounded-xl border border-violet-400/25 bg-gradient-to-r from-violet-600/20 to-cyan-500/10 px-3.5 py-2.5 text-[13.5px] font-medium text-violet-200 transition-all hover:border-violet-400/50 hover:from-violet-600/30"
          >
            <Plus size={16} />
            New chat
            <kbd className="ml-auto rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* search */}
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
            <Search size={14} className="shrink-0 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full bg-transparent text-[13px] text-white/80 placeholder-white/25 focus:outline-none"
            />
          </div>
        </div>

        {/* list */}
        <div className="scroll-slim mt-3 flex-1 overflow-y-auto px-3 pb-3">
          {groups.length === 0 && (
            <div className="mt-10 text-center text-[12.5px] leading-relaxed text-white/30">
              {query ? 'No chats match your search.' : 'No conversations yet.\nStart one — it stays on this device.'}
            </div>
          )}
          {groups.map((g) => (
            <div key={g.label} className="mt-4 first:mt-1">
              <div className="px-2 pb-1.5 text-[10.5px] font-medium uppercase tracking-widest text-white/25">
                {g.label}
              </div>
              <div className="space-y-0.5">
                {g.items.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      'group relative flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
                      c.id === activeId
                        ? 'bg-violet-500/15 text-white'
                        : 'text-white/55 hover:bg-white/5 hover:text-white/85'
                    )}
                    onClick={() => {
                      if (editingId !== c.id) {
                        onSelect(c.id);
                        onClose();
                      }
                    }}
                    onDoubleClick={() => {
                      setEditingId(c.id);
                      setEditText(c.title);
                    }}
                  >
                    <MessageSquare size={13} className="shrink-0 opacity-50" />
                    {editingId === c.id ? (
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => commitRename(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(c.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full rounded bg-white/10 px-1 py-0.5 text-[13px] text-white focus:outline-none"
                      />
                    ) : (
                      <span className="flex-1 truncate">{c.title}</span>
                    )}
                    {editingId === c.id ? (
                      <button
                        type="button"
                        className="shrink-0 text-emerald-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          commitRename(c.id);
                        }}
                      >
                        <Check size={13} />
                      </button>
                    ) : (
                      <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                        <button
                          type="button"
                          title="Rename"
                          className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(c.id);
                            setEditText(c.title);
                          }}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          className="rounded p-1 text-white/40 hover:bg-red-500/20 hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(c.id);
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="border-t border-white/8 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] text-white/35">
            <ShieldCheck size={13} className="text-emerald-400/70" />
            All chats stored locally — private by design
          </div>
        </div>
      </aside>
    </>
  );
}
