// ============================================
// src/infrastructure/middleware/auth.middleware.ts
// ✅ CORREGIDO: Import explícito de routing
// ============================================
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { i18nConfig, isLocale, type Locale } from '@/src/infrastructure/config/i18n.config';
import { routing } from '@/src/infrastructure/config/routing.config';

// Definir el tipo explícitamente
type RoutingPathnames = typeof routing.pathnames;

const PUBLIC_ROUTE_KEYS: string[] = [
  '/',
  '/about',
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/error'
];

function getAllTranslatedPaths(routeKey: string): string[] {
  const paths: string[] = [routeKey];
  
  // Type assertion para acceder a routing.pathnames
  const pathnames = routing.pathnames as Record<string, any>;
  const translations = pathnames[routeKey];
  
  if (translations && typeof translations === 'object') {
    Object.values(translations).forEach((path) => {
      if (typeof path === 'string') {
        paths.push(path);
      }
    });
  }
  
  return paths;
}

function isPublicPath(pathname: string, locale: Locale): boolean {
  const pathnameWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || '/'
    : pathname;

  if (pathnameWithoutLocale === '/' || pathname === `/${locale}` || pathname === `/${locale}/`) {
    return true;
  }

  return PUBLIC_ROUTE_KEYS.some((routeKey) => {
    const allPaths = getAllTranslatedPaths(routeKey);
    return allPaths.some((path) => {
      if (pathnameWithoutLocale === path || pathnameWithoutLocale === `${path}/`) {
        return true;
      }
      if (pathnameWithoutLocale.startsWith(`${path}/`)) {
        return true;
      }
      return false;
    });
  });
}

export async function updateSession(request: NextRequest, response: NextResponse) {
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

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const locale: Locale = isLocale(maybeLocale) ? maybeLocale : i18nConfig.defaultLocale;
  const publicRoute = isPublicPath(pathname, locale);

  if (!publicRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    const pathnames = routing.pathnames as Record<string, any>;
    const loginPath = pathnames['/auth/login']?.[locale] || '/auth/login';
    const fullLoginPath = `/${locale}${loginPath}`;

    if (pathname === fullLoginPath || pathname === `${fullLoginPath}/`) {
      return response;
    }

    loginUrl.pathname = fullLoginPath;
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

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
    const pathnames = routing.pathnames as Record<string, any>;
    const libraryPath = pathnames['/library']?.[locale] || '/library';
    const fullLibraryPath = `/${locale}${libraryPath}`;
    
    if (pathname === fullLibraryPath || pathname === `${fullLibraryPath}/`) {
      return response;
    }

    libraryUrl.pathname = fullLibraryPath;
    return NextResponse.redirect(libraryUrl);
  }

  return response;
}