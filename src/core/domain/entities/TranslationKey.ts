// src/core/domain/entities/TranslationKey.ts

export class TranslationKey {
  constructor(
    public readonly id: string,
    public readonly namespaceSlug: string,
    public readonly keyName: string,
    public readonly categoryId: string | undefined,
    public readonly categoryName: string | undefined,
    public readonly description: string | undefined,
    public readonly context: string | undefined,
    public readonly defaultValue: string | undefined,
    public readonly isSystemKey: boolean,
    public readonly isActive: boolean,
    public readonly translationCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string | undefined,
    public readonly updatedBy: string | undefined
  ) {}

  getFullKey(): string {
    return `${this.namespaceSlug}.${this.keyName}`;
  }

  static fromDatabase(data: any): TranslationKey {
    return new TranslationKey(
      data.id,
      data.namespace_slug,
      data.key_name,
      data.category_id,
      data.category_name,
      data.description,
      data.context,
      data.default_value,
      data.is_system_key ?? false,
      data.is_active ?? true,
      data.translation_count ?? 0,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.created_by,
      data.updated_by
    );
  }
}