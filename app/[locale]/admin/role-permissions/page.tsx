// app/[locale]/admin/role-permissions/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { RouteGuard } from '@/src/presentation/components/RouteGuard';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface Role {
  id: string;
  name: string;
  display_name: string;
  hierarchy_level: number;
}

interface Route {
  id: string;
  pathname: string;
  display_name: string;
  icon: string | null;
}

interface RoutePermission {
  id: string;
  role_name: string;
  route_id: string;
  is_active: boolean;
}

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [permissions, setPermissions] = useState<RoutePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    // Cargar roles
    const { data: rolesData } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('hierarchy_level', { ascending: false });

    // Cargar rutas
    const { data: routesData } = await supabase
      .from('routes')
      .select('id, pathname, display_name, icon')
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('menu_order');

    // Cargar permisos
    const { data: permissionsData } = await supabase
      .from('route_permissions')
      .select('*')
      .eq('is_active', true);

    setRoles(rolesData || []);
    setRoutes(routesData || []);
    setPermissions(permissionsData || []);

    // Seleccionar primer rol por defecto
    if (rolesData && rolesData.length > 0) {
      setSelectedRole(rolesData[0].name);
    }

    setLoading(false);
  };

  const hasPermission = (routeId: string): boolean => {
    if (!selectedRole) return false;
    return permissions.some(
      (p) => p.role_name === selectedRole && p.route_id === routeId
    );
  };

  const togglePermission = async (routeId: string) => {
    if (!selectedRole) return;

    setSaving(true);
    const supabase = createClient();
    const hasAccess = hasPermission(routeId);

    if (hasAccess) {
      // Remover permiso
      const { error } = await supabase
        .from('route_permissions')
        .delete()
        .eq('role_name', selectedRole)
        .eq('route_id', routeId);

      if (error) {
        console.error('Error removing permission:', error);
        alert('Error al remover permiso');
      } else {
        // Actualizar estado local
        setPermissions((prev) =>
          prev.filter(
            (p) => !(p.role_name === selectedRole && p.route_id === routeId)
          )
        );
      }
    } else {
      // Agregar permiso
      const { error } = await supabase.from('route_permissions').insert([
        {
          role_name: selectedRole,
          route_id: routeId,
          is_active: true,
        },
      ]);

      if (error) {
        console.error('Error adding permission:', error);
        alert('Error al agregar permiso');
      } else {
        // Recargar permisos
        const { data: newPermissions } = await supabase
          .from('route_permissions')
          .select('*')
          .eq('role_name', selectedRole)
          .eq('route_id', routeId);

        if (newPermissions) {
          setPermissions((prev) => [...prev, ...newPermissions]);
        }
      }
    }

    setSaving(false);
  };

  const grantAllPermissions = async () => {
    if (
      !selectedRole ||
      !confirm('¿Asignar TODAS las rutas a este rol? Esta acción no se puede deshacer.')
    ) {
      return;
    }

    setSaving(true);
    const supabase = createClient();

    // Eliminar permisos existentes
    await supabase
      .from('route_permissions')
      .delete()
      .eq('role_name', selectedRole);

    // Agregar todos los permisos
    const newPermissions = routes.map((route) => ({
      role_name: selectedRole,
      route_id: route.id,
      is_active: true,
    }));

    const { error } = await supabase
      .from('route_permissions')
      .insert(newPermissions);

    if (error) {
      console.error('Error granting all permissions:', error);
      alert('Error al asignar todos los permisos');
    } else {
      alert('Todos los permisos asignados exitosamente');
      loadData();
    }

    setSaving(false);
  };

  const revokeAllPermissions = async () => {
    if (
      !selectedRole ||
      !confirm('¿Remover TODAS las rutas de este rol? Esta acción no se puede deshacer.')
    ) {
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('route_permissions')
      .delete()
      .eq('role_name', selectedRole);

    if (error) {
      console.error('Error revoking all permissions:', error);
      alert('Error al remover todos los permisos');
    } else {
      alert('Todos los permisos removidos exitosamente');
      loadData();
    }

    setSaving(false);
  };

  const selectedRoleData = roles.find((r) => r.name === selectedRole);
  const permissionsCount = permissions.filter(
    (p) => p.role_name === selectedRole
  ).length;

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔐 Permisos por Rol
            </h1>
            <p className="text-gray-600">
              Asignar rutas a cada rol del sistema (Script 06)
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              Cargando...
            </div>
          ) : (
            <>
              {/* Selector de Rol */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Rol
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.display_name} (Nivel: {role.hierarchy_level})
                    </option>
                  ))}
                </select>

                {selectedRoleData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Rol seleccionado:
                      </span>
                      <span className="text-lg font-bold text-indigo-600">
                        {selectedRoleData.display_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Rutas asignadas:</span>
                      <span className="text-lg font-bold text-green-600">
                        {permissionsCount} / {routes.length}
                      </span>
                    </div>
                  </div>
                )}

                {/* Botones de acción masiva */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={grantAllPermissions}
                    disabled={saving}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    ✅ Asignar Todas las Rutas
                  </button>
                  <button
                    onClick={revokeAllPermissions}
                    disabled={saving}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
                  >
                    ❌ Remover Todas las Rutas
                  </button>
                </div>
              </div>

              {/* Lista de Rutas */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Rutas Disponibles ({routes.length})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Haz clic en los switches para asignar o remover rutas
                  </p>
                </div>

                <div className="divide-y divide-gray-200">
                  {routes.map((route) => {
                    const hasAccess = hasPermission(route.id);
                    return (
                      <div
                        key={route.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <span className="text-2xl">{route.icon || '📄'}</span>
                            <div>
                              <code className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                {route.pathname}
                              </code>
                              <p className="text-sm text-gray-700 mt-1">
                                {route.display_name}
                              </p>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            onClick={() => togglePermission(route.id)}
                            disabled={saving}
                            className={`
                              relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                              ${
                                hasAccess
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }
                              ${saving ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            <span
                              className={`
                                inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                                ${hasAccess ? 'translate-x-7' : 'translate-x-1'}
                              `}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                ✅ <strong>Asignar rutas a roles:</strong> Define qué páginas puede
                acceder cada cargo
              </li>
              <li>
                ✅ <strong>Los usuarios heredan permisos:</strong> Cuando asignas un rol
                a un usuario, automáticamente obtiene acceso a estas rutas
              </li>
              <li>
                ✅ <strong>Ejemplo:</strong> Si asignas "/library" al rol "student",
                todos los estudiantes podrán acceder a la biblioteca
              </li>
              <li>
                ⚠️ <strong>Permisos individuales tienen prioridad:</strong> Los
                permisos GRANT/DENY individuales pueden sobrescribir estos permisos de
                rol
              </li>
            </ul>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}