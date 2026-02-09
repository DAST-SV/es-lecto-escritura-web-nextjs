// src/infrastructure/repositories/books/BookLibraryRepository.ts
/**
 * ============================================
 * REPOSITORIO: BookLibraryRepository
 * Queries optimizadas para la pagina de Biblioteca
 * Carouseles estilo Netflix con datos por categoria
 * Usa vistas del schema books con traducciones por idioma
 * ============================================
 */

import { createClient } from '@/src/infrastructure/config/supabase.config';

// ============================================
// TIPOS
// ============================================

export interface LibraryBook {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverUrl: string | null;
  difficulty: string;
  estimatedReadTime: number;
  pageCount: number;
  viewCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  publishedAt: string | null;
  createdAt: string;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  authors: Array<{ name: string; avatarUrl?: string }>;
}

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
// HELPER: mapear libro desde v_books_with_translations
// ============================================

function mapBookFromView(book: Record<string, any>, locale: string): LibraryBook {
  const translations = book.translations as Record<string, any> || {};
  const trans = translations[locale] || translations['es'] || Object.values(translations)[0] || {};

  const categoryTranslations = book.category_translations as Record<string, any> || {};
  const catTrans = categoryTranslations[locale] || categoryTranslations['es'] || Object.values(categoryTranslations)[0];

  const rawAuthors = book.authors as any[] || [];
  const authors = rawAuthors.map((a: any) => {
    const authorTrans = a.translations as Record<string, any> || {};
    const at = authorTrans[locale] || authorTrans['es'] || Object.values(authorTrans)[0] || {};
    return { name: at.name || 'Autor', avatarUrl: a.avatar_url };
  });

  return {
    id: book.id,
    slug: book.slug,
    title: trans.title || book.slug,
    subtitle: trans.subtitle || null,
    description: trans.description || trans.summary || null,
    coverUrl: trans.cover_url || book.cover_url || null,
    difficulty: book.difficulty || 'beginner',
    estimatedReadTime: book.estimated_read_time || 5,
    pageCount: book.page_count || 0,
    viewCount: book.view_count || 0,
    isFeatured: book.is_featured || false,
    isPremium: book.is_premium || false,
    publishedAt: book.published_at,
    createdAt: book.created_at,
    categoryId: book.category_id || null,
    categorySlug: book.category_slug || null,
    categoryName: catTrans?.name || book.category_slug || null,
    categoryIcon: book.category_icon || null,
    categoryColor: book.category_color || null,
    authors,
  };
}

function mapCategoryFromView(cat: Record<string, any>, locale: string): CategoryWithBooks {
  const translations = cat.translations as Record<string, any> || {};
  const trans = translations[locale] || translations['es'] || Object.values(translations)[0] || {};

  return {
    id: cat.id,
    slug: cat.slug,
    name: trans.name || cat.slug,
    description: trans.description || null,
    icon: cat.icon || null,
    color: cat.color || null,
    bookCount: Number(cat.published_book_count) || 0,
  };
}

// ============================================
// REPOSITORIO
// ============================================

export class BookLibraryRepository {

  static async getTopBooks(locale: string = 'es', limit: number = 10): Promise<LibraryBook[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) { console.error('Error en getTopBooks:', error.message, error.code, error.details, error.hint); return []; }
    return (data || []).map((b: any) => mapBookFromView(b, locale));
  }

  static async getNewBooks(locale: string = 'es', limit: number = 15): Promise<LibraryBook[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) { console.error('Error en getNewBooks:', error.message, error.code, error.details, error.hint); return []; }
    return (data || []).map((b: any) => mapBookFromView(b, locale));
  }

  static async getFeaturedBooks(locale: string = 'es', limit: number = 10): Promise<LibraryBook[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) { console.error('Error en getFeaturedBooks:', error.message, error.code, error.details, error.hint); return []; }
    return (data || []).map((b: any) => mapBookFromView(b, locale));
  }

  static async getTopRated(locale: string = 'es', limit: number = 15): Promise<LibraryBook[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) { console.error('Error en getTopRated:', error.message, error.code, error.details, error.hint); return []; }
    return (data || []).map((b: any) => mapBookFromView(b, locale));
  }

  static async getBooksByCategory(categoryId: string, locale: string = 'es', limit: number = 15): Promise<LibraryBook[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) { console.error('Error en getBooksByCategory:', error.message, error.code, error.details, error.hint); return []; }
    return (data || []).map((b: any) => mapBookFromView(b, locale));
  }

  static async getCategoriesWithBooks(locale: string = 'es'): Promise<CategoryWithBooks[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .schema('books')
      .from('v_categories_with_translations')
      .select('*')
      .eq('is_active', true)
      .gt('published_book_count', 0)
      .order('order_index');

    if (error) { console.error('Error en getCategoriesWithBooks:', error.message, error.code, error.details, error.hint); return []; }
    return (data || []).map((c: any) => mapCategoryFromView(c, locale));
  }

  static async searchBooks(term: string, locale: string = 'es', limit: number = 30): Promise<LibraryBook[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .schema('books')
      .from('v_books_with_translations')
      .select('*')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(limit * 2);

    if (error) { console.error('Error en searchBooks:', error.message, error.code, error.details, error.hint); return []; }

    const searchLower = term.toLowerCase();
    const filtered = (data || []).filter((book: any) => {
      if (book.slug?.toLowerCase().includes(searchLower)) return true;
      const translations = book.translations as Record<string, any> || {};
      for (const lang of Object.values(translations)) {
        const t = lang as any;
        if (t.title?.toLowerCase().includes(searchLower)) return true;
        if (t.description?.toLowerCase().includes(searchLower)) return true;
      }
      return false;
    });

    return filtered.slice(0, limit).map((b: any) => mapBookFromView(b, locale));
  }
}

export default BookLibraryRepository;
