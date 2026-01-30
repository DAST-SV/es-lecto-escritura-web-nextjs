// app/api/books-catalog/books/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getBookDetailQuery } from '@/src/core/application/use-cases/books-catalog';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get('lang') || 'es';

    const book = await getBookDetailQuery({
      bookSlug: slug,
      languageCode
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('API Error - Get Book Detail:', error);
    return NextResponse.json(
      { error: 'Error al obtener libro' },
      { status: 500 }
    );
  }
}
