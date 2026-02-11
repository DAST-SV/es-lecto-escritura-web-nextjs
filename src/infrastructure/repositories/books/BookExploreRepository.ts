// src/infrastructure/repositories/books/BookExploreRepository.ts
/**
 * ============================================
 * REPOSITORIO: BookExploreRepository
 * Implementación de IBookExploreRepository
 * Para exploración y búsqueda de libros
 * ============================================
 */

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { BookExtended } from '@/src/core/domain/entities/BookExtended';
import {
  BookExploreFilters,
  CatalogItemTranslated,
  LevelItemTranslated,
  AccessType,
} from '@/src/core/domain/types';

export interface BookExploreResult {
  books: BookExtended[];
  total: number;
  hasMore: boolean;
  filters: BookExploreFilters;
}

/**
 * Repositorio para exploración de libros
 */
export class BookExploreRepository {

  /**
   * Exploración principal con filtros
   */
  static async explore(filters: BookExploreFilters = {}): Promise<BookExploreResult> {
    const supabase = createClient();
    const limit = filters.limit || 12;
    const offset = filters.offset || 0;

    // Query base con relaciones
    let query = supabase
      .from('books')
      .select(`
        *,
        book_levels (id, name, min_age, max_age),
        book_rating_stats (average_rating, total_ratings, total_reviews),
        books_categories (
          category_id,
          is_primary,
          book_categories (id, name, slug)
        ),
        books_genres (
          genre_id,
          book_genres (id, name)
        )
      `, { count: 'exact' })
      .eq('is_published', true)
      .is('deleted_at', null);

    // Filtro por categorías
    if (filters.categories && filters.categories.length > 0) {
      const { data: bookIds } = await supabase
        .from('books_categories')
        .select('book_id')
        .in('category_id', filters.categories);

      if (bookIds && bookIds.length > 0) {
        query = query.in('id', bookIds.map((b: any) => b.book_id));
      } else {
        return { books: [], total: 0, hasMore: false, filters };
      }
    }

    // Filtro por géneros
    if (filters.genres && filters.genres.length > 0) {
      const { data: bookIds } = await supabase
        .from('books_genres')
        .select('book_id')
        .in('genre_id', filters.genres);

      if (bookIds && bookIds.length > 0) {
        query = query.in('id', bookIds.map((b: any) => b.book_id));
      } else {
        return { books: [], total: 0, hasMore: false, filters };
      }
    }

    // Filtro por niveles
    if (filters.levels && filters.levels.length > 0) {
      query = query.in('level_id', filters.levels);
    }

    // Filtro por tipo de acceso
    if (filters.accessTypes && filters.accessTypes.length > 0) {
      query = query.in('access_type', filters.accessTypes);
    }

    // Búsqueda por texto
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Ordenamiento
    switch (filters.sortBy) {
      case 'popular':
        query = query.order('view_count', { ascending: false });
        break;
      case 'rating':
        query = query.order('created_at', { ascending: false }); // Fallback, rating stats se ordenan en cliente
        break;
      case 'title_asc':
        query = query.order('title', { ascending: true });
        break;
      case 'title_desc':
        query = query.order('title', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('published_at', { ascending: false, nullsFirst: false });
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Paginación
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error en explore:', error);
      throw error;
    }

    // Mapear a entidades
    const books = (data || []).map((book: any) => {
      const categories = (book.books_categories || [])
        .filter((bc: any) => bc.book_categories)
        .map((bc: any) => ({
          id: bc.book_categories.id,
          name: bc.book_categories.name,
          slug: bc.book_categories.slug,
          is_primary: bc.is_primary,
        }));

      const genres = (book.books_genres || [])
        .filter((bg: any) => bg.book_genres)
        .map((bg: any) => ({
          id: bg.book_genres.id,
          name: bg.book_genres.name,
        }));

      return BookExtended.fromDatabase(book, {
        level: book.book_levels,
        categories,
        genres,
        ratingStats: book.book_rating_stats,
      });
    });

    // Ordenar por rating si es necesario (post-query)
    if (filters.sortBy === 'rating') {
      books.sort((a: any, b: any) => {
        const ratingA = a.ratingStats?.averageRating || 0;
        const ratingB = b.ratingStats?.averageRating || 0;
        return ratingB - ratingA;
      });
    }

    return {
      books,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
      filters,
    };
  }

  /**
   * Obtener libros destacados
   */
  static async getFeaturedBooks(limit: number = 6): Promise<BookExtended[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        book_levels (id, name, min_age, max_age),
        book_rating_stats (average_rating, total_ratings),
        books_categories (
          category_id,
          is_primary,
          book_categories (id, name, slug)
        )
      `)
      .eq('is_published', true)
      .eq('is_featured', true)
      .is('deleted_at', null)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error('Error en getFeaturedBooks:', error);
      throw error;
    }

    return (data || []).map((book: any) => {
      const categories = (book.books_categories || [])
        .filter((bc: any) => bc.book_categories)
        .map((bc: any) => ({
          id: bc.book_categories.id,
          name: bc.book_categories.name,
          slug: bc.book_categories.slug,
          is_primary: bc.is_primary,
        }));

      return BookExtended.fromDatabase(book, {
        level: book.book_levels,
        categories,
        ratingStats: book.book_rating_stats,
      });
    });
  }

  /**
   * Obtener libros populares
   */
  static async getPopularBooks(limit: number = 6): Promise<BookExtended[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        book_levels (id, name, min_age, max_age),
        book_rating_stats (average_rating, total_ratings),
        books_categories (
          category_id,
          is_primary,
          book_categories (id, name, slug)
        )
      `)
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error en getPopularBooks:', error);
      throw error;
    }

    return (data || []).map((book: any) => {
      const categories = (book.books_categories || [])
        .filter((bc: any) => bc.book_categories)
        .map((bc: any) => ({
          id: bc.book_categories.id,
          name: bc.book_categories.name,
          slug: bc.book_categories.slug,
          is_primary: bc.is_primary,
        }));

      return BookExtended.fromDatabase(book, {
        level: book.book_levels,
        categories,
        ratingStats: book.book_rating_stats,
      });
    });
  }

  /**
   * Obtener categorías
   */
  static async getCategories(): Promise<CatalogItemTranslated[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('book_categories')
      .select('id, name, slug, description')
      .order('name');

    if (error) {
      console.error('Error en getCategories:', error);
      throw error;
    }

    return (data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
    }));
  }

  /**
   * Obtener géneros
   */
  static async getGenres(): Promise<CatalogItemTranslated[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('book_genres')
      .select('id, name, description')
      .order('name');

    if (error) {
      console.error('Error en getGenres:', error);
      throw error;
    }

    return (data || []).map((genre: any) => ({
      id: genre.id,
      name: genre.name,
      description: genre.description,
    }));
  }

  /**
   * Obtener niveles de lectura
   */
  static async getLevels(): Promise<LevelItemTranslated[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('book_levels')
      .select('id, name, min_age, max_age, description')
      .order('min_age');

    if (error) {
      console.error('Error en getLevels:', error);
      throw error;
    }

    return (data || []).map((level: any) => ({
      id: level.id,
      name: level.name,
      minAge: level.min_age || 0,
      maxAge: level.max_age || 99,
      description: level.description,
    }));
  }

  /**
   * Obtener conteo de libros por categoría
   */
  static async getCategoryBookCounts(): Promise<Record<number, number>> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('books_categories')
      .select(`
        category_id,
        books!inner (id, is_published, deleted_at)
      `)
      .eq('books.is_published', true)
      .is('books.deleted_at', null);

    if (error) {
      console.error('Error en getCategoryBookCounts:', error);
      return {};
    }

    const counts: Record<number, number> = {};
    (data || []).forEach((item: any) => {
      counts[item.category_id] = (counts[item.category_id] || 0) + 1;
    });

    return counts;
  }

  /**
   * Búsqueda con sugerencias
   */
  static async search(
    searchTerm: string,
    filters: BookExploreFilters = {}
  ): Promise<BookExploreResult> {
    return this.explore({
      ...filters,
      searchTerm,
    });
  }
}

export default BookExploreRepository;
