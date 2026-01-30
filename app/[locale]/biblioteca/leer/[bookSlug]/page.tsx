// app/[locale]/biblioteca/leer/[bookSlug]/page.tsx

import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getBookDetailQuery, getBookPagesQuery } from '@/src/core/application/use-cases/books-catalog';
import { booksCatalogRepository } from '@/src/infrastructure/repositories/books-catalog';
import { BookReader } from '@/src/presentation/features/books-catalog/components/BookReader';

interface PageProps {
  params: Promise<{ bookSlug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { bookSlug } = await params;
  const locale = await getLocale();
  const book = await getBookDetailQuery({ bookSlug, languageCode: locale });

  if (!book) {
    return { title: 'Libro no encontrado' };
  }

  return {
    title: `Leyendo: ${book.title}`,
    description: `Disfruta la lectura de ${book.title}`
  };
}

export default async function ReadBookPage({ params }: PageProps) {
  const { bookSlug } = await params;
  const locale = await getLocale();

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
            Este libro aún no tiene páginas disponibles
          </p>
          <a
            href={`/${locale}/biblioteca`}
            className="text-primary hover:underline"
          >
            Volver a la biblioteca
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
