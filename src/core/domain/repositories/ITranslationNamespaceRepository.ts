// src/core/domain/repositories/ITranslationNamespaceRepository.ts

import { TranslationNamespace } from '../entities/TranslationNamespace';

export interface CreateTranslationNamespaceDTO {
  slug: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTranslationNamespaceDTO {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ITranslationNamespaceRepository {
  findAll(includeInactive?: boolean): Promise<TranslationNamespace[]>;
  findById(id: string): Promise<TranslationNamespace | null>;
  findBySlug(slug: string): Promise<TranslationNamespace | null>;
  create(dto: CreateTranslationNamespaceDTO): Promise<TranslationNamespace>;
  update(id: string, dto: UpdateTranslationNamespaceDTO): Promise<TranslationNamespace>;
  delete(id: string): Promise<void>;
}