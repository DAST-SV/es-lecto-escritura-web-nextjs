/**
 * ============================================
 * ENTIDAD: BookTranslation
 * Versión de un libro en un idioma específico
 * ============================================
 */

import { BookTranslationData } from '../types';

export class BookTranslation {
  constructor(
    public readonly id: string | null,
    public readonly bookId: string,
    public readonly languageCode: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly coverUrl: string | null,
    public readonly pdfUrl: string | null,
    public readonly isOriginal: boolean,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Crea una instancia desde datos de base de datos
   */
  static fromDatabase(data: Record<string, unknown>): BookTranslation {
    return new BookTranslation(
      data.id as string,
      data.book_id as string,
      data.language_code as string,
      data.title as string,
      (data.description as string) || null,
      (data.cover_url as string) || null,
      (data.pdf_url as string) || null,
      (data.is_original as boolean) ?? false,
      (data.is_active as boolean) ?? true,
      new Date(data.created_at as string),
      new Date(data.updated_at as string)
    );
  }

  /**
   * Convierte a objeto plano para UI
   */
  toData(): BookTranslationData {
    return {
      id: this.id ?? undefined,
      bookId: this.bookId,
      languageCode: this.languageCode,
      title: this.title,
      description: this.description ?? undefined,
      coverUrl: this.coverUrl ?? undefined,
      pdfUrl: this.pdfUrl ?? undefined,
      isOriginal: this.isOriginal,
      isActive: this.isActive,
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

    if (!this.languageCode || this.languageCode.length < 2) {
      errors.push('El código de idioma es requerido');
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push('El título es requerido');
    }

    if (this.title && this.title.length > 255) {
      errors.push('El título no puede exceder 255 caracteres');
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
   * Crea una copia con modificaciones
   */
  copyWith(changes: Partial<{
    title: string;
    description: string | null;
    coverUrl: string | null;
    pdfUrl: string | null;
    isOriginal: boolean;
    isActive: boolean;
  }>): BookTranslation {
    return new BookTranslation(
      this.id,
      this.bookId,
      this.languageCode,
      changes.title ?? this.title,
      changes.description !== undefined ? changes.description : this.description,
      changes.coverUrl !== undefined ? changes.coverUrl : this.coverUrl,
      changes.pdfUrl !== undefined ? changes.pdfUrl : this.pdfUrl,
      changes.isOriginal ?? this.isOriginal,
      changes.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }
}
