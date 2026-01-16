// src/presentation/features/permissions/hooks/usePermissions.ts

/**
 * Presentation Hook: usePermissions
 * Hook para acceder a los permisos del usuario en componentes
 */

'use client';

import { useEffect, useState } from 'react';
import { SupabasePermissionRepository } from '@/src/infrastructure/repositories/SupabasePermissionRepository';
import { GetUserPermissionsUseCase } from '@/src/core/application/use-cases/GetUserPermissionsUseCase';
import { UserPermissions, LanguageCode } from '@/src/core/domain/entities/Permission';
import { createClient } from '@/src/infrastructure/config/supabase.config';

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setPermissions(null);
          return;
        }

        // Usar el caso de uso
        const repository = new SupabasePermissionRepository();
        const useCase = new GetUserPermissionsUseCase(repository);
        const userPermissions = await useCase.execute(user.id);

        setPermissions(userPermissions);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error loading permissions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  return {
    permissions,
    loading,
    error,
    // Helper functions
    hasRole: (roleName: string) => permissions?.hasRole(roleName) ?? false,
    isSuperAdmin: () => permissions?.isSuperAdmin() ?? false,
    canAccessRoute: (pathname: string) => permissions?.canAccessRoute(pathname) ?? false,
    canUseLanguage: (language: LanguageCode) => permissions?.canUseLanguage(language) ?? false,
  };
}