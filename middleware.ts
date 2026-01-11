// ============================================
// middleware.ts (ROOT)
// ============================================
import { middleware } from '@/src/infrastructure/middleware/i18n.middleware';

export { middleware };

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};