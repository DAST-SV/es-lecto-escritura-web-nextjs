// ============================================
// src/core/domain/entities/Language.ts
// Entity: Language (idioma del sistema)
// ============================================

export class Language {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly nativeName: string | null,
    public readonly flagEmoji: string | null,
    public readonly isDefault: boolean,
    public readonly isActive: boolean,
    public readonly orderIndex: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromDatabase(data: any): Language {
    return new Language(
      data.code,
      data.name,
      data.native_name,
      data.flag_emoji,
      data.is_default,
      data.is_active,
      data.order_index,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  get displayName(): string {
    return this.nativeName || this.name;
  }

  get displayWithFlag(): string {
    if (this.flagEmoji) {
      return `${this.flagEmoji} ${this.displayName}`;
    }
    return this.displayName;
  }
}