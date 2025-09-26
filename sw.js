const cacheName='clicker-game-v1';
const filesToCache=['./','./index.html','./style.css','./main.js','./click.mp3','./slot.mp3'];

self.addEventListener('install',e=>{e.waitUntil(caches.open(cacheName).then(c=>c.addAll(filesToCache)))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
