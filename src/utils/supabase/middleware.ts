import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { i18nConfig, isLocale, type Locale } from '@/src/i18n/config';

/**
 * Lista de rutas públicas accesibles sin autenticación.
 * - Se soportan rutas exactas ("/login")
 * - También rutas con prefijos (ej: "/auth" cubre "/auth/*")
 * - Al usar locales, se recomienda incluirlas tanto con como sin prefijo de idioma
 */
const PUBLIC_ROUTES: string[] = [
  '/login',      // login genérico sin locale
  '/auth',       // rutas relacionadas con autenticación
  '/error',      // página de error global
];

/**
 * Middleware que actualiza la sesión de usuario usando Supabase
 * y redirige a login si se accede a una ruta protegida sin sesión activa.
 *
 * @param request - Petición entrante de Next.js
 * @param response - Respuesta inicial (ej. de next-intl middleware)
 * @returns NextResponse modificado o el response original
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {
  // Crear cliente de Supabase en servidor, enlazado a cookies de la request/response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,               // URL pública de Supabase
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,   // Llave pública (anon)
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Actualiza cookies en request y en response (sincronización cliente/servidor)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Revalidar sesión activa del usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Construir patrón dinámico para rutas de login con soporte multi-locale
  // Ejemplo: ^/(en|es)/login
  const loginPattern = new RegExp(`^/(${i18nConfig.locales.join('|')})/login`);

  // Determinar si la ruta actual corresponde al login
  const isLogin = loginPattern.test(pathname) || pathname === '/login';

  // Verificar si la ruta es pública (exacta o prefijo)
  const isPublicRoute = isLogin || PUBLIC_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Si no hay usuario y la ruta no es pública → redirigir al login correspondiente
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone();
    const segments = pathname.split('/');

    // Resolver el locale desde la URL o usar el default
    const maybeLocale = segments[1];
    const locale: Locale = isLocale(maybeLocale)
      ? maybeLocale
      : i18nConfig.defaultLocale;

    // Redirigir a la ruta de login con el locale correcto
    loginUrl.pathname = `/${locale}/login`;
    return NextResponse.redirect(loginUrl);
  }

  // Si la sesión es válida o la ruta es pública → continuar normalmente
  return response;
}
