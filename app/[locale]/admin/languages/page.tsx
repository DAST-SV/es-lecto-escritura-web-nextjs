// ============================================
// app/[locale]/admin/languages/page.tsx
// ✅ CRUD COMPLETO: Gestión de Idiomas
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useLanguagesManager } from '@/src/presentation/features/languages/hooks/useLanguagesManager';
import { Language } from '@/src/core/domain/entities/Language';
import { EditModal } from '@/src/presentation/components/shared/Modals/EditModal';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';

export default function LanguagesPage() {
  const {
    languages,
    loading,
    error,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    refresh,
  } = useLanguagesManager();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const handleOpenEdit = (lang: Language) => {
    setSelectedLanguage(lang);
    setShowEditModal(true);
  };

  const handleOpenDelete = (lang: Language) => {
    setSelectedLanguage(lang);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: Record<string, any>) => {
    try {
      await createLanguage({
        code: data.code,
        name: data.name,
        nativeName: data.nativeName || null,
        flagEmoji: data.flagEmoji || null,
        isDefault: data.isDefault === 'true',
        isActive: data.isActive === 'true',
      });
      toast.success('Idioma creado exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear idioma');
      throw err;
    }
  };

  const handleUpdate = async (data: Record<string, any>) => {
    try {
      if (!selectedLanguage) return;

      await updateLanguage(selectedLanguage.code, {
        name: data.name,
        nativeName: data.nativeName || null,
        flagEmoji: data.flagEmoji || null,
        isDefault: data.isDefault === 'true',
        isActive: data.isActive === 'true',
      });

      toast.success('Idioma actualizado exitosamente');
      setShowEditModal(false);
      setSelectedLanguage(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar idioma');
      throw err;
    }
  };

  const handleDelete = async (hardDelete: boolean) => {
    try {
      if (!selectedLanguage) return;

      await deleteLanguage(selectedLanguage.code);
      toast.success('Idioma eliminado exitosamente');

      setShowDeleteModal(false);
      setSelectedLanguage(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar idioma');
      throw err;
    }
  };

  // Columnas para la tabla
  const columns: Column<Language>[] = [
    {
      key: 'code',
      label: 'Código',
      width: '100px',
      align: 'center',
      render: (item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono font-semibold">
          {item.code.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'flag',
      label: 'Bandera',
      width: '80px',
      align: 'center',
      render: (item) => (
        <span className="text-2xl">{item.flagEmoji || '🏳️'}</span>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      align: 'left',
      render: (item) => (
        <span className="font-semibold text-slate-800">{item.name}</span>
      ),
    },
    {
      key: 'nativeName',
      label: 'Nombre Nativo',
      align: 'left',
      render: (item) => (
        <span className="text-slate-600">{item.nativeName || '—'}</span>
      ),
    },
    {
      key: 'isDefault',
      label: 'Por Defecto',
      width: '120px',
      align: 'center',
      render: (item) => (
        item.isDefault ? (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            ✓ Por Defecto
          </span>
        ) : (
          <span className="text-gray-400">—</span>
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
    return languages.filter(item =>
      item.code.toLowerCase().includes(term.toLowerCase()) ||
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      (item.nativeName && item.nativeName.toLowerCase().includes(term.toLowerCase()))
    );
  };

  // Campos para modal de creación
  const createFields = [
    {
      name: 'code',
      label: 'Código (ISO 639-1)',
      type: 'text' as const,
      value: '',
      required: true,
      placeholder: 'Ej: es, en, fr',
    },
    {
      name: 'name',
      label: 'Nombre en Inglés',
      type: 'text' as const,
      value: '',
      required: true,
      placeholder: 'Ej: Spanish',
    },
    {
      name: 'nativeName',
      label: 'Nombre Nativo',
      type: 'text' as const,
      value: '',
      placeholder: 'Ej: Español',
    },
    {
      name: 'flagEmoji',
      label: 'Emoji de Bandera',
      type: 'text' as const,
      value: '',
      placeholder: 'Ej: 🇪🇸',
    },
    {
      name: 'isDefault',
      label: '¿Es idioma por defecto?',
      type: 'select' as const,
      value: 'false',
      options: [
        { value: 'false', label: 'No' },
        { value: 'true', label: 'Sí' },
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
  const editFields = selectedLanguage ? [
    {
      name: 'name',
      label: 'Nombre en Inglés',
      type: 'text' as const,
      value: selectedLanguage.name,
      required: true,
    },
    {
      name: 'nativeName',
      label: 'Nombre Nativo',
      type: 'text' as const,
      value: selectedLanguage.nativeName || '',
    },
    {
      name: 'flagEmoji',
      label: 'Emoji de Bandera',
      type: 'text' as const,
      value: selectedLanguage.flagEmoji || '',
    },
    {
      name: 'isDefault',
      label: '¿Es idioma por defecto?',
      type: 'select' as const,
      value: selectedLanguage.isDefault ? 'true' : 'false',
      options: [
        { value: 'false', label: 'No' },
        { value: 'true', label: 'Sí' },
      ],
    },
    {
      name: 'isActive',
      label: '¿Está activo?',
      type: 'select' as const,
      value: selectedLanguage.isActive ? 'true' : 'false',
      options: [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' },
      ],
    },
  ] : [];

  if (loading && languages.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-300 to-green-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando idiomas...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && languages.length === 0) {
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
      brandName="Idiomas"
      backgroundComponent={
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-cyan-400 via-cyan-300 to-blue-300" />
      }
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-cyan-400 via-cyan-300 to-blue-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />

      <DataTable
        title="Idiomas del Sistema"
        data={languages}
        columns={columns}
        onSearch={handleSearch}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onCreate={() => setShowCreateModal(true)}
        getItemKey={(item) => item.code}
        isDeleted={() => false}
        showTrash={false}
        createButtonText="Nuevo Idioma"
      />

      {/* Modal de creación */}
      <EditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Crear Nuevo Idioma"
        fields={createFields}
        submitButtonText="Crear"
        submitButtonColor="green"
      />

      {/* Modal de edición */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLanguage(null);
        }}
        onSubmit={handleUpdate}
        title="Editar Idioma"
        fields={editFields}
        submitButtonText="Actualizar"
        submitButtonColor="amber"
      />

      {/* Modal de eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedLanguage(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Idioma"
        itemName={selectedLanguage?.name || ''}
        itemDetails={selectedLanguage ? [
          { label: 'Código', value: selectedLanguage.code.toUpperCase() },
          { label: 'Nombre Nativo', value: selectedLanguage.nativeName || '—' },
          { label: 'Estado', value: selectedLanguage.isActive ? 'Activo' : 'Inactivo' },
        ] : []}
        showHardDeleteOption={false}
      />
    </UnifiedLayout>
  );
}