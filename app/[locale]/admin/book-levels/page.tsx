// ============================================
// app/[locale]/admin/book-levels/page.tsx
// ✅ CRUD COMPLETO: Gestión de Niveles de Lectura
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, Layers } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useBookLevelsManager } from '@/src/presentation/features/book-levels/hooks/useBookLevelsManager';
import { BookLevel } from '@/src/core/domain/entities/BookLevel';
import { EditModal } from '@/src/presentation/components/shared/Modals/EditModal';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';
import { useLanguagesManager } from '@/src/presentation/features/languages/hooks/useLanguagesManager';

export default function BookLevelsPage() {
  const {
    levels,
    loading,
    error,
    createLevel,
    updateLevel,
    softDelete,
    restore,
    hardDelete,
    refresh,
  } = useBookLevelsManager();

  const { languages } = useLanguagesManager();
  const activeLanguages = languages.filter(l => l.isActive);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<BookLevel | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const handleOpenEdit = (level: BookLevel) => {
    setSelectedLevel(level);
    setShowEditModal(true);
  };

  const handleOpenDelete = (level: BookLevel) => {
    setSelectedLevel(level);
    setShowDeleteModal(true);
  };

  const handleRestore = async (level: BookLevel) => {
    try {
      await restore(level.id);
      toast.success('Nivel restaurado exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al restaurar nivel');
    }
  };

  const handleCreate = async (data: Record<string, any>) => {
    try {
      const translations = activeLanguages
        .filter(lang => data[`name_${lang.code}`]?.trim())
        .map(lang => ({
          languageCode: lang.code,
          name: data[`name_${lang.code}`].trim(),
          description: data[`description_${lang.code}`]?.trim() || null,
          ageLabel: data[`ageLabel_${lang.code}`]?.trim() || null,
        }));

      if (translations.length === 0) {
        throw new Error('Se requiere al menos una traducción');
      }

      await createLevel({
        slug: data.slug,
        minAge: parseInt(data.minAge) || 0,
        maxAge: parseInt(data.maxAge) || 99,
        gradeMin: data.gradeMin ? parseInt(data.gradeMin) : null,
        gradeMax: data.gradeMax ? parseInt(data.gradeMax) : null,
        color: data.color || null,
        icon: data.icon || null,
        orderIndex: parseInt(data.orderIndex) || 0,
        isActive: data.isActive === 'true',
        translations,
      });

      toast.success('Nivel creado exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear nivel');
      throw err;
    }
  };

  const handleUpdate = async (data: Record<string, any>) => {
    try {
      if (!selectedLevel) return;

      const translations = activeLanguages
        .filter(lang => data[`name_${lang.code}`]?.trim())
        .map(lang => ({
          languageCode: lang.code,
          name: data[`name_${lang.code}`].trim(),
          description: data[`description_${lang.code}`]?.trim() || null,
          ageLabel: data[`ageLabel_${lang.code}`]?.trim() || null,
        }));

      await updateLevel(selectedLevel.id, {
        slug: data.slug,
        minAge: parseInt(data.minAge) || 0,
        maxAge: parseInt(data.maxAge) || 99,
        gradeMin: data.gradeMin ? parseInt(data.gradeMin) : null,
        gradeMax: data.gradeMax ? parseInt(data.gradeMax) : null,
        color: data.color || null,
        icon: data.icon || null,
        orderIndex: parseInt(data.orderIndex) || 0,
        isActive: data.isActive === 'true',
        translations: translations.length > 0 ? translations : undefined,
      });

      toast.success('Nivel actualizado exitosamente');
      setShowEditModal(false);
      setSelectedLevel(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar nivel');
      throw err;
    }
  };

  const handleDelete = async (hardDeleteOption: boolean) => {
    try {
      if (!selectedLevel) return;

      if (hardDeleteOption) {
        await hardDelete(selectedLevel.id);
        toast.success('Nivel eliminado permanentemente');
      } else {
        await softDelete(selectedLevel.id);
        toast.success('Nivel movido a la papelera');
      }

      setShowDeleteModal(false);
      setSelectedLevel(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar nivel');
      throw err;
    }
  };

  const columns: Column<BookLevel>[] = [
    {
      key: 'icon',
      label: 'Icono',
      width: '80px',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center">
          {item.icon ? (
            <span className="text-2xl">{item.icon}</span>
          ) : (
            <Layers className="w-6 h-6 text-slate-400" />
          )}
        </div>
      ),
    },
    {
      key: 'color',
      label: 'Color',
      width: '80px',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center">
          {item.color ? (
            <div
              className="w-8 h-8 rounded-lg border-2 border-white shadow-sm"
              style={{ backgroundColor: item.color }}
              title={item.color}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-100 border-2 border-slate-200" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      align: 'left',
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-800">
            {item.getName('es')}
          </span>
          <p className="text-xs text-slate-500 mt-0.5">
            {item.getAgeLabel('es')}
          </p>
        </div>
      ),
    },
    {
      key: 'ageRange',
      label: 'Edad',
      width: '100px',
      align: 'center',
      render: (item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {item.ageRange} años
        </span>
      ),
    },
    {
      key: 'gradeRange',
      label: 'Grado',
      width: '100px',
      align: 'center',
      render: (item) => (
        item.gradeRange ? (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {item.gradeRange}°
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )
      ),
    },
    {
      key: 'translations',
      label: 'Idiomas',
      width: '120px',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1">
          {item.translations.slice(0, 3).map((t) => (
            <span
              key={t.languageCode}
              className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
              title={t.name}
            >
              {t.languageCode.toUpperCase()}
            </span>
          ))}
          {item.translations.length > 3 && (
            <span className="text-xs text-slate-500">
              +{item.translations.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'order',
      label: 'Orden',
      width: '80px',
      align: 'center',
      render: (item) => (
        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
          {item.orderIndex}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      width: '100px',
      align: 'center',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          item.isDeleted
            ? 'bg-red-100 text-red-700'
            : item.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
        }`}>
          {item.isDeleted ? '🗑️ Eliminado' : item.isActive ? '✅ Activo' : '⏸️ Inactivo'}
        </span>
      ),
    },
  ];

  const handleSearch = (term: string) => {
    return levels.filter(item =>
      item.slug.toLowerCase().includes(term.toLowerCase()) ||
      item.ageRange.includes(term) ||
      item.translations.some(t =>
        t.name.toLowerCase().includes(term.toLowerCase()) ||
        t.description?.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const getTranslationFields = (level?: BookLevel) => {
    return activeLanguages.flatMap(lang => [
      {
        name: `name_${lang.code}`,
        label: `Nombre (${lang.displayWithFlag})`,
        type: 'text' as const,
        value: level?.getTranslation(lang.code)?.name || '',
        required: lang.code === 'es',
        placeholder: `Nombre en ${lang.name}`,
      },
      {
        name: `description_${lang.code}`,
        label: `Descripción (${lang.displayWithFlag})`,
        type: 'textarea' as const,
        value: level?.getTranslation(lang.code)?.description || '',
        placeholder: `Descripción en ${lang.name}`,
      },
      {
        name: `ageLabel_${lang.code}`,
        label: `Etiqueta de Edad (${lang.displayWithFlag})`,
        type: 'text' as const,
        value: level?.getTranslation(lang.code)?.ageLabel || '',
        placeholder: `Ej: 3-5 años`,
      },
    ]);
  };

  const createFields = [
    {
      name: 'slug',
      label: 'Slug (URL)',
      type: 'text' as const,
      value: '',
      required: true,
      placeholder: 'Ej: nivel-inicial',
    },
    {
      name: 'minAge',
      label: 'Edad Mínima',
      type: 'number' as const,
      value: '3',
      required: true,
    },
    {
      name: 'maxAge',
      label: 'Edad Máxima',
      type: 'number' as const,
      value: '5',
      required: true,
    },
    {
      name: 'gradeMin',
      label: 'Grado Mínimo (opcional)',
      type: 'number' as const,
      value: '',
      placeholder: 'Ej: 1',
    },
    {
      name: 'gradeMax',
      label: 'Grado Máximo (opcional)',
      type: 'number' as const,
      value: '',
      placeholder: 'Ej: 3',
    },
    {
      name: 'icon',
      label: 'Icono (Emoji)',
      type: 'text' as const,
      value: '',
      placeholder: 'Ej: 🌟',
    },
    {
      name: 'color',
      label: 'Color (Hex)',
      type: 'text' as const,
      value: '#10B981',
      placeholder: 'Ej: #10B981',
    },
    {
      name: 'orderIndex',
      label: 'Orden',
      type: 'number' as const,
      value: '0',
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
    ...getTranslationFields(),
  ];

  const editFields = selectedLevel ? [
    {
      name: 'slug',
      label: 'Slug (URL)',
      type: 'text' as const,
      value: selectedLevel.slug,
      required: true,
    },
    {
      name: 'minAge',
      label: 'Edad Mínima',
      type: 'number' as const,
      value: String(selectedLevel.minAge),
      required: true,
    },
    {
      name: 'maxAge',
      label: 'Edad Máxima',
      type: 'number' as const,
      value: String(selectedLevel.maxAge),
      required: true,
    },
    {
      name: 'gradeMin',
      label: 'Grado Mínimo (opcional)',
      type: 'number' as const,
      value: selectedLevel.gradeMin?.toString() || '',
    },
    {
      name: 'gradeMax',
      label: 'Grado Máximo (opcional)',
      type: 'number' as const,
      value: selectedLevel.gradeMax?.toString() || '',
    },
    {
      name: 'icon',
      label: 'Icono (Emoji)',
      type: 'text' as const,
      value: selectedLevel.icon || '',
    },
    {
      name: 'color',
      label: 'Color (Hex)',
      type: 'text' as const,
      value: selectedLevel.color || '#10B981',
    },
    {
      name: 'orderIndex',
      label: 'Orden',
      type: 'number' as const,
      value: String(selectedLevel.orderIndex),
    },
    {
      name: 'isActive',
      label: '¿Está activo?',
      type: 'select' as const,
      value: selectedLevel.isActive ? 'true' : 'false',
      options: [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' },
      ],
    },
    ...getTranslationFields(selectedLevel),
  ] : [];

  const filteredData = showTrash
    ? levels.filter(l => l.isDeleted)
    : levels.filter(l => !l.isDeleted);

  if (loading && levels.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-green-400 via-emerald-300 to-teal-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando niveles...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && levels.length === 0) {
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
      brandName="Niveles de Lectura"
      backgroundComponent={
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-green-400 via-emerald-300 to-teal-300" />
      }
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-green-400 via-emerald-300 to-teal-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />

      <DataTable
        title={showTrash ? 'Niveles Eliminados' : 'Niveles de Lectura'}
        data={filteredData}
        columns={columns}
        onSearch={handleSearch}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onCreate={() => setShowCreateModal(true)}
        onRestore={handleRestore}
        getItemKey={(item) => item.id}
        isDeleted={(item) => item.isDeleted}
        showTrash={true}
        showingTrash={showTrash}
        onToggleTrash={() => setShowTrash(!showTrash)}
        createButtonText="Nuevo Nivel"
      />

      <EditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Crear Nuevo Nivel"
        fields={createFields}
        submitButtonText="Crear"
        submitButtonColor="green"
      />

      <EditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLevel(null);
        }}
        onSubmit={handleUpdate}
        title="Editar Nivel"
        fields={editFields}
        submitButtonText="Actualizar"
        submitButtonColor="amber"
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedLevel(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Nivel"
        itemName={selectedLevel?.getName('es') || ''}
        itemDetails={selectedLevel ? [
          { label: 'Slug', value: selectedLevel.slug },
          { label: 'Rango de Edad', value: `${selectedLevel.ageRange} años` },
          { label: 'Idiomas', value: selectedLevel.translations.map(t => t.languageCode.toUpperCase()).join(', ') },
        ] : []}
        showHardDeleteOption={selectedLevel?.isDeleted || false}
      />
    </UnifiedLayout>
  );
}
