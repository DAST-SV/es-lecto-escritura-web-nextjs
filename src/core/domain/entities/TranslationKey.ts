// ============================================
// PAQUETE 1: ENTIDADES (Domain Entities)
// ============================================

// ============================================
// src/core/domain/entities/TranslationKey.ts
// ============================================

export interface TranslationKeyData {
  id: string;
  namespaceSlug: string;
  keyName: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  context?: string;
  defaultValue?: string;
  isActive: boolean;
  isSystemKey: boolean;
  translationCount?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

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
    public readonly isActive: boolean,
    public readonly isSystemKey: boolean,
    public readonly translationCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string | undefined,
    public readonly updatedBy: string | undefined
  ) {}

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
      data.is_active ?? true,
      data.is_system_key ?? false,
      data.translation_count ?? 0,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.created_by,
      data.updated_by
    );
  }

  toDatabase() {
    return {
      id: this.id,
      namespace_slug: this.namespaceSlug,
      key_name: this.keyName,
      category_id: this.categoryId,
      description: this.description,
      context: this.context,
      default_value: this.defaultValue,
      is_active: this.isActive,
      is_system_key: this.isSystemKey,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      created_by: this.createdBy,
      updated_by: this.updatedBy,
    };
  }
}