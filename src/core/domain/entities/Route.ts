// ============================================
// src/core/domain/entities/Route.ts
// ✅ SIN isPublic, requiresPermissions, showInMenu, etc
// ============================================

export interface RouteTranslation {
  languageCode: string;
  translatedPath: string;
  translatedName: string;
}

export class Route {
  constructor(
    public readonly id: string,
    public readonly pathname: string,
    public readonly displayName: string,
    public readonly description: string | undefined,
    public readonly isActive: boolean,
    public readonly translations: RouteTranslation[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | undefined
  ) {}

  getTranslation(languageCode: string): RouteTranslation | undefined {
    return this.translations.find(t => t.languageCode === languageCode);
  }

  getTranslatedPath(languageCode: string): string {
    const translation = this.getTranslation(languageCode);
    return translation?.translatedPath || this.pathname;
  }

  getTranslatedName(languageCode: string): string {
    const translation = this.getTranslation(languageCode);
    return translation?.translatedName || this.displayName;
  }

  static fromDatabase(data: any): Route {
    return new Route(
      data.id,
      data.pathname,
      data.display_name,
      data.description,
      data.is_active ?? true,
      data.translations ?? [],
      new Date(data.created_at),
      new Date(data.updated_at),
      data.deleted_at ? new Date(data.deleted_at) : undefined
    );
  }

  toDatabase() {
    return {
      id: this.id,
      pathname: this.pathname,
      display_name: this.displayName,
      description: this.description,
      is_active: this.isActive,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      deleted_at: this.deletedAt?.toISOString(),
    };
  }
}