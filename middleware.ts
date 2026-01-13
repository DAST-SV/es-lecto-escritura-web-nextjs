// ============================================
// middleware.ts - VERSIÓN DINÁMICA
// Rutas públicas: estáticas
// Rutas privadas: desde BD (dinámicas)
// ============================================

import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { routing, publicPathnames } from '@/src/infrastructure/config/routing.config';

// ============================================
// RUTAS PÚBLICAS (ESTÁTICAS)
// ============================================

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/acerca-de',
  '/a-propos',
  '/chi-siamo',
  '/error',
  '/forbidden',
  '/admin/routes',
  '/admin/route-permissions',
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

let dynamicRoutesCache: Record<string, any> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Cargar rutas dinámicas desde la BD
 */
async function loadDynamicRoutes(): Promise<Record<string, any>> {
  const now = Date.now();
  
  // Usar cache si está vigente
  if (dynamicRoutesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return dynamicRoutesCache;
  }

  try {
    // Importar servicio dinámicamente para evitar errores en build
    const { DynamicRoutingService } = await import(
      '@/src/infrastructure/services/routing/DynamicRoutingService'
    );
    
    const routes = await DynamicRoutingService.loadAllRoutes();
    
    dynamicRoutesCache = routes;
    cacheTimestamp = now;
    
    console.log(`✅ ${Object.keys(routes).length} rutas dinámicas cargadas`);
    return routes;
    
  } catch (error) {
    console.error('❌ Error cargando rutas dinámicas:', error);
    // Fallback vacío si falla
    return {};
  }
}

/**
 * Combinar rutas públicas estáticas + rutas privadas dinámicas
 */
async function getAllPathnames(): Promise<Record<string, any>> {
  const dynamicRoutes = await loadDynamicRoutes();
  
  // Combinar: públicas + dinámicas
  return {
    ...publicPathnames,
    ...dynamicRoutes,
  };
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
 * Verificar acceso a ruta en BD
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
  // 1. Cargar todas las rutas (públicas + dinámicas)
  const allPathnames = await getAllPathnames();
  
  // 2. Crear handler de i18n con TODAS las rutas
  const handleI18nRouting = createMiddleware({
    ...routing,
    pathnames: allPathnames as any,
  });

  const response = handleI18nRouting(request);
  
  // 3. Extraer locale y pathname
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const locale = ['es', 'en', 'fr', 'it'].includes(maybeLocale) ? maybeLocale : 'es';
  const cleanPath = cleanPathname(pathname, locale);

  // 4. RUTAS PÚBLICAS → Permitir
  if (isPublicRoute(pathname, locale)) {
    return response;
  }

  // 5. RUTAS DE AUTH → Permitir
  if (isAuthRoute(pathname, locale)) {
    return response;
  }

  // 6. Crear cliente Supabase
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
    
    return NextResponse.redirect(loginUrl);
  }

  // 9. Verificar permisos en BD
  const hasAccess = await canAccessRoute(supabase, user.id, cleanPath, locale);

  if (!hasAccess) {
    const forbiddenUrl = request.nextUrl.clone();
    forbiddenUrl.pathname = `/${locale}/forbidden`;
    forbiddenUrl.searchParams.set('from', pathname);
    
    return NextResponse.redirect(forbiddenUrl);
  }

  // 10. Acceso permitido
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};