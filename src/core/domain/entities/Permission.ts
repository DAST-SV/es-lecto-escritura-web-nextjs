// ============================================
// src/core/domain/entities/Permission.ts
// ✅ LIMPIADO: Solo lo que REALMENTE se usa
// ============================================

export type PermissionType = 'grant' | 'deny';
export type LanguageCode = 'es' | 'en' | 'fr' | 'it';

// ============================================
// ENTIDADES BÁSICAS
// ============================================

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

// ============================================
// AGGREGATE ROOT: UserPermissions
// ============================================

/**
 * Encapsula toda la información de permisos de un usuario
 * Este es el ÚNICO modelo que necesitas usar en la app
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

  /**
   * Obtiene nombres de roles como string
   */
  getRoleNames(): string {
    return this.roles.map(r => r.display_name).join(', ');
  }

  /**
   * Tiene permisos GRANT activos
   */
  hasGrantPermissions(): boolean {
    return this.individualPermissions.some(
      p => p.permission_type === 'grant' && 
           p.is_active && 
           (!p.expires_at || new Date(p.expires_at) > new Date())
    );
  }

  /**
   * Tiene permisos DENY activos
   */
  hasDenyPermissions(): boolean {
    return this.individualPermissions.some(
      p => p.permission_type === 'deny' && 
           p.is_active && 
           (!p.expires_at || new Date(p.expires_at) > new Date())
    );
  }
}

// ============================================
// HELPERS
// ============================================

export function isValidLanguageCode(code: string): code is LanguageCode {
  return ['es', 'en', 'fr', 'it'].includes(code);
}

export function getLanguageName(code: LanguageCode): string {
  const names: Record<LanguageCode, string> = {
    es: 'Español',
    en: 'English',
    fr: 'Français',
    it: 'Italiano',
  };
  return names[code];
}

export function getLanguageFlag(code: LanguageCode): string {
  const flags: Record<LanguageCode, string> = {
    es: '🇪🇸',
    en: '🇺🇸',
    fr: '🇫🇷',
    it: '🇮🇹',
  };
  return flags[code];
}