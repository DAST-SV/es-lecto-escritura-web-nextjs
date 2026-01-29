/**
 * ============================================
 * ENTIDAD: BookPage
 * Página individual de un libro
 * ============================================
 */

import { Page, LayoutType, AccessType } from '../types';

export class BookPage {
  constructor(
    public readonly id: string | null,
    public readonly bookId: string,
    public readonly pageNumber: number,
    public readonly layout: LayoutType,
    public readonly animation: string | null,
    public readonly title: string | null,
    public readonly content: string | null,
    public readonly imageUrl: string | null,
    public readonly audioUrl: string | null,
    public readonly interactiveGame: string | null,
    public readonly items: Record<string, unknown>[] | null,
    public readonly backgroundUrl: string | null,
    public readonly backgroundColor: string | null,
    public readonly textColor: string | null,
    public readonly font: string | null,
    public readonly borderStyle: string | null,
    public readonly accessLevel: AccessType | null,
    public readonly createdAt: Date
  ) {}

  /**
   * Crea una instancia desde datos de base de datos
   */
  static fromDatabase(data: Record<string, unknown>): BookPage {
    return new BookPage(
      data.id as string,
      data.book_id as string,
      data.page_number as number,
      (data.layout as LayoutType) || 'TextCenterLayout',
      (data.animation as string) || null,
      (data.title as string) || null,
      (data.content as string) || null,
      (data.image_url as string) || null,
      (data.audio_url as string) || null,
      (data.interactive_game as string) || null,
      (data.items as Record<string, unknown>[]) || null,
      (data.background_url as string) || null,
      (data.background_color as string) || null,
      (data.text_color as string) || null,
      (data.font as string) || null,
      (data.border_style as string) || null,
      (data.access_level as AccessType) || null,
      new Date(data.created_at as string)
    );
  }

  /**
   * Convierte a tipo Page para UI (compatible con editor)
   */
  toPage(): Page {
    return {
      id: this.id || `page-${this.pageNumber}`,
      layout: this.layout,
      title: this.title || '',
      text: this.content || '',
      image: this.imageUrl,
      background: this.backgroundUrl || this.backgroundColor || 'blanco',
      animation: this.animation || undefined,
      audio: this.audioUrl || undefined,
      interactiveGame: this.interactiveGame || undefined,
      items: this.items?.map(i => JSON.stringify(i)) || undefined,
      border: this.borderStyle || undefined,
    };
  }

  /**
   * Crea desde tipo Page del editor
   */
  static fromPage(page: Page, bookId: string, pageNumber: number): BookPage {
    return new BookPage(
      page.id.startsWith('page-') ? null : page.id,
      bookId,
      pageNumber,
      page.layout,
      page.animation || null,
      page.title || null,
      page.text || null,
      page.image || null,
      page.audio || null,
      page.interactiveGame || null,
      page.items?.map(i => JSON.parse(i)) || null,
      page.background?.startsWith('http') ? page.background : null,
      page.background && !page.background.startsWith('http') ? page.background : null,
      null,
      null,
      page.border || null,
      null,
      new Date()
    );
  }

  /**
   * Valida la entidad
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.bookId) {
      errors.push('El ID del libro es requerido');
    }

    if (this.pageNumber < 1) {
      errors.push('El número de página debe ser al menos 1');
    }

    if (!this.layout) {
      errors.push('El layout es requerido');
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
   * Verifica si la página tiene contenido
   */
  hasContent(): boolean {
    return !!(this.title || this.content || this.imageUrl);
  }

  /**
   * Verifica si la página tiene audio
   */
  hasAudio(): boolean {
    return !!this.audioUrl;
  }

  /**
   * Verifica si la página es interactiva
   */
  isInteractive(): boolean {
    return !!this.interactiveGame;
  }
}
