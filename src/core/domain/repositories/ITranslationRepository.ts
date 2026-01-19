// ============================================
// src/core/domain/repositories/ITranslationRepository.ts
// Repositorio: Traducciones (CORREGIDO)
// ============================================

import { Translation } from '../entities/Translation';

export interface CreateTranslationDTO {
  namespaceSlug: string;
  translationKey: string;
  languageCode: string;
  value: string;
}

export interface UpdateTranslationDTO {
  value?: string;
  isActive?: boolean;
}

export interface BulkCreateTranslationDTO {
  namespaceSlug: string;
  translationKey: string;
  translations: {
    languageCode: string;
    value: string;
  }[];
}

export interface ITranslationRepository {
  findAll(): Promise<Translation[]>;
  findById(id: string): Promise<Translation | null>;
  findByNamespace(namespaceSlug: string): Promise<Translation[]>;
  findByLanguage(languageCode: string): Promise<Translation[]>;
  findByKey(namespaceSlug: string, translationKey: string, languageCode: string): Promise<Translation | null>;
  create(dto: CreateTranslationDTO): Promise<Translation>;
  createBulk(dto: BulkCreateTranslationDTO): Promise<Translation[]>;
  update(id: string, dto: UpdateTranslationDTO): Promise<Translation>;
  delete(id: string): Promise<void>;
}