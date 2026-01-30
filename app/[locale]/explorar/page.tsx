/**
 * ============================================
 * PÁGINA: Explorar Libros
 * /[locale]/explorar
 * Página pública para explorar y buscar libros
 * TODAS las traducciones son dinamicas
 * ============================================
 */

'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Layout y background
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { HomeBackground } from '@/src/presentation/features/home';

// Componentes de exploración
import {
  ExploreHero,
  FeaturedBooks,
  BookFilters,
  BookGrid,
  useBookExplore,
} from '@/src/presentation/features/explore';

// Traducciones
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ExplorePage: React.FC = () => {
  const router = useRouter();
  const { t, loading: translationsLoading } = useSupabaseTranslations('book_explore');

  // Hook principal de exploración
  const {
    books,
    featuredBooks,
    totalResults,
    hasMore,
    isLoading,
    isLoadingMore,
    isLoadingCatalogs,
    error,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    searchTerm,
    setSearchTerm,
    categories,
    genres,
    levels,
    loadMore,
  } = useBookExplore();

  // Navegación al detalle del libro
  const handleBookSelect = useCallback(
    (bookId: string) => {
      router.push(`/books/${bookId}/read`);
    },
    [router]
  );

  // Determinar si mostrar destacados (solo sin filtros activos)
  const showFeatured = !hasActiveFilters && !searchTerm && featuredBooks.length > 0;

  // Textos traducidos (con fallback mientras carga)
  const loadingText = translationsLoading ? 'Cargando...' : t('loading');
  const loadMoreText = translationsLoading ? 'Cargar más libros' : t('load_more');
  const endResultsText = translationsLoading ? '¡Has visto todos los libros!' : t('end_results');
  const emptyMessageText = translationsLoading ? 'No se encontraron libros' : t('results.empty');
  const emptyFilteredText = translationsLoading ? 'Intenta ajustar los filtros' : t('results.empty_filtered');
  const emptyDefaultText = translationsLoading ? 'Aún no hay libros publicados' : t('results.empty_default');

  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      {/* Hero con búsqueda */}
      <ExploreHero
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        totalResults={totalResults}
        isLoading={isLoading}
      />

      {/* Sección de destacados (solo sin filtros) */}
      {showFeatured && (
        <FeaturedBooks
          books={featuredBooks}
          isLoading={isLoading}
          onBookSelect={handleBookSelect}
        />
      )}

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros - Sidebar en desktop */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <BookFilters
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={clearFilters}
                categories={categories}
                genres={genres}
                levels={levels}
                isLoading={isLoadingCatalogs}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </aside>

          {/* Grid de resultados */}
          <main className="flex-1 min-w-0">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-2xl text-red-700 font-bold text-center">
                {error}
              </div>
            )}

            {/* Grid de libros */}
            <BookGrid
              books={books}
              isLoading={isLoading}
              onBookSelect={handleBookSelect}
              emptyMessage={emptyMessageText}
              emptySubMessage={
                hasActiveFilters
                  ? emptyFilteredText
                  : emptyDefaultText
              }
            />

            {/* Boton cargar mas */}
            {hasMore && !isLoading && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="group relative px-8 py-4 bg-yellow-300 text-blue-700 font-black text-lg rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-4 border-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {isLoadingMore ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {loadingText}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {loadMoreText}
                      <span className="text-sm bg-white/50 px-2 py-0.5 rounded-full">
                        +{Math.min(12, totalResults - books.length)}
                      </span>
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Indicador de fin de resultados */}
            {!hasMore && books.length > 0 && !isLoading && (
              <div className="text-center mt-10">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border-2 border-yellow-300">
                  <span
                    className="text-blue-700 font-bold"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    {endResultsText}
                  </span>
                  <span className="text-2xl">🎉</span>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default ExplorePage;
