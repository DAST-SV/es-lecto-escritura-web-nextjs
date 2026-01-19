// ============================================
// 5. PRESENTATION LAYER - COMPONENT
// ============================================

// src/presentation/components/navigation/SecureLink.tsx
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useSecureLink } from '@/src/presentation/features/navigation/hooks/useSecureLink';

export interface SecureLinkProps {
  /** Pathname físico (/library) */
  route: string;

  /** Clave de traducción (nav.library) */
  labelKey?: string;

  /** Contenido personalizado */
  children?: ReactNode;

  /** Verificar acceso (default: true) */
  checkAccess?: boolean;

  /** Comportamiento sin acceso */
  onAccessDenied?: 'hide' | 'disabled' | 'show';

  /** Clases CSS */
  className?: string;

  /** Callback sin acceso */
  onDenied?: () => void;

  /** Props de Next Link */
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
}

/**
 * SecureLink - Link con verificación de acceso basado en Arquitectura Limpia
 * 
 * @example
 * <SecureLink route="/library" labelKey="nav.library" />
 * 
 * @example
 * <SecureLink route="/admin" checkAccess={true}>
 *   <AdminIcon /> Panel
 * </SecureLink>
 */
export function SecureLink({
  route,
  labelKey,
  children,
  checkAccess = true,
  onAccessDenied = 'hide',
  className = '',
  onDenied,
  prefetch,
  replace,
  scroll,
}: SecureLinkProps) {
  // ✅ Hook que ejecuta casos de uso
  const { route: secureRoute, loading, shouldRender, fullPath, displayText } = useSecureLink({
    physicalPath: route,
    translationKey: labelKey,
    checkAccess,
  });

  // Loading
  if (loading) {
    return (
      <span className={`opacity-50 cursor-wait ${className}`}>
        {children || displayText}
      </span>
    );
  }

  // Sin acceso
  if (!shouldRender) {
    if (onDenied) onDenied();

    switch (onAccessDenied) {
      case 'hide':
        return null;

      case 'disabled':
        return (
          <span
            className={`cursor-not-allowed opacity-50 ${className}`}
            title="No tienes acceso a esta sección"
          >
            {children || displayText}
          </span>
        );

      case 'show':
        break;

      default:
        return null;
    }
  }

  // Renderizar link
  return (
    <Link
      href={fullPath}
      className={className}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
    >
      {children || displayText}
    </Link>
  );
}

export default SecureLink;