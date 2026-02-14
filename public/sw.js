/**
 * Service Worker para Eslectoescritura PWA
 * @file public/sw.js
 * @description Maneja cache, offline fallback y estrategias de caching
 */

const CACHE_NAME = 'eslecto-v5';
const OFFLINE_URL = '/offline.html';

// Recursos esenciales a pre-cachear
const PRECACHE_ASSETS = [
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ============================================
// INSTALL — pre-cache de recursos esenciales
// ============================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to cache ${url}:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// ============================================
// ACTIVATE — limpiar caches viejos
// ============================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ============================================
// Respuesta offline HTML
// ============================================
async function getOfflineResponse() {
  // 1. Intentar la página offline cacheada
  const offlinePage = await caches.match(OFFLINE_URL);
  if (offlinePage) return offlinePage;

  // 2. Fallback inline mínimo
  return new Response(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;box-sizing:border-box}html,body{height:100%}body{min-height:100vh;display:flex;justify-content:center;align-items:center;background:linear-gradient(135deg,#60a5fa,#3b82f6);font-family:sans-serif;color:#fff;text-align:center;padding:2rem}.icon{font-size:5rem;margin-bottom:1.5rem}.btn{margin-top:1.5rem;padding:14px 32px;font-size:1rem;font-weight:800;background:#fbbf24;color:#1e40af;border:3px solid #fff;border-radius:50px;cursor:pointer}</style></head><body><div><div class="icon">📚</div><button class="btn" onclick="location.reload()">&#x1F504;</button></div></body></html>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

// ============================================
// FETCH — estrategias de caching
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests GET
  if (request.method !== 'GET') return;

  // Ignorar requests de extensiones del browser
  if (!url.protocol.startsWith('http')) return;

  // Ignorar requests a Supabase API (siempre fresh)
  if (url.hostname.includes('supabase')) return;

  // Ignorar requests de hot-reload en desarrollo
  if (
    url.pathname.includes('_next/webpack-hmr') ||
    url.pathname.includes('__nextjs') ||
    url.pathname.includes('_next/static/development')
  ) return;

  // Estrategia: Cache First para assets estáticos (JS, CSS, fonts, images)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|svg|gif|webp|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Estrategia: Network First para páginas HTML
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // 1. Intentar la URL exacta en cache
          const cached = await caches.match(request);
          if (cached) return cached;

          // 2. Servir offline page
          return getOfflineResponse();
        })
    );
    return;
  }

  // Para todo lo demás: Network First con fallback a cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
