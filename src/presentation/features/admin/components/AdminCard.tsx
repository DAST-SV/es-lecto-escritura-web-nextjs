// ============================================
// src/presentation/features/admin/components/AdminCard.tsx
// Tarjeta de módulo admin profesional con validación de acceso
// ============================================

'use client';

import { NavigationLink } from '../../navigation/components/NavigationLink';
import { useSupabaseTranslations } from '../../translations/hooks/useSupabaseTranslations';

interface AdminCardProps {
  /** Clave del módulo en las traducciones (ej: "route_scanner") */
  moduleKey: string;
  /** Número de orden (opcional) */
  number?: string;
}

const colorClasses = {
  blue: {
    border: 'border-blue-200 hover:border-blue-400 bg-blue-50/50',
    badge: 'bg-blue-100 text-blue-800',
  },
  green: {
    border: 'border-green-200 hover:border-green-400 bg-green-50/50',
    badge: 'bg-green-100 text-green-800',
  },
  purple: {
    border: 'border-purple-200 hover:border-purple-400 bg-purple-50/50',
    badge: 'bg-purple-100 text-purple-800',
  },
  gray: {
    border: 'border-gray-200 hover:border-gray-400 bg-gray-50/50',
    badge: 'bg-gray-100 text-gray-800',
  },
  orange: {
    border: 'border-orange-200 hover:border-orange-400 bg-orange-50/50',
    badge: 'bg-orange-100 text-orange-800',
  },
  indigo: {
    border: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/50',
    badge: 'bg-indigo-100 text-indigo-800',
  },
};

type ColorType = keyof typeof colorClasses;

/**
 * AdminCard - Tarjeta de módulo admin profesional
 *
 * Características:
 * - Carga TODOS los textos desde traducciones DB
 * - Valida acceso antes de mostrar
 * - Solo se muestra si el usuario tiene permiso
 * - Diseño responsive y bonito
 *
 * Estructura de claves de traducción:
 * ```
 * admin.modules.{moduleKey}.title       - Título del módulo
 * admin.modules.{moduleKey}.description - Descripción
 * admin.modules.{moduleKey}.href        - Ruta del módulo
 * admin.modules.{moduleKey}.icon        - Icono (emoji o clase CSS)
 * admin.modules.{moduleKey}.color       - Color (blue, green, purple, gray, orange, indigo)
 * ```
 *
 * @example
 * ```tsx
 * <AdminCard moduleKey="route_scanner" number="1" />
 * ```
 */
export function AdminCard({ moduleKey, number }: AdminCardProps) {
  const { t, loading } = useSupabaseTranslations('admin.modules');

  // Cargar datos del módulo desde traducciones
  const title = t(`${moduleKey}.title`);
  const description = t(`${moduleKey}.description`);
  const href = t(`${moduleKey}.href`);
  const icon = t(`${moduleKey}.icon`);
  const color = (t(`${moduleKey}.color`) || 'gray') as ColorType;
  const actionText = t('common.open_module');

  // Si está cargando, mostrar skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  // Si no encontró la traducción, no renderizar
  if (!title || title.startsWith('[')) {
    return null;
  }

  const classes = colorClasses[color] || colorClasses.gray;

  return (
    <NavigationLink
      href={href}
      className="block"
      showLoadingState={true}
      fallback={
        // No se muestra nada si no tiene acceso (la tarjeta simplemente no aparece)
        null
      }
    >
      <div className={`${classes.border} bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 h-full`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 flex items-center gap-2">
            {icon && <span>{icon}</span>}
            {title}
          </h3>
          {number && (
            <span className={`${classes.badge} text-sm font-bold px-3 py-1 rounded-full`}>
              {number}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-4">
          {description}
        </p>
        <div className="flex items-center text-indigo-600 text-sm font-medium">
          {actionText || 'Abrir módulo'}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </NavigationLink>
  );
}
