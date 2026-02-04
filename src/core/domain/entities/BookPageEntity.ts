// ============================================
// src/core/domain/entities/BookPageEntity.ts
// Entidad para páginas de libros
// ============================================

export interface PageTranslationData {
  id: string;
  pageId: string;
  languageCode: string;
  content: string;
  audioUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookPageData {
  id: string;
  bookId: string;
  pageNumber: number;
  imageUrl: string | null;
  audioUrl: string | null;
  hasInteraction: boolean;
  interactionType: string | null;
  interactionData: any | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  translations: PageTranslationData[];
  // Denormalized
  bookTitle?: string;
}

export class BookPageEntity {
  readonly id: string;
  readonly bookId: string;
  readonly pageNumber: number;
  readonly imageUrl: string | null;
  readonly audioUrl: string | null;
  readonly hasInteraction: boolean;
  readonly interactionType: string | null;
  readonly interactionData: any | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly translations: PageTranslationData[];
  readonly bookTitle?: string;

  constructor(data: BookPageData) {
    this.id = data.id;
    this.bookId = data.bookId;
    this.pageNumber = data.pageNumber;
    this.imageUrl = data.imageUrl;
    this.audioUrl = data.audioUrl;
    this.hasInteraction = data.hasInteraction;
    this.interactionType = data.interactionType;
    this.interactionData = data.interactionData;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.translations = data.translations;
    this.bookTitle = data.bookTitle;
  }

  getContent(languageCode: string): string {
    const trans = this.translations.find(t => t.languageCode === languageCode);
    return trans?.content || this.translations[0]?.content || '';
  }

  getAudioUrl(languageCode: string): string | null {
    const trans = this.translations.find(t => t.languageCode === languageCode);
    return trans?.audioUrl || this.audioUrl;
  }

  getTranslation(languageCode: string): PageTranslationData | undefined {
    return this.translations.find(t => t.languageCode === languageCode);
  }

  get interactionIcon(): string {
    switch (this.interactionType) {
      case 'quiz': return '❓';
      case 'drag_drop': return '🎯';
      case 'audio': return '🔊';
      case 'video': return '🎬';
      default: return '📖';
    }
  }

  static fromDatabase(row: any, translations: any[] = []): BookPageEntity {
    return new BookPageEntity({
      id: row.id,
      bookId: row.book_id,
      pageNumber: row.page_number,
      imageUrl: row.image_url,
      audioUrl: row.audio_url,
      hasInteraction: row.has_interaction || false,
      interactionType: row.interaction_type,
      interactionData: row.interaction_data,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      bookTitle: row.book_title,
      translations: translations.map(t => ({
        id: t.id,
        pageId: t.page_id,
        languageCode: t.language_code,
        content: t.content,
        audioUrl: t.audio_url,
        isActive: t.is_active,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
      })),
    });
  }
}
