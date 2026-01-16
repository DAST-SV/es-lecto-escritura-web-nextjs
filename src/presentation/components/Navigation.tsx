// src/presentation/components/Navigation.tsx

/**
 * Navigation Component
 * Menú de navegación que muestra rutas según permisos del usuario
 */

'use client';

import { usePermissions } from '@/src/presentation/features/permissions/hooks/usePermissions';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  pathname: string;
  label: string;
  icon?: string;
  requiredRole?: string;
}

const navItems: NavItem[] = [
  { pathname: '/', label: 'Home', icon: '🏠' },
  { pathname: '/library', label: 'Biblioteca', icon: '📚' },
  { pathname: '/my-world', label: 'Mi Mundo', icon: '🌍' },
  { pathname: '/my-progress', label: 'Mi Progreso', icon: '📊' },
  { pathname: '/admin', label: 'Admin', icon: '⚙️', requiredRole: 'super_admin' },
];

export function Navigation() {
  const { permissions, loading, canAccessRoute, hasRole } = usePermissions();
  const pathname = usePathname();

  if (loading) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-24 h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Filtrar items según permisos
  const visibleItems = navItems.filter(item => {
    // Si requiere un rol específico, verificar
    if (item.requiredRole && !hasRole(item.requiredRole)) {
      return false;
    }
    // Verificar acceso a la ruta
    return canAccessRoute(item.pathname);
  });

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {visibleItems.map(item => {
              const isActive = pathname === item.pathname;
              return (
                <Link
                  key={item.pathname}
                  href={item.pathname}
                  className={`
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                    ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User info */}
          {permissions && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                {permissions.roles.map(r => r.display_name).join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}