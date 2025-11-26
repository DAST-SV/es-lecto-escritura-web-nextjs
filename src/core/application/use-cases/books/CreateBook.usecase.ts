/**
 * UBICACIÓN: src/core/application/use-cases/books/CreateBook.usecase.ts
 * Caso de uso: Crear un nuevo libro
 */

import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';

interface PageData {
  layout: string;
  title?: string;
  text?: string;
  image?: string;
  background?: string;
}

interface CreateBookDTO {
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

export class CreateBookUseCase {
  static async execute(userId: string, bookData: CreateBookDTO): Promise<string> {
    // Validaciones de negocio
    if (!bookData.titulo || bookData.titulo.trim() === '') {
      throw new Error('El título es obligatorio');
    }

    if (!bookData.pages || bookData.pages.length === 0) {
      throw new Error('Debe haber al menos una página');
    }

    if (bookData.autores.length === 0) {
      throw new Error('Debe haber al menos un autor');
    }

    // Llamar al repositorio
    return await BookRepository.create(userId, bookData);
  }
}