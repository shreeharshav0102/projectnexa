import { useCallback, useEffect, useRef, useState } from 'react';
import { LogOut, Menu, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EngineResult } from '../../engine/aiEngine.mjs';
import { apiUrl } from '../lib/api';
import type { ChatMessage as ChatMsg, Conversation } from '../lib/types';
import { makeTitle, saveConversations, uid } from '../lib/store';
import { sendToAI } from '../lib/ai';
import { stopSpeaking } from '../lib/speech';
import { cn } from '../lib/utils';
import { Sidebar } from '../components/Sidebar';
import { ChatMessage } from '../components/ChatMessage';
import { Composer } from '../components/Composer';
import { Welcome } from '../components/Welcome';
import { PersonaMenu } from '../components/PersonaMenu';
import { ExportMenu } from '../components/ExportMenu';

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [accountEmail,setAccountEmail]=useState('');
  const [loaded,setLoaded]=useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [persona, setPersona] = useState('nexa');
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backend, setBackend] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const stoppedRef = useRef(false);
  const navigate=useNavigate();

  const active = conversations.find((c) => c.id === activeId) || null;
  const lastAssistantId = [...(active?.messages || [])].reverse().find((m) => m.role === 'assistant')?.id;

  useEffect(() => {
    fetch(apiUrl('/api/auth/me'),{credentials:'include'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>setAccountEmail(d.user.email)).catch(()=>navigate('/login',{replace:true}));
    fetch(apiUrl('/api/conversations'),{credentials:'include'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{setConversations(Array.isArray(d.conversations)?d.conversations:[]);setLoaded(true);}).catch(()=>{setLoaded(true);});
  },[navigate]);
  useEffect(() => {
    if(!loaded)return;
    saveConversations(conversations);
    const timer=window.setTimeout(()=>{void fetch(apiUrl('/api/conversations'),{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversations})});},700);
    return ()=>window.clearTimeout(timer);
  }, [conversations,loaded]);

  // auto-scroll on new content
  const lastContent = active?.messages[active.messages.length - 1]?.content;
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [active?.messages.length, lastContent, activeId]);

  const newChat = useCallback(() => {
    stopSpeaking();
    setActiveId(null);
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        newChat();
      } else if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        document.getElementById('nexa-composer')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [newChat]);

  const patchMessage = useCallback((convId: string, msgId: string, patch: Partial<ChatMsg>) => {
    setConversations((list) =>
      list.map((c) =>
        c.id === convId
          ? {
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)),
            }
          : c
      )
    );
  }, []);

  const runEngine = useCallback(
    async (text: string, convId: string, botId: string, history: { role: string; content: string }[]) => {
      // deliberate beat so the UI breathes, then the real engine call
      await new Promise((r) => setTimeout(r, 450 + Math.random() * 550));
      if (stoppedRef.current) {
        patchMessage(convId, botId, { content: '*Generation stopped.*', status: 'done' });
        setBusy(false);
        return;
      }

      let result: EngineResult;
      try {
        result = await sendToAI({ message: text, persona, history });
        setBackend(result.servedBy || '');
      } catch {
        result = {
          reply: 'Something glitched in my circuits. Give that another try?',
          suggestions: [],
          widget: null,
          intent: 'error',
        };
      }
      if (stoppedRef.current) {
        patchMessage(convId, botId, { content: result.reply, status: 'done', widget: result.widget, suggestions: result.suggestions });
        setBusy(false);
        return;
      }

      // stream the reply token-by-token
      const tokens = result.reply.split(/(\s+)/);
      let i = 0;
      await new Promise<void>((resolve) => {
        const step = () => {
          if (stoppedRef.current) {
            patchMessage(convId, botId, { status: 'done', widget: result.widget, suggestions: result.suggestions });
            resolve();
            return;
          }
          i = Math.min(tokens.length, i + 3);
          const done = i >= tokens.length;
          patchMessage(convId, botId, {
            content: tokens.slice(0, i).join(''),
            status: done ? 'done' : 'streaming',
            ...(done ? { widget: result.widget, suggestions: result.suggestions } : {}),
          });
          if (done) resolve();
          else timerRef.current = window.setTimeout(step, 13 + Math.random() * 22);
        };
        step();
      });
      setBusy(false);
    },
    [patchMessage, persona]
  );

  const send = useCallback(
    async (text: string) => {
      if (busy) return;
      stopSpeaking();
      setBusy(true);
      stoppedRef.current = false;

      const now = Date.now();
      void fetch(apiUrl('/api/search-history'),{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:text})});
      const userMsg: ChatMsg = { id: uid(), role: 'user', content: text, ts: now, status: 'done' };
      const botMsg: ChatMsg = { id: uid(), role: 'assistant', content: '', ts: now + 1, status: 'thinking', persona };
      const history = (active?.messages || [])
        .filter((m) => m.status === 'done' || !m.status)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      let convId = activeId;
      if (!convId || !conversations.some((c) => c.id === convId)) {
        convId = uid();
        const id = convId;
        setActiveId(id);
        setConversations((list) => [
          { id, title: makeTitle(text), persona, messages: [userMsg, botMsg], createdAt: now, updatedAt: now },
          ...list,
        ]);
      } else {
        setConversations((list) =>
          list.map((c) =>
            c.id === convId ? { ...c, updatedAt: now, messages: [...c.messages, userMsg, botMsg] } : c
          )
        );
      }
      await runEngine(text, convId, botMsg.id, history);
    },
    [active, activeId, busy, conversations, persona, runEngine]
  );

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const regenerate = useCallback(() => {
    if (!active || busy) return;
    const msgs = active.messages;
    const lastBot = [...msgs].reverse().find((m) => m.role === 'assistant');
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastBot || !lastUser) return;
    stopSpeaking();
    setBusy(true);
    stoppedRef.current = false;
    patchMessage(active.id, lastBot.id, { content: '', status: 'thinking', widget: null, suggestions: [] });
    const history = msgs
      .filter((m) => m.id !== lastBot.id && m.status === 'done')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));
    void runEngine(lastUser.content, active.id, lastBot.id, history);
  }, [active, busy, patchMessage, runEngine]);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((list) => list.filter((c) => c.id !== id));
      void fetch(apiUrl(`/api/conversations/${encodeURIComponent(id)}`),{method:'DELETE',credentials:'include'});
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  const changePersona = useCallback(
    (id: string) => {
      setPersona(id);
      if (activeId) {
        setConversations((list) => list.map((c) => (c.id === activeId ? { ...c, persona: id } : c)));
      }
    },
    [activeId]
  );

  const selectConversation = useCallback(
    (id: string) => {
      stopSpeaking();
      const conv = conversations.find((c) => c.id === id);
      if (conv) setPersona(conv.persona);
      setActiveId(id);
    },
    [conversations]
  );

  const lastMsg = active?.messages[active.messages.length - 1];
  const suggestions =
    !busy && lastMsg?.role === 'assistant' && lastMsg.status === 'done' ? lastMsg.suggestions || [] : [];

  return (
    <div className="relative flex h-dvh overflow-hidden bg-ink text-white">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-violet-600/12 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/8 blur-[120px]" />
      </div>

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={selectConversation}
        onNew={newChat}
        onDelete={deleteConversation}
        onRename={renameConversation}
      />

      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* header */}
        <header className="flex items-center gap-2 border-b border-white/8 bg-ink/80 px-3 py-2.5 backdrop-blur-xl sm:px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-white/50 hover:bg-white/8 md:hidden"
          >
            <Menu size={17} />
          </button>
          <button
            type="button"
            onClick={newChat}
            title="New chat"
            className="hidden rounded-lg p-2 text-white/50 hover:bg-white/8 sm:block md:hidden"
          >
            <SquarePen size={16} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-medium text-white/85">
              {active ? active.title : 'New conversation'}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/35">
              <span
                className={cn(
                  'inline-block h-1.5 w-1.5 rounded-full',
                  backend === 'browser' ? 'bg-amber-400' : 'bg-emerald-400'
                )}
              />
              {backend === 'browser'
                ? 'In-browser engine (API offline)'
                : backend
                  ? 'Cloud API · /api/chat'
                  : 'Ready'}
            </div>
          </div>

          <PersonaMenu value={persona} onChange={changePersona} />
          <ExportMenu conversation={active} />
          <button type="button" title={`Sign out ${accountEmail}`} onClick={()=>{void fetch(apiUrl('/api/auth/logout'),{method:'POST',credentials:'include'}).finally(()=>window.location.assign('/login'));}} className="rounded-lg p-2 text-white/45 hover:bg-white/8 hover:text-white"><LogOut size={16}/></button>
        </header>

        {/* messages */}
        <div ref={scrollRef} className="scroll-slim flex-1 overflow-y-auto">
          {!active || active.messages.length === 0 ? (
            <Welcome persona={persona} onPersona={changePersona} onPrompt={send} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 py-6">
              {active.messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  isLastAssistant={m.id === lastAssistantId}
                  onRegenerate={regenerate}
                />
              ))}

              {/* smart follow-ups */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 sm:px-14">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12.5px] text-white/55 transition-all hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="h-2" />
            </div>
          )}
        </div>

        {/* composer */}
        <div className="relative z-10 px-3 pb-3 sm:px-6 sm:pb-5">
          <div className="mx-auto max-w-3xl">
            <Composer busy={busy} onSend={send} onStop={stop} />
          </div>
        </div>
      </main>
    </div>
  );
}
