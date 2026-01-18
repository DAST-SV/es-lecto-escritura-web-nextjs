// ============================================
// src/infrastructure/services/routing/DynamicRoutingService.ts
// Servicio para cargar rutas desde Supabase
// ============================================

import { createClient } from '@supabase/supabase-js';

interface RouteMapping {
  pathname: string;
  translations: {
    [locale: string]: string;
  };
}

export class DynamicRoutingService {
  /**
   * Carga TODAS las rutas con sus traducciones
   * Formato: { '/admin/audit': { es: '/a', en: '/audit', fr: '/audit' } }
   */
  static async loadAllRoutes(): Promise<Record<string, any>> {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      // 1. Obtener todas las rutas activas
      const { data: routes, error: routesError } = await supabase
        .schema('app')
        .from('routes')
        .select(`
          id,
          pathname,
          route_translations (
            language_code,
            translated_path
          )
        `)
        .eq('is_active', true)
        .is('deleted_at', null);

      if (routesError) throw routesError;
      if (!routes) return {};

      // 2. Construir el objeto de rutas
      const pathnames: Record<string, any> = {};

      routes.forEach((route: any) => {
        const translations: Record<string, string> = {};

        // Agregar traducciones
        if (route.route_translations) {
          route.route_translations.forEach((t: any) => {
            translations[t.language_code] = t.translated_path;
          });
        }

        // Si tiene traducciones, agregarlas
        if (Object.keys(translations).length > 0) {
          pathnames[route.pathname] = translations;
        } else {
          // Sin traducciones, usar el pathname para todos los idiomas
          pathnames[route.pathname] = route.pathname;
        }
      });

      console.log(`✅ [DynamicRouting] ${Object.keys(pathnames).length} rutas cargadas`);
      return pathnames;

    } catch (error) {
      console.error('❌ [DynamicRouting] Error cargando rutas:', error);
      return {};
    }
  }

  /**
   * Obtiene la ruta traducida para un pathname y locale
   */
  static async getTranslatedPath(
    pathname: string,
    locale: string
  ): Promise<string | null> {
    const routes = await this.loadAllRoutes();
    const route = routes[pathname];

    if (!route) return null;

    if (typeof route === 'string') {
      return route;
    }

    return route[locale] || pathname;
  }

  /**
   * Encuentra el pathname original desde una ruta traducida
   */
  static async findPathnameByTranslation(
    translatedPath: string,
    locale: string
  ): Promise<string | null> {
    const routes = await this.loadAllRoutes();

    for (const [pathname, translations] of Object.entries(routes)) {
      if (typeof translations === 'string') {
        if (translations === translatedPath) return pathname;
      } else {
        if (translations[locale] === translatedPath) return pathname;
      }
    }

    return null;
  }
}