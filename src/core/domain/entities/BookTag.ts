// ============================================
// src/core/domain/entities/BookTag.ts
// Entity: BookTag (Etiqueta de libros)
// ============================================

export interface TagTranslation {
  id: string;
  languageCode: string;
  name: string;
  isActive: boolean;
}

export class BookTag {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly color: string | null,
    public readonly isActive: boolean,
    public readonly translations: TagTranslation[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {}

  static fromDatabase(data: any): BookTag {
    return new BookTag(
      data.id,
      data.slug,
      data.color,
      data.is_active,
      (data.tag_translations || []).map((t: any) => ({
        id: t.id,
        languageCode: t.language_code,
        name: t.name,
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

  getTranslation(languageCode: string): TagTranslation | undefined {
    return this.translations.find(t => t.languageCode === languageCode);
  }

  getName(languageCode: string, fallback = 'es'): string {
    const translation = this.getTranslation(languageCode);
    if (translation) return translation.name;
    const fallbackTranslation = this.getTranslation(fallback);
    if (fallbackTranslation) return fallbackTranslation.name;
    return this.translations[0]?.name || this.slug;
  }
}
