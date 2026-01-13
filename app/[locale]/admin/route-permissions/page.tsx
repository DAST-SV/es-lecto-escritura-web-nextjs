// ============================================
// app/[locale]/admin/route-permissions/page.tsx
// GESTIÓN DE PERMISOS POR ROL
// ============================================
// ✅ Ver qué roles pueden acceder a cada ruta
// ✅ Asignar/remover permisos
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Shield, Check, X, Save } from 'lucide-react';

interface Route {
  id: string;
  pathname: string;
  display_name: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
}

interface Permission {
  route_id: string;
  role_name: string;
}

export default function RoutePermissionsPage() {
  const supabase = createClient();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * 📥 CARGAR TODO
   */
  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar rutas
      const { data: routesData, error: routesError } = await supabase
        .schema('app')
        .from('routes')
        .select('id, pathname, display_name')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('menu_order');

      if (routesError) throw new Error(routesError.message);

      // Cargar roles
      const { data: rolesData, error: rolesError } = await supabase
        .schema('app')
        .from('roles')
        .select('id, name, display_name')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('hierarchy_level');

      if (rolesError) throw new Error(rolesError.message);

      // Cargar permisos
      const { data: permissionsData, error: permissionsError } = await supabase
        .schema('app')
        .from('route_permissions')
        .select('route_id, role_name');

      if (permissionsError) throw new Error(permissionsError.message);

      setRoutes(routesData || []);
      setRoles(rolesData || []);
      setPermissions(permissionsData || []);

    } catch (err: any) {
      alert('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /**
   * ✅ VERIFICAR SI ROL TIENE PERMISO
   */
  const hasPermission = (routeId: string, roleName: string): boolean => {
    return permissions.some(
      p => p.route_id === routeId && p.role_name === roleName
    );
  };

  /**
   * 🔄 TOGGLE PERMISO
   */
  const togglePermission = (routeId: string, roleName: string) => {
    const hasIt = hasPermission(routeId, roleName);

    if (hasIt) {
      // Remover permiso
      setPermissions(permissions.filter(
        p => !(p.route_id === routeId && p.role_name === roleName)
      ));
    } else {
      // Agregar permiso
      setPermissions([...permissions, { route_id: routeId, role_name: roleName }]);
    }
  };

  /**
   * 💾 GUARDAR TODOS LOS CAMBIOS
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Eliminar todos los permisos actuales
      const { error: deleteError } = await supabase
        .schema('app')
        .from('route_permissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todo

      if (deleteError) throw new Error(deleteError.message);

      // 2. Insertar nuevos permisos
      if (permissions.length > 0) {
        const { error: insertError } = await supabase
          .schema('app')
          .from('route_permissions')
          .insert(permissions);

        if (insertError) throw new Error(insertError.message);
      }

      alert('✅ Permisos guardados correctamente');
      loadData();

    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * 🎯 SELECCIONAR TODA UNA RUTA (todos los roles)
   */
  const selectAllRoles = (routeId: string) => {
    const allSelected = roles.every(role => hasPermission(routeId, role.name));

    if (allSelected) {
      // Deseleccionar todos
      setPermissions(permissions.filter(p => p.route_id !== routeId));
    } else {
      // Seleccionar todos
      const newPermissions = permissions.filter(p => p.route_id !== routeId);
      roles.forEach(role => {
        newPermissions.push({ route_id: routeId, role_name: role.name });
      });
      setPermissions(newPermissions);
    }
  };

  /**
   * 🎯 SELECCIONAR TODO UN ROL (todas las rutas)
   */
  const selectAllRoutes = (roleName: string) => {
    const allSelected = routes.every(route => hasPermission(route.id, roleName));

    if (allSelected) {
      // Deseleccionar todas
      setPermissions(permissions.filter(p => p.role_name !== roleName));
    } else {
      // Seleccionar todas
      const newPermissions = permissions.filter(p => p.role_name !== roleName);
      routes.forEach(route => {
        newPermissions.push({ route_id: route.id, role_name: roleName });
      });
      setPermissions(newPermissions);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-purple-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Permisos de Rutas por Rol
                </h1>
                <p className="text-gray-600">
                  Define qué roles pueden acceder a cada ruta
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        {/* TABLA DE PERMISOS */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-purple-50 z-10">
                    Ruta
                  </th>
                  {roles.map(role => (
                    <th key={role.id} className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => selectAllRoutes(role.name)}
                          className="text-sm font-semibold text-gray-900 hover:text-purple-600"
                        >
                          {role.display_name}
                        </button>
                        <span className="text-xs text-gray-500 font-mono">
                          {role.name}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {routes.map((route, idx) => (
                  <tr 
                    key={route.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 sticky left-0 bg-inherit z-10">
                      <div>
                        <code className="text-sm font-mono text-gray-800">
                          {route.pathname}
                        </code>
                        <p className="text-xs text-gray-600 mt-1">
                          {route.display_name}
                        </p>
                      </div>
                    </td>

                    {roles.map(role => {
                      const has = hasPermission(route.id, role.name);
                      return (
                        <td key={role.id} className="px-4 py-4 text-center">
                          <button
                            onClick={() => togglePermission(route.id, role.name)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                              has
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {has ? <Check size={20} /> : <X size={20} />}
                          </button>
                        </td>
                      );
                    })}

                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => selectAllRoles(route.id)}
                        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Todos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LEYENDA */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">💡 Cómo funciona:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>✅ Verde = El rol PUEDE acceder a la ruta</li>
                <li>❌ Gris = El rol NO puede acceder</li>
                <li>Click en el nombre del rol = Seleccionar/deseleccionar TODAS las rutas</li>
                <li>Click en "Todos" = Seleccionar/deseleccionar TODOS los roles para esa ruta</li>
                <li>⚠️ No olvides hacer clic en "Guardar Cambios"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}