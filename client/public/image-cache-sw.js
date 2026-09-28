/* Public image bytes only. No HTML, API, authentication, or volunteer documents. */
const IMAGE_CACHE = "moonlit-public-images-v1";
const MAX_IMAGES = 100;
const MAX_BYTES = 50 * 1024 * 1024;
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const downloads = new Map();
let writes = Promise.resolve();
function allowedImage(request) {
  if(request.method !== "GET" || request.destination !== "image") return false;
  const url = new URL(request.url);
  if(url.origin === self.location.origin) return /^\/(images|instagram)\//.test(url.pathname);
  return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && /\/image\/upload\/(?:[^/]+\/)*moonlit\/(website|events)\//.test(url.pathname);
}
self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith("moonlit-public-images-")&&key!==IMAGE_CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));
async function trim(cache) {
  const keys=await cache.keys();let bytes=0,count=0;
  // Insertion order: remove older photos first when the size/count bound is reached.
  for(const key of keys.reverse()) {
    const response=await cache.match(key);
    const size=Number(response?.headers.get("x-mf-bytes")||0);
    if(++count>MAX_IMAGES || bytes+size>MAX_BYTES || Date.now()-Number(response?.headers.get("x-mf-cached-at")||0)>MAX_AGE) await cache.delete(key);
    else bytes+=size;
  }
}
async function imageResponse(request) {
  let cache;
  try {
    cache=await caches.open(IMAGE_CACHE);
    const hit=await cache.match(request.url);
    if(hit && Date.now()-Number(hit.headers.get("x-mf-cached-at")||0)<MAX_AGE) return hit;
  } catch { /* Private browsing/quota restrictions must not break images. */ }
  if(downloads.has(request.url)) return (await downloads.get(request.url)).clone();
  const download=(async()=>{
    let response;
    try { response=await fetch(request.url,{mode:"cors",credentials:"omit",cache:"force-cache"}); }
    catch { return fetch(request); }
    if(!cache || !response.ok || !/^image\//i.test(response.headers.get("content-type")||"")) return response;
    const bytes=await response.clone().arrayBuffer();
    if(bytes.byteLength>5*1024*1024) return response;
    const headers=new Headers(response.headers);
    headers.set("x-mf-cached-at",String(Date.now()));headers.set("x-mf-bytes",String(bytes.byteLength));
    const stored=new Response(bytes,{status:200,headers});
    writes=writes.catch(()=>{}).then(async()=>{await cache.put(request.url,stored);await trim(cache);}).catch(()=>{});
    await writes;
    return response;
  })();
  downloads.set(request.url,download);
  try{return (await download).clone();}finally{downloads.delete(request.url);}
}
self.addEventListener("fetch",event=>{
  if(allowedImage(event.request)) event.respondWith(imageResponse(event.request));
});
