// ============================================
// 4. PRESENTATION LAYER - HOOK
// ============================================

// src/presentation/features/navigation/hooks/useSecureLink.ts
'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { SecureRoute } from '@/src/core/domain/entities/SecureRoute';
import { GetSecureRouteUseCase } from '@/src/core/application/use-cases/navigation/GetSecureRoute';
import { CheckRouteAccessUseCase } from '@/src/core/application/use-cases/CheckRouteAccessUseCase';
import { SupabaseRouteTranslationRepository } from '@/src/infrastructure/repositories/SupabaseRouteTranslationRepository';
import { SupabasePermissionRepository } from '@/src/infrastructure/repositories/SupabasePermissionRepository';

interface UseSecureLinkProps {
  physicalPath: string;
  translationKey?: string;
  checkAccess?: boolean;
}

export function useSecureLink({ 
  physicalPath, 
  translationKey,
  checkAccess = true 
}: UseSecureLinkProps) {
  const locale = useLocale();
  const t = useTranslations();
  const [route, setRoute] = useState<SecureRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRoute() {
      try {
        setLoading(true);
        setError(null);

        // Obtener usuario actual
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Inyección de dependencias
        const routeTranslationRepo = new SupabaseRouteTranslationRepository();
        const permissionRepo = new SupabasePermissionRepository();
        const checkAccessUseCase = new CheckRouteAccessUseCase(permissionRepo);
        
        const getSecureRouteUseCase = new GetSecureRouteUseCase(
          routeTranslationRepo,
          checkAccessUseCase,
          (key: string) => {
            try {
              return t(key);
            } catch {
              return key;
            }
          }
        );

        // Ejecutar caso de uso
        const secureRoute = await getSecureRouteUseCase.execute({
          physicalPath,
          locale,
          userId: user?.id,
          checkAccess,
          translationKey,
        });

        if (mounted) {
          setRoute(secureRoute);
        }
      } catch (err: any) {
        console.error('[useSecureLink] Error:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRoute();

    return () => {
      mounted = false;
    };
  }, [physicalPath, locale, translationKey, checkAccess, t]);

  return {
    route,
    loading,
    error,
    shouldRender: route?.shouldRender(checkAccess) ?? false,
    fullPath: route?.getFullPath() ?? '#',
    displayText: route?.displayText ?? physicalPath,
  };
}