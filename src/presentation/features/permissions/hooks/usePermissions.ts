// ============================================
// src/presentation/features/permissions/hooks/usePermissions.ts
// Hook principal para gestión de permisos del usuario
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { UserPermissions } from '@/src/core/domain/entities/Permission';
import { SupabasePermissionRepository } from '@/src/infrastructure/repositories/SupabasePermissionRepository';
import { GetUserPermissionsUseCase } from '@/src/core/application/use-cases/GetUserPermissionsUseCase';

interface UsePermissionsReturn {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
  canAccessRoute: (pathname: string) => boolean;
  hasRole: (roleName: string) => boolean;
  isSuperAdmin: () => boolean;
  canUseLanguage: (language: string) => boolean;
  refresh: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setPermissions(null);
        setLoading(false);
        return;
      }

      const repository = new SupabasePermissionRepository();
      const useCase = new GetUserPermissionsUseCase(repository);
      
      const userPermissions = await useCase.execute(user.id);
      setPermissions(userPermissions);
    } catch (err: any) {
      console.error('Error loading permissions:', err);
      setError(err.message || 'Error al cargar permisos');
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const canAccessRoute = useCallback(
    (pathname: string): boolean => {
      if (!permissions) return false;
      return permissions.canAccessRoute(pathname);
    },
    [permissions]
  );

  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!permissions) return false;
      return permissions.hasRole(roleName);
    },
    [permissions]
  );

  const isSuperAdmin = useCallback((): boolean => {
    if (!permissions) return false;
    return permissions.isSuperAdmin();
  }, [permissions]);

  const canUseLanguage = useCallback(
    (language: string): boolean => {
      if (!permissions) return false;
      return permissions.canUseLanguage(language as any);
    },
    [permissions]
  );

  const refresh = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    error,
    canAccessRoute,
    hasRole,
    isSuperAdmin,
    canUseLanguage,
    refresh,
  };
}