// ============================================
// ARCHIVO: src/infrastructure/repositories/SupabasePermissionRepository.ts
// ACCIÓN: REEMPLAZAR COMPLETO
// CAMBIO: Usar p_translated_path en lugar de p_pathname
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';
import {
  UserPermissions,
  Role,
  LanguageCode,
  UserRoutePermission,
} from '@/src/core/domain/entities/Permission';

export class SupabasePermissionRepository implements IPermissionRepository {
  private supabase = createClient();



  /**
   * Obtiene todos los permisos de un usuario
   */
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      // 1. Obtener roles del usuario
      const { data: userRoles, error: rolesError } = await this.supabase
        .schema('app').from('user_roles')
        .select(`
          role_id,
          is_active,
          revoked_at,
          roles (
            id,
            name,
            display_name,
            description,
            hierarchy_level,
            is_active,
            is_system_role,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('revoked_at', null);

      if (rolesError) throw rolesError;

      const roles: Role[] = userRoles
        ?.filter((ur: any) => ur.roles)
        .map((ur: any) => ur.roles as Role) || [];

      // 2. Obtener rutas permitidas
      const allowedRoutes = await this.getAllowedRoutes(userId);

      // 3. Obtener idiomas permitidos
      const allowedLanguages = await this.getAllowedLanguages(userId);

      // 4. Obtener permisos individuales
      const { data: individualPerms } = await this.supabase
        .schema('app').from('user_route_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      return new UserPermissions(
        userId,
        roles,
        allowedRoutes,
        allowedLanguages,
        (individualPerms || []) as UserRoutePermission[]
      );
    } catch (error) {
      console.error('Error getting user permissions:', error);
      // Retornar permisos vacíos en caso de error
      return new UserPermissions(userId, [], [], [], []);
    }
  }

  /**
 * Verifica si un usuario puede acceder a una ruta TRADUCIDA
 * 
 * @param userId - ID del usuario
 * @param translatedPath - Ruta TRADUCIDA (ej: /exclusive, /exclusivo, /exclusif)
 * @param languageCode - Código de idioma (es, en, fr, it)
 */
  async canAccessRoute(
    userId: string,
    translatedPath: string,  // ✅ Ruta TRADUCIDA
    languageCode: LanguageCode = 'es'
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('can_access_route', {
        p_user_id: userId,
        p_translated_path: translatedPath,  // ✅ Ruta traducida
        p_language_code: languageCode,
      });

      if (error) {
        console.error('Error checking route access:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in canAccessRoute:', error);
      return false;
    }
  }

  /**
   * Obtiene todas las rutas permitidas para un usuario
   * ✅ Retorna rutas TRADUCIDAS según el idioma
   */
  async getAllowedRoutes(
    userId: string,
    languageCode: LanguageCode = 'es'
  ): Promise<string[]> {
    try {
      // 1. Obtener roles del usuario
      const { data: userRoles } = await this.supabase
        .schema('app').from('user_roles')
        .select('role_id, roles!inner(name)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('revoked_at', null);

      if (!userRoles || userRoles.length === 0) {
        return [];
      }

      const roleNames = userRoles.map((ur: any) => ur.roles.name);

      // 2. Obtener rutas públicas
      const { data: publicRoutes } = await this.supabase
        .schema('app').from('routes')
        .select('pathname, route_translations!left(translated_path, language_code)')
        .eq('is_public', true)
        .eq('is_active', true)
        .is('deleted_at', null);

      // 3. Obtener rutas por roles
      const { data: roleRoutes } = await this.supabase
        .schema('app').from('route_permissions')
        .select(`
          routes!inner(
            pathname,
            route_translations!left(translated_path, language_code)
          )
        `)
        .in('role_name', roleNames)
        .eq('is_active', true);

      // 4. Obtener permisos individuales
      const { data: userPerms } = await this.supabase
        .schema('app').from('user_route_permissions')
        .select(`
          permission_type,
          routes!inner(
            pathname,
            route_translations!left(translated_path, language_code)
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()');

      // Combinar todas las rutas TRADUCIDAS
      const allRoutes = new Set<string>();

      // Agregar rutas públicas (traducidas)
      publicRoutes?.forEach((route: any) => {
        route.route_translations?.forEach((trans: any) => {
          if (trans.language_code === languageCode) {
            allRoutes.add(trans.translated_path);
          }
        });
        // Fallback al pathname si no hay traducción
        if (!route.route_translations || route.route_translations.length === 0) {
          allRoutes.add(route.pathname);
        }
      });

      // Agregar rutas por roles (traducidas)
      roleRoutes?.forEach((rp: any) => {
        const route = rp.routes;
        route.route_translations?.forEach((trans: any) => {
          if (trans.language_code === languageCode) {
            allRoutes.add(trans.translated_path);
          }
        });
        if (!route.route_translations || route.route_translations.length === 0) {
          allRoutes.add(route.pathname);
        }
      });

      // Aplicar permisos individuales (GRANT y DENY)
      userPerms?.forEach((up: any) => {
        const route = up.routes;
        const translatedPaths: string[] = [];

        route.route_translations?.forEach((trans: any) => {
          if (trans.language_code === languageCode) {
            translatedPaths.push(trans.translated_path);
          }
        });

        if (translatedPaths.length === 0) {
          translatedPaths.push(route.pathname);
        }

        if (up.permission_type === 'grant') {
          translatedPaths.forEach(path => allRoutes.add(path));
        } else if (up.permission_type === 'deny') {
          translatedPaths.forEach(path => allRoutes.delete(path));
        }
      });

      return Array.from(allRoutes);
    } catch (error) {
      console.error('Error getting allowed routes:', error);
      return [];
    }
  }

  /**
   * Obtiene los idiomas permitidos para un usuario
   */
  async getAllowedLanguages(userId: string): Promise<LanguageCode[]> {
    try {
      // Obtener roles del usuario
      const { data: userRoles } = await this.supabase
        .schema('app').from('user_roles')
        .select('role_id, roles!inner(name)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('revoked_at', null);

      if (!userRoles || userRoles.length === 0) {
        return ['es']; // Idioma por defecto
      }

      const roleNames = userRoles.map((ur: any) => ur.roles.name);

      // Obtener idiomas permitidos para estos roles
      const { data: languageAccess } = await this.supabase
        .schema('app').from('role_language_access')
        .select('language_code')
        .in('role_name', roleNames)
        .eq('is_active', true);

      const languages = new Set<LanguageCode>(
        languageAccess?.map((la: any) => la.language_code) || ['es']
      );

      return Array.from(languages);
    } catch (error) {
      console.error('Error getting allowed languages:', error);
      return ['es'];
    }
  }

  async getAllRoles(): Promise<Role[]> {
    try {
      const { data, error } = await this.supabase
        .schema('app')
        .from('roles')
        .select('*')
        .eq('is_active', true)
        .order('hierarchy_level', { ascending: false });

      if (error) throw error;

      return (data || []) as Role[];
    } catch (error) {
      console.error('Error getting all roles:', error);
      return [];
    }
  }

  async getRoleById(roleId: string): Promise<Role | null> {
    try {
      const { data, error } = await this.supabase
        .schema('app')
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .single();

      if (error) throw error;

      return data as Role;
    } catch (error) {
      console.error('Error getting role by id:', error);
      return null;
    }
  }

  async createRole(roleData: {
    name: string;
    display_name: string;
    description: string | null;
    hierarchy_level: number;
    is_active: boolean;
    is_system_role: boolean;
  }): Promise<Role> {
    try {
      const { data, error } = await this.supabase
        .schema('app')
        .from('roles')
        .insert({
          name: roleData.name,
          display_name: roleData.display_name,
          description: roleData.description,
          hierarchy_level: roleData.hierarchy_level,
          is_active: roleData.is_active,
          is_system_role: roleData.is_system_role,
        })
        .select()
        .single();

      if (error) throw error;

      return data as Role;
    } catch (error: any) {
      console.error('Error creating role:', error);
      throw new Error(`Error al crear rol: ${error.message}`);
    }
  }

  async updateRole(roleId: string, updateData: Partial<{
    display_name: string;
    description: string | null;
    hierarchy_level: number;
    is_active: boolean;
  }>): Promise<Role> {
    try {
      const { data, error } = await this.supabase
        .schema('app')
        .from('roles')
        .update(updateData)
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;

      return data as Role;
    } catch (error: any) {
      console.error('Error updating role:', error);
      throw new Error(`Error al actualizar rol: ${error.message}`);
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .schema('app')
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting role:', error);
      throw new Error(`Error al eliminar rol: ${error.message}`);
    }
  }

  // ============================================
  // Asignación de roles
  // ============================================

  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const { data, error } = await this.supabase
        .schema('app')
        .from('user_roles')
        .select(`
          roles!inner (*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('revoked_at', null);

      if (error) throw error;

      return (data?.map((item: any) => item.roles) || []) as Role[];
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  async assignRole(dto: {
    userId: string;
    roleId: string;
    assignedBy: string;
    notes?: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .schema('app')
        .from('user_roles')
        .insert({
          user_id: dto.userId,
          role_id: dto.roleId,
          assigned_by: dto.assignedBy,
          notes: dto.notes || null,
          is_active: true,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error assigning role:', error);
      throw new Error(`Error al asignar rol: ${error.message}`);
    }
  }

  async revokeRole(dto: {
    userId: string;
    roleId: string;
    revokedBy: string;
    reason?: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .schema('app')
        .from('user_roles')
        .update({
          is_active: false,
          revoked_at: new Date().toISOString(),
          revoked_by: dto.revokedBy,
          notes: dto.reason || null,
        })
        .eq('user_id', dto.userId)
        .eq('role_id', dto.roleId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error revoking role:', error);
      throw new Error(`Error al revocar rol: ${error.message}`);
    }
  }

  // ============================================
  // Permisos individuales
  // ============================================

  async grantPermission(dto: {
    userId: string;
    routeId: string;
    grantedBy: string;
    reason?: string;
    expiresAt?: Date;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .schema('app')
        .from('user_route_permissions')
        .insert({
          user_id: dto.userId,
          route_id: dto.routeId,
          permission_type: 'grant',
          granted_by: dto.grantedBy,
          reason: dto.reason || null,
          expires_at: dto.expiresAt?.toISOString() || null,
          is_active: true,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error granting permission:', error);
      throw new Error(`Error al otorgar permiso: ${error.message}`);
    }
  }

  async revokePermission(dto: {
    userId: string;
    routeId: string;
    revokedBy: string;
    reason?: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .schema('app')
        .from('user_route_permissions')
        .insert({
          user_id: dto.userId,
          route_id: dto.routeId,
          permission_type: 'deny',
          granted_by: dto.revokedBy,
          reason: dto.reason || null,
          is_active: true,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error revoking permission:', error);
      throw new Error(`Error al revocar permiso: ${error.message}`);
    }
  }

  // ============================================
  // Permisos de rutas
  // ============================================

  async getRoutePermissions(routeId?: string): Promise<Array<{
    routeId: string;
    routeName: string;
    allowedRoles: string[];
  }>> {
    try {
      let query = this.supabase
        .schema('app')
        .from('route_permissions')
        .select(`
          route_id,
          routes!inner (
            pathname,
            display_name
          ),
          role_name
        `)
        .eq('is_active', true);

      if (routeId) {
        query = query.eq('route_id', routeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar por ruta
      const grouped = (data || []).reduce((acc: any, item: any) => {
        const id = item.route_id;
        if (!acc[id]) {
          acc[id] = {
            routeId: id,
            routeName: item.routes?.display_name || item.routes?.pathname,
            allowedRoles: [],
          };
        }
        acc[id].allowedRoles.push(item.role_name);
        return acc;
      }, {});

      return Object.values(grouped);
    } catch (error) {
      console.error('Error getting route permissions:', error);
      return [];
    }
  }
}