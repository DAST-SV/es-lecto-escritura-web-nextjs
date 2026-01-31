/**
 * Genres Catalog API
 * @file app/api/catalog/genres/route.ts
 * @description API endpoint para obtener géneros de libros
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';

export async function GET(request: NextRequest) {
  try {
    const genres = await BookExploreRepository.getGenres();

    return NextResponse.json({ genres });
  } catch (error) {
    console.error('API Error - Get Genres:', error);
    return NextResponse.json(
      { error: 'Error fetching genres' },
      { status: 500 }
    );
  }
}
