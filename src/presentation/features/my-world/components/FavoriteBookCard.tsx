// src/presentation/features/my-world/components/FavoriteBookCard.tsx
/**
 * ============================================
 * COMPONENTE: FavoriteBookCard
 * Card para libros favoritos y completados
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { BookOpen, Heart, CheckCircle } from 'lucide-react';
import { LibraryBook } from '@/src/infrastructure/repositories/books/BookLibraryRepository';

interface FavoriteBookCardProps {
  book: LibraryBook;
  onSelect: (bookId: string) => void;
  readLabel: string;
  variant?: 'favorite' | 'completed';
  completedLabel?: string;
  priority?: boolean;
}

export const FavoriteBookCard: React.FC<FavoriteBookCardProps> = memo(
  ({ book, onSelect, readLabel, variant = 'favorite', completedLabel, priority = false }) => {

    const handleClick = () => onSelect(book.id);
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(book.id);
      }
    };

    return (
      <article
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${readLabel}: ${book.title}`}
        className="group relative flex-shrink-0 w-40 sm:w-44 md:w-48 cursor-pointer"
      >
        <div className="relative bg-white rounded-2xl border-2 border-yellow-200 shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-yellow-400">
          {/* Badge */}
          {variant === 'favorite' && (
            <div className="absolute top-2 right-2 z-20 bg-pink-500 text-white p-1.5 rounded-full shadow-lg">
              <Heart className="w-3 h-3 fill-current" />
            </div>
          )}
          {variant === 'completed' && (
            <div className="absolute top-2 right-2 z-20 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <CheckCircle className="w-3 h-3" />
              {completedLabel}
            </div>
          )}

          {/* Portada */}
          <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading={priority ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200">
                <div className="text-center p-3">
                  <BookOpen className="w-10 h-10 text-blue-300 mx-auto mb-1" />
                  <p className="text-blue-400 font-bold text-xs line-clamp-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {book.title}
                  </p>
                </div>
              </div>
            )}

            {/* Overlay gradient en hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Boton leer en hover */}
            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div
                className="w-full py-2 bg-yellow-300 text-blue-700 font-black text-xs rounded-full text-center shadow-lg border-2 border-white"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                {readLabel}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-2.5 space-y-1.5">
            <h3
              className="text-sm font-bold text-blue-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {book.title}
            </h3>

            {book.authors.length > 0 && (
              <p className="text-xs text-slate-500 truncate" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {book.authors.map(a => a.name).join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/0 via-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
      </article>
    );
  }
);

FavoriteBookCard.displayName = 'FavoriteBookCard';
