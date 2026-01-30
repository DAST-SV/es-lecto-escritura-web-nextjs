// app/api/books-catalog/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { searchBooksQuery } from '@/src/core/application/use-cases/books-catalog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const languageCode = searchParams.get('lang') || 'es';
    const categorySlug = searchParams.get('category') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const results = await searchBooksQuery({
      query,
      languageCode,
      categorySlug,
      difficulty,
      limit,
      offset
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('API Error - Search Books:', error);
    return NextResponse.json(
      { error: 'Error en la búsqueda' },
      { status: 500 }
    );
  }
}
