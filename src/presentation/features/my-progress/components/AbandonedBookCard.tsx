// src/presentation/features/my-progress/components/AbandonedBookCard.tsx
/**
 * ============================================
 * COMPONENTE: AbandonedBookCard
 * Card para libros pausados/abandonados
 * Muestra progreso, dias sin leer, boton retomar
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { BookOpen, Play, Calendar } from 'lucide-react';
import { AbandonedBook } from '@/src/infrastructure/repositories/my-progress/MyProgressRepository';

// ============================================
// COMPONENTE
// ============================================

interface AbandonedBookCardProps {
  book: AbandonedBook;
  onSelect: (bookId: string) => void;
  labels: {
    resume: string;
    daysAgo: string;
    progress: string;
  };
  priority?: boolean;
}

export const AbandonedBookCard: React.FC<AbandonedBookCardProps> = memo(
  ({ book, onSelect, labels, priority = false }) => {
    const percentage = Math.round(book.completionPercentage);

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
        aria-label={`${labels.resume}: ${book.title}`}
        className="group relative flex-shrink-0 w-44 sm:w-48 md:w-52 cursor-pointer"
      >
        <div className="relative bg-white rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:border-amber-400">
          {/* Badge dias sin leer */}
          <div className="absolute top-2 right-2 z-20 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-0.5 shadow-lg">
            <Calendar className="w-3 h-3" />
            {book.daysSinceLastRead}d
          </div>

          {/* Badge progreso */}
          <div className="absolute top-2 left-2 z-20 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-black text-amber-700 shadow-md border border-amber-200">
            {percentage}%
          </div>

          {/* Portada con overlay tenue para indicar inactividad */}
          <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
            {book.coverUrl ? (
              <>
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:saturate-100 saturate-[0.7]"
                  loading={priority ? 'eager' : 'lazy'}
                />
                {/* Leve desaturacion para indicar inactividad */}
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-300" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-200 via-orange-100 to-yellow-200">
                <div className="text-center p-3">
                  <BookOpen className="w-10 h-10 text-amber-300 mx-auto mb-1" />
                  <p className="text-amber-400 font-bold text-xs line-clamp-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {book.title}
                  </p>
                </div>
              </div>
            )}

            {/* Overlay + boton retomar */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div
                className="w-full py-2 bg-amber-400 text-amber-900 font-black text-xs rounded-full text-center shadow-lg border-2 border-white flex items-center justify-center gap-1.5"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                <Play className="w-3 h-3" />
                {labels.resume}
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-r-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="p-2.5 space-y-1.5">
            <h3
              className="text-sm font-bold text-blue-800 line-clamp-2 leading-tight"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {book.title}
            </h3>

            {book.authors.length > 0 && (
              <p className="text-xs text-slate-500 truncate" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {book.authors.map(a => a.name).join(', ')}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <div className="flex-1 h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {percentage}%
              </span>
              <span className="text-amber-500 font-semibold">
                {book.daysSinceLastRead} {labels.daysAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/0 via-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
      </article>
    );
  }
);

AbandonedBookCard.displayName = 'AbandonedBookCard';
