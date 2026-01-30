// app/[locale]/biblioteca/[category]/[bookSlug]/page.tsx

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

const difficultyInfo = {
  beginner: { label: 'Principiante', color: 'green', age: '3-5 años' },
  elementary: { label: 'Elemental', color: 'blue', age: '6-8 años' },
  intermediate: { label: 'Intermedio', color: 'yellow', age: '9-11 años' },
  advanced: { label: 'Avanzado', color: 'red', age: '12+ años' }
};

export async function generateMetadata({ params }: PageProps) {
  const { bookSlug } = await params;
  const locale = await getLocale();
  const book = await getBookDetailQuery({ bookSlug, languageCode: locale });

  if (!book) {
    return { title: 'Libro no encontrado' };
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
  const book = await getBookDetailQuery({ bookSlug, languageCode: locale });

  if (!book) {
    notFound();
  }

  const difficulty = difficultyInfo[book.difficulty];

  return (
    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Columna izquierda - Portada */}
      <div className="lg:col-span-1">
        <div className="sticky top-8">
          {/* Portada */}
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
                  Destacado
                </span>
              )}
              {book.isPremium && (
                <span className="flex items-center gap-1 bg-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow">
                  <Crown className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>
          </div>

          {/* Botón de lectura */}
          <div className="mt-6">
            <Link href={`/${locale}/biblioteca/leer/${bookSlug}`} className="block">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Comenzar a leer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Columna derecha - Info */}
      <div className="lg:col-span-2">
        {/* Categoría */}
        <Link
          href={`/${locale}/biblioteca/${category}`}
          className="inline-block text-sm font-medium text-primary hover:underline mb-3"
        >
          {book.categoryName}
        </Link>

        {/* Título */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          {book.title}
        </h1>

        {/* Subtítulo */}
        {book.subtitle && (
          <p className="text-xl text-gray-600 mb-6">
            {book.subtitle}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          {/* Dificultad */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${difficulty.color}-100 text-${difficulty.color}-700`}>
              {difficulty.label}
            </span>
            <span className="text-sm text-gray-500">({difficulty.age})</span>
          </div>

          {/* Tiempo de lectura */}
          {book.estimatedReadTime > 0 && (
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{book.estimatedReadTime} min</span>
            </div>
          )}

          {/* Páginas */}
          {book.pageCount > 0 && (
            <div className="flex items-center gap-2 text-gray-500">
              <BookOpen className="w-4 h-4" />
              <span>{book.pageCount} páginas</span>
            </div>
          )}
        </div>

        {/* Resumen */}
        {book.summary && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Resumen
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {book.summary}
            </p>
          </div>
        )}

        {/* Descripción */}
        {book.description && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Descripción
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
  const t = await getTranslations('biblioteca');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          href={`/${paramLocale}/biblioteca/${category}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToCategory')}
        </Link>

        {/* Contenido */}
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
