// ============================================
// src/core/domain/repositories/IBookPageRepository2.ts
// Interface del repositorio de páginas de libros
// ============================================

import { BookPageEntity } from '../entities/BookPageEntity';

export interface CreatePageTranslationDTO {
  languageCode: string;
  content: string;
  audioUrl?: string | null;
  isActive?: boolean;
}

export interface CreateBookPageDTO {
  bookId: string;
  pageNumber: number;
  imageUrl?: string | null;
  audioUrl?: string | null;
  hasInteraction?: boolean;
  interactionType?: string | null;
  interactionData?: any | null;
  translations?: CreatePageTranslationDTO[];
}

export interface UpdateBookPageDTO {
  pageNumber?: number;
  imageUrl?: string | null;
  audioUrl?: string | null;
  hasInteraction?: boolean;
  interactionType?: string | null;
  interactionData?: any | null;
  translations?: CreatePageTranslationDTO[];
}

export interface IBookPageRepository2 {
  findAll(): Promise<BookPageEntity[]>;
  findById(id: string): Promise<BookPageEntity | null>;
  findByBookId(bookId: string): Promise<BookPageEntity[]>;
  findByBookIdAndPage(bookId: string, pageNumber: number): Promise<BookPageEntity | null>;
  create(data: CreateBookPageDTO): Promise<BookPageEntity>;
  update(id: string, data: UpdateBookPageDTO): Promise<BookPageEntity>;
  delete(id: string): Promise<void>;
  // Translation operations
  addTranslation(pageId: string, data: CreatePageTranslationDTO): Promise<void>;
  updateTranslation(pageId: string, languageCode: string, data: Partial<CreatePageTranslationDTO>): Promise<void>;
  deleteTranslation(pageId: string, languageCode: string): Promise<void>;
  // Bulk operations
  reorderPages(bookId: string, pageIds: string[]): Promise<void>;
}
