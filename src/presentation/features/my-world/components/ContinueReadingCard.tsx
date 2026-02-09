// src/presentation/features/my-world/components/ContinueReadingCard.tsx
/**
 * ============================================
 * COMPONENTE: ContinueReadingCard
 * Card de libro con barra de progreso
 * Para la seccion "Continua Leyendo"
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { BookOpen, Play } from 'lucide-react';
import { MyWorldBook } from '@/src/infrastructure/repositories/my-world/MyWorldRepository';

// ============================================
// TIPOS
// ============================================

interface ContinueReadingCardProps {
  book: MyWorldBook;
  onSelect: (bookId: string) => void;
  continueLabel: string;
  progressLabel: string;
  priority?: boolean;
}

// ============================================
// COMPONENTE
// ============================================

export const ContinueReadingCard: React.FC<ContinueReadingCardProps> = memo(
  ({ book, onSelect, continueLabel, progressLabel, priority = false }) => {
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
        aria-label={`${continueLabel}: ${book.title}`}
        className="group relative flex-shrink-0 w-40 sm:w-44 md:w-48 cursor-pointer"
      >
        <div className="relative bg-white rounded-2xl border-2 border-yellow-200 shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-yellow-400">
          {/* Badge de porcentaje */}
          <div className="absolute top-2 right-2 z-20 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-black text-blue-700 shadow-md border border-yellow-200">
            {percentage}%
          </div>

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

            {/* Boton continuar en hover */}
            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div
                className="w-full py-2 bg-yellow-300 text-blue-700 font-black text-xs rounded-full text-center shadow-lg border-2 border-white flex items-center justify-center gap-1.5"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                <Play className="w-3 h-3" />
                {continueLabel}
              </div>
            </div>

            {/* Barra de progreso superpuesta en la portada */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-r-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Contenido */}
          <div className="p-2.5 space-y-1.5">
            {/* Titulo */}
            <h3
              className="text-sm font-bold text-blue-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {book.title}
            </h3>

            {/* Autor */}
            {book.authors.length > 0 && (
              <p className="text-xs text-slate-500 truncate" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {book.authors.map(a => a.name).join(', ')}
              </p>
            )}

            {/* Progreso text */}
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/0 via-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
      </article>
    );
  }
);

ContinueReadingCard.displayName = 'ContinueReadingCard';
