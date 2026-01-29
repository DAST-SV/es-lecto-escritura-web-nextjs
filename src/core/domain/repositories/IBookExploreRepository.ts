/**
 * ============================================
 * INTERFAZ: IBookExploreRepository
 * Repositorio para exploración y búsqueda de libros
 * Con soporte para filtros, ordenamiento y paginación
 * ============================================
 */

import { BookExtended } from '../entities/BookExtended';
import {
  BookExploreFilters,
  BookSortOption,
  AccessType,
  CatalogItemTranslated,
  LevelItemTranslated
} from '../types';

export interface BookExploreResult {
  books: BookExtended[];
  total: number;
  hasMore: boolean;
  filters: BookExploreFilters;
}

export interface BookSearchResult {
  books: BookExtended[];
  total: number;
  searchTerm: string;
  suggestions?: string[];
}

export interface RelatedBooksResult {
  byCategory: BookExtended[];
  byAuthor: BookExtended[];
  byGenre: BookExtended[];
  byTags: BookExtended[];
}

export interface TrendingBooksResult {
  daily: BookExtended[];
  weekly: BookExtended[];
  monthly: BookExtended[];
}

export interface IBookExploreRepository {
  // Exploración principal
  explore(filters: BookExploreFilters): Promise<BookExploreResult>;

  // Búsqueda por texto
  search(searchTerm: string, filters?: BookExploreFilters): Promise<BookSearchResult>;
  getSuggestions(partialTerm: string, limit?: number): Promise<string[]>;

  // Libros destacados
  getFeaturedBooks(limit?: number, languageCode?: string): Promise<BookExtended[]>;
  getNewReleases(limit?: number, days?: number): Promise<BookExtended[]>;
  getPopularBooks(limit?: number, timeframe?: 'daily' | 'weekly' | 'monthly' | 'all'): Promise<BookExtended[]>;
  getTrendingBooks(limit?: number): Promise<TrendingBooksResult>;
  getTopRatedBooks(limit?: number, minRatings?: number): Promise<BookExtended[]>;

  // Libros por categoría/filtro
  getByCategory(categoryId: number, filters?: BookExploreFilters): Promise<BookExploreResult>;
  getByGenre(genreId: number, filters?: BookExploreFilters): Promise<BookExploreResult>;
  getByLevel(levelId: number, filters?: BookExploreFilters): Promise<BookExploreResult>;
  getByTag(tagId: number, filters?: BookExploreFilters): Promise<BookExploreResult>;
  getByValue(valueId: number, filters?: BookExploreFilters): Promise<BookExploreResult>;
  getByLanguage(languageCode: string, filters?: BookExploreFilters): Promise<BookExploreResult>;
  getByAccessType(accessType: AccessType, filters?: BookExploreFilters): Promise<BookExploreResult>;

  // Libros por autor
  getByAuthor(authorUserId: string, filters?: BookExploreFilters): Promise<BookExploreResult>;
  getByCollaborator(userId: string, filters?: BookExploreFilters): Promise<BookExploreResult>;

  // Libros relacionados
  getRelatedBooks(bookId: string, limit?: number): Promise<RelatedBooksResult>;
  getSimilarBooks(bookId: string, limit?: number): Promise<BookExtended[]>;

  // Libro individual con toda la información
  getBookDetail(bookId: string, languageCode?: string): Promise<BookExtended | null>;
  getBookBySlug(slug: string, languageCode?: string): Promise<BookExtended | null>;

  // Para feeds personalizados
  getRecommendedForUser(userId: string, limit?: number): Promise<BookExtended[]>;
  getContinueReading(userId: string, limit?: number): Promise<BookExtended[]>;
  getFromFollowedAuthors(userId: string, limit?: number): Promise<BookExtended[]>;
  getFromCommunities(userId: string, communityIds: string[], limit?: number): Promise<BookExtended[]>;

  // Catálogos traducidos para filtros UI
  getCategories(languageCode: string): Promise<CatalogItemTranslated[]>;
  getGenres(languageCode: string): Promise<CatalogItemTranslated[]>;
  getLevels(languageCode: string): Promise<LevelItemTranslated[]>;
  getTags(languageCode: string): Promise<CatalogItemTranslated[]>;
  getValues(languageCode: string): Promise<CatalogItemTranslated[]>;
  getAvailableLanguages(): Promise<{ code: string; name: string }[]>;

  // Estadísticas
  getTotalBooksCount(filters?: BookExploreFilters): Promise<number>;
  getCategoryBookCounts(): Promise<Record<number, number>>;
  getGenreBookCounts(): Promise<Record<number, number>>;
}
