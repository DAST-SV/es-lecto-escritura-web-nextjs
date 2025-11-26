/**
 * UBICACIÓN: src/app/api/books/[id]/route.ts
 * GET - Obtener libro
 * PATCH - Actualizar libro completo
 * DELETE - Eliminar libro
 */

import { NextResponse } from 'next/server';
import { BooksRepository } from '@/src/modules/books/infrastructure/database/repositories/BooksRepository';
import { PagesRepository } from '@/src/modules/books/infrastructure/database/repositories/PagesRepository';
import { MetadataRepository } from '@/src/modules/books/infrastructure/database/repositories/MetadataRepository';

/**
 * GET - Obtener libro básico
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id;
    
    const libro = await BooksRepository.getComplete(bookId);

    if (!libro) {
      return NextResponse.json(
        { error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ libro });

  } catch (error: any) {
    console.error('❌ Error en GET /api/books/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener libro' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Actualizar libro completo
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id;
    const body = await req.json();

    console.log('📥 PATCH /api/books/[id] recibió:', {
      bookId,
      titulo: body.titulo,
      totalPaginas: body.pages?.length || 0
    });

    const { titulo, descripcion, portada, nivel, autores, personajes, categorias, generos, etiquetas, valores, pages } = body;

    // ✅ VALIDACIONES
    if (!pages || pages.length === 0) {
      return NextResponse.json(
        { error: 'Debe haber al menos una página' },
        { status: 400 }
      );
    }

    // 1️⃣ Actualizar datos básicos
    console.log('📝 Actualizando datos básicos...');
    await BooksRepository.update(bookId, {
      idLibro: bookId,
      titulo,
      descripcion,
      portada,
      nivel
    });

    // 2️⃣ Actualizar relaciones en paralelo
    console.log('🔗 Actualizando relaciones...');
    await Promise.all([
      autores?.length ? MetadataRepository.replaceAutores(bookId, autores) : Promise.resolve(),
      personajes?.length ? MetadataRepository.replacePersonajes(bookId, personajes) : Promise.resolve(),
      categorias?.length ? MetadataRepository.replaceCategorias(bookId, categorias) : Promise.resolve(),
      generos?.length ? MetadataRepository.replaceGeneros(bookId, generos) : Promise.resolve(),
      etiquetas?.length ? MetadataRepository.replaceEtiquetas(bookId, etiquetas) : Promise.resolve(),
      valores?.length ? MetadataRepository.replaceValores(bookId, valores) : Promise.resolve(),
    ]);

    // 3️⃣ Reemplazar páginas
    console.log('📄 Reemplazando páginas...');
    await PagesRepository.replaceAll(bookId, pages);

    console.log('✅ Libro actualizado completamente');

    return NextResponse.json({
      success: true,
      message: 'Libro actualizado correctamente'
    });

  } catch (error: any) {
    console.error('❌ Error en PATCH /api/books/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar libro' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar libro
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id;

    console.log('🗑️ Eliminando libro:', bookId);

    await BooksRepository.delete(bookId);

    console.log('✅ Libro eliminado');

    return NextResponse.json({
      success: true,
      message: 'Libro eliminado correctamente'
    });

  } catch (error: any) {
    console.error('❌ Error en DELETE /api/books/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar libro' },
      { status: 500 }
    );
  }
}