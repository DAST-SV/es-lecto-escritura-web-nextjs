// ============================================
// src/core/application/use-cases/translation-categories/UpdateCategory.ts
// Use Case: Update Translation Category
// ============================================

import { TranslationCategory } from '@/src/core/domain/entities/TranslationCategory';
import { ITranslationCategoryRepository, UpdateTranslationCategoryDTO } from '@/src/core/domain/repositories/ITranslationCategoryRepository';

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ITranslationCategoryRepository) {}

  async execute(id: string, dto: UpdateTranslationCategoryDTO): Promise<TranslationCategory> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new Error(`Categoría no encontrada: ${id}`);
    }

    return this.categoryRepository.update(id, dto);
  }
}