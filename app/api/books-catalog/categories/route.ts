// app/api/books-catalog/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getCategoriesQuery } from '@/src/core/application/use-cases/books-catalog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get('lang') || 'es';

    const categories = await getCategoriesQuery({ languageCode });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('API Error - Get Categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}
