// ============================================
// src/core/domain/entities/BookGenre.ts
// Entity: BookGenre (Género literario)
// ============================================

export interface GenreTranslation {
  id: string;
  languageCode: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export class BookGenre {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly icon: string | null,
    public readonly color: string | null,
    public readonly orderIndex: number,
    public readonly isActive: boolean,
    public readonly translations: GenreTranslation[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {}

  static fromDatabase(data: any): BookGenre {
    return new BookGenre(
      data.id,
      data.slug,
      data.icon,
      data.color,
      data.order_index,
      data.is_active,
      (data.genre_translations || []).map((t: any) => ({
        id: t.id,
        languageCode: t.language_code,
        name: t.name,
        description: t.description,
        isActive: t.is_active,
      })),
      new Date(data.created_at),
      new Date(data.updated_at),
      data.deleted_at ? new Date(data.deleted_at) : null
    );
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  getTranslation(languageCode: string): GenreTranslation | undefined {
    return this.translations.find(t => t.languageCode === languageCode);
  }

  getName(languageCode: string, fallback = 'es'): string {
    const translation = this.getTranslation(languageCode);
    if (translation) return translation.name;
    const fallbackTranslation = this.getTranslation(fallback);
    if (fallbackTranslation) return fallbackTranslation.name;
    return this.translations[0]?.name || this.slug;
  }

  getDescription(languageCode: string, fallback = 'es'): string | null {
    const translation = this.getTranslation(languageCode);
    if (translation) return translation.description;
    const fallbackTranslation = this.getTranslation(fallback);
    return fallbackTranslation?.description || null;
  }
}
