// ============================================
// app/[locale]/admin/layout.tsx
// ✅ Layout con menú lateral completo incluyendo traducciones
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileSearch,
  Settings,
  LogOut,
  Menu,
  X,
  Languages,
  Key,
  Route as RouteIcon,
  ChevronDown,
  Globe,
  Building2,
  Shield,
  UserCircle,
  Package,
  Tag,
  FolderTree,
} from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: MenuItem[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const supabase = createClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['translations']); // Expandir traducciones por defecto

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      setUserEmail(user.email || '');
      setIsLoading(false);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      router.push(`/${locale}/login`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  // ✅ NUEVO: Menú completo con todas las secciones
  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: `/${locale}/admin`,
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Organizaciones',
      href: `/${locale}/admin/organizations`,
      icon: <Building2 size={20} />,
    },
    {
      name: 'Usuarios',
      href: '#',
      icon: <Users size={20} />,
      children: [
        {
          name: 'Perfiles de Usuario',
          href: `/${locale}/admin/user-profiles`,
          icon: <UserCircle size={18} />,
        },
        {
          name: 'Relaciones de Usuario',
          href: `/${locale}/admin/user-relationships`,
          icon: <Users size={18} />,
        },
        {
          name: 'Roles de Usuario',
          href: `/${locale}/admin/user-roles`,
          icon: <Shield size={18} />,
        },
      ],
    },
    {
      name: 'Roles y Permisos',
      href: '#',
      icon: <Shield size={20} />,
      children: [
        {
          name: 'Roles',
          href: `/${locale}/admin/roles`,
          icon: <Shield size={18} />,
        },
        {
          name: 'Permisos de Rutas',
          href: `/${locale}/admin/route-permissions`,
          icon: <RouteIcon size={18} />,
        },
        {
          name: 'Permisos de Usuario',
          href: `/${locale}/admin/user-permissions`,
          icon: <Key size={18} />,
        },
        {
          name: 'Acceso por Rol e Idioma',
          href: `/${locale}/admin/role-language-access`,
          icon: <Globe size={18} />,
        },
      ],
    },
    {
      name: 'Idiomas',
      href: `/${locale}/admin/languages`,
      icon: <Globe size={20} />,
    },
    {
      name: 'Sistema de Traducciones',
      href: '#',
      icon: <Languages size={20} />,
      children: [
        {
          name: 'Namespaces',
          href: `/${locale}/admin/translation-namespaces`,
          icon: <FolderTree size={18} />,
        },
        {
          name: 'Categorías',
          href: `/${locale}/admin/translation-categories`,
          icon: <Tag size={18} />,
        },
        {
          name: 'Claves de Traducción',
          href: `/${locale}/admin/translation-keys`,
          icon: <Key size={18} />,
        },
        {
          name: 'Traducciones',
          href: `/${locale}/admin/translations`,
          icon: <Languages size={18} />,
        },
      ],
    },
    {
      name: 'Miembros de Organización',
      href: `/${locale}/admin/organization-members`,
      icon: <Users size={20} />,
    },
    {
      name: 'Auditoría',
      href: `/${locale}/admin/audit`,
      icon: <FileSearch size={20} />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  // Menú con submenús
                  <div>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors ${
                        expandedMenus.includes(item.name)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transform transition-transform ${
                          expandedMenus.includes(item.name) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {/* Submenús */}
                    {expandedMenus.includes(item.name) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              pathname === child.href
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {child.icon}
                            <span className="text-sm">{child.name}</span>
                            {child.badge !== undefined && child.badge > 0 && (
                              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Menú simple
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Footer - User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userEmail}
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar móvil */}
        <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}