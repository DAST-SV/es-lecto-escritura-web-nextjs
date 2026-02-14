// ============================================
// middleware.ts - CON INVALIDACIÓN DE CACHE
// ============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { publicPathnames } from '@/src/infrastructure/config/routing.config';

const LOCALES = ['es', 'en', 'fr', 'it'] as const;
const DEFAULT_LOCALE = 'es';
type Locale = typeof LOCALES[number];

const PUBLIC_ROUTES = [
  '/', '/auth/login', '/auth/register', '/auth/callback',
  '/auth/forgot-password', '/auth/reset-password', '/auth/complete-profile', '/error',
];

// Mapa derivado de routing.config: ruta traducida → ruta física
// Cubre el caso en que Supabase no responde (rutas públicas siempre accesibles)
const TRANSLATED_TO_PHYSICAL: Record<string, string> = {};
for (const [physical, translations] of Object.entries(publicPathnames)) {
  if (typeof translations === 'object') {
    for (const translated of Object.values(translations)) {
      if (translated !== physical) {
        TRANSLATED_TO_PHYSICAL[translated as string] = physical;
      }
    }
  }
}
const STATIC_ROUTES = ['/_next', '/api', '/favicon.ico', '/images', '/fonts', '/.well-known', '/auth/callback', '/sw.js', '/manifest.webmanifest', '/icons', '/offline.html'];

// ✅ Cache con TTL más corto
let routesCache: Record<string, any> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 1000; // ✅ 30 segundos (antes era 5 minutos)

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
    
    // console.log(`✅ [CACHE] ${Object.keys(pathnames).length} rutas cargadas (TTL: 30s)`);
    
    return pathnames;

  } catch (error) {
    return {};
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // console.log(`\n🔍 [MIDDLEWARE] ${pathname}`);

  // 1. Ignorar estáticos
  if (STATIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // 2. Extraer locale y traducción
  let locale: Locale = DEFAULT_LOCALE;
  let translatedPath = pathname;

  const parts = pathname.split('/').filter(Boolean);
  const maybeLocale = parts[0];
  
  if (LOCALES.includes(maybeLocale as Locale)) {
    locale = maybeLocale as Locale;
    translatedPath = '/' + parts.slice(1).join('/') || '/';
  } else {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url);
  }

  // console.log(`📍 Traducida: "${translatedPath}", Locale: "${locale}"`);

  // 3. Encontrar ruta física y traducción canónica del locale actual
  const routes = await loadRoutes();
  let physicalPathname: string | null = null;
  let canonicalTranslatedPath: string | null = null; // Ruta traducida correcta para este locale

  for (const [routePhysical, translations] of Object.entries(routes)) {
    if (typeof translations === 'string') {
      // Ruta sin traducciones: la ruta física es igual en todos los idiomas
      if (translations === translatedPath || routePhysical === translatedPath) {
        physicalPathname = routePhysical;
        canonicalTranslatedPath = routePhysical; // No hay traducción, usar la física
        break;
      }
    } else {
      const localeTranslation = translations[locale] as string | undefined;
      // Caso 1: el usuario accedió por la ruta traducida correcta del locale
      if (localeTranslation && localeTranslation === translatedPath) {
        physicalPathname = routePhysical;
        canonicalTranslatedPath = localeTranslation;
        break;
      }
      // Caso 2: el usuario accedió por la ruta física directamente (ej. /es/library)
      // o por la traducción de otro idioma → redirigir a la traducción correcta
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
    // Fallback: mapa hardcodeado de rutas públicas traducidas (cuando Supabase no responde)
    physicalPathname = TRANSLATED_TO_PHYSICAL[translatedPath] ?? translatedPath;
    canonicalTranslatedPath = physicalPathname;
  }

  // Si el usuario llegó por una ruta no canónica (física o de otro idioma), redirigir
  if (canonicalTranslatedPath && canonicalTranslatedPath !== translatedPath) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = `/${locale}${canonicalTranslatedPath}`;
    canonicalUrl.search = ''; // Limpiar params para evitar bucles
    return NextResponse.redirect(canonicalUrl);
  }

  // 4. Verificar si es pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    physicalPathname === route || physicalPathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    // console.log(`✅ [PÚBLICO]`);
    
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}${physicalPathname}`;
    
    if (rewriteUrl.pathname !== pathname) {
      // console.log(`🔄 Rewrite: ${pathname} → ${rewriteUrl.pathname}`);
      return NextResponse.rewrite(rewriteUrl);
    }
    
    return NextResponse.next();
  }

  // 5. Crear cliente Supabase
  const response = NextResponse.next();
  const supabase = createServerClient(
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

  // 6. Obtener usuario
  let user;
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    user = data.user;
    
    if (!user) {
      // console.log(`❌ Sin autenticar`);
      const currentAttempts = parseInt(request.nextUrl.searchParams.get('attempts') || '0', 10);
      const nextAttempts = currentAttempts + 1;
      if (nextAttempts > 3) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = `/${locale}`;
        homeUrl.search = '';
        return NextResponse.redirect(homeUrl);
      }
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/auth/login`;
      // Guardar la ruta traducida canónica para el redirect post-login
      const canonical = canonicalTranslatedPath || translatedPath;
      const isAuthOrHome = PUBLIC_ROUTES.some(r => canonical === r || canonical.startsWith(r + '/'));
      if (!isAuthOrHome) {
        url.searchParams.set('redirect', `/${locale}${canonical}`);
      }
      url.searchParams.set('attempts', String(nextAttempts));
      return NextResponse.redirect(url);
    }
    
    // console.log(`✅ Usuario: ${user.email}`);

    // 6.1 Check if user has a role assigned
    const { data: userRole } = await supabase
      .schema('app')
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!userRole) {
      // No role — redirect to complete profile (unless already there)
      if (!translatedPath.startsWith('/auth/complete-profile')) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/auth/complete-profile`;
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    // Silenciar AuthSessionMissingError (usuario no autenticado es esperado)
    // console.error(`❌ Error auth:`, error);
    const currentAttempts = parseInt(request.nextUrl.searchParams.get('attempts') || '0', 10);
    const nextAttempts = currentAttempts + 1;
    if (nextAttempts > 3) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = `/${locale}`;
      homeUrl.search = '';
      return NextResponse.redirect(homeUrl);
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    const canonical = canonicalTranslatedPath || translatedPath;
    const isAuthOrHome = PUBLIC_ROUTES.some(r => canonical === r || canonical.startsWith(r + '/'));
    if (!isAuthOrHome) {
      url.searchParams.set('redirect', `/${locale}${canonical}`);
    }
    url.searchParams.set('attempts', String(nextAttempts));
    return NextResponse.redirect(url);
  }

  // 7. ✅ VERIFICAR PERMISOS (MUY IMPORTANTE)
  try {
    // console.log(`🔐 Verificando: "${translatedPath}" (${locale})`);

    const { data: canAccess, error } = await supabase.rpc('can_access_route', {
      p_user_id: user.id,
      p_translated_path: translatedPath,
      p_language_code: locale,
    });

    // console.log(`📊 can_access_route = ${canAccess}`);

    if (error) {
      // ✅ En caso de error, DENEGAR por seguridad
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '500');
      url.searchParams.set('message', 'Error verificando permisos');
      return NextResponse.redirect(url);
    }

    // ✅ Si no tiene acceso, DENEGAR
    if (!canAccess) {
      // console.log(`🚫 ACCESO DENEGADO`);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '403');
      url.searchParams.set('message', `Sin acceso a ${translatedPath}`);
      return NextResponse.redirect(url);
    }

    // console.log(`✅ ACCESO PERMITIDO`);
    
    // 8. Reescribir URL
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}${physicalPathname}`;
    
    if (rewriteUrl.pathname !== pathname) {
      // console.log(`🔄 Rewrite: ${pathname} → ${rewriteUrl.pathname}\n`);
      return NextResponse.rewrite(rewriteUrl);
    }
    
    return response;

  } catch (err: any) {
    // ✅ IMPORTANTE: En producción, DENEGAR por seguridad
    if (process.env.NODE_ENV === 'production') {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '500');
      return NextResponse.redirect(url);
    }
    
    // En desarrollo, permitir
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}${physicalPathname}`;
    
    if (rewriteUrl.pathname !== pathname) {
      return NextResponse.rewrite(rewriteUrl);
    }
    
    return response;
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|icons/.*|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};