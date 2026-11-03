
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p=>existsSync(p));
const BASE = process.env.MOBILE_BASE ?? 'http://127.0.0.1:5177';
const route = process.argv[2] ?? '/';
const port = 9400 + (process.pid % 200);

class CDP {
  constructor(ws){ this.ws=ws; this.id=0; this.p=new Map();
    ws.addEventListener('message', ev=>{ const m=JSON.parse(ev.data); if(m.id&&this.p.has(m.id)){const{res,rej}=this.p.get(m.id);this.p.delete(m.id);m.error?rej(new Error(m.error.message)):res(m.result);}});}
  static async conn(u){const ws=new WebSocket(u);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',()=>j(new Error('ws')),{once:true});});return new CDP(ws);}
  send(method,params={},sessionId){const id=++this.id;const pl={id,method,params};if(sessionId)pl.sessionId=sessionId;
    return new Promise((res,rej)=>{this.p.set(id,{res,rej});this.ws.send(JSON.stringify(pl));setTimeout(()=>{if(this.p.has(id)){this.p.delete(id);rej(new Error(method+' timeout'));}},60000);});}
}

const proc = spawn(CHROME, ['--headless=new',`--remote-debugging-port=${port}`,'--user-data-dir=/tmp/uniquelo-breakdown','--no-first-run','--no-default-browser-check','--hide-scrollbars','--force-device-scale-factor=2','about:blank'], {stdio:'ignore'});
let v=null;
for(let i=0;i<100;i++){try{const r=await fetch(`http://127.0.0.1:${port}/json/version`);if(r.ok){v=await r.json();break;}}catch{}await sleep(100);}
if(!v){console.error('no chrome');process.exit(2);}
const cdp = await CDP.conn(v.webSocketDebuggerUrl);
const {targetId} = await cdp.send('Target.createTarget',{url:'about:blank'});
const {sessionId} = await cdp.send('Target.attachToTarget',{targetId,flatten:true});
const send=(m,p)=>cdp.send(m,p,sessionId);
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
await send('Page.navigate',{url:BASE+route});

const SETTLE = `(async()=>{
  const sig=()=>document.body.scrollHeight+'|'+(document.body.innerText||'').length+'|'+document.querySelectorAll('*').length;
  const t0=Date.now(); let last=null,st=0;
  while(Date.now()-t0<12000){const s=sig(); if(s===last)st++;else{st=0;last=s;} if(st>=6&&Date.now()-t0>1200)break; await new Promise(r=>setTimeout(r,150));}
  for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,70));}
  await new Promise(r=>setTimeout(r,600)); window.scrollTo(0,0); await new Promise(r=>setTimeout(r,250));
})()`;
await send('Runtime.evaluate',{expression:SETTLE,awaitPromise:true});

const EXPR = `(()=>{
  const out=[];
  const walk=(el,depth)=>{
    const r=el.getBoundingClientRect();
    if(r.height<70) return;
    const kids=[...el.children].filter(c=>c.getBoundingClientRect().height>70);
    if(kids.length===1 && depth<6){ walk(kids[0],depth+1); return; }
    const t=(el.innerText||'').replace(/\\s+/g,' ').trim();
    out.push({top:Math.round(r.top+window.scrollY),h:Math.round(r.height),words:t.split(' ').filter(Boolean).length,imgs:el.querySelectorAll('img').length,cls:String(el.className).slice(0,40),head:t.slice(0,58)});
  };
  walk(document.querySelector('main')||document.body,0);
  out.sort((a,b)=>a.top-b.top);
  return {out,total:document.body.scrollHeight,words:(document.querySelector('main')||document.body).innerText.split(/\\s+/).filter(Boolean).length};
})()`;
const {result} = await send('Runtime.evaluate',{expression:EXPR,returnByValue:true});
const d = result.value;
console.log('route', route, '| total', d.total+'px', '= '+(d.total/844).toFixed(2)+' screens | words', d.words);
console.log('top'.padStart(6),'height'.padStart(7),'words'.padStart(6),'imgs'.padStart(5),' section');
for(const s of d.out){ console.log(String(s.top).padStart(6),String(s.h).padStart(7),String(s.words).padStart(6),String(s.imgs).padStart(5),' ',s.head); }
proc.kill('SIGKILL');
process.exit(0);
