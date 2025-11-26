/**
 * UBICACIÓN: app/api/books/[id]/read/route.ts
 */

import { NextResponse } from 'next/server';
import { GetBookUseCase } from '@/src/core/application/use-cases/books/GetBook.usecase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ params es una Promise
) {
  try {
    // ✅ AWAIT params para obtener el ID
    const { id: bookId } = await params;

    console.log('📖 1. ID recibido:', bookId);

    if (!bookId) {
      return NextResponse.json(
        { error: 'ID del libro requerido' },
        { status: 400 }
      );
    }

    console.log('📖 2. Llamando GetBookUseCase...');
    const libro = await GetBookUseCase.execute(bookId);

    if (!libro) {
      return NextResponse.json(
        { error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Libro obtenido:', {
      titulo: libro.titulo,
      paginas: libro.paginas?.length || 0,
      autores: libro.autores?.length || 0
    });

    return NextResponse.json({
      libro: {
        id_libro: libro.id_libro,
        titulo: libro.titulo,
        descripcion: libro.descripcion,
        portada: libro.portada,
        autores: libro.autores || [],
        personajes: libro.personajes || [],
        categorias: libro.categorias || [],
        generos: libro.generos || [],
        valores: libro.valores || [],
        etiquetas: libro.etiquetas || [],
        nivel: libro.nivel,
        paginas: libro.paginas || [],
        fecha_creacion: libro.fecha_creacion
      }
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo libro para lectura:', error);
    
    return NextResponse.json(
      { error: error.message || 'Error al cargar el libro' },
      { status: 500 }
    );
  }
}