/**
 * UBICACIÓN: src/infrastructure/repositories/books/BookRepository.ts
 * ✅ VERSIÓN HÍBRIDA: Soporta libros con páginas O con PDF
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
  pdfUrl?: string; // ✅ NUEVO: Soporte para PDF
  autores: string[];
  personajes: string[];
  categorias: number[];
  generos: number[];
  etiquetas: number[];
  valores: number[];
  nivel: number;
  pages?: PageData[]; // ✅ AHORA OPCIONAL
}

export class BookRepository {
  
  /**
   * Crear un nuevo libro
   */
  static async create(userId: string, bookData: BookData): Promise<string> {
    console.log('📚 BookRepository.create - Iniciando creación de libro');
    console.log('👤 Usuario:', userId);
    console.log('📖 Datos:', {
      titulo: bookData.titulo,
      pagesCount: bookData.pages?.length || 0,
      pdfUrl: bookData.pdfUrl || 'N/A',
      autoresCount: bookData.autores.length
    });

    // 1. Crear el libro principal usando RPC o inserción directa
    const { data: libro, error: libroError } = await supabaseAdmin
      .from('books')
      .insert({
        user_id: userId,
        type_id: 2, // Usuario
        title: bookData.titulo,
        description: bookData.descripcion,
        cover_url: bookData.portada || null,
        level_id: bookData.nivel || null,
        pdf_url: bookData.pdfUrl || null, // ✅ NUEVO
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

    // 2. Guardar páginas SOLO SI existen
    if (bookData.pages && bookData.pages.length > 0) {
      try {
        await this.savePages(libroId, bookData.pages);
        console.log('✅ Páginas guardadas');
      } catch (pageError: any) {
        console.error('❌ Error guardando páginas:', pageError);
        // Solo fallar si NO tiene PDF alternativo
        if (!bookData.pdfUrl) {
          await supabaseAdmin.from('books').delete().eq('id', libroId);
          throw new Error(`Error al guardar páginas: ${pageError.message}`);
        }
      }
    }

    // 3. Guardar relaciones (sin fallar si alguna falla)
    try {
      await Promise.allSettled([
        this.saveAutores(libroId, bookData.autores),
        this.savePersonajes(libroId, bookData.personajes),
        this.saveCategorias(libroId, bookData.categorias),
        this.saveGeneros(libroId, bookData.generos),
        this.saveEtiquetas(libroId, bookData.etiquetas),
        this.saveValores(libroId, bookData.valores),
      ]);
      console.log('✅ Relaciones guardadas');
    } catch (relError: any) {
      console.warn('⚠️ Algunas relaciones no se guardaron:', relError.message);
      // No fallamos aquí, el libro ya está creado
    }

    return libroId;
  }

  /**
   * Actualizar un libro existente
   */
  static async update(libroId: string, bookData: BookData): Promise<void> {
    console.log('📚 BookRepository.update - Actualizando libro:', libroId);

    // 1. Actualizar libro principal
    const { error: updateError } = await supabaseAdmin
      .from('books')
      .update({
        title: bookData.titulo,
        description: bookData.descripcion,
        cover_url: bookData.portada || null,
        level_id: bookData.nivel || null,
        pdf_url: bookData.pdfUrl || null, // ✅ NUEVO
        updated_at: new Date().toISOString(),
      })
      .eq('id', libroId);

    if (updateError) {
      console.error('❌ Error actualizando libro:', updateError);
      throw new Error(`Error al actualizar libro: ${updateError.message}`);
    }

    // 2. Reemplazar páginas SOLO SI existen
    if (bookData.pages && bookData.pages.length > 0) {
      try {
        await this.replacePages(libroId, bookData.pages);
        console.log('✅ Páginas actualizadas');
      } catch (pageError: any) {
        console.error('❌ Error actualizando páginas:', pageError);
        // Solo fallar si NO tiene PDF alternativo
        if (!bookData.pdfUrl) {
          throw new Error(`Error al actualizar páginas: ${pageError.message}`);
        }
      }
    }

    // 3. Actualizar relaciones
    try {
      await Promise.allSettled([
        this.replaceAutores(libroId, bookData.autores),
        this.replacePersonajes(libroId, bookData.personajes),
        this.replaceCategorias(libroId, bookData.categorias),
        this.replaceGeneros(libroId, bookData.generos),
        this.replaceEtiquetas(libroId, bookData.etiquetas),
        this.replaceValores(libroId, bookData.valores),
      ]);
      console.log('✅ Relaciones actualizadas');
    } catch (relError: any) {
      console.warn('⚠️ Algunas relaciones no se actualizaron:', relError.message);
    }
  }

  /**
   * Obtener libro completo con todas las relaciones
   */
  static async getComplete(libroId: string): Promise<any> {
    console.log('📚 BookRepository.getComplete - Obteniendo libro:', libroId);

    const { data: libro, error } = await supabaseAdmin
      .from('books')
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

    // ✅ LÓGICA HÍBRIDA: Solo cargar páginas si NO tiene PDF
    let paginas = [];
    if (!libro.pdf_url) {
      paginas = await this.getPages(libroId);
    }

    // Obtener todas las relaciones en paralelo
    const [autores, personajes, categorias, generos, valores, etiquetas, nivel] = 
      await Promise.all([
        this.getAutores(libroId),
        this.getPersonajes(libroId),
        this.getCategorias(libroId),
        this.getGeneros(libroId),
        this.getValores(libroId),
        this.getEtiquetas(libroId),
        this.getNivel(libro.level_id),
      ]);

    const result = {
      id: libro.id,
      titulo: libro.title,
      descripcion: libro.description,
      portada: libro.cover_url,
      pdfUrl: libro.pdf_url, // ✅ NUEVO
      autores,
      personajes,
      categorias,
      generos,
      valores,
      etiquetas,
      nivel,
      paginas, // Puede estar vacío si tiene PDF
      fecha_creacion: libro.created_at,
      is_published: libro.is_published,
    };

    console.log('✅ Libro obtenido:', {
      id: result.id,
      titulo: result.titulo,
      paginasCount: result.paginas.length,
      pdfUrl: result.pdfUrl || 'N/A'
    });

    return result;
  }

  /**
   * Encontrar libros por usuario
   */
  static async findByUserId(userId: string): Promise<any[]> {
    console.log('📚 BookRepository.findByUserId - Usuario:', userId);

    const { data: libros, error } = await supabaseAdmin
      .from('books')
      .select('id, title, description, cover_url, pdf_url, created_at') // ✅ INCLUIR pdf_url
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
          pdfUrl: libro.pdf_url, // ✅ NUEVO
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

    const { error } = await supabaseAdmin
      .from('books')
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
  // MÉTODOS PRIVADOS - PÁGINAS
  // ============================================
  
  private static async savePages(libroId: string, pages: PageData[]): Promise<void> {
    if (!pages.length) {
      console.warn('⚠️ No hay páginas para guardar');
      return;
    }
    
    console.log('📝 Guardando páginas:', pages.length);

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

    console.log('📄 Páginas a insertar:', paginasToInsert.map(p => ({
      page_number: p.page_number,
      layout: p.layout,
      hasImage: !!p.image_url,
      hasBackground: !!(p.background_url || p.background_color)
    })));

    const { error } = await supabaseAdmin
      .from('book_pages')
      .insert(paginasToInsert);

    if (error) {
      console.error('❌ Error guardando páginas:', error);
      throw new Error(`Error al guardar páginas: ${error.message}`);
    }

    console.log('✅ Páginas guardadas correctamente');
  }

  private static async replacePages(libroId: string, pages: PageData[]): Promise<void> {
    // Eliminar páginas existentes
    const { error: deleteError } = await supabaseAdmin
      .from('book_pages')
      .delete()
      .eq('book_id', libroId);

    if (deleteError) {
      console.error('❌ Error eliminando páginas:', deleteError);
    }

    // Insertar nuevas
    await this.savePages(libroId, pages);
  }

  private static async getPages(libroId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('book_pages')
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
  // MÉTODOS PRIVADOS - AUTORES
  // ============================================
  
  private static async saveAutores(libroId: string, autores: string[]): Promise<void> {
    if (!autores.length) return;
    
    console.log('📝 Guardando autores:', autores);

    for (let idx = 0; idx < autores.length; idx++) {
      const nombre = autores[idx]?.trim();
      if (!nombre) continue;

      try {
        // Buscar autor existente
        let { data: existingAutor } = await supabaseAdmin
          .from('book_authors')
          .select('id')
          .eq('name', nombre)
          .single();

        let autorId: string;

        if (existingAutor?.id) {
          autorId = existingAutor.id;
        } else {
          // Crear nuevo autor
          const { data: newAutor, error: createError } = await supabaseAdmin
            .from('book_authors')
            .insert({ name: nombre })
            .select('id')
            .single();

          if (createError || !newAutor?.id) {
            console.warn('⚠️ No se pudo crear autor:', nombre, createError);
            continue;
          }
          autorId = newAutor.id;
        }

        // Crear relación libro-autor
        await supabaseAdmin
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
    await supabaseAdmin.from('books_authors').delete().eq('book_id', libroId);
    await this.saveAutores(libroId, autores);
  }

  private static async getAutores(libroId: string): Promise<string[]> {
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

  // ============================================
  // MÉTODOS PRIVADOS - PERSONAJES
  // ============================================
  
  private static async savePersonajes(libroId: string, personajes: string[]): Promise<void> {
    if (!personajes.length) return;
    
    for (const nombre of personajes) {
      const trimmed = nombre?.trim();
      if (!trimmed) continue;

      try {
        let { data: existing } = await supabaseAdmin
          .from('book_characters')
          .select('id')
          .eq('name', trimmed)
          .single();

        let personajeId: string;

        if (existing?.id) {
          personajeId = existing.id;
        } else {
          const { data: newChar, error } = await supabaseAdmin
            .from('book_characters')
            .insert({ name: trimmed })
            .select('id')
            .single();

          if (error || !newChar?.id) continue;
          personajeId = newChar.id;
        }

        await supabaseAdmin
          .from('books_characters')
          .insert({ book_id: libroId, character_id: personajeId });

      } catch (err) {
        console.warn('⚠️ Error con personaje:', trimmed, err);
      }
    }
  }

  private static async replacePersonajes(libroId: string, personajes: string[]): Promise<void> {
    await supabaseAdmin.from('books_characters').delete().eq('book_id', libroId);
    await this.savePersonajes(libroId, personajes);
  }

  private static async getPersonajes(libroId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('books_characters')
      .select('character_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const personajes: string[] = [];
    for (const rel of data) {
      const { data: char } = await supabaseAdmin
        .from('book_characters')
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
    
    const inserts = categorias.map((category_id, idx) => ({ 
      book_id: libroId, 
      category_id,
      is_primary: idx === 0
    }));

    const { error } = await supabaseAdmin.from('books_categories').insert(inserts);
    if (error) console.warn('⚠️ Error guardando categorías:', error);
  }

  private static async replaceCategorias(libroId: string, categorias: number[]): Promise<void> {
    await supabaseAdmin.from('books_categories').delete().eq('book_id', libroId);
    await this.saveCategorias(libroId, categorias);
  }

  private static async getCategorias(libroId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('books_categories')
      .select('category_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const categorias: string[] = [];
    for (const rel of data) {
      const { data: cat } = await supabaseAdmin
        .from('book_categories')
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
    
    const inserts = generos.map(genre_id => ({ book_id: libroId, genre_id }));
    const { error } = await supabaseAdmin.from('books_genres').insert(inserts);
    if (error) console.warn('⚠️ Error guardando géneros:', error);
  }

  private static async replaceGeneros(libroId: string, generos: number[]): Promise<void> {
    await supabaseAdmin.from('books_genres').delete().eq('book_id', libroId);
    await this.saveGeneros(libroId, generos);
  }

  private static async getGeneros(libroId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('books_genres')
      .select('genre_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const generos: string[] = [];
    for (const rel of data) {
      const { data: genre } = await supabaseAdmin
        .from('book_genres')
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
    
    const inserts = etiquetas.map((tag_id, idx) => ({ 
      book_id: libroId, 
      tag_id,
      is_primary: idx === 0
    }));

    const { error } = await supabaseAdmin.from('books_tags').insert(inserts);
    if (error) console.warn('⚠️ Error guardando etiquetas:', error);
  }

  private static async replaceEtiquetas(libroId: string, etiquetas: number[]): Promise<void> {
    await supabaseAdmin.from('books_tags').delete().eq('book_id', libroId);
    await this.saveEtiquetas(libroId, etiquetas);
  }

  private static async getEtiquetas(libroId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('books_tags')
      .select('tag_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const etiquetas: string[] = [];
    for (const rel of data) {
      const { data: tag } = await supabaseAdmin
        .from('book_tags')
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
    
    const inserts = valores.map((value_id, idx) => ({ 
      book_id: libroId, 
      value_id,
      is_primary: idx === 0
    }));

    const { error } = await supabaseAdmin.from('books_values').insert(inserts);
    if (error) console.warn('⚠️ Error guardando valores:', error);
  }

  private static async replaceValores(libroId: string, valores: number[]): Promise<void> {
    await supabaseAdmin.from('books_values').delete().eq('book_id', libroId);
    await this.saveValores(libroId, valores);
  }

  private static async getValores(libroId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('books_values')
      .select('value_id')
      .eq('book_id', libroId);

    if (error || !data?.length) return [];

    const valores: string[] = [];
    for (const rel of data) {
      const { data: value } = await supabaseAdmin
        .from('book_values')
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
    
    const { data } = await supabaseAdmin
      .from('book_levels')
      .select('*')
      .eq('id', idNivel)
      .single();
    
    return data || null;
  }

  // ============================================
  // HELPERS
  // ============================================

  private static cleanUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    // No guardar URLs blob: temporales
    if (url.startsWith('blob:')) return null;
    return url;
  }

  private static isImageUrl(value: string | null | undefined): boolean {
    if (!value) return false;
    return value.startsWith('http://') || 
           value.startsWith('https://');
  }

  private static isColor(value: string | null | undefined): boolean {
    if (!value) return false;
    // Color hex o nombre de preset
    return value.startsWith('#') || 
           (!value.startsWith('http') && !value.startsWith('blob:'));
  }
}