// app/api/v1/catalog/genres/route.ts
// API para obtener géneros del catálogo

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';

/**
 * GET /api/v1/catalog/genres
 * Obtiene todos los géneros disponibles
 */
export async function GET(_request: NextRequest) {
  try {
    const genres = await BookExploreRepository.getGenres();

    return NextResponse.json({ genres });
  } catch (error) {
    console.error('API Error - GET /api/v1/catalog/genres:', error);
    return NextResponse.json(
      { error: 'Error al obtener géneros' },
      { status: 500 }
    );
  }
}
