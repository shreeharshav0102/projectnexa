import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Braces, Check, Cloud, Code2, Cpu, Download, FileJson, Gauge,
  Layers, Mic, Minus, Monitor, Server, ShieldCheck, Sparkles, Terminal,
  Users, Wand2, X, Zap,
} from 'lucide-react';
import { COMMANDS } from '../../engine/aiEngine.mjs';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

const FEATURES = [
  {
    icon: Zap,
    title: 'Slash-Command Toolbox',
    desc: '20 instant utilities — real math parser, unit converter, password forge, dice, UUIDs, Base64, lorem ipsum and more. No other chatbot ships a toolbox.',
  },
  {
    icon: Code2,
    title: 'Real Code Generation',
    desc: 'A curated library of production patterns — React hooks, Flask APIs, scrapers, SQL joins — with syntax highlighting and one-click copy.',
  },
  {
    icon: FileJson,
    title: 'True Summarizer',
    desc: 'An extractive engine scores every sentence by frequency and position, then keeps only the load-bearing ones. Paste anything, get the gist.',
  },
  {
    icon: Mic,
    title: 'Voice In, Voice Out',
    desc: 'Dictate prompts with the Web Speech API and let Nexa read answers aloud. Hands-free conversations, zero plugins.',
  },
  {
    icon: Users,
    title: 'Five Personas',
    desc: 'Switch between a generalist, a Code Wizard, a Muse, a Professor and an Analyst — each with its own voice and specialties.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by Design',
    desc: 'Sign in with an email code. Conversations and prompt history are stored with your account in MongoDB and can be exported or deleted.',
  },
];

const COMPARE: { label: string; typical: boolean | 'mid'; nexa: boolean }[] = [
  { label: 'Conversational answers', typical: true, nexa: true },
  { label: 'Instant local tools (math, dice, UUID, Base64)', typical: false, nexa: true },
  { label: 'Built-in extractive summarizer', typical: false, nexa: true },
  { label: 'Switchable personas', typical: 'mid', nexa: true },
  { label: 'Voice input + spoken replies', typical: 'mid', nexa: true },
  { label: 'Story & poem forge', typical: true, nexa: true },
  { label: 'Account based conversation history', typical: true, nexa: true },
  { label: 'Open frontend + backend source', typical: false, nexa: true },
  { label: 'Email code sign-in', typical: false, nexa: true },
];

function Mark({ v }: { v: boolean | 'mid' }) {
  if (v === true) return <Check size={15} className="mx-auto text-emerald-400" />;
  if (v === 'mid') return <Minus size={15} className="mx-auto text-amber-400/70" />;
  return <X size={15} className="mx-auto text-rose-400/60" />;
}

function MarqueeRow({ items, reverse }: { items: typeof COMMANDS; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee overflow-hidden">
      <div className={`marquee-track ${reverse ? 'marquee-rev' : ''} flex w-max gap-3 py-1.5`}>
        {doubled.map((c, i) => (
          <span
            key={c.cmd + i}
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5 text-[12.5px] text-white/50"
          >
            <code className="font-mono text-cyan-300/80">{c.cmd}</code>
            <span className="hidden sm:inline">{c.desc}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink font-sans text-white">
      {/* backdrop */}
      <div className="pointer-events-none fixed inset-0">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute right-[-120px] top-[45%] h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      {/* nav */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="Nexa logo" className="h-8 w-8" />
            <span className="font-display text-lg font-bold tracking-tight">
              Nexa <span className="grad-text">AI</span>
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-[13.5px] text-white/55 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#toolbox" className="transition-colors hover:text-white">Toolbox</a>
            <a href="#compare" className="transition-colors hover:text-white">Compare</a>
            <a href="#stack" className="transition-colors hover:text-white">Stack</a>
          </div>
          <Link
            to="/chat"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2 text-[13.5px] font-semibold shadow-lg shadow-violet-950/50 transition-all hover:brightness-110"
          >
            Launch app
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* hero */}
      <header className="relative mx-auto max-w-6xl px-5 pb-16 pt-32 sm:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3.5 py-1.5 text-[12px] text-violet-200"
            >
              <Sparkles size={13} />
              Open-source AI workspace — frontend + backend included
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-5 font-display text-[42px] font-bold leading-[1.05] tracking-tight sm:text-6xl"
            >
              Chat is just
              <br />
              <span className="grad-text">the beginning.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/50"
            >
              Nexa is an AI assistant with a built-in toolbox: it parses real math,
              generates production code, summarizes anything you paste, speaks aloud,
              and saves conversations to your account so you can return to them later.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/chat"
                className="group flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3.5 text-[15px] font-semibold shadow-xl shadow-violet-950/50 transition-all hover:scale-[1.02] hover:brightness-110"
              >
                Create your account
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#toolbox"
                className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-3.5 text-[15px] font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white"
              >
                <Terminal size={16} />
                See the toolbox
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-10 grid max-w-md grid-cols-3 gap-4"
            >
              {[
                { k: '20+', v: 'local tools' },
                { k: '5', v: 'personas' },
                { k: '100%', v: 'private' },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-2xl font-bold text-white">{s.k}</div>
                  <div className="text-[12px] text-white/40">{s.v}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* orb visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="absolute inset-0 rounded-[32px] bg-violet-500/20 blur-3xl" />
            <img
              src="/images/nexa-orb.png"
              alt="Nexa AI core visualization"
              className="relative w-full rounded-[32px] border border-white/10 object-cover shadow-2xl shadow-violet-950/60"
            />
            <div className="glass float-anim absolute -left-4 top-8 rounded-2xl px-4 py-2.5 shadow-xl sm:-left-8">
              <div className="flex items-center gap-2 text-[12px] text-white/70">
                <Gauge size={13} className="text-cyan-300" />
                <code className="font-mono text-cyan-200">/calc (52×18)+√81</code>
              </div>
              <div className="mt-0.5 font-display text-[15px] font-bold text-white">= 945, instantly</div>
            </div>
            <div
              className="glass float-anim absolute -right-3 bottom-10 rounded-2xl px-4 py-2.5 shadow-xl sm:-right-6"
              style={{ animationDelay: '1.4s' }}
            >
              <div className="flex items-center gap-2 text-[12px] text-white/70">
                <ShieldCheck size={13} className="text-emerald-300" />
                Private by design
              </div>
              <div className="mt-0.5 text-[12px] text-white/45">chats never leave your browser</div>
            </div>
            <div
              className="glass float-anim absolute -bottom-5 left-10 rounded-2xl px-4 py-2.5 shadow-xl"
              style={{ animationDelay: '2.6s' }}
            >
              <div className="flex items-center gap-2 text-[12px] text-white/70">
                <Wand2 size={13} className="text-violet-300" />
                /story a dragon librarian
              </div>
              <div className="mt-0.5 text-[12px] text-white/45">original fiction on demand</div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* marquee */}
      <section id="toolbox" className="relative border-y border-white/5 bg-white/[0.015] py-6">
        <MarqueeRow items={COMMANDS.slice(0, 10)} />
        <MarqueeRow items={COMMANDS.slice(10)} reverse />
      </section>

      {/* features */}
      <section id="features" className="relative mx-auto max-w-6xl px-5 py-24">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-violet-300">
            Special features
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a chatbot does.
            <br />
            <span className="grad-text">Plus everything it doesn't.</span>
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-white/45">
            Nexa runs a real reasoning engine with deterministic tools — so math is exact,
            summaries are faithful, and code actually works.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group rounded-3xl border border-white/8 bg-white/[0.025] p-6 transition-all hover:border-violet-400/30 hover:bg-violet-500/[0.05]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/40 to-cyan-500/30 text-violet-200 transition-transform group-hover:scale-110">
                <f.icon size={19} />
              </div>
              <h3 className="mt-4 font-display text-[16.5px] font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/45">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* compare */}
      <section id="compare" className="relative mx-auto max-w-4xl px-5 pb-24">
        <motion.div {...fadeUp} className="text-center">
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Head to head
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Nexa vs. a typical AI chatbot
          </h2>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="mt-10 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02]"
        >
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.03]">
                <th className="px-5 py-4 font-medium text-white/50">Capability</th>
                <th className="w-28 px-3 py-4 text-center font-medium text-white/50">Typical bot</th>
                <th className="w-28 px-3 py-4 text-center">
                  <span className="grad-text font-display font-bold">Nexa</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 text-white/70">{row.label}</td>
                  <td className="px-3 py-3.5 text-center">
                    <Mark v={row.typical} />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <Mark v={row.nexa} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>

      {/* stack */}
      <section id="stack" className="relative border-t border-white/5 bg-white/[0.015] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              Full stack, ready to ship
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              One engine. <span className="grad-text">Three runtimes.</span>
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-white/45">
              The same dependency-free engine powers the browser fallback, the Vercel
              serverless function and the Node server — deploy anywhere.
            </p>
          </motion.div>

          <div className="mt-12 grid items-stretch gap-4 md:grid-cols-3">
            {[
              {
                icon: Monitor,
                title: 'Frontend',
                tag: 'React 19 + Vite + Tailwind',
                points: ['Streaming chat UI', 'Voice input & TTS', 'Local persistence', 'Markdown + code highlighting'],
              },
              {
                icon: Server,
                title: 'Backend API',
                tag: 'POST /api/chat',
                points: ['Vercel serverless function', 'Node server for Render', 'CORS + health checks', 'SPA static hosting'],
              },
              {
                icon: Cpu,
                title: 'Nexa Engine',
                tag: 'engine/aiEngine.mjs',
                points: ['Safe math parser (no eval)', '16 code templates', 'Extractive summarizer', 'Stories, tools & personas'],
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-3xl border border-white/8 bg-ink/60 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/40 to-cyan-500/30 text-violet-200">
                    <card.icon size={19} />
                  </div>
                  <code className="rounded-md bg-white/5 px-2 py-1 font-mono text-[10.5px] text-white/40">
                    {card.tag}
                  </code>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{card.title}</h3>
                <ul className="mt-3 space-y-2">
                  {card.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-[13px] text-white/50">
                      <Check size={13} className="shrink-0 text-emerald-400/80" />
                      {p}
                    </li>
                  ))}
                </ul>
                {i < 2 && (
                  <ArrowRight
                    size={18}
                    className="absolute -right-3.5 top-1/2 z-10 hidden -translate-y-1/2 text-violet-400 md:block"
                  />
                )}
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <Cloud size={22} className="shrink-0 text-cyan-300" />
              <div>
                <div className="text-[14px] font-semibold">Deploy to Vercel</div>
                <div className="text-[12.5px] text-white/40">
                  Import the repo — the Vite preset builds the frontend and /api becomes a serverless function automatically.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <Layers size={22} className="shrink-0 text-violet-300" />
              <div>
                <div className="text-[14px] font-semibold">Deploy to Render</div>
                <div className="text-[12.5px] text-white/40">
                  render.yaml blueprint included — build runs Vite, start runs node server.mjs. Done.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-4xl px-5 py-24 text-center">
        <motion.div {...fadeUp}>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Ask something <span className="grad-text">a chatbot can't do.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] text-white/45">
            Roll dice, forge a story, compress an essay, generate a palette — then export the whole conversation.
          </p>
          <Link
            to="/chat"
            className="group mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-4 text-[15.5px] font-semibold shadow-xl shadow-violet-950/50 transition-all hover:scale-[1.03] hover:brightness-110"
          >
            <Braces size={17} />
            Open Nexa
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <div className="mt-4 text-[12px] text-white/30">Email verification · Account based conversation history</div>
        </motion.div>
      </section>

      {/* footer */}
      <footer className="relative border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-[12.5px] text-white/35 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-5 w-5" />
            <span className="font-display font-semibold text-white/60">Nexa AI</span>
            <span>· beyond conversation</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Code2 size={13} /> React + TypeScript
            </span>
            <span className="flex items-center gap-1.5">
              <Download size={13} /> Vercel & Render ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
