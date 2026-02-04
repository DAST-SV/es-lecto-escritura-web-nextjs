// ============================================
// src/core/application/use-cases/book-categories/DeleteBookCategory.ts
// Use Case: Eliminar una categoría (soft delete)
// ============================================

import { IBookCategoryRepository } from '@/src/core/domain/repositories/IBookCategoryRepository';

export class DeleteBookCategoryUseCase {
  constructor(private repository: IBookCategoryRepository) {}

  async execute(id: string, hard = false): Promise<void> {
    if (!id?.trim()) {
      throw new Error('El ID es requerido');
    }

    if (hard) {
      await this.repository.hardDelete(id);
    } else {
      await this.repository.softDelete(id);
    }
  }
}
