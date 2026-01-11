// ============================================
// src/infrastructure/services/routing/DynamicRoutingService.ts
// ✅ CORREGIDO: Sin cookies en build time
// ============================================

interface RouteTranslation {
  pathname: string;
  translatedPath: string;
}

// ✅ Rutas hardcoded como fallback
const FALLBACK_ROUTES = {
  '/': { es: '/', en: '/', fr: '/' },
  '/auth/login': { es: '/auth/ingresar', en: '/auth/login', fr: '/auth/connexion' },
  '/auth/register': { es: '/auth/registro', en: '/auth/register', fr: '/auth/inscription' },
  '/library': { es: '/biblioteca', en: '/library', fr: '/bibliotheque' },
  '/my-world': { es: '/mi-mundo', en: '/my-world', fr: '/mon-monde' },
  '/my-progress': { es: '/mi-progreso', en: '/my-progress', fr: '/mes-progres' },
  '/test-supabase': { es: '/test-supabase', en: '/test-supabase', fr: '/test-supabase' },
};

export class DynamicRoutingService {
  /**
   * Cargar rutas traducidas desde Supabase
   */
  static async loadRoutesForLanguage(languageCode: string): Promise<Record<string, any>> {
    // ✅ En build time, usar rutas hardcoded
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.log(`📦 Build time: usando rutas hardcoded para ${languageCode}`);
      return this.extractLanguageRoutes(languageCode);
    }

    try {
      const { createServerSupabaseClient } = await import('@/src/infrastructure/config/supabase.config');
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
        return this.extractLanguageRoutes(languageCode);
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

      console.log(`✅ Rutas desde Supabase para ${languageCode}:`, Object.keys(pathnames).length);
      return pathnames;
      
    } catch (error) {
      console.error('❌ Error en loadRoutesForLanguage:', error);
      return this.extractLanguageRoutes(languageCode);
    }
  }

  /**
   * Cargar todas las rutas para todos los idiomas
   */
  static async loadAllRoutes(): Promise<Record<string, any>> {
    // ✅ En build time, usar rutas hardcoded
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('📦 Build time: usando rutas hardcoded');
      return FALLBACK_ROUTES;
    }

    try {
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

      console.log('✅ Rutas combinadas:', Object.keys(allPathnames).length);
      return allPathnames;
    } catch (error) {
      console.error('❌ Error cargando rutas, usando fallback:', error);
      return FALLBACK_ROUTES;
    }
  }

  /**
   * Verificar si una ruta existe
   */
  static async routeExists(pathname: string): Promise<boolean> {
    // En build time, verificar contra fallback
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return pathname in FALLBACK_ROUTES;
    }

    try {
      const { createServerSupabaseClient } = await import('@/src/infrastructure/config/supabase.config');
      const supabase = await createServerSupabaseClient();
      
      const { count } = await supabase
        .from('routes')
        .select('*', { count: 'exact', head: true })
        .eq('pathname', pathname)
        .eq('is_active', true)
        .is('deleted_at', null);

      return (count || 0) > 0;
    } catch {
      return pathname in FALLBACK_ROUTES;
    }
  }

  /**
   * Helper: Extraer rutas de un idioma específico del fallback
   */
  private static extractLanguageRoutes(languageCode: string): Record<string, any> {
    const result: Record<string, any> = {};
    
    Object.keys(FALLBACK_ROUTES).forEach(pathname => {
      result[pathname] = {
        [languageCode]: FALLBACK_ROUTES[pathname as keyof typeof FALLBACK_ROUTES][languageCode as 'es' | 'en' | 'fr']
      };
    });
    
    return result;
  }
}