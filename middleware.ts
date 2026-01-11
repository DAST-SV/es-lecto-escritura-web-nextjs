// ============================================
// middleware.ts (ROOT) - SOLUCIÓN RBAC SIN LOOPS
// ============================================

import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from '@/src/infrastructure/config/routing.config';

// ============================================
// CONFIGURACIÓN
// ============================================

// Rutas completamente públicas (sin login ni verificación de permisos)
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/acerca-de',
  '/a-propos',
  '/error',
  '/forbidden',
];

// Rutas de autenticación (públicas pero tratadas especialmente)
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/ingresar',
  '/auth/connexion',
  '/auth/register',
  '/auth/registro',
  '/auth/inscription',
  '/auth/callback',
];

// Cache de rutas dinámicas (5 minutos)
let routesCache: Record<string, any> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000;

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Cargar rutas dinámicas desde Supabase
 */
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
    
    // Fallback
    return {
      '/': { es: '/', en: '/', fr: '/' },
      '/auth/login': { es: '/auth/ingresar', en: '/auth/login', fr: '/auth/connexion' },
      '/auth/register': { es: '/auth/registro', en: '/auth/register', fr: '/auth/inscription' },
      '/library': { es: '/biblioteca', en: '/library', fr: '/bibliotheque' },
      '/my-world': { es: '/mi-mundo', en: '/my-world', fr: '/mon-monde' },
    };
  }
}

/**
 * Limpiar pathname (sin locale)
 */
function cleanPathname(pathname: string, locale: string): string {
  return pathname.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || '/'
    : pathname;
}

/**
 * Verificar si es ruta pública
 */
function isPublicRoute(pathname: string, locale: string): boolean {
  const cleanPath = cleanPathname(pathname, locale);
  
  return PUBLIC_ROUTES.some(route => {
    return cleanPath === route || 
           cleanPath === `${route}/` ||
           cleanPath.startsWith(`${route}/`);
  });
}

/**
 * Verificar si es ruta de autenticación
 */
function isAuthRoute(pathname: string, locale: string): boolean {
  const cleanPath = cleanPathname(pathname, locale);
  
  return AUTH_ROUTES.some(route => {
    return cleanPath === route || 
           cleanPath === `${route}/` ||
           cleanPath.startsWith(route);
  });
}

/**
 * Obtener ruta de login según locale
 */
function getLoginPath(locale: string): string {
  const loginPaths: Record<string, string> = {
    es: '/auth/ingresar',
    en: '/auth/login',
    fr: '/auth/connexion',
  };
  return loginPaths[locale] || loginPaths['es'];
}

/**
 * Verificar acceso usando función de Supabase
 */
async function canAccessRoute(
  supabase: any,
  userId: string | null,
  pathname: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('can_access_route', {
      p_user_id: userId,
      p_pathname: pathname,
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

export async function middleware(request: NextRequest) {
  // 1. Cargar rutas dinámicas
  const pathnames = await loadRoutes();
  
  // 2. Manejar i18n
  const handleI18nRouting = createMiddleware({
    ...routing,
    pathnames: pathnames as any,
  });

  const response = handleI18nRouting(request);
  
  // 3. Crear cliente Supabase
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

  // 4. Obtener usuario
  const { data: { user } } = await supabase.auth.getUser();
  
  // 5. Extraer locale y pathname limpio
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const locale = ['es', 'en', 'fr'].includes(maybeLocale) ? maybeLocale : 'es';
  const cleanPath = cleanPathname(pathname, locale);

  // 6. RUTAS PÚBLICAS: Permitir acceso sin verificación
  if (isPublicRoute(pathname, locale)) {
    console.log(`✅ Ruta pública: ${pathname}`);
    return response;
  }

  // 7. RUTAS DE AUTH: Permitir acceso (evitar loops)
  if (isAuthRoute(pathname, locale)) {
    console.log(`✅ Ruta de autenticación: ${pathname}`);
    
    // Si ya está autenticado y en ruta de login/register, redirigir a inicio
    if (user && (cleanPath.includes('/login') || 
                 cleanPath.includes('/ingresar') || 
                 cleanPath.includes('/connexion') ||
                 cleanPath.includes('/register') ||
                 cleanPath.includes('/registro') ||
                 cleanPath.includes('/inscription'))) {
      console.log(`➡️ Usuario autenticado en ruta de auth, redirigiendo a inicio`);
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = `/${locale}/`;
      homeUrl.search = ''; // Limpiar query params
      return NextResponse.redirect(homeUrl);
    }
    
    return response;
  }

  // 8. RUTAS PRIVADAS SIN USUARIO: Redirigir a login
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    const loginPath = getLoginPath(locale);
    loginUrl.pathname = `/${locale}${loginPath}`;
    loginUrl.searchParams.set('redirect', pathname);
    
    console.log(`🔒 No autenticado, redirigiendo: ${pathname} → ${loginUrl.pathname}`);
    return NextResponse.redirect(loginUrl);
  }

  // 9. VERIFICAR PERMISOS (usuario autenticado en ruta privada)
  const hasAccess = await canAccessRoute(supabase, user.id, cleanPath);

  if (!hasAccess) {
    console.log(`🚫 Acceso denegado: ${pathname} (user: ${user.email})`);
    
    const forbiddenUrl = request.nextUrl.clone();
    forbiddenUrl.pathname = `/${locale}/forbidden`;
    forbiddenUrl.searchParams.set('from', pathname);
    
    return NextResponse.redirect(forbiddenUrl);
  }

  // 10. TODO OK: Permitir acceso
  console.log(`✅ Acceso permitido: ${pathname} (user: ${user.email})`);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};