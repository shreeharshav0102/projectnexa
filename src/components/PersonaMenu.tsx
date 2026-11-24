import { useEffect, useRef, useState } from 'react';
import { BarChart3, Check, ChevronDown, Code2, GraduationCap, PenLine, Sparkles } from 'lucide-react';
import { PERSONAS } from '../../engine/aiEngine.mjs';
import { cn } from '../lib/utils';

export const PERSONA_ICONS: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  code: Code2,
  pen: PenLine,
  grad: GraduationCap,
  chart: BarChart3,
};

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function PersonaMenu({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = PERSONAS.find((p) => p.id === value) || PERSONAS[0];
  const Icon = PERSONA_ICONS[current.icon] || Sparkles;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
      >
        <Icon size={14} className="text-violet-300" />
        <span className="hidden sm:inline">{current.name}</span>
        <ChevronDown size={13} className={cn('text-white/40 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1020]/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="px-3 pb-1.5 pt-2 text-[10.5px] uppercase tracking-widest text-white/35">
            Persona
          </div>
          {PERSONAS.map((p) => {
            const PIcon = PERSONA_ICONS[p.icon] || Sparkles;
            const active = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                  active ? 'bg-violet-500/15' : 'hover:bg-white/5'
                )}
              >
                <PIcon size={15} className={cn('mt-0.5 shrink-0', active ? 'text-violet-300' : 'text-white/40')} />
                <span className="flex-1">
                  <span className={cn('block text-[13px] font-medium', active ? 'text-white' : 'text-white/75')}>
                    {p.name}
                  </span>
                  <span className="block text-[11.5px] leading-snug text-white/40">{p.tagline}</span>
                </span>
                {active && <Check size={14} className="mt-1 shrink-0 text-violet-300" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
