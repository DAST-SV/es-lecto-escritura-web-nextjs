// ============================================
// app/[locale]/admin/book-authors/page.tsx
// ✅ CRUD COMPLETO: Gestión de Autores
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useBookAuthorsManager } from '@/src/presentation/features/book-authors/hooks/useBookAuthorsManager';
import { BookAuthor } from '@/src/core/domain/entities/BookAuthor';
import { EditModal } from '@/src/presentation/components/shared/Modals/EditModal';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';
import { useLanguagesManager } from '@/src/presentation/features/languages/hooks/useLanguagesManager';

export default function BookAuthorsPage() {
  const { authors, loading, error, createAuthor, updateAuthor, softDelete, restore, hardDelete, refresh } = useBookAuthorsManager();
  const { languages } = useLanguagesManager();
  const activeLanguages = languages.filter(l => l.isActive);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<BookAuthor | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const handleCreate = async (data: Record<string, any>) => {
    try {
      const translations = activeLanguages
        .filter(lang => data[`name_${lang.code}`]?.trim())
        .map(lang => ({
          languageCode: lang.code,
          name: data[`name_${lang.code}`].trim(),
          bio: data[`bio_${lang.code}`]?.trim() || null,
        }));

      if (translations.length === 0) throw new Error('Se requiere al menos una traducción');

      await createAuthor({
        slug: data.slug,
        avatarUrl: data.avatarUrl || null,
        websiteUrl: data.websiteUrl || null,
        isActive: data.isActive === 'true',
        translations,
      });

      toast.success('Autor creado exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleUpdate = async (data: Record<string, any>) => {
    try {
      if (!selectedAuthor) return;

      const translations = activeLanguages
        .filter(lang => data[`name_${lang.code}`]?.trim())
        .map(lang => ({
          languageCode: lang.code,
          name: data[`name_${lang.code}`].trim(),
          bio: data[`bio_${lang.code}`]?.trim() || null,
        }));

      await updateAuthor(selectedAuthor.id, {
        slug: data.slug,
        avatarUrl: data.avatarUrl || null,
        websiteUrl: data.websiteUrl || null,
        isActive: data.isActive === 'true',
        translations: translations.length > 0 ? translations : undefined,
      });

      toast.success('Autor actualizado exitosamente');
      setShowEditModal(false);
      setSelectedAuthor(null);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleDelete = async (hardDeleteOption: boolean) => {
    try {
      if (!selectedAuthor) return;
      if (hardDeleteOption) {
        await hardDelete(selectedAuthor.id);
        toast.success('Autor eliminado permanentemente');
      } else {
        await softDelete(selectedAuthor.id);
        toast.success('Autor movido a la papelera');
      }
      setShowDeleteModal(false);
      setSelectedAuthor(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRestore = async (author: BookAuthor) => {
    try {
      await restore(author.id);
      toast.success('Autor restaurado');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: Column<BookAuthor>[] = [
    {
      key: 'avatar', label: 'Avatar', width: '80px', align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center">
          {item.avatarUrl ? (
            <img src={item.avatarUrl} alt={item.getName('es')} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <User className="w-5 h-5 text-violet-500" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name', label: 'Nombre', align: 'left',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{item.getName('es')}</span>
          {item.websiteUrl && (
            <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-500 hover:underline truncate max-w-[200px]">
              {item.websiteUrl.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'slug', label: 'Slug', width: '150px', align: 'left',
      render: (item) => <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">{item.slug}</span>,
    },
    {
      key: 'bio', label: 'Biografía', width: '200px', align: 'left',
      render: (item) => {
        const bio = item.getBio('es');
        return bio ? (
          <span className="text-sm text-slate-600 line-clamp-2">{bio}</span>
        ) : (
          <span className="text-xs text-slate-400 italic">Sin biografía</span>
        );
      },
    },
    {
      key: 'translations', label: 'Idiomas', width: '120px', align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1">
          {item.translations.slice(0, 3).map((t) => (
            <span key={t.languageCode} className="px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium">
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

  const getTranslationFields = (author?: BookAuthor) => {
    const fields: any[] = [];
    activeLanguages.forEach(lang => {
      fields.push({
        name: `name_${lang.code}`,
        label: `Nombre (${lang.displayWithFlag})`,
        type: 'text' as const,
        value: author?.getTranslation(lang.code)?.name || '',
        required: lang.code === 'es',
      });
      fields.push({
        name: `bio_${lang.code}`,
        label: `Biografía (${lang.displayWithFlag})`,
        type: 'textarea' as const,
        value: author?.getTranslation(lang.code)?.bio || '',
        rows: 3,
      });
    });
    return fields;
  };

  const createFields = [
    { name: 'slug', label: 'Slug (URL)', type: 'text' as const, value: '', required: true, placeholder: 'Ej: gabriel-garcia-marquez' },
    { name: 'avatarUrl', label: 'URL del Avatar', type: 'text' as const, value: '', placeholder: 'https://ejemplo.com/avatar.jpg' },
    { name: 'websiteUrl', label: 'Sitio Web', type: 'text' as const, value: '', placeholder: 'https://ejemplo.com' },
    { name: 'isActive', label: '¿Está activo?', type: 'select' as const, value: 'true', options: [{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }] },
    ...getTranslationFields(),
  ];

  const editFields = selectedAuthor ? [
    { name: 'slug', label: 'Slug (URL)', type: 'text' as const, value: selectedAuthor.slug, required: true },
    { name: 'avatarUrl', label: 'URL del Avatar', type: 'text' as const, value: selectedAuthor.avatarUrl || '' },
    { name: 'websiteUrl', label: 'Sitio Web', type: 'text' as const, value: selectedAuthor.websiteUrl || '' },
    { name: 'isActive', label: '¿Está activo?', type: 'select' as const, value: selectedAuthor.isActive ? 'true' : 'false', options: [{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }] },
    ...getTranslationFields(selectedAuthor),
  ] : [];

  const filteredData = showTrash ? authors.filter(a => a.isDeleted) : authors.filter(a => !a.isDeleted);

  if (loading && authors.length === 0) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-violet-400 via-purple-300 to-indigo-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-violet-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando autores...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && authors.length === 0) {
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
      brandName="Autores"
      backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-violet-400 via-purple-300 to-indigo-300" />}
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-violet-400 via-purple-300 to-indigo-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />

      <DataTable
        title={showTrash ? 'Autores Eliminados' : 'Autores de Libros'}
        data={filteredData}
        columns={columns}
        onSearch={(term) => authors.filter(a => a.slug.includes(term.toLowerCase()) || a.translations.some(tr => tr.name.toLowerCase().includes(term.toLowerCase())))}
        onEdit={(a) => { setSelectedAuthor(a); setShowEditModal(true); }}
        onDelete={(a) => { setSelectedAuthor(a); setShowDeleteModal(true); }}
        onCreate={() => setShowCreateModal(true)}
        onRestore={handleRestore}
        getItemKey={(item) => item.id}
        isDeleted={(item) => item.isDeleted}
        showTrash={true}
        showingTrash={showTrash}
        onToggleTrash={() => setShowTrash(!showTrash)}
        createButtonText="Nuevo Autor"
      />

      <EditModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} title="Crear Nuevo Autor" fields={createFields} submitButtonText="Crear" submitButtonColor="green" />
      <EditModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedAuthor(null); }} onSubmit={handleUpdate} title="Editar Autor" fields={editFields} submitButtonText="Actualizar" submitButtonColor="amber" />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedAuthor(null); }}
        onConfirm={handleDelete}
        title="Eliminar Autor"
        itemName={selectedAuthor?.getName('es') || ''}
        itemDetails={selectedAuthor ? [{ label: 'Slug', value: selectedAuthor.slug }, { label: 'Idiomas', value: selectedAuthor.translations.map(t => t.languageCode.toUpperCase()).join(', ') }] : []}
        showHardDeleteOption={selectedAuthor?.isDeleted || false}
      />
    </UnifiedLayout>
  );
}
