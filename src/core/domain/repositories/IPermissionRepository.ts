// ============================================
// ARCHIVO: src/core/domain/repositories/IPermissionRepository.ts
// ACCIÓN: REEMPLAZAR COMPLETO
// CAMBIO: Documentar que pathname es ruta TRADUCIDA
// ============================================

import { UserPermissions, LanguageCode } from '../entities/Permission';

/**
 * Repositorio de permisos
 * Define el contrato para acceder a los permisos del usuario
 */
export interface IPermissionRepository {
  /**
   * Obtiene todos los permisos de un usuario
   * Usado por: usePermissions hook
   */
  getUserPermissions(userId: string): Promise<UserPermissions>;

  /**
   * Verifica si un usuario puede acceder a una ruta TRADUCIDA
   * 
   * ✅ IMPORTANTE: translatedPath debe ser la ruta en el idioma actual
   * Ejemplos:
   *   - ES: /biblioteca
   *   - EN: /library
   *   - FR: /bibliotheque
   * 
   * Usado por: useRouteAccess hook, RouteGuard component
   * 
   * @param userId - ID del usuario
   * @param translatedPath - Ruta TRADUCIDA (no la ruta física /library)
   * @param languageCode - Código de idioma
   */
  canAccessRoute(
    userId: string,
    translatedPath: string,  // ✅ Ruta TRADUCIDA
    languageCode?: LanguageCode
  ): Promise<boolean>;

  /**
   * Obtiene las rutas permitidas para un usuario
   * ✅ Retorna rutas TRADUCIDAS según el idioma
   * 
   * Usado internamente por getUserPermissions
   */
  getAllowedRoutes(userId: string, languageCode?: LanguageCode): Promise<string[]>;

  /**
   * Obtiene los idiomas permitidos para un usuario
   * Usado internamente por getUserPermissions
   */
  getAllowedLanguages(userId: string): Promise<LanguageCode[]>;
}