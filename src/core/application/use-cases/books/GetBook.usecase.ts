/**
 * UBICACIÓN: src/core/application/use-cases/books/GetBook.usecase.ts
 */

import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';

export class GetBookUseCase {
  static async execute(bookId: string): Promise<any> {
    if (!bookId) {
      throw new Error('El ID del libro es obligatorio');
    }

    const libro = await BookRepository.getComplete(bookId);

    if (!libro) {
      throw new Error('Libro no encontrado');
    }

    return libro;
  }
}