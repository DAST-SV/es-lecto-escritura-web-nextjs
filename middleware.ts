// ============================================
// middleware.ts - VERSIÓN CORREGIDA
// Solo verifica rutas privadas (las que están en DB)
// Rutas públicas se controlan estáticamente aquí
// ============================================

import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from '@/src/infrastructure/config/routing.config';

// ============================================
// RUTAS PÚBLICAS (CONTROL ESTÁTICO)
// ============================================

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/acerca-de',
  '/a-propos',
  '/chi-siamo',
  '/error',
  '/forbidden',
  '/admin/users/permissions',
];

const AUTH_ROUTES = [
  '/auth/login',
  '/auth/ingresar',
  '/auth/connexion',
  '/auth/accesso',
  '/auth/register',
  '/auth/registro',
  '/auth/inscription',
  '/auth/registrazione',
  '/auth/callback',
];

// ============================================
// CACHE DE RUTAS DINÁMICAS
// ============================================

let routesCache: Record<string, any> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function loadRoutes(): Promise<Record<string, any>> {
  const now = Date.now();
  
  if (routesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return routesCache;
  }

  try {
    const { DynamicRoutingService } = await import('@/src/infrastructure/services/routing/DynamicRoutingService');
    routesCache = await DynamicRoutingService.loadAllRoutes();
    cacheTimestamp = now;
    return routesCache;
  } catch (error) {
    console.error('❌ Error cargando rutas:', error);
    return {
      '/': { es: '/', en: '/', fr: '/', it: '/' },
      '/library': { es: '/biblioteca', en: '/library', fr: '/bibliotheque', it: '/biblioteca' },
      '/my-world': { es: '/mi-mundo', en: '/my-world', fr: '/mon-monde', it: '/mio-mondo' },
    };
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function cleanPathname(pathname: string, locale: string): string {
  return pathname.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || '/'
    : pathname;
}

function isPublicRoute(pathname: string, locale: string): boolean {
  const cleanPath = cleanPathname(pathname, locale);
  return PUBLIC_ROUTES.some(route => 
    cleanPath === route || 
    cleanPath === `${route}/` ||
    cleanPath.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string, locale: string): boolean {
  const cleanPath = cleanPathname(pathname, locale);
  return AUTH_ROUTES.some(route => 
    cleanPath === route || 
    cleanPath === `${route}/` ||
    cleanPath.startsWith(route)
  );
}

function getLoginPath(locale: string): string {
  const loginPaths: Record<string, string> = {
    es: '/auth/ingresar',
    en: '/auth/login',
    fr: '/auth/connexion',
    it: '/auth/accesso',
  };
  return loginPaths[locale] || loginPaths['es'];
}

/**
 * Verificar acceso a ruta privada (solo rutas en DB)
 */
async function canAccessRoute(
  supabase: any,
  userId: string,
  pathname: string,
  languageCode: string = 'es'
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('can_access_route', {
      p_user_id: userId,
      p_pathname: pathname,
      p_language_code: languageCode,
      p_organization_id: null,
    });

    if (error) {
      console.error('❌ Error verificando acceso:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('❌ Error en can_access_route:', error);
    return false;
  }
}

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================

export default async function middleware(request: NextRequest) {
  // 1. Cargar rutas dinámicas
  const pathnames = await loadRoutes();
  
  // 2. Manejar i18n
  const handleI18nRouting = createMiddleware({
    ...routing,
    pathnames: pathnames as any,
  });

  const response = handleI18nRouting(request);
  
  // 3. Extraer locale y pathname
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const locale = ['es', 'en', 'fr', 'it'].includes(maybeLocale) ? maybeLocale : 'es';
  const cleanPath = cleanPathname(pathname, locale);

  // 4. RUTAS PÚBLICAS → Permitir (sin verificar DB)
  if (isPublicRoute(pathname, locale)) {
    console.log(`✅ Ruta pública: ${pathname}`);
    return response;
  }

  // 5. RUTAS DE AUTH → Permitir
  if (isAuthRoute(pathname, locale)) {
    console.log(`✅ Ruta de autenticación: ${pathname}`);
    return response;
  }

  // 6. Crear cliente Supabase (solo para rutas privadas)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // 7. Obtener usuario
  const { data: { user } } = await supabase.auth.getUser();

  // 8. Si no hay usuario → Login
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    const loginPath = getLoginPath(locale);
    loginUrl.pathname = `/${locale}${loginPath}`;
    loginUrl.searchParams.set('redirect', pathname);
    
    console.log(`🔒 No autenticado, redirigiendo: ${pathname} → ${loginUrl.pathname}`);
    return NextResponse.redirect(loginUrl);
  }

  // 9. Verificar permisos en DB
  const hasAccess = await canAccessRoute(supabase, user.id, cleanPath, locale);

  if (!hasAccess) {
    console.log(`🚫 Acceso denegado: ${pathname} (user: ${user.email}, idioma: ${locale})`);
    
    const forbiddenUrl = request.nextUrl.clone();
    forbiddenUrl.pathname = `/${locale}/forbidden`;
    forbiddenUrl.searchParams.set('from', pathname);
    
    return NextResponse.redirect(forbiddenUrl);
  }

  // 10. Acceso permitido
  console.log(`✅ Acceso permitido: ${pathname} (user: ${user.email}, idioma: ${locale})`);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};