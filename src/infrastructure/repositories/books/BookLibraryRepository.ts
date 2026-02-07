/**
 * ============================================
 * REPOSITORIO: BookLibraryRepository
 * Queries optimizadas para la pagina de Biblioteca
 * Carouseles estilo Netflix con datos por categoria
 * ============================================
 */

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { BookExtended } from '@/src/core/domain/entities/BookExtended';

// ============================================
// TIPOS
// ============================================

export interface CategoryWithBooks {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  bookCount: number;
}

// ============================================
// HELPER: mapear libro desde query con relaciones
// ============================================

function mapBookFromQuery(book: Record<string, any>): BookExtended {
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
}

const BOOK_SELECT = `
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
`;

// ============================================
// REPOSITORIO
// ============================================

export class BookLibraryRepository {

  /**
   * Libros mas populares (por view_count)
   */
  static async getTopBooks(limit: number = 10): Promise<BookExtended[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('books')
      .select(BOOK_SELECT)
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error en getTopBooks:', error);
      return [];
    }

    return (data || []).map(mapBookFromQuery);
  }

  /**
   * Libros recientes (por published_at)
   */
  static async getNewBooks(limit: number = 15): Promise<BookExtended[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('books')
      .select(BOOK_SELECT)
      .eq('is_published', true)
      .is('deleted_at', null)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error('Error en getNewBooks:', error);
      return [];
    }

    return (data || []).map(mapBookFromQuery);
  }

  /**
   * Libros destacados
   */
  static async getFeaturedBooks(limit: number = 10): Promise<BookExtended[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('books')
      .select(BOOK_SELECT)
      .eq('is_published', true)
      .eq('is_featured', true)
      .is('deleted_at', null)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error('Error en getFeaturedBooks:', error);
      return [];
    }

    return (data || []).map(mapBookFromQuery);
  }

  /**
   * Mejor valorados (por rating)
   */
  static async getTopRated(limit: number = 15): Promise<BookExtended[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('books')
      .select(BOOK_SELECT)
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit * 2); // over-fetch para poder ordenar por rating

    if (error) {
      console.error('Error en getTopRated:', error);
      return [];
    }

    const books = (data || []).map(mapBookFromQuery);

    // Ordenar por rating en cliente y tomar los mejores
    return books
      .sort((a, b) => {
        const ratingA = a.ratingStats?.averageRating || 0;
        const ratingB = b.ratingStats?.averageRating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.ratingStats?.totalRatings || 0) - (a.ratingStats?.totalRatings || 0);
      })
      .slice(0, limit);
  }

  /**
   * Libros por categoria
   */
  static async getBooksByCategory(categoryId: string, limit: number = 15): Promise<BookExtended[]> {
    const supabase = createClient();

    // Primero obtener IDs de libros en esa categoria
    const { data: bookIds } = await supabase
      .from('books_categories')
      .select('book_id')
      .eq('category_id', categoryId);

    if (!bookIds || bookIds.length === 0) return [];

    const ids = bookIds.map(b => b.book_id);

    const { data, error } = await supabase
      .from('books')
      .select(BOOK_SELECT)
      .in('id', ids)
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error en getBooksByCategory:', error);
      return [];
    }

    return (data || []).map(mapBookFromQuery);
  }

  /**
   * Categorias que tienen al menos 1 libro publicado
   */
  static async getCategoriesWithBooks(): Promise<CategoryWithBooks[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('book_categories')
      .select(`
        id, slug, name, description,
        books_categories!inner (
          book_id,
          books!inner (id, is_published, deleted_at)
        )
      `)
      .eq('books_categories.books.is_published', true)
      .is('books_categories.books.deleted_at', null);

    if (error) {
      // Fallback: obtener categorias sin conteo
      const { data: cats } = await supabase
        .from('book_categories')
        .select('id, slug, name, description')
        .order('name');

      return (cats || []).map((cat: any) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        icon: null,
        color: null,
        bookCount: 0,
      }));
    }

    // Contar libros unicos por categoria
    const categoryMap = new Map<string, CategoryWithBooks>();

    (data || []).forEach((cat: any) => {
      const uniqueBookIds = new Set<string>();
      (cat.books_categories || []).forEach((bc: any) => {
        if (bc.books && bc.books.id) {
          uniqueBookIds.add(bc.books.id);
        }
      });

      if (uniqueBookIds.size > 0) {
        categoryMap.set(cat.id, {
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          icon: null,
          color: null,
          bookCount: uniqueBookIds.size,
        });
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.bookCount - a.bookCount);
  }

  /**
   * Busqueda rapida de libros
   */
  static async searchBooks(term: string, limit: number = 20): Promise<BookExtended[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('books')
      .select(BOOK_SELECT)
      .eq('is_published', true)
      .is('deleted_at', null)
      .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error en searchBooks:', error);
      return [];
    }

    return (data || []).map(mapBookFromQuery);
  }
}

export default BookLibraryRepository;
