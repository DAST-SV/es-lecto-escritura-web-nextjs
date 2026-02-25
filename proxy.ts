// ============================================
// proxy.ts — Middleware con locales dinámicos desde app.languages
// ✅ FIX: Cookie propagation en TODAS las rutas (público y privado)
// ============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { locales as STATIC_LOCALES, defaultLocale as STATIC_DEFAULT } from '@/src/infrastructure/config/generated-locales';

const PUBLIC_ROUTES = [
  '/', '/auth/login', '/auth/register', '/auth/callback',
  '/auth/forgot-password', '/auth/reset-password', '/auth/complete-profile', '/error',
  '/explore',
];

const STATIC_ROUTES = ['/_next', '/api', '/favicon.ico', '/images', '/fonts', '/.well-known', '/auth/callback', '/sw.js', '/manifest.webmanifest', '/icons', '/offline.html'];

// ============================================
// Cache de locales dinámicos desde app.languages
// ============================================
let localesCache: string[] | null = null;
let defaultLocaleCache: string | null = null;
let localesCacheTimestamp = 0;
const LOCALES_CACHE_TTL = 60 * 1000; // 1 minuto

async function loadLocales(): Promise<{ locales: string[], defaultLocale: string }> {
  const now = Date.now();
  if (localesCache && (now - localesCacheTimestamp) < LOCALES_CACHE_TTL) {
    return { locales: localesCache, defaultLocale: defaultLocaleCache! };
  }
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    const { data, error } = await supabase
      .schema('app')
      .from('languages')
      .select('code, is_default')
      .eq('is_active', true)
      .order('order_index');
    if (error) throw error;
    localesCache = (data || []).map((l: any) => l.code);
    defaultLocaleCache = data?.find((l: any) => l.is_default)?.code || STATIC_DEFAULT;
    localesCacheTimestamp = now;
    return { locales: localesCache, defaultLocale: defaultLocaleCache };
  } catch {
    return { locales: [...STATIC_LOCALES], defaultLocale: STATIC_DEFAULT };
  }
}

// ============================================
// Cache de rutas traducidas
// ============================================
let routesCache: Record<string, any> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 1000;

async function loadRoutes(forceReload = false): Promise<Record<string, any>> {
  const now = Date.now();

  if (!forceReload && routesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return routesCache;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data: routes, error } = await supabase
      .schema('app')
      .from('routes')
      .select(`
        pathname,
        route_translations (
          language_code,
          translated_path
        )
      `)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (error) throw error;

    const pathnames: Record<string, any> = {};

    routes?.forEach((route: any) => {
      const translations: Record<string, string> = {};

      if (route.route_translations && route.route_translations.length > 0) {
        route.route_translations.forEach((t: any) => {
          translations[t.language_code] = t.translated_path;
        });
        pathnames[route.pathname] = translations;
      } else {
        pathnames[route.pathname] = route.pathname;
      }
    });

    routesCache = pathnames;
    cacheTimestamp = now;

    return pathnames;

  } catch (error) {
    return {};
  }
}

/**
 * Traduce una ruta física al locale especificado
 */
function getTranslatedPath(physicalPath: string, targetLocale: string, routes: Record<string, any>): string {
  const translations = routes[physicalPath];
  if (!translations) return physicalPath;
  if (typeof translations === 'string') return translations;
  return translations[targetLocale] || physicalPath;
}

/**
 * Copia las cookies de un response a otro (para rewrites/redirects)
 * CRÍTICO: Sin esto, el token refresh de Supabase se pierde
 */
function copyResponseCookies(from: NextResponse, to: NextResponse): void {
  from.cookies.getAll().forEach(cookie => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

/**
 * Crea el Supabase server client para el middleware.
 * Llama a getUser() para refrescar el token y setear cookies actualizadas.
 */
function createMiddlewareSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ignorar estáticos
  if (STATIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // 2. Cargar locales dinámicamente desde app.languages
  const { locales: activeLocales, defaultLocale: activeDefault } = await loadLocales();

  // 3. Extraer locale y traducción
  let locale = activeDefault;
  let translatedPath = pathname;

  const parts = pathname.split('/').filter(Boolean);
  const maybeLocale = parts[0];

  if (activeLocales.includes(maybeLocale)) {
    locale = maybeLocale;
    translatedPath = '/' + parts.slice(1).join('/') || '/';
  } else {
    const url = request.nextUrl.clone();
    url.pathname = `/${activeDefault}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 4. Encontrar ruta física y traducción canónica del locale actual
  const routes = await loadRoutes();
  let physicalPathname: string | null = null;
  let canonicalTranslatedPath: string | null = null;

  for (const [routePhysical, translations] of Object.entries(routes)) {
    if (typeof translations === 'string') {
      if (translations === translatedPath || routePhysical === translatedPath) {
        physicalPathname = routePhysical;
        canonicalTranslatedPath = routePhysical;
        break;
      }
    } else {
      const localeTranslation = translations[locale] as string | undefined;
      if (localeTranslation && localeTranslation === translatedPath) {
        physicalPathname = routePhysical;
        canonicalTranslatedPath = localeTranslation;
        break;
      }
      const isPhysicalPath = routePhysical === translatedPath;
      const isOtherLocaleTranslation = Object.values(translations).includes(translatedPath);
      if (isPhysicalPath || isOtherLocaleTranslation) {
        physicalPathname = routePhysical;
        canonicalTranslatedPath = localeTranslation ?? routePhysical;
        break;
      }
    }
  }

  if (!physicalPathname) {
    physicalPathname = translatedPath;
    canonicalTranslatedPath = translatedPath;
  }

  // Si el usuario llegó por una ruta no canónica, redirigir
  if (canonicalTranslatedPath && canonicalTranslatedPath !== translatedPath) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = `/${locale}${canonicalTranslatedPath}`;
    canonicalUrl.search = '';
    return NextResponse.redirect(canonicalUrl);
  }

  // ============================================
  // 5. CREAR SUPABASE CLIENT Y REFRESCAR SESIÓN
  // ✅ CRÍTICO: Se hace para TODAS las rutas (públicas y privadas)
  // para que el browser siempre reciba cookies de sesión actualizadas
  // ============================================
  const response = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(request, response);

  // Llamar getUser() para refrescar el token JWT (crítico para sesión)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // 6. Verificar si es pública
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    physicalPathname === route || physicalPathname!.startsWith(route + '/')
  );

  if (isPublicRoute) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}${physicalPathname}`;

    if (rewriteUrl.pathname !== pathname) {
      const rewriteResponse = NextResponse.rewrite(rewriteUrl);
      // ✅ COPIAR cookies de sesión al rewrite response
      copyResponseCookies(response, rewriteResponse);
      return rewriteResponse;
    }

    return response;
  }

  // ============================================
  // 7. RUTAS PRIVADAS — verificar autenticación
  // ============================================
  try {
    if (userError || !user) {
      const currentAttempts = parseInt(request.nextUrl.searchParams.get('attempts') || '0', 10);
      const nextAttempts = currentAttempts + 1;
      if (nextAttempts > 3) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = `/${locale}`;
        homeUrl.search = '';
        return NextResponse.redirect(homeUrl);
      }
      const url = request.nextUrl.clone();
      const loginPath = getTranslatedPath('/auth/login', locale, routes);
      url.pathname = `/${locale}${loginPath}`;
      const canonical = canonicalTranslatedPath || translatedPath;
      const isAuthOrHome = PUBLIC_ROUTES.some(r => canonical === r || canonical.startsWith(r + '/'));
      if (!isAuthOrHome) {
        url.searchParams.set('redirect', `/${locale}${canonical}`);
      }
      url.searchParams.set('attempts', String(nextAttempts));
      return NextResponse.redirect(url);
    }

    // 7.1 Check if user has a role assigned
    // ✅ maybeSingle() — single() throwea si 0 rows (causa 500 para OAuth users nuevos)
    const { data: userRole } = await supabase
      .schema('app')
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (!userRole) {
      if (!translatedPath.startsWith('/auth/complete-profile')) {
        const url = request.nextUrl.clone();
        const completeProfilePath = getTranslatedPath('/auth/complete-profile', locale, routes);
        url.pathname = `/${locale}${completeProfilePath}`;
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    const currentAttempts = parseInt(request.nextUrl.searchParams.get('attempts') || '0', 10);
    const nextAttempts = currentAttempts + 1;
    if (nextAttempts > 3) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = `/${locale}`;
      homeUrl.search = '';
      return NextResponse.redirect(homeUrl);
    }
    const url = request.nextUrl.clone();
    const loginPath = getTranslatedPath('/auth/login', locale, routes);
    url.pathname = `/${locale}${loginPath}`;
    const canonical = canonicalTranslatedPath || translatedPath;
    const isAuthOrHome = PUBLIC_ROUTES.some(r => canonical === r || canonical.startsWith(r + '/'));
    if (!isAuthOrHome) {
      url.searchParams.set('redirect', `/${locale}${canonical}`);
    }
    url.searchParams.set('attempts', String(nextAttempts));
    return NextResponse.redirect(url);
  }

  // ============================================
  // 8. VERIFICAR PERMISOS
  // ============================================
  try {
    const { data: canAccess, error } = await supabase.rpc('can_access_route', {
      p_user_id: user!.id,
      p_translated_path: translatedPath,
      p_language_code: locale,
    });

    if (error) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '500');
      url.searchParams.set('message', 'Error verificando permisos');
      return NextResponse.redirect(url);
    }

    if (!canAccess) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '403');
      url.searchParams.set('message', `Sin acceso a ${translatedPath}`);
      return NextResponse.redirect(url);
    }

    // 9. Reescribir URL — CON cookies de sesión
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}${physicalPathname}`;

    if (rewriteUrl.pathname !== pathname) {
      const rewriteResponse = NextResponse.rewrite(rewriteUrl);
      // ✅ COPIAR cookies de sesión al rewrite response
      copyResponseCookies(response, rewriteResponse);
      return rewriteResponse;
    }

    return response;

  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '500');
      return NextResponse.redirect(url);
    }

    // En desarrollo, permitir con cookies
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}${physicalPathname}`;

    if (rewriteUrl.pathname !== pathname) {
      const rewriteResponse = NextResponse.rewrite(rewriteUrl);
      copyResponseCookies(response, rewriteResponse);
      return rewriteResponse;
    }

    return response;
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|icons/.*|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};
