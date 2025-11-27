/**
 * UBICACIÓN: src/infrastructure/repositories/books/BookRepository.ts
 * ✅ CORREGIDO: Trabaja con el nuevo schema books.*
 * 
 * NOTA IMPORTANTE: Supabase client no soporta schema prefix directamente.
 * Las tablas deben estar en el search_path o usar RPC functions.
 * Este código asume que el search_path incluye 'books' o que las tablas
 * están expuestas via API con sus nombres simples.
 */

import { supabaseAdmin } from '@/src/utils/supabase/admin';

interface PageData {
  layout: string;
  title?: string;
  text?: string;
  image?: string;
  background?: string;
}

interface BookData {
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
  pages: PageData[];
}

/**
 * Helper para ejecutar queries en el schema books
 * Supabase REST API requiere que las tablas estén expuestas
 */
const getTable = (tableName: string) => {
  // Si tu proyecto tiene las tablas expuestas con prefijo, usa esto:
  // return supabaseAdmin.from(`books_${tableName}`);
  // Si las tablas están en el search_path, usa el nombre directo:
  return supabaseAdmin.from(tableName);
};

export class BookRepository {
  
  /**
   * Crear un nuevo libro
   */
  static async create(userId: string, bookData: BookData): Promise<string> {
    console.log('📚 BookRepository.create - Iniciando creación de libro');
    console.log('👤 Usuario:', userId);
    console.log('📖 Datos:', {
      titulo: bookData.titulo,
      pagesCount: bookData.pages.length,
      autoresCount: bookData.autores.length
    });

    // 1. Crear el libro principal
    const { data: libro, error: libroError } = await getTable('books')
      .insert({
        user_id: userId,
        type_id: 2, // Usuario
        title: bookData.titulo,
        description: bookData.descripcion,
        cover_url: bookData.portada || null,
        level_id: bookData.nivel || null,
        is_published: false,
      })
      .select('id')
      .single();

    if (libroError) {
      console.error('❌ Error creando libro:', libroError);
      throw new Error(`Error al crear libro: ${libroError.message}`);
    }

    if (!libro?.id) {
      throw new Error('No se pudo obtener el ID del libro creado');
    }

    const libroId = libro.id;
    console.log('✅ Libro creado con ID:', libroId);

    // 2. Guardar relaciones en paralelo
    try {
      await Promise.all([
        this.saveAutores(libroId, bookData.autores),
        this.savePersonajes(libroId, bookData.personajes),
        this.saveCategorias(libroId, bookData.categorias),
        this.saveGeneros(libroId, bookData.generos),
        this.saveEtiquetas(libroId, bookData.etiquetas),
        this.saveValores(libroId, bookData.valores),
        this.savePages(libroId, bookData.pages),
      ]);

      console.log('✅ Todas las relaciones guardadas');
    } catch (relError: any) {
      console.error('❌ Error guardando relaciones:', relError);
      // Intentar limpiar el libro si falló algo
      await getTable('books').delete().eq('id', libroId);
      throw new Error(`Error al guardar relaciones: ${relError.message}`);
    }

    return libroId;
  }

  /**
   * Actualizar un libro existente
   */
  static async update(libroId: string, bookData: BookData): Promise<void> {
    console.log('📚 BookRepository.update - Actualizando libro:', libroId);

    // 1. Actualizar libro principal
    const { error: updateError } = await getTable('books')
      .update({
        title: bookData.titulo,
        description: bookData.descripcion,
        cover_url: bookData.portada || null,
        level_id: bookData.nivel || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', libroId);

    if (updateError) {
      console.error('❌ Error actualizando libro:', updateError);
      throw new Error(`Error al actualizar libro: ${updateError.message}`);
    }

    // 2. Reemplazar todas las relaciones
    try {
      await Promise.all([
        this.replaceAutores(libroId, bookData.autores),
        this.replacePersonajes(libroId, bookData.personajes),
        this.replaceCategorias(libroId, bookData.categorias),
        this.replaceGeneros(libroId, bookData.generos),
        this.replaceEtiquetas(libroId, bookData.etiquetas),
        this.replaceValores(libroId, bookData.valores),
        this.replacePages(libroId, bookData.pages),
      ]);

      console.log('✅ Libro actualizado correctamente');
    } catch (relError: any) {
      console.error('❌ Error actualizando relaciones:', relError);
      throw new Error(`Error al actualizar relaciones: ${relError.message}`);
    }
  }

  /**
   * Obtener libro completo con todas las relaciones
   */
  static async getComplete(libroId: string): Promise<any> {
    console.log('📚 BookRepository.getComplete - Obteniendo libro:', libroId);

    const { data: libro, error } = await getTable('books')
      .select('*')
      .eq('id', libroId)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('❌ Error obteniendo libro:', error);
      return null;
    }

    if (!libro) {
      console.warn('⚠️ Libro no encontrado');
      return null;
    }

    // Obtener todas las relaciones en paralelo
    const [autores, personajes, categorias, generos, valores, etiquetas, nivel, paginas] = 
      await Promise.all([
        this.getAutores(libroId),
        this.getPersonajes(libroId),
        this.getCategorias(libroId),
        this.getGeneros(libroId),
        this.getValores(libroId),
        this.getEtiquetas(libroId),
        this.getNivel(libro.level_id),
        this.getPages(libroId),
      ]);

    const result = {
      id: libro.id,
      titulo: libro.title,
      descripcion: libro.description,
      portada: libro.cover_url,
      autores,
      personajes,
      categorias,
      generos,
      valores,
      etiquetas,
      nivel,
      paginas,
      fecha_creacion: libro.created_at,
      is_published: libro.is_published,
    };

    console.log('✅ Libro obtenido:', {
      id: result.id,
      titulo: result.titulo,
      paginasCount: result.paginas.length
    });

    return result;
  }

  /**
   * Encontrar libros por usuario
   */
  static async findByUserId(userId: string): Promise<any[]> {
    console.log('📚 BookRepository.findByUserId - Usuario:', userId);

    const { data: libros, error } = await getTable('books')
      .select('id, title, description, cover_url, created_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo libros:', error);
      throw new Error(`Error al obtener libros: ${error.message}`);
    }

    // Obtener autores para cada libro
    const librosConAutores = await Promise.all(
      (libros || []).map(async (libro) => {
        const autores = await this.getAutores(libro.id);
        return { 
          id_libro: libro.id,
          titulo: libro.title,
          descripcion: libro.description,
          portada: libro.cover_url,
          autores,
          fecha_creacion: libro.created_at,
        };
      })
    );

    console.log('✅ Libros encontrados:', librosConAutores.length);
    return librosConAutores;
  }

  /**
   * Eliminar libro (soft delete)
   */
  static async delete(libroId: string): Promise<void> {
    console.log('📚 BookRepository.delete - Eliminando libro:', libroId);

    const { error } = await getTable('books')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', libroId);

    if (error) {
      console.error('❌ Error eliminando libro:', error);
      throw new Error(`Error al eliminar libro: ${error.message}`);
    }

    console.log('✅ Libro eliminado (soft delete)');
  }

  // ============================================
  // MÉTODOS PRIVADOS - AUTORES
  // ============================================
  
  private static async saveAutores(libroId: string, autores: string[]): Promise<void> {
    if (!autores.length) return;
    
    console.log('📝 Guardando autores:', autores);

    for (let idx = 0; idx < autores.length; idx++) {
      const nombre = autores[idx].trim();
      if (!nombre) continue;

      // Buscar o crear autor
      let autorId: string;

      const { data: existingAutor } = await getTable('book_authors')
        .select('id')
        .eq('name', nombre)
        .single();

      if (existingAutor?.id) {
        autorId = existingAutor.id;
      } else {
        const { data: newAutor, error: createError } = await getTable('book_authors')
          .insert({ name: nombre })
          .select('id')
          .single();

        if (createError || !newAutor?.id) {
          console.error('Error creando autor:', createError);
          continue;
        }
        autorId = newAutor.id;
      }

      // Crear relación libro-autor
      const { error: relError } = await getTable('books_authors')
        .insert({ 
          book_id: libroId, 
          author_id: autorId,
          author_order: idx + 1
        });

      if (relError) {
        console.error('Error creando relación autor:', relError);
      }
    }
  }

  private static async replaceAutores(libroId: string, autores: string[]): Promise<void> {
    await getTable('books_authors').delete().eq('book_id', libroId);
    await this.saveAutores(libroId, autores);
  }

  private static async getAutores(libroId: string): Promise<string[]> {
    const { data, error } = await getTable('books_authors')
      .select('author_id, author_order')
      .eq('book_id', libroId)
      .order('author_order');

    if (error || !data?.length) return [];

    const autores: string[] = [];
    for (const rel of data) {
      const { data: autor } = await getTable('book_authors')
        .select('name')
        .eq('id', rel.author_id)
        .single();
      
      if (autor?.name) {
        autores.push(autor.name);
      }
    }

    return autores;
  }

  // ============================================
  // MÉTODOS PRIVADOS - PERSONAJES
  // ============================================
  
  private static async savePersonajes(libroId: string, personajes: string[]): Promise<void> {
    if (!personajes.length) return;
    
    console.log('📝 Guardando personajes:', personajes);

    for (const nombre of personajes) {
      const trimmed = nombre.trim();
      if (!trimmed) continue;

      // Buscar o crear personaje
      let personajeId: string;

      const { data: existing } = await getTable('book_characters')
        .select('id')
        .eq('name', trimmed)
        .single();

      if (existing?.id) {
        personajeId = existing.id;
      } else {
        const { data: newChar, error } = await getTable('book_characters')
          .insert({ name: trimmed })
          .select('id')
          .single();

        if (error || !newChar?.id) continue;
        personajeId = newChar.id;
      }

      await getTable('books_characters')
        .insert({ book_id: libroId, character_id: personajeId });
    }
  }

  private static async replacePersonajes(libroId: string, personajes: string[]): Promise<void> {
    await getTable('books_characters').delete().eq('book_id', libroId);
    await this.savePersonajes(libroId, personajes);
  }

  private static async getPersonajes(libroId: string): Promise<string[]> {
    const { data, error } = await getTable('books_characters')
      .select('character_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const personajes: string[] = [];
    for (const rel of data) {
      const { data: char } = await getTable('book_characters')
        .select('name')
        .eq('id', rel.character_id)
        .single();
      
      if (char?.name) {
        personajes.push(char.name);
      }
    }

    return personajes;
  }

  // ============================================
  // MÉTODOS PRIVADOS - CATEGORÍAS
  // ============================================
  
  private static async saveCategorias(libroId: string, categorias: number[]): Promise<void> {
    if (!categorias.length) return;
    
    console.log('📝 Guardando categorías:', categorias);

    const inserts = categorias.map((category_id, idx) => ({ 
      book_id: libroId, 
      category_id,
      is_primary: idx === 0
    }));

    const { error } = await getTable('books_categories').insert(inserts);
    if (error) console.error('Error guardando categorías:', error);
  }

  private static async replaceCategorias(libroId: string, categorias: number[]): Promise<void> {
    await getTable('books_categories').delete().eq('book_id', libroId);
    await this.saveCategorias(libroId, categorias);
  }

  private static async getCategorias(libroId: string): Promise<string[]> {
    const { data, error } = await getTable('books_categories')
      .select('category_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const categorias: string[] = [];
    for (const rel of data) {
      const { data: cat } = await getTable('book_categories')
        .select('name')
        .eq('id', rel.category_id)
        .single();
      
      if (cat?.name) {
        categorias.push(cat.name);
      }
    }

    return categorias;
  }

  // ============================================
  // MÉTODOS PRIVADOS - GÉNEROS
  // ============================================
  
  private static async saveGeneros(libroId: string, generos: number[]): Promise<void> {
    if (!generos.length) return;
    
    console.log('📝 Guardando géneros:', generos);

    const inserts = generos.map(genre_id => ({ book_id: libroId, genre_id }));
    const { error } = await getTable('books_genres').insert(inserts);
    if (error) console.error('Error guardando géneros:', error);
  }

  private static async replaceGeneros(libroId: string, generos: number[]): Promise<void> {
    await getTable('books_genres').delete().eq('book_id', libroId);
    await this.saveGeneros(libroId, generos);
  }

  private static async getGeneros(libroId: string): Promise<string[]> {
    const { data, error } = await getTable('books_genres')
      .select('genre_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const generos: string[] = [];
    for (const rel of data) {
      const { data: genre } = await getTable('book_genres')
        .select('name')
        .eq('id', rel.genre_id)
        .single();
      
      if (genre?.name) {
        generos.push(genre.name);
      }
    }

    return generos;
  }

  // ============================================
  // MÉTODOS PRIVADOS - ETIQUETAS
  // ============================================
  
  private static async saveEtiquetas(libroId: string, etiquetas: number[]): Promise<void> {
    if (!etiquetas.length) return;
    
    console.log('📝 Guardando etiquetas:', etiquetas);

    const inserts = etiquetas.map((tag_id, idx) => ({ 
      book_id: libroId, 
      tag_id,
      is_primary: idx === 0
    }));

    const { error } = await getTable('books_tags').insert(inserts);
    if (error) console.error('Error guardando etiquetas:', error);
  }

  private static async replaceEtiquetas(libroId: string, etiquetas: number[]): Promise<void> {
    await getTable('books_tags').delete().eq('book_id', libroId);
    await this.saveEtiquetas(libroId, etiquetas);
  }

  private static async getEtiquetas(libroId: string): Promise<string[]> {
    const { data, error } = await getTable('books_tags')
      .select('tag_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const etiquetas: string[] = [];
    for (const rel of data) {
      const { data: tag } = await getTable('book_tags')
        .select('name')
        .eq('id', rel.tag_id)
        .single();
      
      if (tag?.name) {
        etiquetas.push(tag.name);
      }
    }

    return etiquetas;
  }

  // ============================================
  // MÉTODOS PRIVADOS - VALORES
  // ============================================
  
  private static async saveValores(libroId: string, valores: number[]): Promise<void> {
    if (!valores.length) return;
    
    console.log('📝 Guardando valores:', valores);

    const inserts = valores.map((value_id, idx) => ({ 
      book_id: libroId, 
      value_id,
      is_primary: idx === 0
    }));

    const { error } = await getTable('books_values').insert(inserts);
    if (error) console.error('Error guardando valores:', error);
  }

  private static async replaceValores(libroId: string, valores: number[]): Promise<void> {
    await getTable('books_values').delete().eq('book_id', libroId);
    await this.saveValores(libroId, valores);
  }

  private static async getValores(libroId: string): Promise<string[]> {
    const { data, error } = await getTable('books_values')
      .select('value_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const valores: string[] = [];
    for (const rel of data) {
      const { data: value } = await getTable('book_values')
        .select('name')
        .eq('id', rel.value_id)
        .single();
      
      if (value?.name) {
        valores.push(value.name);
      }
    }

    return valores;
  }

  // ============================================
  // MÉTODOS PRIVADOS - NIVEL
  // ============================================
  
  private static async getNivel(idNivel: number | null): Promise<any> {
    if (!idNivel) return null;
    
    const { data } = await getTable('book_levels')
      .select('*')
      .eq('id', idNivel)
      .single();
    
    return data || null;
  }

  // ============================================
  // MÉTODOS PRIVADOS - PÁGINAS
  // ============================================
  
  private static async savePages(libroId: string, pages: PageData[]): Promise<void> {
    if (!pages.length) return;
    
    console.log('📝 Guardando páginas:', pages.length);

    const paginasToInsert = pages.map((p, idx) => ({
      book_id: libroId,
      page_number: idx + 1,
      layout: p.layout || 'TextCenterLayout',
      title: p.title || null,
      content: p.text || null,
      image_url: p.image || null,
      background_url: this.isImageUrl(p.background) ? p.background : null,
      background_color: this.isColor(p.background) ? p.background : null,
    }));

    const { error } = await getTable('book_pages').insert(paginasToInsert);
    if (error) {
      console.error('Error guardando páginas:', error);
      throw new Error(`Error al guardar páginas: ${error.message}`);
    }
  }

  private static async replacePages(libroId: string, pages: PageData[]): Promise<void> {
    await getTable('book_pages').delete().eq('book_id', libroId);
    await this.savePages(libroId, pages);
  }

  private static async getPages(libroId: string): Promise<any[]> {
    const { data, error } = await getTable('book_pages')
      .select('*')
      .eq('book_id', libroId)
      .order('page_number');

    if (error) {
      console.error('Error obteniendo páginas:', error);
      return [];
    }

    // Transformar al formato esperado por el frontend
    return (data || []).map(page => ({
      id: page.id,
      layout: page.layout || 'TextCenterLayout',
      title: page.title || '',
      text: page.content || '',
      image: page.image_url || null,
      background: page.background_url || page.background_color || 'blanco',
      page_number: page.page_number,
    }));
  }

  // ============================================
  // HELPERS
  // ============================================

  private static isImageUrl(value: string | null | undefined): boolean {
    if (!value) return false;
    return value.startsWith('http://') || 
           value.startsWith('https://') || 
           value.startsWith('blob:');
  }

  private static isColor(value: string | null | undefined): boolean {
    if (!value) return false;
    // Color hex o nombre de preset
    return value.startsWith('#') || 
           (!value.startsWith('http') && !value.startsWith('blob:'));
  }
}