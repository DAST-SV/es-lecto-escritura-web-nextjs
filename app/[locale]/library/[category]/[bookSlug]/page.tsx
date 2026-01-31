/**
 * Book Detail Page
 * @file app/[locale]/library/[category]/[bookSlug]/page.tsx
 * @description Página de detalle de un libro con información completa
 */

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Star,
  Crown,
  Play
} from 'lucide-react';
import { getBookDetailQuery } from '@/src/core/application/use-cases/books-catalog';
import { Button } from '@/src/presentation/components/ui/Button';

interface PageProps {
  params: Promise<{ category: string; bookSlug: string; locale: string }>;
}

// Colores para los diferentes niveles de dificultad
const difficultyColors = {
  beginner: { bg: 'bg-green-100', text: 'text-green-700' },
  elementary: { bg: 'bg-blue-100', text: 'text-blue-700' },
  intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  advanced: { bg: 'bg-red-100', text: 'text-red-700' }
};

export async function generateMetadata({ params }: PageProps) {
  const { bookSlug } = await params;
  const locale = await getLocale();
  const t = await getTranslations('booksCatalog');
  const book = await getBookDetailQuery({ bookSlug, languageCode: locale });

  if (!book) {
    return { title: t('errors.bookNotFound') };
  }

  return {
    title: book.title,
    description: book.description || book.summary
  };
}

async function BookDetailContent({ bookSlug, category, locale }: {
  bookSlug: string;
  category: string;
  locale: string;
}) {
  const t = await getTranslations('booksCatalog');
  const book = await getBookDetailQuery({ bookSlug, languageCode: locale });

  if (!book) {
    notFound();
  }

  const colors = difficultyColors[book.difficulty];

  return (
    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Left column - Cover */}
      <div className="lg:col-span-1">
        <div className="sticky top-8">
          {/* Cover */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-gray-300" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {book.isFeatured && (
                <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-medium px-3 py-1.5 rounded-full shadow">
                  <Star className="w-3 h-3" />
                  {t('badges.featured')}
                </span>
              )}
              {book.isPremium && (
                <span className="flex items-center gap-1 bg-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow">
                  <Crown className="w-3 h-3" />
                  {t('badges.premium')}
                </span>
              )}
            </div>
          </div>

          {/* Read button */}
          <div className="mt-6">
            <Link href={`/${locale}/library/read/${bookSlug}`} className="block">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {t('actions.startReading')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Right column - Info */}
      <div className="lg:col-span-2">
        {/* Category */}
        <Link
          href={`/${locale}/library/${category}`}
          className="inline-block text-sm font-medium text-primary hover:underline mb-3"
        >
          {book.categoryName}
        </Link>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          {book.title}
        </h1>

        {/* Subtitle */}
        {book.subtitle && (
          <p className="text-xl text-gray-600 mb-6">
            {book.subtitle}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          {/* Difficulty */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
              {t(`difficulty.${book.difficulty}`)}
            </span>
            <span className="text-sm text-gray-500">({t(`ageRange.${book.difficulty}`)})</span>
          </div>

          {/* Read time */}
          {book.estimatedReadTime > 0 && (
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{book.estimatedReadTime} {t('meta.minutes')}</span>
            </div>
          )}

          {/* Pages */}
          {book.pageCount > 0 && (
            <div className="flex items-center gap-2 text-gray-500">
              <BookOpen className="w-4 h-4" />
              <span>{book.pageCount} {t('meta.pages')}</span>
            </div>
          )}
        </div>

        {/* Summary */}
        {book.summary && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {t('sections.summary')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {book.summary}
            </p>
          </div>
        )}

        {/* Description */}
        {book.description && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {t('sections.description')}
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookDetailSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-1">
        <div className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse" />
        <div className="mt-6 h-12 bg-gray-200 rounded-xl animate-pulse" />
      </div>
      <div className="lg:col-span-2">
        <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-8 animate-pulse" />
        <div className="flex gap-4 mb-8">
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default async function BookDetailPage({ params }: PageProps) {
  const { category, bookSlug, locale: paramLocale } = await params;
  const locale = await getLocale();
  const t = await getTranslations('booksCatalog');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          href={`/${paramLocale}/library/${category}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('navigation.backToCategory')}
        </Link>

        {/* Content */}
        <Suspense fallback={<BookDetailSkeleton />}>
          <BookDetailContent
            bookSlug={bookSlug}
            category={category}
            locale={locale}
          />
        </Suspense>
      </div>
    </div>
  );
}
