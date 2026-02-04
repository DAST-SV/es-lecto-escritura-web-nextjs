// ============================================
// src/core/domain/repositories/IBookGenreRepository.ts
// Interface del repositorio de BookGenre
// ============================================

import { BookGenre } from '../entities/BookGenre';

export interface CreateBookGenreDTO {
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

export interface UpdateBookGenreDTO {
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

export interface IBookGenreRepository {
  findAll(includeDeleted?: boolean): Promise<BookGenre[]>;
  findById(id: string): Promise<BookGenre | null>;
  findBySlug(slug: string): Promise<BookGenre | null>;
  findActive(): Promise<BookGenre[]>;
  create(dto: CreateBookGenreDTO): Promise<BookGenre>;
  update(id: string, dto: UpdateBookGenreDTO): Promise<BookGenre>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  reorder(items: Array<{ id: string; orderIndex: number }>): Promise<void>;
}
