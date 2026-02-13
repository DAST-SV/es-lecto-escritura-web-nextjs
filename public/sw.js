/**
 * Service Worker para Eslectoescritura PWA
 * @file public/sw.js
 * @description Maneja cache, offline fallback y estrategias de caching
 */

const CACHE_NAME = 'eslecto-v1';
const OFFLINE_URL = '/offline';

// Recursos estáticos que se cachean al instalar
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ============================================
// INSTALL — pre-cache de recursos esenciales
// ============================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cachear recursos esenciales (sin fallar si alguno falla)
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to cache ${url}:`, err);
          })
        )
      );
    })
  );
  // Activar inmediatamente sin esperar
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
  // Tomar control de todos los clientes inmediatamente
  self.clients.claim();
});

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
  if (url.pathname.includes('_next/webpack-hmr') ||
      url.pathname.includes('__nextjs') ||
      url.pathname.includes('_next/static/development')) return;

  // Estrategia: Network First para páginas HTML
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Guardar en cache si es exitoso
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Si falla la red, intentar cache
          const cached = await caches.match(request);
          if (cached) return cached;
          // Si no hay cache, mostrar offline page
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;
          // Fallback absoluto
          return new Response(
            '<!DOCTYPE html><html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#60a5fa;color:white"><div style="text-align:center"><h1>Sin conexión</h1><p>Revisa tu conexión a internet</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

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
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Para todo lo demás: Network First con fallback a cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
