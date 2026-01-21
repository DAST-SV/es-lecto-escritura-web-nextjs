// ============================================
// Ruta: src/core/domain/repositories/ITranslationNamespaceRepository.ts
// Descripción: Interface del repositorio de Translation Namespace
// ============================================

import { TranslationNamespace } from '../entities/TranslationNamespace';

export interface CreateTranslationNamespaceDTO {
  slug: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateTranslationNamespaceDTO {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface ITranslationNamespaceRepository {
  findAll(includeInactive?: boolean): Promise<TranslationNamespace[]>;
  findById(id: string): Promise<TranslationNamespace | null>;
  findBySlug(slug: string): Promise<TranslationNamespace | null>;
  findActive(): Promise<TranslationNamespace[]>;
  create(dto: CreateTranslationNamespaceDTO): Promise<TranslationNamespace>;
  update(id: string, dto: UpdateTranslationNamespaceDTO): Promise<TranslationNamespace>;
  delete(id: string): Promise<void>;
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
}