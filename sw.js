var CACHE = 'consulta-v01';
var ARCHIVOS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  // cache: 'reload' obliga a bajar los archivos nuevos del servidor, no de la caché del navegador
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(ARCHIVOS.map(function (a) { return new Request(a, { cache: 'reload' }); }));
  }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return; // los datos viven en IndexedDB, no aquí
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(function (r) {
      var copia = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      return r;
    }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); }); })
  );
});
