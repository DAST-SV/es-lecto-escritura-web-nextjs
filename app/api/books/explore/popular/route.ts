/**
 * Popular Books API
 * @file app/api/books/explore/popular/route.ts
 * @description API endpoint para obtener libros populares
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const books = await BookExploreRepository.getPopularBooks(limit);

    return NextResponse.json({
      books: books.map(book => book.toJSON()),
    });
  } catch (error) {
    console.error('API Error - Popular Books:', error);
    return NextResponse.json(
      { error: 'Error fetching popular books' },
      { status: 500 }
    );
  }
}
