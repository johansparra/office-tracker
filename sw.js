// Sube este número cada vez que publiques cambios en GitHub Pages (y APP_VER en js/nucleo/constantes.js)
const VERSION = 'v18';
const CACHE = `office-tracker-${VERSION}`;
// Todos los módulos de js/: si agregas un archivo, súmalo aquí (para que la app abra sin internet).
// La prueba tests/estructura.test.mjs falla si falta alguno.
const JS = [
  'app',
  'nucleo/constantes','nucleo/fechas','nucleo/festivos','nucleo/meta','nucleo/marcado','nucleo/avisos','nucleo/conflictos','nucleo/registro',
  'estado/estado','estado/almacenamiento',
  'adaptadores/errores','adaptadores/aleatorio','adaptadores/google-api','adaptadores/google-auth','adaptadores/google-calendar','adaptadores/google-sheets','adaptadores/firestore',
  'funcionalidades/mes/vista','funcionalidades/mes/navegacion','funcionalidades/marcar-dia/marcar',
  'funcionalidades/avisos/programar','funcionalidades/avisos/enlace',
  'funcionalidades/historial/registro','funcionalidades/historial/tarjeta','funcionalidades/historial/historial-dia',
  'funcionalidades/conexion/sesion','funcionalidades/conexion/tarjeta',
  'funcionalidades/sincronizacion/sincronizar','funcionalidades/sincronizacion/reconciliar','funcionalidades/sincronizacion/tiempo-real',
  'ui/render','ui/iconos','ui/movimiento',
];
const ASSETS = ['./','./index.html','./css/styles.css',...JS.map(f=>`./js/${f}.js`),'./manifest.json','./img/icon-192.png','./img/icon-512.png'];

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
        if (resp.ok) { const clone = resp.clone(); caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {}); }   // caché llena o bloqueada: la app igual responde
        return resp;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : r)))
    );
    return;
  }

  // Íconos y manifest: caché primero y se refresca en segundo plano
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(resp => {
        if (resp.ok) { const clone = resp.clone(); caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {}); }
        return resp;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
