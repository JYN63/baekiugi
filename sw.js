// 배키우기 사이트 서비스 워커 (W 웹 알파): 홈 화면 설치 · 끊기면 마지막 판 열기. 언제나 인터넷 먼저 (새 버전이 바로 옴).
const CACHE = 'baekiugi-v1';
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'])).catch(() => undefined));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // 영상(clips)·version.json은 그냥 인터넷으로 (크고, 늘 새 것)
  if (url.pathname.includes('/clips/') || url.pathname.endsWith('version.json')) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.mode === 'navigate' || /\.(html|png|webmanifest)$/.test(url.pathname))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req.mode === 'navigate' ? './index.html' : req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req.mode === 'navigate' ? './index.html' : req).then((r) => r || Response.error())),
  );
});
