// ============================================
// middleware.ts - CON INVALIDACIÓN DE CACHE
// ============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const LOCALES = ['es', 'en', 'fr', 'it'] as const;
const DEFAULT_LOCALE = 'es';
type Locale = typeof LOCALES[number];

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/auth/callback', '/error'];
const STATIC_ROUTES = ['/_next', '/api', '/favicon.ico', '/images', '/fonts'];

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
    
    console.log(`✅ [CACHE] ${Object.keys(pathnames).length} rutas cargadas (TTL: 30s)`);
    
    return pathnames;

  } catch (error) {
    console.error('❌ [CACHE] Error:', error);
    return {};
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`\n🔍 [MIDDLEWARE] ${pathname}`);

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

  console.log(`📍 Traducida: "${translatedPath}", Locale: "${locale}"`);

  // 3. Encontrar ruta física
  const routes = await loadRoutes();
  let physicalPathname: string | null = null;

  for (const [pathname, translations] of Object.entries(routes)) {
    if (typeof translations === 'string') {
      if (translations === translatedPath) {
        physicalPathname = pathname;
        break;
      }
    } else {
      if (translations[locale] === translatedPath) {
        physicalPathname = pathname;
        console.log(`✅ Física: ${pathname}`);
        break;
      }
    }
  }

  if (!physicalPathname) {
    console.log(`⚠️ No se encontró traducción, usando: ${translatedPath}`);
    physicalPathname = translatedPath;
  }

  // 4. Verificar si es pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    physicalPathname === route || physicalPathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    console.log(`✅ [PÚBLICO]`);
    
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}${physicalPathname}`;
    
    if (rewriteUrl.pathname !== pathname) {
      console.log(`🔄 Rewrite: ${pathname} → ${rewriteUrl.pathname}`);
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
      console.log(`❌ Sin autenticar`);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/auth/login`;
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    console.log(`✅ Usuario: ${user.email}`);
  } catch (error) {
    console.error(`❌ Error auth:`, error);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    return NextResponse.redirect(url);
  }

  // 7. ✅ VERIFICAR PERMISOS (MUY IMPORTANTE)
  try {
    console.log(`🔐 Verificando: "${translatedPath}" (${locale})`);

    const { data: canAccess, error } = await supabase.rpc('can_access_route', {
      p_user_id: user.id,
      p_translated_path: translatedPath,
      p_language_code: locale,
    });

    console.log(`📊 can_access_route = ${canAccess}`);

    if (error) {
      console.error(`❌ Error RPC:`, error);
      
      // ✅ En caso de error, DENEGAR por seguridad
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '500');
      url.searchParams.set('message', 'Error verificando permisos');
      return NextResponse.redirect(url);
    }

    // ✅ Si no tiene acceso, DENEGAR
    if (!canAccess) {
      console.log(`🚫 ACCESO DENEGADO`);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '403');
      url.searchParams.set('message', `Sin acceso a ${translatedPath}`);
      return NextResponse.redirect(url);
    }

    console.log(`✅ ACCESO PERMITIDO`);
    
    // 8. Reescribir URL
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}${physicalPathname}`;
    
    if (rewriteUrl.pathname !== pathname) {
      console.log(`🔄 Rewrite: ${pathname} → ${rewriteUrl.pathname}\n`);
      return NextResponse.rewrite(rewriteUrl);
    }
    
    return response;

  } catch (err: any) {
    console.error(`❌ Error inesperado:`, err);
    
    // ✅ IMPORTANTE: En producción, DENEGAR por seguridad
    if (process.env.NODE_ENV === 'production') {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '500');
      return NextResponse.redirect(url);
    }
    
    // En desarrollo, permitir pero logear error
    console.log(`⚠️ DEV: Permitiendo a pesar del error`);
    
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${locale}${physicalPathname}`;
    
    if (rewriteUrl.pathname !== pathname) {
      return NextResponse.rewrite(rewriteUrl);
    }
    
    return response;
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};