// ============================================
// src/infrastructure/middleware/rbac.middleware.ts
// ✅ MIDDLEWARE CON RBAC DINÁMICO
// ============================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { i18nConfig, isLocale, type Locale } from '@/src/infrastructure/config/i18n.config';

export async function updateSessionWithRBAC(request: NextRequest, response: NextResponse) {
  // 1. Crear cliente Supabase
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

  // 2. Obtener usuario
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const locale: Locale = isLocale(maybeLocale) ? maybeLocale : i18nConfig.defaultLocale;

  // 3. Limpiar pathname (sin locale)
  const pathnameWithoutLocale = pathname.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || '/'
    : pathname;

  // 4. Verificar acceso usando función de Supabase
  try {
    const { data: canAccess, error } = await supabase.rpc('can_access_route', {
      p_user_id: user?.id || null,
      p_pathname: pathnameWithoutLocale,
      p_organization_id: null, // Puedes obtener esto del contexto
    });

    if (error) {
      console.error('❌ Error verificando acceso:', error);
      // En caso de error, denegar acceso por seguridad
      return redirectToLogin(request, locale, pathname, 'Error de autorizaci��n');
    }

    // 5. Si no tiene acceso
    if (!canAccess) {
      if (!user) {
        // No autenticado
        return redirectToLogin(request, locale, pathname, 'Requiere autenticación');
      } else {
        // Autenticado pero sin permisos
        return redirectToForbidden(request, locale, pathname);
      }
    }

    // 6. Si está en ruta de auth y ya está autenticado
    if (isAuthRoute(pathnameWithoutLocale) && user) {
      const { data: routes } = await supabase.rpc('get_accessible_routes', {
        p_user_id: user.id,
        p_language_code: locale,
        p_organization_id: null,
        p_show_in_menu_only: false,
      });

      // Redirigir a la primera ruta accesible (dashboard)
      if (routes && routes.length > 0) {
        const firstRoute = routes[0];
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/${locale}${firstRoute.translated_path}`;
        
        if (pathname !== redirectUrl.pathname) {
          console.log(`➡️ Usuario autenticado redirigido: ${pathname} → ${redirectUrl.pathname}`);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    // 7. Acceso permitido
    if (user) {
      const { data: roleName } = await supabase.rpc('get_user_highest_role', {
        p_user_id: user.id,
        p_organization_id: null,
      });
      console.log(`✅ Acceso permitido: ${pathname} (${roleName || 'sin rol'})`);
    }

    return response;

  } catch (error) {
    console.error('❌ Error fatal en middleware:', error);
    return redirectToLogin(request, locale, pathname, 'Error del sistema');
  }
}

// ============================================
// HELPERS
// ============================================

function redirectToLogin(
  request: NextRequest,
  locale: Locale,
  pathname: string,
  reason: string
): NextResponse {
  const loginUrl = request.nextUrl.clone();
  const loginPath = getLoginPath(locale);
  const fullLoginPath = `/${locale}${loginPath}`;

  // Evitar loop
  if (pathname === fullLoginPath || pathname === `${fullLoginPath}/`) {
    return NextResponse.next();
  }

  loginUrl.pathname = fullLoginPath;
  loginUrl.searchParams.set('redirect', pathname);
  loginUrl.searchParams.set('error', reason);

  console.log(`🔒 Acceso denegado: ${pathname} (${reason})`);
  return NextResponse.redirect(loginUrl);
}

function redirectToForbidden(
  request: NextRequest,
  locale: Locale,
  pathname: string
): NextResponse {
  const forbiddenUrl = request.nextUrl.clone();
  forbiddenUrl.pathname = `/${locale}/forbidden`;
  forbiddenUrl.searchParams.set('from', pathname);

  console.log(`🚫 Acceso prohibido: ${pathname}`);
  return NextResponse.redirect(forbiddenUrl);
}

function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/auth/');
}

function getLoginPath(locale: Locale): string {
  const paths: Record<Locale, string> = {
    es: '/auth/ingresar',
    en: '/auth/login',
    fr: '/auth/connexion',
  };
  return paths[locale] || '/auth/login';
}