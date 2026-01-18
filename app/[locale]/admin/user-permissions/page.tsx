// ============================================
// ARCHIVO: app/[locale]/admin/user-permissions/page.tsx
// ✅ CORREGIDO: Usar RPC en lugar de schema('auth')
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { RouteGuard } from '@/src/presentation/components/RouteGuard';
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
  const [showForm, setShowForm] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const [form, setForm] = useState({
    route_id: '',
    permission_type: 'grant' as 'grant' | 'deny',
    language_code: null as string | null,
    reason: '',
    expires_at: '',
  });

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
      .eq('is_active', true);
    
    setRoutes((data || []) as Route[]);
  };

  // ✅ CORREGIDO: Usar SOLO el RPC search_users_by_email
  const loadUserById = async (uid: string) => {
    setLoading(true);
    const supabase = createClient();
    
    try {
      // Intentar buscar por ID completo primero
      const { data: usersByEmail, error: searchError } = await supabase
        .rpc('search_users_by_email', {
          search_email: uid.includes('@') ? uid : ''
        });

      if (searchError) {
        console.error('Error en RPC:', searchError);
      }

      // Si viene de URL (UUID), obtener usuario actual y verificar permisos
      if (!uid.includes('@') && uid.length === 36) {
        // Es un UUID, cargar permisos directamente
        const { data: p, error: permError } = await supabase
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
        
        if (permError) throw permError;

        // Obtener info del usuario de otra forma
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser && currentUser.id === uid) {
          setSelectedUser({
            user_id: uid,
            email: currentUser.email || 'Usuario',
            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Usuario',
            avatar_url: currentUser.user_metadata?.avatar_url || null,
          });
        } else {
          // No podemos obtener info de otro usuario sin service role
          setSelectedUser({
            user_id: uid,
            email: 'Usuario (ID: ' + uid.slice(0, 8) + '...)',
            full_name: 'Usuario',
            avatar_url: null,
          });
        }
        
        setPermissions((p || []) as UserPermission[]);
      } else if (usersByEmail && usersByEmail.length > 0) {
        // Encontrado por email
        const user = usersByEmail[0];
        setSelectedUser(user);
        
        // Cargar permisos
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
          .eq('user_id', user.user_id);
        
        setPermissions((p || []) as UserPermission[]);
      } else {
        throw new Error('Usuario no encontrado. Busca por email.');
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

  // ✅ CORREGIDO: Usar RPC para búsqueda
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

      // Tomar el primer resultado
      await loadUserById(data[0].user_id);
    } catch (error: any) {
      console.error('❌ Error buscando usuario:', error);
      alert(`Error al buscar: ${error.message}`);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;
    
    if (!form.route_id) {
      alert('Selecciona una ruta');
      return;
    }
    
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .insert({
          user_id: selectedUser.user_id,
          route_id: form.route_id,
          permission_type: form.permission_type,
          language_code: form.language_code,
          reason: form.reason || null,
          is_active: true,
          expires_at: form.expires_at || null,
        });
      
      if (error) throw error;

      alert('✅ Permiso creado exitosamente');
      setShowForm(false);
      setForm({
        route_id: '',
        permission_type: 'grant',
        language_code: null,
        reason: '',
        expires_at: '',
      });
      await loadUserById(selectedUser.user_id);
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Error al crear permiso: ${error.message}`);
    }
  };

  const deletePermission = async (id: string) => {
    if (!confirm('¿Eliminar este permiso?')) return;
    
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      alert('✅ Permiso eliminado');
      if (selectedUser) {
        await loadUserById(selectedUser.user_id);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">⚡ Permisos Individuales</h1>
          <p className="text-gray-600 mb-8">GRANT/DENY por ruta e idioma SEPARADO</p>

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

              {/* Botón nuevo permiso */}
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                {showForm ? '❌ Cancelar' : '➕ Nuevo Permiso'}
              </button>

              {/* Formulario */}
              {showForm && (
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                  <h2 className="text-xl font-semibold">Nuevo Permiso</h2>

                  <div>
                    <label className="block text-sm font-medium mb-1">Ruta *</label>
                    <select
                      value={form.route_id}
                      onChange={(e) => setForm({ ...form, route_id: e.target.value })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar ruta...</option>
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.icon} {r.pathname} - {r.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Idioma *</label>
                    <select
                      value={form.language_code === null ? 'null' : form.language_code}
                      onChange={(e) => setForm({ 
                        ...form, 
                        language_code: e.target.value === 'null' ? null : e.target.value 
                      })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {LANGUAGES.map((l) => (
                        <option 
                          key={l.code === null ? 'null' : l.code} 
                          value={l.code === null ? 'null' : l.code}
                        >
                          {l.flag} {l.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      🌍 Todos = acceso global | ES/EN/FR/IT = solo ese idioma
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo *</label>
                    <select
                      value={form.permission_type}
                      onChange={(e) => setForm({ ...form, permission_type: e.target.value as 'grant' | 'deny' })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="grant">🟢 GRANT - Dar acceso</option>
                      <option value="deny">🔴 DENY - Bloquear</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Razón</label>
                    <input
                      type="text"
                      placeholder="¿Por qué?"
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Expiración (opcional)</label>
                    <input
                      type="date"
                      value={form.expires_at}
                      onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  >
                    💾 Crear Permiso
                  </button>
                </div>
              )}

              {/* Lista de permisos */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold">Permisos Activos ({permissions.length})</h2>
                </div>
                {permissions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Sin permisos individuales</div>
                ) : (
                  <div className="divide-y">
                    {permissions.map((p) => (
                      <div key={p.id} className="p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                              {p.permission_type === 'grant' ? '🟢' : '🔴'}
                            </span>
                            <code className="text-sm bg-blue-50 px-2 py-1 rounded">
                              {p.routes?.pathname}
                            </code>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {p.permission_type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {p.language_code === null 
                              ? '🌍 TODOS los idiomas' 
                              : `🌐 Solo ${p.language_code.toUpperCase()}`
                            }
                          </p>
                          {p.reason && (
                            <p className="text-sm text-gray-600 mt-1">📝 {p.reason}</p>
                          )}
                          {p.expires_at && (
                            <p className="text-xs text-orange-600 mt-1">
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
                )}
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  ℹ️ Permisos por Idioma SEPARADO
                </h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li>• <strong>🌍 TODOS</strong> = Acceso en ES, EN, FR, IT (global)</li>
                  <li>• <strong>🇪🇸 Solo ES</strong> = Acceso SOLO en español</li>
                  <li>• <strong>🇺🇸 Solo EN</strong> = Acceso SOLO en inglés</li>
                  <li>• <strong>🇫🇷 Solo FR</strong> = Acceso SOLO en francés</li>
                  <li>• <strong>🇮🇹 Solo IT</strong> = Acceso SOLO en italiano</li>
                  <li>• Si asignas GRANT ES, NO tiene acceso en EN/FR/IT</li>
                  <li>• DENY tiene prioridad sobre GRANT (bloquea siempre)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}