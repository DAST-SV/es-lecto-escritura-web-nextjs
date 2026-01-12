// ============================================
// src/core/domain/entities/Translation.ts
// ✅ CORREGIDO: Con método getFullKey()
// ============================================

export interface TranslationData {
  id: string;
  translationKeyId: string;
  namespaceSlug: string;
  keyName: string;
  languageCode: string;
  value: string;
  isActive: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

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

  /**
   * ✅ NUEVO: Obtener la clave completa (namespace.key)
   */
  getFullKey(): string {
    return `${this.namespaceSlug}.${this.keyName}`;
  }

  static fromDatabase(data: any): Translation {
    return new Translation(
      data.id,
      data.translation_key_id,
      data.namespace_slug,
      data.key_name,  // ✅ CORRECCIÓN: key_name no translation_key
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

  toDatabase() {
    return {
      id: this.id,
      translation_key_id: this.translationKeyId,
      language_code: this.languageCode,
      value: this.value,
      is_active: this.isActive,
      is_verified: this.isVerified,
      verified_by: this.verifiedBy,
      verified_at: this.verifiedAt?.toISOString(),
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      created_by: this.createdBy,
      updated_by: this.updatedBy,
    };
  }
}