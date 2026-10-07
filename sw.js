/* 六爻排盘 PWA Service Worker
 * 缓存优先（cache-first）：页面纯静态，算法全在 index.html 内，离线可完整排盘。
 * 更新方式：页面或资源变更时，把 VERSION 递增（如 v2），旧缓存自动清理。
 */
const VERSION = 'v2';
const CACHE = 'liuyao-paipan-' + VERSION;
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((resp) => {
        // 同源成功响应进缓存
        if (resp && resp.ok && new URL(req.url).origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return resp;
      }).catch(() => {
        // 离线兜底：导航请求回退到缓存的首页
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
