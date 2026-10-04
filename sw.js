// Sube este número cada vez que publiques cambios en GitHub Pages
const VERSION = 'v13';
const CACHE = `office-tracker-${VERSION}`;
const ASSETS = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // POST/PATCH/DELETE a Calendar: directo a la red
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // Google (GIS, Calendar API): sin caché

  // La app (HTML): red primero, así siempre ves la última versión publicada; caché solo sin conexión
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    e.respondWith(
      // no-cache: GitHub Pages manda max-age=600; sin esto el navegador puede servir el HTML viejo hasta 10 minutos
      fetch(req, { cache: 'no-cache' }).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
        return resp;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Íconos y manifest: caché primero y se refresca en segundo plano
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(resp => {
        if (resp.ok) { const clone = resp.clone(); caches.open(CACHE).then(c => c.put(req, clone)); }
        return resp;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
