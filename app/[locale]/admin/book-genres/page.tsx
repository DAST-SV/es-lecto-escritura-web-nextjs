// ============================================
// app/[locale]/admin/book-genres/page.tsx
// ✅ CRUD COMPLETO: Gestión de Géneros Literarios
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useBookGenresManager } from '@/src/presentation/features/book-genres/hooks/useBookGenresManager';
import { BookGenre } from '@/src/core/domain/entities/BookGenre';
import { EditModal } from '@/src/presentation/components/shared/Modals/EditModal';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';
import { useLanguagesManager } from '@/src/presentation/features/languages/hooks/useLanguagesManager';

export default function BookGenresPage() {
  const { genres, loading, error, createGenre, updateGenre, softDelete, restore, hardDelete, refresh } = useBookGenresManager();
  const { languages } = useLanguagesManager();
  const activeLanguages = languages.filter(l => l.isActive);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<BookGenre | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const handleCreate = async (data: Record<string, any>) => {
    try {
      const translations = activeLanguages
        .filter(lang => data[`name_${lang.code}`]?.trim())
        .map(lang => ({
          languageCode: lang.code,
          name: data[`name_${lang.code}`].trim(),
          description: data[`description_${lang.code}`]?.trim() || null,
        }));

      if (translations.length === 0) throw new Error('Se requiere al menos una traducción');

      await createGenre({
        slug: data.slug,
        icon: data.icon || null,
        color: data.color || null,
        orderIndex: parseInt(data.orderIndex) || 0,
        isActive: data.isActive === 'true',
        translations,
      });

      toast.success('Género creado exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleUpdate = async (data: Record<string, any>) => {
    try {
      if (!selectedGenre) return;

      const translations = activeLanguages
        .filter(lang => data[`name_${lang.code}`]?.trim())
        .map(lang => ({
          languageCode: lang.code,
          name: data[`name_${lang.code}`].trim(),
          description: data[`description_${lang.code}`]?.trim() || null,
        }));

      await updateGenre(selectedGenre.id, {
        slug: data.slug,
        icon: data.icon || null,
        color: data.color || null,
        orderIndex: parseInt(data.orderIndex) || 0,
        isActive: data.isActive === 'true',
        translations: translations.length > 0 ? translations : undefined,
      });

      toast.success('Género actualizado exitosamente');
      setShowEditModal(false);
      setSelectedGenre(null);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleDelete = async (hardDeleteOption: boolean) => {
    try {
      if (!selectedGenre) return;
      if (hardDeleteOption) {
        await hardDelete(selectedGenre.id);
        toast.success('Género eliminado permanentemente');
      } else {
        await softDelete(selectedGenre.id);
        toast.success('Género movido a la papelera');
      }
      setShowDeleteModal(false);
      setSelectedGenre(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRestore = async (genre: BookGenre) => {
    try {
      await restore(genre.id);
      toast.success('Género restaurado');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: Column<BookGenre>[] = [
    {
      key: 'icon', label: 'Icono', width: '80px', align: 'center',
      render: (item) => item.icon ? <span className="text-2xl">{item.icon}</span> : <Sparkles className="w-6 h-6 text-slate-400" />,
    },
    {
      key: 'color', label: 'Color', width: '80px', align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center">
          {item.color ? (
            <div className="w-8 h-8 rounded-lg border-2 border-white shadow-sm" style={{ backgroundColor: item.color }} />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-100 border-2 border-slate-200" />
          )}
        </div>
      ),
    },
    {
      key: 'name', label: 'Nombre', align: 'left',
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-800">{item.getName('es')}</span>
          <p className="text-xs text-slate-500 mt-0.5">{item.getDescription('es')?.substring(0, 50) || 'Sin descripción'}</p>
        </div>
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
            <span key={t.languageCode} className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
              {t.languageCode.toUpperCase()}
            </span>
          ))}
          {item.translations.length > 3 && <span className="text-xs text-slate-500">+{item.translations.length - 3}</span>}
        </div>
      ),
    },
    {
      key: 'order', label: 'Orden', width: '80px', align: 'center',
      render: (item) => <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">{item.orderIndex}</span>,
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

  const getTranslationFields = (genre?: BookGenre) => {
    return activeLanguages.flatMap(lang => [
      { name: `name_${lang.code}`, label: `Nombre (${lang.displayWithFlag})`, type: 'text' as const, value: genre?.getTranslation(lang.code)?.name || '', required: lang.code === 'es' },
      { name: `description_${lang.code}`, label: `Descripción (${lang.displayWithFlag})`, type: 'textarea' as const, value: genre?.getTranslation(lang.code)?.description || '' },
    ]);
  };

  const createFields = [
    { name: 'slug', label: 'Slug (URL)', type: 'text' as const, value: '', required: true, placeholder: 'Ej: aventura' },
    { name: 'icon', label: 'Icono (Emoji)', type: 'text' as const, value: '', placeholder: 'Ej: ⚔️' },
    { name: 'color', label: 'Color (Hex)', type: 'text' as const, value: '#8B5CF6', placeholder: '#8B5CF6' },
    { name: 'orderIndex', label: 'Orden', type: 'number' as const, value: '0' },
    { name: 'isActive', label: '¿Está activo?', type: 'select' as const, value: 'true', options: [{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }] },
    ...getTranslationFields(),
  ];

  const editFields = selectedGenre ? [
    { name: 'slug', label: 'Slug (URL)', type: 'text' as const, value: selectedGenre.slug, required: true },
    { name: 'icon', label: 'Icono (Emoji)', type: 'text' as const, value: selectedGenre.icon || '' },
    { name: 'color', label: 'Color (Hex)', type: 'text' as const, value: selectedGenre.color || '#8B5CF6' },
    { name: 'orderIndex', label: 'Orden', type: 'number' as const, value: String(selectedGenre.orderIndex) },
    { name: 'isActive', label: '¿Está activo?', type: 'select' as const, value: selectedGenre.isActive ? 'true' : 'false', options: [{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }] },
    ...getTranslationFields(selectedGenre),
  ] : [];

  const filteredData = showTrash ? genres.filter(g => g.isDeleted) : genres.filter(g => !g.isDeleted);

  if (loading && genres.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-purple-400 via-violet-300 to-indigo-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando géneros...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && genres.length === 0) {
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
      brandName="Géneros Literarios"
      backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-purple-400 via-violet-300 to-indigo-300" />}
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-purple-400 via-violet-300 to-indigo-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />

      <DataTable
        title={showTrash ? 'Géneros Eliminados' : 'Géneros Literarios'}
        data={filteredData}
        columns={columns}
        onSearch={(term) => genres.filter(g => g.slug.includes(term.toLowerCase()) || g.translations.some(t => t.name.toLowerCase().includes(term.toLowerCase())))}
        onEdit={(g) => { setSelectedGenre(g); setShowEditModal(true); }}
        onDelete={(g) => { setSelectedGenre(g); setShowDeleteModal(true); }}
        onCreate={() => setShowCreateModal(true)}
        onRestore={handleRestore}
        getItemKey={(item) => item.id}
        isDeleted={(item) => item.isDeleted}
        showTrash={true}
        showingTrash={showTrash}
        onToggleTrash={() => setShowTrash(!showTrash)}
        createButtonText="Nuevo Género"
      />

      <EditModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} title="Crear Nuevo Género" fields={createFields} submitButtonText="Crear" submitButtonColor="green" />
      <EditModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedGenre(null); }} onSubmit={handleUpdate} title="Editar Género" fields={editFields} submitButtonText="Actualizar" submitButtonColor="amber" />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedGenre(null); }}
        onConfirm={handleDelete}
        title="Eliminar Género"
        itemName={selectedGenre?.getName('es') || ''}
        itemDetails={selectedGenre ? [{ label: 'Slug', value: selectedGenre.slug }, { label: 'Idiomas', value: selectedGenre.translations.map(t => t.languageCode.toUpperCase()).join(', ') }] : []}
        showHardDeleteOption={selectedGenre?.isDeleted || false}
      />
    </UnifiedLayout>
  );
}
