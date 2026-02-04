// ============================================
// src/core/domain/entities/BookAdmin.ts
// Entidad completa para gestión de libros (admin)
// ============================================

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type BookStatus = 'draft' | 'review' | 'published' | 'archived';

export interface BookAdminTranslation {
  id: string;
  bookId: string;
  languageCode: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  summary: string | null;
  keywords: string[] | null;
  pdfUrl: string | null;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookAuthorRelation {
  id: string;
  bookId: string;
  authorId: string;
  role: string;
  orderIndex: number;
  // Denormalized author data
  authorName?: string;
  authorSlug?: string;
  authorAvatarUrl?: string;
}

export interface BookGenreRelation {
  id: string;
  bookId: string;
  genreId: string;
  isPrimary: boolean;
  // Denormalized genre data
  genreName?: string;
  genreSlug?: string;
}

export interface BookTagRelation {
  id: string;
  bookId: string;
  tagId: string;
  // Denormalized tag data
  tagName?: string;
  tagSlug?: string;
  tagColor?: string;
}

export interface BookAdminData {
  id: string;
  slug: string;
  categoryId: string;
  levelId: string | null;
  coverUrl: string | null;
  difficulty: DifficultyLevel;
  status: BookStatus;
  estimatedReadTime: number;
  pageCount: number;
  viewCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  publishedAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Relations
  translations: BookAdminTranslation[];
  authors: BookAuthorRelation[];
  genres: BookGenreRelation[];
  tags: BookTagRelation[];
  // Denormalized category/level data
  categoryName?: string;
  categorySlug?: string;
  levelName?: string;
  levelSlug?: string;
}

export class BookAdmin {
  readonly id: string;
  readonly slug: string;
  readonly categoryId: string;
  readonly levelId: string | null;
  readonly coverUrl: string | null;
  readonly difficulty: DifficultyLevel;
  readonly status: BookStatus;
  readonly estimatedReadTime: number;
  readonly pageCount: number;
  readonly viewCount: number;
  readonly isFeatured: boolean;
  readonly isPremium: boolean;
  readonly publishedAt: Date | null;
  readonly createdBy: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly translations: BookAdminTranslation[];
  readonly authors: BookAuthorRelation[];
  readonly genres: BookGenreRelation[];
  readonly tags: BookTagRelation[];
  readonly categoryName?: string;
  readonly categorySlug?: string;
  readonly levelName?: string;
  readonly levelSlug?: string;

  constructor(data: BookAdminData) {
    this.id = data.id;
    this.slug = data.slug;
    this.categoryId = data.categoryId;
    this.levelId = data.levelId;
    this.coverUrl = data.coverUrl;
    this.difficulty = data.difficulty;
    this.status = data.status;
    this.estimatedReadTime = data.estimatedReadTime;
    this.pageCount = data.pageCount;
    this.viewCount = data.viewCount;
    this.isFeatured = data.isFeatured;
    this.isPremium = data.isPremium;
    this.publishedAt = data.publishedAt;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
    this.translations = data.translations;
    this.authors = data.authors;
    this.genres = data.genres;
    this.tags = data.tags;
    this.categoryName = data.categoryName;
    this.categorySlug = data.categorySlug;
    this.levelName = data.levelName;
    this.levelSlug = data.levelSlug;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  get isPublished(): boolean {
    return this.status === 'published';
  }

  get isDraft(): boolean {
    return this.status === 'draft';
  }

  getTitle(languageCode: string): string {
    const translation = this.translations.find(t => t.languageCode === languageCode);
    if (translation) return translation.title;
    const primary = this.translations.find(t => t.isPrimary);
    if (primary) return primary.title;
    return this.translations[0]?.title || this.slug;
  }

  getDescription(languageCode: string): string | null {
    const translation = this.translations.find(t => t.languageCode === languageCode);
    if (translation) return translation.description;
    const primary = this.translations.find(t => t.isPrimary);
    return primary?.description || null;
  }

  getSummary(languageCode: string): string | null {
    const translation = this.translations.find(t => t.languageCode === languageCode);
    if (translation) return translation.summary;
    const primary = this.translations.find(t => t.isPrimary);
    return primary?.summary || null;
  }

  getPdfUrl(languageCode: string): string | null {
    const translation = this.translations.find(t => t.languageCode === languageCode);
    return translation?.pdfUrl || null;
  }

  getTranslation(languageCode: string): BookAdminTranslation | undefined {
    return this.translations.find(t => t.languageCode === languageCode);
  }

  getPrimaryTranslation(): BookAdminTranslation | undefined {
    return this.translations.find(t => t.isPrimary);
  }

  getAuthorsDisplay(): string {
    return this.authors
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(a => a.authorName)
      .filter(Boolean)
      .join(', ') || 'Sin autor';
  }

  getPrimaryGenre(): BookGenreRelation | undefined {
    return this.genres.find(g => g.isPrimary) || this.genres[0];
  }

  static fromDatabase(row: any, translations: any[] = [], authors: any[] = [], genres: any[] = [], tags: any[] = []): BookAdmin {
    return new BookAdmin({
      id: row.id,
      slug: row.slug,
      categoryId: row.category_id,
      levelId: row.level_id,
      coverUrl: row.cover_url,
      difficulty: row.difficulty || 'beginner',
      status: row.status || 'draft',
      estimatedReadTime: row.estimated_read_time || 5,
      pageCount: row.page_count || 0,
      viewCount: row.view_count || 0,
      isFeatured: row.is_featured || false,
      isPremium: row.is_premium || false,
      publishedAt: row.published_at ? new Date(row.published_at) : null,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
      categoryName: row.category_name,
      categorySlug: row.category_slug,
      levelName: row.level_name,
      levelSlug: row.level_slug,
      translations: translations.map(t => ({
        id: t.id,
        bookId: t.book_id,
        languageCode: t.language_code,
        title: t.title,
        subtitle: t.subtitle,
        description: t.description,
        summary: t.summary,
        keywords: t.keywords,
        pdfUrl: t.pdf_url,
        isActive: t.is_active,
        isPrimary: t.is_primary,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
      })),
      authors: authors.map(a => ({
        id: a.id,
        bookId: a.book_id,
        authorId: a.author_id,
        role: a.role || 'author',
        orderIndex: a.order_index || 0,
        authorName: a.author_name,
        authorSlug: a.author_slug,
        authorAvatarUrl: a.author_avatar_url,
      })),
      genres: genres.map(g => ({
        id: g.id,
        bookId: g.book_id,
        genreId: g.genre_id,
        isPrimary: g.is_primary || false,
        genreName: g.genre_name,
        genreSlug: g.genre_slug,
      })),
      tags: tags.map(t => ({
        id: t.id,
        bookId: t.book_id,
        tagId: t.tag_id,
        tagName: t.tag_name,
        tagSlug: t.tag_slug,
        tagColor: t.tag_color,
      })),
    });
  }
}
