// ============================================
// app/[locale]/admin/users/permissions/page.tsx
// Panel de gestión de permisos de usuario
// ✅ Busca por USER ID (más simple y funcional)
// ============================================

'use client';

import { useState } from 'react';
import { 
  User, 
  Shield, 
  Plus, 
  Trash2, 
  Search, 
  Lock, 
  Unlock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface UserInfo {
  id: string;
  email?: string;
  roles: string[];
}

interface RouteInfo {
  id: string;
  pathname: string;
  displayName: string;
  hasFromRole: boolean;
  hasUserGrant: boolean;
  hasUserDeny: boolean;
  permissionId?: string;
}

export default function UserPermissionsPage() {
  const supabase = createClient();

  const [searchUserId, setSearchUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [userRoutes, setUserRoutes] = useState<RouteInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  /**
   * Buscar usuario por ID
   */
  const handleSearchUser = async () => {
    if (!searchUserId.trim()) {
      alert('Ingresa un User ID para buscar');
      return;
    }

    setLoading(true);
    try {
      // Buscar roles del usuario
      const { data: userRolesData, error: userRolesError } = await supabase
        .schema('app')
        .from('user_roles')
        .select(`
          user_id,
          roles!inner(name, display_name)
        `)
        .eq('user_id', searchUserId)
        .eq('is_active', true);

      if (userRolesError) {
        throw new Error(userRolesError.message);
      }

      if (!userRolesData || userRolesData.length === 0) {
        alert('Usuario no encontrado o sin roles asignados');
        setSelectedUser(null);
        return;
      }

      const userRoles = userRolesData.map((ur: any) => ur.roles.name);

      const userInfo: UserInfo = {
        id: searchUserId,
        roles: userRoles,
      };

      // Intentar obtener email (opcional)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id === searchUserId) {
          userInfo.email = user.email;
        }
      } catch (e) {
        // No hay problema si no podemos obtener el email
      }

      setSelectedUser(userInfo);
      await loadUserRoutes(userInfo);
    } catch (err: any) {
      console.error('Error buscando usuario:', err);
      alert('Error al buscar usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar rutas y permisos del usuario
   */
  const loadUserRoutes = async (user: UserInfo) => {
    setLoadingRoutes(true);

    try {
      // Cargar todas las rutas
      const { data: routes, error: routesError } = await supabase
        .schema('app')
        .from('routes')
        .select('id, pathname, display_name')
        .eq('is_active', true)
        .is('deleted_at', null);

      if (routesError) {
        throw new Error(routesError.message);
      }

      // Cargar permisos del rol
      const rolePermissions = new Set<string>();
      for (const roleName of user.roles) {
        const { data: rolePerms } = await supabase
          .schema('app')
          .from('route_permissions')
          .select('route_id')
          .eq('role_name', roleName);

        (rolePerms || []).forEach((p: any) => rolePermissions.add(p.route_id));
      }

      // Cargar permisos específicos del usuario
      const { data: userPerms, error: userPermsError } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (userPermsError) {
        throw new Error(userPermsError.message);
      }

      // Construir lista
      const routesWithPermissions: RouteInfo[] = (routes || []).map((route: any) => {
        const userPerm = (userPerms || []).find((p: any) => p.route_id === route.id);

        return {
          id: route.id,
          pathname: route.pathname,
          displayName: route.display_name,
          hasFromRole: rolePermissions.has(route.id),
          hasUserGrant: userPerm?.permission_type === 'grant',
          hasUserDeny: userPerm?.permission_type === 'deny',
          permissionId: userPerm?.id,
        };
      });

      setUserRoutes(routesWithPermissions);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingRoutes(false);
    }
  };

  /**
   * Otorgar acceso
   */
  const handleGrantAccess = async (routeId: string) => {
    if (!selectedUser) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .insert({
          user_id: selectedUser.id,
          route_id: routeId,
          permission_type: 'grant',
          reason: 'Acceso manual desde admin',
          granted_by: user?.id,
        });

      if (error) throw new Error(error.message);
      await loadUserRoutes(selectedUser);
      alert('✅ Acceso otorgado');
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    }
  };

  /**
   * Bloquear acceso
   */
  const handleDenyAccess = async (routeId: string) => {
    if (!selectedUser) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .insert({
          user_id: selectedUser.id,
          route_id: routeId,
          permission_type: 'deny',
          reason: 'Bloqueo manual desde admin',
          granted_by: user?.id,
        });

      if (error) throw new Error(error.message);
      await loadUserRoutes(selectedUser);
      alert('✅ Acceso bloqueado');
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    }
  };

  /**
   * Remover permiso
   */
  const handleRemovePermission = async (permissionId: string) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw new Error(error.message);
      await loadUserRoutes(selectedUser);
      alert('✅ Permiso removido');
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    }
  };

  /**
   * Copiar User ID actual
   */
  const copyCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigator.clipboard.writeText(user.id);
      setSearchUserId(user.id);
      alert('✅ Tu User ID copiado: ' + user.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Permisos de Usuario
            </h1>
          </div>
          <p className="text-gray-600">
            Otorga o bloquea acceso a rutas específicas por User ID
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">¿Cómo obtener el User ID?</p>
            <p>1. El usuario puede ver su ID en su perfil</p>
            <p>2. Puedes buscarlo en la tabla <code className="bg-blue-100 px-1 rounded">auth.users</code> en Supabase</p>
            <p>3. O haz clic en "Copiar mi ID" abajo</p>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
              placeholder="User ID (UUID)..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
            <button
              onClick={copyCurrentUserId}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Copiar mi ID
            </button>
            <button
              onClick={handleSearchUser}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Panel de permisos */}
        {selectedUser && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedUser.email || 'Usuario'}
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  ID: {selectedUser.id}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Roles: {selectedUser.roles.join(', ') || 'Sin rol'}
                </p>
              </div>
              <User size={32} className="text-purple-600" />
            </div>

            {loadingRoutes ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
                <p className="text-gray-600 mt-4">Cargando permisos...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <code className="px-3 py-1 bg-white rounded text-sm font-mono text-gray-800">
                        {route.pathname}
                      </code>
                      <p className="text-sm text-gray-600 mt-1">
                        {route.displayName}
                      </p>

                      <div className="flex gap-2 mt-2">
                        {route.hasFromRole && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            <CheckCircle size={14} />
                            Desde rol
                          </span>
                        )}
                        {route.hasUserGrant && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            <Unlock size={14} />
                            Acceso manual
                          </span>
                        )}
                        {route.hasUserDeny && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                            <Lock size={14} />
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {route.hasUserGrant || route.hasUserDeny ? (
                        <button
                          onClick={() => handleRemovePermission(route.permissionId!)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                          title="Remover permiso"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleGrantAccess(route.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Dar acceso"
                          >
                            <Plus size={18} />
                          </button>
                          <button
                            onClick={() => handleDenyAccess(route.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Bloquear acceso"
                          >
                            <Lock size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Estado vacío */}
        {!selectedUser && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">
              Ingresa un User ID para gestionar permisos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}