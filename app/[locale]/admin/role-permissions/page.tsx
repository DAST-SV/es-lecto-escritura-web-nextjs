// ============================================
// app/[locale]/admin/role-permissions/page.tsx
// ✅ SOLO ASIGNAR PERMISOS GRANULARES
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { RouteGuard } from '@/src/presentation/features/permissions/components';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  hierarchy_level: number;
}

interface RouteTranslation {
  language_code: string;
  translated_path: string;
  translated_name: string;
}

interface Route {
  id: string;
  pathname: string;
  display_name: string;
  icon: string;
  route_translations: RouteTranslation[];
}

interface RolePermission {
  id: string;
  role_name: string;
  route_id: string;
  language_code: string | null;
  is_active: boolean;
}

const LANGUAGES = [
  { code: null, name: 'Todos los idiomas', flag: '🌍' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
] as const;

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRoles();
    loadRoutes();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadPermissions(selectedRole.name);
    }
  }, [selectedRole]);

  const loadRoles = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .schema('app')
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('hierarchy_level', { ascending: false });

    setRoles(data || []);
    setLoading(false);
  };

  const loadRoutes = async () => {
    const supabase = createClient();
    const { data } = await supabase
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
      .order('pathname');

    setRoutes((data || []) as Route[]);
  };

  const loadPermissions = async (roleName: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .schema('app')
      .from('route_permissions')
      .select('*')
      .eq('role_name', roleName)
      .eq('is_active', true);

    setPermissions(data || []);
  };

  const toggleRoute = (routeId: string) => {
    setExpandedRoutes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  };

  const hasPermission = (routeId: string, languageCode: string | null, permissionType: 'grant' | 'deny'): boolean => {
    return permissions.some(
      p => p.route_id === routeId && p.language_code === languageCode
    );
  };

  const grantPermission = async (routeId: string, languageCode: string | null) => {
    if (!selectedRole) return;
    
    setSaving(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .schema('app')
        .from('route_permissions')
        .insert({
          role_name: selectedRole.name,
          route_id: routeId,
          language_code: languageCode,
          is_active: true,
        });
      
      if (error) {
        if (error.code === '23505') {
          alert('Ya existe este permiso');
        } else {
          throw error;
        }
      } else {
        alert(`✅ Acceso ${languageCode ? languageCode.toUpperCase() : 'GLOBAL'} otorgado`);
        await loadPermissions(selectedRole.name);
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const denyPermission = async (routeId: string, languageCode: string | null) => {
    if (!selectedRole) return;
    if (!confirm(`¿Eliminar acceso ${languageCode ? languageCode.toUpperCase() : 'GLOBAL'}?`)) return;
    
    setSaving(true);
    const supabase = createClient();
    
    try {
      const permission = permissions.find(
        p => p.route_id === routeId && p.language_code === languageCode
      );
      
      if (permission) {
        const { error } = await supabase
          .schema('app')
          .from('route_permissions')
          .delete()
          .eq('id', permission.id);
        
        if (error) throw error;
        
        alert(`✅ Acceso eliminado`);
        await loadPermissions(selectedRole.name);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getLanguageFlag = (code: string | null) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang?.flag || '🌍';
  };

  const getLanguageName = (code: string | null) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang?.name || 'Todos';
  };

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🔐 Permisos Granulares por Rol</h1>
          <p className="text-gray-600 mb-8">Control de acceso POR RUTA TRADUCIDA para roles</p>

          {/* Seleccionar rol */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Seleccionar Rol</h2>
            {loading ? (
              <p className="text-gray-500">Cargando roles...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role);
                      setExpandedRoutes(new Set());
                    }}
                    className={`
                      p-4 border-2 rounded-lg text-left transition-all
                      ${selectedRole?.id === role.id
                        ? 'bg-indigo-50 border-indigo-500 shadow-md'
                        : 'bg-white border-gray-300 hover:border-indigo-300'
                      }
                    `}
                  >
                    <h3 className="font-semibold text-gray-900">{role.display_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{role.description || 'Sin descripción'}</p>
                    <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Nivel: {role.hierarchy_level}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedRole && (
            <div className="space-y-6">
              {/* Info del rol */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Rol Seleccionado</h2>
                  <button
                    onClick={() => {
                      setSelectedRole(null);
                      setPermissions([]);
                      setExpandedRoutes(new Set());
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ❌ Cambiar
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                    🎭
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedRole.display_name}</h3>
                    <p className="text-gray-600">{selectedRole.description}</p>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                      {selectedRole.name} (Nivel: {selectedRole.hierarchy_level})
                    </code>
                  </div>
                </div>
              </div>

              {/* SOLO ESTO: Lista de rutas agrupadas */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 bg-indigo-50 border-b">
                  <h2 className="text-lg font-semibold text-indigo-900">
                    ➕ Asignar Permisos Granulares
                  </h2>
                  <p className="text-sm text-indigo-700 mt-1">
                    Haz clic en cada ruta para expandir sus traducciones
                  </p>
                </div>
                <div className="divide-y">
                  {routes.map((route) => {
                    const isExpanded = expandedRoutes.has(route.id);
                    const translations = route.route_translations || [];
                    
                    return (
                      <div key={route.id} className="border-b last:border-b-0">
                        {/* Cabecera de ruta */}
                        <button
                          onClick={() => toggleRoute(route.id)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {route.icon && <span className="text-2xl">{route.icon}</span>}
                            <div className="text-left">
                              <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {route.pathname}
                              </code>
                              <p className="text-sm text-gray-600 mt-1">{route.display_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {translations.length} idiomas
                            </span>
                            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </div>
                        </button>

                        {/* Traducciones expandibles */}
                        {isExpanded && (
                          <div className="bg-gray-50 px-6 pb-4">
                            {/* Opción global */}
                            <div className="py-3 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🌍</span>
                                  <div>
                                    <p className="font-semibold text-gray-900">Todos los idiomas</p>
                                    <p className="text-xs text-gray-500">Acceso global a todas las traducciones</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => grantPermission(route.id, null)}
                                    disabled={hasPermission(route.id, null, 'grant') || saving}
                                    className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                  >
                                    {hasPermission(route.id, null, 'grant') ? '✓ GRANTED' : 'GRANT'}
                                  </button>
                                  <button
                                    onClick={() => denyPermission(route.id, null)}
                                    disabled={!hasPermission(route.id, null, 'grant') || saving}
                                    className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                  >
                                    DENY
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Traducciones específicas */}
                            {translations.length === 0 ? (
                              <p className="text-sm text-gray-500 italic py-3">Sin traducciones configuradas</p>
                            ) : (
                              translations.map((translation) => (
                                <div key={translation.language_code} className="py-3 border-b border-gray-200 last:border-b-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl">
                                        {getLanguageFlag(translation.language_code)}
                                      </span>
                                      <div>
                                        <code className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                          {translation.translated_path}
                                        </code>
                                        <p className="text-xs text-gray-500 mt-1">{translation.translated_name}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => grantPermission(route.id, translation.language_code)}
                                        disabled={hasPermission(route.id, translation.language_code, 'grant') || saving}
                                        className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                      >
                                        {hasPermission(route.id, translation.language_code, 'grant') ? '✓ GRANTED' : 'GRANT'}
                                      </button>
                                      <button
                                        onClick={() => denyPermission(route.id, translation.language_code)}
                                        disabled={!hasPermission(route.id, translation.language_code, 'grant') || saving}
                                        className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                      >
                                        DENY
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  ℹ️ Permisos Granulares por Idioma (ROL)
                </h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li>• <strong>🌍 GLOBAL:</strong> Rol accede en TODOS los idiomas</li>
                  <li>• <strong>🇪🇸 Solo ES:</strong> Rol accede ÚNICAMENTE en español</li>
                  <li>• <strong>Herencia:</strong> Usuarios con este rol heredan estos permisos</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}