// ============================================
// app/auth/callback/route.ts
// OAuth callback handler for Supabase Auth
// ✅ FIX: try-catch a nivel superior para evitar 500
// ✅ FIX: importar locales desde generated-locales (no 'use client' module)
// ✅ FIX: usar maybeSingle() en vez de single() para user_roles
// ============================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { locales, defaultLocale } from '@/src/infrastructure/config/generated-locales';

/**
 * Extrae el locale del pathname (server-safe, sin 'use client')
 */
function getLocaleFromPath(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0];
  return (locales as readonly string[]).includes(segment) ? segment : defaultLocale;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next');

  // Extraer locale del param next, o del Accept-Language header
  let locale: string = defaultLocale;
  if (nextParam) {
    locale = getLocaleFromPath(nextParam);
  } else {
    const acceptLang = request.headers.get('accept-language') || '';
    const preferred = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase();
    if (preferred && (locales as readonly string[]).includes(preferred)) {
      locale = preferred;
    }
  }

  const next = nextParam ?? `/${locale}`;

  // ✅ Try-catch a nivel superior — NUNCA retornar 500
  try {
    if (!code) {
      console.error('[Auth Callback] No code parameter');
      return NextResponse.redirect(
        `${origin}/${locale}/auth/login?error=no_code`
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (e) {
              console.warn('[Auth Callback] Cookie setAll warning:', e);
            }
          },
        },
      }
    );

    // Intercambiar el código OAuth por una sesión
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Auth Callback] Exchange error:', exchangeError.message);
      return NextResponse.redirect(
        `${origin}/${locale}/auth/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Verificar usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('[Auth Callback] getUser error:', userError?.message || 'No user');
      return NextResponse.redirect(
        `${origin}/${locale}/auth/login?error=user_not_found`
      );
    }

    // ✅ Verificar si el usuario tiene un rol asignado
    // Usar maybeSingle() — single() THROWEA si no hay rows (causa 500)
    const { data: userRole, error: roleError } = await supabase
      .schema('app')
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (roleError) {
      console.error('[Auth Callback] Role check error:', roleError.message);
    }

    if (!userRole) {
      // Sin rol asignado — redirigir a completar perfil
      const redirectAfter = encodeURIComponent(next);
      return NextResponse.redirect(
        `${origin}/${locale}/auth/complete-profile?redirect=${redirectAfter}`
      );
    }

    // ✅ Todo OK — redirigir al destino
    return NextResponse.redirect(`${origin}${next}`);

  } catch (error) {
    // ✅ Catch-all: NUNCA devolver 500, siempre redirigir
    const msg = error instanceof Error ? error.message : 'Unknown';
    console.error('[Auth Callback] UNHANDLED ERROR:', msg, error);

    return NextResponse.redirect(
      `${origin}/${locale}/auth/login?error=${encodeURIComponent('callback_failed')}`
    );
  }
}
