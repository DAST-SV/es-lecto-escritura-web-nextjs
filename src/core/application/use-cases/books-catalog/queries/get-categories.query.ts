// src/core/application/use-cases/books-catalog/queries/get-categories.query.ts

import { booksCatalogRepository } from '@/src/infrastructure/repositories/books-catalog';
import type { CategoryByLanguage } from '@/src/core/domain/entities/BookCategory';

export interface GetCategoriesParams {
  languageCode?: string;
}

export async function getCategoriesQuery(
  params: GetCategoriesParams = {}
): Promise<CategoryByLanguage[]> {
  const { languageCode = 'es' } = params;

  try {
    return await booksCatalogRepository.getCategoriesByLanguage(languageCode);
  } catch (error) {
    console.error('GetCategoriesQuery error:', error);
    throw error;
  }
}
