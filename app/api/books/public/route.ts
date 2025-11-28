/**
 * UBICACIÓN: app/api/books/public/route.ts
 * API para obtener todos los libros públicos
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/utils/supabase/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('books')
      .select('id, title, description, cover_url, created_at, user_id', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: libros, error, count } = await query;

    if (error) {
      throw new Error(`Error al obtener libros: ${error.message}`);
    }

    const librosConAutores = await Promise.all(
      (libros || []).map(async (libro) => {
        const autores = await getAutores(libro.id);
        return { 
          id_libro: libro.id,
          titulo: libro.title,
          descripcion: libro.description,
          portada: libro.cover_url,
          autores,
          fecha_creacion: libro.created_at,
          user_id: libro.user_id,
        };
      })
    );

    return NextResponse.json({ 
      books: librosConAutores,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener libros' },
      { status: 500 }
    );
  }
}

async function getAutores(libroId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('books_authors')
    .select('author_id, author_order')
    .eq('book_id', libroId)
    .order('author_order');

  if (error || !data?.length) return [];

  const autores: string[] = [];
  for (const rel of data) {
    const { data: autor } = await supabaseAdmin
      .from('book_authors')
      .select('name')
      .eq('id', rel.author_id)
      .single();
    
    if (autor?.name) {
      autores.push(autor.name);
    }
  }

  return autores;
}