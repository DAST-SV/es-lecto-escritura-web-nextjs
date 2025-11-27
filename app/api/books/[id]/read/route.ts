/**
 * UBICACIÓN: app/api/books/[id]/read/route.ts
 * ✅ ACTUALIZADO: Campos del nuevo schema
 */

import { NextResponse } from 'next/server';
import { GetBookUseCase } from '@/src/core/application/use-cases/books/GetBook.usecase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;

    console.log('📖 API: Obteniendo libro:', bookId);

    if (!bookId) {
      return NextResponse.json(
        { error: 'ID del libro requerido' },
        { status: 400 }
      );
    }

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

    // Retornar con formato compatible
    return NextResponse.json({
      libro: {
        id: libro.id,
        id_libro: libro.id, // Compatibilidad
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
    console.error('❌ Error obteniendo libro:', error);
    
    return NextResponse.json(
      { error: error.message || 'Error al cargar el libro' },
      { status: 500 }
    );
  }
}