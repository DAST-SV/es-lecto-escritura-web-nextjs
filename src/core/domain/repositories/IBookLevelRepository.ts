// ============================================
// src/core/domain/repositories/IBookLevelRepository.ts
// Interface del repositorio de BookLevel
// ============================================

import { BookLevel } from '../entities/BookLevel';

export interface CreateBookLevelDTO {
  slug: string;
  minAge: number;
  maxAge: number;
  gradeMin?: number | null;
  gradeMax?: number | null;
  color?: string | null;
  icon?: string | null;
  orderIndex?: number;
  isActive?: boolean;
  translations: Array<{
    languageCode: string;
    name: string;
    description?: string | null;
    ageLabel?: string | null;
  }>;
}

export interface UpdateBookLevelDTO {
  slug?: string;
  minAge?: number;
  maxAge?: number;
  gradeMin?: number | null;
  gradeMax?: number | null;
  color?: string | null;
  icon?: string | null;
  orderIndex?: number;
  isActive?: boolean;
  translations?: Array<{
    languageCode: string;
    name: string;
    description?: string | null;
    ageLabel?: string | null;
  }>;
}

export interface IBookLevelRepository {
  // Queries
  findAll(includeDeleted?: boolean): Promise<BookLevel[]>;
  findById(id: string): Promise<BookLevel | null>;
  findBySlug(slug: string): Promise<BookLevel | null>;
  findActive(): Promise<BookLevel[]>;
  findByAgeRange(minAge: number, maxAge: number): Promise<BookLevel[]>;

  // Commands
  create(dto: CreateBookLevelDTO): Promise<BookLevel>;
  update(id: string, dto: UpdateBookLevelDTO): Promise<BookLevel>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;

  // Bulk operations
  reorder(items: Array<{ id: string; orderIndex: number }>): Promise<void>;
}
