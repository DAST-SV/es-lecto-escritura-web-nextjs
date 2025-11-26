/**
 * UBICACIÓN: src/infrastructure/services/BookService.ts
 */

import { CreatePageDTO } from '../dto/PageDTO';

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
   * Guarda un libro (crea o actualiza)
   */
  static async saveBook(
    pages: CreatePageDTO[],  // ✅ Recibe DTOs directamente
    metadata: BookMetadata,
    bookId?: string,
    userId?: string
  ): Promise<{ success: boolean; bookId: string }> {
    
    // Validar páginas
    if (!pages || pages.length === 0) {
      throw new Error('Debe haber al menos una página.');
    }

    console.log('📚 BookService.saveBook iniciado');
    console.log('   Páginas:', pages.length);
    console.log('   BookId:', bookId || 'NUEVO');

    if (bookId) {
      return await this.updateBook(bookId, pages, metadata);
    } else {
      return await this.createBook(pages, metadata, userId!);
    }
  }

  /**
   * Crea un libro nuevo
   */
  private static async createBook(
    pages: CreatePageDTO[],
    metadata: BookMetadata,
    userId: string
  ): Promise<{ success: boolean; bookId: string }> {
    
    if (!userId) {
      throw new Error('userId es requerido para crear un libro');
    }

    console.log('📝 Creando libro nuevo...');

    const createDTO = {
      userId,
      title: metadata.titulo,
      nivel: metadata.selectedNivel || 1,
      autores: metadata.autores,
      personajes: metadata.personajes,
      categoria: metadata.selectedCategorias.map(c => Number(c)),
      genero: metadata.selectedGeneros.map(g => Number(g)),
      descripcion: metadata.descripcion,
      etiquetas: metadata.selectedEtiquetas.map(e => Number(e)),
      portada: metadata.portadaUrl || metadata.cardBackgroundUrl,
      valores: metadata.selectedValores.map(v => Number(v))
    };

    // 1. Crear libro
    const response1 = await fetch('/api/libros/createbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createDTO)
    });

    const data1 = await response1.json();
    if (!data1.libroId) {
      throw new Error(data1.error || 'Error al crear libro');
    }

    const libroId = data1.libroId;
    console.log('✅ Libro creado con ID:', libroId);

    // 2. Crear páginas
    const response2 = await fetch('/api/libros/createpages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ LibroId: libroId, pages })
    });

    const data2 = await response2.json();
    if (!data2.ok) {
      throw new Error(data2.error || 'Error al crear páginas');
    }

    console.log('✅ Páginas creadas:', pages.length);

    return { success: true, bookId: libroId };
  }

  /**
   * Actualiza un libro existente
   */
  private static async updateBook(
    bookId: string,
    pages: CreatePageDTO[],
    metadata: BookMetadata
  ): Promise<{ success: boolean; bookId: string }> {
    
    console.log('✏️ Actualizando libro:', bookId);

    const updateDTO = {
      idLibro: bookId,
      titulo: metadata.titulo,
      descripcion: metadata.descripcion,
      portada: metadata.portadaUrl || metadata.cardBackgroundUrl,
      nivel: metadata.selectedNivel || 1,
      autores: metadata.autores,
      personajes: metadata.personajes,
      categoria: metadata.selectedCategorias.map(c => Number(c)),
      genero: metadata.selectedGeneros.map(g => Number(g)),
      etiquetas: metadata.selectedEtiquetas.map(e => Number(e)),
      valores: metadata.selectedValores.map(v => Number(v)),
      pages
    };

    const response = await fetch('/api/libros/updatebook', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateDTO)
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Error al actualizar libro');
    }

    console.log('✅ Libro actualizado');

    return { success: true, bookId };
  }

  /**
   * Obtiene un libro completo
   */
  static async getBookComplete(bookId: string) {
    const response = await fetch(`/api/books/${bookId}/read`);
    const data = await response.json();
    return data.libro || null;
  }

  /**
   * Elimina un libro
   */
  static async deleteBook(bookId: string): Promise<void> {
    const response = await fetch('/api/libros/deletebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ LibroId: bookId })
    });

    if (!response.ok) {
      throw new Error('Error al eliminar libro');
    }
  }
}