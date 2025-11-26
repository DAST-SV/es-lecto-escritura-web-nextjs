/**
 * UBICACIÓN: src/app/api/books/[id]/read/route.ts
 * GET - Obtener libro completo con páginas y metadata
 */

import { NextResponse } from 'next/server';
import { BooksRepository } from '@/src/modules/books/infrastructure/database/repositories/BooksRepository';
import { PagesRepository } from '@/src/modules/books/infrastructure/database/repositories/PagesRepository';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id;

    console.log('📚 Obteniendo libro completo:', bookId);

    // Obtener libro y páginas en paralelo
    const [libro, paginas] = await Promise.all([
      BooksRepository.getComplete(bookId),
      PagesRepository.getByBookId(bookId)
    ]);

    if (!libro) {
      return NextResponse.json(
        { error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    const libroCompleto = {
      ...libro,
      paginas
    };

    console.log('✅ Libro completo obtenido');

    return NextResponse.json({ libro: libroCompleto });

  } catch (error: any) {
    console.error('❌ Error en GET /api/books/[id]/read:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener libro' },
      { status: 500 }
    );
  }
}