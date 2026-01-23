// ============================================
// src/core/application/use-cases/translation-categories/CreateCategory.ts
// Use Case: Create Translation Category
// ============================================

import { TranslationCategory } from '@/src/core/domain/entities/TranslationCategory';
import { ITranslationCategoryRepository, CreateTranslationCategoryDTO } from '@/src/core/domain/repositories/ITranslationCategoryRepository';

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ITranslationCategoryRepository) {}

  async execute(dto: CreateTranslationCategoryDTO): Promise<TranslationCategory> {
    // Validar que no exista
    const existing = await this.categoryRepository.findBySlug(dto.slug);
    if (existing) {
      throw new Error(`La categoría con slug ${dto.slug} ya existe`);
    }

    return this.categoryRepository.create(dto);
  }
}