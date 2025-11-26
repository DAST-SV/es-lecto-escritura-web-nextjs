/**
 * UBICACIÓN: src/core/application/use-cases/books/UpdateBook.usecase.ts
 */

import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';

interface PageData {
  layout: string;
  title?: string;
  text?: string;
  image?: string;
  background?: string;
}

interface UpdateBookDTO {
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

export class UpdateBookUseCase {
  static async execute(bookId: string, bookData: UpdateBookDTO): Promise<void> {
    if (!bookData.titulo || bookData.titulo.trim() === '') {
      throw new Error('El título es obligatorio');
    }

    if (!bookData.pages || bookData.pages.length === 0) {
      throw new Error('Debe haber al menos una página');
    }

    await BookRepository.update(bookId, bookData);
  }
}