// src/presentation/features/my-progress/components/CompletedBookCard.tsx
/**
 * ============================================
 * COMPONENTE: CompletedBookCard
 * Card para libros completados con fecha, tiempo y rating
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { BookOpen, CheckCircle, Star, Clock, RotateCcw } from 'lucide-react';
import { CompletedBook } from '@/src/infrastructure/repositories/my-progress/MyProgressRepository';

// ============================================
// HELPERS
// ============================================

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

function formatTime(seconds: number): string {
  if (seconds < 60) return '<1m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ============================================
// COMPONENTE
// ============================================

interface CompletedBookCardProps {
  book: CompletedBook;
  onSelect: (bookId: string) => void;
  locale: string;
  labels: {
    readAgain: string;
    completedOn: string;
    timeSpent: string;
    noRating: string;
  };
  priority?: boolean;
}

export const CompletedBookCard: React.FC<CompletedBookCardProps> = memo(
  ({ book, onSelect, locale, labels, priority = false }) => {
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
        aria-label={`${labels.readAgain}: ${book.title}`}
        className="group relative flex-shrink-0 w-44 sm:w-48 md:w-52 cursor-pointer"
      >
        <div className="relative bg-white rounded-2xl border-2 border-emerald-200 shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:border-emerald-400">
          {/* Badge completado */}
          <div className="absolute top-2 right-2 z-20 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>

          {/* Rating stars (si tiene) */}
          {book.rating && (
            <div className="absolute top-2 left-2 z-20 bg-yellow-400 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-0.5 shadow-lg">
              <Star className="w-3 h-3 fill-current" />
              {book.rating}
            </div>
          )}

          {/* Portada */}
          <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-emerald-100 to-blue-100">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading={priority ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-200 via-blue-100 to-purple-200">
                <div className="text-center p-3">
                  <BookOpen className="w-10 h-10 text-emerald-300 mx-auto mb-1" />
                  <p className="text-emerald-400 font-bold text-xs line-clamp-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {book.title}
                  </p>
                </div>
              </div>
            )}

            {/* Overlay + boton releer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div
                className="w-full py-2 bg-emerald-500 text-white font-black text-xs rounded-full text-center shadow-lg border-2 border-white flex items-center justify-center gap-1.5"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                <RotateCcw className="w-3 h-3" />
                {labels.readAgain}
              </div>
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

            {/* Meta: fecha + tiempo */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {book.completedAt && (
                <span className="flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  {formatDate(book.completedAt, locale)}
                </span>
              )}
              {book.readingTimeSeconds > 0 && (
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {formatTime(book.readingTimeSeconds)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200/0 via-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
      </article>
    );
  }
);

CompletedBookCard.displayName = 'CompletedBookCard';
