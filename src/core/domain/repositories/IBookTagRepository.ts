// ============================================
// src/core/domain/repositories/IBookTagRepository.ts
// Interface del repositorio de BookTag
// ============================================

import { BookTag } from '../entities/BookTag';

export interface CreateBookTagDTO {
  slug: string;
  color?: string | null;
  isActive?: boolean;
  translations: Array<{
    languageCode: string;
    name: string;
  }>;
}

export interface UpdateBookTagDTO {
  slug?: string;
  color?: string | null;
  isActive?: boolean;
  translations?: Array<{
    languageCode: string;
    name: string;
  }>;
}

export interface IBookTagRepository {
  findAll(includeDeleted?: boolean): Promise<BookTag[]>;
  findById(id: string): Promise<BookTag | null>;
  findBySlug(slug: string): Promise<BookTag | null>;
  findActive(): Promise<BookTag[]>;
  create(dto: CreateBookTagDTO): Promise<BookTag>;
  update(id: string, dto: UpdateBookTagDTO): Promise<BookTag>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
