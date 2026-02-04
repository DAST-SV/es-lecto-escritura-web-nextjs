// ============================================
// src/infrastructure/repositories/books-admin/BookAdminRepository.ts
// Implementación Supabase del repositorio de libros (admin)
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { BookAdmin } from '@/src/core/domain/entities/BookAdmin';
import {
  IBookAdminRepository,
  CreateBookAdminDTO,
  UpdateBookAdminDTO,
  CreateBookTranslationDTO,
  UpdateBookTranslationDTO,
  BookAuthorDTO,
  BookGenreDTO,
  BookTagDTO,
} from '@/src/core/domain/repositories/IBookAdminRepository';

export class BookAdminRepository implements IBookAdminRepository {
  private supabase = createClient();

  async findAll(includeDeleted = false): Promise<BookAdmin[]> {
    let query = this.supabase
      .schema('books')
      .from('books')
      .select('*');

    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data: books, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Error fetching books: ${error.message}`);
    if (!books || books.length === 0) return [];

    // Fetch all related data in parallel
    const bookIds = books.map(b => b.id);

    const [translationsRes, authorsRes, genresRes, tagsRes, categoriesRes, levelsRes] = await Promise.all([
      this.supabase.schema('books').from('book_translations').select('*').in('book_id', bookIds),
      this.supabase.schema('books').from('book_authors').select(`
        *,
        authors!inner(id, slug, avatar_url)
      `).in('book_id', bookIds),
      this.supabase.schema('books').from('book_genres').select(`
        *,
        genres!inner(id, slug)
      `).in('book_id', bookIds),
      this.supabase.schema('books').from('book_tags').select(`
        *,
        tags!inner(id, slug, color)
      `).in('book_id', bookIds),
      this.supabase.schema('books').from('categories').select('id, slug'),
      this.supabase.schema('books').from('levels').select('id, slug'),
    ]);

    // Fetch author translations for names
    const authorIds = [...new Set((authorsRes.data || []).map((a: any) => a.author_id))];
    const authorTransRes = authorIds.length > 0
      ? await this.supabase.schema('books').from('author_translations').select('*').in('author_id', authorIds)
      : { data: [] };

    // Fetch genre translations for names
    const genreIds = [...new Set((genresRes.data || []).map((g: any) => g.genre_id))];
    const genreTransRes = genreIds.length > 0
      ? await this.supabase.schema('books').from('genre_translations').select('*').in('genre_id', genreIds)
      : { data: [] };

    // Fetch tag translations for names
    const tagIds = [...new Set((tagsRes.data || []).map((t: any) => t.tag_id))];
    const tagTransRes = tagIds.length > 0
      ? await this.supabase.schema('books').from('tag_translations').select('*').in('tag_id', tagIds)
      : { data: [] };

    // Fetch category translations for names
    const categoryIds = [...new Set(books.map(b => b.category_id))];
    const categoryTransRes = categoryIds.length > 0
      ? await this.supabase.schema('books').from('category_translations').select('*').in('category_id', categoryIds)
      : { data: [] };

    // Fetch level translations for names
    const levelIds = [...new Set(books.filter(b => b.level_id).map(b => b.level_id))];
    const levelTransRes = levelIds.length > 0
      ? await this.supabase.schema('books').from('level_translations').select('*').in('level_id', levelIds)
      : { data: [] };

    // Build lookup maps
    const authorTransMap = new Map<string, string>();
    (authorTransRes.data || []).forEach((t: any) => {
      if (t.language_code === 'es' || !authorTransMap.has(t.author_id)) {
        authorTransMap.set(t.author_id, t.name);
      }
    });

    const genreTransMap = new Map<string, string>();
    (genreTransRes.data || []).forEach((t: any) => {
      if (t.language_code === 'es' || !genreTransMap.has(t.genre_id)) {
        genreTransMap.set(t.genre_id, t.name);
      }
    });

    const tagTransMap = new Map<string, string>();
    (tagTransRes.data || []).forEach((t: any) => {
      if (t.language_code === 'es' || !tagTransMap.has(t.tag_id)) {
        tagTransMap.set(t.tag_id, t.name);
      }
    });

    const categoryTransMap = new Map<string, string>();
    (categoryTransRes.data || []).forEach((t: any) => {
      if (t.language_code === 'es' || !categoryTransMap.has(t.category_id)) {
        categoryTransMap.set(t.category_id, t.name);
      }
    });

    const levelTransMap = new Map<string, string>();
    (levelTransRes.data || []).forEach((t: any) => {
      if (t.language_code === 'es' || !levelTransMap.has(t.level_id)) {
        levelTransMap.set(t.level_id, t.name);
      }
    });

    const categorySlugMap = new Map<string, string>();
    (categoriesRes.data || []).forEach((c: any) => categorySlugMap.set(c.id, c.slug));

    const levelSlugMap = new Map<string, string>();
    (levelsRes.data || []).forEach((l: any) => levelSlugMap.set(l.id, l.slug));

    return books.map(book => {
      const bookTranslations = (translationsRes.data || []).filter((t: any) => t.book_id === book.id);
      const bookAuthors = (authorsRes.data || [])
        .filter((a: any) => a.book_id === book.id)
        .map((a: any) => ({
          ...a,
          author_name: authorTransMap.get(a.author_id),
          author_slug: a.authors?.slug,
          author_avatar_url: a.authors?.avatar_url,
        }));
      const bookGenres = (genresRes.data || [])
        .filter((g: any) => g.book_id === book.id)
        .map((g: any) => ({
          ...g,
          genre_name: genreTransMap.get(g.genre_id),
          genre_slug: g.genres?.slug,
        }));
      const bookTags = (tagsRes.data || [])
        .filter((t: any) => t.book_id === book.id)
        .map((t: any) => ({
          ...t,
          tag_name: tagTransMap.get(t.tag_id),
          tag_slug: t.tags?.slug,
          tag_color: t.tags?.color,
        }));

      return BookAdmin.fromDatabase(
        {
          ...book,
          category_name: categoryTransMap.get(book.category_id),
          category_slug: categorySlugMap.get(book.category_id),
          level_name: book.level_id ? levelTransMap.get(book.level_id) : null,
          level_slug: book.level_id ? levelSlugMap.get(book.level_id) : null,
        },
        bookTranslations,
        bookAuthors,
        bookGenres,
        bookTags
      );
    });
  }

  async findById(id: string): Promise<BookAdmin | null> {
    const { data: book, error } = await this.supabase
      .schema('books')
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !book) return null;

    const [translationsRes, authorsRes, genresRes, tagsRes] = await Promise.all([
      this.supabase.schema('books').from('book_translations').select('*').eq('book_id', id),
      this.supabase.schema('books').from('book_authors').select(`
        *,
        authors!inner(id, slug, avatar_url)
      `).eq('book_id', id),
      this.supabase.schema('books').from('book_genres').select(`
        *,
        genres!inner(id, slug)
      `).eq('book_id', id),
      this.supabase.schema('books').from('book_tags').select(`
        *,
        tags!inner(id, slug, color)
      `).eq('book_id', id),
    ]);

    // Fetch translations for related entities
    const authorIds = (authorsRes.data || []).map((a: any) => a.author_id);
    const genreIds = (genresRes.data || []).map((g: any) => g.genre_id);
    const tagIds = (tagsRes.data || []).map((t: any) => t.tag_id);

    const [authorTransRes, genreTransRes, tagTransRes, categoryTransRes, levelTransRes, categoryRes, levelRes] = await Promise.all([
      authorIds.length > 0
        ? this.supabase.schema('books').from('author_translations').select('*').in('author_id', authorIds)
        : Promise.resolve({ data: [] }),
      genreIds.length > 0
        ? this.supabase.schema('books').from('genre_translations').select('*').in('genre_id', genreIds)
        : Promise.resolve({ data: [] }),
      tagIds.length > 0
        ? this.supabase.schema('books').from('tag_translations').select('*').in('tag_id', tagIds)
        : Promise.resolve({ data: [] }),
      this.supabase.schema('books').from('category_translations').select('*').eq('category_id', book.category_id),
      book.level_id
        ? this.supabase.schema('books').from('level_translations').select('*').eq('level_id', book.level_id)
        : Promise.resolve({ data: [] }),
      this.supabase.schema('books').from('categories').select('slug').eq('id', book.category_id).single(),
      book.level_id
        ? this.supabase.schema('books').from('levels').select('slug').eq('id', book.level_id).single()
        : Promise.resolve({ data: null }),
    ]);

    // Build translation maps
    const getTranslatedName = (translations: any[], idKey: string, targetId: string) => {
      const trans = translations.filter((t: any) => t[idKey] === targetId);
      const es = trans.find((t: any) => t.language_code === 'es');
      return es?.name || trans[0]?.name;
    };

    const bookAuthors = (authorsRes.data || []).map((a: any) => ({
      ...a,
      author_name: getTranslatedName(authorTransRes.data || [], 'author_id', a.author_id),
      author_slug: a.authors?.slug,
      author_avatar_url: a.authors?.avatar_url,
    }));

    const bookGenres = (genresRes.data || []).map((g: any) => ({
      ...g,
      genre_name: getTranslatedName(genreTransRes.data || [], 'genre_id', g.genre_id),
      genre_slug: g.genres?.slug,
    }));

    const bookTags = (tagsRes.data || []).map((t: any) => ({
      ...t,
      tag_name: getTranslatedName(tagTransRes.data || [], 'tag_id', t.tag_id),
      tag_slug: t.tags?.slug,
      tag_color: t.tags?.color,
    }));

    const categoryName = ((categoryTransRes.data || []) as any[]).find((t: any) => t.language_code === 'es')?.name
      || ((categoryTransRes.data || []) as any[])[0]?.name;
    const levelName = book.level_id
      ? ((levelTransRes.data || []) as any[]).find((t: any) => t.language_code === 'es')?.name
        || ((levelTransRes.data || []) as any[])[0]?.name
      : null;

    return BookAdmin.fromDatabase(
      {
        ...book,
        category_name: categoryName,
        category_slug: categoryRes.data?.slug,
        level_name: levelName,
        level_slug: levelRes.data?.slug,
      },
      translationsRes.data || [],
      bookAuthors,
      bookGenres,
      bookTags
    );
  }

  async findBySlug(slug: string): Promise<BookAdmin | null> {
    const { data, error } = await this.supabase
      .schema('books')
      .from('books')
      .select('id')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return this.findById(data.id);
  }

  async create(data: CreateBookAdminDTO): Promise<BookAdmin> {
    // 1. Insert book
    const { data: book, error } = await this.supabase
      .schema('books')
      .from('books')
      .insert({
        slug: data.slug,
        category_id: data.categoryId,
        level_id: data.levelId || null,
        cover_url: data.coverUrl || null,
        difficulty: data.difficulty || 'beginner',
        status: data.status || 'draft',
        estimated_read_time: data.estimatedReadTime || 5,
        page_count: data.pageCount || 0,
        is_featured: data.isFeatured || false,
        is_premium: data.isPremium || false,
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating book: ${error.message}`);

    // 2. Insert translations
    if (data.translations.length > 0) {
      const { error: transError } = await this.supabase
        .schema('books')
        .from('book_translations')
        .insert(
          data.translations.map((t, idx) => ({
            book_id: book.id,
            language_code: t.languageCode,
            title: t.title,
            subtitle: t.subtitle || null,
            description: t.description || null,
            summary: t.summary || null,
            keywords: t.keywords || null,
            pdf_url: t.pdfUrl || null,
            is_active: t.isActive !== false,
            is_primary: t.isPrimary || idx === 0,
          }))
        );
      if (transError) throw new Error(`Error creating translations: ${transError.message}`);
    }

    // 3. Insert authors
    if (data.authors && data.authors.length > 0) {
      await this.setAuthors(book.id, data.authors);
    }

    // 4. Insert genres
    if (data.genres && data.genres.length > 0) {
      await this.setGenres(book.id, data.genres);
    }

    // 5. Insert tags
    if (data.tags && data.tags.length > 0) {
      await this.setTags(book.id, data.tags);
    }

    return (await this.findById(book.id))!;
  }

  async update(id: string, data: UpdateBookAdminDTO): Promise<BookAdmin> {
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
    if (data.levelId !== undefined) updateData.level_id = data.levelId;
    if (data.coverUrl !== undefined) updateData.cover_url = data.coverUrl;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.estimatedReadTime !== undefined) updateData.estimated_read_time = data.estimatedReadTime;
    if (data.pageCount !== undefined) updateData.page_count = data.pageCount;
    if (data.isFeatured !== undefined) updateData.is_featured = data.isFeatured;
    if (data.isPremium !== undefined) updateData.is_premium = data.isPremium;

    const { error } = await this.supabase
      .schema('books')
      .from('books')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error(`Error updating book: ${error.message}`);

    // Update translations if provided
    if (data.translations) {
      // Delete existing and insert new
      await this.supabase.schema('books').from('book_translations').delete().eq('book_id', id);
      if (data.translations.length > 0) {
        const { error: transError } = await this.supabase
          .schema('books')
          .from('book_translations')
          .insert(
            data.translations.map((t, idx) => ({
              book_id: id,
              language_code: t.languageCode,
              title: t.title,
              subtitle: t.subtitle || null,
              description: t.description || null,
              summary: t.summary || null,
              keywords: t.keywords || null,
              pdf_url: t.pdfUrl || null,
              is_active: t.isActive !== false,
              is_primary: t.isPrimary || idx === 0,
            }))
          );
        if (transError) throw new Error(`Error updating translations: ${transError.message}`);
      }
    }

    // Update relations if provided
    if (data.authors !== undefined) await this.setAuthors(id, data.authors);
    if (data.genres !== undefined) await this.setGenres(id, data.genres);
    if (data.tags !== undefined) await this.setTags(id, data.tags);

    return (await this.findById(id))!;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('books')
      .from('books')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Error soft deleting book: ${error.message}`);
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('books')
      .from('books')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw new Error(`Error restoring book: ${error.message}`);
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('books')
      .from('books')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error deleting book: ${error.message}`);
  }

  async publish(id: string): Promise<BookAdmin> {
    const { error } = await this.supabase
      .schema('books')
      .from('books')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(`Error publishing book: ${error.message}`);
    return (await this.findById(id))!;
  }

  async unpublish(id: string): Promise<BookAdmin> {
    const { error } = await this.supabase
      .schema('books')
      .from('books')
      .update({
        status: 'draft',
        published_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(`Error unpublishing book: ${error.message}`);
    return (await this.findById(id))!;
  }

  async addTranslation(bookId: string, data: CreateBookTranslationDTO): Promise<void> {
    const { error } = await this.supabase
      .schema('books')
      .from('book_translations')
      .insert({
        book_id: bookId,
        language_code: data.languageCode,
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description || null,
        summary: data.summary || null,
        keywords: data.keywords || null,
        pdf_url: data.pdfUrl || null,
        is_active: data.isActive !== false,
        is_primary: data.isPrimary || false,
      });

    if (error) throw new Error(`Error adding translation: ${error.message}`);
  }

  async updateTranslation(bookId: string, languageCode: string, data: UpdateBookTranslationDTO): Promise<void> {
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.keywords !== undefined) updateData.keywords = data.keywords;
    if (data.pdfUrl !== undefined) updateData.pdf_url = data.pdfUrl;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.isPrimary !== undefined) updateData.is_primary = data.isPrimary;

    const { error } = await this.supabase
      .schema('books')
      .from('book_translations')
      .update(updateData)
      .eq('book_id', bookId)
      .eq('language_code', languageCode);

    if (error) throw new Error(`Error updating translation: ${error.message}`);
  }

  async deleteTranslation(bookId: string, languageCode: string): Promise<void> {
    const { error } = await this.supabase
      .schema('books')
      .from('book_translations')
      .delete()
      .eq('book_id', bookId)
      .eq('language_code', languageCode);

    if (error) throw new Error(`Error deleting translation: ${error.message}`);
  }

  async setAuthors(bookId: string, authors: BookAuthorDTO[]): Promise<void> {
    // Delete existing
    await this.supabase.schema('books').from('book_authors').delete().eq('book_id', bookId);

    // Insert new
    if (authors.length > 0) {
      const { error } = await this.supabase
        .schema('books')
        .from('book_authors')
        .insert(
          authors.map((a, idx) => ({
            book_id: bookId,
            author_id: a.authorId,
            role: a.role || 'author',
            order_index: a.orderIndex ?? idx,
          }))
        );
      if (error) throw new Error(`Error setting authors: ${error.message}`);
    }
  }

  async setGenres(bookId: string, genres: BookGenreDTO[]): Promise<void> {
    // Delete existing
    await this.supabase.schema('books').from('book_genres').delete().eq('book_id', bookId);

    // Insert new
    if (genres.length > 0) {
      const { error } = await this.supabase
        .schema('books')
        .from('book_genres')
        .insert(
          genres.map((g, idx) => ({
            book_id: bookId,
            genre_id: g.genreId,
            is_primary: g.isPrimary ?? idx === 0,
          }))
        );
      if (error) throw new Error(`Error setting genres: ${error.message}`);
    }
  }

  async setTags(bookId: string, tags: BookTagDTO[]): Promise<void> {
    // Delete existing
    await this.supabase.schema('books').from('book_tags').delete().eq('book_id', bookId);

    // Insert new
    if (tags.length > 0) {
      const { error } = await this.supabase
        .schema('books')
        .from('book_tags')
        .insert(
          tags.map(t => ({
            book_id: bookId,
            tag_id: t.tagId,
          }))
        );
      if (error) throw new Error(`Error setting tags: ${error.message}`);
    }
  }
}
