// src/core/domain/repositories/ITranslationCategoryRepository.ts

import { TranslationCategory } from '../entities/TranslationCategory';

export interface CreateTranslationCategoryDTO {
  name: string;
  description?: string;
  slug: string;
  isActive?: boolean;
}

export interface UpdateTranslationCategoryDTO {
  name?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
}

export interface ITranslationCategoryRepository {
  findAll(includeInactive?: boolean): Promise<TranslationCategory[]>;
  findById(id: string): Promise<TranslationCategory | null>;
  findBySlug(slug: string): Promise<TranslationCategory | null>;
  create(dto: CreateTranslationCategoryDTO): Promise<TranslationCategory>;
  update(id: string, dto: UpdateTranslationCategoryDTO): Promise<TranslationCategory>;
  delete(id: string): Promise<void>;
}