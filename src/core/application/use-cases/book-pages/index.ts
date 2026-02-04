// ============================================
// src/core/application/use-cases/book-pages/index.ts
// Casos de uso para páginas de libros
// ============================================

import { BookPageRepository } from '@/src/infrastructure/repositories/book-pages/BookPageRepository';
import { BookPageEntity } from '@/src/core/domain/entities/BookPageEntity';
import { CreateBookPageDTO, UpdateBookPageDTO, CreatePageTranslationDTO } from '@/src/core/domain/repositories/IBookPageRepository2';

const repository = new BookPageRepository();

export async function getAllBookPages(): Promise<BookPageEntity[]> {
  return repository.findAll();
}

export async function getBookPageById(id: string): Promise<BookPageEntity | null> {
  return repository.findById(id);
}

export async function getPagesByBook(bookId: string): Promise<BookPageEntity[]> {
  return repository.findByBookId(bookId);
}

export async function getBookPage(bookId: string, pageNumber: number): Promise<BookPageEntity | null> {
  return repository.findByBookIdAndPage(bookId, pageNumber);
}

export async function createBookPage(data: CreateBookPageDTO): Promise<BookPageEntity> {
  if (data.pageNumber < 1) throw new Error('El número de página debe ser mayor a 0');
  return repository.create(data);
}

export async function updateBookPage(id: string, data: UpdateBookPageDTO): Promise<BookPageEntity> {
  return repository.update(id, data);
}

export async function deleteBookPage(id: string): Promise<void> {
  return repository.delete(id);
}

export async function addPageTranslation(pageId: string, data: CreatePageTranslationDTO): Promise<void> {
  if (!data.content?.trim()) throw new Error('El contenido es requerido');
  return repository.addTranslation(pageId, data);
}

export async function updatePageTranslation(pageId: string, languageCode: string, data: Partial<CreatePageTranslationDTO>): Promise<void> {
  return repository.updateTranslation(pageId, languageCode, data);
}

export async function deletePageTranslation(pageId: string, languageCode: string): Promise<void> {
  return repository.deleteTranslation(pageId, languageCode);
}

export async function reorderPages(bookId: string, pageIds: string[]): Promise<void> {
  return repository.reorderPages(bookId, pageIds);
}
