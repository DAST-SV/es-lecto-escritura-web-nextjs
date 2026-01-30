// app/api/books-catalog/books/[slug]/pages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getBookPagesQuery } from '@/src/core/application/use-cases/books-catalog';
import { booksCatalogRepository } from '@/src/infrastructure/repositories/books-catalog';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get('lang') || 'es';

    // Primero obtener el libro para tener el ID
    const book = await booksCatalogRepository.getBookBySlug(slug, languageCode);

    if (!book) {
      return NextResponse.json(
        { error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    const pages = await getBookPagesQuery({
      bookId: book.id,
      languageCode
    });

    return NextResponse.json({
      book: {
        id: book.id,
        slug: book.slug,
        title: book.title,
        coverUrl: book.coverUrl,
        difficulty: book.difficulty,
        categoryName: book.categoryName
      },
      pages,
      totalPages: pages.length
    });
  } catch (error) {
    console.error('API Error - Get Book Pages:', error);
    return NextResponse.json(
      { error: 'Error al obtener páginas' },
      { status: 500 }
    );
  }
}
