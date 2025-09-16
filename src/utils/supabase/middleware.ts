import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { i18nConfig, isLocale, type Locale } from '@/src/i18n/config';
import { routing } from '@/src/i18n/routing';

/**
 * Rutas públicas accesibles sin autenticación.
 * Se pueden listar exactas o prefijos.
 */
const PUBLIC_ROUTES: string[] = [
  '/error',
  '/',      // raíz sin locale
  '/es',    // raíz con locale español
  '/en'     // raíz con locale inglés
];


export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {
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

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ✅ Detectar si la ruta actual corresponde a login (incluyendo traducciones)
  const loginPaths = Object.values(routing.pathnames['/auth/login']);
  const isLogin = loginPaths.some((loginPath) =>
    pathname.endsWith(loginPath) ||
    i18nConfig.locales.some((locale) => pathname === `/${locale}${loginPath}`)
  );

  // ✅ Determinar si la ruta es pública
  const isPublicRoute =
    isLogin ||
    PUBLIC_ROUTES.some(
      (route) =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

  // 🚨 Si no hay usuario y la ruta no es pública → redirigir a login
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone();
    const segments = pathname.split('/');

    // Resolver el locale desde la URL o usar el default
    const maybeLocale = segments[1];
    const locale: Locale = isLocale(maybeLocale)
      ? maybeLocale
      : i18nConfig.defaultLocale;

    // ✅ Usar routing.pathnames y castear a string para evitar TS error
    let loginPath = String(routing.pathnames['/auth/login'][locale]);

    // Evitar duplicar el prefijo del locale
    if (!loginPath.startsWith(`/${locale}/`)) {
      loginPath = `/${locale}${loginPath}`;
    }

    loginUrl.pathname = loginPath;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
