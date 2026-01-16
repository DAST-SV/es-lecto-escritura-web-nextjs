// src/core/domain/entities/Permission.ts

/**
 * Domain Entity: Permission
 * Representa el sistema de permisos del usuario
 */

export type PermissionType = 'grant' | 'deny';
export type LanguageCode = 'es' | 'en' | 'fr' | 'it';

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  hierarchy_level: number;
  is_active: boolean;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  pathname: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  show_in_menu: boolean;
  menu_order: number;
  parent_route_id: string | null;
  is_active: boolean;
  is_public: boolean;
  requires_verification: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RouteTranslation {
  id: string;
  route_id: string;
  language_code: LanguageCode;
  translated_path: string;
  translated_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  revoked_at: string | null;
  assigned_by: string | null;
  revoked_by: string | null;
  notes: string | null;
}

export interface RoutePermission {
  id: string;
  role_name: string;
  route_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoutePermission {
  id: string;
  user_id: string;
  route_id: string;
  permission_type: PermissionType;
  reason: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  granted_by: string | null;
  expires_at: string | null;
}

export interface RoleLanguageAccess {
  id: string;
  role_name: string;
  language_code: LanguageCode;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Aggregate Root: UserPermissions
 * Encapsula toda la información de permisos de un usuario
 */
export class UserPermissions {
  constructor(
    public readonly userId: string,
    public readonly roles: Role[],
    public readonly allowedRoutes: string[],
    public readonly allowedLanguages: LanguageCode[],
    public readonly individualPermissions: UserRoutePermission[]
  ) {}

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(roleName: string): boolean {
    return this.roles.some(role => role.name === roleName && role.is_active);
  }

  /**
   * Verifica si el usuario es super admin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('super_admin');
  }

  /**
   * Verifica si puede acceder a una ruta
   */
  canAccessRoute(pathname: string): boolean {
    return this.allowedRoutes.includes(pathname);
  }

  /**
   * Verifica si puede usar un idioma
   */
  canUseLanguage(language: LanguageCode): boolean {
    return this.allowedLanguages.includes(language);
  }

  /**
   * Obtiene el nivel jerárquico más alto
   */
  getHighestHierarchyLevel(): number {
    if (this.roles.length === 0) return 0;
    return Math.max(...this.roles.map(r => r.hierarchy_level));
  }
}