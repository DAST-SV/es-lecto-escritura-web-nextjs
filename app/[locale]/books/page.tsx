/**
 * UBICACION: app/[locale]/books/page.tsx
 * Mi Biblioteca - Con traducciones dinamicas y estilos de HomePage
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
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { SoftDeleteBookUseCase } from '@/src/core/application/use-cases/books/SoftDeleteBook.usecase';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { HomeBackground } from '@/src/presentation/features/home';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
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
  const { t, loading: translationsLoading } = useSupabaseTranslations('books_library');

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

  // Textos con fallback mientras cargan traducciones
  const loadingText = translationsLoading ? 'Cargando tu biblioteca...' : t('loading');
  const titleText = translationsLoading ? 'Mi Biblioteca' : t('title');
  const trashText = translationsLoading ? 'Papelera' : t('trash');
  const createBookText = translationsLoading ? 'Crear Libro' : t('create_book');
  const searchPlaceholder = translationsLoading ? 'Buscar por titulo, autor o descripcion...' : t('search_placeholder');
  const noBooksTitleText = translationsLoading ? 'No tienes libros aun' : t('no_books_title');
  const noBooksSubtitleText = translationsLoading ? 'Comienza creando tu primer libro' : t('no_books_subtitle');
  const noResultsTitleText = translationsLoading ? 'No se encontraron libros' : t('no_results_title');
  const noResultsSubtitleText = translationsLoading ? 'Intenta con otros terminos de busqueda' : t('no_results_subtitle');
  const createFirstBookText = translationsLoading ? 'Crear mi primer libro' : t('create_first_book');
  const readText = translationsLoading ? 'Leer' : t('actions.read');
  const deleteModalTitleText = translationsLoading ? 'Mover a papelera?' : t('delete_modal.title');
  const deleteModalMessageText = translationsLoading ? 'se movera a la papelera. Podras restaurarlo durante 30 dias.' : t('delete_modal.message');
  const cancelText = translationsLoading ? 'Cancelar' : t('delete_modal.cancel');
  const confirmDeleteText = translationsLoading ? 'Mover a papelera' : t('delete_modal.confirm');
  const movingText = translationsLoading ? 'Moviendo...' : t('delete_modal.moving');
  const toastDeletedText = translationsLoading ? 'Libro movido a la papelera' : t('toast.deleted');
  const toastErrorText = translationsLoading ? 'Error al cargar los libros' : t('toast.error');
  const noTitleText = translationsLoading ? 'Sin titulo' : t('no_title');
  const subtitleSingular = translationsLoading ? 'libro en total' : t('subtitle_single');
  const subtitlePlural = translationsLoading ? 'libros en total' : t('subtitle_plural');

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
          title: book.title || noTitleText,
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
        toast.error(toastErrorText);
        setIsLoading(false);
      }
    }

    loadData();
  }, [supabase, router, locale, noTitleText, toastErrorText]);

  // Scroll automatico
  useEffect(() => {
    if (newBookId && books.length > 0 && bookRefs.current[newBookId]) {
      const timer = setTimeout(() => {
        const element = bookRefs.current[newBookId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-75');

          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-75');
          }, 3000);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [newBookId, books]);

  // Busqueda
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

      toast.success(toastDeletedText);
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (error: any) {
      console.error('Error eliminando libro:', error);
      toast.error(error.message || t('toast.delete_error'));
    } finally {
      setIsDeleting(false);
    }
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-4 border-yellow-300 shadow-xl">
                <h1
                  className="text-4xl font-black text-blue-700 flex items-center gap-3"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center">
                    <Book size={28} className="text-blue-700" />
                  </div>
                  {titleText}
                </h1>
                <p
                  className="text-blue-600 mt-2 font-medium"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {books.length} {books.length === 1 ? subtitleSingular : subtitlePlural}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/${locale}/books/trash`)}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-slate-700 rounded-full font-bold transition-all duration-300 shadow-lg border-2 border-slate-300 hover:scale-105 relative"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <Archive size={20} />
                  {trashText}
                  {trashCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {trashCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => router.push(`/${locale}/books/create`)}
                  className="flex items-center gap-2 px-8 py-3.5 bg-yellow-300 text-blue-700 font-black rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <Plus size={20} />
                  {createBookText}
                </button>
              </div>
            </div>

            {/* Busqueda y controles */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center">
                  <Search size={20} className="text-blue-700" />
                </div>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-4 py-4 bg-white border-4 border-yellow-300 rounded-full focus:outline-none focus:ring-4 focus:ring-yellow-200 text-blue-700 font-medium shadow-lg"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={16} className="text-gray-600" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 bg-white rounded-full p-1.5 border-4 border-yellow-300 shadow-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-yellow-300 text-blue-700 scale-110'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-yellow-300 text-blue-700 scale-110'
                      : 'text-gray-500 hover:bg-gray-100'
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
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 border-4 border-yellow-300 shadow-xl max-w-md mx-auto">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Book size={48} className="text-yellow-500" />
                </div>
                <h3
                  className="text-2xl font-black text-blue-700 mb-2"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {searchQuery ? noResultsTitleText : noBooksTitleText}
                </h3>
                <p
                  className="text-blue-600 mb-6 font-medium"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {searchQuery ? noResultsSubtitleText : noBooksSubtitleText}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => router.push(`/${locale}/books/create`)}
                    className="px-8 py-3.5 bg-yellow-300 text-blue-700 font-black rounded-full shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    {createFirstBookText}
                  </button>
                )}
              </div>
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
                  className={`bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-yellow-300 hover:scale-[1.02] ${
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
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                        <Book size={48} className="text-blue-300" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1">
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

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleRead(book.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-blue-700 rounded-full transition-all duration-300 font-bold hover:scale-105"
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        <Eye size={16} />
                        {readText}
                      </button>

                      <button
                        onClick={() => handleEdit(book.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-300 hover:scale-105"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(book)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-300 hover:scale-105"
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-4 border-yellow-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} className="text-amber-600" />
              </div>

              <div className="flex-1">
                <h3
                  className="text-xl font-black text-blue-700 mb-2"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {deleteModalTitleText}
                </h3>
                <p
                  className="text-blue-600 text-sm"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  "<strong>{bookToDelete.title}</strong>" {deleteModalMessageText}
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
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-colors disabled:opacity-50"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                {cancelText}
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {movingText}
                  </>
                ) : (
                  <>
                    <Archive size={16} />
                    {confirmDeleteText}
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
