// 雀 (Que) PWA Service Worker
const CACHE_NAME = 'que-pwa-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/que.png',
  '/icon-192.png',
  '/icon-512.png'
];

// 安装时缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Core asset caching error (non-fatal):', err);
      });
    })
  );
  self.skipWaiting();
});

// 激活时清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求：对静态资源和应用外壳采用缓存优先/回退网络，对音频流和外部API直接放行
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 跳过音频流、外部大模型 API、以及非 GET 请求
  if (
    event.request.method !== 'GET' ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.m3u8') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('openai') ||
    url.hostname.includes('radio-browser') ||
    url.hostname.includes('colormind')
  ) {
    return;
  }

  // 页面导航请求优先尝试网络，离线时回退到已缓存的 index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 其他静态静态文件与脚本：Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
