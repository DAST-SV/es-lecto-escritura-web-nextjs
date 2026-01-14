// ============================================
// CAPA: INFRASTRUCTURE (Framework Integration)
// Ubicación: middleware.ts (raíz del proyecto)
// Propósito: Middleware de Next.js para proteger rutas server-side
// ============================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de Next.js que protege rutas usando RBAC
 */
export async function middleware(request: NextRequest) {
  // 🔍 DEBUG: Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; // ✅ TU VARIABLE

  // Si no hay variables, mostrar error detallado
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR EN MIDDLEWARE:');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ NO DEFINIDA');
    console.error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:', supabaseKey ? '✅ Definida' : '❌ NO DEFINIDA');
    console.error('');
    console.error('SOLUCIÓN:');
    console.error('1. Verifica que .env.local esté en la RAÍZ del proyecto');
    console.error('2. Verifica que tenga las variables correctas');
    console.error('3. Reinicia el servidor (npm run dev)');
    
    // Retornar error visible
    return new NextResponse(
      JSON.stringify({
        error: 'Variables de entorno no configuradas',
        details: {
          url: supabaseUrl ? 'OK' : 'FALTA',
          key: supabaseKey ? 'OK' : 'FALTA',
        },
        solution: 'Crea .env.local en la raíz con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  // Crear cliente Supabase para SSR
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  // Extraer pathname y locale
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1] || 'es';
  const routePath = pathname.replace(`/${locale}`, '') || '/';

  // Definir rutas públicas (no requieren autenticación)
  const publicRoutes = [
    '/', 
    '/auth/login', 
    '/auth/register', 
    '/auth/callback',
    '/auth/error',
    '/unauthorized'
  ];
  
  const isPublicRoute = publicRoutes.some(
    route => routePath === route || routePath.startsWith('/auth')
  );

  // 🔍 DEBUG: Log de ruta
  console.log(`[Middleware] ${routePath} - Usuario: ${user ? user.email : 'No autenticado'} - Público: ${isPublicRoute}`);

  // Si es ruta pública, permitir acceso
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    console.log(`[Middleware] Redirigiendo a login: ${routePath}`);
    const redirectUrl = new URL(`/${locale}/auth/login`, request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Verificar acceso a la ruta con RBAC
  try {
    const { data: canAccess, error } = await supabase.rpc('can_access_route', {
      p_user_id: user.id,
      p_pathname: routePath,
      p_language_code: locale,
    });

    if (error) {
      console.error('[Middleware] Error checking route access:', error);
      // En desarrollo, permitir acceso si hay error
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Middleware] MODO DESARROLLO: Permitiendo acceso a pesar del error');
        return supabaseResponse;
      }
      return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
    }

    // Si no tiene acceso, redirigir a página no autorizada
    if (!canAccess) {
      console.log(`[Middleware] Acceso denegado para ${user.email} a ${routePath}`);
      return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
    }

    console.log(`[Middleware] Acceso permitido para ${user.email} a ${routePath}`);
    return supabaseResponse;
    
  } catch (err) {
    console.error('[Middleware] Unexpected error:', err);
    // En desarrollo, permitir acceso
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Middleware] MODO DESARROLLO: Permitiendo acceso a pesar del error');
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL(`/${locale}/error`, request.url));
  }
}

/**
 * Configuración del matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};