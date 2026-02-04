// ============================================
// src/core/domain/repositories/IBookCategoryRepository.ts
// Interface del repositorio de BookCategory
// ============================================

import { BookCategory } from '../entities/BookCategory';

export interface CreateBookCategoryDTO {
  slug: string;
  icon?: string | null;
  color?: string | null;
  orderIndex?: number;
  isActive?: boolean;
  translations: Array<{
    languageCode: string;
    name: string;
    description?: string | null;
  }>;
}

export interface UpdateBookCategoryDTO {
  slug?: string;
  icon?: string | null;
  color?: string | null;
  orderIndex?: number;
  isActive?: boolean;
  translations?: Array<{
    languageCode: string;
    name: string;
    description?: string | null;
  }>;
}

export interface IBookCategoryRepository {
  // Queries
  findAll(includeDeleted?: boolean): Promise<BookCategory[]>;
  findById(id: string): Promise<BookCategory | null>;
  findBySlug(slug: string): Promise<BookCategory | null>;
  findActive(): Promise<BookCategory[]>;

  // Commands
  create(dto: CreateBookCategoryDTO): Promise<BookCategory>;
  update(id: string, dto: UpdateBookCategoryDTO): Promise<BookCategory>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;

  // Bulk operations
  reorder(items: Array<{ id: string; orderIndex: number }>): Promise<void>;
}
