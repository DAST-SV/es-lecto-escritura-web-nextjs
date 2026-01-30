// app/api/books-catalog/categories/[slug]/books/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getBooksByCategoryQuery } from '@/src/core/application/use-cases/books-catalog';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const languageCode = searchParams.get('lang') || 'es';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const books = await getBooksByCategoryQuery({
      categorySlug: slug,
      languageCode,
      limit,
      offset
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('API Error - Get Books by Category:', error);
    return NextResponse.json(
      { error: 'Error al obtener libros' },
      { status: 500 }
    );
  }
}
