// ============================================
// ARCHIVO: src/presentation/features/rbac/hooks/useRBACPermissions.ts
// ACCIÓN: REEMPLAZAR COMPLETO
// CAMBIO: Usar p_translated_path en canAccessRoute
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/src/infrastructure/config/supabase.config';

export interface AccessibleRoute {
  routeId: string;
  pathname: string;
  translatedPath: string;
  displayName: string;
  icon?: string;
  menuOrder: number;
  parentRouteId?: string;
}

export interface UserRoutePermission {
  id: string;
  routeId: string;
  permissionType: 'grant' | 'deny';
  reason?: string;
  validFrom?: Date;
  validUntil?: Date;
}

export function useRBACPermissions() {
  const locale = useLocale();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [accessibleRoutes, setAccessibleRoutes] = useState<AccessibleRoute[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserRoutePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener usuario
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  /**
   * Cargar rutas accesibles para el usuario
   */
  const loadAccessibleRoutes = useCallback(async () => {
    if (!user) {
      setAccessibleRoutes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_accessible_routes', {
          p_user_id: user.id,
          p_language_code: locale,
          p_organization_id: null,
          p_show_in_menu_only: false,
        });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const routes: AccessibleRoute[] = (data || []).map((r: any) => ({
        routeId: r.route_id,
        pathname: r.pathname,
        translatedPath: r.translated_path,
        displayName: r.display_name,
        icon: r.icon,
        menuOrder: r.menu_order,
        parentRouteId: r.parent_route_id,
      }));

      setAccessibleRoutes(routes);
    } catch (err: any) {
      setError(err.message || 'Error al cargar rutas');
      console.error('Error loading accessible routes:', err);
    } finally {
      setLoading(false);
    }
  }, [user, locale, supabase]);

  /**
   * Cargar permisos específicos del usuario
   */
  const loadUserPermissions = useCallback(async () => {
    if (!user) {
      setUserPermissions([]);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const permissions: UserRoutePermission[] = (data || []).map((p: any) => ({
        id: p.id,
        routeId: p.route_id,
        permissionType: p.permission_type,
        reason: p.reason,
        validFrom: p.valid_from ? new Date(p.valid_from) : undefined,
        validUntil: p.valid_until ? new Date(p.valid_until) : undefined,
      }));

      setUserPermissions(permissions);
    } catch (err: any) {
      console.error('Error loading user permissions:', err);
    }
  }, [user, supabase]);

  /**
   * Verificar si el usuario puede acceder a una ruta TRADUCIDA
   * 
   * ✅ IMPORTANTE: translatedPath debe ser la ruta en el idioma actual
   * Ejemplo: /biblioteca (ES), /library (EN), /bibliotheque (FR)
   */
  const canAccessRoute = useCallback(
    async (translatedPath: string): Promise<boolean> => {  // ✅ RENOMBRADO
      try {
        // ✅ CAMBIO: p_translated_path
        const { data, error: fetchError } = await supabase
          .rpc('can_access_route', {
            p_user_id: user?.id || null,
            p_translated_path: translatedPath,  // ✅ CAMBIADO
            p_language_code: locale,
            p_organization_id: null,
          });

        if (fetchError) {
          console.error('Error checking route access:', fetchError);
          return false;
        }

        return data === true;
      } catch (err) {
        console.error('Error in canAccessRoute:', err);
        return false;
      }
    },
    [user, locale, supabase]
  );

  /**
   * Dar acceso explícito a un usuario
   */
  const grantRouteAccess = useCallback(
    async (
      targetUserId: string,
      routeId: string,
      reason?: string,
      validFrom?: Date,
      validUntil?: Date
    ): Promise<void> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      try {
        const { error: insertError } = await supabase
          .schema('app')
          .from('user_route_permissions')
          .insert({
            user_id: targetUserId,
            route_id: routeId,
            permission_type: 'grant',
            reason: reason || null,
            granted_by: user.id,
            valid_from: validFrom?.toISOString() || null,
            valid_until: validUntil?.toISOString() || null,
          });

        if (insertError) {
          throw new Error(insertError.message);
        }

        if (targetUserId === user.id) {
          await loadUserPermissions();
          await loadAccessibleRoutes();
        }
      } catch (err: any) {
        throw new Error(err.message || 'Error al otorgar acceso');
      }
    },
    [user, supabase, loadUserPermissions, loadAccessibleRoutes]
  );

  /**
   * Bloquear acceso a un usuario
   */
  const denyRouteAccess = useCallback(
    async (
      targetUserId: string,
      routeId: string,
      reason?: string,
      validFrom?: Date,
      validUntil?: Date
    ): Promise<void> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      try {
        const { error: insertError } = await supabase
          .schema('app')
          .from('user_route_permissions')
          .insert({
            user_id: targetUserId,
            route_id: routeId,
            permission_type: 'deny',
            reason: reason || null,
            granted_by: user.id,
            valid_from: validFrom?.toISOString() || null,
            valid_until: validUntil?.toISOString() || null,
          });

        if (insertError) {
          throw new Error(insertError.message);
        }

        if (targetUserId === user.id) {
          await loadUserPermissions();
          await loadAccessibleRoutes();
        }
      } catch (err: any) {
        throw new Error(err.message || 'Error al bloquear acceso');
      }
    },
    [user, supabase, loadUserPermissions, loadAccessibleRoutes]
  );

  /**
   * Remover permiso específico
   */
  const removeUserPermission = useCallback(
    async (permissionId: string): Promise<void> => {
      try {
        const { error: deleteError } = await supabase
          .schema('app')
          .from('user_route_permissions')
          .delete()
          .eq('id', permissionId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        await loadUserPermissions();
        await loadAccessibleRoutes();
      } catch (err: any) {
        throw new Error(err.message || 'Error al remover permiso');
      }
    },
    [supabase, loadUserPermissions, loadAccessibleRoutes]
  );

  /**
   * Verificar si una ruta tiene restricción de idioma
   */
  const hasLanguageRestriction = useCallback(
    async (routeId: string): Promise<boolean> => {
      try {
        const { count, error: countError } = await supabase
          .schema('app')
          .from('route_language_restrictions')
          .select('*', { count: 'exact', head: true })
          .eq('route_id', routeId);

        if (countError) {
          console.error('Error checking language restriction:', countError);
          return false;
        }

        return (count || 0) > 0;
      } catch (err) {
        console.error('Error in hasLanguageRestriction:', err);
        return false;
      }
    },
    [supabase]
  );

  /**
   * Obtener idiomas restringidos de una ruta
   */
  const getRouteLanguageRestrictions = useCallback(
    async (routeId: string): Promise<string[]> => {
      try {
        const { data, error: fetchError } = await supabase
          .schema('app')
          .from('route_language_restrictions')
          .select('language_code')
          .eq('route_id', routeId);

        if (fetchError) {
          console.error('Error fetching language restrictions:', fetchError);
          return [];
        }

        return (data || []).map((r: any) => r.language_code);
      } catch (err) {
        console.error('Error in getRouteLanguageRestrictions:', err);
        return [];
      }
    },
    [supabase]
  );

  // Cargar datos al montar
  useEffect(() => {
    if (user) {
      loadAccessibleRoutes();
      loadUserPermissions();
    } else {
      setAccessibleRoutes([]);
      setUserPermissions([]);
      setLoading(false);
    }
  }, [user, loadAccessibleRoutes, loadUserPermissions]);

  return {
    // Estado
    user,
    accessibleRoutes,
    userPermissions,
    loading,
    error,

    // Verificaciones
    canAccessRoute,
    hasLanguageRestriction,
    getRouteLanguageRestrictions,

    // Acciones
    grantRouteAccess,
    denyRouteAccess,
    removeUserPermission,

    // Recarga
    refresh: loadAccessibleRoutes,
  };
}