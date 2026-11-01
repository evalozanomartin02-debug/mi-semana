const CACHE = 'mi-semana-v1';
const BASE = ['./', 'index.html', 'estilos.css', 'app.js', 'manifest.webmanifest', 'iconos/icono-180.png', 'iconos/icono-192.png', 'iconos/icono-512.png', 'data/indice.json'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Primero la red, para tener siempre la última versión; si falla o tarda, lo guardado.
self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  evento.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const red = fetch(request).then((respuesta) => {
      if (respuesta.ok) cache.put(request, respuesta.clone());
      return respuesta;
    });
    const tiempo = new Promise((resolver) => setTimeout(resolver, 3500));
    const rapida = await Promise.race([red.catch(() => null), tiempo]);
    if (rapida) return rapida;
    const guardada = await cache.match(request, { ignoreSearch: true })
      ?? (request.mode === 'navigate' ? await cache.match('index.html') : undefined);
    return guardada ?? red;
  })());
});
