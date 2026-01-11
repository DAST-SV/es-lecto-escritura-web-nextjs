// ============================================
// src/core/domain/entities/Translation.ts
// Entidad: Traducción
// ============================================

export class Translation {
  constructor(
    public readonly id: string,
    public readonly namespaceSlug: string,
    public readonly translationKey: string,
    public readonly languageCode: string,
    public readonly value: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Factory: Crear desde base de datos
   */
  static fromDatabase(data: any): Translation {
    return new Translation(
      data.id,
      data.namespace_slug,
      data.translation_key,
      data.language_code,
      data.value,
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  /**
   * Obtener clave completa (namespace.key)
   */
  getFullKey(): string {
    return `${this.namespaceSlug}.${this.translationKey}`;
  }

  /**
   * Verificar si está activa
   */
  isActiveTranslation(): boolean {
    return this.isActive;
  }
}