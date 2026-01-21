// ============================================
// src/core/application/use-cases/translation-categories/DeleteCategory.ts
// Use Case: Delete Translation Category
// ============================================

import { ITranslationCategoryRepository } from '@/src/core/domain/repositories/ITranslationCategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ITranslationCategoryRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new Error(`Categoría no encontrada: ${id}`);
    }

    await this.categoryRepository.delete(id);
  }
}