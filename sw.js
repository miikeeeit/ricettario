/* Service worker: tiene l'app disponibile anche senza internet.
   Cambia VERSIONE a ogni aggiornamento dei file, così il telefono scarica la nuova. */
const VERSIONE = "ricettario-v2";
const FILE = ["./", "index.html", "store.js", "seed.json", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSIONE && k !== "font").map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if(e.request.method !== "GET") return;
  // Font di Google: prima la copia salvata, poi la rete
  if(url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    e.respondWith(caches.open("font").then(async c => {
      const hit = await c.match(e.request); if(hit) return hit;
      const r = await fetch(e.request); if(r.ok || r.type === "opaque") c.put(e.request, r.clone()); return r;
    }));
    return;
  }
  if(url.origin !== location.origin) return;
  // File dell'app: prima la rete (così prendi gli aggiornamenti), senza rete la copia salvata
  e.respondWith(fetch(e.request).then(r => {
    if(r.ok){ const copy = r.clone(); caches.open(VERSIONE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(hit => hit || caches.match("index.html"))));
});
