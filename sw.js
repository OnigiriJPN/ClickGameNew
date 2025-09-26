const cacheName = 'clicker-game-New';
const filesToCache = ['./','./index.html','./style.css','./main.js','./click.mp3','./slot.mp3'];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(filesToCache))
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request))
    );
});
