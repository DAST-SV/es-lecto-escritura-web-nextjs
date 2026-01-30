// src/core/application/use-cases/books-catalog/queries/get-books-by-category.query.ts

import { booksCatalogRepository } from '@/src/infrastructure/repositories/books-catalog';
import type { BookListItem } from '@/src/core/domain/entities/BookWithTranslations';

export interface GetBooksByCategoryParams {
  categorySlug: string;
  languageCode?: string;
  limit?: number;
  offset?: number;
}

export async function getBooksByCategoryQuery(
  params: GetBooksByCategoryParams
): Promise<BookListItem[]> {
  const { categorySlug, languageCode = 'es', limit = 20, offset = 0 } = params;

  try {
    return await booksCatalogRepository.getBooksByCategory(
      categorySlug,
      languageCode,
      limit,
      offset
    );
  } catch (error) {
    console.error('GetBooksByCategoryQuery error:', error);
    throw error;
  }
}
