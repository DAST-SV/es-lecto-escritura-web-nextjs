// ============================================
// app/[locale]/admin/book-categories/page.tsx
// ✅ CRUD COMPLETO: Gestión de Categorías de Libros
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, FolderOpen } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useBookCategoriesManager } from '@/src/presentation/features/book-categories/hooks/useBookCategoriesManager';
import { BookCategory } from '@/src/core/domain/entities/BookCategory';
import { EditModal } from '@/src/presentation/components/shared/Modals/EditModal';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';
import { useLanguagesManager } from '@/src/presentation/features/languages/hooks/useLanguagesManager';

export default function BookCategoriesPage() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    softDelete,
    restore,
    hardDelete,
    refresh,
  } = useBookCategoriesManager();

  const { languages } = useLanguagesManager();
  const activeLanguages = languages.filter(l => l.isActive);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const handleOpenEdit = (category: BookCategory) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleOpenDelete = (category: BookCategory) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleRestore = async (category: BookCategory) => {
    try {
      await restore(category.id);
      toast.success('Categoría restaurada exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al restaurar categoría');
    }
  };

  const handleCreate = async (data: Record<string, any>) => {
    try {
      // Construir traducciones desde los campos dinámicos
      const translations = activeLanguages
        .filter(lang => data[`name_${lang.code}`]?.trim())
        .map(lang => ({
          languageCode: lang.code,
          name: data[`name_${lang.code}`].trim(),
          description: data[`description_${lang.code}`]?.trim() || null,
        }));

      if (translations.length === 0) {
        throw new Error('Se requiere al menos una traducción');
      }

      await createCategory({
        slug: data.slug,
        icon: data.icon || null,
        color: data.color || null,
        orderIndex: parseInt(data.orderIndex) || 0,
        isActive: data.isActive === 'true',
        translations,
      });

      toast.success('Categoría creada exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear categoría');
      throw err;
    }
  };

  const handleUpdate = async (data: Record<string, any>) => {
    try {
      if (!selectedCategory) return;

      // Construir traducciones desde los campos dinámicos
      const translations = activeLanguages
        .filter(lang => data[`name_${lang.code}`]?.trim())
        .map(lang => ({
          languageCode: lang.code,
          name: data[`name_${lang.code}`].trim(),
          description: data[`description_${lang.code}`]?.trim() || null,
        }));

      await updateCategory(selectedCategory.id, {
        slug: data.slug,
        icon: data.icon || null,
        color: data.color || null,
        orderIndex: parseInt(data.orderIndex) || 0,
        isActive: data.isActive === 'true',
        translations: translations.length > 0 ? translations : undefined,
      });

      toast.success('Categoría actualizada exitosamente');
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar categoría');
      throw err;
    }
  };

  const handleDelete = async (hardDeleteOption: boolean) => {
    try {
      if (!selectedCategory) return;

      if (hardDeleteOption) {
        await hardDelete(selectedCategory.id);
        toast.success('Categoría eliminada permanentemente');
      } else {
        await softDelete(selectedCategory.id);
        toast.success('Categoría movida a la papelera');
      }

      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar categoría');
      throw err;
    }
  };

  // Columnas para la tabla
  const columns: Column<BookCategory>[] = [
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
            <FolderOpen className="w-6 h-6 text-slate-400" />
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
            {item.getDescription('es')?.substring(0, 50) || 'Sin descripción'}
            {(item.getDescription('es')?.length || 0) > 50 && '...'}
          </p>
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      width: '150px',
      align: 'left',
      render: (item) => (
        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
          {item.slug}
        </span>
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

  // Función de búsqueda
  const handleSearch = (term: string) => {
    return categories.filter(item =>
      item.slug.toLowerCase().includes(term.toLowerCase()) ||
      item.translations.some(t =>
        t.name.toLowerCase().includes(term.toLowerCase()) ||
        t.description?.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  // Campos dinámicos para traducciones
  const getTranslationFields = (category?: BookCategory) => {
    return activeLanguages.flatMap(lang => [
      {
        name: `name_${lang.code}`,
        label: `Nombre (${lang.displayWithFlag})`,
        type: 'text' as const,
        value: category?.getTranslation(lang.code)?.name || '',
        required: lang.code === 'es',
        placeholder: `Nombre en ${lang.name}`,
      },
      {
        name: `description_${lang.code}`,
        label: `Descripción (${lang.displayWithFlag})`,
        type: 'textarea' as const,
        value: category?.getTranslation(lang.code)?.description || '',
        placeholder: `Descripción en ${lang.name}`,
      },
    ]);
  };

  // Campos para modal de creación
  const createFields = [
    {
      name: 'slug',
      label: 'Slug (URL)',
      type: 'text' as const,
      value: '',
      required: true,
      placeholder: 'Ej: cuentos-clasicos',
    },
    {
      name: 'icon',
      label: 'Icono (Emoji)',
      type: 'text' as const,
      value: '',
      placeholder: 'Ej: 📚',
    },
    {
      name: 'color',
      label: 'Color (Hex)',
      type: 'text' as const,
      value: '#3B82F6',
      placeholder: 'Ej: #FF5733',
    },
    {
      name: 'orderIndex',
      label: 'Orden',
      type: 'number' as const,
      value: '0',
    },
    {
      name: 'isActive',
      label: '¿Está activa?',
      type: 'select' as const,
      value: 'true',
      options: [
        { value: 'true', label: 'Activa' },
        { value: 'false', label: 'Inactiva' },
      ],
    },
    ...getTranslationFields(),
  ];

  // Campos para modal de edición
  const editFields = selectedCategory ? [
    {
      name: 'slug',
      label: 'Slug (URL)',
      type: 'text' as const,
      value: selectedCategory.slug,
      required: true,
    },
    {
      name: 'icon',
      label: 'Icono (Emoji)',
      type: 'text' as const,
      value: selectedCategory.icon || '',
    },
    {
      name: 'color',
      label: 'Color (Hex)',
      type: 'text' as const,
      value: selectedCategory.color || '#3B82F6',
    },
    {
      name: 'orderIndex',
      label: 'Orden',
      type: 'number' as const,
      value: String(selectedCategory.orderIndex),
    },
    {
      name: 'isActive',
      label: '¿Está activa?',
      type: 'select' as const,
      value: selectedCategory.isActive ? 'true' : 'false',
      options: [
        { value: 'true', label: 'Activa' },
        { value: 'false', label: 'Inactiva' },
      ],
    },
    ...getTranslationFields(selectedCategory),
  ] : [];

  // Datos filtrados (activos o eliminados)
  const filteredData = showTrash
    ? categories.filter(c => c.isDeleted)
    : categories.filter(c => !c.isDeleted);

  if (loading && categories.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-amber-400 via-orange-300 to-yellow-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-amber-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando categorías...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && categories.length === 0) {
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
      brandName="Categorías de Libros"
      backgroundComponent={
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-amber-400 via-orange-300 to-yellow-300" />
      }
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-amber-400 via-orange-300 to-yellow-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />

      <DataTable
        title={showTrash ? 'Categorías Eliminadas' : 'Categorías de Libros'}
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
        createButtonText="Nueva Categoría"
      />

      {/* Modal de creación */}
      <EditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Crear Nueva Categoría"
        fields={createFields}
        submitButtonText="Crear"
        submitButtonColor="green"
      />

      {/* Modal de edición */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleUpdate}
        title="Editar Categoría"
        fields={editFields}
        submitButtonText="Actualizar"
        submitButtonColor="amber"
      />

      {/* Modal de eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        itemName={selectedCategory?.getName('es') || ''}
        itemDetails={selectedCategory ? [
          { label: 'Slug', value: selectedCategory.slug },
          { label: 'Idiomas', value: selectedCategory.translations.map(t => t.languageCode.toUpperCase()).join(', ') },
          { label: 'Estado', value: selectedCategory.isActive ? 'Activa' : 'Inactiva' },
        ] : []}
        showHardDeleteOption={selectedCategory?.isDeleted || false}
      />
    </UnifiedLayout>
  );
}
