/**
 * UBICACIÓN: src/infrastructure/repositories/books/BookRepository.ts
 * ✅ ACTUALIZADO: Trabaja con el nuevo schema books.*
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

export class BookRepository {
  
  /**
   * Crear un nuevo libro
   */
  static async create(userId: string, bookData: BookData): Promise<string> {
    // 1. Crear el libro principal
    const { data: libro, error: libroError } = await supabaseAdmin
      .from('books.books')
      .insert({
        user_id: userId,
        type_id: 2, // Usuario
        title: bookData.titulo,
        description: bookData.descripcion,
        cover_url: bookData.portada || null,
        level_id: bookData.nivel,
        is_published: false,
      })
      .select('id')
      .single();

    if (libroError) throw libroError;

    const libroId = libro.id;

    // 2. Guardar relaciones en paralelo
    await Promise.all([
      this.saveAutores(libroId, bookData.autores),
      this.savePersonajes(libroId, bookData.personajes),
      this.saveCategorias(libroId, bookData.categorias),
      this.saveGeneros(libroId, bookData.generos),
      this.saveEtiquetas(libroId, bookData.etiquetas),
      this.saveValores(libroId, bookData.valores),
      this.savePages(libroId, bookData.pages),
    ]);

    return libroId;
  }

  /**
   * Actualizar un libro existente
   */
  static async update(libroId: string, bookData: BookData): Promise<void> {
    // 1. Actualizar libro principal
    const { error: updateError } = await supabaseAdmin
      .from('books.books')
      .update({
        title: bookData.titulo,
        description: bookData.descripcion,
        cover_url: bookData.portada || null,
        level_id: bookData.nivel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', libroId);

    if (updateError) throw updateError;

    // 2. Reemplazar todas las relaciones
    await Promise.all([
      this.replaceAutores(libroId, bookData.autores),
      this.replacePersonajes(libroId, bookData.personajes),
      this.replaceCategorias(libroId, bookData.categorias),
      this.replaceGeneros(libroId, bookData.generos),
      this.replaceEtiquetas(libroId, bookData.etiquetas),
      this.replaceValores(libroId, bookData.valores),
      this.replacePages(libroId, bookData.pages),
    ]);
  }

  /**
   * Obtener libro completo con todas las relaciones
   */
  static async getComplete(libroId: string): Promise<any> {
    const { data: libro, error } = await supabaseAdmin
      .from('books.books')
      .select('*')
      .eq('id', libroId)
      .is('deleted_at', null)
      .single();

    if (error || !libro) return null;

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

    return {
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
    };
  }

  /**
   * Encontrar libros por usuario
   */
  static async findByUserId(userId: string): Promise<any[]> {
    const { data: libros, error } = await supabaseAdmin
      .from('books.books')
      .select('id, title, description, cover_url, created_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

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

    return librosConAutores;
  }

  /**
   * Eliminar libro (soft delete)
   */
  static async delete(libroId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('books.books')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', libroId);

    if (error) throw error;
  }

  // ============================================
  // MÉTODOS PRIVADOS - AUTORES
  // ============================================
  
  private static async saveAutores(libroId: string, autores: string[]): Promise<void> {
    if (!autores.length) return;
    
    const autoresIds = await Promise.all(
      autores.map(async (nombre) => {
        const { data } = await supabaseAdmin
          .from('books.book_authors')
          .insert({ name: nombre.trim() })
          .select('id')
          .single();
        return data?.id;
      })
    );
    
    await supabaseAdmin
      .from('books.books_authors')
      .insert(autoresIds.filter(Boolean).map((author_id, idx) => ({ 
        book_id: libroId, 
        author_id,
        author_order: idx + 1
      })));
  }

  private static async replaceAutores(libroId: string, autores: string[]): Promise<void> {
    await supabaseAdmin.from('books.books_authors').delete().eq('book_id', libroId);
    await this.saveAutores(libroId, autores);
  }

  private static async getAutores(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('books.books_authors')
      .select('book_authors(name)')
      .eq('book_id', libroId)
      .order('author_order');
    
    return data?.map((item: any) => item.book_authors.name).filter(Boolean) || [];
  }

  // ============================================
  // MÉTODOS PRIVADOS - PERSONAJES
  // ============================================
  
  private static async savePersonajes(libroId: string, personajes: string[]): Promise<void> {
    if (!personajes.length) return;
    
    const personajesIds = await Promise.all(
      personajes.map(async (nombre) => {
        const { data } = await supabaseAdmin
          .from('books.book_characters')
          .insert({ name: nombre.trim() })
          .select('id')
          .single();
        return data?.id;
      })
    );
    
    await supabaseAdmin
      .from('books.books_characters')
      .insert(personajesIds.filter(Boolean).map(character_id => ({ 
        book_id: libroId, 
        character_id 
      })));
  }

  private static async replacePersonajes(libroId: string, personajes: string[]): Promise<void> {
    await supabaseAdmin.from('books.books_characters').delete().eq('book_id', libroId);
    await this.savePersonajes(libroId, personajes);
  }

  private static async getPersonajes(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('books.books_characters')
      .select('book_characters(name)')
      .eq('book_id', libroId);
    
    return data?.map((item: any) => item.book_characters.name).filter(Boolean) || [];
  }

  // ============================================
  // MÉTODOS PRIVADOS - CATEGORÍAS
  // ============================================
  
  private static async saveCategorias(libroId: string, categorias: number[]): Promise<void> {
    if (!categorias.length) return;
    
    await supabaseAdmin
      .from('books.books_categories')
      .insert(categorias.map((category_id, idx) => ({ 
        book_id: libroId, 
        category_id,
        is_primary: idx === 0
      })));
  }

  private static async replaceCategorias(libroId: string, categorias: number[]): Promise<void> {
    await supabaseAdmin.from('books.books_categories').delete().eq('book_id', libroId);
    await this.saveCategorias(libroId, categorias);
  }

  private static async getCategorias(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('books.books_categories')
      .select('book_categories(name)')
      .eq('book_id', libroId);
    
    return data?.map((item: any) => item.book_categories.name).filter(Boolean) || [];
  }

  // ============================================
  // MÉTODOS PRIVADOS - GÉNEROS
  // ============================================
  
  private static async saveGeneros(libroId: string, generos: number[]): Promise<void> {
    if (!generos.length) return;
    
    await supabaseAdmin
      .from('books.books_genres')
      .insert(generos.map(genre_id => ({ book_id: libroId, genre_id })));
  }

  private static async replaceGeneros(libroId: string, generos: number[]): Promise<void> {
    await supabaseAdmin.from('books.books_genres').delete().eq('book_id', libroId);
    await this.saveGeneros(libroId, generos);
  }

  private static async getGeneros(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('books.books_genres')
      .select('book_genres(name)')
      .eq('book_id', libroId);
    
    return data?.map((item: any) => item.book_genres.name).filter(Boolean) || [];
  }

  // ============================================
  // MÉTODOS PRIVADOS - ETIQUETAS
  // ============================================
  
  private static async saveEtiquetas(libroId: string, etiquetas: number[]): Promise<void> {
    if (!etiquetas.length) return;
    
    await supabaseAdmin
      .from('books.books_tags')
      .insert(etiquetas.map((tag_id, idx) => ({ 
        book_id: libroId, 
        tag_id,
        is_primary: idx === 0
      })));
  }

  private static async replaceEtiquetas(libroId: string, etiquetas: number[]): Promise<void> {
    await supabaseAdmin.from('books.books_tags').delete().eq('book_id', libroId);
    await this.saveEtiquetas(libroId, etiquetas);
  }

  private static async getEtiquetas(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('books.books_tags')
      .select('book_tags(name)')
      .eq('book_id', libroId);
    
    return data?.map((item: any) => item.book_tags.name).filter(Boolean) || [];
  }

  // ============================================
  // MÉTODOS PRIVADOS - VALORES
  // ============================================
  
  private static async saveValores(libroId: string, valores: number[]): Promise<void> {
    if (!valores.length) return;
    
    await supabaseAdmin
      .from('books.books_values')
      .insert(valores.map((value_id, idx) => ({ 
        book_id: libroId, 
        value_id,
        is_primary: idx === 0
      })));
  }

  private static async replaceValores(libroId: string, valores: number[]): Promise<void> {
    await supabaseAdmin.from('books.books_values').delete().eq('book_id', libroId);
    await this.saveValores(libroId, valores);
  }

  private static async getValores(libroId: string): Promise<string[]> {
    const { data } = await supabaseAdmin
      .from('books.books_values')
      .select('book_values(name)')
      .eq('book_id', libroId);
    
    return data?.map((item: any) => item.book_values.name).filter(Boolean) || [];
  }

  // ============================================
  // MÉTODOS PRIVADOS - NIVEL
  // ============================================
  
  private static async getNivel(idNivel: number): Promise<any> {
    if (!idNivel) return null;
    
    const { data } = await supabaseAdmin
      .from('books.book_levels')
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
    
    const paginasToInsert = pages.map((p, idx) => ({
      book_id: libroId,
      page_number: idx + 1,
      layout: p.layout,
      title: p.title || null,
      content: p.text || null,
      image_url: p.image || null,
      background_url: p.background || null,
      background_color: null,
      text_color: null,
      font: null,
      border_style: null,
      animation: null,
      audio_url: null,
      interactive_game: null,
      items: null,
    }));
    
    await supabaseAdmin.from('books.book_pages').insert(paginasToInsert);
  }

  private static async replacePages(libroId: string, pages: PageData[]): Promise<void> {
    await supabaseAdmin.from('books.book_pages').delete().eq('book_id', libroId);
    await this.savePages(libroId, pages);
  }

  private static async getPages(libroId: string): Promise<any[]> {
    const { data } = await supabaseAdmin
      .from('books.book_pages')
      .select('*')
      .eq('book_id', libroId)
      .order('page_number');
    
    return data || [];
  }
}