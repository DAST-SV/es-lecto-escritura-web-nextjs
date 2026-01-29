/**
 * ============================================
 * INTERFAZ: ICatalogTranslationRepository
 * Repositorio para traducciones de catálogos de libros
 * ============================================
 */

import { CatalogItemTranslated, LevelItemTranslated, CountryData } from '../types';

export interface ICatalogTranslationRepository {
  // Categorías
  getCategoriesTranslated(languageCode: string): Promise<CatalogItemTranslated[]>;
  getCategoryTranslation(categoryId: number, languageCode: string): Promise<CatalogItemTranslated | null>;
  addCategoryTranslation(categoryId: number, languageCode: string, name: string, description?: string): Promise<void>;
  updateCategoryTranslation(categoryId: number, languageCode: string, name: string, description?: string): Promise<void>;
  deleteCategoryTranslation(categoryId: number, languageCode: string): Promise<void>;

  // Géneros
  getGenresTranslated(languageCode: string): Promise<CatalogItemTranslated[]>;
  getGenreTranslation(genreId: number, languageCode: string): Promise<CatalogItemTranslated | null>;
  addGenreTranslation(genreId: number, languageCode: string, name: string, description?: string): Promise<void>;
  updateGenreTranslation(genreId: number, languageCode: string, name: string, description?: string): Promise<void>;
  deleteGenreTranslation(genreId: number, languageCode: string): Promise<void>;

  // Valores
  getValuesTranslated(languageCode: string): Promise<CatalogItemTranslated[]>;
  getValueTranslation(valueId: number, languageCode: string): Promise<CatalogItemTranslated | null>;
  addValueTranslation(valueId: number, languageCode: string, name: string, description?: string): Promise<void>;
  updateValueTranslation(valueId: number, languageCode: string, name: string, description?: string): Promise<void>;
  deleteValueTranslation(valueId: number, languageCode: string): Promise<void>;

  // Niveles
  getLevelsTranslated(languageCode: string): Promise<LevelItemTranslated[]>;
  getLevelTranslation(levelId: number, languageCode: string): Promise<LevelItemTranslated | null>;
  addLevelTranslation(levelId: number, languageCode: string, name: string, description?: string): Promise<void>;
  updateLevelTranslation(levelId: number, languageCode: string, name: string, description?: string): Promise<void>;
  deleteLevelTranslation(levelId: number, languageCode: string): Promise<void>;

  // Etiquetas
  getTagsTranslated(languageCode: string): Promise<CatalogItemTranslated[]>;
  getTagTranslation(tagId: number, languageCode: string): Promise<CatalogItemTranslated | null>;
  addTagTranslation(tagId: number, languageCode: string, name: string): Promise<void>;
  updateTagTranslation(tagId: number, languageCode: string, name: string): Promise<void>;
  deleteTagTranslation(tagId: number, languageCode: string): Promise<void>;

  // Países
  getCountriesTranslated(languageCode: string): Promise<CountryData[]>;
  getCountriesByRegion(region: string, languageCode: string): Promise<CountryData[]>;
  getCountryTranslation(countryCode: string, languageCode: string): Promise<CountryData | null>;
  addCountryTranslation(countryCode: string, languageCode: string, name: string): Promise<void>;
  updateCountryTranslation(countryCode: string, languageCode: string, name: string): Promise<void>;
  deleteCountryTranslation(countryCode: string, languageCode: string): Promise<void>;

  // Operaciones en lote
  bulkAddCategoryTranslations(translations: Array<{ categoryId: number; languageCode: string; name: string; description?: string }>): Promise<void>;
  bulkAddGenreTranslations(translations: Array<{ genreId: number; languageCode: string; name: string; description?: string }>): Promise<void>;
  bulkAddValueTranslations(translations: Array<{ valueId: number; languageCode: string; name: string; description?: string }>): Promise<void>;
  bulkAddTagTranslations(translations: Array<{ tagId: number; languageCode: string; name: string }>): Promise<void>;

  // Utilidades
  getAvailableLanguagesForCatalog(catalogType: 'categories' | 'genres' | 'values' | 'levels' | 'tags'): Promise<string[]>;
  getMissingTranslations(languageCode: string): Promise<{
    categories: number[];
    genres: number[];
    values: number[];
    levels: number[];
    tags: number[];
  }>;
}
