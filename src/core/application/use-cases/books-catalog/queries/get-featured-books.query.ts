// src/core/application/use-cases/books-catalog/queries/get-featured-books.query.ts

import { booksCatalogRepository } from '@/src/infrastructure/repositories/books-catalog';
import type { BookListItem } from '@/src/core/domain/entities/BookWithTranslations';

export interface GetFeaturedBooksParams {
  languageCode?: string;
  limit?: number;
}

export async function getFeaturedBooksQuery(
  params: GetFeaturedBooksParams = {}
): Promise<BookListItem[]> {
  const { languageCode = 'es', limit = 6 } = params;

  try {
    return await booksCatalogRepository.getFeaturedBooks(languageCode, limit);
  } catch (error) {
    console.error('GetFeaturedBooksQuery error:', error);
    throw error;
  }
}
