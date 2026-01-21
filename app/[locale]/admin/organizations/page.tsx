// ============================================
// app/[locale]/admin/organizations/page.tsx
// ✅ CRUD COMPLETO: Gestión de Organizaciones
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useOrganizations } from '@/src/presentation/features/organizations/hooks/useOrganizations';
import { Organization, organizationTypeLabels } from '@/src/core/domain/entities/Organization';
import { EditModal } from '@/src/presentation/components/shared/Modals/EditModal';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';
import { createClient } from '@/src/infrastructure/config/supabase.config';

export default function OrganizationsPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const {
    organizations,
    loading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    refresh,
  } = useOrganizations();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const handleOpenEdit = (org: Organization) => {
    setSelectedOrganization(org);
    setShowEditModal(true);
  };

  const handleOpenDelete = (org: Organization) => {
    setSelectedOrganization(org);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: Record<string, any>) => {
    try {
      if (!currentUserId) {
        throw new Error('No se pudo obtener el usuario actual');
      }

      // Generar slug automáticamente del nombre
      const slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      await createOrganization(currentUserId, {
        organizationType: data.organizationType,
        name: data.name,
        slug,
        description: data.description || null,
        email: data.email || null,
      });

      toast.success('Organización creada exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear organización');
      throw err;
    }
  };

  const handleUpdate = async (data: Record<string, any>) => {
    try {
      if (!selectedOrganization || !currentUserId) return;

      await updateOrganization(selectedOrganization.id, currentUserId, {
        name: data.name,
        description: data.description || null,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
      });

      toast.success('Organización actualizada exitosamente');
      setShowEditModal(false);
      setSelectedOrganization(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar organización');
      throw err;
    }
  };

  const handleDelete = async (hardDelete: boolean) => {
    try {
      if (!selectedOrganization || !currentUserId) return;

      await deleteOrganization(selectedOrganization.id, currentUserId, hardDelete);

      if (hardDelete) {
        toast.success('Organización eliminada permanentemente');
      } else {
        toast.success('Organización movida a papelera');
      }

      setShowDeleteModal(false);
      setSelectedOrganization(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar organización');
      throw err;
    }
  };

  // Columnas para la tabla
  const columns: Column<Organization>[] = [
    {
      key: 'name',
      label: 'Nombre',
      align: 'left',
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-800">{item.name}</span>
          <div className="text-xs text-slate-500 mt-0.5">/{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'organizationType',
      label: 'Tipo',
      width: '200px',
      align: 'center',
      render: (item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
          {organizationTypeLabels[item.organizationType]}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Descripción',
      align: 'left',
      render: (item) => (
        <span className="text-slate-600 text-sm line-clamp-2">
          {item.description || 'Sin descripción'}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      width: '180px',
      align: 'center',
      render: (item) => (
        <span className="text-slate-600 text-sm">{item.email || '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      width: '120px',
      align: 'center',
      render: (item) => (
        <div className="flex flex-col items-center gap-1">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            item.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {item.isActive ? '✅ Activo' : '⏸️ Inactivo'}
          </span>
          {item.isVerified && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              ✓ Verificado
            </span>
          )}
        </div>
      ),
    },
  ];

  // Función de búsqueda
  const handleSearch = (term: string) => {
    return organizations.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      item.slug.toLowerCase().includes(term.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(term.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(term.toLowerCase()))
    );
  };

  // Campos para modal de creación
  const createFields = [
    {
      name: 'organizationType',
      label: 'Tipo de Organización',
      type: 'select' as const,
      value: 'educational_institution',
      required: true,
      options: Object.entries(organizationTypeLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'text' as const,
      value: '',
      required: true,
      placeholder: 'Ej: Escuela San José',
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea' as const,
      value: '',
      placeholder: 'Descripción de la organización',
      rows: 3,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text' as const,
      value: '',
      placeholder: 'contacto@ejemplo.com',
    },
  ];

  // Campos para modal de edición
  const editFields = selectedOrganization ? [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text' as const,
      value: selectedOrganization.name,
      required: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea' as const,
      value: selectedOrganization.description || '',
      rows: 3,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text' as const,
      value: selectedOrganization.email || '',
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text' as const,
      value: selectedOrganization.phone || '',
    },
    {
      name: 'website',
      label: 'Sitio Web',
      type: 'text' as const,
      value: selectedOrganization.website || '',
    },
  ] : [];

  if (loading && organizations.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-300 to-green-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando organizaciones...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && organizations.length === 0) {
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
      brandName="Organizaciones"
      backgroundComponent={
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-purple-400 via-purple-300 to-indigo-300" />
      }
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-purple-400 via-purple-300 to-indigo-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />

      <DataTable
        title="Organizaciones"
        data={organizations}
        columns={columns}
        onSearch={handleSearch}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onCreate={() => setShowCreateModal(true)}
        getItemKey={(item) => item.id}
        isDeleted={(item) => !!item.deletedAt}
        showTrash={true}
        createButtonText="Nueva Organización"
      />

      {/* Modal de creación */}
      <EditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Crear Nueva Organización"
        fields={createFields}
        submitButtonText="Crear"
        submitButtonColor="green"
      />

      {/* Modal de edición */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrganization(null);
        }}
        onSubmit={handleUpdate}
        title="Editar Organización"
        fields={editFields}
        submitButtonText="Actualizar"
        submitButtonColor="amber"
      />

      {/* Modal de eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrganization(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Organización"
        itemName={selectedOrganization?.name || ''}
        itemDetails={selectedOrganization ? [
          { label: 'Tipo', value: organizationTypeLabels[selectedOrganization.organizationType] },
          { label: 'Slug', value: selectedOrganization.slug },
          { label: 'Estado', value: selectedOrganization.isActive ? 'Activo' : 'Inactivo' },
        ] : []}
        showHardDeleteOption={true}
      />
    </UnifiedLayout>
  );
}
