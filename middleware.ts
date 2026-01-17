// ============================================
// middleware.ts - VERSIÓN SIMPLIFICADA
// ✅ Sin conflictos, solo una llamada a can_access_route
// ============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const LOCALES = ['es', 'en', 'fr', 'it'] as const;
const DEFAULT_LOCALE = 'es';
type Locale = typeof LOCALES[number];

// Rutas que NO necesitan verificación
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup', '/auth/callback', '/error'];
const STATIC_ROUTES = ['/_next', '/api', '/favicon.ico', '/images', '/fonts'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`\n🔍 [MIDDLEWARE] ${pathname}`);

  // 1. Ignorar archivos estáticos
  if (STATIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // 2. Extraer locale del pathname
  let locale: Locale = DEFAULT_LOCALE;
  let path = pathname;

  const parts = pathname.split('/').filter(Boolean);
  const maybeLocale = parts[0];
  
  if (LOCALES.includes(maybeLocale as Locale)) {
    locale = maybeLocale as Locale;
    path = '/' + parts.slice(1).join('/') || '/';
  } else {
    // Redirigir para agregar locale
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    console.log(`➡️ Agregando locale: ${url.pathname}`);
    return NextResponse.redirect(url);
  }

  console.log(`📍 Path: "${path}", Locale: "${locale}"`);

  // 3. Verificar si es ruta pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    path === route || path.startsWith(route + '/')
  );

  if (isPublicRoute) {
    console.log(`✅ [PÚBLICO] ${path}`);
    return NextResponse.next();
  }

  // 4. Crear cliente Supabase
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

  // 5. Obtener usuario
  let user;
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    user = data.user;
    
    if (!user) {
      console.log(`❌ Sin autenticar - redirigiendo a login`);
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

  // 6. Verificar permisos con can_access_route
  try {
    console.log(`🔐 Verificando acceso a: ${path}`);

    // ✅ LLAMADA SIMPLE, SIN CONFLICTOS
    const { data: canAccess, error } = await supabase.rpc('can_access_route', {
      p_user_id: user.id,
      p_pathname: path,
      p_language_code: locale,
    });

    console.log(`📊 Resultado:`, { canAccess, error });

    if (error) {
      console.error(`❌ Error en can_access_route:`, error);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '500');
      url.searchParams.set('message', error.message);
      return NextResponse.redirect(url);
    }

    if (!canAccess) {
      console.log(`🚫 Acceso DENEGADO`);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '403');
      url.searchParams.set('message', `Sin permiso para ${path}`);
      return NextResponse.redirect(url);
    }

    console.log(`✅ Acceso PERMITIDO\n`);
    return response;

  } catch (err: any) {
    console.error(`❌ Error inesperado:`, err);
    
    // En desarrollo, permitir; en producción, denegar
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ DEV MODE: Permitiendo a pesar del error`);
      return response;
    }
    
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/error`;
    url.searchParams.set('code', '500');
    url.searchParams.set('message', err.message);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};