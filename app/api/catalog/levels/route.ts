/**
 * Levels Catalog API
 * @file app/api/catalog/levels/route.ts
 * @description API endpoint para obtener niveles de lectura
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';

export async function GET(request: NextRequest) {
  try {
    const levels = await BookExploreRepository.getLevels();

    return NextResponse.json({ levels });
  } catch (error) {
    console.error('API Error - Get Levels:', error);
    return NextResponse.json(
      { error: 'Error fetching levels' },
      { status: 500 }
    );
  }
}
