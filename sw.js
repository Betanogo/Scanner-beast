const CACHE='scanline-v3';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const LIBS=['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await c.addAll(SHELL);
    for(const u of LIBS){ try{ await c.add(new Request(u,{mode:'no-cors'})); }catch(err){} }
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
  if(!same&&!lib) return;               // fonts etc: normal network
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const hit=await c.match(req,{ignoreSearch:true});
    const net=fetch(req).then(r=>{ if(r&&(r.ok||r.type==='opaque')) c.put(req,r.clone()); return r; }).catch(()=>null);
    if(hit){ e.waitUntil(net); return hit; }   // cache first, refresh in background
    const r=await net;
    return r||(req.mode==='navigate'?c.match('./index.html'):Response.error());
  })());
});
