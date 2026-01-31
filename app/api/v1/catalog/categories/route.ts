// app/api/v1/catalog/categories/route.ts
// API para obtener categorías del catálogo

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';

/**
 * GET /api/v1/catalog/categories
 * Obtiene todas las categorías disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCounts = searchParams.get('includeCounts') === 'true';

    const categories = await BookExploreRepository.getCategories();

    let response: any = { categories };

    // Opcionalmente incluir conteo de libros por categoría
    if (includeCounts) {
      const counts = await BookExploreRepository.getCategoryBookCounts();
      response.counts = counts;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error - GET /api/v1/catalog/categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}
