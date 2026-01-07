/**
 * UBICACIÓN: app/[locale]/books/page.tsx
 * ✅ LISTA: Con contador de papelera en el botón
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  Book, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Grid, 
  List, 
  Plus,
  Loader2,
  AlertCircle,
  X,
  Archive
} from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import { SoftDeleteBookUseCase } from '@/src/core/application/use-cases/books/SoftDeleteBook.usecase';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import toast, { Toaster } from 'react-hot-toast';

interface BookItem {
  id: string;
  title: string;
  authors: string[];
  description: string;
  cover_url: string | null;
  created_at: string;
}

export default function BooksListPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const newBookId = searchParams?.get('new');
  const supabase = createClient();

  const [books, setBooks] = useState<BookItem[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookItem[]>([]);
  const [trashCount, setTrashCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<BookItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const bookRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Cargar libros y contador de papelera
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }

        // Cargar libros activos
        const { data, error } = await supabase
          .from('books')
          .select('id, title, description, cover_url, created_at')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const libros: BookItem[] = (data || []).map((book: any) => ({
          id: book.id,
          title: book.title || 'Sin título',
          authors: [],
          description: book.description || '',
          cover_url: book.cover_url,
          created_at: book.created_at
        }));

        setBooks(libros);
        setFilteredBooks(libros);

        // Cargar contador de papelera
        const { count } = await supabase
          .from('books')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('deleted_at', 'is', null);

        setTrashCount(count || 0);
        setIsLoading(false);
      } catch (error) {
        console.error('Error cargando libros:', error);
        toast.error('Error al cargar los libros');
        setIsLoading(false);
      }
    }

    loadData();
  }, [supabase, router, locale]);

  // Scroll automático
  useEffect(() => {
    if (newBookId && books.length > 0 && bookRefs.current[newBookId]) {
      const timer = setTimeout(() => {
        const element = bookRefs.current[newBookId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-amber-400', 'ring-opacity-75');
          
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-amber-400', 'ring-opacity-75');
          }, 3000);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [newBookId, books]);

  // Búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.authors.some(autor => autor.toLowerCase().includes(query)) ||
        (book.description && book.description.toLowerCase().includes(query))
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const handleRead = (bookId: string) => {
    router.push(`/${locale}/books/${bookId}/read`);
  };

  const handleEdit = (bookId: string) => {
    router.push(`/${locale}/books/${bookId}/edit`);
  };

  const handleDeleteClick = (book: BookItem) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    setIsDeleting(true);
    try {
      await SoftDeleteBookUseCase.execute(bookToDelete.id);
      
      setBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
      setFilteredBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
      setTrashCount(prev => prev + 1);
      
      toast.success('Libro movido a la papelera');
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (error: any) {
      console.error('Error eliminando libro:', error);
      toast.error(error.message || 'Error al eliminar el libro');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <Book size={40} className="text-indigo-600" />
                  Mi Biblioteca
                </h1>
                <p className="text-gray-600 mt-2">
                  {books.length} {books.length === 1 ? 'libro' : 'libros'} en total
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/${locale}/books/trash`)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors shadow-lg relative"
                >
                  <Archive size={20} />
                  Papelera
                  {trashCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {trashCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => router.push(`/${locale}/books/create`)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg"
                >
                  <Plus size={20} />
                  Crear Libro
                </button>
              </div>
            </div>

            {/* Búsqueda y controles */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, autor o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Lista */}
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Book size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No se encontraron libros' : 'No tienes libros aún'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Comienza creando tu primer libro'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push(`/${locale}/books/create`)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                  Crear mi primer libro
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
            }>
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  ref={(el) => { bookRefs.current[book.id] = el; }}
                  className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={viewMode === 'list' ? 'w-32 flex-shrink-0' : 'aspect-[3/4]'}>
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <Book size={48} className="text-indigo-300" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    
                    {book.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {book.description}
                      </p>
                    )}

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleRead(book.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye size={16} />
                        Leer
                      </button>
                      
                      <button
                        onClick={() => handleEdit(book.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(book)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showDeleteModal && bookToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} className="text-amber-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Mover a papelera?
                </h3>
                <p className="text-gray-600 text-sm">
                  "<strong>{bookToDelete.title}</strong>" se moverá a la papelera. 
                  Podrás restaurarlo durante 30 días.
                </p>
              </div>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isDeleting}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Moviendo...
                  </>
                ) : (
                  <>
                    <Archive size={16} />
                    Mover a papelera
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