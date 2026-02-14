// ============================================
// src/infrastructure/utils/server-localized-href.ts
// Resolución de rutas traducidas para server components
// Consulta Supabase directamente con cache en módulo
// ============================================

import type { RouteTranslationsMap } from './resolve-localized-href';

let serverTranslationsCache: RouteTranslationsMap | null = null;
let serverCacheTimestamp = 0;
const SERVER_CACHE_TTL = 60 * 1000; // 1 minuto

/**
 * Carga el mapa de traducciones de rutas desde Supabase (server-side)
 */
export async function getRouteTranslationsMap(): Promise<RouteTranslationsMap> {
  const now = Date.now();
  if (serverTranslationsCache && (now - serverCacheTimestamp) < SERVER_CACHE_TTL) {
    return serverTranslationsCache;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data, error } = await supabase
      .schema('app')
      .from('routes')
      .select(`
        pathname,
        route_translations (
          language_code,
          translated_path
        )
      `)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (error) throw error;

    const map: RouteTranslationsMap = {};
    data?.forEach((route: any) => {
      const t: Record<string, string> = {};
      route.route_translations?.forEach((tr: any) => {
        t[tr.language_code] = tr.translated_path;
      });
      if (Object.keys(t).length > 0) {
        map[route.pathname] = t;
      }
    });

    serverTranslationsCache = map;
    serverCacheTimestamp = now;
    return map;
  } catch {
    return serverTranslationsCache || {};
  }
}

/**
 * Resuelve una ruta traducida para server components.
 *
 * @param routeKey - Ruta física (ej. "/library")
 * @param locale - Código de idioma (ej. "es")
 * @param dynamicSuffix - Segmentos dinámicos opcionales (ej. "cuentos/mi-libro")
 * @returns Ruta completa traducida (ej. "/es/biblioteca/cuentos/mi-libro")
 */
export async function localizedHref(
  routeKey: string,
  locale: string,
  dynamicSuffix?: string
): Promise<string> {
  const map = await getRouteTranslationsMap();
  const translations = map[routeKey];
  const translatedBase = translations?.[locale] ?? routeKey;
  const suffix = dynamicSuffix ? `/${dynamicSuffix.replace(/^\//, '')}` : '';
  return `/${locale}${translatedBase}${suffix}`;
}
