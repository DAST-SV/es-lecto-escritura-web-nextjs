/**
 * ============================================
 * ENTIDAD: BookExtended
 * Libro con todas sus relaciones y metadatos
 * Para uso en páginas de detalle y exploración
 * ============================================
 */

import { AccessType, BookRatingStats } from '../types';
import { BookPage } from './BookPage';
import { BookTranslation } from './BookTranslation';
import { BookCollaborator } from './BookCollaborator';

export interface BookCategory {
  id: number;
  name: string;
  slug?: string;
  isPrimary: boolean;
}

export interface BookGenre {
  id: number;
  name: string;
}

export interface BookValue {
  id: number;
  name: string;
  isPrimary: boolean;
}

export interface BookTag {
  id: number;
  name: string;
  slug?: string;
  isPrimary: boolean;
}

export interface BookLevel {
  id: number;
  name: string;
  minAge?: number;
  maxAge?: number;
}

export interface BookLanguage {
  id: number;
  isoCode: string;
  name: string;
  isOriginal: boolean;
}

export interface BookCharacter {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isMain: boolean;
}

export interface BookAuthor {
  id: string;
  name: string;
  order: number;
}

export class BookExtended {
  constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public readonly typeId: number,
    public readonly typeName: string,
    public readonly levelId: number | null,
    public readonly title: string,
    public readonly description: string | null,
    public readonly coverUrl: string | null,
    public readonly pdfUrl: string | null,
    public readonly accessType: AccessType,
    public readonly freePagesCount: number,
    public readonly isPublished: boolean,
    public readonly isFeatured: boolean,
    public readonly viewCount: number,
    public readonly publishedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
    // Relaciones
    public readonly level: BookLevel | null,
    public readonly categories: BookCategory[],
    public readonly genres: BookGenre[],
    public readonly values: BookValue[],
    public readonly tags: BookTag[],
    public readonly languages: BookLanguage[],
    public readonly characters: BookCharacter[],
    public readonly authors: BookAuthor[],
    public readonly collaborators: BookCollaborator[],
    public readonly translations: BookTranslation[],
    public readonly pages: BookPage[],
    public readonly ratingStats: BookRatingStats | null
  ) {}

  /**
   * Crea una instancia desde datos de base de datos
   */
  static fromDatabase(
    data: Record<string, unknown>,
    relations: {
      level?: Record<string, unknown>;
      categories?: Record<string, unknown>[];
      genres?: Record<string, unknown>[];
      values?: Record<string, unknown>[];
      tags?: Record<string, unknown>[];
      languages?: Record<string, unknown>[];
      characters?: Record<string, unknown>[];
      authors?: Record<string, unknown>[];
      collaborators?: Record<string, unknown>[];
      translations?: Record<string, unknown>[];
      pages?: Record<string, unknown>[];
      ratingStats?: Record<string, unknown>;
    } = {}
  ): BookExtended {
    const level: BookLevel | null = relations.level ? {
      id: relations.level.id as number,
      name: relations.level.name as string,
      minAge: (relations.level.min_age as number) ?? undefined,
      maxAge: (relations.level.max_age as number) ?? undefined,
    } : null;

    const categories: BookCategory[] = (relations.categories || []).map(c => ({
      id: c.category_id as number || c.id as number,
      name: c.name as string,
      slug: (c.slug as string) ?? undefined,
      isPrimary: (c.is_primary as boolean) ?? false,
    }));

    const genres: BookGenre[] = (relations.genres || []).map(g => ({
      id: g.genre_id as number || g.id as number,
      name: g.name as string,
    }));

    const values: BookValue[] = (relations.values || []).map(v => ({
      id: v.value_id as number || v.id as number,
      name: v.name as string,
      isPrimary: (v.is_primary as boolean) ?? false,
    }));

    const tags: BookTag[] = (relations.tags || []).map(t => ({
      id: t.tag_id as number || t.id as number,
      name: t.name as string,
      slug: (t.slug as string) ?? undefined,
      isPrimary: (t.is_primary as boolean) ?? false,
    }));

    const languages: BookLanguage[] = (relations.languages || []).map(l => ({
      id: l.language_id as number || l.id as number,
      isoCode: l.iso_code as string,
      name: l.name as string,
      isOriginal: (l.is_original as boolean) ?? false,
    }));

    const characters: BookCharacter[] = (relations.characters || []).map(ch => ({
      id: ch.character_id as string || ch.id as string,
      name: ch.name as string,
      description: (ch.description as string) ?? undefined,
      imageUrl: (ch.image_url as string) ?? undefined,
      isMain: (ch.is_main as boolean) ?? false,
    }));

    const authors: BookAuthor[] = (relations.authors || []).map(a => ({
      id: a.author_id as string || a.id as string,
      name: a.name as string,
      order: (a.author_order as number) ?? 1,
    }));

    const collaborators = (relations.collaborators || []).map(c =>
      BookCollaborator.fromDatabase(c)
    );

    const translations = (relations.translations || []).map(t =>
      BookTranslation.fromDatabase(t)
    );

    const pages = (relations.pages || []).map(p =>
      BookPage.fromDatabase(p)
    ).sort((a, b) => a.pageNumber - b.pageNumber);

    const ratingStats: BookRatingStats | null = relations.ratingStats ? {
      totalRatings: (relations.ratingStats.total_ratings as number) ?? 0,
      averageRating: parseFloat(String(relations.ratingStats.average_rating ?? 0)),
      rating1Count: (relations.ratingStats.rating_1_count as number) ?? 0,
      rating2Count: (relations.ratingStats.rating_2_count as number) ?? 0,
      rating3Count: (relations.ratingStats.rating_3_count as number) ?? 0,
      rating4Count: (relations.ratingStats.rating_4_count as number) ?? 0,
      rating5Count: (relations.ratingStats.rating_5_count as number) ?? 0,
      totalReviews: (relations.ratingStats.total_reviews as number) ?? 0,
    } : null;

    return new BookExtended(
      data.id as string,
      (data.user_id as string) || null,
      data.type_id as number,
      (data.type_name as string) || 'user',
      (data.level_id as number) || null,
      data.title as string,
      (data.description as string) || null,
      (data.cover_url as string) || null,
      (data.pdf_url as string) || null,
      (data.access_type as AccessType) || 'public',
      (data.free_pages_count as number) ?? 5,
      (data.is_published as boolean) ?? false,
      (data.is_featured as boolean) ?? false,
      (data.view_count as number) ?? 0,
      data.published_at ? new Date(data.published_at as string) : null,
      new Date(data.created_at as string),
      new Date(data.updated_at as string),
      data.deleted_at ? new Date(data.deleted_at as string) : null,
      level,
      categories,
      genres,
      values,
      tags,
      languages,
      characters,
      authors,
      collaborators,
      translations,
      pages,
      ratingStats
    );
  }

  /**
   * Valida la entidad
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('El título es requerido');
    }

    if (this.title && this.title.length > 255) {
      errors.push('El título no puede exceder 255 caracteres');
    }

    if (!this.typeId) {
      errors.push('El tipo de libro es requerido');
    }

    return errors;
  }

  /**
   * Verifica si es válida
   */
  isValid(): boolean {
    return this.validate().length === 0;
  }

  /**
   * Verifica si el libro está activo (no eliminado y publicado)
   */
  isActive(): boolean {
    return this.isPublished && !this.deletedAt;
  }

  /**
   * Verifica si es un libro oficial
   */
  isOfficial(): boolean {
    return this.typeName === 'official';
  }

  /**
   * Obtiene el idioma original
   */
  getOriginalLanguage(): BookLanguage | null {
    return this.languages.find(l => l.isOriginal) || null;
  }

  /**
   * Obtiene la categoría principal
   */
  getPrimaryCategory(): BookCategory | null {
    return this.categories.find(c => c.isPrimary) || this.categories[0] || null;
  }

  /**
   * Obtiene el autor principal (primer colaborador autor primario)
   */
  getPrimaryAuthor(): BookCollaborator | BookAuthor | null {
    const primaryCollaborator = this.collaborators.find(c => c.isPrimary && c.role === 'author');
    if (primaryCollaborator) return primaryCollaborator;

    // Fallback a sistema de autores legacy
    return this.authors[0] || null;
  }

  /**
   * Obtiene todos los autores para mostrar
   */
  getAuthorsDisplay(): string {
    // Primero intentar con colaboradores
    const authorCollaborators = this.collaborators
      .filter(c => c.role === 'author' || c.role === 'co_author')
      .sort((a, b) => a.displayOrder - b.displayOrder);

    if (authorCollaborators.length > 0) {
      return authorCollaborators.map(c => c.getDisplayName()).join(', ');
    }

    // Fallback a sistema legacy
    return this.authors.map(a => a.name).join(', ') || 'Autor desconocido';
  }

  /**
   * Obtiene el número total de páginas
   */
  getPageCount(): number {
    return this.pages.length;
  }

  /**
   * Obtiene el rating formateado
   */
  getFormattedRating(): string {
    if (!this.ratingStats || this.ratingStats.totalRatings === 0) {
      return 'Sin valoraciones';
    }
    return `${this.ratingStats.averageRating.toFixed(1)} (${this.ratingStats.totalRatings})`;
  }

  /**
   * Obtiene la traducción para un idioma específico
   */
  getTranslation(languageCode: string): BookTranslation | null {
    return this.translations.find(t => t.languageCode === languageCode && t.isActive) || null;
  }

  /**
   * Obtiene el título localizado
   */
  getLocalizedTitle(languageCode: string): string {
    const translation = this.getTranslation(languageCode);
    return translation?.title || this.title;
  }

  /**
   * Obtiene la descripción localizada
   */
  getLocalizedDescription(languageCode: string): string | null {
    const translation = this.getTranslation(languageCode);
    return translation?.description || this.description;
  }

  /**
   * Verifica si tiene acceso premium
   */
  requiresPremium(): boolean {
    return this.accessType === 'premium' || this.accessType === 'community';
  }

  /**
   * Verifica si es freemium
   */
  isFreemium(): boolean {
    return this.accessType === 'freemium';
  }

  /**
   * Obtiene las páginas gratuitas (para freemium)
   */
  getFreePages(): BookPage[] {
    if (this.accessType === 'public') return this.pages;
    if (this.accessType === 'freemium') {
      return this.pages.slice(0, this.freePagesCount);
    }
    return [];
  }

  /**
   * Serializa la entidad a un objeto JSON plano
   * Útil para enviar a través de API routes
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      typeId: this.typeId,
      typeName: this.typeName,
      levelId: this.levelId,
      title: this.title,
      description: this.description,
      coverUrl: this.coverUrl,
      pdfUrl: this.pdfUrl,
      accessType: this.accessType,
      freePagesCount: this.freePagesCount,
      isPublished: this.isPublished,
      isFeatured: this.isFeatured,
      viewCount: this.viewCount,
      publishedAt: this.publishedAt?.toISOString() || null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt?.toISOString() || null,
      level: this.level,
      categories: this.categories,
      genres: this.genres,
      values: this.values,
      tags: this.tags,
      languages: this.languages,
      characters: this.characters,
      authors: this.authors,
      collaborators: this.collaborators.map(c => ({
        userId: c.userId,
        userName: c.userName,
        userAvatarUrl: c.userAvatarUrl,
        authorId: c.authorId,
        authorName: c.authorName,
        authorBio: c.authorBio,
        authorImageUrl: c.authorImageUrl,
        role: c.role,
        displayOrder: c.displayOrder,
        isPrimary: c.isPrimary,
        addedAt: c.addedAt.toISOString(),
      })),
      translations: this.translations.map(t => ({
        id: t.id,
        languageCode: t.languageCode,
        title: t.title,
        description: t.description,
        keywords: t.keywords,
        isActive: t.isActive,
        isPrimary: t.isPrimary,
      })),
      pages: this.pages.map(p => ({
        id: p.id,
        pageNumber: p.pageNumber,
        imageUrl: p.imageUrl,
        audioUrl: p.audioUrl,
        hasInteraction: p.hasInteraction,
        interactionType: p.interactionType,
        interactionData: p.interactionData,
      })),
      ratingStats: this.ratingStats,
    };
  }
}
