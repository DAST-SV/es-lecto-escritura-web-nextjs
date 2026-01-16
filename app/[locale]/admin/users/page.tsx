// app/[locale]/admin/users/page.tsx

'use client';

import { useState } from 'react';
import { RouteGuard } from '@/src/presentation/components/RouteGuard';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface User {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  provider: string;
  created_at: string;
}

export default function UsersSearchPage() {
  const [searchEmail, setSearchEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setLoading(true);
    setSearched(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.rpc('search_users_by_email', {
        search_email: searchEmail,
      });

      if (error) {
        console.error('Error searching users:', error);
        alert('Error al buscar usuarios');
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al buscar usuarios');
      setUsers([]);
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👤 Buscar Usuarios
            </h1>
            <p className="text-gray-600">
              Buscar usuarios por email y ver su información (Script 10)
            </p>
          </div>

          {/* Formulario de Búsqueda */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por Email
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Escribe el email o parte del email..."
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
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Puedes buscar por parte del email (ejemplo: "juan" buscará
                  todos los emails que contengan "juan")
                </p>
              </div>
            </form>
          </div>

          {/* Resultados */}
          {searched && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Resultados ({users.length})
                </h2>
              </div>

              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  Buscando usuarios...
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No se encontraron usuarios con ese email
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <div
                      key={user.user_id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                              👤
                            </div>
                          )}
                        </div>

                        {/* Información */}
                        <div className="flex-1 min-w-0">
                          {/* Nombre */}
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {user.full_name}
                          </h3>

                          {/* Email */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600">📧</span>
                            <span className="text-sm text-gray-700">{user.email}</span>
                            <button
                              onClick={() => copyToClipboard(user.email)}
                              className="text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              📋 Copiar
                            </button>
                          </div>

                          {/* User ID */}
                          <div className="bg-gray-50 rounded-md p-3 mb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs text-gray-500 block mb-1">
                                  User ID (Supabase):
                                </span>
                                <code className="text-xs text-gray-800 font-mono">
                                  {user.user_id}
                                </code>
                              </div>
                              <button
                                onClick={() => copyToClipboard(user.user_id)}
                                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                              >
                                📋 Copiar ID
                              </button>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-3 text-sm">
                            {/* Proveedor */}
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">Ingreso:</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {user.provider === 'email'
                                  ? '📧 Email'
                                  : user.provider === 'google'
                                  ? '🔗 Google'
                                  : user.provider === 'github'
                                  ? '🔗 GitHub'
                                  : user.provider}
                              </span>
                            </div>

                            {/* Fecha de creación */}
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">Registrado:</span>
                              <span className="text-gray-700">
                                {new Date(user.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones Rápidas */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                        <button
                          onClick={() => {
                            // Navegar a asignar roles
                            window.location.href = `/admin/user-roles?user_id=${user.user_id}`;
                          }}
                          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                          👥 Asignar Roles
                        </button>
                        <button
                          onClick={() => {
                            // Navegar a permisos individuales
                            window.location.href = `/admin/user-permissions?user_id=${user.user_id}`;
                          }}
                          className="text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          ⚡ Permisos Individuales
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ayuda */}
          {!searched && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                ℹ️ Cómo usar esta herramienta
              </h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>
                  ✅ <strong>Buscar usuarios:</strong> Escribe el email o parte del
                  email del usuario
                </li>
                <li>
                  ✅ <strong>Ver información:</strong> Email, ID de Supabase, foto de
                  perfil, forma de inicio de sesión
                </li>
                <li>
                  ✅ <strong>Copiar ID:</strong> Usa el botón "Copiar ID" para usar
                  ese ID en otras acciones
                </li>
                <li>
                  ✅ <strong>Acciones rápidas:</strong> Desde aquí puedes ir
                  directamente a asignar roles o permisos
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}