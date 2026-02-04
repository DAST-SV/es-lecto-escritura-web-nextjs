// ============================================
// src/core/domain/repositories/IBookAdminRepository.ts
// Interface del repositorio para gestión de libros
// ============================================

import { BookAdmin, DifficultyLevel, BookStatus } from '../entities/BookAdmin';

export interface CreateBookTranslationDTO {
  languageCode: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  summary?: string | null;
  keywords?: string[] | null;
  pdfUrl?: string | null;
  isActive?: boolean;
  isPrimary?: boolean;
}

export interface UpdateBookTranslationDTO {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  summary?: string | null;
  keywords?: string[] | null;
  pdfUrl?: string | null;
  isActive?: boolean;
  isPrimary?: boolean;
}

export interface BookAuthorDTO {
  authorId: string;
  role?: string;
  orderIndex?: number;
}

export interface BookGenreDTO {
  genreId: string;
  isPrimary?: boolean;
}

export interface BookTagDTO {
  tagId: string;
}

export interface CreateBookAdminDTO {
  slug: string;
  categoryId: string;
  levelId?: string | null;
  coverUrl?: string | null;
  difficulty?: DifficultyLevel;
  status?: BookStatus;
  estimatedReadTime?: number;
  pageCount?: number;
  isFeatured?: boolean;
  isPremium?: boolean;
  translations: CreateBookTranslationDTO[];
  authors?: BookAuthorDTO[];
  genres?: BookGenreDTO[];
  tags?: BookTagDTO[];
}

export interface UpdateBookAdminDTO {
  slug?: string;
  categoryId?: string;
  levelId?: string | null;
  coverUrl?: string | null;
  difficulty?: DifficultyLevel;
  status?: BookStatus;
  estimatedReadTime?: number;
  pageCount?: number;
  isFeatured?: boolean;
  isPremium?: boolean;
  translations?: CreateBookTranslationDTO[];
  authors?: BookAuthorDTO[];
  genres?: BookGenreDTO[];
  tags?: BookTagDTO[];
}

export interface IBookAdminRepository {
  findAll(includeDeleted?: boolean): Promise<BookAdmin[]>;
  findById(id: string): Promise<BookAdmin | null>;
  findBySlug(slug: string): Promise<BookAdmin | null>;
  create(data: CreateBookAdminDTO): Promise<BookAdmin>;
  update(id: string, data: UpdateBookAdminDTO): Promise<BookAdmin>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  publish(id: string): Promise<BookAdmin>;
  unpublish(id: string): Promise<BookAdmin>;

  // Translation operations
  addTranslation(bookId: string, data: CreateBookTranslationDTO): Promise<void>;
  updateTranslation(bookId: string, languageCode: string, data: UpdateBookTranslationDTO): Promise<void>;
  deleteTranslation(bookId: string, languageCode: string): Promise<void>;

  // Relation operations
  setAuthors(bookId: string, authors: BookAuthorDTO[]): Promise<void>;
  setGenres(bookId: string, genres: BookGenreDTO[]): Promise<void>;
  setTags(bookId: string, tags: BookTagDTO[]): Promise<void>;
}
