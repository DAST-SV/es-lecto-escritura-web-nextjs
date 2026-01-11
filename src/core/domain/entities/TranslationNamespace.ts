// ============================================
// src/core/domain/entities/TranslationNamespace.ts
// Entidad: Namespace de traducciones
// ============================================

export class TranslationNamespace {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Factory: Crear desde base de datos
   */
  static fromDatabase(data: any): TranslationNamespace {
    return new TranslationNamespace(
      data.id,
      data.slug,
      data.name,
      data.description,
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  /**
   * Verificar si está activo
   */
  isActiveNamespace(): boolean {
    return this.isActive;
  }
}