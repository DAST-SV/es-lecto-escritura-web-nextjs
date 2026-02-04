// ============================================
// src/core/application/use-cases/book-categories/RestoreBookCategory.ts
// Use Case: Restaurar una categoría eliminada
// ============================================

import { IBookCategoryRepository } from '@/src/core/domain/repositories/IBookCategoryRepository';

export class RestoreBookCategoryUseCase {
  constructor(private repository: IBookCategoryRepository) {}

  async execute(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new Error('El ID es requerido');
    }

    await this.repository.restore(id);
  }
}
