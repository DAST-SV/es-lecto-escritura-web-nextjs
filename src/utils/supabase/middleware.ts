// ==========================================
// src/utils/supabase/middleware.ts
// ==========================================
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { i18nConfig, isLocale, type Locale } from '@/src/i18n/config';
import { routing } from '@/src/i18n/routing';

/**
 * ✅ Rutas BASE públicas (sin autenticación).
 * Usa las keys del objeto pathnames, no las rutas traducidas.
 */
const PUBLIC_ROUTE_KEYS: string[] = [
  '/',              // Home
  '/about',         // About (si existe)
  '/auth/login',    // Login (usamos la key, no /auth/ingresar)
  '/auth/register', // Register (usamos la key, no /auth/registro)
  '/auth/callback', // OAuth callback
  '/error'          // Error page
];

/**
 * Helper: Obtener todas las variantes traducidas de una ruta
 */
function getAllTranslatedPaths(routeKey: string): string[] {
  const paths: string[] = [routeKey]; // Incluir la key original
  
  // @ts-ignore - pathnames puede no tener todas las rutas
  const translations = routing.pathnames[routeKey];
  
  if (translations && typeof translations === 'object') {
    Object.values(translations).forEach((path) => {
      if (typeof path === 'string') {
        paths.push(path);
      }
    });
  }
  
  return paths;
}

/**
 * Helper: Verificar si una ruta es pública (considerando traducciones)
 */
function isPublicPath(pathname: string, locale: Locale): boolean {
  // Remover el locale del pathname
  const pathnameWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || '/'
    : pathname;

  // Verificar rutas especiales (raíz)
  if (pathnameWithoutLocale === '/' || pathname === `/${locale}` || pathname === `/${locale}/`) {
    return true;
  }

  // Verificar cada ruta pública y sus traducciones
  return PUBLIC_ROUTE_KEYS.some((routeKey) => {
    const allPaths = getAllTranslatedPaths(routeKey);
    
    return allPaths.some((path) => {
      // Comparación exacta
      if (pathnameWithoutLocale === path || pathnameWithoutLocale === `${path}/`) {
        return true;
      }
      // Con prefijo (para /auth/*)
      if (pathnameWithoutLocale.startsWith(`${path}/`)) {
        return true;
      }
      return false;
    });
  });
}

export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {
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

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Resolver locale desde la URL
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const locale: Locale = isLocale(maybeLocale)
    ? maybeLocale
    : i18nConfig.defaultLocale;

  // Verificar si es ruta pública (considerando traducciones)
  const publicRoute = isPublicPath(pathname, locale);

  console.log(`📍 Ruta: ${pathname} | Locale: ${locale} | Pública: ${publicRoute} | Usuario: ${user?.email || 'ninguno'}`);

  // 🔒 Si NO es ruta pública y NO hay usuario → redirigir a login
  if (!publicRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    
    // Obtener la ruta de login traducida para el locale actual
    const loginPath = routing.pathnames['/auth/login'][locale];
    const fullLoginPath = `/${locale}${loginPath}`;

    // Evitar loop si ya estamos en login
    if (pathname === fullLoginPath || pathname === `${fullLoginPath}/`) {
      console.log(`⚠️ Ya en login, permitiendo acceso`);
      return response;
    }

    loginUrl.pathname = fullLoginPath;
    loginUrl.searchParams.set('redirect', pathname);
    
    console.log(`🔒 Bloqueado: ${pathname} → ${fullLoginPath}`);
    
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Si está autenticado e intenta ir a login/register → redirigir a library
  const loginPaths = getAllTranslatedPaths('/auth/login');
  const registerPaths = getAllTranslatedPaths('/auth/register');
  const authPaths = [...loginPaths, ...registerPaths];
  
  const pathnameWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || '/'
    : pathname;

  const isAuthPage = authPaths.some(authPath => 
    pathnameWithoutLocale === authPath || 
    pathnameWithoutLocale === `${authPath}/`
  );

  if (isAuthPage && user) {
    const libraryUrl = request.nextUrl.clone();
    const libraryPath = routing.pathnames['/library'][locale];
    const fullLibraryPath = `/${locale}${libraryPath}`;
    
    // Evitar loop
    if (pathname === fullLibraryPath || pathname === `${fullLibraryPath}/`) {
      console.log(`⚠️ Ya en biblioteca, permitiendo acceso`);
      return response;
    }

    libraryUrl.pathname = fullLibraryPath;
    
    console.log(`✅ Usuario en auth → ${fullLibraryPath}`);
    
    return NextResponse.redirect(libraryUrl);
  }

  console.log(`✅ Acceso permitido: ${pathname}`);
  
  return response;
}