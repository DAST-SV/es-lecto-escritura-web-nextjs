// src/core/application/use-cases/books-catalog/queries/get-book-pages.query.ts

import { booksCatalogRepository } from '@/src/infrastructure/repositories/books-catalog';
import type { BookPageContent } from '@/src/core/domain/entities/BookPageContent';

export interface GetBookPagesParams {
  bookId: string;
  languageCode?: string;
}

export async function getBookPagesQuery(
  params: GetBookPagesParams
): Promise<BookPageContent[]> {
  const { bookId, languageCode = 'es' } = params;

  try {
    return await booksCatalogRepository.getBookPages(bookId, languageCode);
  } catch (error) {
    console.error('GetBookPagesQuery error:', error);
    throw error;
  }
}
