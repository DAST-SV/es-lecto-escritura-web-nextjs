// ============================================
// middleware.ts - VERSIÓN CORREGIDA UNIFICADA
// ✅ Combina i18n + auth + RBAC en un solo flujo
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

  console.log(`🔍 [MW] ${pathname}`);

  // ============================================
  // 1. IGNORAR ARCHIVOS ESTÁTICOS
  // ============================================
  if (STATIC_ROUTES.some(r => pathname.startsWith(r))) {
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
    // Redirigir para agregar locale
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    console.log(`➡️ Redirect to: ${url.pathname}`);
    return NextResponse.redirect(url);
  }

  console.log(`📍 Path: ${path}, Locale: ${locale}`);

  // ============================================
  // 3. VERIFICAR SI ES RUTA PÚBLICA
  // ============================================
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    return path === route || path.startsWith(route + '/');
  });

  if (isPublicRoute) {
    console.log(`✅ [PUBLIC] ${path}`);
    return NextResponse.next();
  }

  // ============================================
  // 4. CREAR CLIENTE SUPABASE
  // ============================================
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

  // ============================================
  // 5. VERIFICAR AUTENTICACIÓN
  // ============================================
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log(`❌ No user - redirect to login`);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  console.log(`✅ User authenticated: ${user.email}`);

  // ============================================
  // 6. VERIFICAR PERMISOS DE ACCESO (RBAC)
  // ============================================
  try {
    const { data: canAccess, error } = await supabase.rpc('can_access_route', {
      p_user_id: user.id,
      p_pathname: path,
      p_language_code: locale,
    });

    if (error) {
      console.error(`❌ Error checking access:`, error);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '500');
      return NextResponse.redirect(url);
    }

    if (!canAccess) {
      console.log(`🚫 Access denied to ${path}`);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '403');
      return NextResponse.redirect(url);
    }

    console.log(`✅ Access granted to ${path}`);
    return response;

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return response; // Permitir en caso de error inesperado
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};