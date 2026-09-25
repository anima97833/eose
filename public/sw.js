// 雀 (Que) PWA Service Worker
const CACHE_NAME = 'que-pwa-v2';

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

// 拦截请求：仅拦截本站同源静态资源与页面，所有第三方与跨域外部API直接放行，绝不拦截！
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. 严格跳过所有非同源外部请求（交给浏览器网络栈原生处理，防止拦截产生 CORS 或 undefined Response 报错）
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. 跳过非 GET 请求、音频流、以及后端本地代理接口
  if (
    event.request.method !== 'GET' ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.m3u8') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // 3. 页面导航请求优先尝试网络，离线时回退到已缓存的 index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html').then((res) => res || new Response('Offline', { status: 503 }));
      })
    );
    return;
  }

  // 4. 本地静态文件与脚本：Stale-While-Revalidate，安全兜底绝不返回 undefined
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
        .catch(() => {
          return cachedResponse || new Response('Asset unavailable', { status: 404 });
        });

      return cachedResponse || fetchPromise;
    })
  );
});
