// ============================================
// app/[locale]/admin/route-permissions/page.tsx
// ✅ CRUD COMPLETO: Gestión de Permisos de Rutas
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useRoutePermissions } from '@/src/presentation/features/route-permissions/hooks/useRoutePermissions';
import { RoutePermission } from '@/src/core/domain/entities/RoutePermission';
import { EditModal } from '@/src/presentation/components/shared/Modals/EditModal';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';
import { createClient } from '@/src/infrastructure/config/supabase.config';

export default function RoutePermissionsPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [roles, setRoles] = useState<Array<{ name: string; display_name: string }>>([]);
  const [routes, setRoutes] = useState<Array<{ id: string; pathname: string; display_name: string }>>([]);
  const [languages, setLanguages] = useState<Array<{ code: string; name: string }>>([]);

  const {
    permissions,
    loading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    refresh,
  } = useRoutePermissions(true); // incluir inactivos

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<RoutePermission | null>(null);

  // Get current user, roles, routes, and languages
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Get roles
      const { data: rolesData } = await supabase
        .schema('app')
        .from('roles')
        .select('name, display_name')
        .order('hierarchy_level', { ascending: false });
      if (rolesData) setRoles(rolesData);

      // Get routes
      const { data: routesData } = await supabase
        .schema('app')
        .from('routes')
        .select('id, pathname, display_name')
        .is('deleted_at', null)
        .order('pathname');
      if (routesData) setRoutes(routesData);

      // Get languages
      const { data: langsData } = await supabase
        .schema('app')
        .from('languages')
        .select('code, name')
        .eq('is_active', true)
        .order('order_index');
      if (langsData) setLanguages(langsData);
    };

    loadData();
  }, []);

  const handleOpenEdit = (permission: RoutePermission) => {
    setSelectedPermission(permission);
    setShowEditModal(true);
  };

  const handleOpenDelete = (permission: RoutePermission) => {
    setSelectedPermission(permission);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: Record<string, any>) => {
    try {
      if (!currentUserId) {
        throw new Error('No se pudo obtener el usuario actual');
      }

      await createPermission({
        roleName: data.roleName,
        routeId: data.routeId,
        languageCode: data.languageCode === 'null' ? null : data.languageCode,
        isActive: data.isActive === 'true',
        createdBy: currentUserId,
      });

      toast.success('Permiso creado exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear permiso');
      throw err;
    }
  };

  const handleUpdate = async (data: Record<string, any>) => {
    try {
      if (!selectedPermission) return;

      await updatePermission(selectedPermission.id, {
        isActive: data.isActive === 'true',
        languageCode: data.languageCode === 'null' ? null : data.languageCode,
      });

      toast.success('Permiso actualizado exitosamente');
      setShowEditModal(false);
      setSelectedPermission(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar permiso');
      throw err;
    }
  };

  const handleDelete = async (hardDelete: boolean) => {
    try {
      if (!selectedPermission) return;

      await deletePermission(selectedPermission.id);
      toast.success('Permiso eliminado exitosamente');

      setShowDeleteModal(false);
      setSelectedPermission(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar permiso');
      throw err;
    }
  };

  // Columnas para la tabla
  const columns: Column<RoutePermission>[] = [
    {
      key: 'roleName',
      label: 'Rol',
      width: '150px',
      align: 'center',
      render: (item) => (
        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
          {item.roleDisplayName || item.roleName}
        </span>
      ),
    },
    {
      key: 'route',
      label: 'Ruta',
      align: 'left',
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-800">{item.routeName || 'Sin nombre'}</span>
          <div className="text-xs text-slate-500 mt-0.5">{item.routePath || item.routeId}</div>
        </div>
      ),
    },
    {
      key: 'languageCode',
      label: 'Idioma',
      width: '120px',
      align: 'center',
      render: (item) => (
        item.languageCode ? (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {item.languageCode.toUpperCase()}
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
            Todos
          </span>
        )
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      width: '100px',
      align: 'center',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          item.isActive
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {item.isActive ? '✅ Activo' : '⏸️ Inactivo'}
        </span>
      ),
    },
  ];

  // Función de búsqueda
  const handleSearch = (term: string) => {
    return permissions.filter(item =>
      item.roleName.toLowerCase().includes(term.toLowerCase()) ||
      (item.roleDisplayName && item.roleDisplayName.toLowerCase().includes(term.toLowerCase())) ||
      (item.routePath && item.routePath.toLowerCase().includes(term.toLowerCase())) ||
      (item.routeName && item.routeName.toLowerCase().includes(term.toLowerCase()))
    );
  };

  // Campos para modal de creación
  const createFields = [
    {
      name: 'roleName',
      label: 'Rol',
      type: 'select' as const,
      value: roles.length > 0 ? roles[0].name : '',
      required: true,
      options: roles.map(r => ({ value: r.name, label: r.display_name || r.name })),
    },
    {
      name: 'routeId',
      label: 'Ruta',
      type: 'select' as const,
      value: routes.length > 0 ? routes[0].id : '',
      required: true,
      options: routes.map(r => ({ value: r.id, label: `${r.display_name} (${r.pathname})` })),
    },
    {
      name: 'languageCode',
      label: 'Idioma',
      type: 'select' as const,
      value: 'null',
      options: [
        { value: 'null', label: 'Todos los idiomas' },
        ...languages.map(l => ({ value: l.code, label: l.name })),
      ],
    },
    {
      name: 'isActive',
      label: '¿Está activo?',
      type: 'select' as const,
      value: 'true',
      options: [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' },
      ],
    },
  ];

  // Campos para modal de edición
  const editFields = selectedPermission ? [
    {
      name: 'languageCode',
      label: 'Idioma',
      type: 'select' as const,
      value: selectedPermission.languageCode || 'null',
      options: [
        { value: 'null', label: 'Todos los idiomas' },
        ...languages.map(l => ({ value: l.code, label: l.name })),
      ],
    },
    {
      name: 'isActive',
      label: '¿Está activo?',
      type: 'select' as const,
      value: selectedPermission.isActive ? 'true' : 'false',
      options: [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' },
      ],
    },
  ] : [];

  if (loading && permissions.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-300 to-green-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando permisos de rutas...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && permissions.length === 0) {
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
      brandName="Permisos de Rutas"
      backgroundComponent={
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-indigo-400 via-indigo-300 to-purple-300" />
      }
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-indigo-400 via-indigo-300 to-purple-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />

      <DataTable
        title="Permisos de Rutas"
        data={permissions}
        columns={columns}
        onSearch={handleSearch}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onCreate={() => setShowCreateModal(true)}
        getItemKey={(item) => item.id}
        isDeleted={() => false}
        showTrash={false}
        createButtonText="Nuevo Permiso"
      />

      {/* Modal de creación */}
      <EditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Crear Nuevo Permiso de Ruta"
        fields={createFields}
        submitButtonText="Crear"
        submitButtonColor="green"
      />

      {/* Modal de edición */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPermission(null);
        }}
        onSubmit={handleUpdate}
        title="Editar Permiso de Ruta"
        fields={editFields}
        submitButtonText="Actualizar"
        submitButtonColor="amber"
      />

      {/* Modal de eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPermission(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Permiso de Ruta"
        itemName={selectedPermission?.getDisplayName() || ''}
        itemDetails={selectedPermission ? [
          { label: 'Rol', value: selectedPermission.roleDisplayName || selectedPermission.roleName },
          { label: 'Ruta', value: selectedPermission.routePath || selectedPermission.routeId },
          { label: 'Idioma', value: selectedPermission.languageCode || 'Todos' },
          { label: 'Estado', value: selectedPermission.isActive ? 'Activo' : 'Inactivo' },
        ] : []}
        showHardDeleteOption={false}
      />
    </UnifiedLayout>
  );
}
