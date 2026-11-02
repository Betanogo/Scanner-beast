const CACHE='scanline-v4';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const SMALL_LIBS=['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
const BIG_LIBS=['https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.10.0-release.1/dist/opencv.js'];   // cached on first use (about 10 MB)
const LIBS=SMALL_LIBS.concat(BIG_LIBS);
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await c.addAll(SHELL);
    for(const u of SMALL_LIBS){ try{ await c.add(new Request(u,{mode:'no-cors'})); }catch(err){} }
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k!==CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  const same=url.origin===location.origin, lib=LIBS.includes(req.url);
  if(!same&&!lib) return;                                   // fonts etc: plain network
  const isPage=req.mode==='navigate'||(same&&(url.pathname.endsWith('/')||url.pathname.endsWith('index.html')));
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    if(isPage){                                             // always try for the newest app first, fall back offline
      try{ const r=await fetch(req); if(r&&r.ok) c.put('./index.html',r.clone()); return r; }
      catch(err){ return (await c.match('./index.html'))||(await c.match('./'))||Response.error(); }
    }
    const hit=await c.match(req,{ignoreSearch:true});
    const net=fetch(req).then(r=>{ if(r&&(r.ok||r.type==='opaque')) c.put(req,r.clone()); return r; }).catch(()=>null);
    if(hit){ e.waitUntil(net); return hit; }
    return (await net)||Response.error();
  })());
});
