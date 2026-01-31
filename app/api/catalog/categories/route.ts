/**
 * Categories Catalog API
 * @file app/api/catalog/categories/route.ts
 * @description API endpoint para obtener categorías de libros
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';

export async function GET(request: NextRequest) {
  try {
    const categories = await BookExploreRepository.getCategories();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('API Error - Get Categories:', error);
    return NextResponse.json(
      { error: 'Error fetching categories' },
      { status: 500 }
    );
  }
}
