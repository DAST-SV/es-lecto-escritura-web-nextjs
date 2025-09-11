import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { routing } from '@/src/i18n/routing';
import { updateSession } from '@/src/utils/supabase/middleware';

// Middleware de internacionalización
const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Primero resuelve el locale con next-intl
  const response = handleI18nRouting(request);

  // Luego valida sesión de Supabase y protege rutas
  return await updateSession(request, response);
}

// ⚠️ Esto debe ser ESTÁTICO → aquí tienes que repetir los idiomas soportados
export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*).*)',
    '/(es|en)/((?!api|_next|.*\\..*).*)'
  ],
}