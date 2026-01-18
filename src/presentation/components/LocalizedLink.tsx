// ============================================
// src/presentation/components/LocalizedLink.tsx
// Componente Link inteligente con traducción y verificación de permisos
// ============================================

'use client';

import React from 'react';
import Link from 'next/link';
import { RouteKey } from '@/src/infrastructure/config/route-keys.config';
import { useLocalizedRoute } from '@/src/presentation/hooks/useLocalizedRoute';
import { useRouteAccess } from '@/src/presentation/hooks/useRouteAccess';

interface LocalizedLinkProps {
  /** Clave de la ruta (ej: 'admin.users') */
  routeKey: RouteKey;

  /** Parámetros dinámicos para la ruta (ej: { id: '123' }) */
  params?: Record<string, string | number>;

  /** Texto o componente a renderizar dentro del Link */
  children: React.ReactNode;

  /** Clases CSS adicionales */
  className?: string;

  /** Si true, verifica permisos antes de mostrar el enlace */
  checkAccess?: boolean;

  /** Componente a renderizar mientras se verifican permisos */
  loadingComponent?: React.ReactNode;

  /** Componente a renderizar si no tiene acceso */
  fallbackComponent?: React.ReactNode;

  /** Props adicionales para el componente Link de Next.js */
  linkProps?: Omit<React.ComponentProps<typeof Link>, 'href'>;

  /** Callback cuando se hace click en el enlace */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Componente Link inteligente que:
 * 1. Traduce automáticamente la ruta según el idioma actual
 * 2. Verifica permisos de acceso (opcional)
 * 3. Solo muestra el enlace si el usuario tiene acceso
 *
 * @example
 * ```tsx
 * // Link simple con traducción automática
 * <LocalizedLink routeKey="admin.users">
 *   Admin Usuarios
 * </LocalizedLink>
 *
 * // Link con parámetros dinámicos
 * <LocalizedLink routeKey="books.edit" params={{ id: '123' }}>
 *   Editar Libro
 * </LocalizedLink>
 *
 * // Link con verificación de permisos
 * <LocalizedLink
 *   routeKey="admin.users"
 *   checkAccess
 *   fallbackComponent={<span className="text-gray-400">No autorizado</span>}
 * >
 *   Admin Usuarios
 * </LocalizedLink>
 *
 * // Link completo con todas las opciones
 * <LocalizedLink
 *   routeKey="admin.roles"
 *   checkAccess
 *   className="text-blue-600 hover:underline"
 *   loadingComponent={<Spinner size="sm" />}
 *   fallbackComponent={null}
 *   onClick={(e) => console.log('Clicked!')}
 * >
 *   Gestionar Roles
 * </LocalizedLink>
 * ```
 */
export function LocalizedLink({
  routeKey,
  params,
  children,
  className,
  checkAccess = false,
  loadingComponent = null,
  fallbackComponent = null,
  linkProps,
  onClick,
}: LocalizedLinkProps) {
  // 1. Obtener ruta traducida
  const href = useLocalizedRoute(routeKey, params);

  // 2. Verificar permisos si está habilitado
  const { canAccess, isLoading, error } = useRouteAccess(
    routeKey,
    checkAccess ? params : undefined
  );

  // 3. Si NO se debe verificar acceso, renderizar directamente
  if (!checkAccess) {
    return (
      <Link href={href} className={className} onClick={onClick} {...linkProps}>
        {children}
      </Link>
    );
  }

  // 4. Si está cargando, mostrar componente de carga
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  // 5. Si hay error o no tiene acceso, mostrar fallback
  if (error || !canAccess) {
    return <>{fallbackComponent}</>;
  }

  // 6. Renderizar enlace normal
  return (
    <Link href={href} className={className} onClick={onClick} {...linkProps}>
      {children}
    </Link>
  );
}

// ============================================
// VARIANTES ESPECIALIZADAS
// ============================================

interface NavLinkProps extends Omit<LocalizedLinkProps, 'checkAccess'> {
  /** Si true, aplica estilos de enlace activo */
  active?: boolean;

  /** Clases CSS cuando el enlace está activo */
  activeClassName?: string;

  /** Clases CSS cuando el enlace está inactivo */
  inactiveClassName?: string;
}

/**
 * Variante de LocalizedLink para navegación
 * Siempre verifica permisos y no muestra nada si no tiene acceso
 *
 * @example
 * ```tsx
 * <NavLink
 *   routeKey="admin.users"
 *   active={pathname === '/admin/usuarios'}
 *   activeClassName="bg-blue-600 text-white"
 *   inactiveClassName="text-gray-700 hover:bg-gray-100"
 * >
 *   Usuarios
 * </NavLink>
 * ```
 */
export function NavLink({
  active = false,
  activeClassName = '',
  inactiveClassName = '',
  className = '',
  ...props
}: NavLinkProps) {
  const computedClassName = `${className} ${
    active ? activeClassName : inactiveClassName
  }`.trim();

  return (
    <LocalizedLink
      {...props}
      checkAccess
      className={computedClassName}
      fallbackComponent={null}
    />
  );
}

interface ButtonLinkProps extends Omit<LocalizedLinkProps, 'checkAccess'> {
  /** Variante del botón */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg';

  /** Si true, el botón ocupa todo el ancho */
  fullWidth?: boolean;

  /** Si true, deshabilita el botón */
  disabled?: boolean;
}

/**
 * Variante de LocalizedLink con estilos de botón
 * Siempre verifica permisos y muestra botón deshabilitado si no tiene acceso
 *
 * @example
 * ```tsx
 * <ButtonLink
 *   routeKey="books.create"
 *   variant="primary"
 *   size="md"
 * >
 *   Crear Libro
 * </ButtonLink>
 * ```
 */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}: ButtonLinkProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const computedClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`.trim();

  return (
    <LocalizedLink
      {...props}
      checkAccess
      className={computedClassName}
      fallbackComponent={
        <button
          className={`${computedClassName} opacity-50 cursor-not-allowed`}
          disabled
        >
          {props.children}
        </button>
      }
    />
  );
}

/**
 * Componente para renderizar múltiples enlaces condicionales
 *
 * @example
 * ```tsx
 * <ConditionalLinks
 *   links={[
 *     { key: 'admin.users', label: 'Usuarios' },
 *     { key: 'admin.roles', label: 'Roles' },
 *     { key: 'admin.audit', label: 'Auditoría' },
 *   ]}
 *   className="flex gap-4"
 *   linkClassName="text-blue-600 hover:underline"
 * />
 * ```
 */
interface ConditionalLinksProps {
  links: Array<{
    key: RouteKey;
    label: string;
    params?: Record<string, string | number>;
    className?: string;
  }>;
  className?: string;
  linkClassName?: string;
  separator?: React.ReactNode;
}

export function ConditionalLinks({
  links,
  className,
  linkClassName,
  separator = null,
}: ConditionalLinksProps) {
  return (
    <div className={className}>
      {links.map((link, index) => (
        <React.Fragment key={link.key}>
          <NavLink
            routeKey={link.key}
            params={link.params}
            className={`${linkClassName} ${link.className || ''}`.trim()}
          >
            {link.label}
          </NavLink>
          {separator && index < links.length - 1 && separator}
        </React.Fragment>
      ))}
    </div>
  );
}
