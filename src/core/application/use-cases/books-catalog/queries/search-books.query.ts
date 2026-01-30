// src/core/application/use-cases/books-catalog/queries/search-books.query.ts

import { booksCatalogRepository } from '@/src/infrastructure/repositories/books-catalog';
import type { BookSearchResult } from '@/src/core/domain/entities/BookWithTranslations';

export interface SearchBooksParams {
  query: string;
  languageCode?: string;
  categorySlug?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}

export async function searchBooksQuery(
  params: SearchBooksParams
): Promise<BookSearchResult[]> {
  const {
    query,
    languageCode = 'es',
    categorySlug,
    difficulty,
    limit = 20,
    offset = 0
  } = params;

  try {
    return await booksCatalogRepository.searchBooks(
      query,
      languageCode,
      categorySlug,
      difficulty,
      limit,
      offset
    );
  } catch (error) {
    console.error('SearchBooksQuery error:', error);
    throw error;
  }
}
