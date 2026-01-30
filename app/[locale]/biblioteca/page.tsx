// app/[locale]/biblioteca/page.tsx

import { Suspense } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { getCategoriesQuery } from '@/src/core/application/use-cases/books-catalog';
import { CategoryGrid } from '@/src/presentation/features/books-catalog/components/CategoryGrid';
import { SearchBar } from '@/src/presentation/features/books-catalog/components/SearchBar';

export async function generateMetadata() {
  const t = await getTranslations('biblioteca');
  return {
    title: t('title'),
    description: t('description')
  };
}

async function CategoriesSection() {
  const locale = await getLocale();
  const categories = await getCategoriesQuery({ languageCode: locale });

  return <CategoryGrid categories={categories} />;
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-gray-100 h-48" />
      ))}
    </div>
  );
}

export default async function BibliotecaPage() {
  const t = await getTranslations('biblioteca');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Barra de búsqueda */}
          <div className="max-w-xl mx-auto">
            <SearchBar placeholder={t('searchPlaceholder')} />
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {t('categories')}
          </h2>

          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesSection />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
