// ============================================
// src/core/domain/entities/Route.ts
// ✅ CORREGIDO: Con métodos getTranslation, getTranslatedPath, getTranslatedName
// ============================================

export interface RouteTranslation {
  languageCode: string;
  translatedPath: string;
  translatedName: string;
  translatedDescription?: string;
}

export interface RouteData {
  id: string;
  pathname: string;
  displayName: string;
  description?: string;
  icon?: string;
  isPublic: boolean;
  requiresPermissions: string[];
  requiresAllPermissions: boolean;
  showInMenu: boolean;
  menuOrder: number;
  parentRouteId?: string;
  isActive: boolean;
  translations: RouteTranslation[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class Route {
  constructor(
    public readonly id: string,
    public readonly pathname: string,
    public readonly displayName: string,
    public readonly description: string | undefined,
    public readonly icon: string | undefined,
    public readonly isPublic: boolean,
    public readonly requiresPermissions: string[],
    public readonly requiresAllPermissions: boolean,
    public readonly showInMenu: boolean,
    public readonly menuOrder: number,
    public readonly parentRouteId: string | undefined,
    public readonly isActive: boolean,
    public readonly translations: RouteTranslation[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | undefined
  ) {}

  /**
   * ✅ NUEVO: Obtener traducción para un idioma específico
   */
  getTranslation(languageCode: string): RouteTranslation | undefined {
    return this.translations.find(t => t.languageCode === languageCode);
  }

  /**
   * ✅ NUEVO: Obtener ruta traducida o pathname por defecto
   */
  getTranslatedPath(languageCode: string): string {
    const translation = this.getTranslation(languageCode);
    return translation?.translatedPath || this.pathname;
  }

  /**
   * ✅ NUEVO: Obtener nombre traducido o displayName por defecto
   */
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
      data.icon,
      data.is_public ?? false,
      data.requires_permissions ?? [],
      data.requires_all_permissions ?? true,
      data.show_in_menu ?? true,
      data.menu_order ?? 0,
      data.parent_route_id,
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
      icon: this.icon,
      is_public: this.isPublic,
      requires_permissions: this.requiresPermissions,
      requires_all_permissions: this.requiresAllPermissions,
      show_in_menu: this.showInMenu,
      menu_order: this.menuOrder,
      parent_route_id: this.parentRouteId,
      is_active: this.isActive,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      deleted_at: this.deletedAt?.toISOString(),
    };
  }
}