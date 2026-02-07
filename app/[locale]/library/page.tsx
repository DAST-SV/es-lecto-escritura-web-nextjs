/**
 * ============================================
 * Library Page - Biblioteca
 * @file app/[locale]/library/page.tsx
 * @description Pagina principal de biblioteca estilo Netflix/VIX
 * Carruseles horizontales por categoria y coleccion
 * TODAS las traducciones son dinamicas y locale-aware
 * ============================================
 */

'use client';

import React, { useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  Trophy,
  Sparkles,
  Clock,
  TrendingUp,
  BookOpen,
  SearchX,
} from 'lucide-react';

import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { HomeBackground } from '@/src/presentation/features/home';
import { LibraryBook } from '@/src/infrastructure/repositories/books/BookLibraryRepository';

import {
  LibraryHero,
  CategoryPills,
  BookCarouselRow,
  BookCarouselRowSkeleton,
} from '@/src/presentation/features/library';

import { useLibrary } from '@/src/presentation/features/library/hooks/useLibrary';
import { useLibraryCarousels } from '@/src/presentation/features/library/hooks/useLibraryCarousels';

// ============================================
// SEARCH RESULT CARD (inline, usa LibraryBook)
// ============================================

const SearchResultCard: React.FC<{
  book: LibraryBook;
  onSelect: (id: string) => void;
  readLabel: string;
}> = memo(({ book, onSelect, readLabel }) => (
  <article
    onClick={() => onSelect(book.id)}
    className="group cursor-pointer bg-white rounded-2xl border-2 border-yellow-200 shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-yellow-400"
  >
    {/* Portada */}
    <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200">
          <div className="text-center p-4">
            <BookOpen className="w-12 h-12 text-blue-300 mx-auto mb-2" />
            <p className="text-blue-400 font-bold text-sm line-clamp-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {book.title}
            </p>
          </div>
        </div>
      )}

      {/* Badges */}
      {book.isFeatured && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Sparkles className="w-3 h-3" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <div
          className="w-full py-2 bg-yellow-300 text-blue-700 font-black text-sm rounded-full text-center shadow-lg border-2 border-white"
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
        >
          {readLabel}
        </div>
      </div>
    </div>

    {/* Info */}
    <div className="p-3 space-y-1">
      <h3 className="text-sm font-bold text-blue-800 line-clamp-2 leading-tight" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
        {book.title}
      </h3>
      {book.categoryName && (
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 border border-blue-200">
          {book.categoryName}
        </span>
      )}
    </div>
  </article>
));

SearchResultCard.displayName = 'SearchResultCard';

// ============================================
// EMPTY STATE
// ============================================

const EmptyState: React.FC<{ title: string; subtitle: string }> = memo(({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="relative mb-6">
      <div className="absolute -inset-4 bg-gradient-to-r from-yellow-200 via-blue-200 to-purple-200 rounded-full blur-xl opacity-60" />
      <div className="relative bg-white rounded-full p-6 shadow-xl border-4 border-yellow-300">
        <SearchX className="w-16 h-16 text-blue-400" />
      </div>
    </div>
    <h3
      className="text-2xl font-black text-white text-center mb-2 drop-shadow-lg"
      style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}
    >
      {title}
    </h3>
    <p className="text-white/80 text-center max-w-md font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
      {subtitle}
    </p>
    <div className="flex items-center gap-2 mt-4">
      <div className="h-1.5 w-10 bg-yellow-300 rounded-full" />
      <div className="h-1.5 w-6 bg-green-300 rounded-full" />
      <div className="h-1.5 w-4 bg-blue-300 rounded-full" />
    </div>
  </div>
));

EmptyState.displayName = 'EmptyState';

// ============================================
// SEARCH GRID SKELETON
// ============================================

const SearchGridSkeleton: React.FC = memo(() => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="bg-white rounded-2xl border-2 border-yellow-200 overflow-hidden animate-pulse">
        <div className="aspect-[2/3] bg-gradient-to-br from-blue-100 to-purple-100" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded-full w-1/2" />
        </div>
      </div>
    ))}
  </div>
));

SearchGridSkeleton.displayName = 'SearchGridSkeleton';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const LibraryPage: React.FC = () => {
  const router = useRouter();

  const {
    locale,
    categories,
    isLoadingCategories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    t,
    loading: translationsLoading,
  } = useLibrary();

  const {
    featuredBooks,
    topBooks,
    newBooks,
    topRatedBooks,
    categoryBooks,
    isLoading: isLoadingCarousels,
  } = useLibraryCarousels(categories, locale);

  const handleBookSelect = useCallback(
    (bookId: string) => {
      router.push(`/books/${bookId}/read`);
    },
    [router]
  );

  // Titulos traducidos
  const featuredTitle = translationsLoading ? 'Destacados de la Semana' : t('sections.featured');
  const topGlobalTitle = translationsLoading ? 'Top 10 Mas Populares' : t('sections.top_global');
  const newArrivalsTitle = translationsLoading ? 'Recien Llegados' : t('sections.new_arrivals');
  const topRatedTitle = translationsLoading ? 'Mejor Valorados' : t('sections.top_rated');
  const categoryPrefixTitle = translationsLoading ? 'Top en' : t('sections.category_prefix');
  const readLabel = translationsLoading ? 'Leer ahora' : t('card.read');

  const isSearchMode = searchTerm.trim().length > 0;

  // Conteo total de libros
  const totalBooks = categories.reduce((sum, cat) => sum + cat.bookCount, 0);

  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      {/* Hero con busqueda */}
      <LibraryHero
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        totalBooks={totalBooks || undefined}
        totalCategories={categories.length || undefined}
        isLoading={translationsLoading || isLoadingCategories}
      />

      {/* Categorias - pills horizontales */}
      <div className="container mx-auto max-w-7xl">
        <CategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          isLoading={isLoadingCategories}
        />
      </div>

      {/* Contenido */}
      {isSearchMode ? (
        // ============================================
        // MODO BUSQUEDA: Grid de resultados
        // ============================================
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Titulo de resultados */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h2
              className="text-xl md:text-2xl font-black text-white drop-shadow-lg"
              style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}
            >
              {translationsLoading ? 'Resultados para' : t('search.results_for')} &ldquo;{searchTerm}&rdquo;
            </h2>
          </div>

          {isSearching ? (
            <SearchGridSkeleton />
          ) : searchResults.length === 0 ? (
            <EmptyState
              title={translationsLoading ? 'No encontramos resultados' : t('empty.no_results')}
              subtitle={translationsLoading ? 'Intenta con otra busqueda' : t('empty.try_again')}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {searchResults.map((book) => (
                <SearchResultCard
                  key={book.id}
                  book={book}
                  onSelect={handleBookSelect}
                  readLabel={readLabel}
                />
              ))}
            </div>
          )}
        </div>
      ) : selectedCategory ? (
        // ============================================
        // MODO CATEGORIA SELECCIONADA
        // ============================================
        <div className="py-4">
          {(() => {
            const cat = categories.find(c => c.id === selectedCategory);
            const books = categoryBooks.get(selectedCategory) || [];
            if (!cat) return null;
            return (
              <BookCarouselRow
                title={`${categoryPrefixTitle} ${cat.name}`}
                icon={<BookOpen className="w-4 h-4 text-white" />}
                books={books}
                isLoading={isLoadingCarousels}
                onBookSelect={handleBookSelect}
              />
            );
          })()}

          {/* Tambien mostrar top global */}
          {topBooks.length > 0 && (
            <BookCarouselRow
              title={topGlobalTitle}
              icon={<TrendingUp className="w-4 h-4 text-white" />}
              books={topBooks}
              isLoading={isLoadingCarousels}
              onBookSelect={handleBookSelect}
              showRanking
            />
          )}

          {/* Nuevos arrivals */}
          {newBooks.length > 0 && (
            <BookCarouselRow
              title={newArrivalsTitle}
              icon={<Clock className="w-4 h-4 text-white" />}
              books={newBooks}
              isLoading={isLoadingCarousels}
              onBookSelect={handleBookSelect}
              markAsNew
            />
          )}
        </div>
      ) : (
        // ============================================
        // MODO NORMAL: Todos los carruseles Netflix-style
        // ============================================
        <div className="py-4 space-y-2">
          {/* Destacados */}
          {featuredBooks.length > 0 && (
            <BookCarouselRow
              title={featuredTitle}
              icon={<Sparkles className="w-4 h-4 text-white" />}
              books={featuredBooks}
              isLoading={isLoadingCarousels}
              onBookSelect={handleBookSelect}
            />
          )}

          {/* Top 10 Global */}
          {topBooks.length > 0 && (
            <BookCarouselRow
              title={topGlobalTitle}
              icon={<Trophy className="w-4 h-4 text-white" />}
              books={topBooks}
              isLoading={isLoadingCarousels}
              onBookSelect={handleBookSelect}
              showRanking
            />
          )}

          {/* Nuevos */}
          {newBooks.length > 0 && (
            <BookCarouselRow
              title={newArrivalsTitle}
              icon={<Clock className="w-4 h-4 text-white" />}
              books={newBooks}
              isLoading={isLoadingCarousels}
              onBookSelect={handleBookSelect}
              markAsNew
            />
          )}

          {/* Carruseles por categoria */}
          {categories.slice(0, 5).map((cat) => {
            const books = categoryBooks.get(cat.id);
            if (!books || books.length === 0) return null;
            return (
              <BookCarouselRow
                key={cat.id}
                title={`${categoryPrefixTitle} ${cat.name}`}
                icon={<BookOpen className="w-4 h-4 text-white" />}
                books={books}
                isLoading={false}
                onBookSelect={handleBookSelect}
              />
            );
          })}

          {/* Mejor valorados */}
          {topRatedBooks.length > 0 && (
            <BookCarouselRow
              title={topRatedTitle}
              icon={<Star className="w-4 h-4 text-white" />}
              books={topRatedBooks}
              isLoading={isLoadingCarousels}
              onBookSelect={handleBookSelect}
            />
          )}

          {/* Skeletons mientras carga */}
          {isLoadingCarousels && (
            <>
              <BookCarouselRowSkeleton />
              <BookCarouselRowSkeleton />
              <BookCarouselRowSkeleton />
            </>
          )}

          {/* Estado vacio cuando no hay libros */}
          {!isLoadingCarousels && featuredBooks.length === 0 && topBooks.length === 0 && newBooks.length === 0 && (
            <EmptyState
              title={translationsLoading ? 'Aun no hay libros disponibles' : t('empty.no_books')}
              subtitle={translationsLoading ? 'Pronto agregaremos mas contenido' : t('empty.no_books_subtitle')}
            />
          )}
        </div>
      )}
    </UnifiedLayout>
  );
};

export default LibraryPage;
