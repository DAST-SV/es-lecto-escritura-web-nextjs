/**
 * UBICACIÓN: app/[locale]/catalog/page.tsx
 * Catálogo público - Muestra todos los libros disponibles
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  BookOpen, Search, Grid, List, Eye, Loader2, 
  User, Calendar, Library, ChevronLeft, ChevronRight,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';

interface Book {
  id_libro: string;
  titulo: string;
  descripcion: string;
  portada: string | null;
  autores: string[];
  fecha_creacion: string;
  user_id: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CatalogPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();

  const [books, setBooks] = useState<Book[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    }
    checkUser();
  }, [supabase]);

  const loadBooks = useCallback(async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/books/public?${params}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setBooks(data.books || []);
      setPagination(prev => ({
        ...prev,
        ...data.pagination
      }));
    } catch (error: any) {
      console.error('Error cargando libros:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    loadBooks(1, searchQuery);
  }, [searchQuery]);

  const handleRead = (bookId: string) => {
    router.push(`/${locale}/books/${bookId}/read`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handlePageChange = (newPage: number) => {
    loadBooks(newPage, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const isOwnBook = (book: Book) => currentUserId && book.user_id === currentUserId;

  return (
    <UnifiedLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Library size={40} />
                <h1 className="text-4xl font-bold">Catálogo de Libros</h1>
              </div>
              <p className="text-xl text-white/90 mb-8">
                Descubre historias increíbles creadas por nuestra comunidad
              </p>

              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar por título o descripción..."
                    className="w-full pl-12 pr-32 py-4 bg-white text-gray-900 rounded-2xl text-lg focus:ring-4 focus:ring-white/30 shadow-xl"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Buscar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={20} />
              <span className="text-gray-600">
                {pagination.total} {pagination.total === 1 ? 'libro' : 'libros'} disponibles
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
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
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600">Cargando libros...</p>
              </div>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'No se encontraron libros' : 'Aún no hay libros'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Intenta con otros términos de búsqueda'
                  : '¡Sé el primero en crear un libro!'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book.id_libro}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleRead(book.id_libro)}
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
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
                    
                    {isOwnBook(book) && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        Tu libro
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-indigo-600 font-medium text-sm">
                        <Eye size={16} />
                        Leer ahora
                      </span>
                    </div>
                  </div>

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

                    {book.descripcion && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {book.descripcion}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(book.fecha_creacion)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book) => (
                <div
                  key={book.id_libro}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleRead(book.id_libro)}
                >
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                    {book.portada ? (
                      <img
                        src={book.portada}
                        alt={book.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={28} className="text-indigo-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg truncate">
                        {book.titulo}
                      </h3>
                      {isOwnBook(book) && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                          Tu libro
                        </span>
                      )}
                    </div>
                    {book.autores.length > 0 && (
                      <p className="text-sm text-gray-600">
                        {book.autores.join(', ')}
                      </p>
                    )}
                    {book.descripcion && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {book.descripcion}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(book.fecha_creacion)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRead(book.id_libro);
                    }}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors"
                  >
                    <Eye size={18} />
                    Leer
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </UnifiedLayout>
  );
}