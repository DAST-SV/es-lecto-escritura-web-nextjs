// ============================================
// src/core/application/use-cases/translation-categories/GetAllCategories.ts
// Use Case: Get All Translation Categories
// ============================================

import { TranslationCategory } from '@/src/core/domain/entities/TranslationCategory';
import { ITranslationCategoryRepository } from '@/src/core/domain/repositories/ITranslationCategoryRepository';

export class GetAllCategoriesUseCase {
  constructor(private categoryRepository: ITranslationCategoryRepository) {}

  async execute(includeInactive = false): Promise<TranslationCategory[]> {
    return this.categoryRepository.findAll(includeInactive);
  }
}