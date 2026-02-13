// ============================================================================
// src/presentation/features/navigation/context/BrowserNavContext.tsx
// Context para controles de navegacion tipo browser (Back, Forward, Refresh)
// Activados por defecto en PWA desktop, desactivables por el usuario
// ============================================================================
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'pwa-nav-controls-enabled';

interface BrowserNavContextValue {
  /** Si la app esta en modo standalone (PWA instalada) */
  isStandalone: boolean;
  /** Si los controles estan habilitados (toggle del usuario) */
  isEnabled: boolean;
  /** Si se puede ir atras en el historial */
  canGoBack: boolean;
  /** Si se puede ir adelante en el historial */
  canGoForward: boolean;
  /** Alternar habilitado/deshabilitado */
  toggleEnabled: () => void;
  /** Navegar atras */
  goBack: () => void;
  /** Navegar adelante */
  goForward: () => void;
  /** Recargar pagina */
  refresh: () => void;
  /** Si el refresh esta en animacion */
  isRefreshing: boolean;
}

const BrowserNavContext = createContext<BrowserNavContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================
export const BrowserNavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Tracking de historial: posicion actual vs maxima alcanzada
  const navIndex = useRef(0);
  const maxIndex = useRef(0);

  // --- Inicializacion ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detectar standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.documentElement.classList.contains('pwa-standalone');
    setIsStandalone(standalone);

    // 2. Leer preferencia de localStorage o calcular default
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsEnabled(stored === 'true');
    } else {
      // Default: activado solo en standalone + desktop (>= 768px)
      const isDesktop = window.innerWidth >= 768;
      const defaultEnabled = standalone && isDesktop;
      setIsEnabled(defaultEnabled);
    }

    // 3. Historial inicial
    navIndex.current = window.history.length - 1;
    maxIndex.current = navIndex.current;
    setCanGoBack(window.history.length > 1);
    setCanGoForward(false);

    setMounted(true);

    // 4. Observar cambios en clase pwa-standalone (por si PWARegister carga despues)
    const observer = new MutationObserver(() => {
      const nowStandalone = document.documentElement.classList.contains('pwa-standalone');
      setIsStandalone(nowStandalone);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // 5. Escuchar display-mode changes
    const displayQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    displayQuery.addEventListener('change', handleDisplayChange);

    return () => {
      observer.disconnect();
      displayQuery.removeEventListener('change', handleDisplayChange);
    };
  }, []);

  // --- Tracking de navegacion con popstate ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      // Cuando el usuario navega atras/adelante, actualizamos el tracking
      // No podemos saber exactamente la posicion, pero podemos inferir
      // Si hubo popstate, es porque se fue atras o adelante
      const currentLength = window.history.length;

      // Heuristica: siempre se puede ir atras si hay historial
      setCanGoBack(currentLength > 1);
      // Forward: despues de ir atras, se puede ir adelante
      // Simplificacion: habilitamos forward siempre y dejamos que el browser lo maneje
      setCanGoForward(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Toggle ---
  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  // --- Acciones de navegacion ---
  const goBack = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.history.back();
    // Despues de ir atras, se puede ir adelante
    setTimeout(() => {
      setCanGoForward(true);
    }, 100);
  }, []);

  const goForward = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.history.forward();
  }, []);

  const refresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    setIsRefreshing(true);
    // Delay para mostrar la animacion antes del reload
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }, []);

  // No renderizar con estado incorrecto antes de montar
  const value: BrowserNavContextValue = {
    isStandalone,
    isEnabled: mounted ? isEnabled : false,
    canGoBack,
    canGoForward,
    toggleEnabled,
    goBack,
    goForward,
    refresh,
    isRefreshing,
  };

  return (
    <BrowserNavContext.Provider value={value}>
      {children}
    </BrowserNavContext.Provider>
  );
};

// ============================================================================
// Hook consumer
// ============================================================================
export const useBrowserNav = (): BrowserNavContextValue => {
  const ctx = useContext(BrowserNavContext);
  if (!ctx) {
    throw new Error('useBrowserNav must be used within <BrowserNavProvider>');
  }
  return ctx;
};
