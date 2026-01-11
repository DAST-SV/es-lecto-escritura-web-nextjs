// ============================================
// src/infrastructure/services/routing/DynamicRoutingService.ts
// ============================================

import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config';

interface RouteTranslation {
  pathname: string;
  translatedPath: string;
}

export class DynamicRoutingService {
  /**
   * Cargar rutas traducidas desde Supabase
   */
  static async loadRoutesForLanguage(languageCode: string): Promise<Record<string, any>> {
    try {
      const supabase = await createServerSupabaseClient();
      
      const { data: routes, error } = await supabase
        .from('route_translations')
        .select(`
          translated_path,
          routes!inner (
            pathname,
            is_active
          )
        `)
        .eq('language_code', languageCode)
        .eq('is_active', true)
        .eq('routes.is_active', true);

      if (error) {
        console.error('❌ Error cargando rutas:', error);
        return {};
      }

      // Convertir a formato next-intl pathnames
      const pathnames: Record<string, any> = {};
      
      routes?.forEach((route: any) => {
        const pathname = route.routes.pathname;
        if (!pathnames[pathname]) {
          pathnames[pathname] = {};
        }
        pathnames[pathname][languageCode] = route.translated_path;
      });

      console.log(`✅ Rutas cargadas para ${languageCode}:`, Object.keys(pathnames).length);
      return pathnames;
      
    } catch (error) {
      console.error('❌ Error en loadRoutesForLanguage:', error);
      return {};
    }
  }

  /**
   * Cargar todas las rutas para todos los idiomas
   */
  static async loadAllRoutes(): Promise<Record<string, any>> {
    const languages = ['es', 'en', 'fr'];
    const allPathnames: Record<string, any> = {};

    for (const lang of languages) {
      const routes = await this.loadRoutesForLanguage(lang);
      
      Object.keys(routes).forEach(pathname => {
        if (!allPathnames[pathname]) {
          allPathnames[pathname] = {};
        }
        allPathnames[pathname] = {
          ...allPathnames[pathname],
          ...routes[pathname]
        };
      });
    }

    return allPathnames;
  }

  /**
   * Verificar si una ruta existe
   */
  static async routeExists(pathname: string): Promise<boolean> {
    try {
      const supabase = await createServerSupabaseClient();
      
      const { count } = await supabase
        .from('routes')
        .select('*', { count: 'exact', head: true })
        .eq('pathname', pathname)
        .eq('is_active', true)
        .is('deleted_at', null);

      return (count || 0) > 0;
    } catch {
      return false;
    }
  }
}