// ============================================
// app/[locale]/organizations/page.tsx
// ✅ PÁGINA COMPLETA CON CLEAN ARCHITECTURE
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import { useOrganizations } from '@/src/presentation/features/organizations/hooks/useOrganizations';
import {
  OrganizationsList,
  CreateOrganizationModal,
  EditOrganizationModal,
  DeleteOrganizationModal,
  MembersModal,
} from '@/src/presentation/features/organizations/components';
import { Organization } from '@/src/core/domain/entities/Organization';
import { createClient } from '@/src/utils/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
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
      
      <OrganizationsList
        organizations={organizations}
        onOpenCreate={() => setShowCreateModal(true)}
        onOpenEdit={handleOpenEdit}
        onOpenDelete={handleOpenDelete}
        onViewMembers={handleViewMembers}
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