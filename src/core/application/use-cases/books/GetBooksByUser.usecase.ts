/**
 * UBICACIÓN: src/core/application/use-cases/books/GetBooksByUser.usecase.ts
 */

import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';

export class GetBooksByUserUseCase {
  static async execute(userId: string): Promise<any[]> {
    if (!userId) {
      throw new Error('El ID del usuario es obligatorio');
    }

    return await BookRepository.findByUserId(userId);
  }
}