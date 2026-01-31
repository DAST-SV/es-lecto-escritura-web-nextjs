// app/api/v1/books/explore/popular/route.ts
// API para obtener libros populares

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';

/**
 * GET /api/v1/books/explore/popular
 * Obtiene libros populares
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const books = await BookExploreRepository.getPopularBooks(limit);

    return NextResponse.json({
      books: books.map(book => book.toJSON()),
      total: books.length,
    });
  } catch (error) {
    console.error('API Error - GET /api/v1/books/explore/popular:', error);
    return NextResponse.json(
      { error: 'Error al obtener libros populares' },
      { status: 500 }
    );
  }
}
