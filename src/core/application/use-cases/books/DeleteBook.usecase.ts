/**
 * UBICACIÓN: src/core/application/use-cases/books/DeleteBook.usecase.ts
 */

import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';

export class DeleteBookUseCase {
  static async execute(bookId: string): Promise<void> {
    if (!bookId) {
      throw new Error('El ID del libro es obligatorio');
    }

    await BookRepository.delete(bookId);
  }
}