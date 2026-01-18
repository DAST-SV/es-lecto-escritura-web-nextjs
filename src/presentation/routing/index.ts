// ============================================
// src/presentation/routing/index.ts
// Exportaciones centralizadas del sistema de rutas traducidas
// ============================================

// Configuración de rutas
export {
  ROUTE_KEYS,
  type RouteKey,
  getPathnameFromKey,
  replaceRouteParams,
  isValidRouteKey,
} from '@/src/infrastructure/config/route-keys.config';

// Hooks
export {
  useLocalizedRoute,
  useLocalizedRoutes,
} from '@/src/presentation/hooks/useLocalizedRoute';

export {
  useRouteAccess,
  useMultipleRouteAccess,
  clearRouteAccessCache,
} from '@/src/presentation/hooks/useRouteAccess';

// Componentes
export {
  LocalizedLink,
  NavLink,
  ButtonLink,
  ConditionalLinks,
} from '@/src/presentation/components/LocalizedLink';

// ============================================
// EJEMPLO DE USO
// ============================================

/**
 * Importar todo el sistema:
 *
 * import {
 *   LocalizedLink,
 *   NavLink,
 *   ButtonLink,
 *   useLocalizedRoute,
 *   useRouteAccess,
 *   ROUTE_KEYS,
 * } from '@/src/presentation/routing';
 *
 * // Usar en componentes
 * <LocalizedLink routeKey="admin.users" checkAccess>
 *   Admin Usuarios
 * </LocalizedLink>
 */
