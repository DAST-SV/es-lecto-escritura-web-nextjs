// ============================================
// Ruta: src/core/domain/repositories/ITranslationKeyRepository.ts
// Descripción: Interface del repositorio de Translation Key
// ============================================

import { TranslationKey } from '../entities/TranslationKey';

export interface CreateTranslationKeyDTO {
  namespaceSlug: string;
  keyName: string;
  categoryId?: string | null;
  description?: string | null;
  context?: string | null;
  defaultValue?: string | null;
  isSystemKey?: boolean;
}

export interface UpdateTranslationKeyDTO {
  keyName?: string;
  categoryId?: string | null;
  description?: string | null;
  context?: string | null;
  defaultValue?: string | null;
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