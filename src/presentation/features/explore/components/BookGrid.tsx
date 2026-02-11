/**
 * ============================================
 * COMPONENTE: BookGrid
 * Grid responsive de libros
 * TODAS las traducciones son dinamicas
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { BookOpen, SearchX } from 'lucide-react';
import { BookExtended } from '@/src/core/domain/entities/BookExtended';
import { BookCard } from './BookCard';
import { BookCardSkeleton } from './BookCardSkeleton';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// TIPOS
// ============================================

interface BookGridProps {
  books: BookExtended[];
  isLoading: boolean;
  onBookSelect: (bookId: string) => void;
  emptyMessage?: string;
  emptySubMessage?: string;
  skeletonCount?: number;
}

// ============================================
// EMPTY STATE
// ============================================

const EmptyState: React.FC<{ message: string; subMessage?: string }> = memo(
  ({ message, subMessage }) => {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative mb-6">
          {/* Círculo decorativo */}
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-200 via-blue-200 to-purple-200 rounded-full blur-xl opacity-60" />
          <div className="relative bg-white rounded-full p-6 shadow-xl border-4 border-yellow-300">
            <SearchX className="w-16 h-16 text-blue-400" />
          </div>
        </div>

        <h3
          className="text-2xl font-black text-blue-700 text-center mb-2"
          style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
        >
          {message}
        </h3>

        {subMessage && (
          <p
            className="text-gray-500 text-center max-w-md"
            style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
          >
            {subMessage}
          </p>
        )}

        {/* Decoración */}
        <div className="flex items-center gap-2 mt-4">
          <div className="h-1.5 w-10 bg-yellow-300 rounded-full" />
          <div className="h-1.5 w-6 bg-green-300 rounded-full" />
          <div className="h-1.5 w-4 bg-blue-300 rounded-full" />
        </div>
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

// ============================================
// LOADING GRID
// ============================================

const LoadingGrid: React.FC<{ count: number }> = memo(({ count }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
});

LoadingGrid.displayName = 'LoadingGrid';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const BookGrid: React.FC<BookGridProps> = memo(
  ({
    books,
    isLoading,
    onBookSelect,
    emptyMessage,
    emptySubMessage,
    skeletonCount = 8,
  }) => {
    const { t, loading: translationsLoading } = useSupabaseTranslations('book_explore');

    // Obtener mensajes traducidos (props tienen prioridad sobre traducciones)
    const displayEmptyMessage = emptyMessage || (translationsLoading ? 'No se encontraron libros' : t('results.empty'));
    const displayEmptySubMessage = emptySubMessage || (translationsLoading ? 'Intenta ajustar los filtros' : t('results.empty_filtered'));

    // Loading inicial
    if (isLoading && books.length === 0) {
      return <LoadingGrid count={skeletonCount} />;
    }

    // Sin resultados
    if (!isLoading && books.length === 0) {
      return <EmptyState message={displayEmptyMessage} subMessage={displayEmptySubMessage} />;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book, index) => (
          <BookCard
            key={book.id}
            book={book}
            onSelect={onBookSelect}
            priority={index < 4} // Primeras 4 con priority para LCP
          />
        ))}
      </div>
    );
  }
);

BookGrid.displayName = 'BookGrid';

export default BookGrid;
