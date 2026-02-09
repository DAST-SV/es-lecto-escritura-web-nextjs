// src/presentation/features/library/components/BookCarouselRow.tsx
/**
 * ============================================
 * COMPONENTE: BookCarouselRow
 * Fila horizontal de libros tipo Netflix
 * Scroll suave con botones de navegacion
 * ============================================
 */

'use client';

import React, { memo, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { LibraryBook } from '@/src/infrastructure/repositories/books/BookLibraryRepository';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { BookCarouselCard } from './BookCarouselCard';

// ============================================
// TIPOS
// ============================================

interface BookCarouselRowProps {
  title: string;
  icon?: React.ReactNode;
  books: LibraryBook[];
  isLoading: boolean;
  onBookSelect: (bookId: string) => void;
  showRanking?: boolean;
  markAsNew?: boolean;
  viewAllHref?: string;
}

// ============================================
// SKELETON
// ============================================

export const BookCarouselRowSkeleton: React.FC = memo(() => {
  return (
    <section className="py-6 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/30 rounded-full animate-pulse" />
            <div className="h-7 bg-white/30 rounded-xl w-40 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 bg-white/30 rounded-full animate-pulse" />
            <div className="w-9 h-9 bg-white/30 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 sm:w-44 md:w-48 bg-white rounded-2xl border-2 border-yellow-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-[2/3] bg-gradient-to-br from-blue-100 to-purple-100" />
              <div className="p-2.5 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

BookCarouselRowSkeleton.displayName = 'BookCarouselRowSkeleton';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const BookCarouselRow: React.FC<BookCarouselRowProps> = memo(
  ({ title, icon, books, isLoading, onBookSelect, showRanking = false, markAsNew = false, viewAllHref }) => {
    const { t, loading: translationsLoading } = useSupabaseTranslations('library');
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

    const scroll = useCallback(
      (direction: 'left' | 'right') => {
        if (scrollRef.current) {
          const scrollAmount = 220;
          scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
          });
          setTimeout(checkScrollButtons, 300);
        }
      },
      [checkScrollButtons]
    );

    const previousLabel = translationsLoading ? 'Anterior' : t('carousel.previous');
    const nextLabel = translationsLoading ? 'Siguiente' : t('carousel.next');
    const viewAllLabel = translationsLoading ? 'Ver todo' : t('carousel.view_all');

    if (isLoading || translationsLoading) {
      return <BookCarouselRowSkeleton />;
    }

    if (books.length === 0) {
      return null;
    }

    return (
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  {icon}
                </div>
              )}
              <h2
                className="text-xl md:text-2xl font-black text-white drop-shadow-lg"
                style={{
                  fontFamily: 'Comic Sans MS, cursive',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                }}
              >
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full bg-white shadow-lg border-2 border-yellow-300 transition-all ${
                  canScrollLeft
                    ? 'hover:scale-110 hover:bg-yellow-50'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                aria-label={previousLabel}
              >
                <ChevronLeft className="w-4 h-4 text-blue-700" strokeWidth={3} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-2 rounded-full bg-white shadow-lg border-2 border-yellow-300 transition-all ${
                  canScrollRight
                    ? 'hover:scale-110 hover:bg-yellow-50'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                aria-label={nextLabel}
              >
                <ChevronRight className="w-4 h-4 text-blue-700" strokeWidth={3} />
              </button>

              {viewAllHref && (
                <a
                  href={viewAllHref}
                  className="hidden sm:flex items-center gap-1 ml-2 px-3 py-1.5 bg-white/90 hover:bg-white rounded-full border-2 border-yellow-300 text-blue-700 text-sm font-bold transition-all hover:scale-105"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  {viewAllLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Carrusel */}
          <div
            ref={scrollRef}
            onScroll={checkScrollButtons}
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {books.map((book, index) => (
              <BookCarouselCard
                key={book.id}
                book={book}
                onSelect={onBookSelect}
                priority={index < 3}
                showRanking={showRanking}
                rankNumber={showRanking ? index + 1 : undefined}
                isNew={markAsNew}
              />
            ))}
          </div>
        </div>

        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>
    );
  }
);

BookCarouselRow.displayName = 'BookCarouselRow';

export default BookCarouselRow;
