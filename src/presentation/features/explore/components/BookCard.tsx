/**
 * ============================================
 * COMPONENTE: BookCard
 * Card individual de libro para exploracion
 * Estilo visual infantil/educativo
 * TODAS las traducciones son dinamicas
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { Star, Lock, Sparkles, BookOpen, Users } from 'lucide-react';
import { BookExtended } from '@/src/core/domain/entities/BookExtended';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// TIPOS
// ============================================

interface BookCardProps {
  book: BookExtended;
  onSelect: (bookId: string) => void;
  priority?: boolean;
}

// ============================================
// COLORES PARA BADGES
// ============================================

const CATEGORY_COLORS = [
  { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
];

// ============================================
// COMPONENTE DE RATING
// ============================================

const RatingStars: React.FC<{ rating: number; count: number; reviewsLabel: string }> = memo(({ rating, count, reviewsLabel }) => {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 font-medium">({count})</span>
    </div>
  );
});

RatingStars.displayName = 'RatingStars';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const BookCard: React.FC<BookCardProps> = memo(({ book, onSelect, priority = false }) => {
  const { t, loading } = useSupabaseTranslations('book_card');

  const primaryCategory = book.getPrimaryCategory();
  const categories = book.categories.slice(0, 2);

  // Configuracion de badges de acceso con traducciones
  const getAccessBadge = () => {
    const badges = {
      public: { icon: BookOpen, label: t('access.public') || 'Gratis', color: 'bg-green-400 text-white' },
      freemium: { icon: Sparkles, label: t('access.freemium') || 'Freemium', color: 'bg-yellow-400 text-yellow-900' },
      premium: { icon: Lock, label: t('access.premium') || 'Premium', color: 'bg-purple-500 text-white' },
      community: { icon: Users, label: t('access.community') || 'Comunidad', color: 'bg-blue-500 text-white' },
    };
    return badges[book.accessType] || badges.public;
  };

  const accessBadge = getAccessBadge();
  const AccessIcon = accessBadge.icon;

  const handleClick = () => {
    onSelect(book.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(book.id);
    }
  };

  // Obtener textos traducidos (con fallback mientras carga)
  const featuredText = loading ? 'Destacado' : t('featured');
  const newText = loading ? 'NUEVO' : t('new');
  const readingsText = loading ? 'lecturas' : t('readings');
  const yearsText = loading ? 'anos' : t('years');
  const viewBookText = loading ? 'Ver libro' : t('view_book');

  return (
    <article
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${viewBookText}: ${book.title}`}
      className="group relative bg-white rounded-3xl border-4 border-yellow-300 shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50"
    >
      {/* Badge de tipo de acceso */}
      {book.accessType !== 'public' && (
        <div className={`absolute top-3 right-3 z-20 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg ${accessBadge.color}`}>
          <AccessIcon className="w-3 h-3" />
          <span className="hidden sm:inline">{accessBadge.label}</span>
        </div>
      )}

      {/* Badge de destacado */}
      {book.isFeatured && (
        <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">{featuredText}</span>
        </div>
      )}

      {/* Portada */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <BookOpen className="w-16 h-16 text-blue-300 mx-auto mb-2" />
              <p
                className="text-blue-400 font-bold text-sm line-clamp-2"
                style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
              >
                {book.title}
              </p>
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-2">
        {/* Titulo */}
        <h3
          className="text-lg font-black text-blue-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors"
          style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
        >
          {book.title}
        </h3>

        {/* Rating */}
        {book.ratingStats && book.ratingStats.totalRatings > 0 && (
          <RatingStars
            rating={book.ratingStats.averageRating}
            count={book.ratingStats.totalRatings}
            reviewsLabel={t('reviews')}
          />
        )}

        {/* Nivel de lectura */}
        {book.level && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
            <span>{book.level.name}</span>
            {book.level.minAge && book.level.maxAge && (
              <span className="text-blue-500">
                ({book.level.minAge}-{book.level.maxAge} {yearsText})
              </span>
            )}
          </div>
        )}

        {/* Categorias */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {categories.map((category, index) => {
              const colorSet = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
              return (
                <span
                  key={category.id}
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorSet.bg} ${colorSet.text} border ${colorSet.border}`}
                >
                  {category.name}
                </span>
              );
            })}
          </div>
        )}

        {/* Vistas */}
        {book.viewCount > 0 && (
          <p className="text-xs text-gray-400">
            {book.viewCount.toLocaleString()} {readingsText}
          </p>
        )}
      </div>

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/0 via-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </article>
  );
});

BookCard.displayName = 'BookCard';

export default BookCard;
