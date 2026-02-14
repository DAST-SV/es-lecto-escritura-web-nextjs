// ============================================
// src/infrastructure/repositories/RoutesRepository.ts
// Repositorio simple para obtener rutas desde Supabase
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';

export interface RouteTranslation {
  pathname: string;
  translatedPath: string;
}

export class RoutesRepository {
  private supabase = createClient();

  /**
   * Obtiene todas las rutas traducidas para un idioma
   */
  async getRoutesForLanguage(languageCode: string): Promise<Record<string, any>> {
    const { data, error } = await this.supabase
      .rpc('get_routes_for_language', {
        p_language_code: languageCode
      });

    if (error) {
      console.error('Error loading routes:', error);
      return {};
    }

    // Convertir a formato next-intl pathnames
    const pathnames: Record<string, any> = {};
    
    data?.forEach((route: RouteTranslation) => {
      if (!pathnames[route.pathname]) {
        pathnames[route.pathname] = {};
      }
      pathnames[route.pathname][languageCode] = route.translatedPath;
    });

    return pathnames;
  }

  /**
   * Obtiene todas las rutas para todos los idiomas
   */
  async getAllRoutes(): Promise<Record<string, any>> {
    const { locales } = await import('@/src/infrastructure/config/generated-locales');
    const allPathnames: Record<string, any> = {};

    for (const lang of locales) {
      const routes = await this.getRoutesForLanguage(lang);
      
      // Merge routes
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
}