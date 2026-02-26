'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

// Funciones expuestas por el script inline del layout
declare global {
  interface Window {
    __navLoaderShow?: () => void;
    __navLoaderHide?: () => void;
  }
}

interface NavigationContextValue {
  startLoading: () => void;
  stopLoading: () => void;
}

const NavigationContext = createContext<NavigationContextValue>({
  startLoading: () => {},
  stopLoading: () => {},
});

/**
 * NavigationProvider — wrapper liviano que conecta el sistema de
 * navegación de React (usePathname) con el overlay DOM puro.
 *
 * - Auto-hide: cuando el pathname cambia, oculta el overlay.
 * - startLoading / stopLoading: para uso programático (forms, router.push).
 */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Cuando la navegación SPA termina → pathname cambia → ocultar overlay
  useEffect(() => {
    window.__navLoaderHide?.();
  }, [pathname]);

  const startLoading = useCallback(() => {
    window.__navLoaderShow?.();
  }, []);

  const stopLoading = useCallback(() => {
    window.__navLoaderHide?.();
  }, []);

  return (
    <NavigationContext.Provider value={{ startLoading, stopLoading }}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * Hook para mostrar/ocultar el overlay de navegación desde cualquier componente.
 *
 * @example Formulario que redirige tras guardar
 * ```tsx
 * const { startLoading } = useNavigationLoading();
 * async function handleSubmit() {
 *   startLoading();
 *   await guardarDatos();
 *   router.push('/biblioteca');
 * }
 * ```
 */
export function useNavigationLoading() {
  return useContext(NavigationContext);
}
