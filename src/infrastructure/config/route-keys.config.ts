// ============================================
// src/infrastructure/config/route-keys.config.ts
// Mapeo de claves de rutas a pathnames físicos
// ============================================

/**
 * Mapeo de claves de rutas a pathnames físicos del sistema
 *
 * Uso:
 * - Clave: 'admin.users' → Pathname: '/admin/users'
 * - Con useLocalizedRoute: 'admin.users' + 'es' → '/es/admin/usuarios'
 * - Con useLocalizedRoute: 'admin.users' + 'en' → '/en/admin/users'
 */
export const ROUTE_KEYS = {
  // ========================================
  // RUTAS PÚBLICAS
  // ========================================
  home: '/',

  // ========================================
  // AUTENTICACIÓN
  // ========================================
  'auth.login': '/auth/login',
  'auth.signup': '/auth/signup',
  'auth.callback': '/auth/callback',
  'auth.reset-password': '/auth/reset-password',

  // ========================================
  // LIBROS
  // ========================================
  'books.list': '/books',
  'books.create': '/books/create',
  'books.edit': '/books/[id]/edit',
  'books.read': '/books/[id]/read',
  'books.statistics': '/books/[id]/statistics',
  'books.trash': '/books/trash',

  // ========================================
  // NAVEGACIÓN PRINCIPAL
  // ========================================
  'nav.library': '/library',
  'nav.my-world': '/my-world',
  'nav.my-progress': '/my-progress',

  // ========================================
  // ORGANIZACIONES
  // ========================================
  'organizations.list': '/organizations',
  'organizations.create': '/organizations/create',
  'organizations.edit': '/organizations/[id]/edit',

  // ========================================
  // TIPOS DE USUARIO
  // ========================================
  'user-types.list': '/user-types',
  'user-types.create': '/user-types/create',
  'user-types.edit': '/user-types/[id]/edit',

  // ========================================
  // ADMINISTRACIÓN
  // ========================================
  'admin.dashboard': '/admin',
  'admin.users': '/admin/users',
  'admin.roles': '/admin/roles',
  'admin.translations': '/admin/translations',
  'admin.audit': '/admin/audit',

  // ========================================
  // ADMINISTRACIÓN - RBAC
  // ========================================
  'admin.routes': '/admin/routes',
  'admin.route-scanner': '/admin/route-scanner',
  'admin.route-translations': '/admin/route-translations',
  'admin.role-permissions': '/admin/role-permissions',
  'admin.user-permissions': '/admin/user-permissions',
  'admin.user-roles': '/admin/user-roles',

  // ========================================
  // ERRORES
  // ========================================
  error: '/error',
  forbidden: '/forbidden',
} as const;

/**
 * Tipo para las claves de rutas
 */
export type RouteKey = keyof typeof ROUTE_KEYS;

/**
 * Obtiene el pathname físico de una clave de ruta
 *
 * @param key - Clave de la ruta (ej: 'admin.users')
 * @returns Pathname físico (ej: '/admin/users')
 */
export function getPathnameFromKey(key: RouteKey): string {
  return ROUTE_KEYS[key];
}

/**
 * Reemplaza parámetros dinámicos en una ruta
 *
 * @param pathname - Pathname con parámetros (ej: '/books/[id]/edit')
 * @param params - Objeto con valores para reemplazar (ej: { id: '123' })
 * @returns Pathname con parámetros reemplazados (ej: '/books/123/edit')
 *
 * @example
 * ```ts
 * replaceRouteParams('/books/[id]/edit', { id: '123' }) // '/books/123/edit'
 * replaceRouteParams('/users/[userId]/posts/[postId]', { userId: '1', postId: '2' }) // '/users/1/posts/2'
 * ```
 */
export function replaceRouteParams(
  pathname: string,
  params: Record<string, string | number>
): string {
  let result = pathname;

  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`[${key}]`, String(value));
  });

  return result;
}

/**
 * Verifica si una clave de ruta existe
 *
 * @param key - Clave a verificar
 * @returns true si la clave existe
 */
export function isValidRouteKey(key: string): key is RouteKey {
  return key in ROUTE_KEYS;
}
