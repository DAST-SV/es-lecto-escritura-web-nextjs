// ============================================
// src/core/application/use-cases/books-admin/index.ts
// Casos de uso para gestión de libros (admin)
// ============================================

import { BookAdminRepository } from '@/src/infrastructure/repositories/books-admin/BookAdminRepository';
import { BookAdmin } from '@/src/core/domain/entities/BookAdmin';
import {
  CreateBookAdminDTO,
  UpdateBookAdminDTO,
  CreateBookTranslationDTO,
  UpdateBookTranslationDTO,
  BookAuthorDTO,
  BookGenreDTO,
  BookTagDTO,
} from '@/src/core/domain/repositories/IBookAdminRepository';

const repository = new BookAdminRepository();

// ============================================
// GET ALL
// ============================================
export async function getAllBooksAdmin(includeDeleted = false): Promise<BookAdmin[]> {
  return repository.findAll(includeDeleted);
}

// ============================================
// GET BY ID
// ============================================
export async function getBookAdminById(id: string): Promise<BookAdmin | null> {
  return repository.findById(id);
}

// ============================================
// GET BY SLUG
// ============================================
export async function getBookAdminBySlug(slug: string): Promise<BookAdmin | null> {
  return repository.findBySlug(slug);
}

// ============================================
// CREATE
// ============================================
export async function createBookAdmin(data: CreateBookAdminDTO): Promise<BookAdmin> {
  if (!data.slug?.trim()) throw new Error('El slug es requerido');
  if (!data.categoryId?.trim()) throw new Error('La categoría es requerida');
  if (!data.translations || data.translations.length === 0) {
    throw new Error('Se requiere al menos una traducción');
  }

  // Validate translations have titles
  for (const trans of data.translations) {
    if (!trans.title?.trim()) {
      throw new Error(`El título es requerido para el idioma ${trans.languageCode}`);
    }
  }

  return repository.create(data);
}

// ============================================
// UPDATE
// ============================================
export async function updateBookAdmin(id: string, data: UpdateBookAdminDTO): Promise<BookAdmin> {
  if (data.translations) {
    for (const trans of data.translations) {
      if (!trans.title?.trim()) {
        throw new Error(`El título es requerido para el idioma ${trans.languageCode}`);
      }
    }
  }

  return repository.update(id, data);
}

// ============================================
// SOFT DELETE
// ============================================
export async function softDeleteBookAdmin(id: string): Promise<void> {
  return repository.softDelete(id);
}

// ============================================
// RESTORE
// ============================================
export async function restoreBookAdmin(id: string): Promise<void> {
  return repository.restore(id);
}

// ============================================
// HARD DELETE
// ============================================
export async function hardDeleteBookAdmin(id: string): Promise<void> {
  return repository.hardDelete(id);
}

// ============================================
// PUBLISH
// ============================================
export async function publishBook(id: string): Promise<BookAdmin> {
  // Validate book has required data before publishing
  const book = await repository.findById(id);
  if (!book) throw new Error('Libro no encontrado');

  if (book.translations.length === 0) {
    throw new Error('El libro debe tener al menos una traducción antes de publicar');
  }

  const primaryTrans = book.getPrimaryTranslation();
  if (!primaryTrans) {
    throw new Error('El libro debe tener una traducción principal');
  }

  return repository.publish(id);
}

// ============================================
// UNPUBLISH
// ============================================
export async function unpublishBook(id: string): Promise<BookAdmin> {
  return repository.unpublish(id);
}

// ============================================
// TRANSLATION OPERATIONS
// ============================================
export async function addBookTranslation(bookId: string, data: CreateBookTranslationDTO): Promise<void> {
  if (!data.title?.trim()) throw new Error('El título es requerido');
  return repository.addTranslation(bookId, data);
}

export async function updateBookTranslation(bookId: string, languageCode: string, data: UpdateBookTranslationDTO): Promise<void> {
  if (data.title !== undefined && !data.title?.trim()) {
    throw new Error('El título no puede estar vacío');
  }
  return repository.updateTranslation(bookId, languageCode, data);
}

export async function deleteBookTranslation(bookId: string, languageCode: string): Promise<void> {
  // Validate not deleting the only translation
  const book = await repository.findById(bookId);
  if (!book) throw new Error('Libro no encontrado');

  if (book.translations.length <= 1) {
    throw new Error('No se puede eliminar la única traducción del libro');
  }

  const translation = book.getTranslation(languageCode);
  if (translation?.isPrimary) {
    throw new Error('No se puede eliminar la traducción principal. Establezca otra como principal primero.');
  }

  return repository.deleteTranslation(bookId, languageCode);
}

// ============================================
// RELATION OPERATIONS
// ============================================
export async function setBookAuthors(bookId: string, authors: BookAuthorDTO[]): Promise<void> {
  return repository.setAuthors(bookId, authors);
}

export async function setBookGenres(bookId: string, genres: BookGenreDTO[]): Promise<void> {
  return repository.setGenres(bookId, genres);
}

export async function setBookTags(bookId: string, tags: BookTagDTO[]): Promise<void> {
  return repository.setTags(bookId, tags);
}
