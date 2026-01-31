/**
 * Books Explore API
 * @file app/api/books/explore/route.ts
 * @description API endpoint para exploración de libros con filtros
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookExploreRepository } from '@/src/infrastructure/repositories/books/BookExploreRepository';
import type { BookExploreFilters } from '@/src/core/domain/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parsear filtros desde query params
    const filters: BookExploreFilters = {
      searchTerm: searchParams.get('search') || undefined,
      categories: searchParams.get('categories')?.split(',').filter(Boolean).map(Number).filter(n => !isNaN(n)) || undefined,
      genres: searchParams.get('genres')?.split(',').filter(Boolean).map(Number).filter(n => !isNaN(n)) || undefined,
      levels: searchParams.get('levels')?.split(',').filter(Boolean).map(Number).filter(n => !isNaN(n)) || undefined,
      accessTypes: searchParams.get('accessTypes')?.split(',').filter(Boolean) as any[] || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'recent',
      limit: parseInt(searchParams.get('limit') || '12', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10),
    };

    const result = await BookExploreRepository.explore(filters);

    // Serializar BookExtended a JSON plano
    return NextResponse.json({
      books: result.books.map(book => book.toJSON()),
      total: result.total,
      hasMore: result.hasMore,
      filters: result.filters,
    });
  } catch (error) {
    console.error('API Error - Explore Books:', error);
    return NextResponse.json(
      { error: 'Error exploring books' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters: BookExploreFilters = {
      searchTerm: body.searchTerm,
      categories: body.categories,
      genres: body.genres,
      levels: body.levels,
      accessTypes: body.accessTypes,
      sortBy: body.sortBy || 'recent',
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
    console.error('API Error - Explore Books (POST):', error);
    return NextResponse.json(
      { error: 'Error exploring books' },
      { status: 500 }
    );
  }
}
