import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Code2, GraduationCap, PenLine, Sparkles, Terminal, Wand2 } from 'lucide-react';
import { COMMANDS, PERSONAS } from '../../engine/aiEngine.mjs';
import { cn } from '../lib/utils';
import { PERSONA_ICONS } from './PersonaMenu';

const SAMPLES = [
  {
    icon: Code2,
    title: 'Generate real code',
    prompt: 'Write a debounce function in JavaScript',
    desc: 'Production-ready snippets with explanations',
  },
  {
    icon: Wand2,
    title: 'Forge a story',
    prompt: '/story a lighthouse keeper on Mars',
    desc: 'Original fiction from a single spark',
  },
  {
    icon: Terminal,
    title: 'Instant math',
    prompt: '/calc (52 * 18) + sqrt(81)',
    desc: 'A real parser — not a guess',
  },
  {
    icon: GraduationCap,
    title: 'Learn anything',
    prompt: 'Explain recursion simply',
    desc: 'Clear definitions with analogies',
  },
];

interface Props {
  persona: string;
  onPersona: (id: string) => void;
  onPrompt: (text: string) => void;
}

export function Welcome({ persona, onPersona, onPrompt }: Props) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-10 pt-8 sm:pt-14">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-3xl" />
        <img
          src="/images/nexa-orb.png"
          alt="Nexa AI core"
          className="float-anim relative h-28 w-44 rounded-3xl border border-white/10 object-cover shadow-2xl shadow-violet-950/60 sm:h-32 sm:w-52"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mt-7 text-center font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
      >
        Where should we <span className="grad-text">begin?</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        className="mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/45"
      >
        I'm Nexa — part chatbot, part toolbox. I run real math, generate code,
        summarize text, speak aloud and stay 100% private in your browser.
      </motion.p>

      {/* persona picker */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.5 }}
        className="mt-6 flex flex-wrap justify-center gap-2"
      >
        {PERSONAS.map((p) => {
          const Icon = PERSONA_ICONS[p.icon] || BarChart3;
          const active = p.id === persona;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPersona(p.id)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-all',
                active
                  ? 'border-violet-400/60 bg-violet-500/20 text-white shadow-lg shadow-violet-950/40'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25 hover:text-white/85'
              )}
            >
              <Icon size={13} className={active ? 'text-violet-300' : ''} />
              {p.name}
            </button>
          );
        })}
      </motion.div>

      {/* sample cards */}
      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {SAMPLES.map((s, i) => (
          <motion.button
            key={s.title}
            type="button"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 + i * 0.07, duration: 0.45 }}
            onClick={() => onPrompt(s.prompt)}
            className="group rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left transition-all hover:border-violet-400/40 hover:bg-violet-500/[0.07]"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/40 to-cyan-500/30 text-violet-200">
                <s.icon size={15} />
              </span>
              <span className="flex-1 text-[13.5px] font-medium text-white/85">{s.title}</span>
              <ArrowRight size={14} className="text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-violet-300" />
            </div>
            <div className="mt-2 font-mono text-[12px] text-cyan-300/70">{s.prompt}</div>
            <div className="mt-1 text-[12px] text-white/35">{s.desc}</div>
          </motion.button>
        ))}
      </div>

      {/* command chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
      >
        <span className="mr-1 text-[11px] uppercase tracking-widest text-white/25">Toolbox</span>
        {COMMANDS.slice(0, 10).map((c) => (
          <button
            key={c.cmd}
            type="button"
            onClick={() => onPrompt(c.usage)}
            className="rounded-md border border-white/8 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-white/45 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
          >
            {c.cmd}
          </button>
        ))}
        <span className="ml-1 flex items-center gap-1 text-[11px] text-white/30">
          <Sparkles size={11} /> +{COMMANDS.length - 10} more
        </span>
      </motion.div>
    </div>
  );
}
