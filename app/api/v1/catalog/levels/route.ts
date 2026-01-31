// app/api/v1/catalog/levels/route.ts
// API para obtener niveles de lectura del catálogo

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';

/**
 * GET /api/v1/catalog/levels
 * Obtiene todos los niveles de lectura disponibles
 */
export async function GET(_request: NextRequest) {
  try {
    const levels = await BookExploreRepository.getLevels();

    return NextResponse.json({ levels });
  } catch (error) {
    console.error('API Error - GET /api/v1/catalog/levels:', error);
    return NextResponse.json(
      { error: 'Error al obtener niveles' },
      { status: 500 }
    );
  }
}
