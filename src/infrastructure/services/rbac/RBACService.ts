// ============================================
// src/infrastructure/services/rbac/RBACService.ts
// ✅ SERVICIO DE AUTORIZACIÓN DINÁMICO
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import type { User } from '@supabase/supabase-js';

// ============================================
// INTERFACES
// ============================================

export interface Permission {
  name: string;
  resource: string;
  action: string;
  displayName: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  hierarchyLevel: number;
  permissions: Permission[];
}

export interface UserPermission {
  permissionName: string;
  permissionType: 'grant' | 'deny';
  source: 'role' | 'direct';
  roleName?: string;
  validFrom?: Date;
  validUntil?: Date;
}

export interface AccessibleRoute {
  routeId: string;
  pathname: string;
  translatedPath: string;
  displayName: string;
  icon?: string;
  menuOrder: number;
  parentRouteId?: string;
  isPublic: boolean;
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================

export class RBACService {
  
  // ============================================
  // VERIFICACIÓN DE PERMISOS
  // ============================================
  
  /**
   * Verificar si un usuario tiene un permiso específico
   */
  static async hasPermission(
    userId: string,
    permissionName: string,
    organizationId?: string,
    resourceId?: string
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc('has_permission', {
        p_user_id: userId,
        p_permission_name: permissionName,
        p_organization_id: organizationId || null,
        p_resource_id: resourceId || null,
      });

      if (error) {
        console.error('Error verificando permiso:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error en hasPermission:', error);
      return false;
    }
  }

  /**
   * Obtener todos los permisos de un usuario
   */
  static async getUserPermissions(
    userId: string,
    organizationId?: string
  ): Promise<UserPermission[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc('get_user_permissions', {
        p_user_id: userId,
        p_organization_id: organizationId || null,
      });

      if (error) {
        console.error('Error obteniendo permisos:', error);
        return [];
      }

      return (data || []).map((p: any) => ({
        permissionName: p.permission_name,
        permissionType: p.permission_type,
        source: p.source,
        roleName: p.role_name,
        validFrom: p.valid_from ? new Date(p.valid_from) : undefined,
        validUntil: p.valid_until ? new Date(p.valid_until) : undefined,
      }));
    } catch (error) {
      console.error('Error en getUserPermissions:', error);
      return [];
    }
  }

  /**
   * Verificar múltiples permisos a la vez
   */
  static async hasAnyPermission(
    userId: string,
    permissions: string[],
    organizationId?: string
  ): Promise<boolean> {
    const results = await Promise.all(
      permissions.map(p => this.hasPermission(userId, p, organizationId))
    );
    return results.some(r => r === true);
  }

  static async hasAllPermissions(
    userId: string,
    permissions: string[],
    organizationId?: string
  ): Promise<boolean> {
    const results = await Promise.all(
      permissions.map(p => this.hasPermission(userId, p, organizationId))
    );
    return results.every(r => r === true);
  }

  // ============================================
  // VERIFICACIÓN DE RUTAS
  // ============================================

  /**
   * Verificar si un usuario puede acceder a una ruta
   */
  static async canAccessRoute(
    userId: string | null,
    pathname: string,
    organizationId?: string
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc('can_access_route', {
        p_user_id: userId,
        p_pathname: pathname,
        p_organization_id: organizationId || null,
      });

      if (error) {
        console.error('Error verificando acceso a ruta:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error en canAccessRoute:', error);
      return false;
    }
  }

  /**
   * Obtener rutas accesibles para un usuario
   */
  static async getAccessibleRoutes(
    userId: string | null,
    languageCode: string = 'es',
    organizationId?: string,
    showInMenuOnly: boolean = false
  ): Promise<AccessibleRoute[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc('get_accessible_routes', {
        p_user_id: userId,
        p_language_code: languageCode,
        p_organization_id: organizationId || null,
        p_show_in_menu_only: showInMenuOnly,
      });

      if (error) {
        console.error('Error obteniendo rutas accesibles:', error);
        return [];
      }

      return (data || []).map((r: any) => ({
        routeId: r.route_id,
        pathname: r.pathname,
        translatedPath: r.translated_path,
        displayName: r.display_name,
        icon: r.icon,
        menuOrder: r.menu_order,
        parentRouteId: r.parent_route_id,
        isPublic: r.is_public,
      }));
    } catch (error) {
      console.error('Error en getAccessibleRoutes:', error);
      return [];
    }
  }

  // ============================================
  // GESTIÓN DE ROLES
  // ============================================

  /**
   * Obtener rol más alto de un usuario
   */
  static async getUserHighestRole(
    userId: string,
    organizationId?: string
  ): Promise<string> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc('get_user_highest_role', {
        p_user_id: userId,
        p_organization_id: organizationId || null,
      });

      if (error) {
        console.error('Error obteniendo rol:', error);
        return 'guest';
      }

      return data || 'guest';
    } catch (error) {
      console.error('Error en getUserHighestRole:', error);
      return 'guest';
    }
  }

  /**
   * Asignar rol a usuario
   */
  static async assignRole(
    userId: string,
    roleName: string,
    organizationId?: string,
    validFrom?: Date,
    validUntil?: Date
  ): Promise<string | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc('assign_role_to_user', {
        p_user_id: userId,
        p_role_name: roleName,
        p_organization_id: organizationId || null,
        p_valid_from: validFrom?.toISOString() || null,
        p_valid_until: validUntil?.toISOString() || null,
      });

      if (error) {
        console.error('Error asignando rol:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error en assignRole:', error);
      return null;
    }
  }

  /**
   * Revocar rol de usuario
   */
  static async revokeRole(
    userId: string,
    roleName: string,
    organizationId?: string
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc('revoke_role_from_user', {
        p_user_id: userId,
        p_role_name: roleName,
        p_organization_id: organizationId || null,
      });

      if (error) {
        console.error('Error revocando rol:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error en revokeRole:', error);
      return false;
    }
  }

  /**
   * Obtener roles de un usuario
   */
  static async getUserRoles(
    userId: string,
    organizationId?: string
  ): Promise<Role[]> {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('user_roles')
        .select(`
          role_id,
          roles!inner (
            id,
            name,
            display_name,
            description,
            hierarchy_level
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('revoked_at', null);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error obteniendo roles:', error);
        return [];
      }

      return (data || []).map((ur: any) => ({
        id: ur.roles.id,
        name: ur.roles.name,
        displayName: ur.roles.display_name,
        description: ur.roles.description,
        hierarchyLevel: ur.roles.hierarchy_level,
        permissions: [],
      }));
    } catch (error) {
      console.error('Error en getUserRoles:', error);
      return [];
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Cache de permisos en memoria (optimización)
   */
  private static permissionsCache = new Map<string, {
    permissions: UserPermission[];
    timestamp: number;
  }>();

  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtener permisos con cache
   */
  static async getUserPermissionsCached(
    userId: string,
    organizationId?: string
  ): Promise<UserPermission[]> {
    const cacheKey = `${userId}-${organizationId || 'global'}`;
    const cached = this.permissionsCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.permissions;
    }

    const permissions = await this.getUserPermissions(userId, organizationId);
    
    this.permissionsCache.set(cacheKey, {
      permissions,
      timestamp: Date.now(),
    });

    return permissions;
  }

  /**
   * Invalidar cache de permisos
   */
  static invalidateCache(userId?: string) {
    if (userId) {
      const keysToDelete = Array.from(this.permissionsCache.keys())
        .filter(key => key.startsWith(userId));
      keysToDelete.forEach(key => this.permissionsCache.delete(key));
    } else {
      this.permissionsCache.clear();
    }
  }

  /**
   * Verificar permisos CRUD sobre un recurso
   */
  static async canCreate(userId: string, resource: string): Promise<boolean> {
    return this.hasPermission(userId, `${resource}.create`);
  }

  static async canRead(userId: string, resource: string, resourceId?: string): Promise<boolean> {
    return this.hasPermission(userId, `${resource}.read`, undefined, resourceId);
  }

  static async canUpdate(userId: string, resource: string, resourceId?: string): Promise<boolean> {
    return this.hasPermission(userId, `${resource}.update`, undefined, resourceId);
  }

  static async canDelete(userId: string, resource: string, resourceId?: string): Promise<boolean> {
    return this.hasPermission(userId, `${resource}.delete`, undefined, resourceId);
  }
}