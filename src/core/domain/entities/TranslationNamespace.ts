// ============================================
// src/core/domain/entities/TranslationNamespace.ts
// Entity: Translation Namespace (namespace para organizar traducciones)
// ============================================

export class TranslationNamespace {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly translationCount?: number
  ) {}

  static fromDatabase(data: any): TranslationNamespace {
    return new TranslationNamespace(
      data.id,
      data.slug,
      data.name,
      data.description,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.translation_count
    );
  }
}
