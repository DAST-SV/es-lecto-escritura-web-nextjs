// ============================================
// src/core/domain/entities/TranslationNamespace.ts
// Entity: Translation Namespace (namespace para organizar traducciones)
// ============================================

export class TranslationNamespace {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly isActive: boolean,
    public readonly translationCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string | undefined,
    public readonly updatedBy: string | undefined
  ) {}

  static fromDatabase(data: any): TranslationNamespace {
    return new TranslationNamespace(
      data.id,
      data.slug,
      data.name,
      data.description,
      data.is_active ?? true,
      data.translation_count ?? 0,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.created_by,
      data.updated_by
    );
  }
}