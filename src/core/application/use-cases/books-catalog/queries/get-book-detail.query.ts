// src/core/application/use-cases/books-catalog/queries/get-book-detail.query.ts

import { booksCatalogRepository } from '@/src/infrastructure/repositories/books-catalog';
import type { BookByLanguage } from '@/src/core/domain/entities/BookWithTranslations';

export interface GetBookDetailParams {
  bookSlug: string;
  languageCode?: string;
}

export async function getBookDetailQuery(
  params: GetBookDetailParams
): Promise<BookByLanguage | null> {
  const { bookSlug, languageCode = 'es' } = params;

  try {
    return await booksCatalogRepository.getBookBySlug(bookSlug, languageCode);
  } catch (error) {
    console.error('GetBookDetailQuery error:', error);
    throw error;
  }
}
