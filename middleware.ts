// ============================================
// middleware.ts - CON DEBUG DETALLADO
// ✅ Muestra EXACTAMENTE dónde falla
// ============================================

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const LOCALES = ['es', 'en', 'fr', 'it'] as const;
const DEFAULT_LOCALE = 'es';

type Locale = typeof LOCALES[number];

// ⚠️ RUTAS QUE NO NECESITAN VERIFICACIÓN
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup', '/auth/callback', '/error'];
const STATIC_ROUTES = ['/_next', '/api', '/favicon.ico', '/images', '/fonts'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`\n🔍 [MW START] ${pathname}`);

  // ============================================
  // 1. IGNORAR ARCHIVOS ESTÁTICOS
  // ============================================
  if (STATIC_ROUTES.some(r => pathname.startsWith(r))) {
    console.log(`⚡ [STATIC] Skipping: ${pathname}`);
    return NextResponse.next();
  }

  // ============================================
  // 2. EXTRAER LOCALE
  // ============================================
  let locale: Locale = DEFAULT_LOCALE;
  let path = pathname;

  const hasLocale = LOCALES.some(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
  
  if (hasLocale) {
    const parts = pathname.split('/');
    const extractedLocale = parts[1];
    
    if (LOCALES.includes(extractedLocale as Locale)) {
      locale = extractedLocale as Locale;
    }
    
    path = '/' + parts.slice(2).join('/') || '/';
  } else {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    console.log(`➡️ [REDIRECT] Adding locale: ${url.pathname}`);
    return NextResponse.redirect(url);
  }

  console.log(`📍 Path extracted: "${path}", Locale: "${locale}"`);

  // ============================================
  // 3. VERIFICAR SI ES RUTA PÚBLICA
  // ============================================
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    return path === route || path.startsWith(route + '/');
  });

  if (isPublicRoute) {
    console.log(`✅ [PUBLIC ROUTE] Allowing: ${path}`);
    return NextResponse.next();
  }

  console.log(`🔒 [PROTECTED ROUTE] Checking permissions for: ${path}`);

  // ============================================
  // 4. CREAR CLIENTE SUPABASE
  // ============================================
  const response = NextResponse.next();
  
  let supabase;
  try {
    supabase = createServerClient(
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
    console.log(`✅ Supabase client created`);
  } catch (error) {
    console.error(`❌ ERROR creating Supabase client:`, error);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/error`;
    url.searchParams.set('code', '500');
    url.searchParams.set('message', 'Database connection failed');
    return NextResponse.redirect(url);
  }

  // ============================================
  // 5. VERIFICAR AUTENTICACIÓN
  // ============================================
  let user;
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error(`❌ ERROR getting user:`, error);
      throw error;
    }
    
    user = data.user;
    
    if (!user) {
      console.log(`❌ No user authenticated - redirecting to login`);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/auth/login`;
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    console.log(`✅ User authenticated: ${user.email} (ID: ${user.id})`);
  } catch (error) {
    console.error(`❌ ERROR in auth check:`, error);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // ============================================
  // 6. VERIFICAR PERMISOS DE ACCESO (RBAC)
  // ============================================
  try {
    console.log(`🔐 Checking access with params:`, {
      user_id: user.id,
      pathname: path,
      language_code: locale,
    });

    const { data: canAccess, error } = await supabase.rpc('can_access_route', {
      p_user_id: user.id,
      p_pathname: path,
      p_language_code: locale,
    });

    // ✅ LOG DETALLADO DEL RESULTADO
    console.log(`📊 RPC Response:`, {
      canAccess,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      } : null,
    });

    if (error) {
      console.error(`❌ ERROR in can_access_route RPC:`, {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '500');
      url.searchParams.set('message', `Permission check failed: ${error.message}`);
      return NextResponse.redirect(url);
    }

    if (!canAccess) {
      console.log(`🚫 Access DENIED to ${path} for user ${user.email}`);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '403');
      url.searchParams.set('message', `No tienes permiso para acceder a ${path}`);
      return NextResponse.redirect(url);
    }

    console.log(`✅ Access GRANTED to ${path} for user ${user.email}`);
    console.log(`🎉 [MW END] Allowing request\n`);
    return response;

  } catch (err: any) {
    console.error(`❌ UNEXPECTED ERROR in RBAC check:`, {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    
    // ⚠️ En desarrollo, permitir acceso si hay error
    // ⚠️ En producción, negar acceso
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ DEV MODE: Allowing despite error`);
      return response;
    }
    
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/error`;
    url.searchParams.set('code', '500');
    url.searchParams.set('message', `Unexpected error: ${err.message}`);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};