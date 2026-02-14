// src/presentation/features/books-catalog/components/BookCard.tsx
'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Clock, BookOpen, Star, Crown } from 'lucide-react';
import type { BookListItem } from '@/src/core/domain/entities/BookWithTranslations';
import { LocaleLink } from '@/src/presentation/components/LocaleLink';

interface BookCardProps {
  book: BookListItem;
  categorySlug?: string;
}

// Colores para los niveles de dificultad
const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  elementary: 'bg-blue-100 text-blue-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700'
};

export function BookCard({ book, categorySlug }: BookCardProps) {
  const t = useTranslations('booksCatalog');

  // Construir la URL del libro según si tiene categoría o no
  const dynamicPath = categorySlug
    ? `${categorySlug}/${book.slug}`
    : `book/${book.slug}`;

  return (
    <LocaleLink
      routeKey="/library"
      dynamicPath={dynamicPath}
      className="group relative flex flex-col bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {book.isFeatured && (
          <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
            <Star className="w-3 h-3" />
            {t('badges.featured')}
          </span>
        )}
        {book.isPremium && (
          <span className="flex items-center gap-1 bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            <Crown className="w-3 h-3" />
            {t('badges.premium')}
          </span>
        )}
      </div>

      {/* Cover image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 font-medium px-4 py-2 rounded-full shadow-lg">
            {t('actions.viewBook')}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>

        {/* Subtitle */}
        {book.subtitle && (
          <p className="text-sm text-gray-500 line-clamp-1 mb-2">
            {book.subtitle}
          </p>
        )}

        {/* Summary */}
        {book.summary && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {book.summary}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 mt-auto">
          {/* Difficulty */}
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyColors[book.difficulty]}`}>
            {t(`difficulty.${book.difficulty}`)}
          </span>

          {/* Read time */}
          {book.estimatedReadTime > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {book.estimatedReadTime} {t('meta.minutes')}
            </span>
          )}

          {/* Pages */}
          {book.pageCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <BookOpen className="w-3 h-3" />
              {book.pageCount} {t('meta.pages')}
            </span>
          )}
        </div>
      </div>
    </LocaleLink>
  );
}
