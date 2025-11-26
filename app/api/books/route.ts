/**
 * UBICACIÓN: src/app/api/books/route.ts
 * POST - Crear libro completo (metadata + páginas)
 */

import { NextResponse } from 'next/server';
import { BooksRepository } from '@/src/modules/books/infrastructure/database/repositories/BooksRepository';
import { PagesRepository } from '@/src/modules/books/infrastructure/database/repositories/PagesRepository';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('📥 POST /api/books recibió:', {
      userId: body.userId,
      titulo: body.titulo,
      totalPaginas: body.pages?.length || 0
    });

    const { userId, titulo, nivel, autores, personajes, categorias, generos, descripcion, etiquetas, portada, valores, pages } = body;

    // ✅ VALIDACIONES
    if (!userId) {
      return NextResponse.json(
        { error: 'userId es obligatorio' },
        { status: 400 }
      );
    }

    if (!titulo) {
      return NextResponse.json(
        { error: 'titulo es obligatorio' },
        { status: 400 }
      );
    }

    if (!autores || autores.length === 0) {
      return NextResponse.json(
        { error: 'Debe haber al menos un autor' },
        { status: 400 }
      );
    }

    if (!pages || pages.length === 0) {
      return NextResponse.json(
        { error: 'Debe haber al menos una página' },
        { status: 400 }
      );
    }

    // 1️⃣ Crear libro con metadata
    console.log('📝 Creando libro...');
    const libroId = await BooksRepository.create({
      userId,
      titulo,
      nivel: nivel || 1,
      autores,
      personajes,
      categorias,
      generos,
      descripcion,
      etiquetas,
      portada,
      valores
    });

    console.log('✅ Libro creado con ID:', libroId);

    // 2️⃣ Insertar páginas
    console.log('📄 Insertando páginas...');
    const cantidadPaginas = await PagesRepository.insertMany(libroId, pages);

    console.log('✅ Libro completo creado');

    return NextResponse.json({
      success: true,
      bookId: libroId,
      pagesCount: cantidadPaginas
    });

  } catch (error: any) {
    console.error('❌ Error en POST /api/books:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear libro' },
      { status: 500 }
    );
  }
}