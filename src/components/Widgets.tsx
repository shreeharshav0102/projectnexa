import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { EngineWidget } from '../../engine/aiEngine.mjs';
import { copyText } from '../lib/utils';

function PaletteWidget({ colors }: { colors: string[] }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  return (
    <div className="mt-3 grid grid-cols-5 gap-2 max-w-md">
      {colors.map((c, i) => (
        <button
          key={c + i}
          type="button"
          title={`Copy ${c}`}
          onClick={async () => {
            await copyText(c);
            setCopiedIdx(i);
            setTimeout(() => setCopiedIdx(null), 1400);
          }}
          className="group relative h-16 rounded-xl border border-white/15 transition-transform hover:scale-105 hover:border-white/40 focus:outline-none"
          style={{ background: c }}
        >
          <span className="absolute inset-x-0 bottom-1 text-center text-[10px] font-mono text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {copiedIdx === i ? (
              <span className="inline-flex items-center gap-0.5">
                <Check size={10} /> ok
              </span>
            ) : (
              c
            )}
          </span>
          <Copy
            size={11}
            className="absolute right-1.5 top-1.5 text-white/70 opacity-0 transition-opacity group-hover:opacity-100 drop-shadow"
          />
        </button>
      ))}
    </div>
  );
}

function StatsWidget({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="mt-3 grid max-w-lg grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
          <div className="text-lg font-semibold leading-tight text-white font-display">{it.value}</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/45">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Widget({ widget }: { widget: EngineWidget | null | undefined }) {
  if (!widget) return null;
  if (widget.type === 'palette' && widget.colors) return <PaletteWidget colors={widget.colors} />;
  if (widget.type === 'stats' && widget.items) return <StatsWidget items={widget.items} />;
  return null;
}
