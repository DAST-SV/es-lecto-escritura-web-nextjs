'use client';
import React, { useState, useEffect } from "react";
import TiposUsuariosList from '@/src/components/user-types/TiposUsuariosList';
import { UserType } from '@/src/components/user-types/types';
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import ModalNuevoTipo from "@/src/components/user-types/ModalNuevoTipo";
import ModalEditarTipo from "@/src/components/user-types/ModalEditarTipo";
import ModalEliminarTipo from "@/src/components/user-types/ModalEliminarTipo";
export default function Page() {
  const [tipos, setTipos] = useState<UserType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de los modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<UserType | null>(null);

  const fetchTipos = async () => {
    try {
      const res = await fetch(`/api/users/usertypes`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudieron cargar los tipos de usuario`);
      }

      const data: UserType[] = await res.json();
      setTipos(data);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  // Handlers para los modales
  const handleOpenEditModal = (tipo: UserType) => {
    setSelectedTipo(tipo);
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (tipo: UserType) => {
    setSelectedTipo(tipo);
    setShowDeleteModal(true);
  };

  const handleCreated = () => {
    fetchTipos();
  };

  const handleUpdated = () => {
    fetchTipos();
  };

  const handleDeleted = () => {
    fetchTipos();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-medium text-slate-600">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
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
      <TiposUsuariosList
        tipos={tipos}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onOpenEditModal={handleOpenEditModal}
        onOpenDeleteModal={handleOpenDeleteModal}
      />

      {/* Modal Crear */}
      <ModalNuevoTipo
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />

      {/* Modal Editar */}
      <ModalEditarTipo
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTipo(null);
        }}
        onUpdated={handleUpdated}
        tipo={selectedTipo}
      />

      {/* Modal Eliminar */}
      <ModalEliminarTipo
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTipo(null);
        }}
        onDeleted={handleDeleted}
        tipo={selectedTipo}
      />
    </UnifiedLayout>
  );
}