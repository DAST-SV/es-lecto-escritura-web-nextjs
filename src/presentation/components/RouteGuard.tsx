// src/presentation/components/RouteGuard.tsx

/**
 * Route Guard Component
 * Protege rutas en el cliente verificando permisos
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useRouteAccess } from '@/src/presentation/features/permissions/hooks/useRouteAccess';
import { LanguageCode } from '@/src/core/domain/entities/Permission';

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  languageCode?: LanguageCode;
}

export function RouteGuard({ 
  children, 
  fallback,
  redirectTo = '/error?code=403',
  languageCode = 'es'
}: RouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { canAccess, loading } = useRouteAccess({ 
    pathname,
    languageCode 
  });

  useEffect(() => {
    if (!loading && !canAccess) {
      router.push(redirectTo);
    }
  }, [loading, canAccess, router, redirectTo]);

  // Mostrar loading
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no tiene acceso, no mostrar nada (el useEffect redirigirá)
  if (!canAccess) {
    return fallback || null;
  }

  // Tiene acceso, mostrar contenido
  return <>{children}</>;
}

/**
 * Higher Order Component para proteger páginas
 */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<RouteGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteGuard {...options}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}