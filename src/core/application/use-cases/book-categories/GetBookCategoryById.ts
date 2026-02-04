// ============================================
// src/core/application/use-cases/book-categories/GetBookCategoryById.ts
// Use Case: Obtener una categoría por ID
// ============================================

import { BookCategory } from '@/src/core/domain/entities/BookCategory';
import { IBookCategoryRepository } from '@/src/core/domain/repositories/IBookCategoryRepository';

export class GetBookCategoryByIdUseCase {
  constructor(private repository: IBookCategoryRepository) {}

  async execute(id: string): Promise<BookCategory | null> {
    if (!id?.trim()) {
      throw new Error('El ID es requerido');
    }
    return this.repository.findById(id);
  }
}
