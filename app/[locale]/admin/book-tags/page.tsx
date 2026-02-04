// ============================================
// app/[locale]/admin/book-tags/page.tsx
// ✅ CRUD COMPLETO: Gestión de Etiquetas
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, Tag } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useBookTagsManager } from '@/src/presentation/features/book-tags/hooks/useBookTagsManager';
import { BookTag } from '@/src/core/domain/entities/BookTag';
import { EditModal } from '@/src/presentation/components/shared/Modals/EditModal';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';
import { useLanguagesManager } from '@/src/presentation/features/languages/hooks/useLanguagesManager';

export default function BookTagsPage() {
  const { tags, loading, error, createTag, updateTag, softDelete, restore, hardDelete, refresh } = useBookTagsManager();
  const { languages } = useLanguagesManager();
  const activeLanguages = languages.filter(l => l.isActive);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<BookTag | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const handleCreate = async (data: Record<string, any>) => {
    try {
      const translations = activeLanguages
        .filter(lang => data[`name_${lang.code}`]?.trim())
        .map(lang => ({ languageCode: lang.code, name: data[`name_${lang.code}`].trim() }));

      if (translations.length === 0) throw new Error('Se requiere al menos una traducción');

      await createTag({
        slug: data.slug,
        color: data.color || null,
        isActive: data.isActive === 'true',
        translations,
      });

      toast.success('Etiqueta creada exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleUpdate = async (data: Record<string, any>) => {
    try {
      if (!selectedTag) return;

      const translations = activeLanguages
        .filter(lang => data[`name_${lang.code}`]?.trim())
        .map(lang => ({ languageCode: lang.code, name: data[`name_${lang.code}`].trim() }));

      await updateTag(selectedTag.id, {
        slug: data.slug,
        color: data.color || null,
        isActive: data.isActive === 'true',
        translations: translations.length > 0 ? translations : undefined,
      });

      toast.success('Etiqueta actualizada exitosamente');
      setShowEditModal(false);
      setSelectedTag(null);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleDelete = async (hardDeleteOption: boolean) => {
    try {
      if (!selectedTag) return;
      if (hardDeleteOption) {
        await hardDelete(selectedTag.id);
        toast.success('Etiqueta eliminada permanentemente');
      } else {
        await softDelete(selectedTag.id);
        toast.success('Etiqueta movida a la papelera');
      }
      setShowDeleteModal(false);
      setSelectedTag(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRestore = async (tag: BookTag) => {
    try {
      await restore(tag.id);
      toast.success('Etiqueta restaurada');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: Column<BookTag>[] = [
    {
      key: 'color', label: 'Color', width: '80px', align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center">
          {item.color ? (
            <div className="w-8 h-8 rounded-lg border-2 border-white shadow-sm" style={{ backgroundColor: item.color }} />
          ) : (
            <Tag className="w-6 h-6 text-slate-400" />
          )}
        </div>
      ),
    },
    {
      key: 'name', label: 'Nombre', align: 'left',
      render: (item) => (
        <span className="font-semibold text-slate-800">{item.getName('es')}</span>
      ),
    },
    {
      key: 'slug', label: 'Slug', width: '150px', align: 'left',
      render: (item) => <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">{item.slug}</span>,
    },
    {
      key: 'translations', label: 'Idiomas', width: '120px', align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1">
          {item.translations.slice(0, 3).map((t) => (
            <span key={t.languageCode} className="px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-xs font-medium">
              {t.languageCode.toUpperCase()}
            </span>
          ))}
          {item.translations.length > 3 && <span className="text-xs text-slate-500">+{item.translations.length - 3}</span>}
        </div>
      ),
    },
    {
      key: 'status', label: 'Estado', width: '100px', align: 'center',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          item.isDeleted ? 'bg-red-100 text-red-700' : item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {item.isDeleted ? '🗑️ Eliminado' : item.isActive ? '✅ Activo' : '⏸️ Inactivo'}
        </span>
      ),
    },
  ];

  const getTranslationFields = (tag?: BookTag) => {
    return activeLanguages.map(lang => ({
      name: `name_${lang.code}`,
      label: `Nombre (${lang.displayWithFlag})`,
      type: 'text' as const,
      value: tag?.getTranslation(lang.code)?.name || '',
      required: lang.code === 'es',
    }));
  };

  const createFields = [
    { name: 'slug', label: 'Slug (URL)', type: 'text' as const, value: '', required: true, placeholder: 'Ej: lectura-rapida' },
    { name: 'color', label: 'Color (Hex)', type: 'text' as const, value: '#14B8A6', placeholder: '#14B8A6' },
    { name: 'isActive', label: '¿Está activa?', type: 'select' as const, value: 'true', options: [{ value: 'true', label: 'Activa' }, { value: 'false', label: 'Inactiva' }] },
    ...getTranslationFields(),
  ];

  const editFields = selectedTag ? [
    { name: 'slug', label: 'Slug (URL)', type: 'text' as const, value: selectedTag.slug, required: true },
    { name: 'color', label: 'Color (Hex)', type: 'text' as const, value: selectedTag.color || '#14B8A6' },
    { name: 'isActive', label: '¿Está activa?', type: 'select' as const, value: selectedTag.isActive ? 'true' : 'false', options: [{ value: 'true', label: 'Activa' }, { value: 'false', label: 'Inactiva' }] },
    ...getTranslationFields(selectedTag),
  ] : [];

  const filteredData = showTrash ? tags.filter(t => t.isDeleted) : tags.filter(t => !t.isDeleted);

  if (loading && tags.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-teal-400 via-cyan-300 to-blue-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando etiquetas...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && tags.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-400 via-red-300 to-orange-300">
          <AlertCircle size={64} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={refresh} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Reintentar</button>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      brandName="Etiquetas"
      backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-teal-400 via-cyan-300 to-blue-300" />}
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-teal-400 via-cyan-300 to-blue-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />

      <DataTable
        title={showTrash ? 'Etiquetas Eliminadas' : 'Etiquetas de Libros'}
        data={filteredData}
        columns={columns}
        onSearch={(term) => tags.filter(t => t.slug.includes(term.toLowerCase()) || t.translations.some(tr => tr.name.toLowerCase().includes(term.toLowerCase())))}
        onEdit={(t) => { setSelectedTag(t); setShowEditModal(true); }}
        onDelete={(t) => { setSelectedTag(t); setShowDeleteModal(true); }}
        onCreate={() => setShowCreateModal(true)}
        onRestore={handleRestore}
        getItemKey={(item) => item.id}
        isDeleted={(item) => item.isDeleted}
        showTrash={true}
        showingTrash={showTrash}
        onToggleTrash={() => setShowTrash(!showTrash)}
        createButtonText="Nueva Etiqueta"
      />

      <EditModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} title="Crear Nueva Etiqueta" fields={createFields} submitButtonText="Crear" submitButtonColor="green" />
      <EditModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedTag(null); }} onSubmit={handleUpdate} title="Editar Etiqueta" fields={editFields} submitButtonText="Actualizar" submitButtonColor="amber" />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedTag(null); }}
        onConfirm={handleDelete}
        title="Eliminar Etiqueta"
        itemName={selectedTag?.getName('es') || ''}
        itemDetails={selectedTag ? [{ label: 'Slug', value: selectedTag.slug }, { label: 'Idiomas', value: selectedTag.translations.map(t => t.languageCode.toUpperCase()).join(', ') }] : []}
        showHardDeleteOption={selectedTag?.isDeleted || false}
      />
    </UnifiedLayout>
  );
}
