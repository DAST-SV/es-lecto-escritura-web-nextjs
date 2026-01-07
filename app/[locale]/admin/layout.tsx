/**
 * UBICACIÓN: app/[locale]/admin/layout.tsx
 * 🎨 Layout principal del panel de administración
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSearch,
  Users,
  BookOpen,
  Settings,
  Database,
  TrendingUp,
  Shield,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vista general',
  },
  {
    title: 'Auditoría',
    href: '/admin/audit',
    icon: FileSearch,
    description: 'Integridad de datos',
  },
  {
    title: 'Usuarios',
    href: '/admin/users',
    icon: Users,
    description: 'Gestión de usuarios',
    comingSoon: true,
  },
  {
    title: 'Libros',
    href: '/admin/books',
    icon: BookOpen,
    description: 'Gestión de libros',
    comingSoon: true,
  },
  {
    title: 'Base de Datos',
    href: '/admin/database',
    icon: Database,
    description: 'Mantenimiento BD',
    comingSoon: true,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    description: 'Estadísticas',
    comingSoon: true,
  },
  {
    title: 'Seguridad',
    href: '/admin/security',
    icon: Shield,
    description: 'Logs y accesos',
    comingSoon: true,
  },
  {
    title: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
    description: 'Ajustes del sistema',
    comingSoon: true,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-500">
                Sistema de gestión y monitoreo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Volver al sitio
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] 
            w-64 bg-white border-r border-gray-200 
            transform transition-transform duration-200 z-30
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-1 overflow-y-auto h-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.comingSoon ? '#' : item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-colors group relative
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : item.comingSoon
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={20} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      {item.comingSoon && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          Próximo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay para móvil */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>
    </div>
  );
}