// ============================================
// src/core/domain/repositories/IBookAuthorRepository.ts
// Interface del repositorio de BookAuthor
// ============================================

import { BookAuthor } from '../entities/BookAuthor';

export interface CreateBookAuthorDTO {
  slug: string;
  avatarUrl?: string | null;
  websiteUrl?: string | null;
  isActive?: boolean;
  translations: Array<{
    languageCode: string;
    name: string;
    bio?: string | null;
  }>;
}

export interface UpdateBookAuthorDTO {
  slug?: string;
  avatarUrl?: string | null;
  websiteUrl?: string | null;
  isActive?: boolean;
  translations?: Array<{
    languageCode: string;
    name: string;
    bio?: string | null;
  }>;
}

export interface IBookAuthorRepository {
  findAll(includeDeleted?: boolean): Promise<BookAuthor[]>;
  findById(id: string): Promise<BookAuthor | null>;
  findBySlug(slug: string): Promise<BookAuthor | null>;
  findActive(): Promise<BookAuthor[]>;
  create(dto: CreateBookAuthorDTO): Promise<BookAuthor>;
  update(id: string, dto: UpdateBookAuthorDTO): Promise<BookAuthor>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
