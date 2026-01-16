// src/infrastructure/repositories/SupabasePermissionRepository.ts

/**
 * Infrastructure: Supabase Permission Repository
 * Implementación concreta del repositorio de permisos
 */

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
   * Verifica si un usuario puede acceder a una ruta usando la función SQL
   */
  async canAccessRoute(
    userId: string,
    pathname: string,
    languageCode: LanguageCode = 'es'
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('can_access_route', {
        p_user_id: userId,
        p_pathname: pathname,
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

      // Combinar todas las rutas
      const allRoutes = new Set<string>();

      // Agregar rutas públicas
      publicRoutes?.forEach((route: any) => {
        allRoutes.add(route.pathname);
        route.route_translations?.forEach((trans: any) => {
          if (trans.language_code === languageCode) {
            allRoutes.add(trans.translated_path);
          }
        });
      });

      // Agregar rutas por roles
      roleRoutes?.forEach((rp: any) => {
        const route = rp.routes;
        allRoutes.add(route.pathname);
        route.route_translations?.forEach((trans: any) => {
          if (trans.language_code === languageCode) {
            allRoutes.add(trans.translated_path);
          }
        });
      });

      // Aplicar permisos individuales (GRANT y DENY)
      userPerms?.forEach((up: any) => {
        const route = up.routes;
        if (up.permission_type === 'grant') {
          allRoutes.add(route.pathname);
          route.route_translations?.forEach((trans: any) => {
            if (trans.language_code === languageCode) {
              allRoutes.add(trans.translated_path);
            }
          });
        } else if (up.permission_type === 'deny') {
          allRoutes.delete(route.pathname);
          route.route_translations?.forEach((trans: any) => {
            if (trans.language_code === languageCode) {
              allRoutes.delete(trans.translated_path);
            }
          });
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
}