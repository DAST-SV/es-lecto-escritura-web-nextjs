/**
 * ============================================
 * INTERFAZ: IBookTranslationRepository
 * Repositorio para traducciones de libros
 * ============================================
 */

import { BookTranslation } from '../entities/BookTranslation';
import { BookTranslationData, BookPageTranslationData } from '../types';

export interface CreateBookTranslationDTO {
  bookId: string;
  languageCode: string;
  title: string;
  description?: string;
  coverUrl?: string;
  pdfUrl?: string;
  isOriginal?: boolean;
}

export interface UpdateBookTranslationDTO {
  title?: string;
  description?: string;
  coverUrl?: string;
  pdfUrl?: string;
  isOriginal?: boolean;
  isActive?: boolean;
}

export interface CreateBookPageTranslationDTO {
  bookPageId: string;
  languageCode: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface IBookTranslationRepository {
  // Traducciones de libros
  findByBookId(bookId: string): Promise<BookTranslation[]>;
  findByBookAndLanguage(bookId: string, languageCode: string): Promise<BookTranslation | null>;
  create(dto: CreateBookTranslationDTO): Promise<BookTranslation>;
  update(id: string, dto: UpdateBookTranslationDTO): Promise<BookTranslation>;
  delete(id: string): Promise<void>;
  getAvailableLanguages(bookId: string): Promise<string[]>;
  setOriginalLanguage(bookId: string, languageCode: string): Promise<void>;

  // Traducciones de páginas
  findPageTranslations(bookPageId: string): Promise<BookPageTranslationData[]>;
  findPageTranslationByLanguage(bookPageId: string, languageCode: string): Promise<BookPageTranslationData | null>;
  createPageTranslation(dto: CreateBookPageTranslationDTO): Promise<BookPageTranslationData>;
  updatePageTranslation(id: string, dto: Partial<CreateBookPageTranslationDTO>): Promise<BookPageTranslationData>;
  deletePageTranslation(id: string): Promise<void>;

  // Operaciones en lote
  createPageTranslationsForBook(bookId: string, languageCode: string, pages: CreateBookPageTranslationDTO[]): Promise<void>;
  deleteAllPageTranslationsForLanguage(bookId: string, languageCode: string): Promise<void>;
}
