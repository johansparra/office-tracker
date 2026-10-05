// Sube este número cada vez que publiques cambios en GitHub Pages (y APP_VER en js/config.js)
const VERSION = 'v15';
const CACHE = `office-tracker-${VERSION}`;
// Si agregas un archivo .js o .css a index.html, agrégalo aquí también (para que la app abra sin internet)
const JS = ['config','utilidades','festivos','meta','almacenamiento','auditoria','google-auth','google-calendar',
  'google-sheets','firebase','sincronizacion','cambios','aviso','historial-dia','render','movimiento','app'];
const ASSETS = ['./','./index.html','./css/styles.css',...JS.map(f=>`./js/${f}.js`),'./manifest.json','./icon-192.png','./icon-512.png'];

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

  // La app (HTML, JS y CSS): red primero, así siempre ves la última versión publicada y nunca se mezcla
  // HTML nuevo con JS viejo; caché solo sin conexión
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || /\.(html|js|css)$/.test(url.pathname)) {
    e.respondWith(
      // no-cache: GitHub Pages manda max-age=600; sin esto el navegador puede servir archivos viejos hasta 10 minutos
      fetch(req, { cache: 'no-cache' }).then(resp => {
        if (resp.ok) { const clone = resp.clone(); caches.open(CACHE).then(c => c.put(req, clone)); }
        return resp;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : r)))
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
