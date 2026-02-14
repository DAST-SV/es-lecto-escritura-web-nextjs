/**
 * PWA Service Worker Registration + Native App Enhancements
 * @file src/presentation/components/PWARegister.tsx
 * @description Registra el service worker, maneja install prompt,
 * detecta standalone mode y aplica mejoras para experiencia nativa
 */

'use client';

import { useEffect } from 'react';

// Variable global para almacenar el evento de instalación
let deferredInstallPrompt: Event | null = null;

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ============================================
    // 1. REGISTRAR SERVICE WORKER (inmediatamente, sin esperar load)
    // ============================================
    const registerSW = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registrado:', registration.scope);

        // Verificar actualizaciones cada hora
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Detectar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'activated' &&
              navigator.serviceWorker.controller
            ) {
              console.log('[PWA] Nueva versión disponible');
            }
          });
        });
      } catch (error) {
        console.error('[PWA] Error registrando Service Worker:', error);
      }
    };

    // Registrar inmediatamente — no depender de 'load' event
    registerSW();

    // ============================================
    // 2. CAPTURAR EVENTO beforeinstallprompt
    // ============================================
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que Chrome muestre el mini-infobar automático
      e.preventDefault();
      // Guardar el evento para usarlo después
      deferredInstallPrompt = e;
      console.log('[PWA] App es instalable — beforeinstallprompt capturado');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar cuando la app fue instalada
    const handleAppInstalled = () => {
      deferredInstallPrompt = null;
      console.log('[PWA] App instalada exitosamente');
      document.documentElement.classList.add('pwa-standalone');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // ============================================
    // 3. DETECTAR STANDALONE MODE (PWA ya instalada)
    // ============================================
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      document.documentElement.classList.add('pwa-standalone');
      console.log('[PWA] Ejecutando en modo standalone (app instalada)');
    }

    // Escuchar cambios de display mode
    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('pwa-standalone');
      }
    };
    displayModeQuery.addEventListener('change', handleDisplayModeChange);

    // ============================================
    // 4. PULL-TO-REFRESH: manejado por PullToRefresh component
    // (ya no bloqueamos el gesto — lo interceptamos con UI custom)
    // ============================================

    // ============================================
    // CLEANUP
    // ============================================
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      displayModeQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  return null;
}

/**
 * Función utilitaria para disparar el install prompt desde cualquier componente
 * Uso: import { triggerPWAInstall } from '@/src/presentation/components/PWARegister';
 */
export async function triggerPWAInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) {
    console.log('[PWA] No hay prompt de instalación disponible');
    return false;
  }

  try {
    // Mostrar el prompt de instalación
    (deferredInstallPrompt as any).prompt();
    // Esperar la respuesta del usuario
    const result = await (deferredInstallPrompt as any).userChoice;
    console.log('[PWA] Usuario respondió:', result.outcome);
    deferredInstallPrompt = null;
    return result.outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Error mostrando install prompt:', error);
    return false;
  }
}
