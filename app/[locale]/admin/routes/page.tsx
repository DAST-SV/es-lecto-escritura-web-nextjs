// ============================================
// app/[locale]/admin/routes/page.tsx
// Página: Gestión de Rutas
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { useRoutes } from '@/src/presentation/features/routes/hooks/useRoutes';
import {
  CreateRouteModal,
  EditRouteModal,
  DeleteRouteModal,
} from '@/src/presentation/features/routes/components';
import { Route } from '@/src/core/domain/entities/Route';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, Lock, Globe } from 'lucide-react';
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

  const handleBulkRestore = async (items: Route[]) => {
    try {
      for (const item of items) {
        await restoreRoute(item.id);
      }
      toast.success(`${items.length} rutas restauradas`);
    } catch (err: any) {
      toast.error(err.message || 'Error al restaurar rutas');
    }
  };

  const handleBulkDelete = async (items: Route[]) => {
    if (!confirm(`¿Está seguro de eliminar permanentemente ${items.length} rutas? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      for (const item of items) {
        await hardDeleteRoute(item.id);
      }
      toast.success(`${items.length} rutas eliminadas permanentemente`);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar rutas');
    }
  };

  // Columnas para la tabla
  const columns: Column<Route>[] = [
    {
      key: 'pathname',
      label: 'Ruta',
      width: '200px',
      align: 'left',
      render: (item) => (
        <span className="font-mono font-semibold text-blue-600">{item.pathname}</span>
      ),
    },
    {
      key: 'displayName',
      label: 'Nombre',
      align: 'left',
      render: (item) => (
        <span className="font-semibold text-slate-800">{item.displayName}</span>
      ),
    },
    {
      key: 'translations',
      label: 'Traducciones',
      width: '150px',
      align: 'center',
      render: (item) => (
        <div className="flex justify-center gap-1">
          {item.translations.map(t => (
            <span 
              key={t.languageCode}
              className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium"
            >
              {t.languageCode.toUpperCase()}
            </span>
          ))}
          {item.translations.length === 0 && (
            <span className="text-slate-400 text-xs">Sin traducciones</span>
          )}
        </div>
      ),
    },
    {
      key: 'access',
      label: 'Acceso',
      width: '120px',
      align: 'center',
      render: (item) => (
        <div className="flex justify-center">
          {item.isPublic ? (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
              <Globe size={12} />
              Público
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
              <Lock size={12} />
              Privado
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'permissions',
      label: 'Permisos',
      width: '150px',
      align: 'center',
      render: (item) => (
        <div className="text-center">
          {item.requiresPermissions.length > 0 ? (
            <span className="text-xs text-slate-600">
              {item.requiresPermissions.length} permiso(s)
            </span>
          ) : (
            <span className="text-xs text-slate-400">Sin permisos</span>
          )}
        </div>
      ),
    },
    {
      key: 'menu',
      label: 'Menú',
      width: '100px',
      align: 'center',
      render: (item) => (
        <div className="flex justify-center">
          {item.showInMenu ? (
            <span className="text-green-600 text-xs">✓ Sí</span>
          ) : (
            <span className="text-slate-400 text-xs">− No</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      width: '120px',
      align: 'center',
      render: (item) => (
        <div className="flex justify-center">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            item.isActive 
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {item.isActive ? '✅ Activo' : '⏸️ Inactivo'}
          </span>
        </div>
      ),
    },
  ];

  // Función de búsqueda
  const handleSearch = (term: string) => {
    return routes.filter(item =>
      item.pathname.toLowerCase().includes(term.toLowerCase()) ||
      item.displayName.toLowerCase().includes(term.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(term.toLowerCase()))
    );
  };

  if (loading && routes.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-300 to-green-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando rutas...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && routes.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-400 via-red-300 to-orange-300">
          <AlertCircle size={64} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-6 max-w-md text-center">{error}</p>
          <button
            onClick={refresh}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-md"
          >
            Reintentar
          </button>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      brandName="Gestión de Rutas"
      backgroundComponent={
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-400 via-blue-300 to-green-300" />
      }
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-blue-400 via-blue-300 to-green-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />
      
      <DataTable
        title="Rutas del Sistema"
        data={routes}
        columns={columns}
        onSearch={handleSearch}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRestore={handleRestore}
        onBulkRestore={handleBulkRestore}
        onBulkDelete={handleBulkDelete}
        onCreate={() => setShowCreateModal(true)}
        getItemKey={(item) => item.id}
        isDeleted={(item) => !!item.deletedAt}
        showTrash={true}
        createButtonText="Nueva Ruta"
      />

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
    </UnifiedLayout>
  );
}