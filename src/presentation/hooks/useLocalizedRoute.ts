// ============================================
// src/presentation/hooks/useLocalizedRoute.ts
// Hook para obtener rutas traducidas por clave e idioma
// ============================================

'use client';

import { useMemo, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  RouteKey,
  getPathnameFromKey,
  replaceRouteParams,
} from '@/src/infrastructure/config/route-keys.config';

interface RouteTranslation {
  pathname: string;
  translations: Record<string, string>;
}

// Cache global para evitar múltiples llamadas
let cachedRoutes: Record<string, RouteTranslation> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 30000; // 30 segundos

/**
 * Hook para obtener una ruta traducida según el idioma actual
 *
 * @param key - Clave de la ruta (ej: 'admin.users')
 * @param params - Parámetros dinámicos opcionales (ej: { id: '123' })
 * @returns Ruta traducida completa con locale (ej: '/es/admin/usuarios')
 *
 * @example
 * ```tsx
 * // Ruta simple
 * const route = useLocalizedRoute('admin.users');
 * // → '/es/admin/usuarios' (si locale es 'es')
 * // → '/en/admin/users' (si locale es 'en')
 *
 * // Ruta con parámetros
 * const route = useLocalizedRoute('books.edit', { id: '123' });
 * // → '/es/libros/123/editar'
 * ```
 */
export function useLocalizedRoute(
  key: RouteKey,
  params?: Record<string, string | number>
): string {
  const locale = useLocale();
  const [routes, setRoutes] = useState<Record<string, RouteTranslation>>(cachedRoutes || {});

  // Cargar rutas traducidas desde Supabase
  useEffect(() => {
    const now = Date.now();

    // Si tenemos cache válido, usarlo
    if (cachedRoutes && now - cacheTimestamp < CACHE_TTL) {
      setRoutes(cachedRoutes);
      return;
    }

    let mounted = true;

    async function loadRoutes() {
      try {
        const supabase = createClient();

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

        const routesMap: Record<string, RouteTranslation> = {};

        data?.forEach((route: any) => {
          const translations: Record<string, string> = {};

          route.route_translations?.forEach((t: any) => {
            translations[t.language_code] = t.translated_path;
          });

          routesMap[route.pathname] = {
            pathname: route.pathname,
            translations,
          };
        });

        if (mounted) {
          cachedRoutes = routesMap;
          cacheTimestamp = Date.now();
          setRoutes(routesMap);
        }
      } catch (error) {
        console.error('[useLocalizedRoute] Error loading routes:', error);
      }
    }

    loadRoutes();

    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(() => {
    // 1. Obtener pathname físico de la clave
    const pathname = getPathnameFromKey(key);

    // 2. Reemplazar parámetros si existen
    const processedPathname = params
      ? replaceRouteParams(pathname, params)
      : pathname;

    // 3. Buscar traducción
    const route = routes[pathname];

    let translatedPath: string;

    if (route && route.translations[locale]) {
      // Tenemos traducción para este idioma
      translatedPath = route.translations[locale];

      // Si hay parámetros, reemplazarlos en la ruta traducida
      if (params) {
        translatedPath = replaceRouteParams(translatedPath, params);
      }
    } else {
      // No hay traducción, usar pathname original
      translatedPath = processedPathname;
    }

    // 4. Agregar locale al inicio
    return `/${locale}${translatedPath}`;
  }, [key, locale, params, routes]);
}

/**
 * Hook para obtener múltiples rutas traducidas a la vez
 *
 * @param keys - Array de claves de rutas
 * @returns Objeto con claves y rutas traducidas
 *
 * @example
 * ```tsx
 * const routes = useLocalizedRoutes(['admin.users', 'admin.roles']);
 * // → { 'admin.users': '/es/admin/usuarios', 'admin.roles': '/es/admin/roles' }
 * ```
 */
export function useLocalizedRoutes(
  keys: RouteKey[]
): Record<RouteKey, string> {
  const locale = useLocale();
  const [routes, setRoutes] = useState<Record<string, RouteTranslation>>(cachedRoutes || {});

  // Cargar rutas (mismo código que arriba)
  useEffect(() => {
    const now = Date.now();

    if (cachedRoutes && now - cacheTimestamp < CACHE_TTL) {
      setRoutes(cachedRoutes);
      return;
    }

    let mounted = true;

    async function loadRoutes() {
      try {
        const supabase = createClient();

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

        const routesMap: Record<string, RouteTranslation> = {};

        data?.forEach((route: any) => {
          const translations: Record<string, string> = {};

          route.route_translations?.forEach((t: any) => {
            translations[t.language_code] = t.translated_path;
          });

          routesMap[route.pathname] = {
            pathname: route.pathname,
            translations,
          };
        });

        if (mounted) {
          cachedRoutes = routesMap;
          cacheTimestamp = Date.now();
          setRoutes(routesMap);
        }
      } catch (error) {
        console.error('[useLocalizedRoutes] Error loading routes:', error);
      }
    }

    loadRoutes();

    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(() => {
    const result: Record<string, string> = {};

    keys.forEach((key) => {
      const pathname = getPathnameFromKey(key);
      const route = routes[pathname];

      let translatedPath: string;

      if (route && route.translations[locale]) {
        translatedPath = route.translations[locale];
      } else {
        translatedPath = pathname;
      }

      result[key] = `/${locale}${translatedPath}`;
    });

    return result as Record<RouteKey, string>;
  }, [keys, locale, routes]);
}
