/**
 * UBICACION: app/[locale]/my-world/page.tsx
 * Mi Mundo - Hub personal del usuario
 * Lectura (progreso, favoritos) + Escritura (mis libros, crear, papelera)
 * Estilo consistente con HomePage: mismos colores, skeleton, traducciones dinamicas
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { routing } from '@/src/infrastructure/config/routing.config';
import {
  BookOpen,
  PenTool,
  Heart,
  Play,
  Plus,
  Archive,
  Search,
  X,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { SoftDeleteBookUseCase } from '@/src/core/application/use-cases/books/SoftDeleteBook.usecase';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { HomeBackground } from '@/src/presentation/features/home';
import { useMyWorld } from '@/src/presentation/features/my-world/hooks/useMyWorld';
import { MyWorldHero, MyWorldHeroSkeleton } from '@/src/presentation/features/my-world/components/MyWorldHero';
import { MyWorldTabs } from '@/src/presentation/features/my-world/components/MyWorldTabs';
import { MyWorldCarouselRow, MyWorldCarouselRowSkeleton } from '@/src/presentation/features/my-world/components/MyWorldCarouselRow';
import { ContinueReadingCard } from '@/src/presentation/features/my-world/components/ContinueReadingCard';
import { WriterBookCard } from '@/src/presentation/features/my-world/components/WriterBookCard';
import { FavoriteBookCard } from '@/src/presentation/features/my-world/components/FavoriteBookCard';
import { AuthoredBook } from '@/src/infrastructure/repositories/my-world/MyWorldRepository';
import toast, { Toaster } from 'react-hot-toast';

// ============================================
// PAGE SKELETON
// ============================================

function MyWorldPageSkeleton() {
  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      <MyWorldHeroSkeleton />
      {/* Tabs skeleton */}
      <div className="flex justify-center py-4 px-4">
        <div className="h-14 w-72 bg-white/30 rounded-full animate-pulse" />
      </div>
      <MyWorldCarouselRowSkeleton />
      <MyWorldCarouselRowSkeleton />
      <MyWorldCarouselRowSkeleton />
    </UnifiedLayout>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function MyWorldPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = typeof params?.locale === 'string' ? params.locale : routing.defaultLocale;
  const supabase = createClient();

  const {
    activeTab,
    setActiveTab,
    isLoading,
    translationsLoading,
    t,
    // Reader
    booksInProgress,
    favoriteBooks,
    // Writer
    authoredBooks,
    publishedBooks,
    draftBooks,
    trashCount,
    refreshAuthoredBooks,
    // Stats
    stats,
  } = useMyWorld(locale);

  // Writer state
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<AuthoredBook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [writerSearch, setWriterSearch] = useState('');
  const [writerFilter, setWriterFilter] = useState<'all' | 'draft' | 'published'>('all');

  // Texts with fallbacks
  const txt = useCallback((key: string, fallback: string) =>
    translationsLoading ? fallback : t(key), [translationsLoading, t]);

  // Filtered writer books
  const filteredWriterBooks = useMemo(() => {
    let result = authoredBooks;

    if (writerFilter === 'draft') {
      result = result.filter(b => b.status === 'draft' || b.status === 'pending');
    } else if (writerFilter === 'published') {
      result = result.filter(b => b.status === 'published');
    }

    if (writerSearch.trim()) {
      const q = writerSearch.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [authoredBooks, writerFilter, writerSearch]);

  // Writer stats
  const writerStats = useMemo(() => ({
    total: authoredBooks.length,
    drafts: authoredBooks.filter(b => b.status === 'draft' || b.status === 'pending').length,
    published: authoredBooks.filter(b => b.status === 'published').length,
    totalViews: authoredBooks.reduce((sum, b) => sum + b.viewCount, 0),
  }), [authoredBooks]);

  // ============================================
  // ACTIONS
  // ============================================

  const handleBookSelect = useCallback((bookId: string) => {
    router.push(`/${locale}/library/read/${bookId}`);
  }, [router, locale]);

  const handleReadBook = useCallback((bookId: string) => {
    router.push(`/${locale}/books/${bookId}/read`);
  }, [router, locale]);

  const handleEditBook = useCallback((bookId: string) => {
    router.push(`/${locale}/books/${bookId}/edit`);
  }, [router, locale]);

  const handleStatsBook = useCallback((bookId: string) => {
    router.push(`/${locale}/books/${bookId}/statistics`);
  }, [router, locale]);

  const handlePublish = useCallback(async (book: AuthoredBook) => {
    setIsPublishing(book.id);
    try {
      const newStatus = book.status === 'published' ? 'draft' : 'published';
      const updateData: Record<string, any> = {
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

      await refreshAuthoredBooks();
      toast.success(newStatus === 'published'
        ? txt('toast.published', 'Libro publicado exitosamente')
        : txt('toast.unpublished', 'Libro despublicado'));
    } catch {
      toast.error(txt('toast.error_status', 'Error al cambiar estado'));
    } finally {
      setIsPublishing(null);
    }
  }, [supabase, refreshAuthoredBooks, txt]);

  const handleTrashClick = useCallback((book: AuthoredBook) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      await SoftDeleteBookUseCase.execute(bookToDelete.id);
      await refreshAuthoredBooks();
      toast.success(txt('toast.moved_to_trash', 'Libro movido a papelera'));
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Error');
    } finally {
      setIsDeleting(false);
    }
  }, [bookToDelete, refreshAuthoredBooks, txt]);

  // Writer card labels
  const writerCardLabels = useMemo(() => ({
    read: txt('card.read', 'Leer'),
    edit: txt('card.edit', 'Editar'),
    publish: txt('card.publish', 'Publicar'),
    unpublish: txt('card.unpublish', 'Despublicar'),
    stats: txt('card.stats', 'Estadisticas'),
    moveToTrash: txt('card.move_to_trash', 'Mover a papelera'),
    views: txt('card.views', 'vistas'),
    pages: txt('card.pages', 'paginas'),
    statusDraft: txt('status.draft', 'Borrador'),
    statusPending: txt('status.pending', 'En revision'),
    statusPublished: txt('status.published', 'Publicado'),
    statusArchived: txt('status.archived', 'Archivado'),
  }), [txt]);

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return <MyWorldPageSkeleton />;
  }

  // ============================================
  // READER TAB CONTENT
  // ============================================

  const ReaderContent = () => {
    const hasAnyReaderContent = booksInProgress.length > 0 || favoriteBooks.length > 0;

    if (!hasAnyReaderContent) {
      return (
        <div className="text-center py-16 px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 border-4 border-yellow-300 shadow-xl max-w-md mx-auto">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={48} className="text-yellow-500" />
            </div>
            <h3 className="text-2xl font-black text-blue-700 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {txt('empty.reader_title', 'Tu mundo esta vacio')}
            </h3>
            <p className="text-blue-600 mb-6 font-medium" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {txt('empty.reader_subtitle', 'Explora la biblioteca y comienza a leer')}
            </p>
            <button
              onClick={() => router.push(`/${locale}/library`)}
              className="px-8 py-3.5 bg-yellow-300 text-blue-700 font-black rounded-full shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {txt('empty.explore_library', 'Explorar biblioteca')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Continua leyendo */}
        <MyWorldCarouselRow
          title={txt('sections.continue_reading', 'Leer mas adelante')}
          icon={<Play className="w-4 h-4 text-white" />}
          isEmpty={booksInProgress.length === 0}
          emptyMessage={txt('empty.no_progress', 'No tienes libros para leer mas adelante')}
          emptyIcon={<BookOpen className="w-10 h-10 text-white/50" />}
          previousLabel={txt('carousel.previous', 'Anterior')}
          nextLabel={txt('carousel.next', 'Siguiente')}
        >
          {booksInProgress.map((book, i) => (
            <ContinueReadingCard
              key={book.id}
              book={book}
              onSelect={handleBookSelect}
              continueLabel={txt('card.continue', 'Continuar')}
              progressLabel={txt('card.progress_label', 'progreso')}
              priority={i < 3}
            />
          ))}
        </MyWorldCarouselRow>

        {/* Favoritos */}
        <MyWorldCarouselRow
          title={txt('sections.favorites', 'Mis Favoritos')}
          icon={<Heart className="w-4 h-4 text-white" />}
          isEmpty={favoriteBooks.length === 0}
          emptyMessage={txt('empty.no_favorites', 'Aun no tienes favoritos')}
          emptyIcon={<Heart className="w-10 h-10 text-white/50" />}
          previousLabel={txt('carousel.previous', 'Anterior')}
          nextLabel={txt('carousel.next', 'Siguiente')}
        >
          {favoriteBooks.map((book, i) => (
            <FavoriteBookCard
              key={book.id}
              book={book}
              onSelect={handleBookSelect}
              readLabel={txt('card.read', 'Leer')}
              variant="favorite"
              priority={i < 3}
            />
          ))}
        </MyWorldCarouselRow>
      </>
    );
  };

  // ============================================
  // WRITER TAB CONTENT
  // ============================================

  const WriterContent = () => {
    const hasWriterBooks = authoredBooks.length > 0;

    return (
      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-7xl">
          {/* Writer header: crear libro + papelera */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-yellow-200 shadow-md">
                <span className="text-sm font-bold text-blue-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {writerStats.total} {txt('writer.total', 'total')}
                </span>
                <span className="text-sm text-slate-400">|</span>
                <span className="text-sm font-bold text-emerald-600" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {writerStats.published} {txt('status.published', 'publicados')}
                </span>
                <span className="text-sm text-slate-400">|</span>
                <span className="text-sm font-bold text-purple-600 flex items-center gap-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <Eye className="w-3.5 h-3.5" />
                  {writerStats.totalViews} {txt('writer.views', 'vistas')}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/${locale}/books/trash`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-slate-700 rounded-full font-bold transition-all duration-300 shadow-lg border-2 border-slate-200 hover:scale-105 relative"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                <Archive size={18} />
                {txt('writer.trash', 'Papelera')}
                {trashCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {trashCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => router.push(`/${locale}/books/create`)}
                className="flex items-center gap-2 px-6 py-2.5 bg-yellow-300 text-blue-700 font-black rounded-full shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                <Plus size={18} />
                {txt('writer.create_new', 'Crear Nuevo Libro')}
              </button>
            </div>
          </div>

          {!hasWriterBooks ? (
            /* Empty writer state */
            <div className="text-center py-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 border-4 border-yellow-300 shadow-xl max-w-md mx-auto">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PenTool size={48} className="text-purple-500" />
                </div>
                <h3 className="text-2xl font-black text-blue-700 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {txt('writer.no_books', 'Aun no has escrito ningun libro')}
                </h3>
                <p className="text-blue-600 mb-6 font-medium" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {txt('writer.start_writing', 'Comienza a escribir tu primer libro')}
                </p>
                <button
                  onClick={() => router.push(`/${locale}/books/create`)}
                  className="px-8 py-3.5 bg-yellow-300 text-blue-700 font-black rounded-full shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {txt('writer.create_new', 'Crear Nuevo Libro')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search + filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                    <Search size={16} className="text-blue-700" />
                  </div>
                  <input
                    type="text"
                    placeholder={txt('writer.search_placeholder', 'Buscar en mis libros...')}
                    value={writerSearch}
                    onChange={(e) => setWriterSearch(e.target.value)}
                    className="w-full pl-14 pr-10 py-3 bg-white border-2 border-yellow-200 rounded-full focus:outline-none focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 text-blue-700 font-medium shadow-md text-sm"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  />
                  {writerSearch && (
                    <button
                      onClick={() => setWriterSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={14} className="text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5 bg-white rounded-full p-1 border-2 border-yellow-200 shadow-md">
                  {[
                    { key: 'all' as const, label: txt('writer.filter_all', 'Todos') },
                    { key: 'draft' as const, label: txt('writer.filter_drafts', 'Borradores') },
                    { key: 'published' as const, label: txt('writer.filter_published', 'Publicados') },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setWriterFilter(f.key)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        writerFilter === f.key
                          ? 'bg-yellow-300 text-blue-700 shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Books grid - horizontal scroll on mobile, grid on desktop */}
              {filteredWriterBooks.length === 0 ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-10 text-center border-2 border-white/30">
                  <p className="text-white/80 font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {writerSearch
                      ? txt('empty.no_progress', 'No se encontraron libros')
                      : txt('writer.no_books', 'Aun no has escrito ningun libro')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredWriterBooks.map((book, i) => (
                    <WriterBookCard
                      key={book.id}
                      book={book}
                      onRead={handleReadBook}
                      onEdit={handleEditBook}
                      onPublish={handlePublish}
                      onStats={handleStatsBook}
                      onTrash={handleTrashClick}
                      isPublishing={isPublishing === book.id}
                      labels={writerCardLabels}
                      priority={i < 6}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      <Toaster position="top-right" />

      {/* Hero */}
      <MyWorldHero stats={stats} t={t} translationsLoading={translationsLoading} />

      {/* Tabs */}
      <MyWorldTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        t={t}
        translationsLoading={translationsLoading}
      />

      {/* Content */}
      <div className="pb-12">
        {activeTab === 'reader' ? <ReaderContent /> : <WriterContent />}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && bookToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-4 border-yellow-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-blue-700 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {txt('modal.delete_title', 'Mover a papelera?')}
                </h3>
                <p className="text-blue-600 text-sm" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  &ldquo;<strong>{bookToDelete.title}</strong>&rdquo; {txt('modal.delete_message', 'se movera a la papelera. Podras restaurarlo durante 30 dias.')}
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
                {txt('modal.cancel', 'Cancelar')}
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
                    {txt('modal.moving', 'Moviendo...')}
                  </>
                ) : (
                  <>
                    <Archive size={16} />
                    {txt('modal.confirm_delete', 'Mover a papelera')}
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
