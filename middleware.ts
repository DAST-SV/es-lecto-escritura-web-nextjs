// middleware.ts - VERSIÓN ULTRA SIMPLE

import { NextResponse, type NextRequest } from 'next/server';

const LOCALES = ['es', 'en', 'fr', 'it'];
const DEFAULT_LOCALE = 'es';

// ⚠️ ESTAS RUTAS PASAN SIN VERIFICAR NADA
const BYPASS_ROUTES = [
  '/admin',
  '/error',
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
];

const STATIC_ROUTES = ['/_next', '/api', '/favicon.ico', '/images', '/fonts'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔍 [MW] ${pathname}`);

  // Ignorar estáticas
  if (STATIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Extraer locale
  let locale = DEFAULT_LOCALE;
  let path = pathname;

  const hasLocale = LOCALES.some(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
  
  if (hasLocale) {
    const parts = pathname.split('/');
    locale = parts[1];
    path = '/' + parts.slice(2).join('/') || '/';
  } else {
    // Agregar locale
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    console.log(`➡️ Redirect to: ${url.pathname}`);
    return NextResponse.redirect(url);
  }

  console.log(`📍 Path: ${path}`);

  // ⚡ BYPASS - Verificar si empieza con alguna ruta bypass
  const shouldBypass = BYPASS_ROUTES.some(route => {
    return path === route || path.startsWith(route + '/');
  });

  if (shouldBypass) {
    console.log(`✅ [BYPASS] ${path} - PERMITIDO`);
    return NextResponse.next();
  }

  // Para todo lo demás: auth + permisos
  console.log(`🔒 [PROTECTED] ${path}`);

  try {
    const { createServerClient } = await import('@supabase/ssr');
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log(`❌ No user - redirect to login`);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/auth/login`;
      return NextResponse.redirect(url);
    }

    const { SupabasePermissionRepository } = await import('@/src/infrastructure/repositories/SupabasePermissionRepository');
    const { CheckRouteAccessUseCase } = await import('@/src/core/application/use-cases/CheckRouteAccessUseCase');

    const repo = new SupabasePermissionRepository();
    const useCase = new CheckRouteAccessUseCase(repo);
    const canAccess = await useCase.execute(user.id, path, locale);

    if (!canAccess) {
      console.log(`🚫 No permission`);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/error`;
      url.searchParams.set('code', '403');
      return NextResponse.redirect(url);
    }

    console.log(`✅ Access granted`);
    return NextResponse.next();
  } catch (err) {
    console.error('❌ Error:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};