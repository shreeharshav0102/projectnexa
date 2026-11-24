import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { randomInt, randomUUID, createHash } from 'node:crypto';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateReply } from './engine/aiEngine.mjs';

const root = path.dirname(url.fileURLToPath(import.meta.url));
const DIST = path.join(root, 'dist');
const PORT = process.env.PORT || 3001;
const COOKIE = 'nexa_session';
const MIME = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8' };
let mongoPromise;
async function db() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in your .env file');
  if (!mongoPromise) {
    const client = new MongoClient(process.env.MONGODB_URI);
    mongoPromise = client.connect().then(() => client).catch(async (error) => {
      mongoPromise = undefined;
      await client.close().catch(() => {});
      throw error;
    });
  }
  const client = await mongoPromise;
  return client.db(process.env.MONGODB_DB || 'nexa_ai');
}
const json = (res, status, data, headers={}) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', ...headers}); res.end(JSON.stringify(data)); };
function readBody(req) { return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>2_000_000){reject(new Error('Request too large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'));}catch{reject(new Error('Invalid JSON'));}});req.on('error',reject);}); }
function session(req) { const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1); if(!token||!process.env.SESSION_SECRET) return null; try{return jwt.verify(decodeURIComponent(token),process.env.SESSION_SECRET);}catch{return null;} }
const cookie = (token, maxAge) => `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${process.env.NODE_ENV==='production'?'; Secure':''}`;
const digest = (s) => createHash('sha256').update(s).digest('hex');
async function api(req,res,u) {
  if (u.pathname==='/api/health') return json(res,200,{ok:true,service:'nexa-ai',time:new Date().toISOString()});
  const database=await db();
  if (req.method==='POST' && u.pathname==='/api/auth/send-code') {
    const {email,purpose}=await readBody(req); const address=String(email||'').trim().toLowerCase();
    if(!/^\S+@\S+\.\S+$/.test(address)||!['signup','login'].includes(purpose)) return json(res,400,{error:'Enter a valid email and choose signup or login.'});
    if(purpose==='signup' && await database.collection('users').findOne({email:address})) return json(res,409,{error:'An account already exists. Choose login.'});
    if(purpose==='login' && !await database.collection('users').findOne({email:address})) return json(res,404,{error:'No account found for this email. Choose signup.'});
    const code=String(randomInt(100000,1000000));
    await database.collection('email_codes').updateOne({email:address,purpose},{$set:{email:address,purpose,codeHash:digest(code),expiresAt:new Date(Date.now()+10*60_000),createdAt:new Date()}},{upsert:true});
    if(!process.env.GMAIL_USER||!process.env.GMAIL_APP_PASSWORD) return json(res,503,{error:'Email delivery is not configured. Add Gmail settings to .env.'});
    const transport=nodemailer.createTransport({service:'gmail',auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD}});
    await transport.sendMail({from:`Nexa AI <${process.env.GMAIL_USER}>`,to:address,subject:'Your Nexa AI verification code',text:`Your Nexa AI verification code is ${code}. It expires in 10 minutes.`});
    return json(res,200,{ok:true,message:'Verification code sent.'});
  }
  if(req.method==='POST' && ['/api/auth/signup','/api/auth/login'].includes(u.pathname)) {
    const data=await readBody(req); const address=String(data.email||'').trim().toLowerCase(); const purpose=u.pathname.endsWith('signup')?'signup':'login';
    if(!/^\S+@\S+\.\S+$/.test(address)||!/^\d{6}$/.test(String(data.code||''))) return json(res,400,{error:'Enter the email and 6-digit code.'});
    const codes=database.collection('email_codes'); const row=await codes.findOne({email:address,purpose,expiresAt:{$gt:new Date()}});
    if(!row||row.codeHash!==digest(String(data.code))) return json(res,400,{error:'Code is invalid or expired. Request a new one.'});
    await codes.deleteOne({_id:row._id});
    let user;
    if(purpose==='signup') {
      const password=String(data.password||''); if(password.length<8) return json(res,400,{error:'Password must be at least 8 characters.'});
      if(await database.collection('users').findOne({email:address})) return json(res,409,{error:'Account already exists. Log in instead.'});
      user={_id:randomUUID(),email:address,passwordHash:await bcrypt.hash(password,12),createdAt:new Date()}; await database.collection('users').insertOne(user);
    } else {
      user=await database.collection('users').findOne({email:address});
      if(!user||!await bcrypt.compare(String(data.password||''),user.passwordHash)) return json(res,401,{error:'Incorrect password.'});
    }
    if(!process.env.SESSION_SECRET) return json(res,503,{error:'Set SESSION_SECRET in .env before signing in.'});
    const token=jwt.sign({sub:user._id,email:user.email},process.env.SESSION_SECRET,{expiresIn:'7d'});
    return json(res,200,{user:{email:user.email}},{'Set-Cookie':cookie(token,7*24*3600)});
  }
  if(req.method==='GET'&&u.pathname==='/api/auth/me') { const s=session(req); if(!s) return json(res,401,{error:'Not signed in'}); return json(res,200,{user:{email:s.email}}); }
  if(req.method==='POST'&&u.pathname==='/api/auth/logout') return json(res,200,{ok:true},{'Set-Cookie':cookie('',0)});
  const s=session(req); if(!s) return json(res,401,{error:'Please sign in.'});
  const userId=String(s.sub);
  if(req.method==='GET'&&u.pathname==='/api/conversations') { const rows=await database.collection('conversations').find({userId}).sort({updatedAt:-1}).limit(100).toArray(); return json(res,200,{conversations:rows.map(({_id,...x})=>x)}); }
  if(req.method==='PUT'&&u.pathname==='/api/conversations') { const {conversations}=await readBody(req); if(!Array.isArray(conversations)) return json(res,400,{error:'conversations must be an array'}); const col=database.collection('conversations'); const ops=conversations.slice(0,100).filter(c=>c?.id&&Array.isArray(c.messages)).map(c=>({updateOne:{filter:{userId,id:String(c.id)},update:{$set:{userId,id:String(c.id),title:String(c.title||'New chat').slice(0,120),persona:String(c.persona||'nexa'),messages:c.messages.slice(-500),createdAt:Number(c.createdAt)||Date.now(),updatedAt:Number(c.updatedAt)||Date.now()}},upsert:true}})); if(ops.length) await col.bulkWrite(ops); return json(res,200,{ok:true}); }
  if(req.method==='DELETE'&&u.pathname.startsWith('/api/conversations/')) { const id=decodeURIComponent(u.pathname.split('/').pop()||''); await database.collection('conversations').deleteOne({userId,id}); return json(res,200,{ok:true}); }
  if(req.method==='POST'&&u.pathname==='/api/search-history') { const {query}=await readBody(req); const value=String(query||'').trim().slice(0,2000); if(value) await database.collection('search_history').insertOne({userId,query:value,createdAt:new Date()}); return json(res,200,{ok:true}); }
  if(req.method==='GET'&&u.pathname==='/api/search-history') { const items=await database.collection('search_history').find({userId},{projection:{query:1,createdAt:1}}).sort({createdAt:-1}).limit(100).toArray(); return json(res,200,{items:items.map(({query,createdAt})=>({query,createdAt}))}); }
  if(req.method==='POST'&&u.pathname==='/api/chat') { const d=await readBody(req); if(!d.message||typeof d.message!=='string') return json(res,400,{error:'Message required'}); const out=generateReply({message:d.message.slice(0,8000),persona:typeof d.persona==='string'?d.persona:'nexa',history:Array.isArray(d.history)?d.history.slice(-12):[]}); return json(res,200,{...out,servedBy:'node-server'}); }
  return json(res,404,{error:'Not found'});
}
const server=http.createServer(async(req,res)=>{const u=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);if(u.pathname.startsWith('/api/')){try{await api(req,res,u);}catch(e){console.error(e);json(res,500,{error:e.message||'Server error'});}return;}let file=path.normalize(path.join(DIST,decodeURIComponent(u.pathname)));if(!file.startsWith(DIST)){res.writeHead(403);return res.end('Forbidden');}if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(DIST,'index.html');const ext=path.extname(file).toLowerCase();res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);});
server.listen(PORT,()=>console.log(`Nexa AI server listening on http://localhost:${PORT}`));
