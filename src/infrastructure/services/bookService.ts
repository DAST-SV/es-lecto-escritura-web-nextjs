/**
 * UBICACIÓN: src/infrastructure/services/BookService.ts
 * 
 * Servicio centralizado para operaciones CRUD de libros
 */

import { page } from '@/src/typings/types-page-book';

// Tipo para metadata del libro
export interface BookMetadata {
  titulo: string;
  descripcion: string;
  autores: string[];
  personajes: string[];
  portada: File | null;
  portadaUrl: string | null;
  cardBackgroundImage: File | null;
  cardBackgroundUrl: string | null;
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedValores: (number | string)[];
  selectedNivel: number | null;
}

export class BookService {
  /**
   * Guardar libro (crear o actualizar según si tiene ID)
   */
  static async saveBook(
    pages: page[],
    metadata: BookMetadata,
    bookId?: string,
    userId?: string
  ): Promise<{ success: boolean; bookId: string; message: string }> {
    
    console.log('📚 BookService.saveBook llamado');
    console.log('   📄 Páginas:', pages.length);
    console.log('   🆔 BookId:', bookId);
    console.log('   👤 UserId:', userId);

    // ✅ VALIDACIÓN: Sin páginas no se puede guardar
    if (!pages || pages.length === 0) {
      throw new Error('No se puede guardar un libro sin páginas. Debes crear al menos una página.');
    }

    if (bookId) {
      // ACTUALIZAR libro existente
      const result = await this.updateBook(bookId, pages, metadata);
      return {
        ...result,
        bookId: bookId
      };
    } else {
      // CREAR libro nuevo
      if (!userId) {
        throw new Error('userId es requerido para crear un libro nuevo');
      }
      return await this.createBook(pages, metadata, userId);
    }
  }

  /**
   * Actualizar libro existente
   */
  static async updateBook(
    bookId: string,
    pages: page[],
    metadata: BookMetadata
  ): Promise<{ success: boolean; message: string }> {
    
    console.log('✏️ BookService.updateBook llamado');
    console.log('   🆔 BookId:', bookId);
    console.log('   📄 Páginas:', pages.length);

    // ✅ VALIDACIÓN: Sin páginas no se puede actualizar
    if (!pages || pages.length === 0) {
      throw new Error('No se puede actualizar un libro sin páginas. Debes crear al menos una página.');
    }

    try {
      // Determinar la portada final
      const portadaFinal = 
        metadata.portada || 
        metadata.portadaUrl || 
        metadata.cardBackgroundImage || 
        metadata.cardBackgroundUrl || 
        null;

      const response = await fetch('/api/books/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idLibro: bookId,
          pages: pages,
          titulo: metadata.titulo,
          descripcion: metadata.descripcion,
          portada: portadaFinal,
          autores: metadata.autores,
          personajes: metadata.personajes,
          categoria: metadata.selectedCategorias,
          genero: metadata.selectedGeneros,
          etiquetas: metadata.selectedEtiquetas,
          valores: metadata.selectedValores,
          nivel: metadata.selectedNivel,
        })
      });

      const data = await response.json();
      console.log('✅ Respuesta de updatebook:', data);

      if (!data.ok) {
        throw new Error(data.error || 'Error al actualizar el libro');
      }

      return {
        success: true,
        message: data.message || 'Libro actualizado correctamente'
      };

    } catch (error: any) {
      console.error('❌ Error en BookService.updateBook:', error);
      throw error;
    }
  }

  /**
   * Crear libro nuevo
   */
  static async createBook(
    pages: page[],
    metadata: BookMetadata,
    userId: string
  ): Promise<{ success: boolean; bookId: string; message: string }> {
    
    console.log('🆕 BookService.createBook llamado');
    console.log('   👤 UserId:', userId);
    console.log('   📄 Páginas:', pages.length);

    // ✅ VALIDACIÓN: Sin páginas no se puede crear
    if (!pages || pages.length === 0) {
      throw new Error('No se puede crear un libro sin páginas. Debes crear al menos una página.');
    }

    try {
      // Determinar la portada final
      const portadaFinal = 
        metadata.portada || 
        metadata.portadaUrl || 
        metadata.cardBackgroundImage || 
        metadata.cardBackgroundUrl || 
        null;

      // ========== PASO 1: Crear el libro ==========
      console.log('📤 PASO 1: Creando libro...');
      const createBookResponse = await fetch('/api/libros/createbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          title: metadata.titulo,
          descripcion: metadata.descripcion,
          portada: portadaFinal,
          autores: metadata.autores,
          personajes: metadata.personajes,
          categoria: metadata.selectedCategorias,
          genero: metadata.selectedGeneros,
          etiquetas: metadata.selectedEtiquetas,
          valores: metadata.selectedValores,
          nivel: metadata.selectedNivel,
        })
      });

      const createBookData = await createBookResponse.json();
      console.log('✅ Libro creado:', createBookData);

      if (!createBookData.ok || !createBookData.libroId) {
        throw new Error(createBookData.error || 'Error al crear el libro');
      }

      const newBookId = createBookData.libroId;

      // ========== PASO 2: Guardar las páginas ==========
      console.log('📤 PASO 2: Guardando', pages.length, 'páginas para libro:', newBookId);
      const createPagesResponse = await fetch('/api/libros/createpages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          LibroId: newBookId,
          pages: pages
        })
      });

      const createPagesData = await createPagesResponse.json();
      console.log('✅ Páginas guardadas:', createPagesData);

      if (!createPagesData.ok) {
        // Si falla el guardado de páginas, idealmente deberíamos eliminar el libro creado
        console.error('❌ Error al guardar páginas, libro creado pero sin páginas');
        throw new Error(createPagesData.error || 'Error al guardar las páginas');
      }

      return {
        success: true,
        bookId: newBookId,
        message: `Libro creado exitosamente con ${createPagesData.cantidadInsertadas} páginas`
      };

    } catch (error: any) {
      console.error('❌ Error en BookService.createBook:', error);
      throw error;
    }
  }

  /**
   * Actualizar libro existente (versión completa con lógica de DB)
   */
  static async updateBookComplete(
    bookId: string,
    pages: page[],
    metadata: BookMetadata
  ): Promise<{ success: boolean; message: string }> {
    
    console.log('✏️ BookService.updateBookComplete llamado');

    if (!pages || pages.length === 0) {
      throw new Error('No se puede actualizar un libro sin páginas.');
    }

    // Aquí solo llamamos al API endpoint que ya tienes
    // El endpoint /api/libros/updatebook maneja toda la lógica
    return await this.updateBook(bookId, pages, metadata);
  }

  /**
   * Leer libro completo (con todas sus relaciones)
   */
  static async getBookComplete(bookId: string): Promise<any> {
    console.log('📖 BookService.getBookComplete llamado');
    console.log('   🆔 BookId:', bookId);

    try {
      const response = await fetch(`/api/books/${bookId}/read`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.libro;

    } catch (error: any) {
      console.error('❌ Error en BookService.getBookComplete:', error);
      throw error;
    }
  }

  /**
   * Eliminar libro
   */
  static async deleteBook(bookId: string): Promise<{ success: boolean; message: string }> {
    console.log('🗑️ BookService.deleteBook llamado');
    console.log('   🆔 BookId:', bookId);

    try {
      const response = await fetch(`/api/libros/deletebook/${bookId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return {
        success: true,
        message: 'Libro eliminado correctamente'
      };

    } catch (error: any) {
      console.error('❌ Error en BookService.deleteBook:', error);
      throw error;
    }
  }
}