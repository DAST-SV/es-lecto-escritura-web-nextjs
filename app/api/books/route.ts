/**
 * UBICACIÓN: app/api/books/route.ts
 * ✅ ACTUALIZADO: Compatible con nuevo schema
 */

import { NextResponse } from 'next/server';
import { CreateBookUseCase } from '@/src/core/application/use-cases/books/CreateBook.usecase';
import { GetBooksByUserUseCase } from '@/src/core/application/use-cases/books/GetBooksByUser.usecase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    console.log('📚 API: Obteniendo libros del usuario:', userId);

    const books = await GetBooksByUserUseCase.execute(userId);

    console.log('✅ Libros encontrados:', books.length);

    return NextResponse.json({ books });
  } catch (error: any) {
    console.error('❌ Error GET /api/books:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener libros' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, 
      titulo, 
      descripcion, 
      portada, 
      autores, 
      personajes, 
      categorias, 
      generos, 
      etiquetas, 
      valores, 
      nivel, 
      pages 
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Usuario requerido' }, { status: 400 });
    }

    if (!titulo || !titulo.trim()) {
      return NextResponse.json({ error: 'Título requerido' }, { status: 400 });
    }

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos una página' }, { status: 400 });
    }

    console.log('📚 API: Creando libro:', { userId, titulo, pages: pages.length });

    const libroId = await CreateBookUseCase.execute(userId, {
      titulo,
      descripcion: descripcion || '',
      portada,
      autores: autores || [],
      personajes: personajes || [],
      categorias: categorias || [],
      generos: generos || [],
      etiquetas: etiquetas || [],
      valores: valores || [],
      nivel: nivel || 1,
      pages,
    });

    console.log('✅ Libro creado:', libroId);

    return NextResponse.json({ success: true, bookId: libroId });
  } catch (error: any) {
    console.error('❌ Error POST /api/books:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear libro' },
      { status: 500 }
    );
  }
}