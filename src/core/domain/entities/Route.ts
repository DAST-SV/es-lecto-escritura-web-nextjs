// ============================================
// src/core/domain/entities/Route.ts
// Entidad: Ruta del sistema
// ============================================

export interface RouteTranslation {
  languageCode: string; // 'es', 'en', 'fr'
  translatedPath: string;
  translatedName: string;
  translatedDescription: string | null;
}

export class Route {
  constructor(
    public readonly id: string,
    public readonly pathname: string,
    public readonly displayName: string,
    public readonly description: string | null,
    public readonly icon: string | null,
    public readonly isPublic: boolean,
    public readonly requiresPermissions: string[],
    public readonly requiresAllPermissions: boolean,
    public readonly showInMenu: boolean,
    public readonly menuOrder: number,
    public readonly parentRouteId: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
    public readonly translations: RouteTranslation[]
  ) {}

  /**
   * Factory: Crear desde base de datos
   */
  static fromDatabase(data: any): Route {
    return new Route(
      data.id,
      data.pathname,
      data.display_name,
      data.description,
      data.icon,
      data.is_public,
      data.requires_permissions || [],
      data.requires_all_permissions ?? true,
      data.show_in_menu ?? true,
      data.menu_order ?? 0,
      data.parent_route_id,
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.deleted_at ? new Date(data.deleted_at) : null,
      data.translations || []
    );
  }

  /**
   * Obtener traducción para un idioma
   */
  getTranslation(languageCode: string): RouteTranslation | undefined {
    return this.translations.find(t => t.languageCode === languageCode);
  }

  /**
   * Verificar si está eliminado
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Verificar si es ruta pública
   */
  isPublicRoute(): boolean {
    return this.isPublic;
  }
}