/**
 * UBICACIÓN: app/[locale]/books/trash/page.tsx
 * ✅ PAPELERA COMPLETA: Con vaciar papelera
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
import { createClient } from '@/src/utils/supabase/client';
import { RestoreBookUseCase } from '@/src/core/application/use-cases/books/RestoreBook.usecase';
import { HardDeleteBookUseCase } from '@/src/core/application/use-cases/books/HardDeleteBook.usecase';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import toast, { Toaster } from 'react-hot-toast';

interface TrashedBook {
  id: string;
  title: string;
  description: string;
  cover_url: string | null;
  deleted_at: string;
}

export default function TrashPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();

  const [books, setBooks] = useState<TrashedBook[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<TrashedBook | null>(null);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadTrashedBooks();
  }, []);

  async function loadTrashedBooks() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      const { data, error } = await supabase
        .from('books')
        .select('id, title, description, cover_url, deleted_at')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;

      setBooks(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error cargando papelera:', error);
      toast.error('Error al cargar la papelera');
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
      toast.error('No hay libros seleccionados');
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
      toast.success(`${successCount} ${successCount === 1 ? 'libro restaurado' : 'libros restaurados'}`);
      await loadTrashedBooks();
      setSelectedBooks(new Set());
    }

    if (errorCount > 0) {
      toast.error(`Error restaurando ${errorCount} ${errorCount === 1 ? 'libro' : 'libros'}`);
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
      toast.success(`${successCount} ${successCount === 1 ? 'libro restaurado' : 'libros restaurados'}`);
      await loadTrashedBooks();
    }

    if (errorCount > 0) {
      toast.error(`Error restaurando ${errorCount} ${errorCount === 1 ? 'libro' : 'libros'}`);
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
      toast.success('Libro eliminado permanentemente');
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el libro');
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
      toast.success(`${successCount} ${successCount === 1 ? 'libro eliminado' : 'libros eliminados'} permanentemente`);
      await loadTrashedBooks();
    }

    if (errorCount > 0) {
      toast.error(`Error eliminando ${errorCount} ${errorCount === 1 ? 'libro' : 'libros'}`);
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
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-slate-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando papelera...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push(`/${locale}/books`)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a biblioteca
            </button>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <Archive size={40} className="text-slate-600" />
                  Papelera
                  {books.length > 0 && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-lg rounded-full font-semibold">
                      {books.length}
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mt-2">
                  {books.length === 0 ? 'No hay libros eliminados' : `${books.length} ${books.length === 1 ? 'libro eliminado' : 'libros eliminados'}`}
                </p>
              </div>

              {books.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                    disabled={isProcessing}
                  >
                    {selectedBooks.size === books.length ? <CheckSquare size={20} /> : <Square size={20} />}
                    {selectedBooks.size === books.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </button>

                  {selectedBooks.size > 0 && (
                    <button
                      onClick={handleRestoreSelected}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                      disabled={isProcessing}
                    >
                      <RotateCcw size={20} />
                      Restaurar seleccionados ({selectedBooks.size})
                    </button>
                  )}

                  <button
                    onClick={handleRestoreAll}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                    disabled={isProcessing}
                  >
                    <RotateCcw size={20} />
                    Restaurar todos
                  </button>

                  <button
                    onClick={() => setShowEmptyTrashModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                    disabled={isProcessing}
                  >
                    <Trash2 size={20} />
                    Vaciar papelera
                  </button>
                </div>
              )}
            </div>

            {books.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> Los libros se eliminarán automáticamente después de 30 días.
                </p>
              </div>
            )}
          </div>

          {/* Lista */}
          {books.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Archive size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                La papelera está vacía
              </h3>
              <p className="text-gray-600 mb-6">
                No hay libros eliminados
              </p>
              <button
                onClick={() => router.push(`/${locale}/books`)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                Volver a biblioteca
              </button>
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
                    className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative ${
                      isSelected ? 'ring-4 ring-indigo-500' : ''
                    }`}
                  >
                    {/* Checkbox de selección */}
                    <button
                      onClick={() => toggleSelectBook(book.id)}
                      className="absolute top-3 left-3 z-10 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare size={20} className="text-indigo-600" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
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
                      
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-medium">
                        {daysLeft > 0 ? `${daysLeft} días` : 'Último día'}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {book.title}
                      </h3>
                      
                      {book.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
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
                              toast.success('Libro restaurado');
                            } catch (error: any) {
                              toast.error(error.message);
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <RotateCcw size={16} />
                          Restaurar
                        </button>
                        
                        <button
                          onClick={() => handlePermanentDeleteClick(book)}
                          disabled={isProcessing}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Eliminar permanentemente?
                </h3>
                <p className="text-gray-600 text-sm">
                  Estás por eliminar "<strong>{bookToDelete.title}</strong>" de forma permanente. 
                  Esta acción <strong>NO SE PUEDE DESHACER</strong> y se eliminarán todos los archivos asociados.
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
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleConfirmPermanentDelete}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Eliminar para siempre
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Vaciar papelera?
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Estás por eliminar <strong>TODOS los {books.length} libros</strong> de la papelera de forma permanente.
                </p>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-800 font-medium">
                    ⚠️ Esta acción NO SE PUEDE DESHACER y eliminará todos los archivos asociados a estos libros.
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
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleEmptyTrash}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Vaciando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Vaciar papelera
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