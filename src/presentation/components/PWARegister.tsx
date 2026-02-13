/**
 * PWA Service Worker Registration
 * @file src/presentation/components/PWARegister.tsx
 * @description Registra el service worker y maneja actualizaciones
 */

'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Registrar service worker después de que la página cargue
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[PWA] Service Worker registrado:', registration.scope);

            // Verificar actualizaciones periódicamente (cada hora)
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            console.error('[PWA] Error registrando Service Worker:', error);
          });
      });
    }
  }, []);

  return null;
}
