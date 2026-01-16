// src/presentation/features/permissions/hooks/useRouteAccess.ts

/**
 * Presentation Hook: useRouteAccess
 * Hook para verificar si el usuario puede acceder a una ruta específica
 */

'use client';

import { useEffect, useState } from 'react';
import { SupabasePermissionRepository } from '@/src/infrastructure/repositories/SupabasePermissionRepository';
import { CheckRouteAccessUseCase } from '@/src/core/application/use-cases/CheckRouteAccessUseCase';
import { LanguageCode } from '@/src/core/domain/entities/Permission';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface UseRouteAccessOptions {
  pathname: string;
  languageCode?: LanguageCode;
}

export function useRouteAccess({ pathname, languageCode = 'es' }: UseRouteAccessOptions) {
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Usar el caso de uso
        const repository = new SupabasePermissionRepository();
        const useCase = new CheckRouteAccessUseCase(repository);
        const hasAccess = await useCase.execute(user?.id, pathname, languageCode);

        setCanAccess(hasAccess);
      } catch (err) {
        console.error('Error checking route access:', err);
        setCanAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [pathname, languageCode]);

  return { canAccess, loading };
}