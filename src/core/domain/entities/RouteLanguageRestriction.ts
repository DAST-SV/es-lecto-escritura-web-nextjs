// ============================================
// src/core/domain/entities/RouteLanguageRestriction.ts
// Entidad: Restricciones de idioma para rutas
// ============================================

export class RouteLanguageRestriction {
  constructor(
    public readonly id: string,
    public readonly routeId: string,
    public readonly languageCode: string,
    public readonly isExclusive: boolean,
    public readonly createdAt: Date
  ) {}

  /**
   * Verificar si la restricción es exclusiva
   * (solo usuarios con este idioma pueden acceder)
   */
  isExclusiveRestriction(): boolean {
    return this.isExclusive;
  }

  static fromDatabase(data: any): RouteLanguageRestriction {
    return new RouteLanguageRestriction(
      data.id,
      data.route_id,
      data.language_code,
      data.is_exclusive ?? true,
      new Date(data.created_at)
    );
  }

  toDatabase() {
    return {
      id: this.id,
      route_id: this.routeId,
      language_code: this.languageCode,
      is_exclusive: this.isExclusive,
      created_at: this.createdAt.toISOString(),
    };
  }

  static create(
    routeId: string,
    languageCode: string,
    isExclusive: boolean = true
  ): RouteLanguageRestriction {
    return new RouteLanguageRestriction(
      crypto.randomUUID(),
      routeId,
      languageCode,
      isExclusive,
      new Date()
    );
  }
}