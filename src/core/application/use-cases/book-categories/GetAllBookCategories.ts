// ============================================
// src/core/application/use-cases/book-categories/GetAllBookCategories.ts
// Use Case: Obtener todas las categorías de libros
// ============================================

import { BookCategory } from '@/src/core/domain/entities/BookCategory';
import { IBookCategoryRepository } from '@/src/core/domain/repositories/IBookCategoryRepository';

export class GetAllBookCategoriesUseCase {
  constructor(private repository: IBookCategoryRepository) {}

  async execute(includeDeleted = false): Promise<BookCategory[]> {
    return this.repository.findAll(includeDeleted);
  }
}
