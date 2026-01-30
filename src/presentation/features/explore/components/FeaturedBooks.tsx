/**
 * ============================================
 * COMPONENTE: FeaturedBooks
 * Sección de libros destacados
 * Carrusel horizontal con cards grandes
 * TODAS las traducciones son dinamicas
 * ============================================
 */

'use client';

import React, { memo, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Star, BookOpen } from 'lucide-react';
import { BookExtended } from '@/src/core/domain/entities/BookExtended';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// TIPOS
// ============================================

interface FeaturedBooksProps {
  books: BookExtended[];
  isLoading: boolean;
  onBookSelect: (bookId: string) => void;
}

// ============================================
// FEATURED CARD
// ============================================

const FeaturedCard: React.FC<{
  book: BookExtended;
  onSelect: (bookId: string) => void;
  priority?: boolean;
  featuredLabel: string;
  viewBookLabel: string;
}> = memo(({ book, onSelect, priority = false, featuredLabel, viewBookLabel }) => {
  const primaryCategory = book.getPrimaryCategory();

  return (
    <article
      onClick={() => onSelect(book.id)}
      className="group flex-shrink-0 w-72 md:w-80 cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`${viewBookLabel}: ${book.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(book.id);
        }
      }}
    >
      <div className="relative bg-white rounded-3xl border-4 border-yellow-300 shadow-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-yellow-400">
        {/* Badge destacado */}
        <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Sparkles className="w-3 h-3" />
          {featuredLabel}
        </div>

        {/* Portada */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-blue-300" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3
              className="text-xl font-black leading-tight mb-1 line-clamp-2 drop-shadow-lg"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {book.title}
            </h3>

            {/* Rating */}
            {book.ratingStats && book.ratingStats.totalRatings > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(book.ratingStats!.averageRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-white/50'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-white/80">
                  ({book.ratingStats.totalRatings})
                </span>
              </div>
            )}

            {/* Categoría */}
            {primaryCategory && (
              <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                {primaryCategory.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

FeaturedCard.displayName = 'FeaturedCard';

// ============================================
// SKELETON
// ============================================

export const FeaturedBooksSkeleton: React.FC = memo(() => {
  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Título skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-8 bg-slate-200 rounded-xl w-48 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 md:w-80 bg-white rounded-3xl border-4 border-yellow-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/5] bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturedBooksSkeleton.displayName = 'FeaturedBooksSkeleton';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const FeaturedBooks: React.FC<FeaturedBooksProps> = memo(
  ({ books, isLoading, onBookSelect }) => {
    const { t, loading: translationsLoading } = useSupabaseTranslations('book_explore');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollButtons = useCallback(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    }, []);

    const scroll = useCallback((direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = 340;
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
        setTimeout(checkScrollButtons, 300);
      }
    }, [checkScrollButtons]);

    // Obtener textos traducidos (con fallback mientras carga)
    const sectionTitle = translationsLoading ? 'Libros Destacados' : t('featured.title');
    const featuredLabel = translationsLoading ? 'Destacado' : t('featured.badge');
    const previousLabel = translationsLoading ? 'Anterior' : t('featured.previous');
    const nextLabel = translationsLoading ? 'Siguiente' : t('featured.next');
    const viewBookLabel = translationsLoading ? 'Ver libro' : t('featured.view_book');

    // No mostrar si está cargando o no hay libros
    if (isLoading || translationsLoading) {
      return <FeaturedBooksSkeleton />;
    }

    if (books.length === 0) {
      return null;
    }

    return (
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2
                className="text-2xl md:text-3xl font-black text-white drop-shadow-lg"
                style={{
                  fontFamily: 'Comic Sans MS, cursive',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                }}
              >
                {sectionTitle}
              </h2>
            </div>

            {/* Botones de navegación */}
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2.5 rounded-full bg-white shadow-lg border-2 border-yellow-300 transition-all ${
                  canScrollLeft
                    ? 'hover:scale-110 hover:bg-yellow-50'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                aria-label={previousLabel}
              >
                <ChevronLeft className="w-5 h-5 text-blue-700" strokeWidth={3} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-2.5 rounded-full bg-white shadow-lg border-2 border-yellow-300 transition-all ${
                  canScrollRight
                    ? 'hover:scale-110 hover:bg-yellow-50'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                aria-label={nextLabel}
              >
                <ChevronRight className="w-5 h-5 text-blue-700" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Carrusel */}
          <div
            ref={scrollRef}
            onScroll={checkScrollButtons}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {books.map((book, index) => (
              <FeaturedCard
                key={book.id}
                book={book}
                onSelect={onBookSelect}
                priority={index < 2}
                featuredLabel={featuredLabel}
                viewBookLabel={viewBookLabel}
              />
            ))}
          </div>
        </div>

        {/* Ocultar scrollbar con CSS */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>
    );
  }
);

FeaturedBooks.displayName = 'FeaturedBooks';

export default FeaturedBooks;
