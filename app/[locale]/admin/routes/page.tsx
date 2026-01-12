// app/[locale]/admin/routes/page.tsx
'use client';

import { useState } from 'react';
import { Route, Globe, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useRoutes } from '@/src/presentation/features/routes/hooks/useRoutes';
import { 
  CreateRouteModal, 
  EditRouteModal, 
  DeleteRouteModal 
} from '@/src/presentation/features/routes/components';

export default function RoutesAdminPage() {
  const { routes, loading, createRoute, updateRoute, deleteRoute, hardDeleteRoute } = useRoutes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [deletingRoute, setDeletingRoute] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('es');

  const handleCreate = async (data: any) => {
    try {
      await createRoute(data);
      setShowCreateModal(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateRoute(id, data);
      setEditingRoute(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string, hardDelete: boolean) => {
    try {
      if (hardDelete) {
        await hardDeleteRoute(id);
      } else {
        await deleteRoute(id);
      }
      setDeletingRoute(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Route className="text-blue-600" size={32} />
                Gestión de Rutas
              </h1>
              <p className="text-gray-600 mt-2">
                Administra rutas del sistema y sus traducciones
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 font-semibold"
            >
              <Plus size={20} />
              Nueva Ruta
            </button>
          </div>
        </div>

        {/* Selector de idioma */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Globe className="text-gray-600" size={20} />
            <span className="text-sm font-medium text-gray-700">Ver traducciones en:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇺🇸 English</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
          </div>
        </div>

        {/* Lista de rutas */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando rutas...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {routes.map((route) => {
              const translation = route.getTranslation(selectedLanguage);
              return (
                <div
                  key={route.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-mono text-gray-800">
                          {route.pathname}
                        </code>
                        {!route.isActive && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                            INACTIVA
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {route.displayName}
                      </h3>

                      {route.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {route.description}
                        </p>
                      )}

                      {/* Traducción actual */}
                      {translation && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe size={16} className="text-blue-600" />
                            <span className="text-sm font-semibold text-blue-900">
                              Traducción en {selectedLanguage.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs text-blue-700 font-medium">Ruta:</span>
                              <code className="block mt-1 px-2 py-1 bg-white rounded text-sm font-mono text-blue-900">
                                {translation.translatedPath}
                              </code>
                            </div>
                            <div>
                              <span className="text-xs text-blue-700 font-medium">Nombre:</span>
                              <span className="block mt-1 px-2 py-1 bg-white rounded text-sm text-blue-900">
                                {translation.translatedName}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingRoute(route)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeletingRoute(route)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modales */}
      <CreateRouteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <EditRouteModal
        isOpen={!!editingRoute}
        onClose={() => setEditingRoute(null)}
        onUpdate={handleUpdate}
        route={editingRoute}
      />

      <DeleteRouteModal
        isOpen={!!deletingRoute}
        onClose={() => setDeletingRoute(null)}
        onDelete={handleDelete}
        route={deletingRoute}
      />
    </div>
  );
}