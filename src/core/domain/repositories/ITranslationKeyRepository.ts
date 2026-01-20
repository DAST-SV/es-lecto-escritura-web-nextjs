// ============================================
// src/core/domain/repositories/TranslationKeyRepository.ts
// ✅ Interface del repositorio de claves de traducción
// ============================================

import { TranslationKey } from '@/src/core/domain/entities/TranslationKey';

export interface CreateTranslationKeyDTO {
  namespaceSlug: string;
  keyName: string;
  categoryId?: string;
  description?: string;
  context?: string;
  defaultValue?: string;
  isSystemKey?: boolean;
}

export interface UpdateTranslationKeyDTO {
  keyName?: string;
  categoryId?: string;
  description?: string;
  context?: string;
  defaultValue?: string;
  isActive?: boolean;
}

export interface ITranslationKeyRepository {
  findAll(): Promise<TranslationKey[]>;
  findById(id: string): Promise<TranslationKey | null>;
  findByNamespace(namespaceSlug: string): Promise<TranslationKey[]>;
  create(dto: CreateTranslationKeyDTO): Promise<TranslationKey>;
  update(id: string, dto: UpdateTranslationKeyDTO): Promise<TranslationKey>;
  delete(id: string): Promise<void>;
}