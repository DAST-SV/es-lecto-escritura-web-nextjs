/**
 * ============================================
 * ENTIDADES: BookRating y BookReview
 * Sistema de valoraciones y reseñas de libros
 * ============================================
 */

import { BookRatingData, BookReviewData, BookRatingStats } from '../types';

export class BookRating {
  constructor(
    public readonly id: string,
    public readonly bookId: string,
    public readonly userId: string,
    public readonly rating: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Crea una instancia desde datos de base de datos
   */
  static fromDatabase(data: Record<string, unknown>): BookRating {
    return new BookRating(
      data.id as string,
      data.book_id as string,
      data.user_id as string,
      data.rating as number,
      new Date(data.created_at as string),
      new Date(data.updated_at as string)
    );
  }

  /**
   * Convierte a objeto plano para UI
   */
  toData(): BookRatingData {
    return {
      id: this.id,
      bookId: this.bookId,
      userId: this.userId,
      rating: this.rating,
      createdAt: this.createdAt,
    };
  }

  /**
   * Valida la entidad
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.bookId) {
      errors.push('El ID del libro es requerido');
    }

    if (!this.userId) {
      errors.push('El ID del usuario es requerido');
    }

    if (this.rating < 1 || this.rating > 5) {
      errors.push('La valoración debe estar entre 1 y 5');
    }

    if (!Number.isInteger(this.rating)) {
      errors.push('La valoración debe ser un número entero');
    }

    return errors;
  }

  /**
   * Verifica si es válida
   */
  isValid(): boolean {
    return this.validate().length === 0;
  }
}

export class BookReview {
  constructor(
    public readonly id: string,
    public readonly bookId: string,
    public readonly userId: string,
    public readonly title: string | null,
    public readonly content: string,
    public readonly isApproved: boolean,
    public readonly isFeatured: boolean,
    public readonly isHidden: boolean,
    public readonly helpfulCount: number,
    public readonly reportedCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
    // Datos del usuario para display
    public readonly userName: string | null = null,
    public readonly userAvatarUrl: string | null = null,
    public readonly userRating: number | null = null
  ) {}

  /**
   * Crea una instancia desde datos de base de datos
   */
  static fromDatabase(data: Record<string, unknown>): BookReview {
    return new BookReview(
      data.id as string,
      data.book_id as string,
      data.user_id as string,
      (data.title as string) || null,
      data.content as string,
      (data.is_approved as boolean) ?? false,
      (data.is_featured as boolean) ?? false,
      (data.is_hidden as boolean) ?? false,
      (data.helpful_count as number) ?? 0,
      (data.reported_count as number) ?? 0,
      new Date(data.created_at as string),
      new Date(data.updated_at as string),
      data.deleted_at ? new Date(data.deleted_at as string) : null,
      (data.user_name as string) || null,
      (data.user_avatar as string) || (data.user_avatar_url as string) || null,
      (data.rating as number) || null
    );
  }

  /**
   * Convierte a objeto plano para UI
   */
  toData(): BookReviewData {
    return {
      id: this.id,
      bookId: this.bookId,
      userId: this.userId,
      title: this.title ?? undefined,
      content: this.content,
      isApproved: this.isApproved,
      isFeatured: this.isFeatured,
      helpfulCount: this.helpfulCount,
      createdAt: this.createdAt,
      userName: this.userName ?? undefined,
      userAvatarUrl: this.userAvatarUrl ?? undefined,
      userRating: this.userRating ?? undefined,
    };
  }

  /**
   * Valida la entidad
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.bookId) {
      errors.push('El ID del libro es requerido');
    }

    if (!this.userId) {
      errors.push('El ID del usuario es requerido');
    }

    if (!this.content || this.content.trim().length === 0) {
      errors.push('El contenido de la reseña es requerido');
    }

    if (this.content && this.content.length < 10) {
      errors.push('La reseña debe tener al menos 10 caracteres');
    }

    if (this.content && this.content.length > 5000) {
      errors.push('La reseña no puede exceder 5000 caracteres');
    }

    if (this.title && this.title.length > 200) {
      errors.push('El título no puede exceder 200 caracteres');
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
   * Verifica si está visible públicamente
   */
  isPubliclyVisible(): boolean {
    return this.isApproved && !this.isHidden && !this.deletedAt;
  }

  /**
   * Obtiene el nombre para mostrar
   */
  getDisplayName(): string {
    return this.userName || 'Usuario anónimo';
  }
}

/**
 * Clase para estadísticas de ratings de un libro
 */
export class BookRatingStatsEntity {
  constructor(
    public readonly bookId: string,
    public readonly totalRatings: number,
    public readonly averageRating: number,
    public readonly rating1Count: number,
    public readonly rating2Count: number,
    public readonly rating3Count: number,
    public readonly rating4Count: number,
    public readonly rating5Count: number,
    public readonly totalReviews: number
  ) {}

  static fromDatabase(data: Record<string, unknown>): BookRatingStatsEntity {
    return new BookRatingStatsEntity(
      data.book_id as string,
      (data.total_ratings as number) ?? 0,
      parseFloat(String(data.average_rating ?? 0)),
      (data.rating_1_count as number) ?? 0,
      (data.rating_2_count as number) ?? 0,
      (data.rating_3_count as number) ?? 0,
      (data.rating_4_count as number) ?? 0,
      (data.rating_5_count as number) ?? 0,
      (data.total_reviews as number) ?? 0
    );
  }

  toData(): BookRatingStats {
    return {
      totalRatings: this.totalRatings,
      averageRating: this.averageRating,
      rating1Count: this.rating1Count,
      rating2Count: this.rating2Count,
      rating3Count: this.rating3Count,
      rating4Count: this.rating4Count,
      rating5Count: this.rating5Count,
      totalReviews: this.totalReviews,
    };
  }

  /**
   * Obtiene el porcentaje de cada rating
   */
  getRatingPercentages(): Record<number, number> {
    if (this.totalRatings === 0) {
      return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }

    return {
      1: (this.rating1Count / this.totalRatings) * 100,
      2: (this.rating2Count / this.totalRatings) * 100,
      3: (this.rating3Count / this.totalRatings) * 100,
      4: (this.rating4Count / this.totalRatings) * 100,
      5: (this.rating5Count / this.totalRatings) * 100,
    };
  }

  /**
   * Obtiene el rating formateado para mostrar
   */
  getFormattedRating(): string {
    return this.averageRating.toFixed(1);
  }
}
