// ============================================
// app/[locale]/admin/permissions/page.tsx
// GESTIÓN COMPLETA DE PERMISOS
// ============================================
// ✅ Buscar por email
// ✅ Ver: ID, foto, nombre, email, providers
// ✅ Permisos por ROL
// ✅ Permisos por RUTA
// ✅ Permisos por IDIOMA
// ✅ Permisos INDIVIDUALES (GRANT/DENY)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  Search,
  User,
  Shield,
  Globe,
  Map as MapIcon,
  Plus,
  X,
  Check,
  Lock,
  Unlock,
  Loader2,
  AlertCircle,
  Mail,
  Key,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// ============================================
// TIPOS
// ============================================

interface UserInfo {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  provider?: string;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
}

interface Route {
  id: string;
  pathname: string;
  display_name: string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface UserRole {
  role_id: string;
  role_name: string;
  role_display_name: string;
  is_active: boolean;
}

interface RoutePermission {
  route_id: string;
  pathname: string;
  display_name: string;
  has_from_role: boolean;
  has_grant: boolean;
  has_deny: boolean;
  permission_id?: string;
}

interface LanguageAccess {
  language_code: string;
  has_access: boolean;
  from_role: boolean;
}

// ============================================
// COMPONENTE
// ============================================

export default function PermissionsPage() {
  const supabase = createClient();

  const languages: Language[] = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  ];

  // Estados principales
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Datos del usuario seleccionado
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [routePermissions, setRoutePermissions] = useState<RoutePermission[]>([]);
  const [languageAccess, setLanguageAccess] = useState<LanguageAccess[]>([]);

  // Datos para selectores
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);

  // Tabs
  const [activeTab, setActiveTab] = useState<'roles' | 'routes' | 'languages'>('roles');

  /**
   * 📥 CARGAR ROLES Y RUTAS
   */
  useEffect(() => {
    loadRolesAndRoutes();
  }, []);

  const loadRolesAndRoutes = async () => {
    try {
      // Cargar roles
      const { data: rolesData } = await supabase
        .schema('app')
        .from('roles')
        .select('*')
        .eq('is_active', true)
        .order('hierarchy_level');

      setAllRoles(rolesData || []);

      // Cargar rutas
      const { data: routesData } = await supabase
        .schema('app')
        .from('routes')
        .select('id, pathname, display_name')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('pathname');

      setAllRoutes(routesData || []);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
    }
  };

  /**
   * 🔍 BUSCAR USUARIOS POR EMAIL
   */
  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast.error('Ingresa un email para buscar');
      return;
    }

    setLoading(true);
    try {
      // Buscar usando RPC
      const { data, error } = await supabase
        .rpc('search_users_by_email', { search_email: searchEmail });

      if (error) throw error;

      const users: UserInfo[] = (data || []).map((u: any) => ({
        id: u.user_id,
        email: u.email,
        full_name: u.full_name,
        avatar_url: u.avatar_url,
        provider: u.provider,
        created_at: u.created_at,
      }));

      if (users.length === 0) {
        toast.error('No se encontraron usuarios');
      }

      setSearchResults(users);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 👤 SELECCIONAR USUARIO
   */
  const handleSelectUser = async (user: UserInfo) => {
    setSelectedUser(user);
    await loadUserPermissions(user.id);
  };

  /**
   * 📥 CARGAR PERMISOS DEL USUARIO
   */
  const loadUserPermissions = async (userId: string) => {
    setLoading(true);
    try {
      // 1. ROLES del usuario
      const { data: rolesData } = await supabase
        .schema('app')
        .from('user_roles')
        .select(`
          role_id,
          is_active,
          roles (
            name,
            display_name
          )
        `)
        .eq('user_id', userId)
        .is('revoked_at', null);

      const roles = (rolesData || []).map((r: any) => ({
        role_id: r.role_id,
        role_name: r.roles.name,
        role_display_name: r.roles.display_name,
        is_active: r.is_active,
      }));
      setUserRoles(roles);

      // 2. PERMISOS DE RUTAS
      await loadRoutePermissions(userId, roles);

      // 3. ACCESO A IDIOMAS
      await loadLanguageAccess(userId, roles);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🗺️ CARGAR PERMISOS DE RUTAS
   */
  const loadRoutePermissions = async (userId: string, roles: UserRole[]) => {
    try {
      const roleNames = roles.filter(r => r.is_active).map(r => r.role_name);

      // Obtener permisos por rol
      const { data: rolePerms } = await supabase
        .schema('app')
        .from('route_permissions')
        .select('route_id')
        .in('role_name', roleNames);

      const rolePermissionIds = new Set((rolePerms || []).map((p: any) => p.route_id));

      // Obtener permisos individuales
      const { data: userPerms } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .select('*')
        .eq('user_id', userId);

      const userPermsMap = new Map();
      (userPerms || []).forEach((p: any) => {
        userPermsMap.set(p.route_id, p);
      });

      // Combinar con rutas
      const permissions: RoutePermission[] = allRoutes.map(route => {
        const userPerm = userPermsMap.get(route.id);
        const hasFromRole = rolePermissionIds.has(route.id);
        const hasGrant = userPerm?.permission_type === 'grant';
        const hasDeny = userPerm?.permission_type === 'deny';

        return {
          route_id: route.id,
          pathname: route.pathname,
          display_name: route.display_name,
          has_from_role: hasFromRole,
          has_grant: hasGrant,
          has_deny: hasDeny,
          permission_id: userPerm?.id,
        };
      });

      setRoutePermissions(permissions);
    } catch (err: any) {
      console.error('Error cargando permisos de rutas:', err);
    }
  };

  /**
   * 🌍 CARGAR ACCESO A IDIOMAS
   */
  const loadLanguageAccess = async (userId: string, roles: UserRole[]) => {
    try {
      const roleNames = roles.filter(r => r.is_active).map(r => r.role_name);

      // Obtener idiomas permitidos por rol
      const { data: roleLanguages } = await supabase
        .schema('app')
        .from('role_language_access')
        .select('language_code')
        .in('role_name', roleNames)
        .eq('is_active', true);

      const allowedLanguages = new Set((roleLanguages || []).map((l: any) => l.language_code));

      const access: LanguageAccess[] = languages.map(lang => ({
        language_code: lang.code,
        has_access: allowedLanguages.has(lang.code),
        from_role: allowedLanguages.has(lang.code),
      }));

      setLanguageAccess(access);
    } catch (err: any) {
      console.error('Error cargando acceso a idiomas:', err);
    }
  };

  /**
   * ➕ ASIGNAR ROL
   */
  const handleAssignRole = async (roleId: string) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .schema('app')
        .from('user_roles')
        .insert({
          user_id: selectedUser.id,
          role_id: roleId,
          is_active: true,
        });

      if (error) throw error;

      toast.success('✅ Rol asignado');
      loadUserPermissions(selectedUser.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * 🗑️ REMOVER ROL
   */
  const handleRemoveRole = async (roleId: string) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .schema('app')
        .from('user_roles')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', selectedUser.id)
        .eq('role_id', roleId);

      if (error) throw error;

      toast.success('✅ Rol removido');
      loadUserPermissions(selectedUser.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * ✅ DAR ACCESO A RUTA (GRANT)
   */
  const handleGrantRoute = async (routeId: string) => {
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
          reason: 'Acceso manual desde panel admin',
          granted_by: user?.id,
        });

      if (error) throw error;

      toast.success('✅ Acceso otorgado');
      loadUserPermissions(selectedUser.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * 🚫 BLOQUEAR RUTA (DENY)
   */
  const handleDenyRoute = async (routeId: string) => {
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
          reason: 'Acceso bloqueado desde panel admin',
          granted_by: user?.id,
        });

      if (error) throw error;

      toast.success('✅ Acceso bloqueado');
      loadUserPermissions(selectedUser.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * 🗑️ REMOVER PERMISO MANUAL
   */
  const handleRemovePermission = async (permissionId: string) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .schema('app')
        .from('user_route_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      toast.success('✅ Permiso removido');
      loadUserPermissions(selectedUser.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * 🎨 OBTENER FOTO DE PERFIL
   */
  const getUserAvatar = (user: UserInfo) => {
    const email = user.email || 'user';
    return (
      user.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=6366f1&color=fff`
    );
  };

  /**
   * 👤 OBTENER NOMBRE DE USUARIO
   */
  const getUserDisplayName = (user: UserInfo) => {
    return (
      user.full_name ||
      user.email?.split('@')[0] ||
      'Usuario'
    );
  };

  /**
   * 🔑 OBTENER PROVIDERS
   */
  const getUserProviders = (user: UserInfo) => {
    return user.provider || 'email';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Toaster position="top-right" />

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="text-purple-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Permisos
              </h1>
              <p className="text-gray-600">
                Busca usuarios y gestiona sus permisos de forma granular
              </p>
            </div>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">💡 Tipos de permisos:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li><strong>Roles</strong>: Asigna roles al usuario (admin, teacher, student, etc.)</li>
                <li><strong>Rutas</strong>: Controla acceso específico a rutas (GRANT/DENY)</li>
                <li><strong>Idiomas</strong>: Define qué idiomas puede usar (según su rol)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <Search className="text-gray-400" size={20} />
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar usuario por email..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* RESULTADOS */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                {searchResults.length} usuario(s) encontrado(s):
              </p>
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors border-2 border-transparent hover:border-purple-200"
                >
                  {/* FOTO */}
                  <img
                    src={getUserAvatar(user)}
                    alt={user.email || 'Usuario'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                  />

                  {/* INFO */}
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900 text-lg">
                      {getUserDisplayName(user)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Mail size={14} />
                      <span>{user.email || 'Sin email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Key size={12} />
                      <span className="font-mono">{user.id}</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      Provider: {getUserProviders(user)}
                    </p>
                  </div>

                  <Shield size={18} className="text-purple-600" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PANEL DE PERMISOS */}
        {selectedUser && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* USER HEADER */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <img
                  src={getUserAvatar(selectedUser)}
                  alt={selectedUser.email}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {getUserDisplayName(selectedUser)}
                  </h2>
                  <p className="opacity-90 mt-1">{selectedUser.email || 'Sin email'}</p>
                  <p className="text-sm opacity-75 font-mono mt-1">
                    ID: {selectedUser.id}
                  </p>
                  <p className="text-sm opacity-75 mt-1">
                    Provider: {getUserProviders(selectedUser)}
                  </p>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === 'roles'
                      ? 'border-purple-600 text-purple-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Shield size={18} />
                  Roles ({userRoles.filter(r => r.is_active).length})
                </button>
                <button
                  onClick={() => setActiveTab('routes')}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === 'routes'
                      ? 'border-purple-600 text-purple-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MapIcon size={18} />
                  Rutas
                </button>
                <button
                  onClick={() => setActiveTab('languages')}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === 'languages'
                      ? 'border-purple-600 text-purple-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Globe size={18} />
                  Idiomas
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 size={48} className="animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600">Cargando permisos...</p>
                </div>
              ) : (
                <>
                  {/* TAB: ROLES */}
                  {activeTab === 'roles' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Roles Asignados</h3>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignRole(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Asignar rol...</option>
                          {allRoles
                            .filter(r => !userRoles.some(ur => ur.role_id === r.id && ur.is_active))
                            .map(role => (
                              <option key={role.id} value={role.id}>
                                {role.display_name}
                              </option>
                            ))}
                        </select>
                      </div>

                      {userRoles.filter(r => r.is_active).length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                          No tiene roles asignados
                        </p>
                      ) : (
                        userRoles
                          .filter(r => r.is_active)
                          .map((role) => (
                            <div
                              key={role.role_id}
                              className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200"
                            >
                              <div className="flex items-center gap-3">
                                <Shield className="text-purple-600" size={20} />
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {role.role_display_name}
                                  </p>
                                  <p className="text-sm text-gray-600">{role.role_name}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveRole(role.role_id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ))
                      )}
                    </div>
                  )}

                  {/* TAB: RUTAS */}
                  {activeTab === 'routes' && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Permisos de Rutas
                      </h3>

                      {routePermissions.map((perm) => {
                        const canAccess = perm.has_deny ? false : (perm.has_grant || perm.has_from_role);

                        return (
                          <div
                            key={perm.route_id}
                            className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                              canAccess
                                ? 'bg-green-50 border-2 border-green-200'
                                : 'bg-gray-50 border-2 border-gray-200'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <code className="px-3 py-1 bg-white rounded text-sm font-mono text-gray-800 border">
                                  {perm.pathname}
                                </code>
                                {canAccess ? (
                                  <Check className="text-green-600" size={20} />
                                ) : (
                                  <Lock className="text-gray-400" size={20} />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {perm.display_name}
                              </p>

                              <div className="flex gap-2">
                                {perm.has_from_role && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                    Desde rol
                                  </span>
                                )}
                                {perm.has_grant && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    GRANT (acceso extra)
                                  </span>
                                )}
                                {perm.has_deny && (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                    DENY (bloqueado)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {perm.has_grant || perm.has_deny ? (
                                <button
                                  onClick={() => handleRemovePermission(perm.permission_id!)}
                                  className="p-2 text-gray-600 hover:bg-red-100 rounded-lg"
                                  title="Remover permiso manual"
                                >
                                  <X size={18} />
                                </button>
                              ) : (
                                <>
                                  {!perm.has_from_role && (
                                    <button
                                      onClick={() => handleGrantRoute(perm.route_id)}
                                      className="px-3 py-2 text-green-700 bg-green-100 hover:bg-green-200 rounded-lg text-sm font-medium flex items-center gap-1"
                                      title="Dar acceso"
                                    >
                                      <Unlock size={16} />
                                      GRANT
                                    </button>
                                  )}
                                  {perm.has_from_role && (
                                    <button
                                      onClick={() => handleDenyRoute(perm.route_id)}
                                      className="px-3 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium flex items-center gap-1"
                                      title="Bloquear"
                                    >
                                      <Lock size={16} />
                                      DENY
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB: IDIOMAS */}
                  {activeTab === 'languages' && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Acceso a Idiomas
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Los idiomas disponibles se definen por el rol del usuario
                      </p>

                      {languageAccess.map((lang) => {
                        const langInfo = languages.find(l => l.code === lang.language_code);

                        return (
                          <div
                            key={lang.language_code}
                            className={`flex items-center justify-between p-4 rounded-lg ${
                              lang.has_access
                                ? 'bg-green-50 border-2 border-green-200'
                                : 'bg-gray-50 border-2 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{langInfo?.flag}</span>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {langInfo?.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {lang.language_code.toUpperCase()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {lang.has_access ? (
                                <>
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    ✓ Acceso permitido
                                  </span>
                                  {lang.from_role && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                      Desde rol
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                  ✗ Sin acceso
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}