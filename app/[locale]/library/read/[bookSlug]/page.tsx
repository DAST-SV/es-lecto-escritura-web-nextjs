/**
 * Book Reader Page
 * @file app/[locale]/library/read/[bookSlug]/page.tsx
 * @description Página de lectura interactiva de un libro
 */

import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { getBookDetailQuery, getBookPagesQuery } from '@/src/core/application/use-cases/books-catalog';
import { BookReader } from '@/src/presentation/features/books-catalog/components/BookReader';

interface PageProps {
  params: Promise<{ bookSlug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { bookSlug } = await params;
  const locale = await getLocale();
  const t = await getTranslations('booksCatalog');
  const book = await getBookDetailQuery({ bookSlug, languageCode: locale });

  if (!book) {
    return { title: t('errors.bookNotFound') };
  }

  return {
    title: `${t('reader.reading')}: ${book.title}`,
    description: book.summary || book.description
  };
}

export default async function ReadBookPage({ params }: PageProps) {
  const { bookSlug } = await params;
  const locale = await getLocale();
  const t = await getTranslations('booksCatalog');

  // Obtener información del libro
  const book = await getBookDetailQuery({ bookSlug, languageCode: locale });

  if (!book) {
    notFound();
  }

  // Obtener páginas del libro
  const pages = await getBookPagesQuery({
    bookId: book.id,
    languageCode: locale
  });

  // Si no hay páginas, mostrar mensaje
  if (pages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">
            {t('reader.noPagesAvailable')}
          </p>
          <a
            href={`/${locale}/library`}
            className="text-primary hover:underline"
          >
            {t('navigation.backToLibrary')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <BookReader
      book={{
        id: book.id,
        slug: book.slug,
        title: book.title,
        coverUrl: book.coverUrl,
        categoryName: book.categoryName
      }}
      pages={pages}
    />
  );
}
