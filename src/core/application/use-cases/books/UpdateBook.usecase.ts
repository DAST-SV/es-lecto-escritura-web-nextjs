/**
 * UBICACIÓN: src/core/application/use-cases/books/UpdateBook.usecase.ts
 * ✅ CORREGIDO: Usar BookRepository.update en lugar de acceso directo a Supabase
 */

import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';

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
    // Validaciones básicas
    if (!bookId) {
      throw new Error('El ID del libro es obligatorio');
    }

    if (!data.titulo || data.titulo.trim() === '') {
      throw new Error('El título es obligatorio');
    }

    if (data.autores.length === 0) {
      throw new Error('Debe haber al menos un autor');
    }

    // ✅ Usar BookRepository.update que maneja correctamente todas las relaciones
    await BookRepository.update(bookId, {
      titulo: data.titulo,
      descripcion: data.descripcion,
      portada: data.portada,
      pdfUrl: undefined, // No se actualiza el PDF aquí
      autores: data.autores,
      personajes: data.personajes,
      categorias: data.categorias,
      generos: data.generos,
      etiquetas: data.etiquetas,
      valores: data.valores,
      nivel: data.nivel,
    });

    console.log('✅ Libro actualizado correctamente:', bookId);
  }
}