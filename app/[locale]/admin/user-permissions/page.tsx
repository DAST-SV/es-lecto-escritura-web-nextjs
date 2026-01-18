// app/[locale]/admin/user-permissions/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RouteGuard } from '@/src/presentation/components/RouteGuard';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface Route {
  id: string;
  pathname: string;
  display_name: string;
  icon: string | null;
}

interface UserPermission {
  id: string;
  user_id: string;
  route_id: string;
  permission_type: 'grant' | 'deny';
  reason: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  routes?: Route;
}

interface User {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

export default function UserPermissionsPage() {
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get('user_id');

  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    route_id: '',
    permission_type: 'grant' as 'grant' | 'deny',
    reason: '',
    expires_at: '',
  });

  useEffect(() => {
    loadRoutes();
    if (userIdFromUrl) {
      loadUserById(userIdFromUrl);
    }
  }, [userIdFromUrl]);

  const loadRoutes = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .schema('app')
      .from('routes')
      .select('id, pathname, display_name, icon')
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('menu_order');

    setRoutes(data || []);
  };

  const loadUserById = async (userId: string) => {
    setLoading(true);
    const supabase = createClient();

    const { data: userData, error: userError } = await supabase
      .schema('auth')
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!userError && userData) {
      const user: User = {
        user_id: userData.id,
        email: userData.email || '',
        full_name:
          userData.raw_user_meta_data?.full_name ||
          userData.raw_user_meta_data?.name ||
          userData.email?.split('@')[0] ||
          'Usuario',
        avatar_url:
          userData.raw_user_meta_data?.avatar_url ||
          userData.raw_user_meta_data?.picture ||
          null,
      };
      setSelectedUser(user);
      await loadUserPermissions(userId);
    }

    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.rpc('search_users_by_email', {
      search_email: searchEmail,
    });

    if (error || !data || data.length === 0) {
      alert('No se encontró ningún usuario con ese email');
      setLoading(false);
      return;
    }

    setSelectedUser(data[0]);
    await loadUserPermissions(data[0].user_id);
    setLoading(false);
  };

  const loadUserPermissions = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .schema('app')
      .from('user_route_permissions')
      .select(`
        *,
        routes:route_id (
          id,
          pathname,
          display_name,
          icon
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    setUserPermissions(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSaving(true);
    const supabase = createClient();

    const permissionData: any = {
      user_id: selectedUser.user_id,
      route_id: formData.route_id,
      permission_type: formData.permission_type,
      reason: formData.reason.trim() || null,
      is_active: true,
    };

    if (formData.expires_at) {
      permissionData.expires_at = new Date(formData.expires_at).toISOString();
    }

    const { error } = await supabase
      .schema('app')
      .from('user_route_permissions')
      .insert([permissionData]);

    if (error) {
      console.error('Error creating permission:', error);
      if (error.code === '23505') {
        alert('Ya existe un permiso para esta ruta. Elimínalo primero.');
      } else {
        alert('Error al crear permiso');
      }
    } else {
      alert('Permiso creado exitosamente');
      resetForm();
      await loadUserPermissions(selectedUser.user_id);
    }

    setSaving(false);
  };

  const deletePermission = async (permissionId: string) => {
    if (!confirm('¿Estás seguro de eliminar este permiso?')) return;

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .schema('app')
      .from('user_route_permissions')
      .delete()
      .eq('id', permissionId);

    if (error) {
      console.error('Error deleting permission:', error);
      alert('Error al eliminar permiso');
    } else {
      alert('Permiso eliminado exitosamente');
      if (selectedUser) {
        await loadUserPermissions(selectedUser.user_id);
      }
    }

    setSaving(false);
  };

  const resetForm = () => {
    setFormData({
      route_id: '',
      permission_type: 'grant',
      reason: '',
      expires_at: '',
    });
    setShowForm(false);
  };

  const activePermissions = userPermissions.filter(
    (p) =>
      p.is_active && (!p.expires_at || new Date(p.expires_at) > new Date())
  );
  const expiredPermissions = userPermissions.filter(
    (p) => p.expires_at && new Date(p.expires_at) <= new Date()
  );

  const grantPermissions = activePermissions.filter(
    (p) => p.permission_type === 'grant'
  );
  const denyPermissions = activePermissions.filter(
    (p) => p.permission_type === 'deny'
  );

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ⚡ Permisos Individuales
            </h1>
            <p className="text-gray-600">
              Dar o bloquear acceso específico (GRANT/DENY) - Script 07
            </p>
          </div>

          {/* Buscar Usuario */}
          {!selectedUser && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Buscar Usuario</h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Escribe el email del usuario..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? '🔍 Buscando...' : '🔍 Buscar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Usuario Seleccionado */}
          {selectedUser && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Usuario Seleccionado</h2>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUserPermissions([]);
                      setSearchEmail('');
                      resetForm();
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ❌ Cambiar usuario
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedUser.full_name}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Botón Nuevo Permiso */}
              <div className="mb-6">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {showForm ? '❌ Cancelar' : '➕ Nuevo Permiso'}
                </button>
              </div>

              {/* Formulario */}
              {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Nuevo Permiso</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ruta */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ruta *
                        </label>
                        <select
                          required
                          value={formData.route_id}
                          onChange={(e) =>
                            setFormData({ ...formData, route_id: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Seleccionar ruta...</option>
                          {routes.map((route) => (
                            <option key={route.id} value={route.id}>
                              {route.icon} {route.pathname} - {route.display_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tipo de Permiso */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Permiso *
                        </label>
                        <select
                          required
                          value={formData.permission_type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permission_type: e.target.value as 'grant' | 'deny',
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="grant">🟢 GRANT - Dar acceso</option>
                          <option value="deny">🔴 DENY - Bloquear acceso</option>
                        </select>
                      </div>

                      {/* Razón */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Razón
                        </label>
                        <input
                          type="text"
                          placeholder="¿Por qué este permiso?"
                          value={formData.reason}
                          onChange={(e) =>
                            setFormData({ ...formData, reason: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Fecha de Expiración */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Expiración (opcional)
                        </label>
                        <input
                          type="date"
                          value={formData.expires_at}
                          onChange={(e) =>
                            setFormData({ ...formData, expires_at: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <p className="text-sm text-blue-800">
                        {formData.permission_type === 'grant' ? (
                          <>
                            🟢 <strong>GRANT:</strong> Dará acceso a esta ruta aunque el
                            rol del usuario no lo permita.
                          </>
                        ) : (
                          <>
                            🔴 <strong>DENY:</strong> Bloqueará el acceso a esta ruta
                            aunque el rol del usuario sí lo permita.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                      >
                        {saving ? '⏳ Guardando...' : '💾 Crear Permiso'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Permisos GRANT */}
              {grantPermissions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                    <h2 className="text-lg font-semibold text-green-900">
                      🟢 Permisos GRANT - Acceso Extra ({grantPermissions.length})
                    </h2>
                    <p className="text-sm text-green-700 mt-1">
                      Rutas a las que tiene acceso aunque su rol no lo permita
                    </p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {grantPermissions.map((permission) => (
                      <PermissionCard
                        key={permission.id}
                        permission={permission}
                        onDelete={deletePermission}
                        saving={saving}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Permisos DENY */}
              {denyPermissions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                    <h2 className="text-lg font-semibold text-red-900">
                      🔴 Permisos DENY - Acceso Bloqueado ({denyPermissions.length})
                    </h2>
                    <p className="text-sm text-red-700 mt-1">
                      Rutas bloqueadas aunque su rol sí lo permita
                    </p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {denyPermissions.map((permission) => (
                      <PermissionCard
                        key={permission.id}
                        permission={permission}
                        onDelete={deletePermission}
                        saving={saving}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Permisos Expirados */}
              {expiredPermissions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      ⏰ Permisos Expirados ({expiredPermissions.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {expiredPermissions.map((permission) => (
                      <PermissionCard
                        key={permission.id}
                        permission={permission}
                        onDelete={deletePermission}
                        saving={saving}
                        expired
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sin permisos */}
              {activePermissions.length === 0 && expiredPermissions.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                  Este usuario no tiene permisos individuales
                </div>
              )}
            </>
          )}

          {/* Información */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              ℹ️ Orden de Prioridad de Permisos
            </h3>
            <div className="space-y-2 text-blue-800 text-sm">
              <p className="font-semibold">1️⃣ DENY individual (Mayor prioridad)</p>
              <p className="font-semibold">2️⃣ GRANT individual</p>
              <p className="font-semibold">3️⃣ Permisos por ROL</p>
              <p className="font-semibold">4️⃣ Sin acceso (Menor prioridad)</p>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="font-medium">Ejemplos:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>
                    Si un estudiante tiene GRANT a /admin, podrá acceder aunque su rol
                    no lo permita
                  </li>
                  <li>
                    Si un profesor tiene DENY a /library, NO podrá acceder aunque su
                    rol sí lo permita
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}

// Componente para mostrar un permiso
interface PermissionCardProps {
  permission: UserPermission;
  onDelete: (id: string) => void;
  saving: boolean;
  expired?: boolean;
}

function PermissionCard({
  permission,
  onDelete,
  saving,
  expired = false,
}: PermissionCardProps) {
  const isGrant = permission.permission_type === 'grant';

  return (
    <div
      className={`p-6 hover:bg-gray-50 transition-colors ${expired ? 'opacity-60' : ''
        }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{permission.routes?.icon || '📄'}</span>
            <div>
              <code className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                {permission.routes?.pathname}
              </code>
              <p className="text-sm text-gray-700 mt-1">
                {permission.routes?.display_name}
              </p>
            </div>
          </div>

          {permission.reason && (
            <p className="text-sm text-gray-600 mb-2">📝 {permission.reason}</p>
          )}

          <div className="flex gap-4 text-xs text-gray-500">
            <span>
              Creado: {new Date(permission.created_at).toLocaleDateString()}
            </span>
            {permission.expires_at && (
              <span
                className={expired ? 'text-red-600 font-semibold' : 'text-orange-600'}
              >
                {expired ? '⏰ Expirado' : '⏰ Expira'}:{' '}
                {new Date(permission.expires_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(permission.id)}
          disabled={saving}
          className="ml-4 text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}