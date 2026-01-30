// app/[locale]/biblioteca/[category]/page.tsx

import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import {
  getCategoriesQuery,
  getBooksByCategoryQuery
} from '@/src/core/application/use-cases/books-catalog';
import { BookGrid } from '@/src/presentation/features/books-catalog/components/BookGrid';

interface PageProps {
  params: Promise<{ category: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const locale = await getLocale();
  const categories = await getCategoriesQuery({ languageCode: locale });
  const currentCategory = categories.find(c => c.slug === category);

  if (!currentCategory) {
    return { title: 'Categoría no encontrada' };
  }

  return {
    title: currentCategory.name,
    description: currentCategory.description
  };
}

async function BooksSection({ categorySlug }: { categorySlug: string }) {
  const locale = await getLocale();
  const books = await getBooksByCategoryQuery({
    categorySlug,
    languageCode: locale,
    limit: 20
  });

  return (
    <BookGrid
      books={books}
      categorySlug={categorySlug}
      emptyMessage="No hay libros en esta categoría aún"
    />
  );
}

function BooksSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default async function CategoryPage({ params }: PageProps) {
  const { category, locale: paramLocale } = await params;
  const locale = await getLocale();
  const t = await getTranslations('biblioteca');

  // Obtener información de la categoría
  const categories = await getCategoriesQuery({ languageCode: locale });
  const currentCategory = categories.find(c => c.slug === category);

  if (!currentCategory) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Link
            href={`/${paramLocale}/biblioteca`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToLibrary')}
          </Link>

          {/* Título de categoría */}
          <div className="flex items-center gap-4">
            {currentCategory.icon && (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${currentCategory.color}20` }}
              >
                {/* Aquí podrías renderizar el ícono */}
              </div>
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {currentCategory.name}
              </h1>
              {currentCategory.description && (
                <p className="text-gray-600 mt-1">
                  {currentCategory.description}
                </p>
              )}
              <p className="text-sm text-gray-400 mt-2">
                {currentCategory.bookCount} {currentCategory.bookCount === 1 ? 'libro' : 'libros'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de libros */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<BooksSkeleton />}>
            <BooksSection categorySlug={category} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
