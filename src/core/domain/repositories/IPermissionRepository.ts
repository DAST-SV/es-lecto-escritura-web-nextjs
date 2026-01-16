// src/core/domain/repositories/IPermissionRepository.ts

/**
 * Domain Repository Interface: Permission Repository
 * Define el contrato para acceder a los permisos
 */

import { UserPermissions, LanguageCode } from '../entities/Permission';

export interface IPermissionRepository {
  /**
   * Obtiene todos los permisos de un usuario
   */
  getUserPermissions(userId: string): Promise<UserPermissions>;

  /**
   * Verifica si un usuario puede acceder a una ruta
   */
  canAccessRoute(
    userId: string,
    pathname: string,
    languageCode?: LanguageCode
  ): Promise<boolean>;

  /**
   * Obtiene las rutas permitidas para un usuario
   */
  getAllowedRoutes(userId: string, languageCode?: LanguageCode): Promise<string[]>;

  /**
   * Obtiene los idiomas permitidos para un usuario
   */
  getAllowedLanguages(userId: string): Promise<LanguageCode[]>;
}