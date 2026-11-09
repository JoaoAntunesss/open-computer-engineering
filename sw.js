/* Service worker: permite instalar o site como app e abri-lo sem rede.
   Ficheiros do site: rede primeiro (vês sempre a versão mais recente), cache se estiveres offline.
   Bibliotecas externas com versão fixa (Three.js, fontes, Pyodide): cache primeiro, porque nunca mudam. */
const CACHE = 'eia-v1';
const SHELL = ['./', 'index.html', 'style.css', 'manifest.webmanifest', 'js/data.js', 'js/data2.js', 'js/data3.js', 'js/data4.js', 'js/data5.js', 'js/lessons.js', 'js/app.js', 'js/placa.js', 'js/placa3d.js', 'js/rede.js', 'icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const pinned = /cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.hostname);
  if (u.origin === location.origin) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
  } else if (pinned) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })));
  }
});
