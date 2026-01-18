// ============================================
// src/presentation/hooks/useRouteAccess.ts
// Hook para verificar permisos de acceso a rutas
// ============================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { RouteKey, getPathnameFromKey, replaceRouteParams } from '@/src/infrastructure/config/route-keys.config';

interface RouteAccessState {
  canAccess: boolean;
  isLoading: boolean;
  error: Error | null;
}

// Cache de permisos para evitar llamadas repetidas
const accessCache = new Map<string, { canAccess: boolean; timestamp: number }>();
const CACHE_TTL = 30000; // 30 segundos

/**
 * Hook para verificar si el usuario actual tiene acceso a una ruta específica
 *
 * @param key - Clave de la ruta (ej: 'admin.users')
 * @param params - Parámetros dinámicos opcionales (ej: { id: '123' })
 * @returns Estado de acceso { canAccess, isLoading, error }
 *
 * @example
 * ```tsx
 * const { canAccess, isLoading } = useRouteAccess('admin.users');
 *
 * if (isLoading) return <Spinner />;
 * if (!canAccess) return null; // No mostrar enlace
 *
 * return <Link href="/admin/usuarios">Admin Usuarios</Link>;
 * ```
 */
export function useRouteAccess(
  key: RouteKey,
  params?: Record<string, string | number>
): RouteAccessState {
  const locale = useLocale();
  const [state, setState] = useState<RouteAccessState>({
    canAccess: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const supabase = createClient();

        // 1. Verificar autenticación
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (mounted) {
            setState({ canAccess: false, isLoading: false, error: null });
          }
          return;
        }

        // 2. Obtener pathname físico
        const pathname = getPathnameFromKey(key);
        const processedPathname = params
          ? replaceRouteParams(pathname, params)
          : pathname;

        // 3. Verificar cache
        const cacheKey = `${user.id}:${processedPathname}:${locale}`;
        const cached = accessCache.get(cacheKey);
        const now = Date.now();

        if (cached && now - cached.timestamp < CACHE_TTL) {
          if (mounted) {
            setState({
              canAccess: cached.canAccess,
              isLoading: false,
              error: null,
            });
          }
          return;
        }

        // 4. Buscar ruta en la base de datos
        const { data: routes, error: routeError } = await supabase
          .schema('app')
          .from('routes')
          .select(`
            id,
            pathname,
            is_public,
            route_translations (
              language_code,
              translated_path
            )
          `)
          .eq('pathname', pathname)
          .eq('is_active', true)
          .is('deleted_at', null)
          .single();

        if (routeError) {
          console.error('[useRouteAccess] Route not found:', routeError);
          if (mounted) {
            setState({ canAccess: false, isLoading: false, error: routeError });
          }
          return;
        }

        // 5. Si la ruta es pública, permitir acceso
        if (routes.is_public) {
          accessCache.set(cacheKey, { canAccess: true, timestamp: now });
          if (mounted) {
            setState({ canAccess: true, isLoading: false, error: null });
          }
          return;
        }

        // 6. Obtener ruta traducida
        let translatedPath = pathname;
        const translation = routes.route_translations?.find(
          (t: any) => t.language_code === locale
        );

        if (translation) {
          translatedPath = translation.translated_path;
          // Reemplazar parámetros si existen
          if (params) {
            translatedPath = replaceRouteParams(translatedPath, params);
          }
        } else if (params) {
          translatedPath = replaceRouteParams(pathname, params);
        }

        // 7. Verificar permisos con can_access_route
        const { data: canAccess, error: accessError } = await supabase.rpc(
          'can_access_route',
          {
            p_user_id: user.id,
            p_translated_path: translatedPath,
            p_language_code: locale,
          }
        );

        if (accessError) {
          console.error('[useRouteAccess] Error checking access:', accessError);
          if (mounted) {
            setState({ canAccess: false, isLoading: false, error: accessError });
          }
          return;
        }

        // 8. Cachear resultado
        accessCache.set(cacheKey, { canAccess: !!canAccess, timestamp: now });

        if (mounted) {
          setState({
            canAccess: !!canAccess,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('[useRouteAccess] Fatal error:', error);
        if (mounted) {
          setState({
            canAccess: false,
            isLoading: false,
            error: error as Error,
          });
        }
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [key, locale, params]);

  return state;
}

/**
 * Hook para verificar acceso a múltiples rutas a la vez
 *
 * @param keys - Array de claves de rutas
 * @returns Objeto con claves y estados de acceso
 *
 * @example
 * ```tsx
 * const access = useMultipleRouteAccess(['admin.users', 'admin.roles']);
 * // → {
 * //   'admin.users': { canAccess: true, isLoading: false, error: null },
 * //   'admin.roles': { canAccess: false, isLoading: false, error: null }
 * // }
 * ```
 */
export function useMultipleRouteAccess(
  keys: RouteKey[]
): Record<RouteKey, RouteAccessState> {
  const locale = useLocale();
  const [states, setStates] = useState<Record<string, RouteAccessState>>(() => {
    const initial: Record<string, RouteAccessState> = {};
    keys.forEach((key) => {
      initial[key] = { canAccess: false, isLoading: true, error: null };
    });
    return initial;
  });

  useEffect(() => {
    let mounted = true;

    async function checkAllAccess() {
      try {
        const supabase = createClient();

        // 1. Verificar autenticación
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (mounted) {
            const newStates: Record<string, RouteAccessState> = {};
            keys.forEach((key) => {
              newStates[key] = { canAccess: false, isLoading: false, error: null };
            });
            setStates(newStates);
          }
          return;
        }

        // 2. Verificar cada ruta en paralelo
        const checks = keys.map(async (key) => {
          try {
            const pathname = getPathnameFromKey(key);

            // Verificar cache
            const cacheKey = `${user.id}:${pathname}:${locale}`;
            const cached = accessCache.get(cacheKey);
            const now = Date.now();

            if (cached && now - cached.timestamp < CACHE_TTL) {
              return {
                key,
                state: { canAccess: cached.canAccess, isLoading: false, error: null },
              };
            }

            // Buscar ruta
            const { data: routes, error: routeError } = await supabase
              .schema('app')
              .from('routes')
              .select(`
                id,
                pathname,
                is_public,
                route_translations (
                  language_code,
                  translated_path
                )
              `)
              .eq('pathname', pathname)
              .eq('is_active', true)
              .is('deleted_at', null)
              .single();

            if (routeError) {
              return {
                key,
                state: { canAccess: false, isLoading: false, error: routeError },
              };
            }

            if (routes.is_public) {
              accessCache.set(cacheKey, { canAccess: true, timestamp: now });
              return {
                key,
                state: { canAccess: true, isLoading: false, error: null },
              };
            }

            // Obtener ruta traducida
            let translatedPath = pathname;
            const translation = routes.route_translations?.find(
              (t: any) => t.language_code === locale
            );
            if (translation) {
              translatedPath = translation.translated_path;
            }

            // Verificar permisos
            const { data: canAccess, error: accessError } = await supabase.rpc(
              'can_access_route',
              {
                p_user_id: user.id,
                p_translated_path: translatedPath,
                p_language_code: locale,
              }
            );

            if (accessError) {
              return {
                key,
                state: { canAccess: false, isLoading: false, error: accessError },
              };
            }

            accessCache.set(cacheKey, { canAccess: !!canAccess, timestamp: now });

            return {
              key,
              state: { canAccess: !!canAccess, isLoading: false, error: null },
            };
          } catch (error) {
            return {
              key,
              state: { canAccess: false, isLoading: false, error: error as Error },
            };
          }
        });

        const results = await Promise.all(checks);

        if (mounted) {
          const newStates: Record<string, RouteAccessState> = {};
          results.forEach(({ key, state }) => {
            newStates[key] = state;
          });
          setStates(newStates);
        }
      } catch (error) {
        console.error('[useMultipleRouteAccess] Fatal error:', error);
        if (mounted) {
          const newStates: Record<string, RouteAccessState> = {};
          keys.forEach((key) => {
            newStates[key] = {
              canAccess: false,
              isLoading: false,
              error: error as Error,
            };
          });
          setStates(newStates);
        }
      }
    }

    checkAllAccess();

    return () => {
      mounted = false;
    };
  }, [keys, locale]);

  return states as Record<RouteKey, RouteAccessState>;
}

/**
 * Limpia el cache de permisos (útil después de cambios de rol/permisos)
 */
export function clearRouteAccessCache() {
  accessCache.clear();
}
