// app/[locale]/admin/routes/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { RouteGuard } from '@/src/presentation/components/RouteGuard';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface Route {
  id: string;
  pathname: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  show_in_menu: boolean;
  menu_order: number;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
}

export default function RoutesManagementPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    pathname: '',
    display_name: '',
    description: '',
    icon: '',
    show_in_menu: false,
    menu_order: 0,
    is_public: false,
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .is('deleted_at', null)
      .order('menu_order', { ascending: true });

    if (error) {
      console.error('Error loading routes:', error);
      alert('Error al cargar rutas');
    } else {
      setRoutes(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    if (editingRoute) {
      // Actualizar
      const { error } = await supabase
        .from('routes')
        .update(formData)
        .eq('id', editingRoute.id);

      if (error) {
        console.error('Error updating route:', error);
        alert('Error al actualizar ruta');
      } else {
        alert('Ruta actualizada exitosamente');
        resetForm();
        loadRoutes();
      }
    } else {
      // Crear nueva
      const { error } = await supabase.from('routes').insert([formData]);

      if (error) {
        console.error('Error creating route:', error);
        alert('Error al crear ruta');
      } else {
        alert('Ruta creada exitosamente');
        resetForm();
        loadRoutes();
      }
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      pathname: route.pathname,
      display_name: route.display_name,
      description: route.description || '',
      icon: route.icon || '',
      show_in_menu: route.show_in_menu,
      menu_order: route.menu_order,
      is_public: route.is_public,
    });
    setShowForm(true);
  };

  const handleDelete = async (routeId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta ruta?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('routes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', routeId);

    if (error) {
      console.error('Error deleting route:', error);
      alert('Error al eliminar ruta');
    } else {
      alert('Ruta eliminada exitosamente');
      loadRoutes();
    }
  };

  const resetForm = () => {
    setFormData({
      pathname: '',
      display_name: '',
      description: '',
      icon: '',
      show_in_menu: false,
      menu_order: 0,
      is_public: false,
    });
    setEditingRoute(null);
    setShowForm(false);
  };

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🗺️ Gestión de Rutas
            </h1>
            <p className="text-gray-600">
              Crear y administrar las rutas del sistema (Script 03)
            </p>
          </div>

          {/* Botón Nueva Ruta */}
          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {showForm ? '❌ Cancelar' : '➕ Nueva Ruta'}
            </button>
          </div>

          {/* Formulario */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {editingRoute ? 'Editar Ruta' : 'Nueva Ruta'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pathname */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pathname *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="/mi-ruta"
                      value={formData.pathname}
                      onChange={(e) =>
                        setFormData({ ...formData, pathname: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Debe empezar con / (ejemplo: /biblioteca)
                    </p>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Visible *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mi Ruta"
                      value={formData.display_name}
                      onChange={(e) =>
                        setFormData({ ...formData, display_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Icon */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icono (emoji)
                    </label>
                    <input
                      type="text"
                      placeholder="📚"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Menu Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orden en Menú
                    </label>
                    <input
                      type="number"
                      value={formData.menu_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          menu_order: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    placeholder="Descripción de la ruta..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.show_in_menu}
                      onChange={(e) =>
                        setFormData({ ...formData, show_in_menu: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Mostrar en menú</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) =>
                        setFormData({ ...formData, is_public: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Ruta pública</span>
                  </label>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    {editingRoute ? '💾 Guardar Cambios' : '➕ Crear Ruta'}
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

          {/* Lista de Rutas */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Rutas del Sistema ({routes.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando...</div>
            ) : routes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay rutas registradas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Icono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Pathname
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Orden
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {routes.map((route) => (
                      <tr key={route.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-2xl">
                          {route.icon || '📄'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            {route.pathname}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {route.display_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {route.is_public && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                Pública
                              </span>
                            )}
                            {route.show_in_menu && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                En menú
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {route.menu_order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(route)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(route.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}