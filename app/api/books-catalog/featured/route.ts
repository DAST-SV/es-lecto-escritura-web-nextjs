// app/api/books-catalog/featured/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getFeaturedBooksQuery } from '@/src/core/application/use-cases/books-catalog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get('lang') || 'es';
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const books = await getFeaturedBooksQuery({ languageCode, limit });

    return NextResponse.json(books);
  } catch (error) {
    console.error('API Error - Get Featured Books:', error);
    return NextResponse.json(
      { error: 'Error fetching featured books' },
      { status: 500 }
    );
  }
}
