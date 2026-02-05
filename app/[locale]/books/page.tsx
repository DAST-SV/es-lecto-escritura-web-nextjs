/**
 * UBICACIÓN: app/[locale]/books/page.tsx
 * Mis Libros - Panel del escritor con gestión completa
 * - Ver libros en borrador, publicados, archivados
 * - Publicar/despublicar libros
 * - Editar, eliminar, ver estadísticas
 * - Estilos consistentes con HomePage
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Archive,
  Globe,
  FileText,
  Clock,
  Send,
  EyeOff,
  Filter,
  MoreVertical,
  BarChart2,
  Settings,
  CheckCircle,
} from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { SoftDeleteBookUseCase } from '@/src/core/application/use-cases/books/SoftDeleteBook.usecase';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { HomeBackground } from '@/src/presentation/features/home';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import toast, { Toaster } from 'react-hot-toast';

type BookStatus = 'draft' | 'pending' | 'published' | 'archived';

interface BookItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_url: string | null;
  status: BookStatus;
  page_count: number;
  view_count: number;
  is_premium: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
  level_name?: string;
}

const STATUS_CONFIG: Record<BookStatus, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  draft: { label: 'Borrador', color: 'text-slate-600', icon: <FileText size={14} />, bg: 'bg-slate-100' },
  pending: { label: 'En revisión', color: 'text-amber-600', icon: <Clock size={14} />, bg: 'bg-amber-100' },
  published: { label: 'Publicado', color: 'text-emerald-600', icon: <Globe size={14} />, bg: 'bg-emerald-100' },
  archived: { label: 'Archivado', color: 'text-gray-500', icon: <Archive size={14} />, bg: 'bg-gray-100' },
};

export default function BooksListPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const newBookId = searchParams?.get('new');
  const supabase = createClient();
  const { t, loading: translationsLoading } = useSupabaseTranslations('books_library');

  const [books, setBooks] = useState<BookItem[]>([]);
  const [trashCount, setTrashCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<BookItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  const bookRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Textos con fallback
  const loadingText = translationsLoading ? 'Cargando tus libros...' : t('loading');
  const titleText = translationsLoading ? 'Mis Libros' : t('title');
  const createBookText = translationsLoading ? 'Nuevo Libro' : t('create_book');

  // Cargar libros del escritor
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/${locale}/auth/login`);
          return;
        }

        // Cargar libros activos del schema books con traducciones
        const { data: booksData, error: booksError } = await supabase
          .schema('books')
          .from('books')
          .select(`
            id,
            slug,
            cover_url,
            status,
            page_count,
            view_count,
            is_premium,
            is_featured,
            published_at,
            created_at,
            updated_at,
            category_id,
            level_id
          `)
          .eq('created_by', user.id)
          .is('deleted_at', null)
          .order('updated_at', { ascending: false });

        if (booksError) {
          console.error('Error loading books:', booksError);
          throw booksError;
        }

        // Cargar traducciones para cada libro (incluyendo portada por idioma)
        const bookIds = booksData?.map(b => b.id) || [];
        let translationsData: any[] = [];

        if (bookIds.length > 0) {
          const { data: trans } = await supabase
            .schema('books')
            .from('book_translations')
            .select('book_id, title, description, cover_url, is_primary')
            .in('book_id', bookIds);

          translationsData = trans || [];
        }

        // Mapear traducciones: preferir idioma actual, fallback a primaria
        const transMap = new Map<string, { title: string; description: string; cover_url: string | null }>();
        translationsData.forEach(t => {
          const existing = transMap.get(t.book_id);
          // Si es el idioma actual o no hay existente, usar esta traducción
          if (!existing || t.language_code === locale) {
            transMap.set(t.book_id, {
              title: t.title,
              description: t.description,
              cover_url: t.cover_url,
            });
          } else if (t.is_primary && !existing) {
            // Si es primaria y no hay existente, usarla como fallback
            transMap.set(t.book_id, {
              title: t.title,
              description: t.description,
              cover_url: t.cover_url,
            });
          }
        });

        const libros: BookItem[] = (booksData || []).map((book) => {
          const trans = transMap.get(book.id);
          return {
            id: book.id,
            slug: book.slug,
            title: trans?.title || book.slug || 'Sin título',
            description: trans?.description || '',
            // Portada: primero del idioma (trans), fallback a la global del libro
            cover_url: trans?.cover_url || book.cover_url,
            status: book.status as BookStatus,
            page_count: book.page_count || 0,
            view_count: book.view_count || 0,
            is_premium: book.is_premium || false,
            is_featured: book.is_featured || false,
            published_at: book.published_at,
            created_at: book.created_at,
            updated_at: book.updated_at,
          };
        });

        setBooks(libros);

        // Contar libros en papelera
        const { count } = await supabase
          .schema('books')
          .from('books')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)
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

  // Scroll automático al libro recién creado
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

  // Filtrar libros
  const filteredBooks = useMemo(() => {
    let result = books;

    // Filtro por estado
    if (statusFilter !== 'all') {
      result = result.filter(book => book.status === statusFilter);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [books, statusFilter, searchQuery]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: books.length,
    draft: books.filter(b => b.status === 'draft').length,
    published: books.filter(b => b.status === 'published').length,
    pending: books.filter(b => b.status === 'pending').length,
    totalViews: books.reduce((sum, b) => sum + b.view_count, 0),
  }), [books]);

  // Acciones
  const handleRead = (bookId: string) => {
    router.push(`/${locale}/books/${bookId}/read`);
  };

  const handleEdit = (bookId: string) => {
    router.push(`/${locale}/books/${bookId}/edit`);
  };

  const handleStats = (bookId: string) => {
    router.push(`/${locale}/books/${bookId}/statistics`);
  };

  const handleDeleteClick = (book: BookItem) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
    setActiveMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    setIsDeleting(true);
    try {
      await SoftDeleteBookUseCase.execute(bookToDelete.id);

      setBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
      setTrashCount(prev => prev + 1);

      toast.success('Libro movido a la papelera');
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (error: any) {
      console.error('Error eliminando libro:', error);
      toast.error(error.message || 'Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async (book: BookItem) => {
    setIsPublishing(book.id);
    try {
      const newStatus = book.status === 'published' ? 'draft' : 'published';
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .schema('books')
        .from('books')
        .update(updateData)
        .eq('id', book.id);

      if (error) throw error;

      setBooks(prev => prev.map(b =>
        b.id === book.id
          ? { ...b, status: newStatus, published_at: updateData.published_at || b.published_at }
          : b
      ));

      toast.success(newStatus === 'published' ? 'Libro publicado' : 'Libro despublicado');
    } catch (error: any) {
      console.error('Error actualizando estado:', error);
      toast.error('Error al cambiar estado');
    } finally {
      setIsPublishing(null);
      setActiveMenuId(null);
    }
  };

  // Loading
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
            <p className="text-blue-700 font-bold text-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
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
          {/* Header con estadísticas */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              {/* Título y stats */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-4 border-yellow-300 shadow-xl">
                <h1 className="text-4xl font-black text-blue-700 flex items-center gap-3" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center">
                    <Book size={28} className="text-blue-700" />
                  </div>
                  {titleText}
                </h1>
                <div className="flex flex-wrap gap-4 mt-3 text-sm" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <span className="flex items-center gap-1 text-blue-600">
                    <FileText size={14} />
                    {stats.total} total
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock size={14} />
                    {stats.draft} borradores
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Globe size={14} />
                    {stats.published} publicados
                  </span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <Eye size={14} />
                    {stats.totalViews} vistas
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/${locale}/books/trash`)}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-slate-700 rounded-full font-bold transition-all duration-300 shadow-lg border-2 border-slate-300 hover:scale-105 relative"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <Archive size={20} />
                  Papelera
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

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center">
                  <Search size={20} className="text-blue-700" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por título..."
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

              {/* Filtros por estado */}
              <div className="flex gap-2 bg-white rounded-full p-1.5 border-4 border-yellow-300 shadow-lg">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === 'all'
                      ? 'bg-yellow-300 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === 'draft'
                      ? 'bg-slate-200 text-slate-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Borradores
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === 'published'
                      ? 'bg-emerald-200 text-emerald-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Publicados
                </button>
              </div>

              {/* Vista Grid/List */}
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

          {/* Lista de libros */}
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 border-4 border-yellow-300 shadow-xl max-w-md mx-auto">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Book size={48} className="text-yellow-500" />
                </div>
                <h3 className="text-2xl font-black text-blue-700 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {searchQuery || statusFilter !== 'all' ? 'No se encontraron libros' : 'No tienes libros aún'}
                </h3>
                <p className="text-blue-600 mb-6 font-medium" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {searchQuery || statusFilter !== 'all'
                    ? 'Intenta con otros filtros'
                    : 'Comienza creando tu primer libro'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <button
                    onClick={() => router.push(`/${locale}/books/create`)}
                    className="px-8 py-3.5 bg-yellow-300 text-blue-700 font-black rounded-full shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    Crear mi primer libro
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
                  {/* Portada */}
                  <div className={`relative ${viewMode === 'list' ? 'w-32 flex-shrink-0' : 'aspect-[3/4]'}`}>
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
                    {/* Badge de estado */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_CONFIG[book.status].bg} ${STATUS_CONFIG[book.status].color}`}>
                      {STATUS_CONFIG[book.status].icon}
                      {STATUS_CONFIG[book.status].label}
                    </div>
                    {book.is_premium && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-bold">
                        Premium
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-blue-700 mb-1 line-clamp-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      {book.title}
                    </h3>

                    {book.description && (
                      <p className="text-sm text-blue-500 line-clamp-2 mb-3 flex-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {book.description}
                      </p>
                    )}

                    {/* Métricas */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      {book.page_count > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText size={12} />
                          {book.page_count} págs
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {book.view_count} vistas
                      </span>
                      {book.published_at && (
                        <span className="flex items-center gap-1">
                          <CheckCircle size={12} className="text-emerald-500" />
                          Publicado
                        </span>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRead(book.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-blue-700 rounded-full transition-all duration-300 font-bold hover:scale-105"
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        <Eye size={16} />
                        Leer
                      </button>

                      <button
                        onClick={() => handleEdit(book.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-300 hover:scale-105"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Menú de más opciones */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === book.id ? null : book.id);
                          }}
                          className="flex items-center justify-center px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all duration-300"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenuId === book.id && (
                          <>
                            {/* Overlay para cerrar menú */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePublish(book);
                                }}
                                disabled={isPublishing === book.id}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                              >
                                {isPublishing === book.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : book.status === 'published' ? (
                                  <EyeOff size={14} />
                                ) : (
                                  <Send size={14} />
                                )}
                                {book.status === 'published' ? 'Despublicar' : 'Publicar'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleStats(book.id);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <BarChart2 size={14} />
                                Estadísticas
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(book);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                Mover a papelera
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de eliminación */}
      {showDeleteModal && bookToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-4 border-yellow-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} className="text-amber-600" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-black text-blue-700 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  ¿Mover a papelera?
                </h3>
                <p className="text-blue-600 text-sm" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  "<strong>{bookToDelete.title}</strong>" se moverá a la papelera. Podrás restaurarlo durante 30 días.
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
                Cancelar
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
