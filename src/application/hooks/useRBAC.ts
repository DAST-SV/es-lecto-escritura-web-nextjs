// ============================================
// CAPA: APPLICATION
// Ubicación: src/application/hooks/useRBAC.ts
// Propósito: Hook de aplicación para gestionar permisos RBAC
// Dependencias: Domain (entities), Infrastructure (repositories)
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RBACRepository } from '@/src/infrastructure/repositories/rbac.repository';
import type { User } from '@/src/domain/entities/user.entity';

interface UseRBACOptions {
  requiredRoute?: string;
  redirectTo?: string;
  language?: string;
}

interface UseRBACReturn {
  canAccess: boolean;
  loading: boolean;
  user: User | null;
  roles: string[];
  checkAccess: (route: string, lang?: string) => Promise<boolean>;
}

export function useRBAC(options: UseRBACOptions = {}): UseRBACReturn {
  const {
    requiredRoute,
    redirectTo = '/',
    language = 'es',
  } = options;

  const router = useRouter();
  const rbacRepository = new RBACRepository();

  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  /**
   * Caso de uso: Verificar acceso a una ruta
   */
  const checkAccess = async (route: string, lang: string = language): Promise<boolean> => {
    try {
      const currentUser = await rbacRepository.getCurrentUser();
      
      if (!currentUser) {
        return false;
      }

      return await rbacRepository.canAccessRoute(currentUser.id, route, lang);
    } catch (err) {
      console.error('[useRBAC] Error in checkAccess:', err);
      return false;
    }
  };

  /**
   * Efecto principal: Inicialización RBAC
   */
  useEffect(() => {
    const initRBAC = async () => {
      try {
        // Obtener usuario actual
        const currentUser = await rbacRepository.getCurrentUser();

        if (!currentUser) {
          setCanAccess(false);
          setLoading(false);
          if (requiredRoute && redirectTo) {
            router.push(redirectTo);
          }
          return;
        }

        setUser(currentUser);

        // Obtener roles del usuario
        const userRoles = await rbacRepository.getUserRoles(currentUser.id);
        setRoles(userRoles);

        // Verificar acceso si se especificó ruta requerida
        if (requiredRoute) {
          const hasAccess = await rbacRepository.canAccessRoute(
            currentUser.id,
            requiredRoute,
            language
          );
          setCanAccess(hasAccess);

          if (!hasAccess && redirectTo) {
            router.push(redirectTo);
          }
        } else {
          setCanAccess(true);
        }
      } catch (err) {
        console.error('[useRBAC] Error in initRBAC:', err);
        setCanAccess(false);
      } finally {
        setLoading(false);
      }
    };

    initRBAC();

    // Escuchar cambios de autenticación
    const unsubscribe = rbacRepository.onAuthStateChange(() => {
      initRBAC();
    });

    return () => {
      unsubscribe();
    };
  }, [requiredRoute, language]);

  return {
    canAccess,
    loading,
    user,
    roles,
    checkAccess,
  };
}