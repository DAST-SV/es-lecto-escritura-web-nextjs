// ============================================
// app/[locale]/admin/users/permissions/page.tsx
// SISTEMA DE PERMISOS DE USUARIO
// ============================================
// ✅ Buscar por EMAIL
// ✅ Ver permisos actuales (por rol)
// ✅ GRANT: Dar acceso extra
// ✅ DENY: Bloquear acceso
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
  Info,
  Users
} from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface UserInfo {
  id: string;
  email: string;
  roles: Array<{
    role_name: string;
    role_display_name: string;
  }>;
}

interface RouteInfo {
  id: string;
  pathname: string;
  displayName: string;
  translatedPath: string;
  // Permisos
  hasFromRole: boolean;      // Tiene acceso por su rol
  hasUserGrant: boolean;     // Tiene GRANT manual (acceso extra)
  hasUserDeny: boolean;      // Tiene DENY manual (bloqueado)
  permissionId?: string;     // ID del permiso manual
  // Estado final
  canAccess: boolean;        // ¿Puede acceder? (considerando todo)
}

export default function UserPermissionsPage() {
  const supabase = createClient();

  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [userRoutes, setUserRoutes] = useState<RouteInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  /**
   * 🔍 BUSCAR USUARIOS POR EMAIL
   */
  const handleSearchUsers = async () => {
    if (!searchEmail.trim()) {
      alert('Ingresa un email para buscar');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('search_users_by_email', {
          p_search_term: searchEmail
        });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        alert('No se encontraron usuarios con ese email');
        setSearchResults([]);
        return;
      }

      const users: UserInfo[] = data.map((u: any) => ({
        id: u.user_id,
        email: u.email,
        roles: Array.isArray(u.roles) ? u.roles : [],
      }));

      setSearchResults(users);
    } catch (err: any) {
      console.error('Error buscando usuarios:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 👤 SELECCIONAR USUARIO Y CARGAR SUS PERMISOS
   */
  const handleSelectUser = async (user: UserInfo) => {
    setSelectedUser(user);
    setLoadingRoutes(true);

    try {
      // 1. Cargar todas las rutas
      const { data: routes, error: routesError } = await supabase
        .schema('app')
        .from('routes')
        .select('id, pathname, display_name')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('menu_order');

      if (routesError) {
        throw new Error(routesError.message);
      }

      // 2. Cargar traducciones (español por defecto)
      const { data: translations } = await supabase
        .schema('app')
        .from('route_translations')
        .select('route_id, translated_path, translated_name')
        .eq('language_code', 'es')
        .eq('is_active', true);

      const translationsMap = new Map(
        (translations || []).map((t: any) => [t.route_id, t])
      );

      // 3. Obtener permisos POR ROL
      const roleNames = user.roles.map(r => r.role_name);
      const rolePermissions = new Set<string>();

      if (roleNames.length > 0) {
        const { data: rolePerms } = await supabase
          .schema('app')
          .from('route_permissions')
          .select('route_id')
          .in('role_name', roleNames);

        (rolePerms || []).forEach((p: any) => rolePermissions.add(p.route_id));
      }

      // 4. Obtener permisos MANUALES del usuario (grant/deny)
      const { data: userPerms, error: userPermsError } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (userPermsError) {
        throw new Error(userPermsError.message);
      }

      const userPermsMap = new Map(
        (userPerms || []).map((p: any) => [p.route_id, p])
      );

      // 5. CONSTRUIR LISTA FINAL
      const routesWithPermissions: RouteInfo[] = (routes || []).map((route: any) => {
        const translation = translationsMap.get(route.id);
        const userPerm = userPermsMap.get(route.id);

        const hasFromRole = rolePermissions.has(route.id);
        const hasUserGrant = userPerm?.permission_type === 'grant';
        const hasUserDeny = userPerm?.permission_type === 'deny';

        // LÓGICA DE ACCESO:
        // - Si tiene DENY → NO puede acceder (prioridad máxima)
        // - Si tiene GRANT → SÍ puede acceder (aunque el rol no lo tenga)
        // - Si tiene permiso por ROL → SÍ puede acceder
        // - Si NO tiene nada → NO puede acceder
        let canAccess = false;
        if (hasUserDeny) {
          canAccess = false;
        } else if (hasUserGrant || hasFromRole) {
          canAccess = true;
        }

        return {
          id: route.id,
          pathname: route.pathname,
          displayName: route.display_name,
          translatedPath: translation?.translated_path || route.pathname,
          hasFromRole,
          hasUserGrant,
          hasUserDeny,
          permissionId: userPerm?.id,
          canAccess,
        };
      });

      setUserRoutes(routesWithPermissions);
    } catch (err: any) {
      alert('Error cargando permisos: ' + err.message);
    } finally {
      setLoadingRoutes(false);
    }
  };

  /**
   * ✅ DAR ACCESO (GRANT)
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
          reason: 'Acceso otorgado desde panel de admin',
          granted_by: user?.id,
        });

      if (error) throw new Error(error.message);
      
      await handleSelectUser(selectedUser);
      alert('✅ Acceso otorgado correctamente');
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    }
  };

  /**
   * 🚫 BLOQUEAR ACCESO (DENY)
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
          reason: 'Acceso bloqueado desde panel de admin',
          granted_by: user?.id,
        });

      if (error) throw new Error(error.message);
      
      await handleSelectUser(selectedUser);
      alert('✅ Acceso bloqueado correctamente');
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    }
  };

  /**
   * 🗑️ REMOVER PERMISO MANUAL
   */
  const handleRemovePermission = async (permissionId: string) => {
    if (!selectedUser) return;

    if (!confirm('¿Remover este permiso manual?')) return;

    try {
      const { error } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw new Error(error.message);
      
      await handleSelectUser(selectedUser);
      alert('✅ Permiso removido correctamente');
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ========== HEADER ========== */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Permisos de Usuario
            </h1>
          </div>
          <p className="text-gray-600">
            Otorga o bloquea acceso a rutas específicas para usuarios individuales
          </p>
        </div>

        {/* ========== INFO BOX ========== */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">💡 Cómo funciona este sistema:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong>Permisos por ROL</strong>: El usuario tiene acceso según su rol (azul)</li>
              <li><strong>GRANT (verde)</strong>: Dar acceso EXTRA aunque su rol no lo tenga</li>
              <li><strong>DENY (rojo)</strong>: BLOQUEAR acceso aunque su rol lo tenga</li>
              <li><strong>Prioridad</strong>: DENY tiene prioridad sobre todo</li>
            </ul>
          </div>
        </div>

        {/* ========== BUSCADOR ========== */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="text-gray-400" size={20} />
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
              placeholder="Buscar usuario por email..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSearchUsers}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-2">
                {searchResults.length} usuario(s) encontrado(s):
              </p>
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors border-2 border-transparent hover:border-purple-200"
                >
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500 font-mono">{user.id}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Roles: {user.roles.map(r => r.role_display_name).join(', ') || 'Sin rol asignado'}
                      </p>
                    </div>
                  </div>
                  <Shield size={18} className="text-purple-600" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========== PANEL DE PERMISOS ========== */}
        {selectedUser && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users size={24} />
                  {selectedUser.email}
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  ID: {selectedUser.id}
                </p>
                <div className="flex gap-2 mt-2">
                  {selectedUser.roles.map((role, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {role.role_display_name}
                    </span>
                  ))}
                  {selectedUser.roles.length === 0 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      Sin rol asignado
                    </span>
                  )}
                </div>
              </div>
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
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      route.canAccess 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <code className="px-3 py-1 bg-white rounded text-sm font-mono text-gray-800 border">
                          {route.pathname}
                        </code>
                        {route.canAccess ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : (
                          <Lock className="text-gray-400" size={20} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 ml-1">
                        {route.displayName}
                      </p>

                      {/* Estados */}
                      <div className="flex gap-2 mt-2">
                        {route.hasFromRole && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            <Shield size={14} />
                            Acceso por ROL
                          </span>
                        )}
                        {route.hasUserGrant && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            <Unlock size={14} />
                            GRANT (acceso extra)
                          </span>
                        )}
                        {route.hasUserDeny && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            <Lock size={14} />
                            DENY (bloqueado)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      {route.hasUserGrant || route.hasUserDeny ? (
                        <button
                          onClick={() => handleRemovePermission(route.permissionId!)}
                          className="p-2 text-gray-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Remover permiso manual"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <>
                          {!route.hasFromRole && (
                            <button
                              onClick={() => handleGrantAccess(route.id)}
                              className="px-3 py-2 text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                              title="Dar acceso extra"
                            >
                              <Plus size={16} />
                              GRANT
                            </button>
                          )}
                          {route.hasFromRole && (
                            <button
                              onClick={() => handleDenyAccess(route.id)}
                              className="px-3 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                              title="Bloquear acceso"
                            >
                              <Lock size={16} />
                              DENY
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== ESTADO VACÍO ========== */}
        {!selectedUser && searchResults.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg mb-2">
              Busca un usuario por email para gestionar sus permisos
            </p>
            <p className="text-gray-500 text-sm">
              Puedes buscar tu propio email para ver tus permisos actuales
            </p>
          </div>
        )}
      </div>
    </div>
  );
}