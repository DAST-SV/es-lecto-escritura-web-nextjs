/**
 * PWA Service Worker Registration + Native App Enhancements
 * @file src/presentation/components/PWARegister.tsx
 * @description Registra el service worker, detecta standalone mode,
 * y aplica mejoras para experiencia nativa
 */

'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ============================================
    // 1. REGISTRAR SERVICE WORKER
    // ============================================
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[PWA] Service Worker registrado:', registration.scope);

            // Verificar actualizaciones cada hora
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);

            // Notificar al usuario cuando hay una actualización disponible
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;

              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                  // Nueva versión disponible — reload silencioso
                  console.log('[PWA] Nueva versión disponible');
                }
              });
            });
          })
          .catch((error) => {
            console.error('[PWA] Error registrando Service Worker:', error);
          });
      });
    }

    // ============================================
    // 2. DETECTAR STANDALONE MODE (PWA instalada)
    // ============================================
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      document.documentElement.classList.add('pwa-standalone');
      console.log('[PWA] Ejecutando en modo standalone (app instalada)');
    }

    // Escuchar cambios de display mode (por si se instala durante la sesión)
    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('pwa-standalone');
      }
    };
    displayModeQuery.addEventListener('change', handleDisplayModeChange);

    // ============================================
    // 3. PREVENIR PULL-TO-REFRESH EN PWA
    // ============================================
    if (isStandalone) {
      let touchStartY = 0;

      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };

      const handleTouchMove = (e: TouchEvent) => {
        const touchY = e.touches[0].clientY;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

        // Prevenir pull-to-refresh solo cuando está arriba del todo
        if (scrollTop <= 0 && touchY > touchStartY) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        displayModeQuery.removeEventListener('change', handleDisplayModeChange);
      };
    }

    return () => {
      displayModeQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  return null;
}
