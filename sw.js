/* 计算机组成原理刷题 PWA —— Service Worker
 * install 时预缓存全部外壳与 27 章题目数据，首访后完全离线可用；
 * 同源 GET 请求采用「缓存优先，网络回退并回填缓存」策略。
 */
const CACHE_VERSION = 'jzyl-v1';
const CHAPTER_COUNT = 27;

const CORE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.webmanifest',
  './data/chapters.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
];
const PRECACHE = CORE_ASSETS.concat(
  Array.from({ length: CHAPTER_COUNT }, (_, i) => `./data/ch${i}.json`)
);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    // 单文件失败不阻断整体安装（例如图标缺失）
    await Promise.all(PRECACHE.map(async (url) => {
      try { await cache.add(url); } catch (e) { console.warn('预缓存失败:', url, e); }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: false });
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.status === 200 && fresh.type === 'basic') {
        const cache = await caches.open(CACHE_VERSION);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      // 离线且未缓存导航请求时回退到首页
      if (req.mode === 'navigate') {
        const fallback = await caches.match('./index.html');
        if (fallback) return fallback;
      }
      throw e;
    }
  })());
});
