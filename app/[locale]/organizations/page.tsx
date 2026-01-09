// ============================================
// app/[locale]/organizations/page.tsx
// ✅ CON LAYOUT 100VH PERFECTO
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import { useOrganizations } from '@/src/presentation/features/organizations/hooks/useOrganizations';
import {
  CreateOrganizationModal,
  EditOrganizationModal,
  DeleteOrganizationModal,
  MembersModal,
} from '@/src/presentation/features/organizations/components';
import { Organization, organizationTypeLabels } from '@/src/core/domain/entities/Organization';
import { createClient } from '@/src/utils/supabase/client';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, Users, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OrganizationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // Hook principal
  const {
    organizations,
    loading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    refresh,
  } = useOrganizations(userId || undefined);

  // Verificar autenticación
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('❌ No autenticado:', error);
          router.push('/login');
          return;
        }

        setUserId(user.id);
        console.log('✅ Usuario autenticado:', user.id);
      } catch (err) {
        console.error('❌ Error verificando autenticación:', err);
        router.push('/login');
      } finally {
        setIsLoadingUser(false);
      }
    }

    checkAuth();
  }, [router, supabase]);

  // Handlers
  const handleOpenEdit = (org: Organization) => {
    setSelectedOrganization(org);
    setShowEditModal(true);
  };

  const handleOpenDelete = (org: Organization) => {
    setSelectedOrganization(org);
    setShowDeleteModal(true);
  };

  const handleViewMembers = (org: Organization) => {
    setSelectedOrganization(org);
    setShowMembersModal(true);
  };

  const handleCreate = async (data: any) => {
    if (!userId) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      await createOrganization(userId, data);
      toast.success('Organización creada exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      console.error('❌ Error creando organización:', err);
      toast.error(err.message || 'Error al crear organización');
      throw err;
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    if (!userId) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      await updateOrganization(id, userId, data);
      toast.success('Organización actualizada exitosamente');
      setShowEditModal(false);
      setSelectedOrganization(null);
    } catch (err: any) {
      console.error('❌ Error actualizando organización:', err);
      toast.error(err.message || 'Error al actualizar organización');
      throw err;
    }
  };

  const handleDelete = async (id: string, hardDelete: boolean) => {
    if (!userId) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      await deleteOrganization(id, userId, hardDelete);
      toast.success(hardDelete 
        ? 'Organización eliminada permanentemente' 
        : 'Organización movida a papelera'
      );
      setShowDeleteModal(false);
      setSelectedOrganization(null);
    } catch (err: any) {
      console.error('❌ Error eliminando organización:', err);
      toast.error(err.message || 'Error al eliminar organización');
      throw err;
    }
  };

  // Columnas para la tabla
  const columns: Column<Organization>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-800">{item.name}</span>
              {item.isVerified && <Shield className="w-3 h-3 text-emerald-600" />}
            </div>
            <span className="text-xs text-slate-500">@{item.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      width: '200px',
      align: 'center',
      render: (item) => (
        <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
          {organizationTypeLabels[item.organizationType]}
        </span>
      ),
    },
    {
      key: 'contact',
      label: 'Contacto',
      align: 'center',
      render: (item) => (
        <div className="text-xs text-slate-600">
          {item.email && <div>✉️ {item.email}</div>}
          {item.phone && <div>📞 {item.phone}</div>}
          {!item.email && !item.phone && <span className="text-slate-400">Sin datos</span>}
        </div>
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
            : 'bg-slate-100 text-slate-500'
        }`}>
          {item.isActive ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'members',
      label: 'Miembros',
      width: '100px',
      align: 'center',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewMembers(item);
          }}
          className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors text-xs font-medium flex items-center gap-1 mx-auto"
        >
          <Users className="w-3 h-3" />
          Ver
        </button>
      ),
    },
  ];

  // Función de búsqueda
  const handleSearch = (term: string) => {
    return organizations.filter(org =>
      org.name.toLowerCase().includes(term.toLowerCase()) ||
      org.slug.toLowerCase().includes(term.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(term.toLowerCase()))
    );
  };

  // Loading user
  if (isLoadingUser) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Verificando sesión...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  // Loading organizations
  if (loading && organizations.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando organizaciones...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  // Error state
  if (error && organizations.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
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
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100" />
      }
      mainClassName="h-full w-full flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 lg:p-6"
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

      {userId && (
        <>
          <CreateOrganizationModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreate}
            userId={userId}
          />

          <EditOrganizationModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedOrganization(null);
            }}
            onUpdate={handleUpdate}
            organization={selectedOrganization}
            userId={userId}
          />

          <DeleteOrganizationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedOrganization(null);
            }}
            onDelete={handleDelete}
            organization={selectedOrganization}
            userId={userId}
          />

          <MembersModal
            isOpen={showMembersModal}
            onClose={() => {
              setShowMembersModal(false);
              setSelectedOrganization(null);
            }}
            organization={selectedOrganization}
          />
        </>
      )}
    </UnifiedLayout>
  );
}