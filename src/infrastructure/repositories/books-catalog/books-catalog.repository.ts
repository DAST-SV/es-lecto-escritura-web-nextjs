// src/infrastructure/repositories/books-catalog/books-catalog.repository.ts

import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config';
import type { CategoryByLanguage } from '@/src/core/domain/entities/BookCategory';
import type {
  BookByLanguage,
  BookListItem,
  BookSearchResult,
  BookWithTranslations
} from '@/src/core/domain/entities/BookWithTranslations';
import type { BookPageContent } from '@/src/core/domain/entities/BookPageContent';

export class BooksCatalogRepository {

  /**
   * Obtiene todas las categorías traducidas al idioma especificado
   */
  async getCategoriesByLanguage(languageCode: string = 'es'): Promise<CategoryByLanguage[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc('get_categories_by_language', {
      p_language_code: languageCode
    });

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }

    return (data || []).map((cat: Record<string, unknown>) => ({
      id: cat.id as string,
      slug: cat.slug as string,
      name: cat.name as string,
      description: cat.description as string | null,
      icon: cat.icon as string | null,
      color: cat.color as string | null,
      orderIndex: cat.order_index as number,
      bookCount: Number(cat.book_count) || 0
    }));
  }

  /**
   * Obtiene un libro por ID en el idioma especificado
   */
  async getBookByLanguage(bookId: string, languageCode: string = 'es'): Promise<BookByLanguage | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc('get_book_by_language', {
      p_book_id: bookId,
      p_language_code: languageCode
    });

    if (error) {
      console.error('Error fetching book:', error);
      throw new Error(`Error al obtener libro: ${error.message}`);
    }

    if (!data || data.length === 0) return null;

    const book = data[0];
    return {
      id: book.id,
      slug: book.slug,
      title: book.title,
      subtitle: book.subtitle,
      description: book.description,
      summary: book.summary,
      coverUrl: book.cover_url,
      difficulty: book.difficulty,
      status: book.status,
      estimatedReadTime: book.estimated_read_time,
      pageCount: book.page_count,
      isFeatured: book.is_featured,
      isPremium: book.is_premium,
      categoryId: book.category_id,
      categoryName: book.category_name,
      publishedAt: book.published_at
    };
  }

  /**
   * Obtiene un libro por slug
   */
  async getBookBySlug(slug: string, languageCode: string = 'es'): Promise<BookByLanguage | null> {
    const supabase = await createServerSupabaseClient();

    // Primero obtener el ID del libro por slug
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (bookError || !bookData) {
      return null;
    }

    return this.getBookByLanguage(bookData.id, languageCode);
  }

  /**
   * Obtiene libros por categoría
   */
  async getBooksByCategory(
    categorySlug: string,
    languageCode: string = 'es',
    limit: number = 20,
    offset: number = 0
  ): Promise<BookListItem[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc('get_books_by_category', {
      p_category_slug: categorySlug,
      p_language_code: languageCode,
      p_limit: limit,
      p_offset: offset,
      p_status: 'published'
    });

    if (error) {
      console.error('Error fetching books by category:', error);
      throw new Error(`Error al obtener libros: ${error.message}`);
    }

    return (data || []).map((book: Record<string, unknown>) => ({
      id: book.id as string,
      slug: book.slug as string,
      title: book.title as string,
      subtitle: book.subtitle as string | null,
      summary: book.summary as string | null,
      coverUrl: book.cover_url as string | null,
      difficulty: book.difficulty as BookListItem['difficulty'],
      estimatedReadTime: book.estimated_read_time as number,
      pageCount: book.page_count as number,
      isFeatured: book.is_featured as boolean,
      isPremium: book.is_premium as boolean,
      publishedAt: book.published_at as string | null
    }));
  }

  /**
   * Busca libros por texto
   */
  async searchBooks(
    query: string,
    languageCode: string = 'es',
    categorySlug?: string,
    difficulty?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<BookSearchResult[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc('search_books', {
      p_query: query,
      p_language_code: languageCode,
      p_category_slug: categorySlug || null,
      p_difficulty: difficulty || null,
      p_limit: limit,
      p_offset: offset
    });

    if (error) {
      console.error('Error searching books:', error);
      throw new Error(`Error al buscar libros: ${error.message}`);
    }

    return (data || []).map((book: Record<string, unknown>) => ({
      id: book.id as string,
      slug: book.slug as string,
      title: book.title as string,
      subtitle: null,
      summary: book.summary as string | null,
      coverUrl: book.cover_url as string | null,
      difficulty: book.difficulty as BookSearchResult['difficulty'],
      estimatedReadTime: 0,
      pageCount: 0,
      isFeatured: false,
      isPremium: false,
      publishedAt: null,
      categorySlug: book.category_slug as string,
      categoryName: book.category_name as string,
      relevance: book.relevance as number
    }));
  }

  /**
   * Obtiene las páginas de un libro
   */
  async getBookPages(bookId: string, languageCode: string = 'es'): Promise<BookPageContent[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc('get_book_pages', {
      p_book_id: bookId,
      p_language_code: languageCode
    });

    if (error) {
      console.error('Error fetching book pages:', error);
      throw new Error(`Error al obtener páginas: ${error.message}`);
    }

    return (data || []).map((page: Record<string, unknown>) => ({
      id: page.id as string,
      pageNumber: page.page_number as number,
      content: page.content as string,
      imageUrl: page.image_url as string | null,
      audioUrl: page.audio_url as string | null,
      hasInteraction: page.has_interaction as boolean,
      interactionType: page.interaction_type as string | null,
      interactionData: page.interaction_data as Record<string, unknown> | null
    }));
  }

  /**
   * Obtiene libros destacados
   */
  async getFeaturedBooks(languageCode: string = 'es', limit: number = 6): Promise<BookListItem[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('v_books_with_translations')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured books:', error);
      throw new Error(`Error al obtener libros destacados: ${error.message}`);
    }

    return (data || []).map((book: Record<string, unknown>) => {
      const translations = book.translations as Record<string, { title: string; subtitle?: string; summary?: string }> || {};
      const trans = translations[languageCode] || translations['es'] || { title: 'Sin título' };

      return {
        id: book.id as string,
        slug: book.slug as string,
        title: trans.title,
        subtitle: trans.subtitle || null,
        summary: trans.summary || null,
        coverUrl: book.cover_url as string | null,
        difficulty: book.difficulty as BookListItem['difficulty'],
        estimatedReadTime: book.estimated_read_time as number,
        pageCount: book.page_count as number,
        isFeatured: book.is_featured as boolean,
        isPremium: book.is_premium as boolean,
        publishedAt: book.published_at as string | null
      };
    });
  }

  /**
   * Obtiene todos los libros con todas sus traducciones (para admin)
   */
  async getAllBooksWithTranslations(): Promise<BookWithTranslations[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('v_books_with_translations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all books:', error);
      throw new Error(`Error al obtener libros: ${error.message}`);
    }

    return (data || []).map((book: Record<string, unknown>) => ({
      id: book.id as string,
      slug: book.slug as string,
      coverUrl: book.cover_url as string | null,
      difficulty: book.difficulty as BookWithTranslations['difficulty'],
      status: book.status as BookWithTranslations['status'],
      estimatedReadTime: book.estimated_read_time as number,
      pageCount: book.page_count as number,
      isFeatured: book.is_featured as boolean,
      isPremium: book.is_premium as boolean,
      publishedAt: book.published_at as string | null,
      createdAt: book.created_at as string,
      createdBy: book.created_by as string | null,
      categoryId: book.category_id as string,
      categorySlug: book.category_slug as string,
      categoryIcon: book.category_icon as string | null,
      categoryColor: book.category_color as string | null,
      translations: book.translations as Record<string, BookWithTranslations['translations'][string]> || {},
      categoryTranslations: book.category_translations as Record<string, BookWithTranslations['categoryTranslations'][string]> || {},
      authors: book.authors as BookWithTranslations['authors'] || []
    }));
  }
}

// Singleton instance
export const booksCatalogRepository = new BooksCatalogRepository();
