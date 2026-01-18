// ============================================
// ARCHIVO: app/[locale]/admin/role-permissions/page.tsx
// ✅ CORREGIDO: Permisos SEPARADOS por idioma
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { RouteGuard } from '@/src/presentation/components/RouteGuard';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface Role {
  id: string;
  name: string;
  display_name: string;
  hierarchy_level: number;
}

interface Route {
  id: string;
  pathname: string;
  display_name: string;
  icon: string | null;
  translated_path: string;
  translated_name: string;
}

interface RoutePermission {
  id: string;
  role_name: string;
  route_id: string;
  // ❌ ELIMINADO: language_code (no existe en route_permissions)
}

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
] as const;

export default function RolePermissionsPage() {
  const locale = useLocale();
  const [roles, setRoles] = useState<Role[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [permissions, setPermissions] = useState<RoutePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedLanguage]);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: rolesData } = await supabase
      .schema('app')
      .from('roles')
      .select('*')
      .order('hierarchy_level', { ascending: false });

    // Cargar rutas con traducciones
    const { data: routesData } = await supabase
      .schema('app')
      .from('routes')
      .select(`
        id,
        pathname,
        display_name,
        icon,
        route_translations!left(
          language_code,
          translated_path,
          translated_name
        )
      `)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('menu_order');

    const mappedRoutes = (routesData || []).map((route: any) => {
      const translation = route.route_translations?.find(
        (t: any) => t.language_code === selectedLanguage
      );
      
      return {
        id: route.id,
        pathname: route.pathname,
        display_name: route.display_name,
        icon: route.icon,
        translated_path: translation?.translated_path || route.pathname,
        translated_name: translation?.translated_name || route.display_name,
      };
    });

    // Cargar permisos (sin language_code, eso está en role_language_access)
    const { data: permissionsData, error: permError } = await supabase
      .schema('app')
      .from('route_permissions')
      .select('id, role_name, route_id, is_active')
      .eq('is_active', true);

    if (permError) {
      console.error('Error loading permissions:', permError);
    }

    setRoles(rolesData || []);
    setRoutes(mappedRoutes);
    setPermissions(permissionsData || []);
    setLoading(false);
  };

  // ✅ CORRECCIÓN: Verificar si el rol tiene la ruta (sin idioma)
  const hasPermission = (roleId: string, routeId: string): boolean => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return false;

    return permissions.some(
      p => p.role_name === role.name && p.route_id === routeId
    );
  };

  // ✅ CORRECCIÓN: Toggle permiso de ruta (sin idioma)
  const togglePermission = async (roleId: string, routeId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    setSaving(true);
    const supabase = createClient();

    const exists = hasPermission(roleId, routeId);

    if (exists) {
      // Eliminar permiso
      const permission = permissions.find(
        p => p.role_name === role.name && p.route_id === routeId
      );

      if (permission) {
        const { error } = await supabase
          .schema('app')
          .from('route_permissions')
          .delete()
          .eq('id', permission.id);

        if (!error) {
          setPermissions(prev => prev.filter(p => p.id !== permission.id));
        }
      }
    } else {
      // Agregar permiso (sin language_code)
      const { data, error } = await supabase
        .schema('app')
        .from('route_permissions')
        .insert({
          role_name: role.name,
          route_id: routeId,
          is_active: true,
        })
        .select()
        .single();

      if (!error && data) {
        setPermissions(prev => [...prev, data]);
      }
    }

    setSaving(false);
  };

  // ✅ CORRECCIÓN: Toggle todas (sin idioma)
  const toggleAllForRole = async (roleId: string, grant: boolean) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    setSaving(true);
    const supabase = createClient();

    if (grant) {
      const newPermissions = routes
        .filter(route => !hasPermission(roleId, route.id))
        .map(route => ({
          role_name: role.name,
          route_id: route.id,
          is_active: true,
        }));

      if (newPermissions.length > 0) {
        const { data } = await supabase
          .schema('app')
          .from('route_permissions')
          .insert(newPermissions)
          .select();

        if (data) {
          setPermissions(prev => [...prev, ...data]);
        }
      }
    } else {
      const toDelete = permissions.filter(p => p.role_name === role.name);

      if (toDelete.length > 0) {
        const ids = toDelete.map(p => p.id);
        await supabase
          .schema('app')
          .from('route_permissions')
          .delete()
          .in('id', ids);

        setPermissions(prev => prev.filter(p => !ids.includes(p.id)));
      }
    }

    setSaving(false);
  };

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔐 Módulo 4: Permisos por Rol
            </h1>
            <p className="text-gray-600">
              Asigna rutas a roles. El acceso por idioma se controla en role_language_access.
            </p>
          </div>

          {/* Selector de idioma (solo para ver traducciones) */}
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌍 Idioma de visualización:
            </label>
            <div className="flex gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedLanguage === lang.code
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ℹ️ Los permisos NO son por idioma. El selector solo cambia los nombres mostrados.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Lista de Roles */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <h2 className="text-lg font-semibold">Roles ({roles.length})</h2>
                  </div>
                  <div className="divide-y">
                    {roles.map(role => {
                      // Contar permisos del rol (sin idioma)
                      const permCount = permissions.filter(p => 
                        p.role_name === role.name
                      ).length;

                      return (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role)}
                          className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                            selectedRole?.id === role.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{role.display_name}</h3>
                              <p className="text-sm text-gray-500">
                                {permCount} rutas asignadas
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rutas para el Rol */}
              <div className="lg:col-span-2">
                {selectedRole ? (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 bg-gray-50 border-b">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                          {selectedRole.display_name}
                        </h2>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleAllForRole(selectedRole.id, true)}
                            disabled={saving}
                            className="text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                          >
                            ✅ Todas
                          </button>
                          <button
                            onClick={() => toggleAllForRole(selectedRole.id, false)}
                            disabled={saving}
                            className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                          >
                            ❌ Quitar Todas
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y max-h-[600px] overflow-y-auto">
                      {routes.map(route => {
                        const checked = hasPermission(selectedRole.id, route.id);
                        
                        return (
                          <div key={route.id} className="p-4 hover:bg-gray-50">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePermission(selectedRole.id, route.id)}
                                disabled={saving}
                                className="w-5 h-5 text-blue-600 rounded"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {route.icon && <span>{route.icon}</span>}
                                  <span className="font-medium">{route.translated_name}</span>
                                </div>
                                <code className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  {route.translated_path}
                                </code>
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                    Selecciona un rol
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Ayuda */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              ℹ️ Cómo Funcionan los Permisos por Rol
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• <strong>route_permissions:</strong> Define QUÉ rutas puede usar cada rol</li>
              <li>• <strong>role_language_access:</strong> Define EN QUÉ idiomas puede usarlas</li>
              <li>• Si un rol tiene permiso de /library PERO no acceso a 'en', no podrá acceder</li>
              <li>• El selector de idioma arriba solo cambia los nombres mostrados</li>
            </ul>
          </div>

        </div>
      </div>
    </RouteGuard>
  );
}