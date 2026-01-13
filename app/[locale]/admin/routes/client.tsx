// ============================================
// app/[locale]/admin/routes/client.tsx
// CLIENT COMPONENT - Selector de rutas reales
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Plus, Edit2, Trash2, Map, Search, Loader2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Route {
  id: string;
  pathname: string;
  display_name: string;
  description?: string;
  translation_count: number;
}

interface Props {
  systemRoutes: string[];
}

export default function RoutesPageClient({ systemRoutes }: Props) {
  const supabase = createClient();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // Form states
  const [pathname, setPathname] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');

  // Para el selector con búsqueda
  const [pathnameSearch, setPathnameSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  /**
   * 📥 CARGAR RUTAS DE LA BD
   */
  const loadRoutes = async () => {
    try {
      setLoading(true);

      const { data: routesData, error: routesError } = await supabase
        .schema('app')
        .from('routes')
        .select('id, pathname, display_name, description')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('pathname');

      if (routesError) throw new Error(routesError.message);

      // Contar traducciones
      const routesWithCount = await Promise.all(
        (routesData || []).map(async (route: any) => {
          const { count } = await supabase
            .schema('app')
            .from('route_translations')
            .select('*', { count: 'exact', head: true })
            .eq('route_id', route.id)
            .eq('is_active', true);

          return {
            ...route,
            translation_count: count || 0,
          };
        })
      );

      setRoutes(routesWithCount);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  /**
   * 🔍 FILTRAR RUTAS DEL SISTEMA
   */
  const filteredSystemRoutes = systemRoutes.filter(route =>
    route.toLowerCase().includes(pathnameSearch.toLowerCase())
  );

  /**
   * 🎯 SELECCIONAR RUTA DEL DROPDOWN
   */
  const handleSelectSystemRoute = (route: string) => {
    setPathname(route);
    setPathnameSearch(route);
    setShowDropdown(false);

    // Auto-generar nombre
    if (!displayName) {
      const segments = route.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1] || 'home';
      const name = lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setDisplayName(name);
    }
  };

  /**
   * ✏️ ABRIR MODAL EDITAR
   */
  const handleOpenEdit = (route: Route) => {
    setSelectedRoute(route);
    setPathname(route.pathname);
    setPathnameSearch(route.pathname);
    setDisplayName(route.display_name);
    setDescription(route.description || '');
    setShowEditModal(true);
  };

  /**
   * 🗑️ ABRIR MODAL ELIMINAR
   */
  const handleOpenDelete = (route: Route) => {
    setSelectedRoute(route);
    setShowDeleteModal(true);
  };

  /**
   * ➕ CREAR RUTA
   */
  const handleCreate = async () => {
    try {
      if (!pathname || !displayName) {
        toast.error('Pathname y nombre son requeridos');
        return;
      }

      // Verificar que la ruta exista en el sistema
      if (!systemRoutes.includes(pathname)) {
        toast.error('Esta ruta no existe en el sistema');
        return;
      }

      // Verificar que no esté ya agregada
      const exists = routes.some(r => r.pathname === pathname);
      if (exists) {
        toast.error('Esta ruta ya está agregada');
        return;
      }

      const { error: insertError } = await supabase
        .schema('app')
        .from('routes')
        .insert({
          pathname,
          display_name: displayName,
          description: description || null,
          show_in_menu: false,
          menu_order: 0,
        });

      if (insertError) throw new Error(insertError.message);

      toast.success('✅ Ruta creada exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadRoutes();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * ✏️ ACTUALIZAR RUTA
   */
  const handleUpdate = async () => {
    try {
      if (!displayName) {
        toast.error('El nombre es requerido');
        return;
      }

      if (!selectedRoute) return;

      const { error: updateError } = await supabase
        .schema('app')
        .from('routes')
        .update({
          display_name: displayName,
          description: description || null,
        })
        .eq('id', selectedRoute.id);

      if (updateError) throw new Error(updateError.message);

      toast.success('✅ Ruta actualizada');
      setShowEditModal(false);
      resetForm();
      loadRoutes();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * 🗑️ ELIMINAR RUTA
   */
  const handleDelete = async () => {
    try {
      if (!selectedRoute) return;

      const { error: deleteError } = await supabase
        .schema('app')
        .from('routes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', selectedRoute.id);

      if (deleteError) throw new Error(deleteError.message);

      toast.success('✅ Ruta eliminada');
      setShowDeleteModal(false);
      setSelectedRoute(null);
      loadRoutes();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * 🔄 RESETEAR FORMULARIO
   */
  const resetForm = () => {
    setPathname('');
    setPathnameSearch('');
    setDisplayName('');
    setDescription('');
    setSelectedRoute(null);
  };

  /**
   * 🔍 FILTRAR RUTAS DE LA BD
   */
  const filteredRoutes = routes.filter(route =>
    route.pathname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (route.description && route.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando rutas...</p>
        </div>
      </div>
    );
  }

  if (error && routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={loadRoutes} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rutas del Sistema</h2>
          <p className="text-gray-600 mt-1">Gestiona las rutas únicas del sistema</p>
          <p className="text-sm text-blue-600 mt-1">
            📁 {systemRoutes.length} rutas detectadas en el sistema
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nueva Ruta
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar rutas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pathname</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Traducciones</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRoutes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron rutas
                </td>
              </tr>
            ) : (
              filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Map size={14} className="text-gray-400" />
                      <code className="text-sm font-mono text-gray-900 font-bold">{route.pathname}</code>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{route.display_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{route.description || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {route.translation_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(route)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(route)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nueva Ruta</h3>

              <div className="space-y-4">
                {/* SELECTOR CON BÚSQUEDA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pathname (Ruta real del sistema) *
                  </label>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Search className="absolute left-3 text-gray-400 pointer-events-none" size={20} />
                      <input
                        type="text"
                        value={pathnameSearch}
                        onChange={(e) => {
                          setPathnameSearch(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Buscar ruta..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* DROPDOWN */}
                    {showDropdown && filteredSystemRoutes.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {filteredSystemRoutes.map((route) => {
                          const isAdded = routes.some(r => r.pathname === route);
                          return (
                            <button
                              key={route}
                              onClick={() => handleSelectSystemRoute(route)}
                              disabled={isAdded}
                              className={`w-full text-left px-4 py-3 font-mono text-sm border-b last:border-b-0 flex items-center justify-between ${
                                isAdded
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'hover:bg-blue-50 text-gray-900'
                              }`}
                            >
                              <span>{route}</span>
                              {isAdded && (
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                  Ya agregada
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    💡 {systemRoutes.length} rutas disponibles | Mostrando: {filteredSystemRoutes.length}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Library"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Biblioteca de recursos..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreate}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Ruta
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Ruta</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pathname (no editable)
                  </label>
                  <input
                    type="text"
                    value={pathname}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {showDeleteModal && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Eliminar Ruta</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de eliminar la ruta <code className="font-mono font-bold">{selectedRoute.pathname}</code>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRoute(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}