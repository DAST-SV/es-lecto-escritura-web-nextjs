// src/core/domain/entities/TranslationCategory.ts

export class TranslationCategory {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly slug: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string | undefined,
    public readonly updatedBy: string | undefined
  ) {}

  static fromDatabase(data: any): TranslationCategory {
    return new TranslationCategory(
      data.id,
      data.name,
      data.description,
      data.slug,
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.created_by,
      data.updated_by
    );
  }
}