// app/api/v1/books/explore/route.ts
// API para exploración pública de libros con filtros

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';
import type { BookExploreFilters } from '@/src/core/domain/types';

/**
 * GET /api/v1/books/explore
 * Exploración de libros con filtros via query params
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: BookExploreFilters = {
      searchTerm: searchParams.get('search') || undefined,
      categories: parseNumberArray(searchParams.get('categories')),
      genres: parseNumberArray(searchParams.get('genres')),
      levels: parseNumberArray(searchParams.get('levels')),
      values: parseNumberArray(searchParams.get('values')),
      tags: parseNumberArray(searchParams.get('tags')),
      accessTypes: parseStringArray(searchParams.get('accessTypes')) as any[],
      sortBy: (searchParams.get('sortBy') as any) || 'recent',
      limit: parseInt(searchParams.get('limit') || '12', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10),
    };

    const result = await BookExploreRepository.explore(filters);

    return NextResponse.json({
      books: result.books.map(book => book.toJSON()),
      total: result.total,
      hasMore: result.hasMore,
      filters: result.filters,
    });
  } catch (error) {
    console.error('API Error - GET /api/v1/books/explore:', error);
    return NextResponse.json(
      { error: 'Error al explorar libros' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/books/explore
 * Exploración de libros con filtros via body (para filtros complejos)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const filters: BookExploreFilters = {
      searchTerm: body.searchTerm,
      categories: body.categories,
      genres: body.genres,
      levels: body.levels,
      values: body.values,
      tags: body.tags,
      languages: body.languages,
      countries: body.countries,
      accessTypes: body.accessTypes,
      minRating: body.minRating,
      sortBy: body.sortBy || 'recent',
      authorId: body.authorId,
      communityId: body.communityId,
      limit: body.limit || 12,
      offset: body.offset || 0,
    };

    const result = await BookExploreRepository.explore(filters);

    return NextResponse.json({
      books: result.books.map(book => book.toJSON()),
      total: result.total,
      hasMore: result.hasMore,
      filters: result.filters,
    });
  } catch (error) {
    console.error('API Error - POST /api/v1/books/explore:', error);
    return NextResponse.json(
      { error: 'Error al explorar libros' },
      { status: 500 }
    );
  }
}

// Helpers para parsear query params
function parseNumberArray(value: string | null): number[] | undefined {
  if (!value) return undefined;
  const numbers = value.split(',').filter(Boolean).map(Number).filter(n => !isNaN(n));
  return numbers.length > 0 ? numbers : undefined;
}

function parseStringArray(value: string | null): string[] | undefined {
  if (!value) return undefined;
  const strings = value.split(',').filter(Boolean);
  return strings.length > 0 ? strings : undefined;
}
