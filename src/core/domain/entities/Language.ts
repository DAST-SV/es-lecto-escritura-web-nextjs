// ============================================
// src/core/domain/entities/Language.ts
// Entidad: Idioma del sistema
// ============================================

export class Language {
  constructor(
    public readonly code: string, // 'es', 'en', 'fr'
    public readonly name: string,
    public readonly nativeName: string | null,
    public readonly flagEmoji: string | null,
    public readonly isDefault: boolean,
    public readonly isActive: boolean,
    public readonly orderIndex: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Factory: Crear desde base de datos
   */
  static fromDatabase(data: any): Language {
    return new Language(
      data.code,
      data.name,
      data.native_name,
      data.flag_emoji,
      data.is_default ?? false,
      data.is_active ?? true,
      data.order_index ?? 0,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  /**
   * Verificar si es idioma por defecto
   */
  isDefaultLanguage(): boolean {
    return this.isDefault;
  }

  /**
   * Verificar si está activo
   */
  isActiveLanguage(): boolean {
    return this.isActive;
  }
}