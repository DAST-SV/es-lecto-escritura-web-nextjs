// ============================================
// ARCHIVO: app/[locale]/admin/user-permissions/page.tsx
// ✅ CORREGIDO: Permisos SEPARADOS por idioma (igual que SQL)
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
  language_code: string | null; // ✅ null = TODOS los idiomas
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
  { code: null, name: 'Todos los idiomas', flag: '🌍' }, // ✅ null primero
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
  
  const [form, setForm] = useState({
    route_id: '',
    permission_type: 'grant' as 'grant' | 'deny',
    language_code: null as string | null, // ✅ Por defecto null (todos)
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

  const loadUserById = async (uid: string) => {
    setLoading(true);
    const supabase = createClient();
    
    const { data: u } = await supabase
      .schema('auth')
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (u) {
      setSelectedUser({
        user_id: u.id,
        email: u.email || '',
        full_name: u.raw_user_meta_data?.full_name || u.email?.split('@')[0] || 'Usuario',
        avatar_url: u.raw_user_meta_data?.avatar_url || null,
      });
      
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
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.rpc('search_users_by_email', {
      search_email: searchEmail,
    });

    if (data && data.length > 0) {
      await loadUserById(data[0].user_id);
    } else {
      alert('Usuario no encontrado');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;
    
    const supabase = createClient();
    
    // ✅ CORRECCIÓN: language_code puede ser null (todos) o específico
    const { error } = await supabase
      .schema('app')
      .from('user_route_permissions')
      .insert({
        user_id: selectedUser.user_id,
        route_id: form.route_id,
        permission_type: form.permission_type,
        language_code: form.language_code, // ✅ null o 'es'/'en'/'fr'/'it'
        reason: form.reason || null,
        is_active: true,
        expires_at: form.expires_at || null,
      });
    
    if (error) {
      console.error(error);
      alert('Error al crear permiso');
    } else {
      setShowForm(false);
      setForm({
        route_id: '',
        permission_type: 'grant',
        language_code: null, // ✅ Reset a null
        reason: '',
        expires_at: '',
      });
      await loadUserById(selectedUser.user_id);
    }
  };

  const deletePermission = async (id: string) => {
    if (!confirm('¿Eliminar permiso?')) return;
    
    const supabase = createClient();
    await supabase
      .schema('app')
      .from('user_route_permissions')
      .delete()
      .eq('id', id);
    
    if (selectedUser) {
      await loadUserById(selectedUser.user_id);
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
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Email del usuario..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="flex-1 px-4 py-2 border rounded-md"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                >
                  {loading ? 'Buscando...' : '🔍 Buscar'}
                </button>
              </div>
            </div>
          )}

          {selectedUser && (
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

                  {/* Ruta */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Ruta *</label>
                    <select
                      value={form.route_id}
                      onChange={(e) => setForm({ ...form, route_id: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Seleccionar ruta...</option>
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.icon} {r.pathname} - {r.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Idioma */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Idioma *</label>
                    <select
                      value={form.language_code === null ? 'null' : form.language_code}
                      onChange={(e) => setForm({ 
                        ...form, 
                        language_code: e.target.value === 'null' ? null : e.target.value 
                      })}
                      className="w-full p-2 border rounded"
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
                      🌍 = TODOS los idiomas | ES/EN/FR/IT = SOLO ese idioma
                    </p>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo *</label>
                    <select
                      value={form.permission_type}
                      onChange={(e) => setForm({ ...form, permission_type: e.target.value as 'grant' | 'deny' })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="grant">🟢 GRANT - Dar acceso</option>
                      <option value="deny">🔴 DENY - Bloquear</option>
                    </select>
                  </div>

                  {/* Razón */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Razón</label>
                    <input
                      type="text"
                      placeholder="¿Por qué?"
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  {/* Expiración */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiración (opcional)</label>
                    <input
                      type="date"
                      value={form.expires_at}
                      onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                      className="w-full p-2 border rounded"
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
                  <div className="p-8 text-center text-gray-500">Sin permisos</div>
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
                          </div>
                          <p className="text-xs text-gray-500">
                            {/* ✅ CORRECCIÓN: Mostrar correctamente null */}
                            {p.language_code === null 
                              ? '🌍 TODOS los idiomas' 
                              : `🌐 Solo ${p.language_code.toUpperCase()}`
                            }
                          </p>
                          {p.reason && (
                            <p className="text-sm text-gray-600 mt-1">📝 {p.reason}</p>
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