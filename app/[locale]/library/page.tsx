/**
 * ============================================
 * Library Page - Biblioteca
 * @file app/[locale]/library/page.tsx
 * @description Pagina principal de biblioteca estilo Netflix/VIX
 * Carruseles horizontales por categoria y coleccion
 * TODAS las traducciones son dinamicas
 * ============================================
 */

'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  Trophy,
  Sparkles,
  Clock,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

// Layout y background
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { HomeBackground } from '@/src/presentation/features/home';

// Componentes de biblioteca
import {
  LibraryHero,
  CategoryPills,
  BookCarouselRow,
  BookCarouselRowSkeleton,
} from '@/src/presentation/features/library';

// Hooks
import { useLibrary } from '@/src/presentation/features/library/hooks/useLibrary';
import { useLibraryCarousels } from '@/src/presentation/features/library/hooks/useLibraryCarousels';

// Componentes de exploración para búsqueda
import { BookGrid } from '@/src/presentation/features/explore/components/BookGrid';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const LibraryPage: React.FC = () => {
  const router = useRouter();

  // Hooks de la biblioteca
  const {
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
  } = useLibraryCarousels(categories);

  // Navegacion al lector
  const handleBookSelect = useCallback(
    (bookId: string) => {
      router.push(`/books/${bookId}/read`);
    },
    [router]
  );

  // Titulos traducidos con fallback
  const featuredTitle = translationsLoading ? 'Destacados de la Semana' : t('sections.featured');
  const topGlobalTitle = translationsLoading ? 'Top 10 Mas Populares' : t('sections.top_global');
  const newArrivalsTitle = translationsLoading ? 'Recien Llegados' : t('sections.new_arrivals');
  const topRatedTitle = translationsLoading ? 'Mejor Valorados' : t('sections.top_rated');
  const categoryPrefixTitle = translationsLoading ? 'Top en' : t('sections.category_prefix');

  // Modo busqueda activo
  const isSearchMode = searchTerm.trim().length > 0;

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
        isLoading={translationsLoading}
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
          <BookGrid
            books={searchResults}
            isLoading={isSearching}
            onBookSelect={handleBookSelect}
            emptyMessage={translationsLoading ? 'No encontramos resultados' : t('empty.no_results')}
            emptySubMessage={translationsLoading ? 'Intenta con otra busqueda' : t('empty.try_again')}
          />
        </div>
      ) : selectedCategory ? (
        // ============================================
        // MODO CATEGORIA SELECCIONADA: Carousel de esa categoria
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

          {/* Tambien mostrar las filas genericas */}
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

          {/* Top 10 Global - con numeros grandes */}
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

          {/* Skeletons si aun carga */}
          {isLoadingCarousels && (
            <>
              <BookCarouselRowSkeleton />
              <BookCarouselRowSkeleton />
            </>
          )}
        </div>
      )}
    </UnifiedLayout>
  );
};

export default LibraryPage;
