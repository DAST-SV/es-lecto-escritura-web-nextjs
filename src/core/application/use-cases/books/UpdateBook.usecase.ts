/**
 * UBICACIÓN: src/core/application/use-cases/books/UpdateBook.usecase.ts
 * ✅ ACTUALIZAR LIBRO: Edita título, descripción, portada y metadata
 */

import { createClient } from '@/src/utils/supabase/client';

interface UpdateBookData {
  titulo: string;
  descripcion: string;
  portada?: string;
  autores: string[];
  personajes: string[];
  categorias: number[];
  generos: number[];
  etiquetas: number[];
  valores: number[];
  nivel: number;
}

export class UpdateBookUseCase {
  static async execute(bookId: string, data: UpdateBookData): Promise<void> {
    const supabase = createClient();

    // 1. Verificar que el libro existe y pertenece al usuario
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data: book, error: checkError } = await supabase
      .from('books')
      .select('id, user_id')
      .eq('id', bookId)
      .single();

    if (checkError || !book) {
      throw new Error('Libro no encontrado');
    }

    if (book.user_id !== user.id) {
      throw new Error('No tienes permiso para editar este libro');
    }

    // 2. Actualizar datos básicos del libro
    const { error: updateError } = await supabase
      .from('books')
      .update({
        title: data.titulo,
        description: data.descripcion,
        cover_url: data.portada || null,
        authors: data.autores,
        characters: data.personajes,
        reading_level: data.nivel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookId);

    if (updateError) {
      throw new Error(`Error actualizando libro: ${updateError.message}`);
    }

    // 3. Actualizar categorías
    await supabase.from('book_book_categories').delete().eq('book_id', bookId);
    if (data.categorias.length > 0) {
      const categoriesData = data.categorias.map(catId => ({
        book_id: bookId,
        category_id: catId,
      }));
      const { error: catError } = await supabase
        .from('book_book_categories')
        .insert(categoriesData);
      if (catError) throw new Error(`Error actualizando categorías: ${catError.message}`);
    }

    // 4. Actualizar géneros
    await supabase.from('book_book_genres').delete().eq('book_id', bookId);
    if (data.generos.length > 0) {
      const genresData = data.generos.map(genId => ({
        book_id: bookId,
        genre_id: genId,
      }));
      const { error: genError } = await supabase
        .from('book_book_genres')
        .insert(genresData);
      if (genError) throw new Error(`Error actualizando géneros: ${genError.message}`);
    }

    // 5. Actualizar etiquetas
    await supabase.from('book_book_tags').delete().eq('book_id', bookId);
    if (data.etiquetas.length > 0) {
      const tagsData = data.etiquetas.map(tagId => ({
        book_id: bookId,
        tag_id: tagId,
      }));
      const { error: tagError } = await supabase
        .from('book_book_tags')
        .insert(tagsData);
      if (tagError) throw new Error(`Error actualizando etiquetas: ${tagError.message}`);
    }

    // 6. Actualizar valores
    await supabase.from('book_book_values').delete().eq('book_id', bookId);
    if (data.valores.length > 0) {
      const valuesData = data.valores.map(valId => ({
        book_id: bookId,
        value_id: valId,
      }));
      const { error: valError } = await supabase
        .from('book_book_values')
        .insert(valuesData);
      if (valError) throw new Error(`Error actualizando valores: ${valError.message}`);
    }

    console.log('✅ Libro actualizado:', bookId);
  }
}