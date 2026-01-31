// app/api/v1/books/route.ts
// API para gestión de libros del usuario autenticado

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config';
import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';

/**
 * GET /api/v1/books
 * Obtiene los libros del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const books = await BookRepository.findByUserId(user.id);

    return NextResponse.json({
      books,
      total: books.length,
    });
  } catch (error) {
    console.error('API Error - GET /api/v1/books:', error);
    return NextResponse.json(
      { error: 'Error al obtener libros' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/books
 * Crea un nuevo libro
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
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
      pdfUrl: body.pdfUrl || null,
      autores: body.autores || [],
      personajes: body.personajes || [],
      categorias: body.categorias || [],
      generos: body.generos || [],
      etiquetas: body.etiquetas || [],
      valores: body.valores || [],
      nivel: body.nivel || null,
      pages: body.pages || [],
    };

    const bookId = await BookRepository.create(user.id, bookData);

    return NextResponse.json({
      id: bookId,
      message: 'Libro creado exitosamente',
    }, { status: 201 });
  } catch (error) {
    console.error('API Error - POST /api/v1/books:', error);
    return NextResponse.json(
      { error: 'Error al crear libro' },
      { status: 500 }
    );
  }
}
