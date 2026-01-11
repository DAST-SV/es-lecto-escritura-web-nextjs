// ============================================
// app/[locale]/admin/translations/page.tsx
// Página: Gestión de Traducciones
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { useTranslations } from '@/src/presentation/features/translations/hooks/useTranslations';
import {
  CreateTranslationModal,
  EditTranslationModal,
  DeleteTranslationModal,
  BulkCreateTranslationModal,
} from '@/src/presentation/features/translations/components';
import { Translation } from '@/src/core/domain/entities/Translation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, Languages, Key } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function TranslationsPage() {
  const {
    translations,
    loading,
    error,
    createTranslation,
    createBulkTranslations,
    updateTranslation,
    deleteTranslation,
    refresh,
  } = useTranslations();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);

  const handleOpenEdit = (translation: Translation) => {
    setSelectedTranslation(translation);
    setShowEditModal(true);
  };

  const handleOpenDelete = (translation: Translation) => {
    setSelectedTranslation(translation);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createTranslation(data);
      toast.success('Traducción creada exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear traducción');
      throw err;
    }
  };

  const handleBulkCreate = async (data: any) => {
    try {
      await createBulkTranslations(data);
      toast.success('Traducciones creadas exitosamente');
      setShowBulkCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear traducciones');
      throw err;
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateTranslation(id, data);
      toast.success('Traducción actualizada exitosamente');
      setShowEditModal(false);
      setSelectedTranslation(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar traducción');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTranslation(id);
      toast.success('Traducción eliminada exitosamente');
      setShowDeleteModal(false);
      setSelectedTranslation(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar traducción');
      throw err;
    }
  };

  const handleBulkDelete = async (items: Translation[]) => {
    if (!confirm(`¿Está seguro de eliminar ${items.length} traducciones? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      for (const item of items) {
        await deleteTranslation(item.id);
      }
      toast.success(`${items.length} traducciones eliminadas`);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar traducciones');
    }
  };

  // Columnas para la tabla
  const columns: Column<Translation>[] = [
    {
      key: 'namespace',
      label: 'Namespace',
      width: '150px',
      align: 'left',
      render: (item) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
          {item.namespaceSlug}
        </span>
      ),
    },
    {
      key: 'key',
      label: 'Clave',
      width: '200px',
      align: 'left',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Key size={14} className="text-slate-400" />
          <span className="font-mono text-sm text-slate-700">{item.translationKey}</span>
        </div>
      ),
    },
    {
      key: 'language',
      label: 'Idioma',
      width: '100px',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1">
          <Languages size={14} className="text-blue-500" />
          <span className="font-semibold text-blue-600">{item.languageCode.toUpperCase()}</span>
        </div>
      ),
    },
    {
      key: 'value',
      label: 'Valor',
      align: 'left',
      render: (item) => (
        <span className="text-slate-800 line-clamp-2">{item.value}</span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      width: '100px',
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
    return translations.filter(item =>
      item.namespaceSlug.toLowerCase().includes(term.toLowerCase()) ||
      item.translationKey.toLowerCase().includes(term.toLowerCase()) ||
      item.value.toLowerCase().includes(term.toLowerCase()) ||
      item.languageCode.toLowerCase().includes(term.toLowerCase())
    );
  };

  if (loading && translations.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-300 to-green-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando traducciones...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && translations.length === 0) {
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
      brandName="Gestión de Traducciones"
      backgroundComponent={
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-400 via-blue-300 to-green-300" />
      }
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-blue-400 via-blue-300 to-green-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />
      
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md"
        >
          + Nueva Traducción
        </button>
        <button
          onClick={() => setShowBulkCreateModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md"
        >
          + Crear en Lote
        </button>
      </div>
      
      <DataTable
        title="Traducciones"
        data={translations}
        columns={columns}
        onSearch={handleSearch}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onBulkDelete={handleBulkDelete}
        onCreate={() => setShowCreateModal(true)}
        getItemKey={(item) => item.id}
        isDeleted={() => false}
        showTrash={false}
        createButtonText="Nueva Traducción"
      />

      <CreateTranslationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <BulkCreateTranslationModal
        isOpen={showBulkCreateModal}
        onClose={() => setShowBulkCreateModal(false)}
        onCreate={handleBulkCreate}
      />

      <EditTranslationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTranslation(null);
        }}
        onUpdate={handleUpdate}
        translation={selectedTranslation}
      />

      <DeleteTranslationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTranslation(null);
        }}
        onDelete={handleDelete}
        translation={selectedTranslation}
      />
    </UnifiedLayout>
  );
}