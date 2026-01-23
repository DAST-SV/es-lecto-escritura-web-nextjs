// ============================================
// src/core/domain/entities/RoutePermission.ts
// Domain Entity: RoutePermission
// ============================================

export class RoutePermission {
  constructor(
    public readonly id: string,
    public readonly roleName: string,
    public readonly routeId: string,
    public readonly languageCode: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string | null,
    // Relations
    public readonly roleDisplayName?: string,
    public readonly routePath?: string,
    public readonly routeName?: string
  ) {}

  static fromDatabase(data: any): RoutePermission {
    return new RoutePermission(
      data.id,
      data.role_name,
      data.route_id,
      data.language_code,
      data.is_active ?? true,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.created_by,
      data.roles?.display_name,
      data.routes?.path,
      data.routes?.name
    );
  }

  isPermissionActive(): boolean {
    return this.isActive;
  }

  appliesToAllLanguages(): boolean {
    return this.languageCode === null;
  }

  appliesToLanguage(lang: string): boolean {
    return this.appliesToAllLanguages() || this.languageCode === lang;
  }

  getDisplayName(): string {
    return `${this.roleDisplayName || this.roleName} → ${this.routeName || this.routePath || this.routeId}`;
  }

  toJSON() {
    return {
      id: this.id,
      roleName: this.roleName,
      routeId: this.routeId,
      languageCode: this.languageCode,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      createdBy: this.createdBy,
    };
  }
}
