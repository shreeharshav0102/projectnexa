import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { apiUrl } from '../lib/api';

export default function Auth() {
  const [mode,setMode]=useState<'login'|'signup'>('signup');
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [code,setCode]=useState('');
  const [sent,setSent]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [notice,setNotice]=useState('');
  async function post(path:string,body:unknown) {
    const r=await fetch(apiUrl(path),{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(body)});
    const raw=await r.text();
    let d:{error?:string;message?:string}={};
    try { if(raw) d=JSON.parse(raw); } catch {}
    if(!r.ok) throw new Error(d.error||`The server returned an empty or invalid reply (HTTP ${r.status}). Check that the API server is running.`);
    if(!raw) throw new Error('The API returned an empty reply. Start the API server and try again.');
    if(!d||typeof d!=='object') throw new Error('The API returned an invalid reply.');
    return d;
  }
  async function sendCode(){setError('');setNotice('');setBusy(true);try{const d=await post('/api/auth/send-code',{email,purpose:mode});setSent(true);setNotice(d.message||'Verification code sent.');}catch(e){setError(e instanceof Error?e.message:'Unable to send code');}finally{setBusy(false);}}
  async function submit(e:FormEvent){e.preventDefault();setError('');setBusy(true);try{await post(`/api/auth/${mode}`,{email,password,code});window.location.assign('/chat');}catch(e){setError(e instanceof Error?e.message:'Unable to sign in');}finally{setBusy(false);}}
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-10 text-white"><div className="pointer-events-none absolute inset-0 grid-bg opacity-60"/><div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-panel/90 p-7 shadow-2xl shadow-violet-950/30 sm:p-9"><Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><ArrowLeft size={15}/> Back to Nexa</Link><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200"><Sparkles size={22}/></div><h1 className="font-display text-3xl font-bold">{mode==='signup'?'Create your account':'Welcome back'}</h1><p className="mt-2 text-sm leading-relaxed text-white/45">Use your email and a one-time code to {mode==='signup'?'create':'access'} your Nexa account. Your chats are saved to your account.</p>
    <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-xs font-medium text-white/60">Email address<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-violet-400/60" placeholder="you@example.com"/></label>
    <div className="flex gap-2"><label className="min-w-0 flex-1 text-xs font-medium text-white/60">6-digit email code<input required inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm tracking-[0.3em] outline-none focus:border-violet-400/60" placeholder="000000"/></label><button type="button" disabled={!email||busy} onClick={sendCode} className="mt-6 shrink-0 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 text-xs font-semibold text-violet-200 disabled:opacity-40">{busy?'Please wait':sent?'Send again':'Email code'}</button></div>
    <label className="block text-xs font-medium text-white/60">Password<input required type="password" minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-violet-400/60" placeholder="At least 8 characters"/></label>
    {error&&<p role="alert" className="text-sm text-rose-300">{error}</p>}{notice&&<p className="text-sm text-emerald-300">{notice}</p>}
    <button disabled={busy||!sent} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-3 text-sm font-semibold disabled:opacity-40"><ShieldCheck size={16}/>{busy?'Please wait…':mode==='signup'?'Create account':'Sign in'}</button></form>
    <p className="mt-6 text-center text-sm text-white/45">{mode==='signup'?'Already have an account?':'New to Nexa?'} <button onClick={()=>{setMode(mode==='signup'?'login':'signup');setSent(false);setError('');setNotice('');}} className="font-semibold text-cyan-300 hover:text-cyan-200">{mode==='signup'?'Sign in':'Create account'}</button></p></div></main>;
}
