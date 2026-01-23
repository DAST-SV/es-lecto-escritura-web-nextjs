// src/core/domain/entities/Translation.ts

export class Translation {
  constructor(
    public readonly id: string,
    public readonly translationKeyId: string,
    public readonly namespaceSlug: string,
    public readonly keyName: string,
    public readonly languageCode: string,
    public readonly value: string,
    public readonly isActive: boolean,
    public readonly isVerified: boolean,
    public readonly verifiedBy: string | undefined,
    public readonly verifiedAt: Date | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string | undefined,
    public readonly updatedBy: string | undefined
  ) {}

  getFullKey(): string {
    return `${this.namespaceSlug}.${this.keyName}`;
  }

  static fromDatabase(data: any): Translation {
    return new Translation(
      data.id,
      data.translation_key_id,
      data.namespace_slug,
      data.key_name,
      data.language_code,
      data.value,
      data.is_active ?? true,
      data.is_verified ?? false,
      data.verified_by,
      data.verified_at ? new Date(data.verified_at) : undefined,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.created_by,
      data.updated_by
    );
  }
}