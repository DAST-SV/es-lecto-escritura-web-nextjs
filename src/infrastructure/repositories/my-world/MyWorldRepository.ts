// src/infrastructure/repositories/my-world/MyWorldRepository.ts
/**
 * ============================================
 * REPOSITORIO: MyWorldRepository
 * Queries para el hub personal Mi Mundo
 * Libros en progreso, completados, favoritos, authored
 * Usa browser client + v_books_with_translations
 * ============================================
 */

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { LibraryBook, mapBookFromView } from '@/src/infrastructure/repositories/books/BookLibraryRepository';

// ============================================
// TIPOS
// ============================================

export interface MyWorldBook extends LibraryBook {
  completionPercentage: number;
  currentPage: number;
  isCompleted: boolean;
  lastReadAt: string | null;
  readingTimeSeconds: number;
}

export interface AuthoredBook {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string | null;
  status: 'draft' | 'pending' | 'published' | 'archived';
  pageCount: number;
  viewCount: number;
  isPremium: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyWorldStats {
  booksInProgress: number;
  booksCompleted: number;
  totalFavorites: number;
  totalReadingTime: number;
  totalAuthored: number;
  totalPublished: number;
  totalViews: number;
}

// ============================================
// REPOSITORIO
// ============================================

export class MyWorldRepository {

  // ============================================
  // LECTOR: Libros en progreso
  // ============================================

  static async getBooksInProgress(userId: string, locale: string = 'es', limit: number = 15): Promise<MyWorldBook[]> {
    const supabase = createClient();

    // 1. Obtener progreso del usuario
    const { data: progressData, error: progressError } = await supabase
      .schema('books')
      .from('reading_progress')
      .select('book_id, current_page, completion_percentage, is_completed, last_read_at, reading_time_seconds')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('last_read_at', { ascending: false })
      .limit(limit);

    if (progressError) {
      console.error('Error en getBooksInProgress:', progressError.message, progressError.code, progressError.details, progressError.hint);
      return [];
    }
    if (!progressData?.length) return [];

    const bookIds = progressData.map((p: any) => p.book_id);

    // 2. Obtener detalles de libros
    const { data: booksData, error: booksError } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .in('id', bookIds);

    if (booksError) {
      console.error('Error en getBooksInProgress (books):', booksError.message, booksError.code, booksError.details, booksError.hint);
      return [];
    }
    if (!booksData?.length) return [];

    // 3. Merge y mapear
    const progressMap = new Map(progressData.map((p: any) => [p.book_id, p]));

    return booksData
      .map((book: any) => {
        const mapped: any = mapBookFromView(book, locale);
        const progress: any = progressMap.get(book.id);
        return {
          ...mapped,
          completionPercentage: Number(progress?.completion_percentage) || 0,
          currentPage: progress?.current_page || 1,
          isCompleted: progress?.is_completed || false,
          lastReadAt: progress?.last_read_at || null,
          readingTimeSeconds: progress?.reading_time_seconds || 0,
        } as MyWorldBook;
      })
      .sort((a: any, b: any) => {
        const dateA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
        const dateB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  // ============================================
  // LECTOR: Libros completados
  // ============================================

  static async getCompletedBooks(userId: string, locale: string = 'es', limit: number = 15): Promise<MyWorldBook[]> {
    const supabase = createClient();

    const { data: progressData, error: progressError } = await supabase
      .schema('books')
      .from('reading_progress')
      .select('book_id, current_page, completion_percentage, is_completed, last_read_at, reading_time_seconds')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('last_read_at', { ascending: false })
      .limit(limit);

    if (progressError) {
      console.error('Error en getCompletedBooks:', progressError.message, progressError.code, progressError.details, progressError.hint);
      return [];
    }
    if (!progressData?.length) return [];

    const bookIds = progressData.map((p: any) => p.book_id);

    const { data: booksData, error: booksError } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .in('id', bookIds);

    if (booksError) {
      console.error('Error en getCompletedBooks (books):', booksError.message, booksError.code, booksError.details, booksError.hint);
      return [];
    }
    if (!booksData?.length) return [];

    const progressMap = new Map(progressData.map((p: any) => [p.book_id, p]));

    return booksData
      .map((book: any) => {
        const mapped: any = mapBookFromView(book, locale);
        const progress: any = progressMap.get(book.id);
        return {
          ...mapped,
          completionPercentage: Number(progress?.completion_percentage) || 100,
          currentPage: progress?.current_page || 1,
          isCompleted: true,
          lastReadAt: progress?.last_read_at || null,
          readingTimeSeconds: progress?.reading_time_seconds || 0,
        } as MyWorldBook;
      })
      .sort((a: any, b: any) => {
        const dateA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
        const dateB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  // ============================================
  // LECTOR: Libros favoritos
  // ============================================

  static async getFavoriteBooks(userId: string, locale: string = 'es', limit: number = 15): Promise<LibraryBook[]> {
    const supabase = createClient();

    const { data: favData, error: favError } = await supabase
      .schema('books')
      .from('favorites')
      .select('book_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (favError) {
      console.error('Error en getFavoriteBooks:', favError.message, favError.code, favError.details, favError.hint);
      return [];
    }
    if (!favData?.length) return [];

    const bookIds = favData.map((f: any) => f.book_id);

    const { data: booksData, error: booksError } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .in('id', bookIds);

    if (booksError) {
      console.error('Error en getFavoriteBooks (books):', booksError.message, booksError.code, booksError.details, booksError.hint);
      return [];
    }

    return (booksData || []).map((b: any) => mapBookFromView(b, locale));
  }

  // ============================================
  // ESCRITOR: Libros del autor
  // ============================================

  static async getAuthoredBooks(userId: string, locale: string = 'es'): Promise<AuthoredBook[]> {
    const supabase = createClient();

    // 1. Obtener libros del usuario
    const { data: booksData, error: booksError } = await supabase
      .schema('books')
      .from('books')
      .select('id, slug, cover_url, status, page_count, view_count, is_premium, is_featured, published_at, created_at, updated_at')
      .eq('created_by', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (booksError) {
      console.error('Error en getAuthoredBooks:', booksError.message, booksError.code, booksError.details, booksError.hint);
      return [];
    }
    if (!booksData?.length) return [];

    // 2. Obtener traducciones
    const bookIds = booksData.map((b: any) => b.id);
    const { data: translationsData } = await supabase
      .schema('books')
      .from('book_translations')
      .select('book_id, title, description, cover_url, language_code, is_primary')
      .in('book_id', bookIds);

    // 3. Mapear traducciones: preferir idioma actual, fallback a primaria
    const transMap = new Map<string, { title: string; description: string; cover_url: string | null }>();
    const localeMatched = new Set<string>();

    (translationsData || []).forEach((t: any) => {
      if (t.language_code === locale) {
        transMap.set(t.book_id, { title: t.title, description: t.description, cover_url: t.cover_url });
        localeMatched.add(t.book_id);
      } else if (t.is_primary && !localeMatched.has(t.book_id)) {
        transMap.set(t.book_id, { title: t.title, description: t.description, cover_url: t.cover_url });
      } else if (!transMap.has(t.book_id)) {
        transMap.set(t.book_id, { title: t.title, description: t.description, cover_url: t.cover_url });
      }
    });

    return booksData.map((book: any) => {
      const trans = transMap.get(book.id);
      return {
        id: book.id,
        slug: book.slug,
        title: trans?.title || book.slug || 'Sin titulo',
        description: trans?.description || '',
        coverUrl: trans?.cover_url || book.cover_url,
        status: book.status as AuthoredBook['status'],
        pageCount: book.page_count || 0,
        viewCount: book.view_count || 0,
        isPremium: book.is_premium || false,
        isFeatured: book.is_featured || false,
        publishedAt: book.published_at,
        createdAt: book.created_at,
        updatedAt: book.updated_at,
      };
    });
  }

  // ============================================
  // STATS
  // ============================================

  static async getUserStats(userId: string): Promise<MyWorldStats> {
    const supabase = createClient();

    const [progressRes, favRes, authoredRes] = await Promise.all([
      // Progreso de lectura
      supabase
        .schema('books')
        .from('reading_progress')
        .select('is_completed, reading_time_seconds')
        .eq('user_id', userId),
      // Favoritos
      supabase
        .schema('books')
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      // Libros del autor
      supabase
        .schema('books')
        .from('books')
        .select('status, view_count')
        .eq('created_by', userId)
        .is('deleted_at', null),
    ]);

    const progressData = progressRes.data || [];
    const booksInProgress = progressData.filter((p: any) => !p.is_completed).length;
    const booksCompleted = progressData.filter((p: any) => p.is_completed).length;
    const totalReadingTime = progressData.reduce((sum: number, p: any) => sum + (p.reading_time_seconds || 0), 0);

    const totalFavorites = favRes.count || 0;

    const authoredData = authoredRes.data || [];
    const totalAuthored = authoredData.length;
    const totalPublished = authoredData.filter((b: any) => b.status === 'published').length;
    const totalViews = authoredData.reduce((sum: number, b: any) => sum + (b.view_count || 0), 0);

    return {
      booksInProgress,
      booksCompleted,
      totalFavorites,
      totalReadingTime,
      totalAuthored,
      totalPublished,
      totalViews,
    };
  }
}
