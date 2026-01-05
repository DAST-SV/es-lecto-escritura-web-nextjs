/**
 * UBICACIÓN: app/[locale]/books/page.tsx
 * Página de biblioteca - Lista todos los libros
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  BookOpen, Plus, Search, Filter, Grid, List,
  Edit, Trash2, Eye, Loader2, AlertCircle,
  User, Calendar, BookMarked,
  Upload
} from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import { GetBooksByUserUseCase } from '@/src/core/application/use-cases/books/GetBooksByUser.usecase';
import { DeleteBookUseCase } from '@/src/core/application/use-cases/books/DeleteBook.usecase';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import toast, { Toaster } from 'react-hot-toast';

interface Book {
  id_libro: string;
  titulo: string;
  descripcion: string;
  portada: string | null;
  autores: string[];
  fecha_creacion: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();

  const [books, setBooks] = useState<Book[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOwn, setFilterOwn] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Cargar usuario y libros
  useEffect(() => {
    async function loadData() {
      try {
        // Verificar autenticación
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }

        // Cargar libros del usuario actual
        if (user) {
          const userBooks = await GetBooksByUserUseCase.execute(user.id);
          setBooks(userBooks);
          setAllBooks(userBooks);
        }

        setIsLoading(false);
      } catch (error: any) {
        console.error('Error cargando libros:', error);
        toast.error('Error al cargar los libros');
        setIsLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  // Filtrar libros por búsqueda
  useEffect(() => {
    let filtered = [...allBooks];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book =>
        book.titulo.toLowerCase().includes(query) ||
        book.autores.some(a => a.toLowerCase().includes(query)) ||
        book.descripcion?.toLowerCase().includes(query)
      );
    }

    setBooks(filtered);
  }, [searchQuery, allBooks]);

  // Handlers
  const handleRead = (bookId: string) => {
    router.push(`/${locale}/books/${bookId}/read`);
  };

  const handleEdit = (bookId: string) => {
    router.push(`/${locale}/books/${bookId}/edit`);
  };

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    setDeletingBookId(bookToDelete.id_libro);
    try {
      await DeleteBookUseCase.execute(bookToDelete.id_libro);

      // Actualizar lista local
      setAllBooks(prev => prev.filter(b => b.id_libro !== bookToDelete.id_libro));
      setBooks(prev => prev.filter(b => b.id_libro !== bookToDelete.id_libro));

      toast.success('Libro eliminado correctamente');
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (error: any) {
      console.error('Error eliminando libro:', error);
      toast.error(`Error al eliminar: ${error.message}`);
    } finally {
      setDeletingBookId(null);
    }
  };

  const handleCreateNew = () => {
    router.push(`/${locale}/books/create`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando tu biblioteca...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <BookMarked className="text-indigo-600" size={28} />
                  Mi Biblioteca
                </h1>
                <p className="text-gray-600 mt-1">
                  {books.length} {books.length === 1 ? 'libro' : 'libros'} en tu colección
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/${locale}/books/import-pdf`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-300 transition-all"
                >
                  <Upload size={20} />
                  Importar PDF
                </button>

                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus size={20} />
                  Crear Nuevo Libro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, autor..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
            </div>

            {/* Controles de vista */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de libros */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {books.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'No se encontraron libros' : 'Tu biblioteca está vacía'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? 'Intenta con otros términos de búsqueda'
                  : '¡Crea tu primer libro interactivo ahora!'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                >
                  <Plus size={20} />
                  Crear mi primer libro
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Vista Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book.id_libro}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Portada */}
                  <div
                    className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 cursor-pointer"
                    onClick={() => handleRead(book.id_libro)}
                  >
                    {book.portada ? (
                      <img
                        src={book.portada}
                        alt={book.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={48} className="text-indigo-300" />
                      </div>
                    )}

                    {/* Overlay en hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRead(book.id_libro);
                        }}
                        className="p-3 bg-white rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Leer"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(book.id_libro);
                        }}
                        className="p-3 bg-white rounded-full text-green-600 hover:bg-green-50 transition-colors"
                        title="Editar"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(book);
                        }}
                        className="p-3 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">
                      {book.titulo}
                    </h3>

                    {book.autores.length > 0 && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                        <User size={14} />
                        {book.autores.slice(0, 2).join(', ')}
                        {book.autores.length > 2 && ` +${book.autores.length - 2}`}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(book.fecha_creacion)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Vista Lista */
            <div className="space-y-4">
              {books.map((book) => (
                <div
                  key={book.id_libro}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Miniatura */}
                  <div
                    className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 cursor-pointer"
                    onClick={() => handleRead(book.id_libro)}
                  >
                    {book.portada ? (
                      <img
                        src={book.portada}
                        alt={book.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={24} className="text-indigo-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">
                      {book.titulo}
                    </h3>
                    {book.autores.length > 0 && (
                      <p className="text-sm text-gray-600">
                        {book.autores.join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(book.fecha_creacion)}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRead(book.id_libro)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Leer"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleEdit(book.id_libro)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(book)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Eliminar este libro?
              </h3>

              <p className="text-gray-600 mb-2">
                Estás a punto de eliminar:
              </p>

              <p className="font-semibold text-gray-900 mb-4">
                "{bookToDelete.titulo}"
              </p>

              <p className="text-sm text-red-600 mb-6">
                Esta acción no se puede deshacer.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setBookToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                  disabled={deletingBookId !== null}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletingBookId !== null}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingBookId ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </UnifiedLayout>
  );
}