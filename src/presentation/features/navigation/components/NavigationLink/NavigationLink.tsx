// ============================================
// src/presentation/features/navigation/components/NavigationLink/NavigationLink.tsx
// Componente profesional de redirección con validación de acceso
// ============================================

'use client';

import { useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface NavigationLinkProps {
  /** Ruta traducida (sin locale), ej: "/admin/roles" */
  href: string;
  /** Contenido del link (botón, texto, icono, etc.) */
  children: ReactNode;
  /** Clase CSS adicional */
  className?: string;
  /** Si true, fuerza navegación incluso sin acceso (usar con cuidado) */
  forceNavigation?: boolean;
  /** Callback cuando no tiene acceso */
  onAccessDenied?: () => void;
  /** Mostrar loading mientras verifica acceso */
  showLoadingState?: boolean;
  /** Componente alternativo si no tiene acceso */
  fallback?: ReactNode;
}

/**
 * NavigationLink - Link inteligente que valida acceso antes de mostrar
 *
 * Características:
 * - Verifica acceso usando can_access_route RPC
 * - Solo muestra el link si el usuario tiene acceso
 * - Opcionalmente muestra fallback si no tiene acceso
 * - Soporta rutas multiidioma
 * - Previene navegación a rutas sin acceso
 *
 * @example
 * ```tsx
 * <NavigationLink href="/admin/roles">
 *   <button>Gestionar Roles</button>
 * </NavigationLink>
 * ```
 */
export function NavigationLink({
  href,
  children,
  className = '',
  forceNavigation = false,
  onAccessDenied,
  showLoadingState = false,
  fallback = null,
}: NavigationLinkProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Si forceNavigation está activado, saltamos la verificación
    if (forceNavigation) {
      setHasAccess(true);
      setIsChecking(false);
      return;
    }

    async function checkAccess() {
      try {
        const supabase = createClient();

        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          // Usuario no autenticado - verificar si es ruta pública
          // TODO: cargar rutas públicas desde configuración
          const publicRoutes = ['/', '/auth/login', '/auth/register'];
          const isPublic = publicRoutes.includes(href);
          setHasAccess(isPublic);
          setIsChecking(false);
          return;
        }

        // Verificar acceso con RPC
        const { data: canAccess, error: accessError } = await supabase.rpc('can_access_route', {
          p_user_id: user.id,
          p_translated_path: href,
          p_language_code: locale,
        });

        if (accessError) {
          console.error('[NavigationLink] Error checking access:', accessError);
          setHasAccess(false);
          setIsChecking(false);
          return;
        }

        setHasAccess(canAccess || false);
        setIsChecking(false);

        // Callback si no tiene acceso
        if (!canAccess && onAccessDenied) {
          onAccessDenied();
        }
      } catch (error) {
        console.error('[NavigationLink] Fatal error:', error);
        setHasAccess(false);
        setIsChecking(false);
      }
    }

    checkAccess();
  }, [href, locale, forceNavigation, onAccessDenied]);

  // Mostrar loading state
  if (isChecking && showLoadingState) {
    return (
      <div className={className}>
        <div className="animate-pulse bg-gray-200 rounded h-10 w-full"></div>
      </div>
    );
  }

  // Si aún está verificando, no mostrar nada
  if (isChecking) {
    return null;
  }

  // Si no tiene acceso, mostrar fallback
  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  // Construir href completo con locale
  const fullHref = `/${locale}${href}`;

  // Tiene acceso, mostrar link
  return (
    <Link href={fullHref} className={className}>
      {children}
    </Link>
  );
}

/**
 * Hook para verificar acceso a una ruta programáticamente
 *
 * @example
 * ```tsx
 * const { hasAccess, isChecking } = useRouteAccess('/admin/roles');
 *
 * if (isChecking) return <Loading />;
 * if (!hasAccess) return <Forbidden />;
 * return <AdminPanel />;
 * ```
 */
export function useRouteAccess(href: string) {
  const locale = useLocale();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setHasAccess(false);
          setIsChecking(false);
          return;
        }

        const { data: canAccess } = await supabase.rpc('can_access_route', {
          p_user_id: user.id,
          p_translated_path: href,
          p_language_code: locale,
        });

        setHasAccess(canAccess || false);
        setIsChecking(false);
      } catch (error) {
        console.error('[useRouteAccess] Error:', error);
        setHasAccess(false);
        setIsChecking(false);
      }
    }

    checkAccess();
  }, [href, locale]);

  return { hasAccess, isChecking };
}
