// ============================================
// ARCHIVO: app/[locale]/admin/user-permissions/page.tsx
// ✅ PERMISOS GRANULARES POR RUTA TRADUCIDA (IDIOMA)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { createClient } from '@/src/infrastructure/config/supabase.config';

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

interface UserPermission {
  id: string;
  user_id: string;
  route_id: string;
  permission_type: 'grant' | 'deny';
  language_code: string | null;
  reason: string | null;
  is_active: boolean;
  expires_at: string | null;
  routes?: Route;
}

interface User {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

const LANGUAGES = [
  { code: null, name: 'Todos los idiomas', flag: '🌍' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
] as const;

export default function UserPermissionsPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadRoutes();
    const uid = searchParams.get('user_id');
    if (uid) loadUserById(uid);
  }, [searchParams]);

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
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('pathname');
    
    setRoutes((data || []) as Route[]);
  };

  const loadUserById = async (uid: string) => {
    setLoading(true);
    const supabase = createClient();
    
    try {
      if (!uid.includes('@') && uid.length === 36) {
        // Es UUID
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser && currentUser.id === uid) {
          setSelectedUser({
            user_id: uid,
            email: currentUser.email || 'Usuario',
            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Usuario',
            avatar_url: currentUser.user_metadata?.avatar_url || null,
          });
        } else {
          setSelectedUser({
            user_id: uid,
            email: 'Usuario (ID: ' + uid.slice(0, 8) + '...)',
            full_name: 'Usuario',
            avatar_url: null,
          });
        }
        
        const { data: p } = await supabase
          .schema('app')
          .from('user_route_permissions')
          .select(`
            *,
            routes:route_id(
              id,
              pathname,
              display_name,
              icon,
              route_translations!left(
                language_code,
                translated_path,
                translated_name
              )
            )
          `)
          .eq('user_id', uid);
        
        setPermissions((p || []) as UserPermission[]);
      }
    } catch (error: any) {
      console.error('❌ Error cargando usuario:', error);
      alert(`Error: ${error.message}`);
      setSelectedUser(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) {
      alert('Ingresa un email para buscar');
      return;
    }

    setSearching(true);
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase.rpc('search_users_by_email', {
        search_email: searchEmail,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        alert('No se encontró ningún usuario con ese email');
        return;
      }

      await loadUserById(data[0].user_id);
    } catch (error: any) {
      console.error('❌ Error buscando usuario:', error);
      alert(`Error al buscar: ${error.message}`);
    } finally {
      setSearching(false);
    }
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
    return permissions.some(p => 
      p.route_id === routeId && 
      p.language_code === languageCode &&
      p.permission_type === permissionType &&
      p.is_active &&
      (!p.expires_at || new Date(p.expires_at) > new Date())
    );
  };

  const grantPermission = async (routeId: string, languageCode: string | null, reason?: string) => {
    if (!selectedUser) return;
    
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .insert({
          user_id: selectedUser.user_id,
          route_id: routeId,
          permission_type: 'grant',
          language_code: languageCode,
          reason: reason || `Acceso ${languageCode ? languageCode.toUpperCase() : 'global'} otorgado`,
          is_active: true,
        });
      
      if (error) {
        if (error.code === '23505') {
          alert('Ya existe un permiso para esta ruta e idioma');
        } else {
          throw error;
        }
      } else {
        alert(`✅ Acceso ${languageCode ? languageCode.toUpperCase() : 'GLOBAL'} otorgado`);
        await loadUserById(selectedUser.user_id);
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Error al otorgar acceso: ${error.message}`);
    }
  };

  const denyPermission = async (routeId: string, languageCode: string | null, reason?: string) => {
    if (!selectedUser) return;
    
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .insert({
          user_id: selectedUser.user_id,
          route_id: routeId,
          permission_type: 'deny',
          language_code: languageCode,
          reason: reason || `Acceso ${languageCode ? languageCode.toUpperCase() : 'global'} bloqueado`,
          is_active: true,
        });
      
      if (error) {
        if (error.code === '23505') {
          alert('Ya existe un bloqueo para esta ruta e idioma');
        } else {
          throw error;
        }
      } else {
        alert(`🔴 Acceso ${languageCode ? languageCode.toUpperCase() : 'GLOBAL'} bloqueado`);
        await loadUserById(selectedUser.user_id);
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Error al bloquear acceso: ${error.message}`);
    }
  };

  const deletePermission = async (permissionId: string) => {
    if (!confirm('¿Eliminar este permiso?')) return;
    
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .delete()
        .eq('id', permissionId);
      
      if (error) throw error;

      alert('✅ Permiso eliminado');
      if (selectedUser) {
        await loadUserById(selectedUser.user_id);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
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
          <h1 className="text-3xl font-bold mb-2">⚡ Permisos Individuales Granulares</h1>
          <p className="text-gray-600 mb-8">Control de acceso POR RUTA TRADUCIDA (idioma específico)</p>

          {/* Buscar usuario */}
          {!selectedUser && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Buscar Usuario</h2>
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Email del usuario..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={searching || loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {searching ? 'Buscando...' : '🔍 Buscar'}
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Escribe parte del email (ej: "juan" para juan@example.com)
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          )}

          {selectedUser && !loading && (
            <div className="space-y-6">
              {/* Info usuario */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Usuario Seleccionado</h2>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setPermissions([]);
                      setSearchEmail('');
                      setExpandedRoutes(new Set());
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ❌ Cambiar
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-16 h-16 rounded-full" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.full_name}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                      ID: {selectedUser.user_id}
                    </code>
                  </div>
                </div>
              </div>

              {/* Permisos activos */}
              {permissions.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <h2 className="text-lg font-semibold">Permisos Activos ({permissions.length})</h2>
                  </div>
                  <div className="divide-y">
                    {permissions.map((p) => (
                      <div key={p.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                              {p.permission_type === 'grant' ? '🟢' : '🔴'}
                            </span>
                            <code className="text-sm bg-blue-50 px-2 py-1 rounded">
                              {p.routes?.pathname}
                            </code>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded font-semibold">
                              {p.permission_type.toUpperCase()}
                            </span>
                            <span className="text-lg">
                              {getLanguageFlag(p.language_code)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {getLanguageName(p.language_code)}
                            </span>
                          </div>
                          {p.reason && (
                            <p className="text-sm text-gray-600 ml-8">📝 {p.reason}</p>
                          )}
                          {p.expires_at && (
                            <p className="text-xs text-orange-600 ml-8">
                              ⏰ Expira: {new Date(p.expires_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deletePermission(p.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de rutas agrupadas */}
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
                        {/* Cabecera de ruta (agrupadora) */}
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
                                    disabled={hasPermission(route.id, null, 'grant')}
                                    className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                  >
                                    {hasPermission(route.id, null, 'grant') ? '✓ GRANTED' : 'GRANT'}
                                  </button>
                                  <button
                                    onClick={() => denyPermission(route.id, null)}
                                    disabled={hasPermission(route.id, null, 'deny')}
                                    className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                  >
                                    {hasPermission(route.id, null, 'deny') ? '✓ DENIED' : 'DENY'}
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
                                        disabled={hasPermission(route.id, translation.language_code, 'grant')}
                                        className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                      >
                                        {hasPermission(route.id, translation.language_code, 'grant') ? '✓ GRANTED' : 'GRANT'}
                                      </button>
                                      <button
                                        onClick={() => denyPermission(route.id, translation.language_code)}
                                        disabled={hasPermission(route.id, translation.language_code, 'deny')}
                                        className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                      >
                                        {hasPermission(route.id, translation.language_code, 'deny') ? '✓ DENIED' : 'DENY'}
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
                  ℹ️ Permisos Granulares por Idioma
                </h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li>• <strong>🌍 GLOBAL:</strong> Acceso a la ruta en TODOS los idiomas (ES, EN, FR, IT)</li>
                  <li>• <strong>🇪🇸 Solo ES:</strong> Acceso ÚNICAMENTE en español, sin acceso en otros idiomas</li>
                  <li>• <strong>🇺🇸 Solo EN:</strong> Acceso ÚNICAMENTE en inglés, sin acceso en otros idiomas</li>
                  <li>• <strong>Multiple idiomas:</strong> Puedes dar GRANT a ES y EN, pero DENY a FR e IT</li>
                  <li>• <strong>Prioridad DENY:</strong> Si hay un DENY (global o específico), bloquea el acceso</li>
                  <li>• <strong>Granularidad total:</strong> Control independiente por cada ruta traducida</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}