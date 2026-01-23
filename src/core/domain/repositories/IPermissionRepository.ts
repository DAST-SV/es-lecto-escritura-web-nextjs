// ============================================
// ARCHIVO: src/core/domain/repositories/IPermissionRepository.ts
// ACCIÓN: REEMPLAZAR COMPLETO
// ============================================

import { UserPermissions, LanguageCode, Role } from '../entities/Permission';

export interface IPermissionRepository {
  // Permisos de usuario
  getUserPermissions(userId: string): Promise<UserPermissions>;
  canAccessRoute(userId: string, translatedPath: string, languageCode?: LanguageCode): Promise<boolean>;
  getAllowedRoutes(userId: string, languageCode?: LanguageCode): Promise<string[]>;
  getAllowedLanguages(userId: string): Promise<LanguageCode[]>;

  // Gestión de roles
  getAllRoles(): Promise<Role[]>;
  getRoleById(roleId: string): Promise<Role | null>;
  getUserRoles(userId: string): Promise<Role[]>;
  createRole(data: {
    name: string;
    display_name: string;
    description: string | null;
    hierarchy_level: number;
    is_active: boolean;
    is_system_role: boolean;
  }): Promise<Role>;
  updateRole(roleId: string, data: Partial<{
    display_name: string;
    description: string | null;
    hierarchy_level: number;
    is_active: boolean;
  }>): Promise<Role>;
  deleteRole(roleId: string): Promise<void>;

  // Asignación de roles
  assignRole(dto: {
    userId: string;
    roleId: string;
    assignedBy: string;
    notes?: string;
  }): Promise<void>;
  revokeRole(dto: {
    userId: string;
    roleId: string;
    revokedBy: string;
    reason?: string;
  }): Promise<void>;

  // Permisos individuales
  grantPermission(dto: {
    userId: string;
    routeId: string;
    grantedBy: string;
    reason?: string;
    expiresAt?: Date;
  }): Promise<void>;
  revokePermission(dto: {
    userId: string;
    routeId: string;
    revokedBy: string;
    reason?: string;
  }): Promise<void>;

  // Permisos de rutas
  getRoutePermissions(routeId?: string): Promise<Array<{
    routeId: string;
    routeName: string;
    allowedRoles: string[];
  }>>;
}