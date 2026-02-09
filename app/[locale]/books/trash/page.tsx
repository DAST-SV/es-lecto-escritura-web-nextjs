/**
 * UBICACION: app/[locale]/books/trash/page.tsx
 * Papelera - Con traducciones dinamicas y estilos de HomePage
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Book,
  Archive,
  RotateCcw,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  X,
  CheckSquare,
  Square
} from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { RestoreBookUseCase } from '@/src/core/application/use-cases/books/RestoreBook.usecase';
import { HardDeleteBookUseCase } from '@/src/core/application/use-cases/books/HardDeleteBook.usecase';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { HomeBackground } from '@/src/presentation/features/home';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import toast, { Toaster } from 'react-hot-toast';

interface TrashedBook {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  deleted_at: string;
}

// Tipo para la traducción
interface BookTranslation {
  title: string;
  description: string | null;
}

export default function TrashPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const { t, loading: translationsLoading } = useSupabaseTranslations('books_trash');

  const [books, setBooks] = useState<TrashedBook[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<TrashedBook | null>(null);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Textos con fallback mientras cargan traducciones
  const loadingText = translationsLoading ? 'Cargando papelera...' : t('loading');
  const titleText = translationsLoading ? 'Papelera' : t('title');
  const backText = translationsLoading ? 'Volver a biblioteca' : t('back');
  const emptyTitleText = translationsLoading ? 'La papelera esta vacia' : t('empty_title');
  const emptySubtitleText = translationsLoading ? 'No hay libros eliminados' : t('empty_subtitle');
  const noteText = translationsLoading ? 'Los libros se eliminaran automaticamente despues de 30 dias.' : t('note');
  const countSingleText = translationsLoading ? 'libro eliminado' : t('count_single');
  const countPluralText = translationsLoading ? 'libros eliminados' : t('count_plural');
  const selectAllText = translationsLoading ? 'Seleccionar todo' : t('select_all');
  const deselectAllText = translationsLoading ? 'Deseleccionar todo' : t('deselect_all');
  const restoreSelectedText = translationsLoading ? 'Restaurar seleccionados' : t('restore_selected');
  const restoreAllText = translationsLoading ? 'Restaurar todos' : t('restore_all');
  const emptyTrashText = translationsLoading ? 'Vaciar papelera' : t('empty_trash');
  const daysLeftText = translationsLoading ? 'dias' : t('days_left');
  const lastDayText = translationsLoading ? 'Ultimo dia' : t('last_day');
  const restoreText = translationsLoading ? 'Restaurar' : t('actions.restore');
  const deleteModalTitleText = translationsLoading ? 'Eliminar permanentemente?' : t('delete_modal.title');
  const deleteModalMessageText = translationsLoading ? 'de forma permanente. Esta accion NO SE PUEDE DESHACER y se eliminaran todos los archivos asociados.' : t('delete_modal.message');
  const cancelText = translationsLoading ? 'Cancelar' : t('delete_modal.cancel');
  const confirmDeleteText = translationsLoading ? 'Eliminar para siempre' : t('delete_modal.confirm');
  const deletingText = translationsLoading ? 'Eliminando...' : t('delete_modal.deleting');
  const emptyModalTitleText = translationsLoading ? 'Vaciar papelera?' : t('empty_modal.title');
  const emptyModalMessageText = translationsLoading ? 'Estas por eliminar TODOS los libros de la papelera de forma permanente.' : t('empty_modal.message');
  const emptyModalWarningText = translationsLoading ? 'Esta accion NO SE PUEDE DESHACER y eliminara todos los archivos asociados.' : t('empty_modal.warning');
  const emptyingText = translationsLoading ? 'Vaciando...' : t('empty_modal.emptying');
  const toastRestoredText = translationsLoading ? 'Libro restaurado' : t('toast.restored');
  const toastRestoredPluralText = translationsLoading ? 'libros restaurados' : t('toast.restored_plural');
  const toastDeletedText = translationsLoading ? 'Libro eliminado permanentemente' : t('toast.deleted');
  const toastDeletedPluralText = translationsLoading ? 'libros eliminados permanentemente' : t('toast.deleted_plural');
  const toastErrorRestoreText = translationsLoading ? 'Error restaurando' : t('toast.error_restore');
  const toastErrorDeleteText = translationsLoading ? 'Error eliminando' : t('toast.error_delete');
  const toastErrorLoadText = translationsLoading ? 'Error al cargar la papelera' : t('toast.error_load');
  const toastNoSelectedText = translationsLoading ? 'No hay libros seleccionados' : t('toast.no_selected');

  useEffect(() => {
    loadTrashedBooks();
  }, [locale]);

  async function loadTrashedBooks() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      // Cargar libros eliminados (schema books, columna created_by)
      const { data: booksData, error: booksError } = await supabase
        .schema('books')
        .from('books')
        .select('id, deleted_at')
        .eq('created_by', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (booksError) throw booksError;

      if (!booksData || booksData.length === 0) {
        setBooks([]);
        setIsLoading(false);
        return;
      }

      // Cargar traducciones para cada libro (incluyendo cover_url por idioma)
      const bookIds = booksData.map(b => b.id);
      const { data: translationsData } = await supabase
        .schema('books')
        .from('book_translations')
        .select('book_id, title, description, cover_url, language_code, is_primary')
        .in('book_id', bookIds);

      // Mapear traducciones por book_id: preferir idioma actual, fallback a primaria
      const transMap = new Map<string, BookTranslation & { cover_url: string | null }>();
      const localeMatched = new Set<string>();
      translationsData?.forEach(tr => {
        if (tr.language_code === locale) {
          transMap.set(tr.book_id, { title: tr.title, description: tr.description, cover_url: tr.cover_url });
          localeMatched.add(tr.book_id);
        } else if (tr.is_primary && !localeMatched.has(tr.book_id)) {
          transMap.set(tr.book_id, { title: tr.title, description: tr.description, cover_url: tr.cover_url });
        } else if (!transMap.has(tr.book_id)) {
          transMap.set(tr.book_id, { title: tr.title, description: tr.description, cover_url: tr.cover_url });
        }
      });

      // Combinar datos
      const trashedBooks: TrashedBook[] = booksData.map(book => {
        const trans = transMap.get(book.id);
        return {
          id: book.id,
          title: trans?.title || 'Sin título',
          description: trans?.description || null,
          cover_url: trans?.cover_url || null,
          deleted_at: book.deleted_at!,
        };
      });

      setBooks(trashedBooks);
      setIsLoading(false);
    } catch (error) {
      console.error('Error cargando papelera:', error);
      toast.error(toastErrorLoadText);
      setIsLoading(false);
    }
  }

  const toggleSelectBook = (bookId: string) => {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBooks(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedBooks.size === books.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(books.map(b => b.id)));
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedBooks.size === 0) {
      toast.error(toastNoSelectedText);
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const bookId of selectedBooks) {
      try {
        await RestoreBookUseCase.execute(bookId);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} ${successCount === 1 ? toastRestoredText : toastRestoredPluralText}`);
      await loadTrashedBooks();
      setSelectedBooks(new Set());
    }

    if (errorCount > 0) {
      toast.error(`${toastErrorRestoreText} ${errorCount} ${errorCount === 1 ? countSingleText : countPluralText}`);
    }

    setIsProcessing(false);
  };

  const handleRestoreAll = async () => {
    if (books.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const book of books) {
      try {
        await RestoreBookUseCase.execute(book.id);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} ${successCount === 1 ? toastRestoredText : toastRestoredPluralText}`);
      await loadTrashedBooks();
    }

    if (errorCount > 0) {
      toast.error(`${toastErrorRestoreText} ${errorCount} ${errorCount === 1 ? countSingleText : countPluralText}`);
    }

    setIsProcessing(false);
  };

  const handlePermanentDeleteClick = (book: TrashedBook) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!bookToDelete) return;

    setIsProcessing(true);
    try {
      await HardDeleteBookUseCase.execute(bookToDelete.id);
      await loadTrashedBooks();
      toast.success(toastDeletedText);
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (error: any) {
      toast.error(error.message || toastErrorDeleteText);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (books.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const book of books) {
      try {
        await HardDeleteBookUseCase.execute(book.id);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} ${successCount === 1 ? toastDeletedText : toastDeletedPluralText}`);
      await loadTrashedBooks();
    }

    if (errorCount > 0) {
      toast.error(`${toastErrorDeleteText} ${errorCount} ${errorCount === 1 ? countSingleText : countPluralText}`);
    }

    setShowEmptyTrashModal(false);
    setIsProcessing(false);
  };

  const getDaysInTrash = (deletedAt: string) => {
    const deleted = new Date(deletedAt);
    const now = new Date();
    const diff = now.getTime() - deleted.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <UnifiedLayout
        className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
        mainClassName="pt-0"
        backgroundComponent={<HomeBackground />}
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-4 border-yellow-300">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p
              className="text-blue-700 font-bold text-lg"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {loadingText}
            </p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      <Toaster position="top-right" />

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push(`/${locale}/my-world`)}
              className="flex items-center gap-2 text-white hover:text-yellow-300 mb-4 transition-colors font-bold"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              <ArrowLeft size={20} />
              {backText}
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-4 border-yellow-300 shadow-xl">
                <h1
                  className="text-4xl font-black text-blue-700 flex items-center gap-3"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                    <Archive size={28} className="text-slate-600" />
                  </div>
                  {titleText}
                  {books.length > 0 && (
                    <span className="px-4 py-1.5 bg-red-100 text-red-600 text-xl rounded-full font-bold">
                      {books.length}
                    </span>
                  )}
                </h1>
                <p
                  className="text-blue-600 mt-2 font-medium"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {books.length === 0 ? emptySubtitleText : `${books.length} ${books.length === 1 ? countSingleText : countPluralText}`}
                </p>
              </div>

              {books.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-slate-700 rounded-full font-bold transition-all duration-300 shadow-lg border-2 border-slate-300 hover:scale-105"
                    disabled={isProcessing}
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    {selectedBooks.size === books.length ? <CheckSquare size={18} /> : <Square size={18} />}
                    {selectedBooks.size === books.length ? deselectAllText : selectAllText}
                  </button>

                  {selectedBooks.size > 0 && (
                    <button
                      onClick={handleRestoreSelected}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold transition-all duration-300 shadow-lg hover:scale-105"
                      disabled={isProcessing}
                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                    >
                      <RotateCcw size={18} />
                      {restoreSelectedText} ({selectedBooks.size})
                    </button>
                  )}

                  <button
                    onClick={handleRestoreAll}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold transition-all duration-300 shadow-lg hover:scale-105"
                    disabled={isProcessing}
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    <RotateCcw size={18} />
                    {restoreAllText}
                  </button>

                  <button
                    onClick={() => setShowEmptyTrashModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-all duration-300 shadow-lg hover:scale-105"
                    disabled={isProcessing}
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    <Trash2 size={18} />
                    {emptyTrashText}
                  </button>
                </div>
              )}
            </div>

            {books.length > 0 && (
              <div className="p-4 bg-amber-100/90 backdrop-blur-sm border-4 border-amber-300 rounded-2xl shadow-lg">
                <p
                  className="text-amber-800 font-bold"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {noteText}
                </p>
              </div>
            )}
          </div>

          {/* Lista */}
          {books.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 border-4 border-yellow-300 shadow-xl max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Archive size={48} className="text-gray-400" />
                </div>
                <h3
                  className="text-2xl font-black text-blue-700 mb-2"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {emptyTitleText}
                </h3>
                <p
                  className="text-blue-600 mb-6 font-medium"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {emptySubtitleText}
                </p>
                <button
                  onClick={() => router.push(`/${locale}/my-world`)}
                  className="px-8 py-3.5 bg-yellow-300 text-blue-700 font-black rounded-full shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {backText}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => {
                const daysInTrash = getDaysInTrash(book.deleted_at);
                const daysLeft = 30 - daysInTrash;
                const isSelected = selectedBooks.has(book.id);

                return (
                  <div
                    key={book.id}
                    className={`bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative border-4 ${
                      isSelected ? 'border-blue-500 ring-4 ring-blue-200' : 'border-yellow-300'
                    }`}
                  >
                    {/* Checkbox de seleccion */}
                    <button
                      onClick={() => toggleSelectBook(book.id)}
                      className="absolute top-3 left-3 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-200"
                    >
                      {isSelected ? (
                        <CheckSquare size={22} className="text-blue-600" />
                      ) : (
                        <Square size={22} className="text-gray-400" />
                      )}
                    </button>

                    <div className="aspect-[3/4] relative">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-full object-cover opacity-75"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <Book size={48} className="text-slate-400" />
                        </div>
                      )}

                      <div
                        className="absolute top-3 right-3 bg-red-500 text-white text-sm px-3 py-1.5 rounded-full font-bold shadow-lg"
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        {daysLeft > 0 ? `${daysLeft} ${daysLeftText}` : lastDayText}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3
                        className="text-xl font-black text-blue-700 mb-2 line-clamp-2"
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        {book.title}
                      </h3>

                      {book.description && (
                        <p
                          className="text-sm text-blue-500 line-clamp-2 mb-4"
                          style={{ fontFamily: 'Comic Sans MS, cursive' }}
                        >
                          {book.description}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setIsProcessing(true);
                            try {
                              await RestoreBookUseCase.execute(book.id);
                              await loadTrashedBooks();
                              toast.success(toastRestoredText);
                            } catch (error: any) {
                              toast.error(error.message);
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-300 font-bold disabled:opacity-50 hover:scale-105"
                          style={{ fontFamily: 'Comic Sans MS, cursive' }}
                        >
                          <RotateCcw size={16} />
                          {restoreText}
                        </button>

                        <button
                          onClick={() => handlePermanentDeleteClick(book)}
                          disabled={isProcessing}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-300 disabled:opacity-50 hover:scale-105"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal eliminar permanentemente UN libro */}
      {showDeleteModal && bookToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-4 border-red-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-red-600" />
              </div>

              <div className="flex-1">
                <h3
                  className="text-xl font-black text-red-700 mb-2"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {deleteModalTitleText}
                </h3>
                <p
                  className="text-gray-600 text-sm"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  "<strong>{bookToDelete.title}</strong>" {deleteModalMessageText}
                </p>
              </div>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isProcessing}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-colors disabled:opacity-50"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                {cancelText}
              </button>

              <button
                onClick={handleConfirmPermanentDelete}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {deletingText}
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    {confirmDeleteText}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal VACIAR PAPELERA */}
      {showEmptyTrashModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-4 border-red-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-red-600" />
              </div>

              <div className="flex-1">
                <h3
                  className="text-xl font-black text-red-700 mb-2"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {emptyModalTitleText}
                </h3>
                <p
                  className="text-gray-600 text-sm mb-3"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {emptyModalMessageText.replace('TODOS los', `TODOS los ${books.length}`)}
                </p>
                <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p
                    className="text-xs text-red-800 font-bold"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    {emptyModalWarningText}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEmptyTrashModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isProcessing}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEmptyTrashModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-colors disabled:opacity-50"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                {cancelText}
              </button>

              <button
                onClick={handleEmptyTrash}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {emptyingText}
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    {emptyTrashText}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </UnifiedLayout>
  );
}
