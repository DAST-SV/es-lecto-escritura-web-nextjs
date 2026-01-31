// app/api/v1/books/[id]/route.ts
// API para gestión de un libro específico

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config';
import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/books/[id]
 * Obtiene un libro por su ID con todas sus relaciones
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID del libro es requerido' },
        { status: 400 }
      );
    }

    const book = await BookRepository.getComplete(id);

    if (!book) {
      return NextResponse.json(
        { error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('API Error - GET /api/v1/books/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener libro' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/books/[id]
 * Actualiza un libro existente
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID del libro es requerido' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validar campos requeridos
    if (!body.titulo || !body.titulo.trim()) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      );
    }

    const bookData = {
      titulo: body.titulo,
      descripcion: body.descripcion || '',
      portada: body.portada || null,
      pdfUrl: body.pdfUrl,
      autores: body.autores || [],
      personajes: body.personajes || [],
      categorias: body.categorias || [],
      generos: body.generos || [],
      etiquetas: body.etiquetas || [],
      valores: body.valores || [],
      nivel: body.nivel || null,
      pages: body.pages,
    };

    await BookRepository.update(id, bookData);

    return NextResponse.json({
      message: 'Libro actualizado exitosamente',
    });
  } catch (error) {
    console.error('API Error - PUT /api/v1/books/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar libro' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/books/[id]
 * Elimina un libro (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID del libro es requerido' },
        { status: 400 }
      );
    }

    await BookRepository.delete(id);

    return NextResponse.json({
      message: 'Libro eliminado exitosamente',
    });
  } catch (error) {
    console.error('API Error - DELETE /api/v1/books/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar libro' },
      { status: 500 }
    );
  }
}
