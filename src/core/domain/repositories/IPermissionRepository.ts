// ============================================
// src/core/domain/repositories/IPermissionRepository.ts
// ✅ LIMPIADO: Solo métodos que REALMENTE usas
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
   * Verifica si un usuario puede acceder a una ruta
   * Usado por: useRouteAccess hook, RouteGuard component
   */
  canAccessRoute(
    userId: string,
    pathname: string,
    languageCode?: LanguageCode
  ): Promise<boolean>;

  /**
   * Obtiene las rutas permitidas para un usuario
   * Usado internamente por getUserPermissions
   */
  getAllowedRoutes(userId: string, languageCode?: LanguageCode): Promise<string[]>;

  /**
   * Obtiene los idiomas permitidos para un usuario
   * Usado internamente por getUserPermissions
   */
  getAllowedLanguages(userId: string): Promise<LanguageCode[]>;
}