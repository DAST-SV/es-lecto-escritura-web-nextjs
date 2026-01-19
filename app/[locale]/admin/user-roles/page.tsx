// app/[locale]/admin/user-roles/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  hierarchy_level: number;
}

interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  is_active: boolean;
  created_at: string;
  revoked_at: string | null;
  notes: string | null;
  roles?: Role;
}

interface User {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

export default function UserRolesPage() {
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get('user_id');

  const [roles, setRoles] = useState<Role[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadRoles();
    if (userIdFromUrl) {
      loadUserById(userIdFromUrl);
    }
  }, [userIdFromUrl]);

  const loadRoles = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .schema('app')
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('hierarchy_level', { ascending: false });

    setRoles(data || []);
  };

  const loadUserById = async (userId: string) => {
    setLoading(true);
    const supabase = createClient();

    // Obtener info del usuario
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
      await loadUserRoles(userId);
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

    // Seleccionar el primer usuario
    setSelectedUser(data[0]);
    await loadUserRoles(data[0].user_id);
    setLoading(false);
  };

  const loadUserRoles = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .schema('app')
      .from('user_roles')
      .select(`
        *,
        roles:role_id (
          id,
          name,
          display_name,
          description,
          hierarchy_level
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    setUserRoles(data || []);
  };

  const hasRole = (roleId: string): boolean => {
    return userRoles.some(
      (ur) =>
        ur.role_id === roleId && ur.is_active && ur.revoked_at === null
    );
  };

  const assignRole = async (roleId: string) => {
    if (!selectedUser) return;

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase.schema('app').from('user_roles').insert([
      {
        user_id: selectedUser.user_id,
        role_id: roleId,
        is_active: true,
        notes: notes.trim() || null,
      },
    ]);

    if (error) {
      console.error('Error assigning role:', error);
      if (error.code === '23505') {
        // Duplicate key
        alert('Este usuario ya tiene este rol asignado');
      } else {
        alert('Error al asignar rol');
      }
    } else {
      alert('Rol asignado exitosamente');
      setNotes('');
      await loadUserRoles(selectedUser.user_id);
    }

    setSaving(false);
  };

  const revokeRole = async (userRoleId: string) => {
    if (!confirm('¿Estás seguro de revocar este rol?')) return;

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .schema('app')
      .from('user_roles')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', userRoleId);

    if (error) {
      console.error('Error revoking role:', error);
      alert('Error al revocar rol');
    } else {
      alert('Rol revocado exitosamente');
      if (selectedUser) {
        await loadUserRoles(selectedUser.user_id);
      }
    }

    setSaving(false);
  };

  const reactivateRole = async (userRoleId: string) => {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .schema('app')
      .from('user_roles')
      .update({
        is_active: true,
        revoked_at: null,
      })
      .eq('id', userRoleId);

    if (error) {
      console.error('Error reactivating role:', error);
      alert('Error al reactivar rol');
    } else {
      alert('Rol reactivado exitosamente');
      if (selectedUser) {
        await loadUserRoles(selectedUser.user_id);
      }
    }

    setSaving(false);
  };

  const activeRoles = userRoles.filter((ur) => ur.is_active && !ur.revoked_at);
  const inactiveRoles = userRoles.filter((ur) => !ur.is_active || ur.revoked_at);

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👥 Asignar Roles a Usuarios
            </h1>
            <p className="text-gray-600">
              Asignar roles a usuarios específicos (Script 05)
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
                      setUserRoles([]);
                      setSearchEmail('');
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
                    <code className="text-xs text-gray-500">
                      ID: {selectedUser.user_id}
                    </code>
                  </div>
                </div>
              </div>

              {/* Roles Activos */}
              <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                  <h2 className="text-lg font-semibold text-green-900">
                    ✅ Roles Activos ({activeRoles.length})
                  </h2>
                </div>
                {activeRoles.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Este usuario no tiene roles activos
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {activeRoles.map((userRole) => (
                      <div
                        key={userRole.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {userRole.roles?.display_name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {userRole.roles?.description}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <span>
                                Nivel: {userRole.roles?.hierarchy_level}
                              </span>
                              <span>
                                Asignado:{' '}
                                {new Date(userRole.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {userRole.notes && (
                              <p className="mt-2 text-sm text-gray-600 italic">
                                📝 {userRole.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => revokeRole(userRole.id)}
                            disabled={saving}
                            className="ml-4 text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                          >
                            🗑️ Revocar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Roles Revocados */}
              {inactiveRoles.length > 0 && (
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                    <h2 className="text-lg font-semibold text-red-900">
                      ❌ Roles Revocados ({inactiveRoles.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {inactiveRoles.map((userRole) => (
                      <div
                        key={userRole.id}
                        className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-700">
                              {userRole.roles?.display_name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Revocado:{' '}
                              {userRole.revoked_at
                                ? new Date(userRole.revoked_at).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                          <button
                            onClick={() => reactivateRole(userRole.id)}
                            disabled={saving}
                            className="ml-4 text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                          >
                            ♻️ Reactivar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Asignar Nuevo Rol */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-200">
                  <h2 className="text-lg font-semibold text-indigo-900">
                    ➕ Asignar Nuevo Rol
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Notas opcionales */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Razón de la asignación..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Lista de roles disponibles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roles.map((role) => {
                        const alreadyHas = hasRole(role.id);
                        return (
                          <button
                            key={role.id}
                            onClick={() => !alreadyHas && assignRole(role.id)}
                            disabled={saving || alreadyHas}
                            className={`
                              p-4 border-2 rounded-lg text-left transition-all
                              ${alreadyHas
                                ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                                : 'bg-white border-indigo-300 hover:border-indigo-500 hover:shadow-md'
                              }
                            `}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {role.display_name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {role.description}
                                </p>
                                <span className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                  Nivel: {role.hierarchy_level}
                                </span>
                              </div>
                              {alreadyHas && (
                                <span className="ml-2 text-green-600">✅</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Información */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              ℹ️ Cómo funciona
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>
                ✅ <strong>Buscar usuario:</strong> Escribe el email para encontrar
                al usuario
              </li>
              <li>
                ✅ <strong>Asignar rol:</strong> El usuario hereda TODOS los permisos
                de ese rol
              </li>
              <li>
                ✅ <strong>Múltiples roles:</strong> Un usuario puede tener varios
                roles activos simultáneamente
              </li>
              <li>
                ⚠️ <strong>Revocar vs Eliminar:</strong> Revocar mantiene el historial,
                útil para auditoría
              </li>
            </ul>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}