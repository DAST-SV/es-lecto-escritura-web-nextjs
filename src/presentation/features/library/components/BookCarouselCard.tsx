// src/presentation/features/library/components/BookCarouselCard.tsx
/**
 * ============================================
 * COMPONENTE: BookCarouselCard
 * Card compacta de libro para carruseles
 * Estilo visual infantil/educativo
 * Usa LibraryBook con portada por idioma
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { BookOpen, Sparkles, Clock } from 'lucide-react';
import { LibraryBook } from '@/src/infrastructure/repositories/books/BookLibraryRepository';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// TIPOS
// ============================================

interface BookCarouselCardProps {
  book: LibraryBook;
  onSelect: (bookId: string) => void;
  priority?: boolean;
  showRanking?: boolean;
  rankNumber?: number;
  isNew?: boolean;
}

// ============================================
// COLORES PARA BADGES DE CATEGORIA
// ============================================

const CATEGORY_COLORS = [
  { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
];

function getCategoryColor(slug: string | null): typeof CATEGORY_COLORS[0] {
  if (!slug) return CATEGORY_COLORS[0];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const BookCarouselCard: React.FC<BookCarouselCardProps> = memo(
  ({ book, onSelect, priority = false, showRanking = false, rankNumber, isNew = false }) => {
    const { t, loading } = useSupabaseTranslations('library');

    const colorSet = getCategoryColor(book.categorySlug);
    const readLabel = loading ? 'Leer' : t('card.read');
    const newLabel = loading ? 'NUEVO' : t('card.new');
    const featuredLabel = loading ? 'Destacado' : t('card.featured');
    const minReadLabel = loading ? 'min' : t('card.min_read');

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
          {/* Numero de ranking */}
          {showRanking && rankNumber != null && (
            <div className="absolute -left-1 top-2 z-30 flex items-center justify-center">
              <span
                className="text-5xl font-black leading-none drop-shadow-lg"
                style={{
                  fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
                  background: 'linear-gradient(180deg, #facc15 0%, #f97316 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))',
                }}
              >
                {rankNumber}
              </span>
            </div>
          )}

          {/* Badge NUEVO */}
          {isNew && (
            <div className="absolute top-2 right-2 z-20 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
              <Sparkles className="w-3 h-3" />
              {newLabel}
            </div>
          )}

          {/* Badge DESTACADO */}
          {!isNew && book.isFeatured && (
            <div className="absolute top-2 right-2 z-20 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              {featuredLabel}
            </div>
          )}

          {/* Portada (usa cover_url traducida por idioma) */}
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
                  <p
                    className="text-blue-400 font-bold text-xs line-clamp-2"
                    style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
                  >
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
                style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
              >
                {readLabel}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-2.5 space-y-1.5">
            {/* Titulo */}
            <h3
              className="text-sm font-bold text-blue-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors"
              style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
            >
              {book.title}
            </h3>

            {/* Autor */}
            {book.authors.length > 0 && (
              <p className="text-xs text-slate-500 truncate" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
                {book.authors.map(a => a.name).join(', ')}
              </p>
            )}

            {/* Metadatos */}
            <div className="flex items-center gap-2">
              {/* Categoria badge */}
              {book.categoryName && (
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colorSet.bg} ${colorSet.text} border ${colorSet.border} truncate max-w-[80px]`}
                >
                  {book.categoryName}
                </span>
              )}

              {/* Tiempo lectura */}
              {book.estimatedReadTime > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {book.estimatedReadTime} {minReadLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/0 via-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
      </article>
    );
  }
);

BookCarouselCard.displayName = 'BookCarouselCard';

export default BookCarouselCard;
