// ============================================
// src/infrastructure/utils/resolve-localized-href.ts
// Función pura para resolver rutas traducidas
// ============================================

export type RouteTranslationsMap = Record<string, Record<string, string>>;

/**
 * Resuelve una ruta física a su versión traducida con locale.
 *
 * @param routeKey - Ruta física (ej. "/library")
 * @param locale - Código de idioma (ej. "es")
 * @param translationsMap - Mapa de traducciones { "/library": { "es": "/biblioteca" } }
 * @param dynamicSuffix - Segmentos dinámicos opcionales (ej. "cuentos/mi-libro")
 * @returns Ruta completa traducida (ej. "/es/biblioteca/cuentos/mi-libro")
 */
export function resolveLocalizedHref(
  routeKey: string,
  locale: string,
  translationsMap: RouteTranslationsMap,
  dynamicSuffix?: string
): string {
  const translations = translationsMap[routeKey];
  const translatedBase = translations?.[locale] ?? routeKey;
  const suffix = dynamicSuffix ? `/${dynamicSuffix.replace(/^\//, '')}` : '';
  return `/${locale}${translatedBase}${suffix}`;
}
