// ============================================
// app/[locale]/user-types/page.tsx
// ✅ CON BULK OPERATIONS Y FIX COMPLETO
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useUserTypes } from '@/src/presentation/features/user-types/hooks';
import { CreateUserTypeModal, DeleteUserTypeModal, EditUserTypeModal } from '@/src/presentation/features/user-types/components';
import { UserType } from '@/src/core/domain/entities/UserType';

export default function UserTypesPage() {
  const {
    userTypes,
    loading,
    error,
    createUserType,
    updateUserType,
    deleteUserType,
    restoreUserType,
    hardDeleteUserType,
    refresh,
  } = useUserTypes();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);

  const handleOpenEdit = (userType: UserType) => {
    setSelectedUserType(userType);
    setShowEditModal(true);
  };

  const handleOpenDelete = (userType: UserType) => {
    setSelectedUserType(userType);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: { name: string; description: string | null }) => {
    try {
      await createUserType(data);
      toast.success('Tipo de usuario creado exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear tipo de usuario');
      throw err;
    }
  };

  const handleUpdate = async (id: number, data: { name: string; description: string | null }) => {
    try {
      await updateUserType(id, data);
      toast.success('Tipo de usuario actualizado exitosamente');
      setShowEditModal(false);
      setSelectedUserType(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar tipo de usuario');
      throw err;
    }
  };

  const handleDelete = async (id: number, hardDelete: boolean) => {
    try {
      if (hardDelete) {
        await hardDeleteUserType(id);
        toast.success('Tipo de usuario eliminado permanentemente');
      } else {
        await deleteUserType(id);
        toast.success('Tipo de usuario movido a papelera');
      }
      setShowDeleteModal(false);
      setSelectedUserType(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar tipo de usuario');
      throw err;
    }
  };

  const handleRestore = async (userType: UserType) => {
    try {
      await restoreUserType(userType.id);
      toast.success('Tipo de usuario restaurado exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al restaurar tipo de usuario');
    }
  };

  const handleBulkRestore = async (items: UserType[]) => {
    try {
      for (const item of items) {
        await restoreUserType(item.id);
      }
      toast.success(`${items.length} tipos de usuario restaurados`);
    } catch (err: any) {
      toast.error(err.message || 'Error al restaurar tipos de usuario');
    }
  };

  const handleBulkDelete = async (items: UserType[]) => {
    if (!confirm(`¿Está seguro de eliminar permanentemente ${items.length} tipos de usuario? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      for (const item of items) {
        await hardDeleteUserType(item.id);
      }
      toast.success(`${items.length} tipos de usuario eliminados permanentemente`);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar tipos de usuario');
    }
  };

  // Columnas para la tabla
  const columns: Column<UserType>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      align: 'center',
      render: (item) => (
        <span className="font-semibold text-teal-600">{item.id}</span>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      align: 'center',
      render: (item) => (
        <span className="font-semibold text-slate-800">{item.name}</span>
      ),
    },
    {
      key: 'description',
      label: 'Descripción',
      align: 'center',
      render: (item) => (
        <span className="text-slate-600">{item.description || 'Sin descripción'}</span>
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
    return userTypes.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(term.toLowerCase()))
    );
  };

  if (loading && userTypes.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-300 to-green-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando tipos de usuario...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && userTypes.length === 0) {
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
      brandName="Tipos de Usuarios"
      backgroundComponent={
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-400 via-blue-300 to-green-300" />
      }
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-blue-400 via-blue-300 to-green-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />
      
      <DataTable
        title="Tipos de Usuarios"
        data={userTypes}
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
        createButtonText="Nuevo Tipo"
      />

      <CreateUserTypeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <EditUserTypeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUserType(null);
        }}
        onUpdate={handleUpdate}
        userType={selectedUserType}
      />

      <DeleteUserTypeModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUserType(null);
        }}
        onDelete={handleDelete}
        userType={selectedUserType}
      />
    </UnifiedLayout>
  );
}