// ============================================
// app/[locale]/admin/books-management/page.tsx
// ✅ CRUD COMPLETO: Gestión de Libros con pestañas por idioma
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, BookOpen, Eye, Star, Crown, Globe } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useBooksAdminManager } from '@/src/presentation/features/books-admin/hooks/useBooksAdminManager';
import { BookAdmin } from '@/src/core/domain/entities/BookAdmin';
import { BookEditModal } from '@/src/presentation/features/books-admin/components/BookEditModal';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';
import { useLanguagesManager } from '@/src/presentation/features/languages/hooks/useLanguagesManager';
import { useBookCategoriesManager } from '@/src/presentation/features/book-categories/hooks/useBookCategoriesManager';
import { useBookLevelsManager } from '@/src/presentation/features/book-levels/hooks/useBookLevelsManager';
import { useBookGenresManager } from '@/src/presentation/features/book-genres/hooks/useBookGenresManager';
import { useBookTagsManager } from '@/src/presentation/features/book-tags/hooks/useBookTagsManager';
import { useBookAuthorsManager } from '@/src/presentation/features/book-authors/hooks/useBookAuthorsManager';

export default function BooksManagementPage() {
  const { books, loading, error, create, update, softDelete, restore, hardDelete, publish, unpublish, refresh } = useBooksAdminManager();
  const { languages } = useLanguagesManager();
  const { categories } = useBookCategoriesManager();
  const { levels } = useBookLevelsManager();
  const { genres } = useBookGenresManager();
  const { tags } = useBookTagsManager();
  const { authors } = useBookAuthorsManager();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookAdmin | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const handleCreate = async (data: any) => {
    try {
      await create(data);
      toast.success('Libro creado exitosamente');
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      if (!selectedBook) return;
      await update(selectedBook.id, data);
      toast.success('Libro actualizado exitosamente');
      setShowEditModal(false);
      setSelectedBook(null);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleDelete = async (hardDeleteOption: boolean) => {
    try {
      if (!selectedBook) return;
      if (hardDeleteOption) {
        await hardDelete(selectedBook.id);
        toast.success('Libro eliminado permanentemente');
      } else {
        await softDelete(selectedBook.id);
        toast.success('Libro movido a la papelera');
      }
      setShowDeleteModal(false);
      setSelectedBook(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRestore = async (book: BookAdmin) => {
    try {
      await restore(book.id);
      toast.success('Libro restaurado');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePublish = async (book: BookAdmin) => {
    try {
      if (book.isPublished) {
        await unpublish(book.id);
        toast.success('Libro despublicado');
      } else {
        await publish(book.id);
        toast.success('Libro publicado');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getStatusBadge = (book: BookAdmin) => {
    if (book.isDeleted) return { text: '🗑️ Eliminado', className: 'bg-red-100 text-red-700' };
    switch (book.status) {
      case 'published': return { text: '✅ Publicado', className: 'bg-emerald-100 text-emerald-700' };
      case 'review': return { text: '👁️ En revisión', className: 'bg-amber-100 text-amber-700' };
      case 'archived': return { text: '📦 Archivado', className: 'bg-slate-100 text-slate-600' };
      default: return { text: '📝 Borrador', className: 'bg-blue-100 text-blue-700' };
    }
  };

  const columns: Column<BookAdmin>[] = [
    {
      key: 'cover', label: 'Portada', width: '80px', align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center">
          {item.coverUrl ? (
            <img src={item.coverUrl} alt={item.getTitle('es')} className="w-12 h-16 rounded-lg object-cover shadow-sm" />
          ) : (
            <div className="w-12 h-16 rounded-lg bg-indigo-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-500" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'title', label: 'Título', align: 'left',
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{item.getTitle('es')}</span>
            {item.isFeatured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
            {item.isPremium && <Crown className="w-4 h-4 text-purple-500" />}
          </div>
          <span className="text-xs text-slate-500">{item.getAuthorsDisplay()}</span>
        </div>
      ),
    },
    {
      key: 'category', label: 'Categoría', width: '140px', align: 'left',
      render: (item) => (
        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
          {item.categoryName || 'Sin categoría'}
        </span>
      ),
    },
    {
      key: 'translations', label: 'Idiomas', width: '120px', align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1">
          {item.translations.slice(0, 3).map((t) => (
            <span
              key={t.languageCode}
              className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                t.isPrimary ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-400' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t.languageCode.toUpperCase()}
            </span>
          ))}
          {item.translations.length > 3 && (
            <span className="text-xs text-slate-500">+{item.translations.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'difficulty', label: 'Dificultad', width: '100px', align: 'center',
      render: (item) => {
        const diffMap: Record<string, { text: string; className: string }> = {
          beginner: { text: '🌱 Fácil', className: 'bg-green-100 text-green-700' },
          intermediate: { text: '🌿 Medio', className: 'bg-yellow-100 text-yellow-700' },
          advanced: { text: '🌳 Difícil', className: 'bg-red-100 text-red-700' },
        };
        const diff = diffMap[item.difficulty] || diffMap.beginner;
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diff.className}`}>{diff.text}</span>;
      },
    },
    {
      key: 'stats', label: 'Stats', width: '100px', align: 'center',
      render: (item) => (
        <div className="flex flex-col items-center gap-0.5 text-xs text-slate-500">
          <span><Eye className="w-3 h-3 inline mr-1" />{item.viewCount}</span>
          <span>{item.pageCount} págs</span>
        </div>
      ),
    },
    {
      key: 'status', label: 'Estado', width: '120px', align: 'center',
      render: (item) => {
        const badge = getStatusBadge(item);
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>{badge.text}</span>;
      },
    },
  ];

  const allDataLoading = loading && books.length === 0;
  const anyLoading = loading || !languages.length || !categories.length;

  if (allDataLoading) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-indigo-400 via-purple-300 to-pink-300">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Cargando libros...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error && books.length === 0) {
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

  const filteredData = showTrash ? books.filter(b => b.isDeleted) : books.filter(b => !b.isDeleted);

  return (
    <UnifiedLayout
      brandName="Libros"
      backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-indigo-400 via-purple-300 to-pink-300" />}
      mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-indigo-400 via-purple-300 to-pink-300 p-2 sm:p-4 lg:p-6"
    >
      <Toaster position="top-right" />

      <DataTable
        title={showTrash ? 'Libros Eliminados' : 'Gestión de Libros'}
        data={filteredData}
        columns={columns}
        onSearch={(term) => books.filter(b =>
          b.slug.includes(term.toLowerCase()) ||
          b.translations.some(t => t.title.toLowerCase().includes(term.toLowerCase()))
        )}
        onEdit={(b) => { setSelectedBook(b); setShowEditModal(true); }}
        onDelete={(b) => { setSelectedBook(b); setShowDeleteModal(true); }}
        onCreate={() => setShowCreateModal(true)}
        onRestore={handleRestore}
        getItemKey={(item) => item.id}
        isDeleted={(item) => item.isDeleted}
        showTrash={true}
        showingTrash={showTrash}
        onToggleTrash={() => setShowTrash(!showTrash)}
        createButtonText="Nuevo Libro"
        customActions={[
          {
            label: (item) => item.isPublished ? 'Despublicar' : 'Publicar',
            onClick: handlePublish,
            icon: (item) => item.isPublished ? '📤' : '📥',
            show: (item) => !item.isDeleted,
          },
        ]}
      />

      {/* Create Modal */}
      <BookEditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        book={null}
        languages={languages}
        categories={categories}
        levels={levels}
        genres={genres}
        tags={tags}
        authors={authors}
        isCreating={true}
      />

      {/* Edit Modal */}
      <BookEditModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedBook(null); }}
        onSubmit={handleUpdate}
        book={selectedBook}
        languages={languages}
        categories={categories}
        levels={levels}
        genres={genres}
        tags={tags}
        authors={authors}
        isCreating={false}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedBook(null); }}
        onConfirm={handleDelete}
        title="Eliminar Libro"
        itemName={selectedBook?.getTitle('es') || ''}
        itemDetails={selectedBook ? [
          { label: 'Slug', value: selectedBook.slug },
          { label: 'Categoría', value: selectedBook.categoryName || 'N/A' },
          { label: 'Idiomas', value: selectedBook.translations.map(t => t.languageCode.toUpperCase()).join(', ') },
        ] : []}
        showHardDeleteOption={selectedBook?.isDeleted || false}
      />
    </UnifiedLayout>
  );
}
