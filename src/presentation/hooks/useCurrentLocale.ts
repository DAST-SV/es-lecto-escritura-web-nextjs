// ============================================
// src/presentation/hooks/useCurrentLocale.ts
// Helper centralizado para obtener el locale actual desde la URL
// Funciona en browser (client components) y server (via pathname del request)
// ============================================

'use client';

import { usePathname } from 'next/navigation';

export const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'it'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: SupportedLocale = 'es';

/**
 * Extrae el locale del pathname (ej. '/en/biblioteca' → 'en')
 * No depende de cookies ni contexto next-intl
 */
export function getLocaleFromPathname(pathname: string): SupportedLocale {
  const segment = pathname.split('/').filter(Boolean)[0];
  return (SUPPORTED_LOCALES as readonly string[]).includes(segment)
    ? (segment as SupportedLocale)
    : DEFAULT_LOCALE;
}

/**
 * Hook para client components — lee el locale de la URL actual
 * Usar en lugar de useLocale() cuando next-intl puede no estar disponible
 * o cuando necesitas el locale real de la URL (no de la cookie)
 */
export function useCurrentLocale(): SupportedLocale {
  const pathname = usePathname();
  return getLocaleFromPathname(pathname);
}

/**
 * Obtiene el locale del pathname actual en el browser (window.location)
 * Para usar fuera de hooks/componentes React (ej. en callbacks, event handlers)
 */
export function getCurrentLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  return getLocaleFromPathname(window.location.pathname);
}
