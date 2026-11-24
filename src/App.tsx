import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';

const Chat = lazy(() => import('./pages/Chat'));

function ChatLoader() {
  return (
    <div className="flex h-dvh items-center justify-center bg-ink">
      <div className="flex flex-col items-center gap-4">
        <img src="/favicon.svg" alt="" className="h-12 w-12 animate-pulse" />
        <div className="text-[13px] text-white/40">Warming up the engine...</div>
      </div>
    </div>
  );
}

export default function App() {
  const [signedIn,setSignedIn]=useState<boolean|null>(null);
  useEffect(()=>{fetch('/api/auth/me',{credentials:'include'}).then(r=>setSignedIn(r.ok)).catch(()=>setSignedIn(false));},[]);
  const protectedChat=signedIn===null?<ChatLoader/>:signedIn?<Suspense fallback={<ChatLoader/>}><Chat/></Suspense>:<Navigate to="/login" replace/>;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={signedIn?<Navigate to="/chat" replace/>:<Auth/>} />
        <Route path="/chat" element={protectedChat} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
