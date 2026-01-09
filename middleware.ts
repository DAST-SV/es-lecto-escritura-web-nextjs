// middleware.ts (ROOT)
import { middleware } from '@/src/infrastructure/middleware/i18n.middleware';

export { middleware };

// ✅ Definir config directamente aquí (no re-exportar)
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};