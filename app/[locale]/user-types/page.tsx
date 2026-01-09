/**
 * ============================================
 * ARCHIVO 8: app/[locale]/user-types/page.tsx
 * ✅ ARQUITECTURA LIMPIA COMPLETA
 * ============================================
 */

'use client';

import React, { useState } from 'react';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import { useUserTypes } from '@/src/presentation/features/user-types/hooks/useUserTypes';
import {
  UserTypesList,
  CreateUserTypeModal,
  EditUserTypeModal,
  DeleteUserTypeModal,
} from '@/src/presentation/features/user-types/components';
import { UserType } from '@/src/core/domain/entities/UserType';

export default function UserTypesPage() {
  const {
    userTypes,
    loading,
    error,
    createUserType,
    updateUserType,
    deleteUserType,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-600">Cargando tipos de usuario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <p className="text-lg font-medium mb-4">{error}</p>
        <button
          onClick={refresh}
          className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
        >
          Reintentar
        </button>
      </div>
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
      <UserTypesList
        userTypes={userTypes}
        onOpenCreate={() => setShowCreateModal(true)}
        onOpenEdit={handleOpenEdit}
        onOpenDelete={handleOpenDelete}
      />

      <CreateUserTypeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createUserType}
      />

      <EditUserTypeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUserType(null);
        }}
        onUpdate={updateUserType}
        userType={selectedUserType}
      />

      <DeleteUserTypeModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUserType(null);
        }}
        onDelete={deleteUserType}
        userType={selectedUserType}
      />
    </UnifiedLayout>
  );
}