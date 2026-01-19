/**
 * UBICACIÓN: src/infrastructure/repositories/books/BookRepository.ts
 * ✅ COMPLETO: Soporte para PDFs + Etiquetas + Todas las relaciones
 */

import { getSupabaseAdmin } from "../../config/supabase.config";


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
  pdfUrl?: string;
  autores: string[];
  personajes: string[];
  categorias: number[];
  generos: number[];
  etiquetas: number[];
  valores: number[];
  nivel: number;
  pages?: PageData[];
}

export class BookRepository {
  
  /**
   * ============================================
   * CREATE - Crear un nuevo libro
   * ============================================
   */
  static async create(userId: string, bookData: BookData): Promise<string> {
    console.log('📚 BookRepository.create');
    console.log('👤 Usuario:', userId);
    console.log('📖 Datos:', {
      titulo: bookData.titulo,
      pdfUrl: bookData.pdfUrl ? '✅ Tiene PDF' : '❌ Sin PDF',
      pagesCount: bookData.pages?.length || 0,
      autoresCount: bookData.autores.length,
      etiquetasCount: bookData.etiquetas?.length || 0,
    });

    try {
      const supabaseAdmin = getSupabaseAdmin();

      // 1️⃣ Crear libro principal
      const { data: libro, error: libroError } = await supabaseAdmin
        .from('books')
        .insert({
          user_id: userId,
          type_id: 2, // Usuario
          title: bookData.titulo,
          description: bookData.descripcion,
          cover_url: bookData.portada || null,
          pdf_url: bookData.pdfUrl || null,
          level_id: bookData.nivel || null,
          is_published: false,
        })
        .select('id')
        .single();

      if (libroError || !libro?.id) {
        console.error('❌ Error creando libro:', libroError);
        throw new Error(`Error al crear libro: ${libroError?.message || 'ID no generado'}`);
      }

      const libroId = libro.id;
      console.log('✅ Libro creado con ID:', libroId);

      // 2️⃣ Guardar páginas (SOLO si hay pages)
      if (bookData.pages && bookData.pages.length > 0) {
        try {
          await this.savePages(libroId, bookData.pages);
          console.log('✅ Páginas guardadas');
        } catch (pageError: any) {
          console.error('❌ Error guardando páginas:', pageError);
          // Rollback: eliminar libro
          await getSupabaseAdmin().from('books').delete().eq('id', libroId);
          throw new Error(`Error al guardar páginas: ${pageError.message}`);
        }
      } else {
        console.log('ℹ️ Libro sin páginas editables (PDF directo)');
      }

      // 3️⃣ Guardar relaciones (sin fallar si alguna falla)
      await Promise.allSettled([
        this.saveAutores(libroId, bookData.autores),
        this.savePersonajes(libroId, bookData.personajes),
        this.saveCategorias(libroId, bookData.categorias),
        this.saveGeneros(libroId, bookData.generos),
        this.saveEtiquetas(libroId, bookData.etiquetas),  // ✅ AGREGADO
        this.saveValores(libroId, bookData.valores),
      ]);
      console.log('✅ Relaciones guardadas (incluyendo etiquetas)');

      return libroId;
    } catch (error) {
      console.error('❌ Error en create:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * UPDATE - Actualizar libro existente
   * ============================================
   */
  static async update(libroId: string, bookData: BookData): Promise<void> {
    console.log('📚 BookRepository.update:', libroId);

    try {
      // 1️⃣ Actualizar libro principal
      const updateData: any = {
        title: bookData.titulo,
        description: bookData.descripcion,
        cover_url: bookData.portada || null,
        level_id: bookData.nivel || null,
        updated_at: new Date().toISOString(),
      };

      if (bookData.pdfUrl !== undefined) {
        updateData.pdf_url = bookData.pdfUrl;
      }

      const { error: updateError } = await getSupabaseAdmin()
        .from('books')
        .update(updateData)
        .eq('id', libroId);

      if (updateError) {
        throw new Error(`Error al actualizar libro: ${updateError.message}`);
      }

      // 2️⃣ Reemplazar páginas (solo si se proporcionan)
      if (bookData.pages) {
        await this.replacePages(libroId, bookData.pages);
      }

      // 3️⃣ Actualizar relaciones
      await Promise.allSettled([
        this.replaceAutores(libroId, bookData.autores),
        this.replacePersonajes(libroId, bookData.personajes),
        this.replaceCategorias(libroId, bookData.categorias),
        this.replaceGeneros(libroId, bookData.generos),
        this.replaceEtiquetas(libroId, bookData.etiquetas),  // ✅ AGREGADO
        this.replaceValores(libroId, bookData.valores),
      ]);

      console.log('✅ Libro actualizado (incluyendo etiquetas)');
    } catch (error) {
      console.error('❌ Error en update:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * GET COMPLETE - Obtener libro con relaciones
   * ============================================
   */
  static async getComplete(libroId: string): Promise<any> {
    console.log('📚 BookRepository.getComplete:', libroId);

    const { data: libro, error } = await getSupabaseAdmin()
      .from('books')
      .select('*')
      .eq('id', libroId)
      .is('deleted_at', null)
      .single();

    if (error || !libro) {
      console.error('❌ Libro no encontrado:', error);
      return null;
    }

    // Obtener todas las relaciones en paralelo (incluyendo etiquetas)
    const [autores, personajes, categorias, generos, valores, etiquetas, nivel, paginas] = 
      await Promise.all([
        this.getAutores(libroId),
        this.getPersonajes(libroId),
        this.getCategorias(libroId),
        this.getGeneros(libroId),
        this.getValores(libroId),
        this.getEtiquetas(libroId),  // ✅ AGREGADO
        this.getNivel(libro.level_id),
        this.getPages(libroId),
      ]);

    return {
      id: libro.id,
      titulo: libro.title,
      descripcion: libro.description,
      portada: libro.cover_url,
      pdfUrl: libro.pdf_url,
      autores,
      personajes,
      categorias,
      generos,
      valores,
      etiquetas,  // ✅ AGREGADO
      nivel,
      paginas,
      fecha_creacion: libro.created_at,
      is_published: libro.is_published,
    };
  }

  /**
   * ============================================
   * FIND BY USER - Libros por usuario
   * ============================================
   */
  static async findByUserId(userId: string): Promise<any[]> {
    console.log('📚 BookRepository.findByUserId:', userId);

    const { data: libros, error } = await getSupabaseAdmin()
      .from('books')
      .select('id, title, description, cover_url, pdf_url, created_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener libros: ${error.message}`);
    }

    const librosConAutores = await Promise.all(
      (libros || []).map(async (libro) => {
        const autores = await this.getAutores(libro.id);
        return { 
          id_libro: libro.id,
          titulo: libro.title,
          descripcion: libro.description,
          portada: libro.cover_url,
          pdfUrl: libro.pdf_url,
          autores,
          fecha_creacion: libro.created_at,
        };
      })
    );

    return librosConAutores;
  }

  /**
   * ============================================
   * DELETE - Soft delete
   * ============================================
   */
  static async delete(libroId: string): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from('books')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', libroId);

    if (error) {
      throw new Error(`Error al eliminar libro: ${error.message}`);
    }
  }

  /**
   * ============================================
   * PÁGINAS - CRUD
   * ============================================
   */
  
  private static async savePages(libroId: string, pages: PageData[]): Promise<void> {
    if (!pages.length) return;

    const paginasToInsert = pages.map((p, idx) => ({
      book_id: libroId,
      page_number: idx + 1,
      layout: p.layout || 'TextCenterLayout',
      title: p.title || null,
      content: p.text || null,
      image_url: this.cleanUrl(p.image),
      background_url: this.isImageUrl(p.background) ? this.cleanUrl(p.background) : null,
      background_color: this.isColor(p.background) ? p.background : null,
    }));

    const { error } = await getSupabaseAdmin()
      .from('book_pages')
      .insert(paginasToInsert);

    if (error) {
      throw new Error(`Error al guardar páginas: ${error.message}`);
    }
  }

  private static async replacePages(libroId: string, pages: PageData[]): Promise<void> {
    await getSupabaseAdmin().from('book_pages').delete().eq('book_id', libroId);
    if (pages.length > 0) {
      await this.savePages(libroId, pages);
    }
  }

  private static async getPages(libroId: string): Promise<any[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('book_pages')
      .select('*')
      .eq('book_id', libroId)
      .order('page_number');

    if (error) return [];

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

  /**
   * ============================================
   * AUTORES
   * ============================================
   */
  
  private static async saveAutores(libroId: string, autores: string[]): Promise<void> {
    if (!autores.length) return;

    for (let idx = 0; idx < autores.length; idx++) {
      const nombre = autores[idx]?.trim();
      if (!nombre) continue;

      try {
        let { data: existingAutor } = await getSupabaseAdmin()
          .from('book_authors')
          .select('id')
          .eq('name', nombre)
          .single();

        let autorId: string;

        if (existingAutor?.id) {
          autorId = existingAutor.id;
        } else {
          const { data: newAutor, error } = await getSupabaseAdmin()
            .from('book_authors')
            .insert({ name: nombre })
            .select('id')
            .single();

          if (error || !newAutor?.id) continue;
          autorId = newAutor.id;
        }

        await getSupabaseAdmin()
          .from('books_authors')
          .insert({ 
            book_id: libroId, 
            author_id: autorId,
            author_order: idx + 1
          });

      } catch (err) {
        console.warn('⚠️ Error con autor:', nombre, err);
      }
    }
  }

  private static async replaceAutores(libroId: string, autores: string[]): Promise<void> {
    await getSupabaseAdmin().from('books_authors').delete().eq('book_id', libroId);
    await this.saveAutores(libroId, autores);
  }

  private static async getAutores(libroId: string): Promise<string[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('books_authors')
      .select('author_id, author_order')
      .eq('book_id', libroId)
      .order('author_order');

    if (error || !data?.length) return [];

    const autores: string[] = [];
    for (const rel of data) {
      const { data: autor } = await getSupabaseAdmin()
        .from('book_authors')
        .select('name')
        .eq('id', rel.author_id)
        .single();
      
      if (autor?.name) autores.push(autor.name);
    }

    return autores;
  }

  /**
   * ============================================
   * PERSONAJES
   * ============================================
   */
  
  private static async savePersonajes(libroId: string, personajes: string[]): Promise<void> {
    if (!personajes.length) return;

    for (const nombre of personajes) {
      const trimmed = nombre?.trim();
      if (!trimmed) continue;

      try {
        let { data: existing } = await getSupabaseAdmin()
          .from('book_characters')
          .select('id')
          .eq('name', trimmed)
          .single();

        let personajeId: string;

        if (existing?.id) {
          personajeId = existing.id;
        } else {
          const { data: newChar, error } = await getSupabaseAdmin()
            .from('book_characters')
            .insert({ name: trimmed })
            .select('id')
            .single();

          if (error || !newChar?.id) continue;
          personajeId = newChar.id;
        }

        await getSupabaseAdmin()
          .from('books_characters')
          .insert({ book_id: libroId, character_id: personajeId });

      } catch (err) {
        console.warn('⚠️ Error con personaje:', trimmed);
      }
    }
  }

  private static async replacePersonajes(libroId: string, personajes: string[]): Promise<void> {
    await getSupabaseAdmin().from('books_characters').delete().eq('book_id', libroId);
    await this.savePersonajes(libroId, personajes);
  }

  private static async getPersonajes(libroId: string): Promise<string[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('books_characters')
      .select('character_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const personajes: string[] = [];
    for (const rel of data) {
      const { data: char } = await getSupabaseAdmin()
        .from('book_characters')
        .select('name')
        .eq('id', rel.character_id)
        .single();
      
      if (char?.name) personajes.push(char.name);
    }

    return personajes;
  }

  /**
   * ============================================
   * CATEGORÍAS
   * ============================================
   */
  
  private static async saveCategorias(libroId: string, categorias: number[]): Promise<void> {
    if (!categorias.length) return;
    const inserts = categorias.map((category_id, idx) => ({ 
      book_id: libroId, 
      category_id,
      is_primary: idx === 0
    }));
    await getSupabaseAdmin().from('books_categories').insert(inserts);
  }

  private static async replaceCategorias(libroId: string, categorias: number[]): Promise<void> {
    await getSupabaseAdmin().from('books_categories').delete().eq('book_id', libroId);
    await this.saveCategorias(libroId, categorias);
  }

  private static async getCategorias(libroId: string): Promise<string[]> {
    const { data } = await getSupabaseAdmin()
      .from('books_categories')
      .select('category_id')
      .eq('book_id', libroId);

    if (!data?.length) return [];

    const categorias: string[] = [];
    for (const rel of data) {
      const { data: cat } = await getSupabaseAdmin()
        .from('book_categories')
        .select('name')
        .eq('id', rel.category_id)
        .single();
      if (cat?.name) categorias.push(cat.name);
    }
    return categorias;
  }

  /**
   * ============================================
   * GÉNEROS
   * ============================================
   */
  
  private static async saveGeneros(libroId: string, generos: number[]): Promise<void> {
    if (!generos.length) return;
    const inserts = generos.map(genre_id => ({ book_id: libroId, genre_id }));
    await getSupabaseAdmin().from('books_genres').insert(inserts);
  }

  private static async replaceGeneros(libroId: string, generos: number[]): Promise<void> {
    await getSupabaseAdmin().from('books_genres').delete().eq('book_id', libroId);
    await this.saveGeneros(libroId, generos);
  }

  private static async getGeneros(libroId: string): Promise<string[]> {
    const { data } = await getSupabaseAdmin()
      .from('books_genres')
      .select('genre_id')
      .eq('book_id', libroId);

    if (!data?.length) return [];

    const generos: string[] = [];
    for (const rel of data) {
      const { data: genre } = await getSupabaseAdmin()
        .from('book_genres')
        .select('name')
        .eq('id', rel.genre_id)
        .single();
      if (genre?.name) generos.push(genre.name);
    }
    return generos;
  }

  /**
   * ============================================
   * ETIQUETAS ✅ NUEVO
   * ============================================
   */
  
  private static async saveEtiquetas(libroId: string, etiquetas: number[]): Promise<void> {
    if (!etiquetas.length) return;
    
    const inserts = etiquetas.map((tag_id, idx) => ({ 
      book_id: libroId, 
      tag_id,
      is_primary: idx === 0
    }));
    
    await getSupabaseAdmin().from('books_tags').insert(inserts);
    console.log(`✅ Etiquetas guardadas: ${etiquetas.length}`);
  }

  private static async replaceEtiquetas(libroId: string, etiquetas: number[]): Promise<void> {
    await getSupabaseAdmin().from('books_tags').delete().eq('book_id', libroId);
    await this.saveEtiquetas(libroId, etiquetas);
    console.log(`✅ Etiquetas reemplazadas: ${etiquetas.length}`);
  }

  private static async getEtiquetas(libroId: string): Promise<string[]> {
    const { data } = await getSupabaseAdmin()
      .from('books_tags')
      .select('tag_id')
      .eq('book_id', libroId);

    if (!data?.length) return [];

    const etiquetas: string[] = [];
    for (const rel of data) {
      const { data: tag } = await getSupabaseAdmin()
        .from('book_tags')
        .select('name')
        .eq('id', rel.tag_id)
        .single();
      if (tag?.name) etiquetas.push(tag.name);
    }
    
    console.log(`✅ Etiquetas recuperadas: ${etiquetas.length}`);
    return etiquetas;
  }

  /**
   * ============================================
   * VALORES
   * ============================================
   */
  
  private static async saveValores(libroId: string, valores: number[]): Promise<void> {
    if (!valores.length) return;
    const inserts = valores.map((value_id, idx) => ({ 
      book_id: libroId, 
      value_id,
      is_primary: idx === 0
    }));
    await getSupabaseAdmin().from('books_values').insert(inserts);
  }

  private static async replaceValores(libroId: string, valores: number[]): Promise<void> {
    await getSupabaseAdmin().from('books_values').delete().eq('book_id', libroId);
    await this.saveValores(libroId, valores);
  }

  private static async getValores(libroId: string): Promise<string[]> {
    const { data } = await getSupabaseAdmin()
      .from('books_values')
      .select('value_id')
      .eq('book_id', libroId);

    if (!data?.length) return [];

    const valores: string[] = [];
    for (const rel of data) {
      const { data: value } = await getSupabaseAdmin()
        .from('book_values')
        .select('name')
        .eq('id', rel.value_id)
        .single();
      if (value?.name) valores.push(value.name);
    }
    return valores;
  }

  /**
   * ============================================
   * NIVEL
   * ============================================
   */
  
  private static async getNivel(idNivel: number | null): Promise<any> {
    if (!idNivel) return null;
    const { data } = await getSupabaseAdmin()
      .from('book_levels')
      .select('*')
      .eq('id', idNivel)
      .single();
    return data || null;
  }

  /**
   * ============================================
   * HELPERS
   * ============================================
   */

  private static cleanUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('blob:')) return null;
    return url;
  }

  private static isImageUrl(value: string | null | undefined): boolean {
    if (!value) return false;
    return value.startsWith('http://') || value.startsWith('https://');
  }

  private static isColor(value: string | null | undefined): boolean {
    if (!value) return false;
    return value.startsWith('#') || (!value.startsWith('http') && !value.startsWith('blob:'));
  }
}