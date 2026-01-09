// src/infrastructure/middleware/i18n.middleware.ts
import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { routing } from '@/src/infrastructure/config/routing.config';
import { updateSession } from '@/src/infrastructure/middleware/auth.middleware';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  return await updateSession(request, response);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};