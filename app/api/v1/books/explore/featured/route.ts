// app/api/v1/books/explore/featured/route.ts
// API para obtener libros destacados

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';

/**
 * GET /api/v1/books/explore/featured
 * Obtiene libros destacados
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const books = await BookExploreRepository.getFeaturedBooks(limit);

    return NextResponse.json({
      books: books.map(book => book.toJSON()),
      total: books.length,
    });
  } catch (error) {
    console.error('API Error - GET /api/v1/books/explore/featured:', error);
    return NextResponse.json(
      { error: 'Error al obtener libros destacados' },
      { status: 500 }
    );
  }
}
