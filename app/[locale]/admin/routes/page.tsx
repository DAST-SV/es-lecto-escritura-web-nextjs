// ============================================
// app/[locale]/admin/routes/page.tsx
// ESTILO ADMIN PROFESIONAL
// ============================================

'use client';

import React, { useState } from 'react';
import { useRoutes } from '@/src/presentation/features/routes/hooks/useRoutes';
import {
  CreateRouteModal,
  EditRouteModal,
  DeleteRouteModal,
} from '@/src/presentation/features/routes/components';
import { Route } from '@/src/core/domain/entities/Route';
import { Loader2, AlertCircle, Lock, Globe, Plus, Search, Filter, Edit2, Trash2, RotateCcw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function RoutesPage() {
  const {
    routes,
    loading,
    error,
    createRoute,
    updateRoute,
    deleteRoute,
    restoreRoute,
    hardDeleteRoute,
    refresh,
  } = useRoutes();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const handleOpenEdit = (route: Route) => {
    setSelectedRoute(route);
    setShowEditModal(true);
  };

  const handleOpenDelete = (route: Route) => {
    setSelectedRoute(route);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createRoute(data);
      toast.success('Ruta creada exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear ruta');
      throw err;
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateRoute(id, data);
      toast.success('Ruta actualizada exitosamente');
      setShowEditModal(false);
      setSelectedRoute(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar ruta');
      throw err;
    }
  };

  const handleDelete = async (id: string, hardDelete: boolean) => {
    try {
      if (hardDelete) {
        await hardDeleteRoute(id);
        toast.success('Ruta eliminada permanentemente');
      } else {
        await deleteRoute(id);
        toast.success('Ruta movida a papelera');
      }
      setShowDeleteModal(false);
      setSelectedRoute(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar ruta');
      throw err;
    }
  };

  const handleRestore = async (route: Route) => {
    try {
      await restoreRoute(route.id);
      toast.success('Ruta restaurada exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al restaurar ruta');
    }
  };

  // Filtrar rutas
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = 
      route.pathname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDeleted = showDeleted ? !!route.deletedAt : !route.deletedAt;
    
    return matchesSearch && matchesDeleted;
  });

  if (loading && routes.length === 0) {
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
        <p className="text-gray-600 mb-6 max-w-md text-center">{error}</p>
        <button
          onClick={refresh}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Rutas</h2>
          <p className="text-gray-600 mt-1">Administra las rutas y permisos del sistema</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nueva Ruta
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar rutas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showDeleted
                ? 'bg-orange-50 border-orange-200 text-orange-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            {showDeleted ? 'Papelera' : 'Activos'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ruta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Traducciones
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acceso
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permisos
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Menú
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRoutes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron rutas
                </td>
              </tr>
            ) : (
              filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm font-mono font-semibold text-blue-600">
                      {route.pathname}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{route.displayName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center gap-1">
                      {route.translations.map(t => (
                        <span key={t.languageCode} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {t.languageCode.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {route.isPublic ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <Globe size={12} />
                        Público
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        <Lock size={12} />
                        Privado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {route.requiresPermissions.length > 0 ? (
                      <span>{route.requiresPermissions.length} permiso(s)</span>
                    ) : (
                      <span className="text-gray-400">Sin permisos</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {route.showInMenu ? (
                      <span className="text-green-600">✓ Sí</span>
                    ) : (
                      <span className="text-gray-400">− No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {route.deletedAt ? (
                        <button
                          onClick={() => handleRestore(route)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Restaurar"
                        >
                          <RotateCcw size={18} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenEdit(route)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(route)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CreateRouteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <EditRouteModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRoute(null);
        }}
        onUpdate={handleUpdate}
        route={selectedRoute}
      />

      <DeleteRouteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRoute(null);
        }}
        onDelete={handleDelete}
        route={selectedRoute}
      />
    </div>
  );
}