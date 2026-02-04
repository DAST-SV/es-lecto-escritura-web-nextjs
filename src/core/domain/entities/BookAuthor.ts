// ============================================
// src/core/domain/entities/BookAuthor.ts
// Entity: BookAuthor (Autor de libros)
// ============================================

export interface AuthorTranslation {
  id: string;
  languageCode: string;
  name: string;
  bio: string | null;
  isActive: boolean;
}

export class BookAuthor {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly avatarUrl: string | null,
    public readonly websiteUrl: string | null,
    public readonly isActive: boolean,
    public readonly translations: AuthorTranslation[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {}

  static fromDatabase(data: any): BookAuthor {
    return new BookAuthor(
      data.id,
      data.slug,
      data.avatar_url,
      data.website_url,
      data.is_active,
      (data.author_translations || []).map((t: any) => ({
        id: t.id,
        languageCode: t.language_code,
        name: t.name,
        bio: t.bio,
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

  getTranslation(languageCode: string): AuthorTranslation | undefined {
    return this.translations.find(t => t.languageCode === languageCode);
  }

  getName(languageCode: string, fallback = 'es'): string {
    const translation = this.getTranslation(languageCode);
    if (translation) return translation.name;
    const fallbackTranslation = this.getTranslation(fallback);
    if (fallbackTranslation) return fallbackTranslation.name;
    return this.translations[0]?.name || this.slug;
  }

  getBio(languageCode: string, fallback = 'es'): string | null {
    const translation = this.getTranslation(languageCode);
    if (translation) return translation.bio;
    const fallbackTranslation = this.getTranslation(fallback);
    return fallbackTranslation?.bio || null;
  }
}
