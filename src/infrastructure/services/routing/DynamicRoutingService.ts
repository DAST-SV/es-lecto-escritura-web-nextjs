// ============================================
// src/infrastructure/services/routing/DynamicRoutingService.ts
// Carga rutas DINÁMICAMENTE desde la BD
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';

interface RouteTranslation {
  route_id: string;
  language_code: string;
  translated_path: string;
  translated_name: string;
}

interface Route {
  id: string;
  pathname: string;
  display_name: string;
}

/**
 * Servicio para cargar rutas dinámicamente desde la base de datos
 */
export class DynamicRoutingService {
  /**
   * Cargar todas las rutas con sus traducciones
   * Devuelve el formato que next-intl necesita
   */
  static async loadAllRoutes(): Promise<Record<string, any>> {
    try {
      const supabase = createClient();

      // 1. Cargar todas las rutas activas
      const { data: routes, error: routesError } = await supabase
        .schema('app')
        .from('routes')
        .select('id, pathname, display_name')
        .eq('is_active', true)
        .is('deleted_at', null);

      if (routesError) {
        console.error('Error cargando rutas:', routesError);
        return DynamicRoutingService.getFallbackRoutes();
      }

      // 2. Cargar todas las traducciones
      const { data: translations, error: translationsError } = await supabase
        .schema('app')
        .from('route_translations')
        .select('route_id, language_code, translated_path, translated_name')
        .eq('is_active', true);

      if (translationsError) {
        console.error('Error cargando traducciones:', translationsError);
        return DynamicRoutingService.getFallbackRoutes();
      }

      // 3. Construir el objeto pathnames dinámicamente
      const pathnames: Record<string, any> = {};

      routes?.forEach((route: Route) => {
        // Obtener traducciones para esta ruta
        const routeTranslations = translations?.filter(
          (t: RouteTranslation) => t.route_id === route.id
        );

        if (routeTranslations && routeTranslations.length > 0) {
          // Construir objeto de traducciones
          const translationsObj: Record<string, string> = {};
          
          routeTranslations.forEach((t: RouteTranslation) => {
            translationsObj[t.language_code] = t.translated_path;
          });

          // Agregar al pathnames
          pathnames[route.pathname] = translationsObj;
        } else {
          // Si no hay traducciones, usar la ruta original para todos los idiomas
          pathnames[route.pathname] = route.pathname;
        }
      });

      console.log('✅ Rutas dinámicas cargadas:', Object.keys(pathnames).length);
      return pathnames;

    } catch (error) {
      console.error('Error en loadAllRoutes:', error);
      return DynamicRoutingService.getFallbackRoutes();
    }
  }

  /**
   * Rutas de respaldo si falla la BD
   */
  private static getFallbackRoutes(): Record<string, any> {
    return {
      '/': '/',
      '/library': {
        es: '/biblioteca',
        en: '/library',
        fr: '/bibliotheque',
        it: '/biblioteca'
      },
      '/my-world': {
        es: '/mi-mundo',
        en: '/my-world',
        fr: '/mon-monde',
        it: '/mio-mondo'
      },
      '/my-progress': {
        es: '/mi-progreso',
        en: '/my-progress',
        fr: '/mon-progres',
        it: '/mio-progresso'
      },
      '/admin': '/admin',
    };
  }

  /**
   * Obtener traducción específica de una ruta
   */
  static async getRouteTranslation(
    pathname: string,
    languageCode: string
  ): Promise<string> {
    try {
      const supabase = createClient();

      const { data: route } = await supabase
        .schema('app')
        .from('routes')
        .select('id')
        .eq('pathname', pathname)
        .single();

      if (!route) return pathname;

      const { data: translation } = await supabase
        .schema('app')
        .from('route_translations')
        .select('translated_path')
        .eq('route_id', route.id)
        .eq('language_code', languageCode)
        .single();

      return translation?.translated_path || pathname;

    } catch (error) {
      console.error('Error obteniendo traducción:', error);
      return pathname;
    }
  }

  /**
   * Obtener todas las rutas accesibles para un usuario
   */
  static async getAccessibleRoutes(
    userId: string,
    languageCode: string = 'es'
  ): Promise<Array<{
    pathname: string;
    translatedPath: string;
    displayName: string;
  }>> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .rpc('get_accessible_routes', {
          p_user_id: userId,
          p_language_code: languageCode,
          p_organization_id: null,
          p_show_in_menu_only: true,
        });

      if (error) {
        console.error('Error obteniendo rutas accesibles:', error);
        return [];
      }

      return (data || []).map((r: any) => ({
        pathname: r.pathname,
        translatedPath: r.translated_path,
        displayName: r.display_name,
      }));

    } catch (error) {
      console.error('Error en getAccessibleRoutes:', error);
      return [];
    }
  }
}